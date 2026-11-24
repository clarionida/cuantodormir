// Manifest de la app (PWA) para cada idioma.
import { sitio } from '../config/sitio';
import { ruta, t } from '../i18n/rutas';
import type { Idioma } from './hora';

export function manifest(idioma: Idioma) {
  const tx = t(idioma);
  return {
    name: sitio.marca,
    // Si en tu pantalla de inicio el nombre aparece cortado, cámbialo por 'dormir'.
    short_name: sitio.marca,
    description: tx.lema,
    lang: tx.htmlLang,
    dir: 'ltr',
    start_url: ruta('despertar', idioma),
    scope: '/',
    id: ruta('despertar', idioma),
    display: 'standalone',
    background_color: sitio.colores.fondo,
    theme_color: sitio.colores.fondo,
    categories: ['health', 'lifestyle', 'utilities'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}

export function respuestaManifest(idioma: Idioma): Response {
  return new Response(JSON.stringify(manifest(idioma), null, 2), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' },
  });
}
