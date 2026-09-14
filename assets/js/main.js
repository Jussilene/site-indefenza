// [IN]DEFENZA — interações do site
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header: sombra ao rolar ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.background = window.scrollY > 40
        ? 'rgba(8,9,10,.96)'
        : 'linear-gradient(180deg,rgba(8,9,10,.96),rgba(8,9,10,.85) 70%,transparent)';
    });
  }

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const navPrincipal = document.querySelector('.nav-principal');
  if (toggle && navPrincipal) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('aberto');
      navPrincipal.classList.toggle('aberto');
    });
    navPrincipal.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('aberto');
        navPrincipal.classList.remove('aberto');
      });
    });
  }

  /* ---------- Reveal ao rolar ---------- */
  const revelaveis = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revelaveis.length) {
    const obs = new IntersectionObserver((entradas) => {
      entradas.forEach(ent => {
        if (ent.isIntersecting) {
          ent.target.classList.add('visivel');
          obs.unobserve(ent.target);
        }
      });
    }, { threshold: 0.15 });
    revelaveis.forEach(el => obs.observe(el));
  } else {
    revelaveis.forEach(el => el.classList.add('visivel'));
  }

  /* ---------- Filtro de shows (shows.html) ---------- */
  const filtros = document.querySelectorAll('.filtro-btn');
  const shows = document.querySelectorAll('.show-item');
  if (filtros.length) {
    filtros.forEach(btn => {
      btn.addEventListener('click', () => {
        filtros.forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        const alvo = btn.dataset.filtro;
        shows.forEach(item => {
          const mostrar = alvo === 'todos' || item.dataset.status === alvo;
          item.style.display = mostrar ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Lightbox da galeria (galeria.html) ---------- */
  const itensGaleria = Array.from(document.querySelectorAll('.galeria-item'));
  const lightbox = document.querySelector('.lightbox');
  if (itensGaleria.length && lightbox) {
    const imgLightbox = lightbox.querySelector('img');
    const btnFechar = lightbox.querySelector('.lightbox-fechar');
    const btnPrev = lightbox.querySelector('.lightbox-prev');
    const btnNext = lightbox.querySelector('.lightbox-next');
    let indiceAtual = 0;

    function abrirLightbox(i) {
      indiceAtual = i;
      const img = itensGaleria[i].querySelector('img');
      if (!img) return;
      imgLightbox.src = img.src;
      imgLightbox.alt = img.alt || '';
      lightbox.classList.add('aberto');
    }
    function fecharLightbox() { lightbox.classList.remove('aberto'); }
    function navegar(passo) {
      indiceAtual = (indiceAtual + passo + itensGaleria.length) % itensGaleria.length;
      abrirLightbox(indiceAtual);
    }

    itensGaleria.forEach((item, i) => {
      item.addEventListener('click', () => {
        if (item.querySelector('img')) abrirLightbox(i);
      });
    });
    btnFechar && btnFechar.addEventListener('click', fecharLightbox);
    btnPrev && btnPrev.addEventListener('click', () => navegar(-1));
    btnNext && btnNext.addEventListener('click', () => navegar(1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) fecharLightbox(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('aberto')) return;
      if (e.key === 'Escape') fecharLightbox();
      if (e.key === 'ArrowLeft') navegar(-1);
      if (e.key === 'ArrowRight') navegar(1);
    });
  }

  /* ---------- Filtro de categorias da loja (loja.html) ---------- */
  const categorias = document.querySelectorAll('.categoria-btn');
  const produtos = document.querySelectorAll('.produto-card');
  if (categorias.length) {
    categorias.forEach(btn => {
      btn.addEventListener('click', () => {
        categorias.forEach(b => b.classList.remove('ativo'));
        btn.classList.add('ativo');
        const alvo = btn.dataset.categoria;
        produtos.forEach(item => {
          const mostrar = alvo === 'todos' || item.dataset.categoria === alvo;
          item.style.display = mostrar ? '' : 'none';
        });
      });
    });
  }

  /* ---------- Ano automático no rodapé ---------- */
  const anoEl = document.querySelector('#ano-atual');
  if (anoEl) anoEl.textContent = new Date().getFullYear();
});
