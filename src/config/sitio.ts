// ─────────────────────────────────────────────────────────────────────────────
//  CONFIGURACIÓN DE cuánto dormir
//  Este es el único archivo que necesitas tocar para cambiar enlaces,
//  redes, duraciones y códigos de verificación.
//
//  Cómo editarlo desde github.com:
//  1. Abre este archivo en GitHub y toca el lápiz (✏️ "Edit this file").
//  2. Cambia SOLO lo que está entre comillas '…' o los números.
//     No borres comas, llaves { } ni corchetes [ ].
//  3. Abajo, toca "Commit changes…" y luego otra vez "Commit changes".
//     En unos minutos el sitio se publica solo.
// ─────────────────────────────────────────────────────────────────────────────

export const sitio = {
  // Dominio principal, sin barra al final. www.cuantodormir.com redirige aquí.
  dominio: 'https://cuantodormir.com',

  // Nombre de la marca. Siempre en minúsculas y con tilde. No se traduce.
  marca: 'cuánto dormir',

  // Quién hace el sitio (aparece en el pie, en "Acerca" y como autora).
  autora: 'Clariónida',

  // ── Enlaces ────────────────────────────────────────────────────────────────
  enlaces: {
    // Linktree con todas las redes. Siempre visible en el pie y en "Acerca".
    linktree: 'https://linktr.ee/clarionida',

    // Enlace de donación de Stripe ("Invitar un té").
    donacion: 'https://donate.stripe.com/bJeeVfgHU7Npa1A59ocAo00',
  },

  // ── Redes opcionales ───────────────────────────────────────────────────────
  // Pega el enlace completo entre las comillas (por ejemplo
  // 'https://www.instagram.com/clarionida/'). Las que queden vacías '' no
  // aparecen en el sitio. Se muestran en este orden.
  redes: {
    instagram: 'https://www.instagram.com/clarionida/',
    tiktok: 'https://www.tiktok.com/@clarionida?lang=es',
    youtube: 'https://www.youtube.com/@clarionida',
    x: 'https://x.com/clarionida',
    threads: '',
    bluesky: '',
    facebook: 'https://www.facebook.com/clarionida',
    pinterest: '',
    spotify: '',
  },

  // ── Calculadora ────────────────────────────────────────────────────────────
  calculadora: {
    // Duración de un ciclo de sueño, en minutos (promedio usado por defecto).
    cicloMin: 90,

    // Límites del enlace "Ajustar mi ciclo" (en minutos).
    cicloMinimo: 80,
    cicloMaximo: 110,

    // Duraciones de siesta, en minutos. La última (90) es un ciclo completo.
    siestasMin: [10, 18, 25, 90],

    // Cuántos ciclos se calculan en las pestañas de noche (de 1 a 6).
    ciclosMaximos: 6,

    // A partir de cuántos ciclos una opción lleva la etiqueta "Recomendado".
    ciclosRecomendados: 5,

    // Valores por defecto.
    despertarPorDefecto: '08:00', // 8:00 a. m. (formato de 24 horas: HH:MM)
    acostarsePorDefecto: '22:00', // 10:00 p. m.
    latenciaPorDefecto: 15, // minutos que se tarda en dormirse
    latenciaMinima: 1,
    latenciaMaxima: 120,

    // Minutos tras los cuales aparece "Recalcular con la hora de ahora".
    minutosParaRecalcular: 5,
  },

  // ── Verificación de buscadores ─────────────────────────────────────────────
  // Pega aquí SOLO el código (el valor de content="…") que te den:
  verificacion: {
    // Google Search Console → método "Etiqueta HTML".
    google: '',
    // Bing Webmaster Tools → método "Meta tag" (msvalidate.01).
    bing: '',
  },

  // ── IndexNow (avisa a Bing de cada cambio) ─────────────────────────────────
  // La clave es pública por diseño; su archivo está en public/<clave>.txt.
  // Cambia activo a true cuando el dominio ya abra bien con https.
  indexNow: {
    activo: false,
    clave: '6ce26cb303bfb8f7252c1bf1a2edab5f',
  },

  // ── Analítica opcional (apagada) ───────────────────────────────────────────
  // Ninguna de estas opciones usa cookies. Para activarla:
  //  · Cloudflare Web Analytics: proveedor: 'cloudflare' y pega el token.
  //  · GoatCounter: proveedor: 'goatcounter' y pega tu código
  //    (lo que va antes de .goatcounter.com).
  // Déjalo en null para no medir nada.
  analitica: {
    proveedor: null as null | 'cloudflare' | 'goatcounter',
    cloudflareToken: '',
    goatcounterCodigo: '',
  },

  // Colores de la marca (iguales a las variables CSS).
  colores: {
    fondo: '#0E1530',
    acento: '#E2C27D',
  },
} as const;

export type Sitio = typeof sitio;
