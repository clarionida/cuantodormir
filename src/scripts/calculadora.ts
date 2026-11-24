// Calculadora: lee las ruedas, calcula, muestra los resultados, actualiza la
// URL (para que "atrás", recargar y compartir funcionen) y recuerda las
// preferencias en el dispositivo.
import {
  acotar,
  alMinuto,
  escribirHora,
  horaDe,
  horasDeSiesta,
  horasParaAcostarse,
  horasParaDespertar,
  leerHora,
  proximaVez,
  ultimaVez,
  type HoraMinuto,
  type Opcion,
} from '../lib/calculo';
import {
  formatearDuracion,
  formatearHora,
  hora12,
  horaEnSingular,
  rellenar,
  type Idioma,
} from '../lib/hora';
import { guardar, leer } from './almacen';
import { iniciarBurbujas } from './burbuja';
import { Rueda } from './rueda';

type Pestana = 'despertar' | 'ahora' | 'acostarse' | 'siesta';

interface Datos {
  idioma: Idioma;
  pestana: Pestana;
  config: {
    ciclo: number;
    cicloMin: number;
    cicloMax: number;
    siestas: number[];
    ciclosMaximos: number;
    ciclosRecomendados: number;
    latencia: number;
    latenciaMin: number;
    latenciaMax: number;
    hora: string | null;
    minutosRecalcular: number;
  };
  t: {
    relojPlural: string;
    relojSingular: string;
    calculadoPlural: string;
    calculadoSingular: string;
    ciclos: string;
    ciclo: string;
    siesta: string;
    recomendado: string;
    yaPaso: string;
    notaLatencia: string;
    valorLatencia: string;
    siestas: Record<string, string>;
    despedidas: string[];
    copiado: string;
    compartirTitulo: string;
    titulo: string;
    unidad: string;
  };
}

interface Estado {
  /** Hora elegida (despertar o acostarse) o momento del cálculo (ahora/siesta). */
  hora: HoraMinuto;
  latencia: number;
  ciclo: number;
}

const raiz = document.querySelector<HTMLElement>('[data-calculadora]');
const nodoDatos = document.getElementById('cd-datos');

if (raiz && nodoDatos) {
  iniciar(raiz, JSON.parse(nodoDatos.textContent || '{}') as Datos);
}

