// Mapa único de rutas por idioma. De aquí salen el selector de idioma,
// las etiquetas hreflang, las URL canónicas y el sitemap.
import es from './es.json';
import en from './en.json';
import pt from './pt.json';
import type { Idioma } from '../lib/hora';

export const IDIOMAS: Idioma[] = ['es', 'en', 'pt'];
export const IDIOMA_POR_DEFECTO: Idioma = 'es';

export const textos = { es, en, pt } as const;
export type Textos = typeof es;

export function t(idioma: Idioma): Textos {
  return textos[idioma] as Textos;
}

/** Identificadores de cada página del sitio (iguales en todos los idiomas). */
export type ClavePagina =
  | 'despertar'
  | 'ahora'
  | 'acostarse'
  | 'siesta'
  | 'guia'
  | 'preguntas'
  | 'metodo'
  | 'paraDormir'
  | 'acerca'
  | 'privacidad';

export const RUTAS: Record<ClavePagina, Record<Idioma, string>> = {
  despertar: { es: '/', en: '/en/', pt: '/pt/' },
  ahora: { es: '/dormir-ahora/', en: '/en/sleep-now/', pt: '/pt/dormir-agora/' },
  acostarse: { es: '/dormir-a-las/', en: '/en/sleep-at/', pt: '/pt/dormir-as/' },
  siesta: { es: '/siesta/', en: '/en/nap/', pt: '/pt/soneca/' },
  guia: { es: '/guia/', en: '/en/guide/', pt: '/pt/guia/' },
  preguntas: { es: '/preguntas-frecuentes/', en: '/en/faq/', pt: '/pt/perguntas-frequentes/' },
  metodo: { es: '/como-calculamos/', en: '/en/how-we-calculate/', pt: '/pt/como-calculamos/' },
  paraDormir: { es: '/para-dormir/', en: '/en/for-sleep/', pt: '/pt/para-dormir/' },
  acerca: { es: '/acerca/', en: '/en/about/', pt: '/pt/sobre/' },
  privacidad: { es: '/privacidad/', en: '/en/privacy/', pt: '/pt/privacidade/' },
};

export const CALCULADORAS = ['despertar', 'ahora', 'acostarse', 'siesta'] as const;
export type Calculadora = (typeof CALCULADORAS)[number];

export function ruta(clave: ClavePagina, idioma: Idioma): string {
  return RUTAS[clave][idioma];
}

/** Ruta de un artículo de la guía en un idioma. */
export function rutaArticulo(slug: string, idioma: Idioma): string {
  return `${RUTAS.guia[idioma]}${slug}/`;
}

/** Versiones alternativas de una página: { es: '/…', en: '/en/…', pt: '/pt/…' }. */
export type Alternativas = Partial<Record<Idioma, string>>;

export function alternativasDe(clave: ClavePagina): Alternativas {
  return { ...RUTAS[clave] };
}
