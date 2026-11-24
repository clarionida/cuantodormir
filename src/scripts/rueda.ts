// Rueda de selección tipo alarma. Cada columna:
// · con el dedo: desplazamiento nativo con "scroll-snap";
// · con la rueda del ratón: avanza un elemento por paso;
// · arrastrando con el ratón;
// · con el teclado: ↑/↓ (±1), Re Pág/Av Pág (± salto), Inicio/Fin;
// · tocando o haciendo clic en un valor.
// Para lectores de pantalla, cada columna es un role="spinbutton" cuyo
// aria-valuetext anuncia el valor completo (por ejemplo "8:00 a. m.").

const movimientoReducido = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export class Columna {
  readonly el: HTMLElement;
  readonly items: HTMLLIElement[];
  readonly valores: number[];
  readonly salto: number;
  indice: number;
  alCambiar: (() => void) | null = null;

  private cuadro = 0;
  private acumulado = 0;
  private arrastre: { y: number; top: number; id: number; movido: boolean } | null = null;
  private programado = false;

  constructor(el: HTMLElement) {
    this.el = el;
    this.items = Array.from(el.querySelectorAll('li'));
    this.valores = this.items.map((li) => Number(li.dataset.valor));
    this.salto = Number(el.dataset.salto) || 3;
    this.indice = Number(el.dataset.inicial) || 0;

    el.addEventListener('scroll', () => this.alDesplazar(), { passive: true });
    el.addEventListener('keydown', (e) => this.alTeclear(e));
    el.addEventListener('wheel', (e) => this.alGirar(e), { passive: false });
    el.addEventListener('click', (e) => this.alTocar(e));
    el.addEventListener('pointerdown', (e) => this.alPresionar(e));
    el.addEventListener('pointermove', (e) => this.alMover(e));
    el.addEventListener('pointerup', (e) => this.alSoltar(e));
    el.addEventListener('pointercancel', (e) => this.alSoltar(e));

    // Si cambia el tamaño (giro de pantalla o zoom), se vuelve a centrar.
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => this.centrar(false)).observe(el);
    }
    this.centrar(false);
  }

  get valor(): number {
    return this.valores[this.indice];
  }

  private alto(): number {
    return this.items[0]?.getBoundingClientRect().height || 44;
  }

  /** Mueve la rueda al elemento i. */
  irA(i: number, suave = true): void {
    const destino = Math.min(this.items.length - 1, Math.max(0, i));
    this.marcar(destino);
    this.centrar(suave);
  }

  /** Elige el valor indicado (o el más cercano). */
  fijarValor(valor: number, suave = false): void {
    let mejor = 0;
    this.valores.forEach((v, i) => {
      if (Math.abs(v - valor) < Math.abs(this.valores[mejor] - valor)) mejor = i;
    });
    this.irA(mejor, suave);
  }

  private centrar(suave: boolean): void {
    const top = this.indice * this.alto();
    if (Math.abs(this.el.scrollTop - top) < 1) return;
    this.el.scrollTo({ top, behavior: suave && !movimientoReducido() ? 'smooth' : 'instant' });
  }

  private marcar(i: number): void {
    if (i === this.indice && this.items[i]?.classList.contains('elegido')) return;
    this.items[this.indice]?.classList.remove('elegido');
    this.indice = i;
    this.items[i]?.classList.add('elegido');
    this.el.setAttribute('aria-valuenow', String(this.valores[i]));
    this.alCambiar?.();
  }

  private alDesplazar(): void {
    if (this.programado) return;
    this.programado = true;
    cancelAnimationFrame(this.cuadro);
    this.cuadro = requestAnimationFrame(() => {
      this.programado = false;
      const i = Math.round(this.el.scrollTop / this.alto());
      this.marcar(Math.min(this.items.length - 1, Math.max(0, i)));
    });
  }

  private alTeclear(e: KeyboardEvent): void {
    const ultimo = this.items.length - 1;
    const destinos: Record<string, number> = {
      ArrowUp: this.indice + 1,
      ArrowRight: this.indice + 1,
      ArrowDown: this.indice - 1,
      ArrowLeft: this.indice - 1,
      PageUp: this.indice + this.salto,
      PageDown: this.indice - this.salto,
      Home: 0,
      End: ultimo,
    };
    if (!(e.key in destinos)) return;
    // Las flechas izquierda/derecha se dejan al navegador si hay modificadores.
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && (e.altKey || e.metaKey)) return;
    e.preventDefault();
    this.irA(destinos[e.key], true);
  }

  private alGirar(e: WheelEvent): void {
    if (e.ctrlKey) return; // zoom con el trackpad
    e.preventDefault();
    const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    this.acumulado += delta;
    const umbral = 40;
    if (Math.abs(this.acumulado) < umbral) return;
    const pasos = Math.trunc(this.acumulado / umbral);
    this.acumulado -= pasos * umbral;
    this.irA(this.indice + Math.max(-3, Math.min(3, pasos)), true);
  }

  private alTocar(e: MouseEvent): void {
    const li = (e.target as HTMLElement).closest('li');
    if (!li) return;
    const i = this.items.indexOf(li as HTMLLIElement);
    if (i >= 0) {
      this.irA(i, true);
      this.el.focus({ preventScroll: true });
    }
  }

  private alPresionar(e: PointerEvent): void {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    this.arrastre = { y: e.clientY, top: this.el.scrollTop, id: e.pointerId, movido: false };
  }

  private alMover(e: PointerEvent): void {
    const a = this.arrastre;
    if (!a || e.pointerId !== a.id) return;
    const dy = e.clientY - a.y;
    if (!a.movido && Math.abs(dy) < 4) return;
    if (!a.movido) {
      a.movido = true;
      this.el.setPointerCapture(e.pointerId);
      this.el.classList.add('arrastrando');
    }
    this.el.scrollTop = a.top - dy;
  }

  private alSoltar(e: PointerEvent): void {
    const a = this.arrastre;
    if (!a || e.pointerId !== a.id) return;
    this.arrastre = null;
    if (!a.movido) return;
    this.el.classList.remove('arrastrando');
    if (this.el.hasPointerCapture(e.pointerId)) this.el.releasePointerCapture(e.pointerId);
    // Evita que el clic final elija otro valor.
    const bloquear = (ev: Event) => ev.stopPropagation();
    this.el.addEventListener('click', bloquear, { capture: true, once: true });
    setTimeout(() => this.el.removeEventListener('click', bloquear, { capture: true }), 0);
    this.irA(Math.round(this.el.scrollTop / this.alto()), true);
  }
}

