// Configuración de Astro. No necesitas tocar este archivo:
// los datos del sitio (dominio, enlaces, ciclos…) están en src/config/sitio.ts
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://cuantodormir.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // El CSS va dentro de cada página: así nada bloquea el primer pintado
    // y la pantalla nunca parpadea en blanco.
    inlineStylesheets: 'always',
    assets: '_astro',
  },
  compressHTML: true,
  prefetch: false,
  devToolbar: { enabled: false },
});
