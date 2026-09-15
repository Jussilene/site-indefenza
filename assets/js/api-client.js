// [IN]DEFENZA — cliente da API própria do painel admin (sem GitHub)
const ApiCliente = (() => {
  const CHAVE_TOKEN = 'indefenza_admin_token';

  function getToken() { return localStorage.getItem(CHAVE_TOKEN) || ''; }
  function setToken(t) { localStorage.setItem(CHAVE_TOKEN, t); }
  function limparToken() { localStorage.removeItem(CHAVE_TOKEN); }

  async function chamar(caminho, opcoes = {}) {
    const token = getToken();
    const headers = Object.assign({}, opcoes.headers || {});
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (opcoes.body && !(opcoes.body instanceof FormData)) headers['Content-Type'] = 'application/json';

    const resposta = await fetch(caminho, Object.assign({}, opcoes, { headers }));
    let dados = null;
    try { dados = await resposta.json(); } catch (e) { /* resposta sem corpo JSON */ }

    if (!resposta.ok) {
      const msg = (dados && dados.mensagem) || `Erro ${resposta.status} ao acessar o servidor`;
      const excecao = new Error(msg);
      excecao.status = resposta.status;
      throw excecao;
    }
    return dados;
  }

  async function login(email, senha) {
    const resultado = await chamar('/api/login', { method: 'POST', body: JSON.stringify({ email, senha }) });
    setToken(resultado.token);
    return resultado.usuario;
  }

  async function validarAcesso() {
    const resultado = await chamar('/api/eu');
    return resultado.usuario;
  }

  function nomeSecao(caminhoRelativo) {
    return caminhoRelativo.replace(/^data\//, '').replace(/\.json$/, '');
  }

  async function lerJson(caminhoRelativo) {
    const conteudo = await chamar(`/api/dados/${nomeSecao(caminhoRelativo)}`);
    return { conteudo, sha: null };
  }

  async function salvarJson(caminhoRelativo, objeto) {
    await chamar(`/api/dados/${nomeSecao(caminhoRelativo)}`, { method: 'PUT', body: JSON.stringify(objeto) });
    return { content: { sha: null } };
  }

  async function enviarArquivo(caminhoCompleto, file) {
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('caminho', caminhoCompleto);
    const resultado = await chamar('/api/upload', { method: 'POST', body: formData });
    return resultado.url;
  }

  function nomeArquivoSeguro(nomeOriginal) {
    const carimbo = Date.now();
    const limpo = nomeOriginal.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9.\-]/g, '-').toLowerCase();
    return `${carimbo}-${limpo}`;
  }

  return {
    getToken, setToken, limparToken,
    login, validarAcesso,
    lerJson, salvarJson,
    enviarArquivo, nomeArquivoSeguro
  };
})();
