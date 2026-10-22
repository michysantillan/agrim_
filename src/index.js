const MAX_BYTES = 35 * 1024 * 1024; // 35 MB
const ID_RE = /^[a-f0-9-]{36}$/;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Guardar plano ya estampado (streaming directo a R2, casi sin CPU)
    if (request.method === 'POST' && url.pathname === '/api/upload') {
      if (request.headers.get('x-token') !== env.UPLOAD_TOKEN) {
        return new Response('No autorizado', { status: 401 });
      }
      const id = url.searchParams.get('id') || '';
      if (!ID_RE.test(id)) return new Response('ID inválido', { status: 400 });

      const size = Number(request.headers.get('content-length') || 0);
      if (!size || size > MAX_BYTES) {
        return new Response('Archivo vacío o mayor a 35 MB', { status: 413 });
      }
      if (await env.BUCKET.head(`planos/${id}.pdf`)) {
        return new Response('Ese ID ya existe', { status: 409 });
      }

      await env.BUCKET.put(`planos/${id}.pdf`, request.body, {
        httpMetadata: { contentType: 'application/pdf' },
      });
      return Response.json({ id, url: `${url.origin}/p/${id}` });
    }

    // URL pública estable (la que va dentro del QR)
    const m = url.pathname.match(/^\/p\/([a-f0-9-]{36})$/);
    if (request.method === 'GET' && m) {
      const obj = await env.BUCKET.get(`planos/${m[1]}.pdf`);
      if (!obj) return new Response('Plano no encontrado', { status: 404 });
      return new Response(obj.body, {
        headers: {
          'content-type': 'application/pdf',
          'content-disposition': `inline; filename="plano-${m[1].slice(0, 8)}.pdf"`,
          'cache-control': 'public, max-age=3600',
        },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