function iniciar(raiz: HTMLElement, datos: Datos): void {
  const { idioma, pestana, config, t } = datos;
  const usaHoraElegida = pestana === 'despertar' || pestana === 'acostarse';
  const claveUrl = usaHoraElegida ? pestana : 'desde';
  const reducido = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = <T extends HTMLElement>(selector: string) => raiz.querySelector<T>(selector);
  const formulario = $<HTMLFormElement>('[data-formulario]')!;
  const seccion = $<HTMLElement>('[data-resultados]')!;
  const titulo = $<HTMLElement>('[data-titulo-resultados]')!;
  const lista = $<HTMLOListElement>('[data-tarjetas]')!;
  const notaLatencia = $<HTMLElement>('[data-nota-latencia]')!;
  const despedida = $<HTMLElement>('[data-despedida]')!;
  const calculado = $<HTMLElement>('[data-calculado]');
  const anuncio = $<HTMLElement>('[data-anuncio]')!;
  const estadoCompartir = $<HTMLElement>('[data-estado-compartir]')!;
  const botonRecalcular = $<HTMLButtonElement>('[data-accion="recalcular"]');
  const reloj = $<HTMLElement>('[data-reloj]');
  const rangoCiclo = $<HTMLInputElement>('[data-ciclo]');
  const salidaCiclo = $<HTMLOutputElement>('[data-ciclo-valor]');

  let cargando = true;
  let calculadoEn: Date | null = null;

  // ── Ruedas ────────────────────────────────────────────────────────────────
  const nodoHora = $<HTMLElement>('[data-rueda="hora"]');
  const ruedaHora = nodoHora
    ? new Rueda(nodoHora, (v) => formatearHora(desdeRueda(v), idioma))
    : null;
  const ruedaLatencia = new Rueda($<HTMLElement>('[data-rueda="latencia"]')!, (v) =>
    rellenar(t.valorLatencia, { x: v.lat }),
  );

  function desdeRueda(v: Record<string, number>): HoraMinuto {
    if (idioma === 'pt') return { h: v.h, m: v.m };
    return { h: (v.h % 12) + (v.p ? 12 : 0), m: v.m };
  }
  function haciaRueda(hora: HoraMinuto): Record<string, number> {
    const m = Math.min(55, Math.round(hora.m / 5) * 5);
    if (idioma === 'pt') return { h: hora.h, m };
    return { h: hora12(hora.h), m, p: hora.h >= 12 ? 1 : 0 };
  }

  const leerCiclo = () => (rangoCiclo ? Number(rangoCiclo.value) : config.ciclo);
  function fijarCiclo(valor: number) {
    if (!rangoCiclo) return;
    rangoCiclo.value = String(valor);
    mostrarCiclo();
  }
  function mostrarCiclo() {
    if (salidaCiclo && rangoCiclo) salidaCiclo.value = `${rangoCiclo.value} ${t.unidad}`;
  }

  // Guardar en el dispositivo cada cambio (latencia compartida entre pestañas).
  ruedaLatencia.alCambiar = () => {
    if (!cargando) guardar('latencia', String(ruedaLatencia.valores().lat));
  };
  if (ruedaHora) {
    ruedaHora.alCambiar = () => {
      if (!cargando) guardar(`hora-${pestana}`, escribirHora(desdeRueda(ruedaHora.valores())));
    };
  }
  rangoCiclo?.addEventListener('input', () => {
    mostrarCiclo();
    guardar('ciclo', rangoCiclo.value);
  });
  $<HTMLButtonElement>('[data-ciclo-restablecer]')?.addEventListener('click', () => {
    fijarCiclo(config.ciclo);
    guardar('ciclo', String(config.ciclo));
  });

  // ── Estado desde la URL, el dispositivo o los valores por defecto ────────
  function estadoDeLaUrl(): Estado | null {
    const p = new URLSearchParams(location.search);
    const hora = leerHora(p.get(claveUrl));
    if (!hora) return null;
    return {
      hora,
      latencia: acotar(Number(p.get('latencia') ?? config.latencia), config.latenciaMin, config.latenciaMax),
      ciclo: acotar(Number(p.get('ciclo') ?? config.ciclo), config.cicloMin, config.cicloMax),
    };
  }

  function estadoGuardado(): Estado {
    const hora = leerHora(leer(`hora-${pestana}`)) ?? leerHora(config.hora) ?? horaDe(new Date());
    const latencia = Number(leer('latencia') ?? config.latencia);
    const ciclo = Number(leer('ciclo') ?? config.ciclo);
    return {
      hora,
      latencia: acotar(latencia, config.latenciaMin, config.latenciaMax),
      ciclo: acotar(ciclo, config.cicloMin, config.cicloMax),
    };
  }

  function aplicarEnFormulario(estado: Estado) {
    const antes = cargando;
    cargando = true;
    if (ruedaHora && usaHoraElegida) ruedaHora.fijar(haciaRueda(estado.hora));
    ruedaLatencia.fijar({ lat: estado.latencia });
    fijarCiclo(estado.ciclo);
    cargando = antes;
  }

  function estadoDelFormulario(): Estado {
    return {
      hora: ruedaHora && usaHoraElegida ? desdeRueda(ruedaHora.valores()) : horaDe(new Date()),
      latencia: ruedaLatencia.valores().lat,
      ciclo: leerCiclo(),
    };
  }

  function urlDe(estado: Estado): string {
    let consulta = `?${claveUrl}=${escribirHora(estado.hora)}&latencia=${estado.latencia}`;
    if (estado.ciclo !== config.ciclo) consulta += `&ciclo=${estado.ciclo}`;
    return location.pathname + consulta;
  }

  // ── Cálculo ──────────────────────────────────────────────────────────────
  function calcular(estado: Estado, ahora: Date): { opciones: Opcion[]; inicio: Date } {
    const ajustes = {
      cicloMin: estado.ciclo,
      latenciaMin: estado.latencia,
      ciclosMaximos: config.ciclosMaximos,
      ciclosRecomendados: config.ciclosRecomendados,
    };
    if (pestana === 'despertar') {
      const despertar = proximaVez(estado.hora, ahora);
      return { opciones: horasParaAcostarse(despertar, ajustes, ahora), inicio: ahora };
    }
    if (pestana === 'acostarse') {
      const inicio = proximaVez(estado.hora, ahora);
      return { opciones: horasParaDespertar(inicio, ajustes), inicio };
    }
    const inicio = ultimaVez(estado.hora, alMinuto(ahora));
    if (pestana === 'ahora') return { opciones: horasParaDespertar(inicio, ajustes), inicio };
    // Siesta: la de un ciclo completo usa la duración de ciclo elegida.
    const duraciones = config.siestas.map((d) => (d === config.ciclo ? estado.ciclo : d));
    return { opciones: horasDeSiesta(inicio, estado.latencia, duraciones), inicio };
  }

  // ── Resultados ───────────────────────────────────────────────────────────
  const fechaIso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${escribirHora(horaDe(d))}`;

  function crear<K extends keyof HTMLElementTagNameMap>(etiqueta: K, clase: string, texto?: string) {
    const el = document.createElement(etiqueta);
    el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  function tarjeta(o: Opcion, indice: number): HTMLLIElement {
    const li = crear('li', 'tarjeta');
    if (o.recomendado) li.classList.add('tarjeta--recomendada');
    if (o.pasada) li.classList.add('tarjeta--pasada');
    li.style.animationDelay = reducido() ? '0ms' : `${indice * 40}ms`;

    const hora = crear('p', 'tarjeta-hora');
    const tiempo = crear('time', '', formatearHora(o.fecha, idioma));
    tiempo.setAttribute('datetime', fechaIso(o.fecha));
    hora.append(tiempo);
    li.append(hora);

    const duracion = formatearDuracion(o.minutosSueno, idioma);
    const linea =
      o.siestaMin !== undefined
        ? rellenar(t.siesta, { duracion })
        : rellenar(o.ciclos === 1 ? t.ciclo : t.ciclos, { n: o.ciclos ?? 0, duracion });
    li.append(crear('p', 'tarjeta-linea', linea));

    if (o.siestaMin !== undefined) {
      const clave = String(config.siestas[indice] ?? o.siestaMin);
      const honesta = t.siestas[clave];
      if (honesta) li.append(crear('p', 'tarjeta-siesta', honesta));
    }

    if (o.recomendado || o.pasada) {
      const etiquetas = crear('p', 'etiquetas');
      if (o.recomendado) etiquetas.append(crear('span', 'etiqueta etiqueta--rec', t.recomendado));
      if (o.pasada) etiquetas.append(crear('span', 'etiqueta etiqueta--paso', t.yaPaso));
      li.append(etiquetas);
    }
    return li;
  }

  function frase(plural: string, singular: string, fecha: Date): string {
    return rellenar(horaEnSingular(fecha, idioma) ? singular : plural, {
      hora: formatearHora(fecha, idioma),
    });
  }

  function mostrar(estado: Estado, opciones: { enfocar: boolean; desplazar: boolean }) {
    const ahora = new Date();
    const { opciones: lista_, inicio } = calcular(estado, ahora);
    lista.replaceChildren(...lista_.map(tarjeta));
    lista.classList.toggle('tarjetas--rejilla', pestana !== 'siesta');

    notaLatencia.textContent = rellenar(t.notaLatencia, { x: estado.latencia });
    despedida.textContent = t.despedidas[Math.floor(Math.random() * t.despedidas.length)];
    estadoCompartir.textContent = '';

    calculadoEn = usaHoraElegida ? null : inicio;
    if (calculado) {
      calculado.hidden = usaHoraElegida;
      if (!usaHoraElegida) calculado.textContent = frase(t.calculadoPlural, t.calculadoSingular, inicio);
    }
    revisarRecalcular();

    seccion.hidden = false;
    // Anuncio para lectores de pantalla.
    anuncio.textContent = '';
    window.setTimeout(() => {
      anuncio.textContent = `${t.titulo}: ${lista_.map((o) => formatearHora(o.fecha, idioma)).join(', ')}.`;
    }, 120);

    if (opciones.desplazar) {
      seccion.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' });
    }
    if (opciones.enfocar) titulo.focus({ preventScroll: true });
  }

  function ocultar() {
    seccion.hidden = true;
    lista.replaceChildren();
    calculadoEn = null;
    anuncio.textContent = '';
    if (botonRecalcular) botonRecalcular.hidden = true;
  }

  function revisarRecalcular() {
    if (!botonRecalcular) return;
    const pasados = calculadoEn ? (Date.now() - calculadoEn.getTime()) / 60000 : 0;
    botonRecalcular.hidden = !(calculadoEn && pasados > config.minutosRecalcular);
  }

  // ── Reloj ("Ahora son las 11:42 p. m.") ─────────────────────────────────
  function actualizarReloj() {
    if (!reloj) return;
    reloj.textContent = frase(t.relojPlural, t.relojSingular, new Date());
    reloj.hidden = false;
  }
  function programarReloj() {
    actualizarReloj();
    revisarRecalcular();
    const ahora = new Date();
    const espera = 60_000 - (ahora.getSeconds() * 1000 + ahora.getMilliseconds()) + 50;
    window.setTimeout(programarReloj, espera);
  }
  programarReloj();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      actualizarReloj();
      revisarRecalcular();
    }
  });

  // ── Acciones ─────────────────────────────────────────────────────────────
  function navegar(url: string) {
    if (url === location.pathname + location.search) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
  }

  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const estado = estadoDelFormulario();
    guardar('latencia', String(estado.latencia));
    guardar('ciclo', String(estado.ciclo));
    if (usaHoraElegida) guardar(`hora-${pestana}`, escribirHora(estado.hora));
    navegar(urlDe(estado));
    mostrar(estado, { enfocar: true, desplazar: true });
  });

  raiz.addEventListener('click', (e) => {
    const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-accion]');
    if (!boton) return;
    const accion = boton.dataset.accion;

    if (accion === 'cambiar') {
      formulario.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' });
      (ruedaHora ?? ruedaLatencia).enfocar();
    }

    if (accion === 'nueva') {
      const porDefecto: Estado = {
        hora: leerHora(config.hora) ?? horaDe(new Date()),
        latencia: config.latencia,
        ciclo: config.ciclo,
      };
      aplicarEnFormulario(porDefecto);
      guardar('latencia', String(porDefecto.latencia));
      guardar('ciclo', String(porDefecto.ciclo));
      if (usaHoraElegida) guardar(`hora-${pestana}`, escribirHora(porDefecto.hora));
      navegar(location.pathname);
      ocultar();
      formulario.scrollIntoView({ behavior: reducido() ? 'auto' : 'smooth', block: 'start' });
      (ruedaHora ?? ruedaLatencia).enfocar();
    }

    if (accion === 'compartir') {
      const url = location.href;
      if (typeof navigator.share === 'function') {
        navigator.share({ title: t.compartirTitulo, url }).catch(() => undefined);
      } else if (navigator.clipboard) {
        navigator.clipboard
          .writeText(url)
          .then(() => (estadoCompartir.textContent = t.copiado))
          .catch(() => (estadoCompartir.textContent = url));
      } else {
        estadoCompartir.textContent = url;
      }
    }

    if (accion === 'recalcular') {
      const estado = { ...estadoDelFormulario(), hora: horaDe(new Date()) };
      navegar(urlDe(estado));
      mostrar(estado, { enfocar: true, desplazar: false });
    }
  });

  // Botón "atrás" y "adelante" del navegador.
  window.addEventListener('popstate', () => {
    const estado = estadoDeLaUrl();
    if (estado) {
      aplicarEnFormulario(estado);
      mostrar(estado, { enfocar: false, desplazar: false });
    } else {
      aplicarEnFormulario(estadoGuardado());
      ocultar();
    }
  });

  // ── Arranque ─────────────────────────────────────────────────────────────
  const desdeUrl = estadoDeLaUrl();
  aplicarEnFormulario(desdeUrl ?? estadoGuardado());
  if (desdeUrl) mostrar(desdeUrl, { enfocar: false, desplazar: true });
  cargando = false;

  iniciarBurbujas();
}