/** Una rueda con varias columnas y un texto completo para lectores de pantalla. */
export class Rueda {
  readonly columnas: Map<string, Columna> = new Map();
  alCambiar: (() => void) | null = null;

  constructor(
    raiz: HTMLElement,
    private readonly textoCompleto: (valores: Record<string, number>) => string,
  ) {
    raiz.querySelectorAll<HTMLElement>('[data-col]').forEach((el) => {
      const columna = new Columna(el);
      columna.alCambiar = () => {
        this.actualizarTexto();
        this.alCambiar?.();
      };
      this.columnas.set(el.dataset.col!, columna);
    });
    this.actualizarTexto();
  }

  valores(): Record<string, number> {
    const salida: Record<string, number> = {};
    this.columnas.forEach((c, clave) => (salida[clave] = c.valor));
    return salida;
  }

  fijar(valores: Record<string, number>, suave = false): void {
    for (const [clave, valor] of Object.entries(valores)) {
      this.columnas.get(clave)?.fijarValor(valor, suave);
    }
    this.actualizarTexto();
  }

  enfocar(): void {
    this.columnas.values().next().value?.el.focus({ preventScroll: true });
  }

  private actualizarTexto(): void {
    const texto = this.textoCompleto(this.valores());
    this.columnas.forEach((c) => c.el.setAttribute('aria-valuetext', texto));
  }
}
