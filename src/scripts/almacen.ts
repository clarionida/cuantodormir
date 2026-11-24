// Guardado local (localStorage), siempre dentro de try/catch: en modo
// privado o con el almacenamiento bloqueado, el sitio sigue funcionando.
const PREFIJO = 'cuantodormir:';

export function leer(clave: string): string | null {
  try {
    return window.localStorage.getItem(PREFIJO + clave);
  } catch {
    return null;
  }
}

export function guardar(clave: string, valor: string): void {
  try {
    window.localStorage.setItem(PREFIJO + clave, valor);
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}
