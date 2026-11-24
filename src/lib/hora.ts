// Formatos de hora y duración para cada idioma.
// Español: 12 horas con "a. m." y "p. m." (10:45 p. m.).
// Inglés: 12 horas con "AM" y "PM" (10:45 PM).
// Portugués de Brasil: 24 horas (22:45).
// Se usa un espacio de no separación ( ) para que la hora nunca se parta
// en dos líneas.

import type { HoraMinuto } from './calculo';

export type Idioma = 'es' | 'en' | 'pt';

const NBSP = ' ';

export function usa24Horas(idioma: Idioma): boolean {
  return idioma === 'pt';
}

/** Hora de 1 a 12 a partir de una hora de 0 a 23. */
export function hora12(h: number): number {
  const resto = h % 12;
  return resto === 0 ? 12 : resto;
}

/** "a. m." / "p. m." o "AM" / "PM" según el idioma. */
export function periodo(h: number, idioma: Idioma): string {
  const manana = h < 12;
  if (idioma === 'en') return manana ? 'AM' : 'PM';
  return manana ? `a.${NBSP}m.` : `p.${NBSP}m.`;
}

export function formatearHora(valor: Date | HoraMinuto, idioma: Idioma): string {
  const h = valor instanceof Date ? valor.getHours() : valor.h;
  const m = valor instanceof Date ? valor.getMinutes() : valor.m;
  const mm = String(m).padStart(2, '0');
  if (usa24Horas(idioma)) return `${String(h).padStart(2, '0')}:${mm}`;
  return `${hora12(h)}:${mm}${NBSP}${periodo(h, idioma)}`;
}

/**
 * En español se dice "es la 1:05" pero "son las 2:05";
 * en portugués, "é 01:05" pero "são 02:05".
 */
export function horaEnSingular(valor: Date | HoraMinuto, idioma: Idioma): boolean {
  const h = valor instanceof Date ? valor.getHours() : valor.h;
  if (idioma === 'es') return hora12(h) === 1;
  if (idioma === 'pt') return h === 0 || h === 1;
  return false;
}

/** 540 → "9 h", 450 → "7 h 30 min", 10 → "10 min". */
export function formatearDuracion(minutos: number, _idioma: Idioma): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}${NBSP}min`;
  if (m === 0) return `${h}${NBSP}h`;
  return `${h}${NBSP}h ${m}${NBSP}min`;
}

/**
 * Reemplaza {clave} por su valor en un texto.
 * Si una abreviatura cierra la frase ("…las 11:42 p. m."), su punto sirve de
 * punto final: nunca quedan dos puntos seguidos.
 */
export function rellenar(plantilla: string, valores: Record<string, string | number>): string {
  return plantilla
    .replace(/\{(\w+)\}/g, (todo, clave: string) => (clave in valores ? String(valores[clave]) : todo))
    .replace(/(\S)\.\.(?!\.)/g, '$1.');
}
