# Planos con sello + QR (Cloudflare gratis)

1. `npm i -g wrangler && wrangler login`
2. `wrangler r2 bucket create planos`
3. Copia tu sello (PNG con fondo transparente) a `public/sello.png`
4. `wrangler secret put UPLOAD_TOKEN`   (la clave que usará el cliente)
5. `wrangler deploy`

Abre la URL que te da Cloudflare (`planos.<tu-cuenta>.workers.dev`), sube un PDF y listo.
Para dominio propio: agrega una Custom Domain al Worker en el dashboard (el QR usará ese dominio).
