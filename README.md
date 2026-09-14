# Site [IN]DEFENZA

Site estático (HTML/CSS/JS puro) no estilo hub do Iron Maiden Network, nas cores da banda (verde, rosa e preto).

## Como abrir
Dê duplo clique em `index.html` para abrir no navegador. Não precisa de servidor nem instalação.

## Estrutura
```
index.html      → Página inicial (hub com os links para as demais seções)
sobre.html      → História da banda + cards dos integrantes
shows.html      → Agenda de shows (com filtro Próximos/Realizados)
galeria.html    → Galeria de fotos com lightbox (clique para ampliar)
videos.html     → Clipes e vídeos de shows (embed do YouTube)
noticias.html   → Notícias/atualizações da banda
assets/css/style.css → Todo o visual do site
assets/js/main.js    → Menu mobile, filtros, lightbox, animações
assets/img/logo-icone.svg → Selo/logo (usado no cabeçalho, rodapé e favicon)
assets/img/favicon.svg    → Ícone da aba do navegador
```

## O que trocar pelo conteúdo real da banda

- **Fotos**: crie as pastas `assets/img/banda-foto.jpg`, `assets/img/integrantes/`, `assets/img/galeria/` e troque os ícones `<i class="fa-solid ...">` pelas tags `<img src="..." alt="...">` correspondentes (os comentários no HTML indicam onde).
- **Integrantes** (`sobre.html`): edite nome, função (vocal/guitarra/baixo/bateria) e bio de cada um.
- **Shows** (`shows.html`): duplique um bloco `.show-item`, ajuste data, local e `data-status="proximo"` ou `"realizado"`.
- **Vídeos** (`videos.html`): troque `VIDEO_ID` pelo código do vídeo no YouTube (o que vem depois de `watch?v=`).
- **Notícias** (`noticias.html`): duplique um `<article class="noticia-card">` para cada novidade.
- **Redes sociais**: os links de Instagram já apontam para `@indefenza.hc`; complete YouTube, Spotify e as demais plataformas nos `href="#"` do cabeçalho, rodapé e seção "Ouça Agora" (index.html).
- **E-mail de contato**: troque `contato@indefenza.com.br` pelo e-mail real da banda.

## Publicar o site
Qualquer serviço de hospedagem estática funciona sem alterações: GitHub Pages, Netlify, Vercel ou Cloudflare Pages — basta enviar a pasta inteira.
