// Burbuja de información (botón redondo "i"). Se abre al tocar el botón y se
// cierra con Esc, al tocar fuera o con la ×. No depende de pasar el cursor.
export function iniciarBurbujas(): void {
  document.querySelectorAll<HTMLElement>('[data-burbuja-ancla]').forEach((ancla) => {
    const boton = ancla.querySelector<HTMLButtonElement>('[data-burbuja-boton]');
    const burbuja = ancla.querySelector<HTMLElement>('[data-burbuja]');
    const cerrar = ancla.querySelector<HTMLButtonElement>('[data-burbuja-cerrar]');
    if (!boton || !burbuja) return;

    const abierta = () => !burbuja.hidden;
    const fijar = (abrir: boolean, devolverFoco = false) => {
      burbuja.hidden = !abrir;
      boton.setAttribute('aria-expanded', String(abrir));
      if (!abrir && devolverFoco) boton.focus();
    };

    boton.addEventListener('click', () => fijar(!abierta()));
    cerrar?.addEventListener('click', () => fijar(false, true));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && abierta()) {
        fijar(false, ancla.contains(document.activeElement));
      }
    });
    document.addEventListener('pointerdown', (e) => {
      if (abierta() && !ancla.contains(e.target as Node)) fijar(false);
    });
  });
}
