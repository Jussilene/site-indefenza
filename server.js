// [IN]DEFENZA — servidor do site + API do painel admin
// Serve os arquivos estáticos do site e expõe uma API própria (sem depender do GitHub)
// para login (e-mail/senha), leitura/gravação de data/*.json e upload de imagens/vídeos/áudios.
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const RAIZ = __dirname;
const PASTA_DADOS = path.join(RAIZ, 'data');
const PASTA_SERVIDOR = path.join(RAIZ, 'server');
const ARQ_USUARIOS = path.join(PASTA_SERVIDOR, 'usuarios.json');
const PORTA = process.env.PORTA || 5500;

const SECOES_VALIDAS = ['site', 'integrantes', 'shows', 'galeria', 'videos', 'noticias', 'produtos'];

/* ---------- Senhas (hash local, sem dependências externas) ---------- */
function gerarHashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verificarSenha(senha, armazenado) {
  const [salt, hash] = String(armazenado || '').split(':');
  if (!salt || !hash) return false;
  const tentativa = crypto.scryptSync(senha, salt, 64).toString('hex');
  const bufA = Buffer.from(hash, 'hex');
  const bufB = Buffer.from(tentativa, 'hex');
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

/* ---------- Usuário admin de teste (criado automaticamente na 1ª execução) ---------- */
function carregarUsuarios() {
  if (!fs.existsSync(ARQ_USUARIOS)) {
    fs.mkdirSync(PASTA_SERVIDOR, { recursive: true });
    const usuarios = [{
      email: 'adm@adm.com',
      senha: gerarHashSenha('123456'),
      nome: 'Administrador (teste)'
    }];
    fs.writeFileSync(ARQ_USUARIOS, JSON.stringify(usuarios, null, 2));
    console.log('Usuário admin de teste criado: adm@adm.com / 123456 (troque isso antes de ir pra produção!)');
    return usuarios;
  }
  return JSON.parse(fs.readFileSync(ARQ_USUARIOS, 'utf-8'));
}

/* ---------- Sessões em memória ---------- */
const sessoes = new Map(); // token -> { email, expira }
const DURACAO_SESSAO_MS = 1000 * 60 * 60 * 24 * 7; // 7 dias

function exigirLogin(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : '';
  const sessao = sessoes.get(token);
  if (!sessao || sessao.expira < Date.now()) {
    return res.status(401).json({ mensagem: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
  req.usuarioEmail = sessao.email;
  next();
}

/* ---------- App ---------- */
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(RAIZ));

app.post('/api/login', (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ mensagem: 'Informe e-mail e senha.' });

  const usuarios = carregarUsuarios();
  const usuario = usuarios.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!usuario || !verificarSenha(senha, usuario.senha)) {
    return res.status(401).json({ mensagem: 'E-mail ou senha inválidos.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  sessoes.set(token, { email: usuario.email, expira: Date.now() + DURACAO_SESSAO_MS });
  res.json({ token, usuario: { email: usuario.email, nome: usuario.nome } });
});

app.post('/api/logout', exigirLogin, (req, res) => {
  const cabecalho = req.headers.authorization || '';
  const token = cabecalho.startsWith('Bearer ') ? cabecalho.slice(7) : '';
  sessoes.delete(token);
  res.json({ ok: true });
});

app.get('/api/eu', exigirLogin, (req, res) => {
  res.json({ usuario: { email: req.usuarioEmail } });
});

app.get('/api/dados/:secao', exigirLogin, (req, res) => {
  if (!SECOES_VALIDAS.includes(req.params.secao)) return res.status(404).json({ mensagem: 'Seção desconhecida.' });
  const arquivo = path.join(PASTA_DADOS, `${req.params.secao}.json`);
  if (!fs.existsSync(arquivo)) return res.json(null);
  res.json(JSON.parse(fs.readFileSync(arquivo, 'utf-8')));
});

app.put('/api/dados/:secao', exigirLogin, (req, res) => {
  if (!SECOES_VALIDAS.includes(req.params.secao)) return res.status(404).json({ mensagem: 'Seção desconhecida.' });
  const arquivo = path.join(PASTA_DADOS, `${req.params.secao}.json`);
  fs.mkdirSync(path.dirname(arquivo), { recursive: true });
  fs.writeFileSync(arquivo, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 80 * 1024 * 1024 } });

app.post('/api/upload', exigirLogin, upload.single('arquivo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ mensagem: 'Nenhum arquivo enviado.' });
    let caminho = String(req.body.caminho || '').replace(/\\/g, '/').replace(/\.\.+/g, '');
    if (!caminho.startsWith('assets/uploads/')) {
      return res.status(400).json({ mensagem: 'Caminho de upload inválido.' });
    }
    const destino = path.join(RAIZ, caminho);
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, req.file.buffer);
    res.json({ url: caminho });
  } catch (erro) {
    res.status(500).json({ mensagem: 'Erro ao salvar arquivo: ' + erro.message });
  }
});

app.listen(PORTA, () => {
  carregarUsuarios();
  console.log(`[IN]DEFENZA rodando em http://localhost:${PORTA}`);
  console.log(`Painel admin em http://localhost:${PORTA}/admin/`);
});
