// Lee src/data/audios.json y descarta los elementos que no están listos.
// Un elemento solo se muestra si su youtubeId tiene la forma real de un ID de
// YouTube (11 caracteres: letras, números, - y _). Los marcados como
// [PENDIENTE] se ignoran.
import lista from '../data/audios.json';
import type { Idioma } from './hora';

export type TipoAudio = 'yoga-nidra' | 'meditacion' | 'escaneo-corporal' | 'ambiente';
export const TIPOS: TipoAudio[] = ['yoga-nidra', 'meditacion', 'escaneo-corporal', 'ambiente'];

export interface Audio {
  titulo: string;
  youtubeId: string;
  duracionMin: number;
  tipo: TipoAudio;
  canal: string;
  idioma: string;
}

const ID_YOUTUBE = /^[A-Za-z0-9_-]{11}$/;

export const audios: Audio[] = (lista as Audio[]).filter(
  (a) =>
    a &&
    typeof a.titulo === 'string' &&
    !a.titulo.includes('[PENDIENTE') &&
    ID_YOUTUBE.test(a.youtubeId) &&
    Number.isFinite(a.duracionMin) &&
    TIPOS.includes(a.tipo),
);

export const hayAudios = audios.length > 0;

/** Primero los del idioma de la página, después los demás. */
export function ordenarPorIdioma(elementos: Audio[], idioma: Idioma): Audio[] {
  const iso = idioma === 'pt' ? 'pt' : idioma;
  return [...elementos].sort(
    (a, b) => Number(!a.idioma.startsWith(iso)) - Number(!b.idioma.startsWith(iso)),
  );
}

/** Yoga nidra cuya duración coincide con la siesta (con 2 minutos de margen). */
export function yogaNidraPara(minutos: number, idioma: Idioma): Audio[] {
  return ordenarPorIdioma(
    audios.filter((a) => a.tipo === 'yoga-nidra' && Math.abs(a.duracionMin - minutos) <= 2),
    idioma,
  );
}

/** Videos para la página "Para dormir", agrupados por tipo. */
export function porTipo(idioma: Idioma): { tipo: TipoAudio; elementos: Audio[] }[] {
  return TIPOS.map((tipo) => ({
    tipo,
    elementos: ordenarPorIdioma(
      audios.filter((a) => a.tipo === tipo),
      idioma,
    ),
  })).filter((g) => g.elementos.length > 0);
}
