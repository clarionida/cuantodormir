// Pruebas de los casos de la sección 3 del documento del proyecto.
// Todas usan 15 minutos de latencia y ciclos de 90 minutos.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  horasDeSiesta,
  horasParaAcostarse,
  horasParaDespertar,
  leerHora,
  proximaVez,
  ultimaVez,
  alMinuto,
} from '../src/lib/calculo';
import { formatearDuracion, formatearHora, rellenar } from '../src/lib/hora';

const ajustes = { cicloMin: 90, latenciaMin: 15, ciclosMaximos: 6, ciclosRecomendados: 5 };
const tzOriginal = process.env.TZ;

/** Convierte las opciones en texto: "10:45 p. m. ★". */
function comoTexto(
  opciones: { fecha: Date; recomendado: boolean }[],
  idioma: 'es' | 'en' | 'pt' = 'es',
): string[] {
  return opciones.map(
    (o) => formatearHora(o.fecha, idioma).replace(/ /g, ' ') + (o.recomendado ? ' ★' : ''),
  );
}

describe('Casos de prueba (zona horaria de Ciudad de México)', () => {
  beforeAll(() => {
    process.env.TZ = 'America/Mexico_City';
  });
  afterAll(() => {
    process.env.TZ = tzOriginal;
  });

  it('Despertar a las 8:00 a. m.', () => {
    const ahora = new Date(2026, 10, 24, 21, 0); // 9:00 p. m.
    const despertar = proximaVez({ h: 8, m: 0 }, ahora);
    const opciones = horasParaAcostarse(despertar, ajustes, ahora);
    expect(comoTexto(opciones)).toEqual([
      '10:45 p. m. ★',
      '12:15 a. m. ★',
      '1:45 a. m.',
      '3:15 a. m.',
      '4:45 a. m.',
      '6:15 a. m.',
    ]);
    expect(opciones.map((o) => o.ciclos)).toEqual([6, 5, 4, 3, 2, 1]);
    expect(opciones.every((o) => !o.pasada)).toBe(true);
  });

  it('Dormir ahora a las 11:00 p. m.', () => {
    const ahora = new Date(2026, 10, 24, 23, 0);
    expect(comoTexto(horasParaDespertar(ahora, ajustes))).toEqual([
      '12:45 a. m.',
      '2:15 a. m.',
      '3:45 a. m.',
      '5:15 a. m.',
      '6:45 a. m. ★',
      '8:15 a. m. ★',
    ]);
  });

  it('Dormir a las 10:00 p. m.', () => {
    const ahora = new Date(2026, 10, 24, 18, 0);
    const acostarse = proximaVez({ h: 22, m: 0 }, ahora);
    expect(comoTexto(horasParaDespertar(acostarse, ajustes))).toEqual([
      '11:45 p. m.',
      '1:15 a. m.',
      '2:45 a. m.',
      '4:15 a. m.',
      '5:45 a. m. ★',
      '7:15 a. m. ★',
    ]);
  });

  it('Siesta a las 3:00 p. m.', () => {
    const ahora = new Date(2026, 10, 24, 15, 0);
    const opciones = horasDeSiesta(ahora, 15, [10, 18, 25, 90]);
    expect(comoTexto(opciones)).toEqual(['3:25 p. m.', '3:33 p. m.', '3:40 p. m.', '4:45 p. m.']);
    expect(opciones.some((o) => o.recomendado)).toBe(false);
  });

  it('Cruza la medianoche: dormir ahora a las 11:50 p. m.', () => {
    const ahora = new Date(2026, 11, 31, 23, 50); // Nochevieja
    const opciones = horasParaDespertar(ahora, ajustes);
    expect(comoTexto(opciones)).toEqual([
      '1:35 a. m.',
      '3:05 a. m.',
      '4:35 a. m.',
      '6:05 a. m.',
      '7:35 a. m. ★',
      '9:05 a. m. ★',
    ]);
    // Todas caen el 1 de enero del año siguiente.
    expect(opciones.every((o) => o.fecha.getFullYear() === 2027 && o.fecha.getDate() === 1)).toBe(
      true,
    );
  });

  it('Cruza la medianoche: despertar a las 8:00 a. m. calculado a las 11:30 p. m.', () => {
    const ahora = new Date(2026, 10, 24, 23, 30);
    const despertar = proximaVez({ h: 8, m: 0 }, ahora);
    expect(despertar.getDate()).toBe(25);
    const opciones = horasParaAcostarse(despertar, ajustes, ahora);
    // 10:45 p. m. ya pasó; 12:15 a. m. todavía no.
    expect(opciones.map((o) => o.pasada)).toEqual([true, false, false, false, false, false]);
  });

  it('La hora de despertar es la próxima vez que llegue', () => {
    const ahora = new Date(2026, 10, 24, 7, 0);
    expect(proximaVez({ h: 8, m: 0 }, ahora).getDate()).toBe(24);
    const tarde = new Date(2026, 10, 24, 8, 0);
    expect(proximaVez({ h: 8, m: 0 }, tarde).getDate()).toBe(25);
  });

  it('Un cálculo restaurado desde la URL usa la última vez que llegó esa hora', () => {
    const ahora = new Date(2026, 10, 25, 0, 20); // 12:20 a. m.
    const inicio = ultimaVez({ h: 23, m: 0 }, ahora);
    expect(inicio.getDate()).toBe(24);
    expect(inicio.getHours()).toBe(23);
  });

  it('Los segundos se descartan', () => {
    const ahora = alMinuto(new Date(2026, 10, 24, 23, 2, 37, 500));
    expect(formatearHora(horasParaDespertar(ahora, ajustes)[0].fecha, 'es')).toBe(
      '12:47 a. m.',
    );
  });
});

