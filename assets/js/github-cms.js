// [IN]DEFENZA — camada de acesso ao GitHub (usada só pelo painel /admin)
// Lê e grava os arquivos de dados do site diretamente no repositório via API do GitHub.
const GitHubCMS = (() => {
  const REPO = 'Jussilene/site-indefenza';
  const BRANCH = 'main';
  const API = 'https://api.github.com';
  const CHAVE_TOKEN = 'indefenza_gh_token';

  function getToken() { return localStorage.getItem(CHAVE_TOKEN) || ''; }
  function setToken(t) { localStorage.setItem(CHAVE_TOKEN, t); }
  function limparToken() { localStorage.removeItem(CHAVE_TOKEN); }

  function paraBase64Unicode(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  function deBase64Unicode(b64) {
    return decodeURIComponent(escape(atob(b64)));
  }

  async function chamar(caminho, opcoes = {}) {
    const token = getToken();
    const headers = Object.assign(
      {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      opcoes.body ? { 'Content-Type': 'application/json' } : {},
      opcoes.headers || {}
    );
    const resposta = await fetch(`${API}${caminho}`, Object.assign({}, opcoes, { headers }));
    if (!resposta.ok) {
      let msg = `Erro ${resposta.status} ao acessar o GitHub`;
      try {
        const erro = await resposta.json();
        if (erro && erro.message) msg = erro.message;
      } catch (e) { /* ignora corpo não-JSON */ }
      const excecao = new Error(msg);
      excecao.status = resposta.status;
      throw excecao;
    }
    return resposta.status === 204 ? null : resposta.json();
  }

  async function validarAcesso() {
    const usuario = await chamar('/user');
    await chamar(`/repos/${REPO}`);
    return usuario;
  }

  async function lerJson(caminho) {
    try {
      const dados = await chamar(`/repos/${REPO}/contents/${caminho}?ref=${BRANCH}`);
      const texto = deBase64Unicode(dados.content.replace(/\n/g, ''));
      return { conteudo: JSON.parse(texto), sha: dados.sha };
    } catch (e) {
      if (e.status === 404) return { conteudo: null, sha: null };
      throw e;
    }
  }

  async function salvarJson(caminho, objeto, shaAtual, mensagem) {
    const body = {
      message: mensagem || `Atualiza ${caminho} via painel admin`,
      content: paraBase64Unicode(JSON.stringify(objeto, null, 2)),
      branch: BRANCH
    };
    if (shaAtual) body.sha = shaAtual;
    return chamar(`/repos/${REPO}/contents/${caminho}`, { method: 'PUT', body: JSON.stringify(body) });
  }

  function lerArquivoComoBase64(file) {
    return new Promise((resolve, reject) => {
      const leitor = new FileReader();
      leitor.onload = () => resolve(leitor.result.split(',')[1]);
      leitor.onerror = reject;
      leitor.readAsDataURL(file);
    });
  }

  async function enviarArquivo(caminho, file, mensagem) {
    const base64 = await lerArquivoComoBase64(file);
    let shaExistente = null;
    try {
      const info = await chamar(`/repos/${REPO}/contents/${caminho}?ref=${BRANCH}`);
      shaExistente = info.sha;
    } catch (e) { /* arquivo novo, sem sha ainda */ }

    const body = {
      message: mensagem || `Envia ${caminho} via painel admin`,
      content: base64,
      branch: BRANCH
    };
    if (shaExistente) body.sha = shaExistente;
    const resposta = await chamar(`/repos/${REPO}/contents/${caminho}`, { method: 'PUT', body: JSON.stringify(body) });
    return resposta.content.download_url;
  }

  function nomeArquivoSeguro(nomeOriginal) {
    const carimbo = Date.now();
    const limpo = nomeOriginal.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9.\-]/g, '-').toLowerCase();
    return `${carimbo}-${limpo}`;
  }

  return {
    REPO, BRANCH,
    getToken, setToken, limparToken,
    validarAcesso, lerJson, salvarJson,
    enviarArquivo, nomeArquivoSeguro
  };
})();
