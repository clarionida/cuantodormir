// Avisa a Bing (y a otros buscadores que usan IndexNow) de las páginas del
// sitio después de cada publicación. Solo funciona si en src/config/sitio.ts
// pusiste indexNow: { activo: true, … }. Si algo falla, no detiene nada.
import { readFile } from 'node:fs/promises';

const config = await readFile(new URL('../src/config/sitio.ts', import.meta.url), 'utf8');
const bloque = config.match(/indexNow:\s*\{([\s\S]*?)\}/)?.[1] ?? '';
const activo = /activo:\s*true/.test(bloque);
const clave = bloque.match(/clave:\s*'([^']+)'/)?.[1];
const dominio = config.match(/dominio:\s*'([^']+)'/)?.[1] ?? 'https://cuantodormir.com';

if (!activo || !clave) {
  console.log('IndexNow está apagado en src/config/sitio.ts. No se avisa a nadie.');
  process.exit(0);
}

try {
  const sitemap = await (await fetch(`${dominio}/sitemap.xml`)).text();
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const respuesta = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(dominio).host,
      key: clave,
      keyLocation: `${dominio}/${clave}.txt`,
      urlList: urls,
    }),
  });
  console.log(`IndexNow: ${urls.length} direcciones enviadas (respuesta ${respuesta.status}).`);
} catch (e) {
  console.log(`IndexNow no respondió (${e.message}). No pasa nada; se intentará en la próxima publicación.`);
}
