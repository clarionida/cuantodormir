// Colecciones de contenido.
//  · guia:      artículos en Markdown. Español en src/content/guia/*.md;
//               traducciones futuras en src/content/guia/en/ y guia/pt/.
//  · paginas:   textos largos de páginas (método, acerca, privacidad y el
//               bloque explicativo bajo cada calculadora), por idioma.
//  · preguntas: preguntas frecuentes, un archivo .yaml por idioma.
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const fuente = z.object({
  titulo: z.string(),
  // Déjalo vacío ("") si aún no tienes el enlace: se mostrará [ENLACE PENDIENTE].
  url: z.string().optional().default(''),
});

const guia = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guia' }),
  schema: z.object({
    titulo: z.string(),
    descripcion: z.string().max(160),
    publicado: z.coerce.date(),
    actualizado: z.coerce.date(),
    autora: z.string().default('Clariónida'),
    // false = borrador: lleva noindex, no aparece en el sitemap y muestra un aviso.
    revisado: z.boolean().default(false),
    fuentes: z.array(fuente).default([]),
    esencial: z.array(z.string()).max(3).default([]),
    calculadora: z.enum(['despertar', 'ahora', 'acostarse', 'siesta']).default('despertar'),
    orden: z.number().default(99),
    // Solo para traducciones (archivos en guia/en/ o guia/pt/):
    // el nombre del archivo en español del que es traducción.
    traduccionDe: z.string().optional(),
  }),
});

const paginas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/paginas' }),
  schema: z.object({
    titulo: z.string(),
    metaTitulo: z.string().optional(),
    descripcion: z.string().max(160).optional(),
    intro: z.string().optional(),
  }),
});

const preguntas = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/preguntas' }),
  schema: z.object({
    preguntas: z.array(z.object({ pregunta: z.string(), respuesta: z.string() })),
  }),
});

export const collections = { guia, paginas, preguntas };
