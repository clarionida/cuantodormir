// Lista de todas las páginas indexables del sitio, con sus versiones en cada
// idioma. Alimenta sitemap.xml y llms.txt. Los borradores no aparecen.
import { getCollection } from 'astro:content';
import { IDIOMAS, RUTAS, type Alternativas, type ClavePagina } from '../i18n/rutas';
import { hayAudios } from './audios';
import { alternativasDeArticulo, articulosPublicados, articulosRevisadosEnEspanol, urlDe } from './guia';

export interface EntradaMapa {
  url: string;
  alternativas: Alternativas;
  actualizado?: Date;
}

export async function paginasIndexables(): Promise<EntradaMapa[]> {
  const entradas: EntradaMapa[] = [];
  const fijas: ClavePagina[] = ['despertar', 'ahora', 'acostarse', 'siesta', 'preguntas', 'metodo', 'acerca', 'privacidad'];
  if (hayAudios) fijas.push('paraDormir');

  for (const clave of fijas) {
    for (const idioma of IDIOMAS) {
      entradas.push({ url: RUTAS[clave][idioma], alternativas: { ...RUTAS[clave] } });
    }
  }

  // Índices de la guía: en/pt solo si tienen algo que mostrar.
  const revisadosEs = await articulosRevisadosEnEspanol();
  const alternativasGuia: Alternativas = { es: RUTAS.guia.es };
  for (const idioma of ['en', 'pt'] as const) {
    if (revisadosEs.length > 0 || (await articulosPublicados(idioma)).length > 0) {
      alternativasGuia[idioma] = RUTAS.guia[idioma];
    }
  }
  for (const url of Object.values(alternativasGuia)) {
    entradas.push({ url: url!, alternativas: alternativasGuia });
  }

  // Artículos revisados (en cualquier idioma).
  const articulos = (await getCollection('guia')).filter((a) => a.data.revisado);
  for (const articulo of articulos) {
    entradas.push({
      url: urlDe(articulo),
      alternativas: await alternativasDeArticulo(articulo),
      actualizado: articulo.data.actualizado,
    });
  }
  return entradas;
}
