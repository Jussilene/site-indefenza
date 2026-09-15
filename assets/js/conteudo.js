// [IN]DEFENZA — carrega conteúdo editável (data/*.json) e substitui os blocos estáticos.
// Se algum arquivo não existir ou o fetch falhar (ex.: aberto direto do disco), a página
// simplesmente mantém o conteúdo fixo que já está no HTML — nada quebra.
(() => {
  function esc(txt) {
    if (txt === undefined || txt === null) return '';
    const div = document.createElement('div');
    div.textContent = String(txt);
    return div.innerHTML;
  }

  async function buscarJson(caminho) {
    try {
      const resp = await fetch(caminho, { cache: 'no-store' });
      if (!resp.ok) return null;
      return await resp.json();
    } catch (e) {
      return null;
    }
  }

  /* ---------- Textos gerais do site (data/site.json) ---------- */
  async function aplicarTextosGerais() {
    const site = await buscarJson('data/site.json');
    if (!site) return;

    const tagline = document.querySelector('.hero-tagline');
    if (tagline && site.heroTagline) tagline.innerHTML = site.heroTagline;

    const badge1 = document.querySelector('[data-campo="heroBadge1"]');
    if (badge1 && site.heroBadge1) badge1.textContent = site.heroBadge1;
    const badge2 = document.querySelector('[data-campo="heroBadge2"]');
    if (badge2 && site.heroBadge2) badge2.textContent = site.heroBadge2;

    const p1 = document.querySelector('[data-campo="sobreParagrafo1"]');
    if (p1 && site.sobreParagrafo1) p1.innerHTML = site.sobreParagrafo1;
    const p2 = document.querySelector('[data-campo="sobreParagrafo2"]');
    if (p2 && site.sobreParagrafo2) p2.innerHTML = site.sobreParagrafo2;
    const p3 = document.querySelector('[data-campo="sobreParagrafo3"]');
    if (p3 && site.sobreParagrafo3) p3.innerHTML = site.sobreParagrafo3;

    document.querySelectorAll('[data-campo="contatoEmail"]').forEach(el => {
      if (!site.contatoEmail) return;
      el.textContent = site.contatoEmail;
      el.href = `mailto:${site.contatoEmail}`;
    });
    document.querySelectorAll('[data-campo="contatoEmailHref"]').forEach(el => {
      if (site.contatoEmail) el.href = `mailto:${site.contatoEmail}`;
    });
    document.querySelectorAll('[data-campo="whatsapp"]').forEach(el => {
      if (!site.contatoWhatsapp) return;
      const texto = el.dataset.whatsappTexto || '';
      el.href = `https://wa.me/${site.contatoWhatsapp}${texto ? '?text=' + encodeURIComponent(texto) : ''}`;
    });
    document.querySelectorAll('[data-campo="instagram"]').forEach(el => { if (site.instagram) el.href = site.instagram; });
    document.querySelectorAll('[data-campo="youtube"]').forEach(el => { if (site.youtube) el.href = site.youtube; });
    document.querySelectorAll('[data-campo="spotify"]').forEach(el => { if (site.spotify) el.href = site.spotify; });
    document.querySelectorAll('[data-campo="threads"]').forEach(el => { if (site.threads) el.href = site.threads; });
  }

  /* ---------- Integrantes (sobre.html) ---------- */
  async function aplicarIntegrantes() {
    const grid = document.querySelector('.integrantes-grid');
    if (!grid) return;
    const lista = await buscarJson('data/integrantes.json');
    if (!Array.isArray(lista) || !lista.length) return;

    grid.innerHTML = lista.map(pessoa => `
      <div class="integrante-card reveal visivel">
        <div class="integrante-foto">
          ${pessoa.foto
            ? `<img src="${esc(pessoa.foto)}" alt="${esc(pessoa.nome)}">`
            : `<i class="fa-solid fa-user placeholder-icone"></i>`}
        </div>
        <div class="integrante-info">
          <h4>${esc(pessoa.nome)}</h4>
          <span class="integrante-funcao">${esc(pessoa.funcao)}</span>
          <p>${esc(pessoa.bio)}</p>
          <div class="integrante-social">
            <a href="${esc(pessoa.instagram || '#')}" aria-label="Instagram" target="_blank" rel="noopener"><i class="fa-brands fa-instagram"></i></a>
          </div>
        </div>
      </div>
    `).join('');
  }

  /* ---------- Shows (shows.html + card de destaque na index) ---------- */
  async function aplicarShows() {
    const listaEl = document.querySelector('.lista-shows');
    const destaqueEl = document.querySelector('[data-campo="proximoShowIndex"]');
    if (!listaEl && !destaqueEl) return;
    const shows = await buscarJson('data/shows.json');
    if (!Array.isArray(shows) || !shows.length) return;

    function tags(item) {
      return (item.tags || []).map(t => `<span>${esc(t)}</span>`).join('');
    }
    function itemHtml(item) {
      const encerrado = item.status === 'realizado' ? ' encerrado' : '';
      const corBtn = item.status === 'realizado' ? 'btn rosa' : 'btn';
      return `
        <div class="show-item${encerrado}" data-status="${esc(item.status)}">
          <div class="show-data">
            <div class="dia">${esc(item.dia)}</div>
            <div class="mes">${esc(item.mes)}</div>
          </div>
          <div class="show-info">
            <h3>${esc(item.titulo)}</h3>
            <div class="show-local"><i class="fa-solid fa-location-dot"></i>${esc(item.local)}</div>
            <div class="show-tags">${tags(item)}</div>
          </div>
          <div class="show-acao"><a href="${esc(item.link || '#')}" class="${corBtn}">${esc(item.textoBotao || 'Ver Mais')}</a></div>
        </div>`;
    }

    if (listaEl) {
      listaEl.innerHTML = shows.map(itemHtml).join('');
      reativarFiltro('.filtro-btn', 'filtro', '.show-item', 'status');
    }
    if (destaqueEl) {
      const proximo = shows.find(s => s.status === 'proximo') || shows[0];
      destaqueEl.outerHTML = itemHtml(proximo).replace('class="show-item', 'data-campo="proximoShowIndex" class="show-item');
    }
  }

  /* Reata os botões de filtro (shows/loja) aos itens recém-renderizados,
     já que o main.js os associou aos itens estáticos que acabaram de ser trocados. */
  function reativarFiltro(seletorBotoes, atributoBotao, seletorItens, atributoItem) {
    const botoes = document.querySelectorAll(seletorBotoes);
    if (!botoes.length) return;
    botoes.forEach(btn => {
      btn.addEventListener('click', () => {
        botoes.forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        const alvo = btn.dataset[atributoBotao];
        document.querySelectorAll(seletorItens).forEach(item => {
          const mostrar = alvo === 'todos' || item.dataset[atributoItem] === alvo;
          item.style.display = mostrar ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Galeria (galeria.html) ---------- */
  async function aplicarGaleria() {
    const grid = document.querySelector('.galeria-grid');
    if (!grid) return;
    const fotos = await buscarJson('data/galeria.json');
    if (!Array.isArray(fotos) || !fotos.length) return;

    grid.innerHTML = fotos.map(foto => `
      <div class="galeria-item">
        ${foto.imagem
          ? `<img src="${esc(foto.imagem)}" alt="${esc(foto.legenda || '')}">`
          : `<i class="fa-solid fa-image placeholder-icone"></i>`}
        <div class="overlay"><span>${esc(foto.legenda || '')}</span></div>
      </div>
    `).join('');

    inicializarLightbox(grid);
  }

  function inicializarLightbox(grid) {
    const lightbox = document.querySelector('.lightbox');
    if (!lightbox) return;
    const imgLightbox = lightbox.querySelector('img');
    const btnFechar = lightbox.querySelector('.lightbox-fechar');
    const btnPrev = lightbox.querySelector('.lightbox-prev');
    const btnNext = lightbox.querySelector('.lightbox-next');
    let indiceAtual = 0;

    function itens() { return Array.from(grid.querySelectorAll('.galeria-item')); }
    function abrir(i) {
      const lista = itens();
      const img = lista[i] && lista[i].querySelector('img');
      if (!img) return;
      indiceAtual = i;
      imgLightbox.src = img.src;
      imgLightbox.alt = img.alt || '';
      lightbox.classList.add('aberto');
    }
    function fechar() { lightbox.classList.remove('aberto'); }
    function navegar(passo) {
      const total = itens().length;
      if (!total) return;
      indiceAtual = (indiceAtual + passo + total) % total;
      abrir(indiceAtual);
    }

    itens().forEach((item, i) => {
      item.addEventListener('click', () => { if (item.querySelector('img')) abrir(i); });
    });
    btnFechar && btnFechar.addEventListener('click', fechar);
    btnPrev && btnPrev.addEventListener('click', () => navegar(-1));
    btnNext && btnNext.addEventListener('click', () => navegar(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) fechar(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('aberto')) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'ArrowLeft') navegar(-1);
      if (e.key === 'ArrowRight') navegar(1);
    });
  }

  /* ---------- Vídeos (videos.html) ---------- */
  function embedVideo(item) {
    if (item.tipo === 'upload' && item.arquivoUrl) {
      return `<video controls playsinline style="width:100%;height:100%;background:#000" src="${esc(item.arquivoUrl)}"></video>`;
    }
    if (item.tipo === 'audio' && item.arquivoUrl) {
      return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,#182b0f,#0a0a0a);gap:16px;flex-direction:column;padding:20px;">
                <i class="fa-solid fa-music" style="font-size:40px;color:var(--verde-neon)"></i>
                <audio controls style="width:100%;max-width:420px" src="${esc(item.arquivoUrl)}"></audio>
              </div>`;
    }
    if (item.youtubeId) {
      return `<iframe src="https://www.youtube.com/embed/${esc(item.youtubeId)}" title="${esc(item.titulo)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
    }
    return `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:var(--cinza)"><i class="fa-solid fa-clapperboard" style="font-size:40px"></i></div>`;
  }

  async function aplicarVideos() {
    const destaqueBox = document.querySelector('.video-destaque');
    const grid = document.querySelector('.videos-grid');
    if (!destaqueBox && !grid) return;
    const videos = await buscarJson('data/videos.json');
    if (!Array.isArray(videos) || !videos.length) return;

    const destaque = videos.find(v => v.destaque) || videos[0];
    const resto = videos.filter(v => v !== destaque);

    if (destaqueBox && destaque) {
      const embedEl = destaqueBox.querySelector('.video-embed');
      const tituloEl = destaqueBox.querySelector('.titulo-secao');
      if (embedEl) embedEl.innerHTML = embedVideo(destaque);
      if (tituloEl) tituloEl.textContent = destaque.titulo;
    }
    if (grid) {
      grid.innerHTML = resto.map(v => `
        <div class="video-card">
          <div class="video-embed">${embedVideo(v)}</div>
          <div class="video-card-info">
            <h4>${esc(v.titulo)}</h4>
            <span>${esc(v.categoria)}</span>
          </div>
        </div>
      `).join('');
    }
  }

  /* ---------- Notícias (noticias.html) ---------- */
  async function aplicarNoticias() {
    const grid = document.querySelector('.noticias-grid');
    if (!grid) return;
    const noticias = await buscarJson('data/noticias.json');
    if (!Array.isArray(noticias) || !noticias.length) return;

    grid.innerHTML = noticias.map(n => `
      <article class="noticia-card">
        <div class="noticia-img">
          ${n.imagem ? `<img src="${esc(n.imagem)}" alt="${esc(n.titulo)}">` : `<i class="fa-solid ${esc(n.icone || 'fa-newspaper')} placeholder-icone"></i>`}
        </div>
        <div class="noticia-body">
          <span class="noticia-data"><i class="fa-regular fa-calendar"></i> ${esc(n.data)}</span>
          <h3>${esc(n.titulo)}</h3>
          <p>${esc(n.resumo)}</p>
          <a href="${esc(n.link || '#')}" class="link-leia">${esc(n.linkTexto || 'Leia mais')} <i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </article>
    `).join('');
  }

  /* ---------- Loja (loja.html) ---------- */
  async function aplicarLoja() {
    const grid = document.querySelector('.produto-grid');
    if (!grid) return;
    const produtos = await buscarJson('data/produtos.json');
    if (!Array.isArray(produtos) || !produtos.length) return;
    const site = await buscarJson('data/site.json');
    const whats = (site && site.contatoWhatsapp) || '5541900000000';

    grid.innerHTML = produtos.map(p => `
      <div class="produto-card" data-categoria="${esc(p.categoria)}">
        <div class="produto-img">
          ${p.tag ? `<span class="produto-tag">${esc(p.tag)}</span>` : ''}
          ${p.imagem ? `<img src="${esc(p.imagem)}" alt="${esc(p.nome)}">` : `<i class="fa-solid ${esc(p.icone || 'fa-tag')} placeholder-icone"></i>`}
        </div>
        <div class="produto-info">
          <h4>${esc(p.nome)}</h4>
          <p>${esc(p.descricao)}</p>
          <span class="produto-preco">R$ ${esc(p.preco)} ${p.detalhePreco ? `<small>${esc(p.detalhePreco)}</small>` : ''}</span>
          <a href="https://wa.me/${esc(whats)}?text=${encodeURIComponent(p.whatsappTexto || ('Quero comprar: ' + p.nome))}" class="produto-comprar" target="_blank" rel="noopener">Comprar</a>
        </div>
      </div>
    `).join('');
    reativarFiltro('.categoria-btn', 'categoria', '.produto-card', 'categoria');
  }

  document.addEventListener('DOMContentLoaded', () => {
    aplicarTextosGerais();
    aplicarIntegrantes();
    aplicarShows();
    aplicarGaleria();
    aplicarVideos();
    aplicarNoticias();
    aplicarLoja();
  });
})();
