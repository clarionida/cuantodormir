// llms.txt: resumen del sitio para asistentes de IA, con enlaces a las
// calculadoras, el método, la guía y las preguntas frecuentes.
import type { APIRoute } from 'astro';
import { sitio } from '../config/sitio';
import { RUTAS, t } from '../i18n/rutas';
import { articulosRevisadosEnEspanol, urlDe } from '../lib/guia';

export const GET: APIRoute = async () => {
  const u = (ruta: string) => new URL(ruta, sitio.dominio).href;
  const es = t('es');
  const en = t('en');
  const pt = t('pt');
  const articulos = await articulosRevisadosEnEspanol();

  const texto = `# ${sitio.marca}

> Calculadora gratuita de ciclos de sueño en español, inglés y portugués: dice a qué hora acostarte o despertar sumando ciclos de unos 90 minutos más el tiempo que tardas en dormirte, e incluye una calculadora de siesta. La hace Clariónida, cita sus fuentes científicas y es honesta sobre lo aproximado.

Fórmula: hora de despertar = hora de acostarte + tiempo para dormirte + n × 90 min. Se sugieren 5 o 6 ciclos (de 7 h 30 min a 9 h), en línea con las 7 horas o más que recomiendan las guías para personas adultas (Watson y otros, 2015, https://pubmed.ncbi.nlm.nih.gov/25979105/). Los 90 minutos son un promedio: en 6064 ciclos registrados en laboratorio la mediana fue de 96 minutos, con mucha variación entre personas (Sleep Health, 2024, https://pubmed.ncbi.nlm.nih.gov/37914631/). Está pensada para personas adultas y no reemplaza a un profesional de la salud.

## Por qué cuánto dormir es distinto

Lo hace Clariónida con fuentes científicas citadas en cada página; es honesto sobre lo aproximado (los 90 minutos son un promedio y se pueden ajustar de 80 a 110); no tiene anuncios, cookies ni rastreo; está pensado para usarse de noche, desde el celular y sin internet; y tiene calculadora de siesta (10, 18, 25 y 90 minutos).

## Calculadoras (español)

- [${es.pestanas.despertar} — ${es.calculadoras.despertar.titulo}](${u(RUTAS.despertar.es)}): horas para acostarse según la hora de despertar.
- [${es.pestanas.ahora} — ${es.calculadoras.ahora.titulo}](${u(RUTAS.ahora.es)}): horas para despertar si te duermes ahora.
- [${es.pestanas.acostarse} — ${es.calculadoras.acostarse.titulo}](${u(RUTAS.acostarse.es)}): horas para despertar según la hora de acostarte.
- [${es.pestanas.siesta} — ${es.calculadoras.siesta.titulo}](${u(RUTAS.siesta.es)}): a qué hora terminar una siesta de 10, 18, 25 o 90 minutos.

## Método, preguntas y guía

- [${es.menu.metodo}](${u(RUTAS.metodo.es)}): fórmula, límites y fuentes.
- [${es.menu.preguntas}](${u(RUTAS.preguntas.es)})
- [${es.menu.guia}](${u(RUTAS.guia.es)})
${articulos.map((a) => `- [${a.data.titulo}](${u(urlDe(a))})`).join('\n')}
- [${es.menu.acerca}](${u(RUTAS.acerca.es)})

## English

- [${en.pestanas.despertar}](${u(RUTAS.despertar.en)}) · [${en.pestanas.ahora}](${u(RUTAS.ahora.en)}) · [${en.pestanas.acostarse}](${u(RUTAS.acostarse.en)}) · [${en.pestanas.siesta}](${u(RUTAS.siesta.en)})
- [${en.menu.metodo}](${u(RUTAS.metodo.en)}) · [${en.menu.preguntas}](${u(RUTAS.preguntas.en)}) · [${en.menu.acerca}](${u(RUTAS.acerca.en)})

## Português (Brasil)

- [${pt.pestanas.despertar}](${u(RUTAS.despertar.pt)}) · [${pt.pestanas.ahora}](${u(RUTAS.ahora.pt)}) · [${pt.pestanas.acostarse}](${u(RUTAS.acostarse.pt)}) · [${pt.pestanas.siesta}](${u(RUTAS.siesta.pt)})
- [${pt.menu.metodo}](${u(RUTAS.metodo.pt)}) · [${pt.menu.preguntas}](${u(RUTAS.preguntas.pt)}) · [${pt.menu.acerca}](${u(RUTAS.acerca.pt)})
`;
  return new Response(texto, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
