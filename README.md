# cuánto dormir

Calculadora de ciclos de sueño en español, inglés y portugués, con una pequeña guía sobre el buen dormir. Sitio: **https://cuantodormir.com**

Esta guía está escrita para ti, aunque nunca hayas programado. Todo se hace desde la página de GitHub, sin instalar nada.

---

## Índice

1. [Revisar y unir (merge) el pull request](#1-revisar-y-unir-merge-el-pull-request)
2. [Activar GitHub Pages](#2-activar-github-pages)
3. [Verificar el dominio en GitHub](#3-verificar-el-dominio-en-github)
4. [Configurar los DNS en Squarespace](#4-configurar-los-dns-en-squarespace)
5. [Conectar el dominio y activar HTTPS](#5-conectar-el-dominio-y-activar-https)
6. [Comprobar que www redirige](#6-comprobar-que-www-redirige)
7. [Google Search Console y Bing Webmaster Tools](#7-google-search-console-y-bing-webmaster-tools)
8. [Cambiar un enlace o un dato en sitio.ts](#8-cambiar-un-enlace-o-un-dato-en-sitiots)
9. [Escribir, editar y revisar artículos](#9-escribir-editar-y-revisar-artículos)
10. [Agregar un video](#10-agregar-un-video)
11. [Subir archivos arrastrándolos](#11-subir-archivos-arrastrándolos)
12. [Qué esperar](#12-qué-esperar)
13. [Problemas comunes](#13-problemas-comunes)
14. [Notas para el futuro](#14-notas-para-el-futuro)
15. [Para personas que programan](#15-para-personas-que-programan)

---

## 1. Revisar y unir (merge) el pull request

Un *pull request* es una propuesta de cambios. Hasta que la unes, el sitio no cambia.

1. Entra a tu repositorio en GitHub: `https://github.com/clarionida/cuantodormir`.
2. Arriba, toca la pestaña **Pull requests** y abre el que dice algo como "Sitio completo de cuánto dormir".
3. En la pestaña **Files changed** puedes ver cada archivo. No necesitas revisar el código; si quieres, mira los textos en `src/i18n/es.json` y los artículos en `src/content/guia/`.
4. Si quieres comentar algo, toca el número de una línea y escribe tu comentario.
5. Cuando estés lista o listo, vuelve a la pestaña **Conversation**, baja hasta el botón verde **Merge pull request** y tócalo. Luego toca **Confirm merge**.
6. Listo: los cambios ya están en la rama `main`. GitHub empezará a publicar el sitio solo (eso lo activas en el paso 2).

> Si el botón dice que hay conflictos, no toques nada y avísame.

---

## 2. Activar GitHub Pages

Solo se hace una vez.

1. En tu repositorio, toca **Settings** (la rueda dentada, arriba a la derecha de las pestañas).
2. En el menú de la izquierda, en la sección *Code and automation*, toca **Pages**.
3. En **Build and deployment → Source**, elige **GitHub Actions** en el menú desplegable.
4. Ve a la pestaña **Actions** del repositorio. Verás el flujo **"Publicar en GitHub Pages"**. Si no ha corrido todavía, tócalo y luego toca el botón **Run workflow → Run workflow**.
5. Espera unos minutos hasta que aparezca una palomita verde ✓. El sitio queda publicado primero en una dirección provisional de GitHub (`https://clarionida.github.io/cuantodormir/`). Ahí algunos enlaces, letras e íconos no funcionan, y es normal: el sitio está hecho para vivir en `cuantodormir.com`. Sigue con los pasos 3 a 5.

---

## 3. Verificar el dominio en GitHub

Esto le demuestra a GitHub que `cuantodormir.com` es tuyo y evita que alguien más lo use con GitHub Pages.

1. Toca tu foto de perfil (arriba a la derecha) → **Settings**.
   - Si el repositorio pertenece a una *organización* llamada clarionida, entra en cambio a la organización → **Settings**.
2. En el menú de la izquierda, en *Code, planning, and automation*, toca **Pages**.
3. Toca **Add a domain**, escribe `cuantodormir.com` y toca **Add domain**.
4. GitHub te mostrará un registro **TXT** con un nombre parecido a `_github-pages-challenge-clarionida` y un valor largo. Déjalo abierto: lo vas a copiar en Squarespace (paso 4).
5. Cuando lo hayas agregado en Squarespace, vuelve aquí y toca **Verify**. Si dice que todavía no lo encuentra, espera un rato (pueden ser horas) y vuelve a intentar.

---

## 4. Configurar los DNS en Squarespace

Los DNS son como la libreta de direcciones de internet: le dicen al mundo dónde vive tu sitio.

1. Entra a Squarespace → **Dominios** (Domains) → toca `cuantodormir.com`.
2. Toca **DNS** → **Configuración de DNS** (DNS Settings).

### 4.1 Borra los registros predeterminados que chocan

Squarespace pone registros que apuntan a sus propios servidores. Si se quedan, chocan con los de GitHub. Borra (con el ícono de papelera o "Eliminar"):

- El grupo **Squarespace Defaults** (Valores predeterminados de Squarespace), si aparece. Suele contener:
  - registros **A** con host `@` que apuntan a direcciones de Squarespace (no a `185.199.x.x`),
  - un **CNAME** con host `www` que apunta a algo de Squarespace (por ejemplo `ext-sq.squarespace.com`),
  - y a veces un registro **HTTPS** o **AAAA** con host `@`.
- Cualquier otro registro **A**, **AAAA**, **ALIAS** o **HTTPS** con host `@`, y cualquier otro **CNAME** con host `www`, que no sean los que vas a crear abajo.

⚠️ **No borres** los registros de correo (**MX**, y los **TXT** de SPF o DKIM) si usas un correo con este dominio. Tampoco borres registros que no entiendas y no estén en la lista de arriba: pregúntame primero.

### 4.2 Agrega los registros de GitHub

Toca **Agregar registro** (Add record) para cada uno:

| Tipo | Host | Valor (apunta a) |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `clarionida.github.io` |
| TXT | el nombre que te dio GitHub en el paso 3 (sin `.cuantodormir.com` al final) | el valor que te dio GitHub |

Si tu usuario de GitHub no es `clarionida`, cambia el CNAME por `<tu-usuario>.github.io`.

Estos valores vienen de la [documentación de GitHub](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

Con estos registros, GitHub redirige `www.cuantodormir.com` a `cuantodormir.com` de forma automática. **No hace falta** configurar reenvíos (forwarding) en Squarespace.

---

## 5. Conectar el dominio y activar HTTPS

1. Vuelve a tu repositorio → **Settings** → **Pages**.
2. En **Custom domain**, escribe `cuantodormir.com` y toca **Save**. (El repositorio ya incluye el archivo `public/CNAME` con ese dominio.)
3. GitHub revisará los DNS. Cuando aparezca "DNS check successful", espera a que se active la casilla **Enforce HTTPS** y márcala.
   - Si la casilla está gris, GitHub todavía está emitiendo el certificado de seguridad. Puede tardar desde minutos hasta 24 horas. Vuelve más tarde.

---

## 6. Comprobar que www redirige

1. Abre `https://cuantodormir.com`: debe aparecer el sitio con el candado 🔒.
2. Abre `https://www.cuantodormir.com`: debe cambiar solo a `https://cuantodormir.com`.
3. Si no funciona todavía, espera: los DNS pueden tardar hasta 48 horas en actualizarse en todo el mundo.

---

## 7. Google Search Console y Bing Webmaster Tools

### Google Search Console

1. Entra a [search.google.com/search-console](https://search.google.com/search-console) con tu cuenta de Google.
2. Toca **Agregar propiedad** → elige **Prefijo de la URL** → escribe `https://cuantodormir.com/` → **Continuar**.
3. Elige el método **Etiqueta HTML**. Verás algo como `<meta name="google-site-verification" content="ABC123…" />`. Copia **solo** lo que está entre las comillas de `content` (por ejemplo `ABC123…`).
4. Pégalo en `src/config/sitio.ts`, en `verificacion: { google: '…' }` (ver el paso 8 para editar el archivo).
5. Espera a que se publique el cambio (unos minutos) y vuelve a Search Console a tocar **Verificar**.
6. En el menú de la izquierda toca **Sitemaps**, escribe `sitemap.xml` y toca **Enviar**.

### Bing Webmaster Tools

1. Entra a [bing.com/webmasters](https://www.bing.com/webmasters).
2. La forma más fácil: elige **Importar desde Google Search Console** y sigue los pasos. Bing importa el sitio y el sitemap.
3. Si prefieres hacerlo a mano: agrega `https://cuantodormir.com/`, elige el método **Meta tag**, copia el valor de `content` y pégalo en `verificacion: { bing: '…' }` en `sitio.ts`. Después envía el sitemap `https://cuantodormir.com/sitemap.xml`.

### IndexNow (avisar a Bing de cada cambio)

Cuando el sitio ya abra bien en `https://cuantodormir.com`, abre `src/config/sitio.ts` y cambia `activo: false` por `activo: true` dentro de `indexNow`. Desde ese momento, cada publicación avisa a Bing de las páginas del sitio.

---

## 8. Cambiar un enlace o un dato en sitio.ts

Todo lo que puedes ajustar está en un solo archivo: **`src/config/sitio.ts`**. Está comentado en español.

1. En GitHub, entra a la carpeta `src` → `config` → toca `sitio.ts`.
2. Toca el lápiz ✏️ (**Edit this file**) arriba a la derecha del archivo.
3. Cambia solo lo que está entre comillas `'…'` o los números. **No borres** comas, llaves `{ }` ni corchetes `[ ]`.
   - Para agregar una red, pega el enlace completo entre las comillas. Por ejemplo: `instagram: 'https://www.instagram.com/clarionida/',`. Las redes vacías `''` no aparecen.
4. Toca el botón verde **Commit changes…**, escribe una frase corta (por ejemplo "Agrego Instagram") y vuelve a tocar **Commit changes**.
5. En la pestaña **Actions** verás la publicación en marcha. En unos minutos el cambio está en línea.

Si algo sale mal, la publicación se detiene con una ✗ roja y el sitio anterior sigue en línea: no se rompe nada. Puedes deshacer el cambio editando de nuevo el archivo.

---

## 9. Escribir, editar y revisar artículos

Los artículos están en **`src/content/guia/`**, uno por archivo `.md` (Markdown).

### Editar un artículo

1. Abre el archivo (por ejemplo `siesta-ideal.md`) y toca el lápiz ✏️.
2. Arriba hay un bloque entre `---` llamado *frontmatter*, con los datos del artículo:

   ```yaml
   titulo: "La siesta ideal: cuánto dura y a qué hora tomarla"
   descripcion: "Texto breve para Google (máximo 155 caracteres)."
   publicado: 2026-11-24
   actualizado: 2026-11-24        # cámbiala cuando edites
   autora: "Clariónida"
   revisado: false                 # true cuando lo revises
   orden: 4                        # orden en el índice de la guía
   calculadora: "siesta"           # despertar, ahora, acostarse o siesta
   esencial:                       # exactamente 3 puntos para "Lo esencial"
     - "Punto 1."
     - "Punto 2."
     - "Punto 3."
   fuentes:
     - titulo: "Autor (año). Título. Revista."
       url: "https://pubmed.ncbi.nlm.nih.gov/…/"   # o "" si falta el enlace
   ```

3. Debajo va el texto. Usa `## Subtítulo` para las secciones, `**negritas**` y enlaces así: `[texto](https://…)`.
4. Guarda con **Commit changes**.

### Marcar un artículo como revisado

Mientras un artículo tenga `revisado: false`:
- se ve en el sitio con un aviso discreto de borrador,
- lleva `noindex` (Google no lo muestra),
- y no aparece en el sitemap.

Cuando lo revises o reescribas, cambia `revisado: false` por `revisado: true`, actualiza la fecha `actualizado` y guarda. Desde ese momento se indexa.

### Escribir un artículo nuevo

1. Entra a `src/content/guia/`, toca **Add file → Create new file**.
2. Escribe el nombre en minúsculas, sin tildes ni espacios, con guiones y terminado en `.md`. Por ejemplo: `respiracion-para-dormir.md`. Ese nombre será la dirección: `cuantodormir.com/guia/respiracion-para-dormir/`.
3. Copia el frontmatter de otro artículo, cambia los datos y escribe el texto.
4. Empieza con un párrafo que responda la pregunta del título en 2 o 3 frases.

### Traducir un artículo (cuando quieras)

Las traducciones van en `src/content/guia/en/` (inglés) y `src/content/guia/pt/` (portugués). Crea ahí un archivo con nombre en ese idioma (por ejemplo `en/what-is-a-sleep-cycle.md`), con el mismo frontmatter traducido y una línea más que diga de qué artículo es traducción:

```yaml
traduccionDe: "ciclo-de-sueno-90-minutos"
```

La traducción solo se publica cuando tiene `revisado: true` (y el original en español también). Entonces aparece en `/en/guide/…` o `/pt/guia/…`, y el selector de idioma y las etiquetas `hreflang` la enlazan solas.

---

## 10. Agregar un video

Los videos (meditaciones, yoga nidra, sonidos) están en **`src/data/audios.json`**. Ahora tiene dos ejemplos marcados `[PENDIENTE]` que el sitio ignora.

### Cómo copiar el ID de un video de YouTube

El ID son los 11 caracteres que identifican el video:
- En `https://www.youtube.com/watch?v=AbCdEfGhIjK`, el ID es `AbCdEfGhIjK` (lo que va después de `v=`, sin incluir `&` ni lo que siga).
- En `https://youtu.be/AbCdEfGhIjK`, el ID es lo que va después de la barra.
- En el celular: toca **Compartir → Copiar enlace**, pégalo en una nota y copia los 11 caracteres.

### Cómo agregarlo

1. Abre `src/data/audios.json` y toca el lápiz ✏️.
2. Cada video es un bloque entre llaves `{ }`, separado del siguiente por una coma:

   ```json
   {
     "titulo": "Yoga nidra de 10 minutos para la tarde",
     "youtubeId": "AbCdEfGhIjK",
     "duracionMin": 10,
     "tipo": "yoga-nidra",
     "canal": "Nombre del canal",
     "idioma": "es"
   }
   ```

   - `tipo` puede ser `"yoga-nidra"`, `"meditacion"`, `"escaneo-corporal"` o `"ambiente"`.
   - `idioma`: `"es"`, `"en"` o `"pt"`.
   - Un **yoga nidra** aparece en la pestaña Siesta, en "Para acompañarte", junto a la siesta cuya duración coincida (con 2 minutos de margen: uno de 10 minutos acompaña la siesta de 10; uno de 20, la de 18).
   - Todos los videos aparecen en la página **Para dormir**, agrupados por tipo. Esa página y su enlace en el pie se muestran solos en cuanto haya al menos un video válido.
3. Puedes borrar los dos ejemplos `[PENDIENTE]` o dejarlos: el sitio los ignora.
4. Guarda con **Commit changes**.

Cada video se ve primero como una tarjeta con botón de reproducir. El reproductor de YouTube (en su versión sin cookies) solo se carga cuando la persona lo toca.

---

## 11. Subir archivos arrastrándolos

Si algún día te paso un archivo nuevo:

1. Entra en GitHub a la carpeta donde va (por ejemplo `src/content/guia/`).
2. Toca **Add file → Upload files**.
3. Arrastra el archivo desde tu computadora a la ventana (o toca *choose your files*).
4. Abajo, escribe una frase corta y toca **Commit changes**.

Si el archivo ya existe con el mismo nombre, se reemplaza.

---

## 12. Qué esperar

- **Cada cambio que guardes en `main` se publica solo** en unos 2 a 5 minutos. Puedes verlo en la pestaña **Actions** (círculo amarillo = trabajando, ✓ verde = publicado, ✗ roja = algo falló y el sitio anterior sigue en línea).
- **Los DNS pueden tardar hasta 48 horas** en funcionar en todo el mundo después de cambiarlos en Squarespace.
- **La casilla "Enforce HTTPS"** se puede marcar cuando GitHub emite el certificado; a veces tarda unas horas.
- Antes de publicar, el sitio se revisa solo: que la calculadora dé los resultados correctos, que los borradores no se indexen y que no se pase del peso máximo.
- Tu navegador puede guardar una copia vieja del sitio. Si no ves un cambio, recarga la página (en el celular, ciérrala y vuelve a abrirla).

---

## 13. Problemas comunes

**La publicación tiene una ✗ roja en Actions.**
Toca la publicación fallida y luego el paso con la ✗. Al final verás un mensaje en español que dice qué falló (por ejemplo, "descripción de 170 caracteres (máximo 155)" o un error en el formato de un archivo). Corrige ese archivo y guarda. Lo más común: una coma o comilla borrada en `sitio.ts` o `audios.json`, o un error en el frontmatter de un artículo (por ejemplo, una comilla sin cerrar).

**GitHub dice "Domain's DNS record could not be retrieved" o "improperly configured".**
Espera unas horas. Si sigue igual, revisa en Squarespace que estén los cuatro registros A y el CNAME de www, y que hayas borrado los de Squarespace (paso 4.1).

**"Enforce HTTPS" está gris.**
GitHub todavía no emite el certificado. Espera hasta 24 horas. Si sigue gris, en Settings → Pages borra el dominio, toca Save, vuelve a escribir `cuantodormir.com` y toca Save otra vez.

**En `clarionida.github.io/cuantodormir/` fallan enlaces, letras o íconos.**
Es normal: el sitio está hecho para `cuantodormir.com`. Conecta el dominio (pasos 3 a 5).

**Cambié algo y no lo veo.**
Revisa que la publicación terminó con ✓ en Actions. Luego recarga la página. Como el sitio funciona sin conexión, puede mostrar la copia guardada la primera vez; la siguiente carga trae la nueva.

**Un artículo no aparece en Google.**
Revisa que tenga `revisado: true`. Después, Google puede tardar días o semanas en mostrarlo. En Search Console puedes pedir que lo revise con **Inspección de URLs → Solicitar indexación**.

**En la pantalla de inicio del celular el nombre aparece cortado.**
En `src/lib/manifest.ts`, cambia `short_name: sitio.marca` por `short_name: 'dormir'`.

---

## 14. Notas para el futuro

- **Repositorio privado:** GitHub Pages gratis requiere que el repositorio sea público. Si algún día lo quieres privado, las alternativas son GitHub Pro (de pago) o publicar en Cloudflare Pages (gratis), que también funciona con este proyecto.
- **Estadísticas sin cookies:** en `sitio.ts` puedes activar Cloudflare Web Analytics o GoatCounter (sección `analitica`). Si lo haces, actualiza también la página de privacidad (`src/content/paginas/*/privacidad.md`).
- **Páginas por hora** (`/despertar-a-las-6-am/`…): no las creamos todavía, porque sin una introducción propia serían páginas repetidas. La tabla de ejemplo de cada calculadora ya cubre esas horas.

---

## 15. Para personas que programan

Requisitos: Node 22.12 o más reciente.

```bash
npm install
```

```bash
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

```bash
npm run preview
```

- `npm run build` genera la marca (`scripts/generar-marca.mjs`), compila con Astro y verifica el resultado (`scripts/verificar-build.mjs`).
- Las pruebas están en `tests/` (Vitest): los cuatro casos del documento del proyecto, la medianoche, el horario de verano y las claves de traducción.

### Estructura

```
src/
  config/sitio.ts          Configuración editable (enlaces, ciclos, verificación…)
  i18n/es.json, en.json, pt.json   Textos de la interfaz
  i18n/rutas.ts            Rutas por idioma (selector, hreflang, sitemap)
  content/guia/*.md        Artículos (español); traducciones en guia/en y guia/pt
  content/paginas/<idioma>/  Método, Acerca, Privacidad y textos bajo cada calculadora
  content/preguntas/<idioma>.yaml  Preguntas frecuentes
  data/audios.json         Videos elegidos (YouTube)
  lib/calculo.ts           Núcleo de cálculo (fechas reales, sin texto)
  lib/hora.ts              Formatos de hora por idioma
  scripts/                 JavaScript del navegador (calculadora, ruedas, idioma…)
  components/, layouts/, pages/   Plantillas de Astro
  styles/global.css        Diseño (paleta en variables CSS)
  marca/simbolo.mjs        Símbolo del logo
scripts/                   Generación de íconos, verificación e IndexNow
public/                    CNAME, favicon.svg, logo.svg, clave de IndexNow
.github/workflows/deploy.yml   Publicación automática
```
