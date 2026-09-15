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

A forma recomendada é usar o **Painel Admin** (veja abaixo) — daí não precisa editar HTML na mão.
Se preferir editar direto no código:

- **Fotos**: crie as pastas `assets/img/banda-foto.jpg`, `assets/img/integrantes/`, `assets/img/galeria/` e troque os ícones `<i class="fa-solid ...">` pelas tags `<img src="..." alt="...">` correspondentes (os comentários no HTML indicam onde).
- **Integrantes** (`sobre.html`): edite nome, função (vocal/guitarra/baixo/bateria) e bio de cada um.
- **Shows** (`shows.html`): duplique um bloco `.show-item`, ajuste data, local e `data-status="proximo"` ou `"realizado"`.
- **Vídeos** (`videos.html`): troque `VIDEO_ID` pelo código do vídeo no YouTube (o que vem depois de `watch?v=`).
- **Notícias** (`noticias.html`): duplique um `<article class="noticia-card">` para cada novidade.
- **Redes sociais**: os links de Instagram já apontam para `@indefenza.hc`; complete YouTube, Spotify e as demais plataformas nos `href="#"` do cabeçalho, rodapé e seção "Ouça Agora" (index.html).
- **E-mail de contato**: troque `contato@indefenza.com.br` pelo e-mail real da banda.

## Painel Admin (editar o site sem mexer no código)

O site tem um painel em `/admin` que permite editar textos, integrantes, shows, galeria, vídeos, notícias e loja
direto pelo navegador — inclusive enviar fotos, vídeos e áudios. Como o site é 100% estático (sem servidor próprio),
o painel salva tudo direto no repositório do GitHub, que é quem hospeda o site; por isso o admin precisa de um
**token de acesso do GitHub** para poder gravar as alterações.

### Como acessar
1. Publique o site (GitHub Pages, Netlify, etc.) ou rode localmente.
2. Acesse `seusite.com/admin/` (ou `admin/index.html` localmente).
3. Na primeira vez, clique em **"Não tenho um token — como eu crio um?"** e siga o passo a passo (gera um token
   em `github.com/settings/personal-access-tokens/new`, com acesso **só** ao repositório `site-indefenza` e
   permissão **Contents: Read and write**).
4. Cole o token no campo e clique em **Entrar**.

O token fica salvo apenas no navegador de quem faz login (em `localStorage`) — nunca é enviado para nenhum
lugar além da API oficial do GitHub. Trate esse token como uma senha: não envie print dele nem compartilhe o link
do admin junto com o token na mesma mensagem. Ele expira sozinho na data escolhida na hora de criar.

### O que dá pra editar
- **Textos do Site**: frase do topo, selos da home, os 3 parágrafos de "Sobre a banda", e-mail, WhatsApp e redes sociais.
- **Integrantes, Shows, Galeria, Vídeos, Notícias e Loja**: adicionar, editar, reordenar (setas ▲▼) e excluir itens,
  com upload direto de fotos e, nos vídeos, upload de vídeo/áudio ou link do YouTube.

Cada alteração salva vira um commit automático no repositório (em `data/*.json` e `assets/uploads/`), e a página
pública já reflete a mudança na próxima visita (pode levar 1-2 minutos para o GitHub Pages atualizar o cache).

### Arquivos por trás do painel
```
data/*.json              → conteúdo editável (um arquivo por seção)
assets/js/conteudo.js    → lê os data/*.json e preenche as páginas públicas (sem alterar o visual)
assets/js/github-cms.js  → fala com a API do GitHub (ler/gravar arquivos, enviar imagens/vídeos)
admin/                   → o painel em si (login + telas de edição)
```

## Publicar o site
Qualquer serviço de hospedagem estática funciona sem alterações: GitHub Pages, Netlify, Vercel ou Cloudflare Pages — basta enviar a pasta inteira (incluindo `data/` e `admin/`).
