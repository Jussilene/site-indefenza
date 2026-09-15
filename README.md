# Site [IN]DEFENZA

Site estático (HTML/CSS/JS puro) no estilo hub do Iron Maiden Network, nas cores da banda (verde, rosa e preto).

## Como abrir

- **Só para ver o site**: dê duplo clique em `index.html`. Não precisa de nada instalado.
- **Para usar o Painel Admin**: o admin precisa do servidor rodando (veja [Painel Admin](#painel-admin-editar-o-site-sem-mexer-no-código) abaixo).

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
direto pelo navegador — inclusive enviar fotos, vídeos e áudios. O login é feito com **e-mail e senha próprios do
site** (não depende de conta ou token do GitHub) — quem confere e-mail/senha é o servidor Node incluído no projeto
(`server.js`).

### Como rodar (primeira vez)
1. Instale o [Node.js](https://nodejs.org) (18 ou mais novo) na máquina que vai rodar o servidor.
2. Na pasta do projeto, rode uma vez: `npm install`
3. Depois, sempre que quiser rodar o site com o admin ativo: `npm start` (ou `node server.js`)
4. Acesse `http://localhost:5500` para o site e `http://localhost:5500/admin/` para o painel.

### Login de teste (localhost)
Na primeira vez que o servidor roda, ele cria sozinho um administrador de teste:
- **E-mail**: `adm@adm.com`
- **Senha**: `123456`

Isso fica salvo em `server/usuarios.json` (a senha nunca é salva em texto puro, só um hash) — esse arquivo **não
é enviado para o GitHub** (está no `.gitignore`) porque é específico de cada instalação do servidor. Antes de usar
o site "de verdade" (fora do seu computador), troque essa senha ou peça para eu criar um jeito de cadastrar um
novo administrador com e-mail/senha reais.

### O que dá pra editar
- **Textos do Site**: frase do topo, selos da home, os 3 parágrafos de "Sobre a banda", e-mail, WhatsApp e redes sociais.
- **Integrantes, Shows, Galeria, Vídeos, Notícias e Loja**: adicionar, editar, reordenar (setas ▲▼) e excluir itens,
  com upload direto de fotos e, nos vídeos, upload de vídeo/áudio ou link do YouTube.

Cada alteração salva grava direto nos arquivos `data/*.json` e nos uploads em `assets/uploads/` — a página pública
já mostra a mudança assim que você atualiza (F5), sem precisar de deploy nem esperar nada.

### Sobre o domínio `adm.indefenza.com`
Isso é o próximo passo, quando o site for hospedado de verdade num domínio próprio. Diferente do restante do site
(que é só HTML/CSS/JS estático e pode ir pra qualquer hospedagem, incluindo GitHub Pages), **o painel admin precisa
de um servidor que rode Node.js** — GitHub Pages não roda esse tipo de servidor. Quando for a hora de colocar no ar,
o `server.js` deste projeto vai rodar num serviço com suporte a Node (ex: um VPS, Railway, Render) e o
`adm.indefenza.com` (ou `indefenza.com/admin`) vai apontar pra esse servidor.

### Arquivos por trás do painel
```
server.js                → servidor Node/Express: login, API de dados e upload de arquivos
server/usuarios.json     → e-mail/senha (com hash) dos administradores — não vai para o git
data/*.json              → conteúdo editável (um arquivo por seção)
assets/js/conteudo.js    → lê os data/*.json e preenche as páginas públicas (sem alterar o visual)
assets/js/api-client.js  → fala com a API própria do servidor (login, ler/gravar dados, enviar arquivos)
admin/                   → o painel em si (login + telas de edição)
```

## Publicar o site
- **As páginas públicas** (`index.html`, `sobre.html` etc.) são estáticas e funcionam em qualquer hospedagem: GitHub Pages, Netlify, Vercel, Cloudflare Pages.
- **O Painel Admin** precisa que `server.js` esteja rodando em algum lugar com suporte a Node.js (não funciona em hospedagem só-estática como o GitHub Pages).
