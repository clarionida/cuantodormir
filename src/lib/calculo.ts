// Núcleo de cálculo de cuánto dormir.
// Todo se calcula con marcas de tiempo reales (objetos Date y milisegundos),
// nunca sumando texto. Así funciona al cruzar la medianoche y con los cambios
// de horario de verano: el tiempo transcurrido siempre es el real, y la hora
// que se muestra es la del reloj del dispositivo en ese momento.

export const MINUTO = 60_000;

export interface HoraMinuto {
  /** Hora en formato de 24 horas, de 0 a 23. */
  h: number;
  /** Minutos, de 0 a 59. */
  m: number;
}

export interface Opcion {
  /** Momento exacto de la opción (acostarse o despertar). */
  fecha: Date;
  /** Número de ciclos (solo en las pestañas de noche). */
  ciclos?: number;
  /** Duración de la siesta en minutos (solo en la pestaña Siesta). */
  siestaMin?: number;
  /** Minutos de sueño, sin contar lo que se tarda en dormirse. */
  minutosSueno: number;
  /** Lleva la etiqueta "Recomendado". */
  recomendado: boolean;
  /** La hora ya pasó (solo en "Despertar a las…"). */
  pasada: boolean;
}

export interface Ajustes {
  /** Duración de un ciclo en minutos (90 por defecto). */
  cicloMin: number;
  /** Minutos que se tarda en dormirse. */
  latenciaMin: number;
  /** Cuántos ciclos calcular (6). */
  ciclosMaximos?: number;
  /** Desde cuántos ciclos una opción es "Recomendado" (5). */
  ciclosRecomendados?: number;
}

/** Convierte "08:00" o "8:05" en { h: 8, m: 0 }. Devuelve null si no es válida. */
export function leerHora(texto: string | null | undefined): HoraMinuto | null {
  if (!texto) return null;
  const coincide = /^(\d{1,2}):(\d{2})$/.exec(texto.trim());
  if (!coincide) return null;
  const h = Number(coincide[1]);
  const m = Number(coincide[2]);
  if (h > 23 || m > 59) return null;
  return { h, m };
}

/** Convierte { h: 8, m: 0 } en "08:00". */
export function escribirHora({ h, m }: HoraMinuto): string {
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Hora y minutos de una fecha, según el reloj del dispositivo. */
export function horaDe(fecha: Date): HoraMinuto {
  return { h: fecha.getHours(), m: fecha.getMinutes() };
}

/** Quita segundos y milisegundos: 11:02:37 → 11:02:00. */
export function alMinuto(fecha: Date): Date {
  const copia = new Date(fecha.getTime());
  copia.setSeconds(0, 0);
  return copia;
}

/** Suma minutos reales (tiempo transcurrido) a una fecha. */
export function sumarMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * MINUTO);
}

/**
 * La próxima vez que el reloj marque esa hora a partir de ahora.
 * Si es exactamente ahora o ya pasó hoy, es mañana.
 * Se usa setDate/setHours (hora local) para respetar el horario de verano.
 */
export function proximaVez(hora: HoraMinuto, ahora: Date): Date {
  const fecha = new Date(ahora.getTime());
  fecha.setHours(hora.h, hora.m, 0, 0);
  if (fecha.getTime() <= ahora.getTime()) {
    fecha.setDate(fecha.getDate() + 1);
    fecha.setHours(hora.h, hora.m, 0, 0);
  }
  return fecha;
}

/**
 * La última vez que el reloj marcó esa hora (hoy o ayer).
 * Sirve para restaurar un cálculo de "Dormir ahora" o "Siesta" desde la URL.
 */
export function ultimaVez(hora: HoraMinuto, ahora: Date): Date {
  const fecha = new Date(ahora.getTime());
  fecha.setHours(hora.h, hora.m, 0, 0);
  if (fecha.getTime() > ahora.getTime()) {
    fecha.setDate(fecha.getDate() - 1);
    fecha.setHours(hora.h, hora.m, 0, 0);
  }
  return fecha;
}

/**
 * Pestaña "Despertar a las…": horas para acostarse y cerrar los ojos.
 * Fórmula: despertar − n × ciclo − latencia, con n de 6 a 1
 * (de más sueño a menos). Las que ya pasaron se marcan.
 */
export function horasParaAcostarse(despertar: Date, ajustes: Ajustes, ahora: Date): Opcion[] {
  const maximo = ajustes.ciclosMaximos ?? 6;
  const recomendados = ajustes.ciclosRecomendados ?? 5;
  const opciones: Opcion[] = [];
  for (let n = maximo; n >= 1; n--) {
    const fecha = sumarMinutos(despertar, -(n * ajustes.cicloMin + ajustes.latenciaMin));
    opciones.push({
      fecha,
      ciclos: n,
      minutosSueno: n * ajustes.cicloMin,
      recomendado: n >= recomendados,
      pasada: fecha.getTime() < ahora.getTime(),
    });
  }
  return opciones;
}

/**
 * Pestañas "Dormir ahora" y "Dormir a las…": horas para despertar.
 * Fórmula: inicio + latencia + n × ciclo, con n de 1 a 6 (orden cronológico).
 */
export function horasParaDespertar(inicio: Date, ajustes: Ajustes): Opcion[] {
  const maximo = ajustes.ciclosMaximos ?? 6;
  const recomendados = ajustes.ciclosRecomendados ?? 5;
  const opciones: Opcion[] = [];
  for (let n = 1; n <= maximo; n++) {
    opciones.push({
      fecha: sumarMinutos(inicio, ajustes.latenciaMin + n * ajustes.cicloMin),
      ciclos: n,
      minutosSueno: n * ajustes.cicloMin,
      recomendado: n >= recomendados,
      pasada: false,
    });
  }
  return opciones;
}

/**
 * Pestaña "Siesta": horas para terminar la siesta.
 * Fórmula: ahora + latencia + duración. La siesta de un ciclo completo usa
 * la duración del ciclo elegida (90 por defecto). Sin "Recomendado".
 */
export function horasDeSiesta(
  inicio: Date,
  latenciaMin: number,
  duraciones: readonly number[],
): Opcion[] {
  return [...duraciones]
    .sort((a, b) => a - b)
    .map((duracion) => ({
      fecha: sumarMinutos(inicio, latenciaMin + duracion),
      siestaMin: duracion,
      minutosSueno: duracion,
      recomendado: false,
      pasada: false,
    }));
}

/** Limita un número a un rango y lo redondea. */
export function acotar(valor: number, minimo: number, maximo: number): number {
  if (!Number.isFinite(valor)) return minimo;
  return Math.min(maximo, Math.max(minimo, Math.round(valor)));
}
