// [IN]DEFENZA — Painel Admin (CRUD via API do GitHub, sem servidor próprio)
(() => {
  function esc(txt) {
    if (txt === undefined || txt === null) return '';
    const div = document.createElement('div');
    div.textContent = String(txt);
    return div.innerHTML;
  }
  function attr(txt) { return esc(txt).replace(/"/g, '&quot;'); }

  /* ---------- Definição de todas as seções editáveis ---------- */
  const SECOES = {
    textos: {
      tipo: 'unico', arquivo: 'data/site.json', titulo: 'Textos do Site', icone: 'fa-font',
      descricao: 'Frases do topo, biografia resumida, e-mail, WhatsApp e redes sociais usadas em várias páginas.',
      campos: [
        { chave: 'heroTagline', label: 'Frase abaixo do logo (pode usar <b>negrito</b>)', tipo: 'texto' },
        { chave: 'heroBadge1', label: 'Selo 1 da página inicial (ex: novo clipe)', tipo: 'texto' },
        { chave: 'heroBadge2', label: 'Selo 2 da página inicial (ex: álbum novo)', tipo: 'texto' },
        { chave: 'sobreParagrafo1', label: 'Sobre a banda — parágrafo 1', tipo: 'textarea' },
        { chave: 'sobreParagrafo2', label: 'Sobre a banda — parágrafo 2', tipo: 'textarea' },
        { chave: 'sobreParagrafo3', label: 'Sobre a banda — parágrafo 3', tipo: 'textarea' },
        { chave: 'contatoEmail', label: 'E-mail de contato', tipo: 'texto' },
        { chave: 'contatoWhatsapp', label: 'WhatsApp (só números, com DDI e DDD — ex: 5541999999999)', tipo: 'texto' },
        { chave: 'instagram', label: 'Link do Instagram', tipo: 'texto' },
        { chave: 'youtube', label: 'Link do YouTube', tipo: 'texto' },
        { chave: 'spotify', label: 'Link do Spotify', tipo: 'texto' },
        { chave: 'threads', label: 'Link do Threads', tipo: 'texto' }
      ]
    },
    integrantes: {
      tipo: 'lista', arquivo: 'data/integrantes.json', titulo: 'Integrantes', icone: 'fa-users',
      itemVazio: { nome: '', funcao: '', bio: '', foto: '', instagram: '#' },
      campos: [
        { chave: 'nome', label: 'Nome', tipo: 'texto', obrigatorio: true },
        { chave: 'funcao', label: 'Função (Vocal, Guitarra, Baixo, Bateria...)', tipo: 'texto' },
        { chave: 'bio', label: 'Bio curta', tipo: 'textarea' },
        { chave: 'instagram', label: 'Link do Instagram', tipo: 'texto' },
        { chave: 'foto', label: 'Foto', tipo: 'imagem' }
      ],
      tituloItem: i => i.nome || '(sem nome)', subtituloItem: i => i.funcao, imagemItem: i => i.foto, iconeItem: () => 'fa-user'
    },
    shows: {
      tipo: 'lista', arquivo: 'data/shows.json', titulo: 'Shows & Turnê', icone: 'fa-calendar-days',
      itemVazio: { titulo: '', local: '', dia: '', mes: '', status: 'proximo', tags: [], link: '#', textoBotao: 'Ver Mais' },
      campos: [
        { chave: 'titulo', label: 'Título do show', tipo: 'texto', obrigatorio: true },
        { chave: 'local', label: 'Local (casa de show, cidade/UF)', tipo: 'texto' },
        { chave: 'dia', label: 'Dia (ex: 05 ou --)', tipo: 'texto' },
        { chave: 'mes', label: 'Mês (ex: Junho ou "Em breve")', tipo: 'texto' },
        { chave: 'status', label: 'Situação', tipo: 'select', opcoes: [['proximo', 'Próximo'], ['realizado', 'Realizado']] },
        { chave: 'tags', label: 'Tags (separadas por vírgula)', tipo: 'lista-texto' },
        { chave: 'link', label: 'Link do botão (ingresso, fotos do show...)', tipo: 'texto' },
        { chave: 'textoBotao', label: 'Texto do botão', tipo: 'texto' }
      ],
      tituloItem: i => i.titulo || '(sem título)', subtituloItem: i => [i.dia, i.mes, i.local].filter(Boolean).join(' — '), iconeItem: () => 'fa-calendar-days'
    },
    galeria: {
      tipo: 'lista', arquivo: 'data/galeria.json', titulo: 'Galeria', icone: 'fa-camera-retro',
      itemVazio: { imagem: '', legenda: '' },
      campos: [
        { chave: 'legenda', label: 'Legenda da foto', tipo: 'texto' },
        { chave: 'imagem', label: 'Foto', tipo: 'imagem' }
      ],
      tituloItem: i => i.legenda || '(sem legenda)', subtituloItem: () => '', imagemItem: i => i.imagem, iconeItem: () => 'fa-image'
    },
    videos: {
      tipo: 'lista', arquivo: 'data/videos.json', titulo: 'Vídeos', icone: 'fa-clapperboard',
      itemVazio: { titulo: '', categoria: '', tipo: 'youtube', youtubeId: '', arquivoUrl: '', destaque: false },
      campos: [
        { chave: 'titulo', label: 'Título', tipo: 'texto', obrigatorio: true },
        { chave: 'categoria', label: 'Categoria (ex: Clipe Oficial, Ao Vivo...)', tipo: 'texto' },
        { chave: 'tipo', label: 'Tipo de mídia', tipo: 'select', opcoes: [['youtube', 'Vídeo do YouTube'], ['upload', 'Vídeo enviado (arquivo)'], ['audio', 'Áudio enviado (arquivo)']] },
        { chave: 'youtubeId', label: 'ID do vídeo no YouTube (o que vem depois de "watch?v=" no link)', tipo: 'texto' },
        { chave: 'arquivoUrl', label: 'Arquivo de vídeo ou áudio (se não for do YouTube)', tipo: 'arquivo-midia' },
        { chave: 'destaque', label: 'Mostrar em destaque no topo da página de Vídeos', tipo: 'checkbox' }
      ],
      tituloItem: i => i.titulo || '(sem título)', subtituloItem: i => i.categoria, iconeItem: () => 'fa-clapperboard'
    },
    noticias: {
      tipo: 'lista', arquivo: 'data/noticias.json', titulo: 'Notícias', icone: 'fa-bullhorn',
      itemVazio: { titulo: '', data: '', resumo: '', imagem: '', icone: 'fa-newspaper', link: '#', linkTexto: 'Leia mais' },
      campos: [
        { chave: 'titulo', label: 'Título', tipo: 'texto', obrigatorio: true },
        { chave: 'data', label: 'Data (texto livre, ex: Junho de 2026)', tipo: 'texto' },
        { chave: 'resumo', label: 'Resumo', tipo: 'textarea' },
        { chave: 'link', label: 'Link do "leia mais"', tipo: 'texto' },
        { chave: 'linkTexto', label: 'Texto do link', tipo: 'texto' },
        { chave: 'imagem', label: 'Imagem', tipo: 'imagem' }
      ],
      tituloItem: i => i.titulo || '(sem título)', subtituloItem: i => i.data, imagemItem: i => i.imagem, iconeItem: i => i.icone || 'fa-newspaper'
    },
    produtos: {
      tipo: 'lista', arquivo: 'data/produtos.json', titulo: 'Loja', icone: 'fa-shirt',
      itemVazio: { nome: '', descricao: '', preco: '', detalhePreco: '', categoria: 'camisetas', tag: '', icone: 'fa-tag', imagem: '', whatsappTexto: '' },
      campos: [
        { chave: 'nome', label: 'Nome do produto', tipo: 'texto', obrigatorio: true },
        { chave: 'descricao', label: 'Descrição', tipo: 'textarea' },
        { chave: 'preco', label: 'Preço (ex: 89,90)', tipo: 'texto' },
        { chave: 'detalhePreco', label: 'Detalhe do preço (ex: P ao GG) — opcional', tipo: 'texto' },
        { chave: 'categoria', label: 'Categoria', tipo: 'select', opcoes: [['camisetas', 'Camisetas'], ['musica', 'CDs & Vinil'], ['acessorios', 'Acessórios']] },
        { chave: 'tag', label: 'Selo (ex: Novidade) — deixe vazio se não quiser', tipo: 'texto' },
        { chave: 'whatsappTexto', label: 'Mensagem enviada ao clicar em "Comprar"', tipo: 'texto' },
        { chave: 'imagem', label: 'Foto do produto', tipo: 'imagem' }
      ],
      tituloItem: i => i.nome || '(sem nome)', subtituloItem: i => `R$ ${i.preco || '0,00'}`, imagemItem: i => i.imagem, iconeItem: i => i.icone || 'fa-tag'
    }
  };

  const estadoSecoes = {};
  let secaoAtual = null;

  /* ---------- Elementos ---------- */
  const telaLogin = document.getElementById('tela-login');
  const app = document.getElementById('app');
  const formLogin = document.getElementById('form-login');
  const campoToken = document.getElementById('campo-token');
  const areaAlertaLogin = document.getElementById('area-alerta-login');
  const btnEntrar = document.getElementById('btn-entrar');
  const menuAdmin = document.getElementById('menu-admin');
  const conteudoPrincipal = document.getElementById('conteudo-principal');
  const usuarioLogado = document.getElementById('usuario-logado');
  const btnSair = document.getElementById('btn-sair');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalConteudo = document.getElementById('modal-conteudo');
  const modalFechar = document.getElementById('modal-fechar');

  /* ---------- Utilidades de UI ---------- */
  function mostrarToast(msg, erro) {
    const t = document.createElement('div');
    t.className = 'toast' + (erro ? ' erro' : '');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }
  function abrirModal(html) {
    modalConteudo.innerHTML = html;
    modalOverlay.hidden = false;
  }
  function fecharModal() {
    modalOverlay.hidden = true;
    modalConteudo.innerHTML = '';
  }
  modalFechar.addEventListener('click', fecharModal);
  modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) fecharModal(); });

  /* ---------- Login ---------- */
  async function tentarEntrarComToken(token, silencioso) {
    GitHubCMS.setToken(token);
    try {
      const usuario = await GitHubCMS.validarAcesso();
      usuarioLogado.textContent = `@${usuario.login}`;
      telaLogin.hidden = true;
      app.hidden = false;
      montarMenu();
      abrirSecao('textos');
      return true;
    } catch (e) {
      GitHubCMS.limparToken();
      if (!silencioso) {
        areaAlertaLogin.innerHTML = `<div class="alerta-erro">Não foi possível entrar: ${esc(e.message)}. Confira se o token é válido e se tem acesso de "Contents: Read and write" ao repositório <code>${esc(GitHubCMS.REPO)}</code>.</div>`;
      }
      return false;
    }
  }

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    areaAlertaLogin.innerHTML = '';
    btnEntrar.disabled = true;
    btnEntrar.textContent = 'Entrando...';
    const ok = await tentarEntrarComToken(campoToken.value.trim(), false);
    btnEntrar.disabled = false;
    btnEntrar.textContent = 'Entrar';
    if (ok) campoToken.value = '';
  });

  btnSair.addEventListener('click', () => {
    GitHubCMS.limparToken();
    app.hidden = true;
    telaLogin.hidden = false;
  });

  (async function iniciar() {
    const tokenSalvo = GitHubCMS.getToken();
    if (tokenSalvo) {
      telaLogin.querySelector('.login-card').style.opacity = '.5';
      const ok = await tentarEntrarComToken(tokenSalvo, true);
      if (!ok) telaLogin.querySelector('.login-card').style.opacity = '1';
    }
  })();

  /* ---------- Menu lateral ---------- */
  function montarMenu() {
    menuAdmin.innerHTML = Object.keys(SECOES).map(chave => {
      const s = SECOES[chave];
      return `<li><button data-secao="${chave}"><i class="fa-solid ${s.icone}" style="width:18px"></i>&nbsp; ${esc(s.titulo)}</button></li>`;
    }).join('');
    menuAdmin.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => abrirSecao(btn.dataset.secao));
    });
  }
  function destacarMenu(chave) {
    menuAdmin.querySelectorAll('button').forEach(b => b.classList.toggle('ativo', b.dataset.secao === chave));
  }

  /* ---------- Carregar/abrir seção ---------- */
  async function abrirSecao(chave) {
    secaoAtual = chave;
    destacarMenu(chave);
    const secao = SECOES[chave];
    conteudoPrincipal.innerHTML = `<p class="carregando"><i class="fa-solid fa-spinner fa-spin"></i> Carregando ${esc(secao.titulo)}...</p>`;
    try {
      const { conteudo, sha } = await GitHubCMS.lerJson(secao.arquivo);
      estadoSecoes[chave] = { dados: conteudo || (secao.tipo === 'unico' ? {} : []), sha };
      if (secao.tipo === 'unico') renderizarSecaoUnica(chave);
      else renderizarSecaoLista(chave);
    } catch (e) {
      conteudoPrincipal.innerHTML = `<div class="alerta-erro">Erro ao carregar ${esc(secao.titulo)}: ${esc(e.message)}</div>`;
    }
  }

  /* ---------- Construção de campos de formulário ---------- */
  function campoHtml(campo, valorAtual) {
    const valor = valorAtual === undefined || valorAtual === null ? '' : valorAtual;
    if (campo.tipo === 'textarea') {
      return `<div class="campo"><label>${esc(campo.label)}</label><textarea name="${attr(campo.chave)}">${esc(valor)}</textarea></div>`;
    }
    if (campo.tipo === 'select') {
      const opcoes = campo.opcoes.map(([v, l]) => `<option value="${attr(v)}" ${v === valor ? 'selected' : ''}>${esc(l)}</option>`).join('');
      return `<div class="campo"><label>${esc(campo.label)}</label><select name="${attr(campo.chave)}">${opcoes}</select></div>`;
    }
    if (campo.tipo === 'checkbox') {
      return `<div class="campo checkbox"><input type="checkbox" name="${attr(campo.chave)}" id="campo-${attr(campo.chave)}" ${valor ? 'checked' : ''}><label for="campo-${attr(campo.chave)}">${esc(campo.label)}</label></div>`;
    }
    if (campo.tipo === 'lista-texto') {
      const texto = Array.isArray(valor) ? valor.join(', ') : valor;
      return `<div class="campo"><label>${esc(campo.label)}</label><input type="text" name="${attr(campo.chave)}" value="${attr(texto)}"></div>`;
    }
    if (campo.tipo === 'imagem' || campo.tipo === 'arquivo-midia') {
      const accept = campo.tipo === 'imagem' ? 'image/*' : 'video/*,audio/*';
      const preview = campo.tipo === 'imagem' && valor ? `<img src="${attr(valor)}" class="preview-imagem">` : '';
      return `<div class="campo">
        <label>${esc(campo.label)}</label>
        <div class="linha-upload">
          ${preview}
          <input type="text" name="${attr(campo.chave)}" value="${attr(valor)}" placeholder="Cole aqui um link, ou envie um arquivo abaixo">
          <input type="file" accept="${accept}" data-upload="${attr(campo.chave)}">
        </div>
        <small>Você pode colar o link de uma imagem/vídeo já hospedado, ou escolher um arquivo do seu computador para enviar ao site.</small>
      </div>`;
    }
    return `<div class="campo"><label>${esc(campo.label)}</label><input type="text" name="${attr(campo.chave)}" value="${attr(valor)}" ${campo.obrigatorio ? 'required' : ''}></div>`;
  }

  /* ---------- Seção "único" (Textos do Site) ---------- */
  function renderizarSecaoUnica(chave) {
    const secao = SECOES[chave];
    const dados = estadoSecoes[chave].dados || {};
    conteudoPrincipal.innerHTML = `
      <div class="cabecalho-secao">
        <div><h2>${esc(secao.titulo)}</h2><p>${esc(secao.descricao || '')}</p></div>
      </div>
      <div id="area-alerta-secao"></div>
      <form id="form-secao-unica">
        ${secao.campos.map(c => campoHtml(c, dados[c.chave])).join('')}
        <div class="form-acoes">
          <button type="submit" class="btn-primario">Salvar Alterações</button>
        </div>
      </form>
    `;
    document.getElementById('form-secao-unica').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const novosDados = {};
      secao.campos.forEach(c => { novosDados[c.chave] = form.elements[c.chave].value; });
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Salvando...';
      try {
        const resultado = await GitHubCMS.salvarJson(secao.arquivo, novosDados, estadoSecoes[chave].sha, `Atualiza textos do site via painel admin`);
        estadoSecoes[chave].dados = novosDados;
        estadoSecoes[chave].sha = resultado.content.sha;
        mostrarToast('Textos salvos com sucesso!');
      } catch (err) {
        document.getElementById('area-alerta-secao').innerHTML = `<div class="alerta-erro">Erro ao salvar: ${esc(err.message)}</div>`;
      }
      btn.disabled = false; btn.textContent = 'Salvar Alterações';
    });
  }

  /* ---------- Seção "lista" (Integrantes, Shows, Galeria, Vídeos, Notícias, Loja) ---------- */
  function renderizarSecaoLista(chave) {
    const secao = SECOES[chave];
    const lista = estadoSecoes[chave].dados || [];
    conteudoPrincipal.innerHTML = `
      <div class="cabecalho-secao">
        <div><h2>${esc(secao.titulo)}</h2><p>${lista.length} ${lista.length === 1 ? 'item' : 'itens'}</p></div>
        <button class="btn-primario" id="btn-add-item"><i class="fa-solid fa-plus"></i> Adicionar</button>
      </div>
      <div class="lista-itens" id="lista-itens">
        ${lista.length ? lista.map((item, i) => itemCardHtml(secao, item, i)).join('') : '<div class="vazio-lista">Nada por aqui ainda. Clique em "Adicionar" para criar o primeiro item.</div>'}
      </div>
    `;
    document.getElementById('btn-add-item').addEventListener('click', () => abrirFormItem(chave, null));
    document.querySelectorAll('[data-editar]').forEach(b => b.addEventListener('click', () => abrirFormItem(chave, Number(b.dataset.editar))));
    document.querySelectorAll('[data-excluir]').forEach(b => b.addEventListener('click', () => excluirItem(chave, Number(b.dataset.excluir))));
    document.querySelectorAll('[data-subir]').forEach(b => b.addEventListener('click', () => moverItem(chave, Number(b.dataset.subir), -1)));
    document.querySelectorAll('[data-descer]').forEach(b => b.addEventListener('click', () => moverItem(chave, Number(b.dataset.descer), 1)));
  }

  function itemCardHtml(secao, item, indice) {
    const imagem = secao.imagemItem ? secao.imagemItem(item) : '';
    const icone = secao.iconeItem ? secao.iconeItem(item) : 'fa-circle';
    return `
      <div class="item-card">
        <div class="miniatura">${imagem ? `<img src="${attr(imagem)}">` : `<i class="fa-solid ${esc(icone)}"></i>`}</div>
        <div class="info-item">
          <h4>${esc(secao.tituloItem(item))}</h4>
          <span>${esc(secao.subtituloItem ? secao.subtituloItem(item) : '')}</span>
        </div>
        <div class="acoes-item">
          <button data-subir="${indice}" title="Mover para cima"><i class="fa-solid fa-arrow-up"></i></button>
          <button data-descer="${indice}" title="Mover para baixo"><i class="fa-solid fa-arrow-down"></i></button>
          <button class="editar" data-editar="${indice}" title="Editar"><i class="fa-solid fa-pen"></i></button>
          <button class="excluir" data-excluir="${indice}" title="Excluir"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>`;
  }

  function abrirFormItem(chave, indice) {
    const secao = SECOES[chave];
    const item = indice === null ? Object.assign({}, secao.itemVazio) : estadoSecoes[chave].dados[indice];
    abrirModal(`
      <h3>${indice === null ? 'Adicionar' : 'Editar'} — ${esc(secao.titulo)}</h3>
      <div id="area-alerta-modal"></div>
      <form id="form-item">
        ${secao.campos.map(c => campoHtml(c, item[c.chave])).join('')}
        <div class="form-acoes">
          <button type="button" class="btn-secundario" id="btn-cancelar-item">Cancelar</button>
          <button type="submit" class="btn-primario">${indice === null ? 'Adicionar' : 'Salvar'}</button>
        </div>
      </form>
    `);
    document.getElementById('btn-cancelar-item').addEventListener('click', fecharModal);
    document.getElementById('form-item').addEventListener('submit', (e) => { e.preventDefault(); salvarItem(chave, indice, e.target); });
  }

  async function salvarItem(chave, indice, form) {
    const secao = SECOES[chave];
    const dados = {};
    for (const campo of secao.campos) {
      const el = form.elements[campo.chave];
      if (campo.tipo === 'checkbox') dados[campo.chave] = el.checked;
      else if (campo.tipo === 'lista-texto') dados[campo.chave] = el.value.split(',').map(s => s.trim()).filter(Boolean);
      else dados[campo.chave] = el.value.trim();
    }

    const btnSalvar = form.querySelector('button[type="submit"]');
    btnSalvar.disabled = true;
    const textoOriginal = btnSalvar.textContent;

    try {
      for (const campo of secao.campos) {
        if (campo.tipo === 'imagem' || campo.tipo === 'arquivo-midia') {
          const inputArquivo = form.querySelector(`[data-upload="${CSS.escape(campo.chave)}"]`);
          if (inputArquivo && inputArquivo.files && inputArquivo.files[0]) {
            btnSalvar.textContent = 'Enviando arquivo...';
            const file = inputArquivo.files[0];
            const pasta = campo.tipo === 'imagem' ? 'assets/uploads/imagens' : 'assets/uploads/midia';
            const caminho = `${pasta}/${GitHubCMS.nomeArquivoSeguro(file.name)}`;
            const url = await GitHubCMS.enviarArquivo(caminho, file, `Envia arquivo (${file.name}) via painel admin`);
            dados[campo.chave] = url;
          }
        }
      }

      btnSalvar.textContent = 'Salvando...';
      const lista = estadoSecoes[chave].dados.slice();
      if (indice === null) lista.push(dados);
      else lista[indice] = dados;

      const resultado = await GitHubCMS.salvarJson(secao.arquivo, lista, estadoSecoes[chave].sha, `Atualiza ${secao.titulo} via painel admin`);
      estadoSecoes[chave].dados = lista;
      estadoSecoes[chave].sha = resultado.content.sha;
      fecharModal();
      renderizarSecaoLista(chave);
      mostrarToast(indice === null ? 'Item adicionado!' : 'Item salvo!');
    } catch (err) {
      const alerta = document.getElementById('area-alerta-modal');
      if (alerta) alerta.innerHTML = `<div class="alerta-erro">Erro ao salvar: ${esc(err.message)}</div>`;
      btnSalvar.disabled = false;
      btnSalvar.textContent = textoOriginal;
    }
  }

  async function excluirItem(chave, indice) {
    const secao = SECOES[chave];
    const item = estadoSecoes[chave].dados[indice];
    const nome = secao.tituloItem ? secao.tituloItem(item) : 'este item';
    if (!confirm(`Excluir "${nome}"? Essa ação não pode ser desfeita.`)) return;
    try {
      const lista = estadoSecoes[chave].dados.slice();
      lista.splice(indice, 1);
      const resultado = await GitHubCMS.salvarJson(secao.arquivo, lista, estadoSecoes[chave].sha, `Remove item de ${secao.titulo} via painel admin`);
      estadoSecoes[chave].dados = lista;
      estadoSecoes[chave].sha = resultado.content.sha;
      renderizarSecaoLista(chave);
      mostrarToast('Item excluído.');
    } catch (err) {
      mostrarToast(`Erro ao excluir: ${err.message}`, true);
    }
  }

  async function moverItem(chave, indice, direcao) {
    const secao = SECOES[chave];
    const lista = estadoSecoes[chave].dados.slice();
    const novoIndice = indice + direcao;
    if (novoIndice < 0 || novoIndice >= lista.length) return;
    [lista[indice], lista[novoIndice]] = [lista[novoIndice], lista[indice]];
    try {
      const resultado = await GitHubCMS.salvarJson(secao.arquivo, lista, estadoSecoes[chave].sha, `Reordena ${secao.titulo} via painel admin`);
      estadoSecoes[chave].dados = lista;
      estadoSecoes[chave].sha = resultado.content.sha;
      renderizarSecaoLista(chave);
    } catch (err) {
      mostrarToast(`Erro ao reordenar: ${err.message}`, true);
    }
  }
})();
