// Datos estructurados (JSON-LD). Siempre coherentes con el texto visible.
import { sitio } from '../config/sitio';
import type { Idioma } from './hora';

const ORG_ID = `${sitio.dominio}/#organizacion`;
const SITIO_ID = `${sitio.dominio}/#sitio`;

const IDIOMA_ISO: Record<Idioma, string> = { es: 'es', en: 'en', pt: 'pt-BR' };

export function idiomaIso(idioma: Idioma): string {
  return IDIOMA_ISO[idioma];
}

/** Enlaces a redes: Linktree y las que tengan enlace en sitio.ts. */
export function enlacesSociales(): string[] {
  return [sitio.enlaces.linktree, ...Object.values(sitio.redes).filter((url) => url)];
}

export function esquemaOrganizacion() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: sitio.autora,
    url: `${sitio.dominio}/acerca/`,
    logo: `${sitio.dominio}/icon-512.png`,
    sameAs: enlacesSociales(),
  };
}

export function esquemaSitioWeb() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': SITIO_ID,
    name: sitio.marca,
    url: `${sitio.dominio}/`,
    inLanguage: ['es', 'en', 'pt-BR'],
    publisher: { '@id': ORG_ID },
  };
}

export function esquemaAplicacion(opciones: {
  nombre: string;
  descripcion: string;
  url: string;
  idioma: Idioma;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: opciones.nombre,
    description: opciones.descripcion,
    url: new URL(opciones.url, sitio.dominio).href,
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    browserRequirements: 'Requires JavaScript',
    inLanguage: idiomaIso(opciones.idioma),
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    creator: { '@id': ORG_ID },
    isPartOf: { '@id': SITIO_ID },
  };
}

export function esquemaArticulo(opciones: {
  titulo: string;
  descripcion: string;
  url: string;
  idioma: Idioma;
  publicado: Date;
  actualizado: Date;
  fuentes: { titulo: string; url?: string }[];
  palabras: number;
}) {
  const url = new URL(opciones.url, sitio.dominio).href;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opciones.titulo,
    description: opciones.descripcion,
    url,
    mainEntityOfPage: url,
    inLanguage: idiomaIso(opciones.idioma),
    datePublished: opciones.publicado.toISOString().slice(0, 10),
    dateModified: opciones.actualizado.toISOString().slice(0, 10),
    wordCount: opciones.palabras,
    image: `${sitio.dominio}/og-image.png`,
    author: { '@id': ORG_ID, '@type': 'Organization', name: sitio.autora, url: `${sitio.dominio}/acerca/` },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': SITIO_ID },
    citation: opciones.fuentes.map((f) =>
      f.url
        ? { '@type': 'CreativeWork', name: f.titulo, url: f.url }
        : { '@type': 'CreativeWork', name: f.titulo },
    ),
  };
}

export function esquemaMigas(elementos: { nombre: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: elementos.map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: e.nombre,
      item: new URL(e.url, sitio.dominio).href,
    })),
  };
}

export function esquemaPreguntas(preguntas: { pregunta: string; respuestaTexto: string }[], idioma: Idioma) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    inLanguage: idiomaIso(idioma),
    mainEntity: preguntas.map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuestaTexto },
    })),
  };
}
