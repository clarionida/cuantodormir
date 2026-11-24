// Revisa el sitio compilado (dist/) antes de publicarlo. Si algo falla, la
// publicación se detiene y GitHub te muestra el motivo en la pestaña Actions.
//  · JavaScript ≤ 30 KB y CSS ≤ 25 KB, comprimidos.
//  · Los borradores (revisado: false) llevan noindex y no están en el sitemap.
//  · hreflang recíproco entre idiomas.
//  · Un solo H1 por página; título y descripción de las calculadoras dentro del límite.
//  · Existen robots.txt, sitemap.xml, llms.txt, manifest, favicons y og-image.
//  · No hay blanco ni negro puros en el CSS.
import { readFile, readdir, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = join(raiz, 'dist');
const errores = [];
const avisos = [];
const error = (m) => errores.push(m);

async function archivos(dir) {
  const salida = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, e.name);
    if (e.isDirectory()) salida.push(...(await archivos(ruta)));
    else salida.push(ruta);
  }
  return salida;
}
const gz = (texto) => gzipSync(texto, { level: 9 }).length;
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

const todos = await archivos(dist);
const htmls = todos.filter((f) => f.endsWith('.html'));
const urlDeArchivo = (f) => '/' + relative(dist, f).replace(/index\.html$/, '').replace(/\\/g, '/');

// ── Archivos obligatorios ──────────────────────────────────────────────────
for (const f of [
  'robots.txt', 'sitemap.xml', 'llms.txt', 'manifest.webmanifest', 'en/manifest.webmanifest',
  'pt/manifest.webmanifest', 'favicon.ico', 'favicon.svg', 'logo.svg', 'apple-touch-icon.png',
  'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'og-image.png', 'sw.js', '404.html', 'CNAME',
]) {
  try {
    await stat(join(dist, f));
  } catch {
    error(`Falta dist/${f}`);
  }
}
try {
  const m = JSON.parse(await readFile(join(dist, 'manifest.webmanifest'), 'utf8'));
  if (!m.name || !m.icons?.length) error('manifest.webmanifest incompleto');
} catch (e) {
  error(`manifest.webmanifest no es JSON válido: ${e.message}`);
}

// ── Presupuesto de JavaScript ──────────────────────────────────────────────
const js = todos.filter((f) => f.endsWith('.js') && !f.endsWith('sw.js'));
let totalJs = 0;
for (const f of js) totalJs += gz(await readFile(f));
if (totalJs > 30 * 1024) error(`JavaScript comprimido: ${kb(totalJs)} (máximo 30 KB)`);

// ── Revisión de cada página ────────────────────────────────────────────────
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8').catch(() => '');
const paginas = new Map();
let maxCss = 0;
for (const f of htmls) {
  const html = await readFile(f, 'utf8');
  const url = urlDeArchivo(f);
  const css = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('');
  maxCss = Math.max(maxCss, gz(css));
  // #000 solo se permite dentro de máscaras (mask-image), que no es un color visible.
  const sinMascaras = css.replace(/mask-image:[^;]+;/g, '');
  if (/#fff(fff)?\b|#000(000)?\b|(?<![\w-])(white|black)(?![\w-])/i.test(sinMascaras)) {
    error(`${url}: CSS con blanco o negro puros`);
  }
  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1 && url !== '/404.html') error(`${url}: tiene ${h1} H1 (debe ser 1)`);
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const alternos = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => ({
    hreflang: m[1],
    url: new URL(m[2]).pathname,
  }));
  const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const descripcion = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  paginas.set(url, { noindex, alternos, titulo, descripcion, html });
}
if (maxCss > 25 * 1024) error(`CSS comprimido por página: ${kb(maxCss)} (máximo 25 KB)`);

// ── Borradores ─────────────────────────────────────────────────────────────
const dirGuia = join(raiz, 'src/content/guia');
for (const nombre of await readdir(dirGuia)) {
  if (!nombre.endsWith('.md')) continue;
  const texto = await readFile(join(dirGuia, nombre), 'utf8');
  const revisado = /^revisado:\s*true\s*$/m.test(texto);
  const url = `/guia/${nombre.replace(/\.md$/, '')}/`;
  const pagina = paginas.get(url);
  if (!pagina) {
    error(`No se generó el artículo ${url}`);
    continue;
  }
  if (!revisado && !pagina.noindex) error(`${url}: es borrador y no lleva noindex`);
  if (!revisado && sitemap.includes(`${url}<`)) error(`${url}: es borrador y está en el sitemap`);
  if (revisado && pagina.noindex) error(`${url}: está revisado pero lleva noindex`);
}

// ── hreflang recíproco y sitemap ───────────────────────────────────────────
for (const [url, p] of paginas) {
  if (p.noindex) {
    if (sitemap.includes(`>https://cuantodormir.com${url}<`)) error(`${url}: lleva noindex y está en el sitemap`);
    continue;
  }
  if (url === '/404.html') continue;
  if (!sitemap.includes(`<loc>https://cuantodormir.com${url}</loc>`)) error(`${url}: indexable pero no está en el sitemap`);
  for (const alt of p.alternos.filter((a) => a.hreflang !== 'x-default')) {
    const otra = paginas.get(alt.url);
    if (!otra) {
      error(`${url}: hreflang ${alt.hreflang} apunta a ${alt.url}, que no existe`);
      continue;
    }
    if (!otra.alternos.some((a) => a.url === url)) error(`${url} ↔ ${alt.url}: hreflang no recíproco`);
  }
}

// ── Títulos y descripciones de las calculadoras ────────────────────────────
const calculadoras = ['/', '/dormir-ahora/', '/dormir-a-las/', '/siesta/', '/en/', '/en/sleep-now/', '/en/sleep-at/', '/en/nap/', '/pt/', '/pt/dormir-agora/', '/pt/dormir-as/', '/pt/soneca/'];
const decodificar = (s) => s.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
for (const url of calculadoras) {
  const p = paginas.get(url);
  if (!p) {
    error(`Falta la calculadora ${url}`);
    continue;
  }
  if (decodificar(p.titulo).length > 60) error(`${url}: título de ${p.titulo.length} caracteres (máximo 60)`);
  if (decodificar(p.descripcion).length > 155) error(`${url}: descripción de ${p.descripcion.length} caracteres (máximo 155)`);
  if (!p.html.includes('<table')) error(`${url}: falta la tabla de ejemplo`);
}
for (const [url, p] of paginas) {
  if (!p.noindex && decodificar(p.descripcion).length > 160) avisos.push(`${url}: descripción larga (${p.descripcion.length})`);
}

// ── Resultado ──────────────────────────────────────────────────────────────
console.log(`\nVerificación: ${htmls.length} páginas · JS ${kb(totalJs)} · CSS máx. por página ${kb(maxCss)} (comprimidos)`);
for (const a of avisos) console.log(`  aviso: ${a}`);
if (errores.length) {
  console.error(`\n✗ ${errores.length} problema(s):`);
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('✓ Todo en orden.\n');
