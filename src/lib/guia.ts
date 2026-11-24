// Artículos de la guía.
// · Español: src/content/guia/<slug>.md → /guia/<slug>/ (también los borradores,
//   que llevan noindex y no van al sitemap).
// · Traducciones: src/content/guia/en/<slug>.md → /en/guide/<slug>/ y
//   src/content/guia/pt/<slug>.md → /pt/guia/<slug>/, con `traduccionDe` igual al
//   nombre del archivo en español. Solo se publican con `revisado: true`.
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Idioma } from './hora';
import { rutaArticulo, type Alternativas } from '../i18n/rutas';

export type Articulo = CollectionEntry<'guia'>;

export function idiomaDe(articulo: Articulo): Idioma {
  if (articulo.id.startsWith('en/')) return 'en';
  if (articulo.id.startsWith('pt/')) return 'pt';
  return 'es';
}

export function slugDe(articulo: Articulo): string {
  return articulo.id.replace(/^(en|pt)\//, '');
}

export function urlDe(articulo: Articulo): string {
  return rutaArticulo(slugDe(articulo), idiomaDe(articulo));
}

/** Slug del original en español (para unir traducciones). */
export function originalDe(articulo: Articulo): string {
  return idiomaDe(articulo) === 'es' ? slugDe(articulo) : (articulo.data.traduccionDe ?? slugDe(articulo));
}

const ordenar = (a: Articulo, b: Articulo) =>
  a.data.orden - b.data.orden || a.data.titulo.localeCompare(b.data.titulo);

/** Artículos que se publican como página en un idioma. */
export async function articulosPublicados(idioma: Idioma): Promise<Articulo[]> {
  const todos = await getCollection('guia');
  return todos
    .filter((a) => idiomaDe(a) === idioma)
    .filter((a) => idioma === 'es' || a.data.revisado)
    .sort(ordenar);
}

/** Artículos en español revisados (los que se muestran en la guía en/pt). */
export async function articulosRevisadosEnEspanol(): Promise<Articulo[]> {
  return (await articulosPublicados('es')).filter((a) => a.data.revisado);
}

/** Versiones del mismo artículo en cada idioma (solo las publicadas e indexables). */
export async function alternativasDeArticulo(articulo: Articulo): Promise<Alternativas> {
  const original = originalDe(articulo);
  const todos = await getCollection('guia');
  const alternativas: Alternativas = {};
  for (const a of todos) {
    if (originalDe(a) !== original) continue;
    if (!a.data.revisado && a !== articulo) continue;
    if (idiomaDe(a) !== 'es' && !a.data.revisado) continue;
    alternativas[idiomaDe(a)] = urlDe(a);
  }
  return alternativas;
}
