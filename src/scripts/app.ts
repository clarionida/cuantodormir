// Comportamiento común a todas las páginas:
// · recuerda el idioma elegido en el selector (ES · EN · PT);
// · sugiere, sin redirigir, la versión en inglés o portugués si el
//   dispositivo está en ese idioma y la persona no ha elegido idioma;
// · avisa cuando no hay conexión;
// · registra el service worker para usar el sitio sin internet;
// · carga los videos de YouTube (sin cookies) solo al tocarlos.
import { guardar, leer } from './almacen';

type Idioma = 'es' | 'en' | 'pt';
const idiomaPagina = (document.body.dataset.idioma || 'es') as Idioma;

// ── Selector de idioma ───────────────────────────────────────────────────
const enlacesIdioma = document.querySelectorAll<HTMLAnchorElement>('a[data-idioma]');
enlacesIdioma.forEach((enlace) => {
  enlace.addEventListener('click', () => {
    guardar('idioma', enlace.dataset.idioma || 'es');
    // En las calculadoras, conserva los datos del cálculo al cambiar de idioma.
    if (document.querySelector('[data-calculadora]') && location.search) {
      enlace.href = enlace.pathname + location.search;
    }
  });
});

// ── Sugerencia de idioma (nunca redirige) ────────────────────────────────
const SUGERENCIAS: Record<'en' | 'pt', { texto: string; cambiar: string; cerrar: string }> = {
  en: { texto: 'This page is also in English', cambiar: 'Switch', cerrar: 'Close' },
  pt: { texto: 'Esta página também está em português', cambiar: 'Mudar', cerrar: 'Fechar' },
};

function idiomaDelDispositivo(): 'en' | 'pt' | null {
  const lista = navigator.languages?.length ? navigator.languages : [navigator.language];
  const principal = (lista[0] || '').toLowerCase();
  if (principal.startsWith('en')) return 'en';
  if (principal.startsWith('pt')) return 'pt';
  return null;
}

(function sugerirIdioma() {
  if (leer('idioma') || leer('sugerencia-cerrada')) return;
  const sugerido = idiomaDelDispositivo();
  if (!sugerido || sugerido === idiomaPagina) return;
  const destino = document.querySelector<HTMLAnchorElement>(`a[data-idioma="${sugerido}"]`);
  const barra = document.querySelector<HTMLElement>('[data-sugerencia]');
  if (!destino || !barra) return;

  const textos = SUGERENCIAS[sugerido];
  const texto = barra.querySelector<HTMLElement>('[data-sugerencia-texto]')!;
  const enlace = barra.querySelector<HTMLAnchorElement>('[data-sugerencia-enlace]')!;
  const cerrar = barra.querySelector<HTMLButtonElement>('[data-sugerencia-cerrar]')!;
  barra.lang = sugerido === 'pt' ? 'pt-BR' : 'en';
  texto.textContent = `${textos.texto} ·`;
  enlace.textContent = textos.cambiar;
  enlace.href = destino.href;
  enlace.hreflang = destino.hreflang;
  enlace.addEventListener('click', () => guardar('idioma', sugerido));
  cerrar.setAttribute('aria-label', textos.cerrar);
  cerrar.addEventListener('click', () => {
    barra.hidden = true;
    guardar('sugerencia-cerrada', '1');
  });
  barra.hidden = false;
})();

// ── Aviso sin conexión ───────────────────────────────────────────────────
const avisoSinConexion = document.querySelector<HTMLElement>('[data-sin-conexion]');
function revisarConexion() {
  if (avisoSinConexion) avisoSinConexion.hidden = navigator.onLine !== false;
}
window.addEventListener('online', revisarConexion);
window.addEventListener('offline', revisarConexion);
revisarConexion();

// ── Service worker (uso sin conexión) ────────────────────────────────────
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((registro) => {
        // Guarda también las otras calculadoras de este idioma.
        const urls = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-pestana]')).map(
          (a) => a.pathname,
        );
        registro.active?.postMessage({ tipo: 'precargar', urls });
      })
      .catch(() => undefined);
  });
}

// ── Videos: el reproductor de youtube-nocookie.com carga solo al tocarlo ─
document.addEventListener('click', (e) => {
  const boton = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-video]');
  if (!boton) return;
  const id = boton.dataset.video || '';
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  const marco = document.createElement('iframe');
  marco.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
  marco.title = boton.dataset.titulo || 'YouTube';
  marco.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  marco.allowFullscreen = true;
  marco.referrerPolicy = 'strict-origin-when-cross-origin';
  boton.replaceWith(marco);
  marco.focus();
});