describe('Horario de verano (Nueva York)', () => {
  beforeAll(() => {
    process.env.TZ = 'America/New_York';
  });
  afterAll(() => {
    process.env.TZ = tzOriginal;
  });

  it('Primavera: el reloj se adelanta una hora la madrugada del 8 de marzo de 2026', () => {
    const ahora = new Date(2026, 2, 7, 23, 0); // 11:00 p. m., horario estándar
    const opciones = horasParaDespertar(ahora, ajustes);
    // 9 h 15 min reales después son las 9:15 a. m. en el reloj (horario de verano).
    expect(comoTexto(opciones).at(-1)).toBe('9:15 a. m. ★');
    expect((opciones[5].fecha.getTime() - ahora.getTime()) / 60000).toBe(555);
  });

  it('Otoño: el reloj se atrasa una hora la madrugada del 1 de noviembre de 2026', () => {
    const ahora = new Date(2026, 9, 31, 23, 0);
    const opciones = horasParaDespertar(ahora, ajustes);
    expect(comoTexto(opciones).at(-1)).toBe('7:15 a. m. ★');
  });

  it('Despertar a las 8:00 a. m. del día del cambio de primavera', () => {
    const ahora = new Date(2026, 2, 7, 20, 0);
    const despertar = proximaVez({ h: 8, m: 0 }, ahora);
    expect(despertar.getHours()).toBe(8);
    expect(despertar.getDate()).toBe(8);
    const opciones = horasParaAcostarse(despertar, ajustes, ahora);
    // 9 h 15 min reales antes de las 8:00 a. m. (verano) son las 9:45 p. m. (estándar).
    expect(comoTexto(opciones)[0]).toBe('9:45 p. m. ★');
    expect((despertar.getTime() - opciones[0].fecha.getTime()) / 60000).toBe(555);
  });
});

describe('Formatos por idioma', () => {
  beforeAll(() => {
    process.env.TZ = 'America/Mexico_City';
  });
  afterAll(() => {
    process.env.TZ = tzOriginal;
  });

  it('Inglés usa AM/PM y portugués 24 horas', () => {
    const ahora = new Date(2026, 10, 24, 23, 0);
    const opciones = horasParaDespertar(ahora, ajustes);
    expect(comoTexto(opciones, 'en')[0]).toBe('12:45 AM');
    expect(comoTexto(opciones, 'pt')).toEqual([
      '00:45',
      '02:15',
      '03:45',
      '05:15',
      '06:45 ★',
      '08:15 ★',
    ]);
    expect(formatearHora({ h: 22, m: 45 }, 'pt')).toBe('22:45');
    expect(formatearHora({ h: 12, m: 0 }, 'en')).toBe('12:00\u00A0PM');
  });

  it('Duraciones', () => {
    const limpiar = (s: string) => s.replace(/ /g, ' ');
    expect(limpiar(formatearDuracion(540, 'es'))).toBe('9 h');
    expect(limpiar(formatearDuracion(450, 'es'))).toBe('7 h 30 min');
    expect(limpiar(formatearDuracion(10, 'es'))).toBe('10 min');
  });

  it('Sin doble punto al final de la frase', () => {
    const hora = formatearHora({ h: 23, m: 42 }, 'es');
    expect(rellenar('Ahora son las {hora}.', { hora }).replace(/\u00A0/g, ' ')).toBe(
      'Ahora son las 11:42 p. m.',
    );
    expect(rellenar('It’s {hora} right now.', { hora: '11:42 PM' })).toBe('It’s 11:42 PM right now.');
  });

  it('Lee horas de la URL', () => {
    expect(leerHora('08:00')).toEqual({ h: 8, m: 0 });
    expect(leerHora('8:05')).toEqual({ h: 8, m: 5 });
    expect(leerHora('25:00')).toBeNull();
    expect(leerHora('hola')).toBeNull();
  });
});
