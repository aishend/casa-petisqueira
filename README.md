# Casa da Petisqueira

Site de [casadapetisqueira.com](https://casadapetisqueira.com): HTML estático em 8 línguas (EN, PT, ES, FR, DE, IT, NL, PL), publicado no GitHub Pages. O site do bungalow é gerado em `dist-bungalow/`.

## Comandos

```sh
npm run build    # gera os dois sites (dist/ e dist-bungalow/)
npm run dev      # gera e serve em http://localhost:8080 (dev:bungalow: 8081)
npm run images   # converte fotos-originais/ em imagens leves para static/img/ (requer vips e ffmpeg)
```

Não há dependências para instalar: só Node.

## Como mudar o site

- **Textos, casas, contactos, links do Booking:** `src/data.mjs`
- **Aspeto:** `src/styles.css`
- **Estrutura das páginas:** `src/build.mjs`

## Adicionar ou trocar fotos

1. Pôr as fotos (jpg/webp/png, qualquer tamanho) em `fotos-originais/<casa>/`, com nomes `01`, `02`, … pela ordem desejada. Esta pasta não vai para o git.
2. Correr `npm run images`. As versões novas ficam em `static/img/<casa>/NN-{480,1024,1920}.webp`. Use `--force` para refazer as que já existem.
3. Se quiser, mudar as fotos de destaque (`featured`) em `src/data.mjs`.

## Publicar

Basta fazer push para `main`: o GitHub Actions (`.github/workflows/deploy.yml`) gera o site e publica-o.
Em Settings → Pages, a opção "Source" tem de estar em **GitHub Actions**.
