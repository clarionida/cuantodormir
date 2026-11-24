// Símbolo de cuánto dormir: una luna creciente de línea cuyo trazo casi se
// cierra en círculo, como un ciclo, con un punto a modo de estrella.
// Coordenadas en una cuadrícula de 32 × 32.
export const SIMBOLO = {
  viewBox: '0 0 32 32',
  luna: 'M10.46 6.43A11.5 11.5 0 1 0 26.24 19.42A9.5 9.5 0 0 1 16.62 3.07',
  grosor: 2.6,
  estrella: { cx: 25, cy: 7.5, r: 1.9 },
};

/** Devuelve el símbolo como grupo SVG en el color indicado. */
export function simboloSvg(color) {
  const { luna, grosor, estrella } = SIMBOLO;
  return (
    `<path d="${luna}" fill="none" stroke="${color}" stroke-width="${grosor}" ` +
    `stroke-linecap="round" stroke-linejoin="round"/>` +
    `<circle cx="${estrella.cx}" cy="${estrella.cy}" r="${estrella.r}" fill="${color}"/>`
  );
}
