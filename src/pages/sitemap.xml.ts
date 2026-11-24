// sitemap.xml automático, con hreflang recíproco (es, en, pt-BR y x-default).
// Los artículos en borrador (revisado: false) no aparecen.
import type { APIRoute } from 'astro';
import { sitio } from '../config/sitio';
import { IDIOMAS, t } from '../i18n/rutas';
import { paginasIndexables } from '../lib/mapa';

export const GET: APIRoute = async () => {
  const entradas = await paginasIndexables();
  const absoluta = (ruta: string) => new URL(ruta, sitio.dominio).href;
  const cuerpo = entradas
    .map((e) => {
      const enlaces = IDIOMAS.filter((i) => e.alternativas[i])
        .map((i) => `<xhtml:link rel="alternate" hreflang="${t(i).hreflang}" href="${absoluta(e.alternativas[i]!)}"/>`)
        .join('');
      const xDefault = e.alternativas.es
        ? `<xhtml:link rel="alternate" hreflang="x-default" href="${absoluta(e.alternativas.es)}"/>`
        : '';
      const fecha = e.actualizado ? `<lastmod>${e.actualizado.toISOString().slice(0, 10)}</lastmod>` : '';
      return `<url><loc>${absoluta(e.url)}</loc>${fecha}${enlaces}${xDefault}</url>`;
    })
    .join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${cuerpo}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
