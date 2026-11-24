// Service worker: guarda las páginas y recursos visitados para que la
// calculadora funcione sin internet después de la primera visita.
// · Páginas (HTML): primero la red; si no hay conexión, la copia guardada.
// · Recursos (JS, fuentes, íconos): primero la copia guardada.
// La versión cambia en cada compilación, así se limpian las copias viejas.
import type { APIRoute } from 'astro';

const version = `cuantodormir-${Date.now().toString(36)}`;

const codigo = `const CACHE = '${version}';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) => Promise.all(claves.filter((c) => c.startsWith('cuantodormir-') && c !== CACHE).map((c) => caches.delete(c))))
      .then(() => self.clients.claim()),
  );
});

async function guardar(urls) {
  const cache = await caches.open(CACHE);
  await Promise.all(
    urls.map((url) =>
      fetch(url, { credentials: 'same-origin' })
        .then((respuesta) => (respuesta.ok ? cache.put(url, respuesta) : undefined))
        .catch(() => undefined),
    ),
  );
}

self.addEventListener('message', (evento) => {
  const datos = evento.data || {};
  if (datos.tipo === 'precargar' && Array.isArray(datos.urls)) {
    const propias = datos.urls.filter((u) => {
      try {
        return new URL(u, self.location.origin).origin === self.location.origin;
      } catch {
        return false;
      }
    });
    evento.waitUntil(guardar(propias));
  }
});

self.addEventListener('fetch', (evento) => {
  const { request } = evento;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const esPagina = request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
  if (esPagina) {
    evento.respondWith(
      fetch(request)
        .then((respuesta) => {
          if (respuesta.ok) {
            const copia = respuesta.clone();
            caches.open(CACHE).then((cache) => cache.put(url.pathname, copia));
          }
          return respuesta;
        })
        .catch(async () => {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match(url.pathname, { ignoreVary: true })) ||
            (await cache.match(request, { ignoreSearch: true, ignoreVary: true })) ||
            (await cache.match('/', { ignoreVary: true })) ||
            Response.error()
          );
        }),
    );
    return;
  }

  evento.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const guardada = await cache.match(request, { ignoreSearch: true, ignoreVary: true });
      if (guardada) return guardada;
      const respuesta = await fetch(request);
      if (respuesta.ok) cache.put(request, respuesta.clone());
      return respuesta;
    }),
  );
});
`;

export const GET: APIRoute = () =>
  new Response(codigo, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
