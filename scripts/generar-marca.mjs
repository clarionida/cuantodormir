// Genera los archivos de marca a partir del símbolo (src/marca/simbolo.mjs):
//   public/logo.svg              símbolo + "cuánto dormir" (texto convertido en trazos)
//   public/favicon.ico           32 px
//   public/apple-touch-icon.png  180 px
//   public/icon-192.png, icon-512.png, icon-maskable-512.png
//   public/og-image.png          1200 × 630, para cuando se comparte un enlace
// Se ejecuta solo antes de cada compilación (npm run build). No hace falta
// exportar nada a mano.
import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import opentype from 'opentype.js';
import { SIMBOLO, simboloSvg } from '../src/marca/simbolo.mjs';

const require = createRequire(import.meta.url);
const raiz = fileURLToPath(new URL('..', import.meta.url));
const publico = (archivo) => `${raiz}public/${archivo}`;

const FONDO = '#0E1530';
const ACENTO = '#E2C27D';
const TEXTO = '#E7E2D6';
const TEXTO_SUAVE = '#A9AEC4';
const LAVANDA = '#A89BD8';

// Fuente de los títulos (Newsreader), desde npm.
const rutaFuente = require.resolve('@fontsource/newsreader/files/newsreader-latin-400-normal.woff');
const buffer = await readFile(rutaFuente);
const fuente = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));

/** Convierte un texto en un trazo SVG con Newsreader. */
function textoEnTrazo(texto, x, y, tamano) {
  const trazo = fuente.getPath(texto, x, y, tamano);
  return { d: trazo.toPathData(2), ancho: fuente.getAdvanceWidth(texto, tamano) };
}

/** El símbolo dentro de un cuadro de lado `lado`, centrado, ocupando `escala`. */
function simboloEn(lado, escala, color = ACENTO) {
  const tam = lado * escala;
  const desplazamiento = (lado - tam) / 2;
  return `<g transform="translate(${desplazamiento} ${desplazamiento}) scale(${tam / 32})">${simboloSvg(color)}</g>`;
}

function icono(lado, { escala = 0.8, redondeo = 0 } = {}) {
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${lado}" height="${lado}" viewBox="0 0 ${lado} ${lado}">` +
      `<rect width="${lado}" height="${lado}" rx="${redondeo}" fill="${FONDO}"/>` +
      simboloEn(lado, escala) +
      `</svg>`,
  );
}

async function png(svg, archivo, lado) {
  await sharp(svg, { density: 300 }).resize(lado, lado).png({ compressionLevel: 9 }).toFile(publico(archivo));
}

/** Un .ico que contiene un PNG de 32 px (formato admitido por todos los navegadores actuales). */
async function ico(svg, archivo) {
  const datos = await sharp(svg, { density: 300 }).resize(32, 32).png().toBuffer();
  const cabecera = Buffer.alloc(6);
  cabecera.writeUInt16LE(0, 0); // reservado
  cabecera.writeUInt16LE(1, 2); // tipo: icono
  cabecera.writeUInt16LE(1, 4); // una imagen
  const entrada = Buffer.alloc(16);
  entrada.writeUInt8(32, 0); // ancho
  entrada.writeUInt8(32, 1); // alto
  entrada.writeUInt8(0, 2); // paleta
  entrada.writeUInt8(0, 3); // reservado
  entrada.writeUInt16LE(1, 4); // planos
  entrada.writeUInt16LE(32, 6); // bits por píxel
  entrada.writeUInt32LE(datos.length, 8);
  entrada.writeUInt32LE(6 + 16, 12);
  await writeFile(publico(archivo), Buffer.concat([cabecera, entrada, datos]));
}

// ── Logo con nombre ──────────────────────────────────────────────────────────
function logoSvg() {
  const alto = 48;
  const nombre = textoEnTrazo('cuánto dormir', 58, 33, 30);
  const ancho = Math.ceil(58 + nombre.ancho + 4);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="cuánto dormir">` +
    `<g transform="translate(4 4) scale(1.25)">${simboloSvg(ACENTO)}</g>` +
    `<path d="${nombre.d}" fill="${ACENTO}"/>` +
    `</svg>\n`
  );
}

// ── Imagen para compartir (1200 × 630) ──────────────────────────────────────
function estrellas(ancho, alto, cantidad, semilla = 7) {
  // Generador pseudoaleatorio fijo: las estrellas siempre quedan en el mismo lugar.
  let s = semilla;
  const azar = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  let salida = '';
  for (let i = 0; i < cantidad; i++) {
    const x = (azar() * ancho).toFixed(1);
    const y = (azar() * alto).toFixed(1);
    const r = (0.6 + azar() * 1.1).toFixed(2);
    const o = (0.25 + azar() * 0.5).toFixed(2);
    salida += `<circle cx="${x}" cy="${y}" r="${r}" fill="${TEXTO}" opacity="${o}"/>`;
  }
  return salida;
}

function ogSvg() {
  const nombre = textoEnTrazo('cuánto dormir', 0, 0, 104);
  const lema1 = textoEnTrazo('Calcula tus horas para dormir', 0, 0, 44);
  const lema2 = textoEnTrazo('y despertar con más ligereza.', 0, 0, 44);
  const centro = (ancho) => (1200 - ancho) / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">` +
      `<defs>` +
      `<radialGradient id="neb" cx="0.72" cy="0.12" r="0.9"><stop offset="0" stop-color="#26306A"/><stop offset="0.55" stop-color="#151E3F"/><stop offset="1" stop-color="${FONDO}"/></radialGradient>` +
      `<radialGradient id="vel" cx="0.25" cy="0.85" r="0.6"><stop offset="0" stop-color="${LAVANDA}" stop-opacity="0.14"/><stop offset="1" stop-color="${LAVANDA}" stop-opacity="0"/></radialGradient>` +
      `</defs>` +
      `<rect width="1200" height="630" fill="url(#neb)"/>` +
      `<rect width="1200" height="630" fill="url(#vel)"/>` +
      estrellas(1200, 630, 70) +
      `<rect x="40.5" y="40.5" width="1119" height="549" rx="14" fill="none" stroke="#2A3560"/>` +
      `<g transform="translate(552 120) scale(3)">${simboloSvg(ACENTO)}</g>` +
      `<g transform="translate(${centro(nombre.ancho)} 340)"><path d="${nombre.d}" fill="${ACENTO}"/></g>` +
      `<g transform="translate(${centro(lema1.ancho)} 440)"><path d="${lema1.d}" fill="${TEXTO}"/></g>` +
      `<g transform="translate(${centro(lema2.ancho)} 500)"><path d="${lema2.d}" fill="${TEXTO_SUAVE}"/></g>` +
      `</svg>`,
  );
}

await writeFile(publico('logo.svg'), logoSvg());
await ico(icono(32, { escala: 0.9, redondeo: 7 }), 'favicon.ico');
await png(icono(180, { escala: 0.72 }), 'apple-touch-icon.png', 180);
await png(icono(192, { escala: 0.78, redondeo: 40 }), 'icon-192.png', 192);
await png(icono(512, { escala: 0.78, redondeo: 108 }), 'icon-512.png', 512);
// Ícono "maskable": el símbolo dentro de la zona segura (círculo del 80 %).
await png(icono(512, { escala: 0.56 }), 'icon-maskable-512.png', 512);
await sharp(ogSvg()).png({ compressionLevel: 9 }).toFile(publico('og-image.png'));

console.log(`Marca generada (${SIMBOLO.viewBox}): logo.svg, favicon.ico, íconos y og-image.png`);
