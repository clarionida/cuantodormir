// robots.txt: se permite todo, y se nombra de forma explícita a los
// buscadores y a los rastreadores de IA (búsqueda, entrenamiento y consultas
// de personas usuarias). Bloquear los de búsqueda reduce la visibilidad.
import type { APIRoute } from 'astro';
import { sitio } from '../config/sitio';

const bots = [
  'Googlebot',
  'Bingbot',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
];

export const GET: APIRoute = () => {
  const grupos = bots.map((bot) => `User-agent: ${bot}\nAllow: /`).join('\n\n');
  const texto = `# robots.txt de ${sitio.marca}
# Todo el sitio está abierto a buscadores y asistentes de IA.

${grupos}

User-agent: *
Allow: /

Sitemap: ${sitio.dominio}/sitemap.xml
`;
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
