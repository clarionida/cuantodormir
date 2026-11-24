// Utilidades de texto para las preguntas frecuentes (Markdown mínimo:
// párrafos separados por una línea en blanco y enlaces [texto](url)).

const escapar = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Markdown mínimo → HTML seguro. */
export function markdownMinimo(texto: string): string {
  return texto
    .trim()
    .split(/\n\s*\n/)
    .map((parrafo) => {
      const html = escapar(parrafo.trim().replace(/\s*\n\s*/g, ' '))
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t: string, u: string) => {
          const externo = /^https?:/.test(u);
          return `<a href="${u}"${externo ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`;
        })
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      return `<p>${html}</p>`;
    })
    .join('');
}

/** Markdown mínimo → texto plano (para JSON-LD). */
export function textoPlano(texto: string): string {
  return texto
    .trim()
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\s*\n\s*\n\s*/g, ' ')
    .replace(/\s*\n\s*/g, ' ');
}

/** Número de palabras de un texto Markdown (sin frontmatter). */
export function contarPalabras(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .split(/\s+/)
    .filter((p) => /[\p{L}\p{N}]/u.test(p)).length;
}

/** Minutos de lectura (unas 200 palabras por minuto). */
export function minutosDeLectura(palabras: number): number {
  return Math.max(1, Math.round(palabras / 200));
}

/** Fecha larga en el idioma indicado, sin cambiar de día por la zona horaria. */
export function fechaLarga(fecha: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' }).format(fecha);
}
