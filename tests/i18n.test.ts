// Los textos en inglés y portugués deben tener exactamente las mismas claves
// que el español, y ningún texto vacío (salvo los que el español deja vacíos).
import { describe, expect, it } from 'vitest';
import es from '../src/i18n/es.json';
import en from '../src/i18n/en.json';
import pt from '../src/i18n/pt.json';

function claves(objeto: unknown, prefijo = ''): string[] {
  if (objeto === null || typeof objeto !== 'object' || Array.isArray(objeto)) return [prefijo];
  return Object.entries(objeto as Record<string, unknown>).flatMap(([k, v]) =>
    claves(v, prefijo ? `${prefijo}.${k}` : k),
  );
}

describe('Textos de la interfaz', () => {
  for (const [nombre, textos] of Object.entries({ en, pt })) {
    it(`${nombre}.json tiene las mismas claves que es.json`, () => {
      expect(claves(textos).sort()).toEqual(claves(es).sort());
    });
  }

  it('Las despedidas son cuatro en cada idioma', () => {
    for (const textos of [es, en, pt]) expect(textos.resultados.despedidas).toHaveLength(4);
  });

  it('La marca no se traduce', () => {
    for (const textos of [es, en, pt]) {
      expect(textos.calculadoras.despertar.metaTitulo.startsWith('cuánto dormir')).toBe(true);
    }
  });
});
