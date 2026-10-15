// Petit utilitaire de construction DOM (aucune dépendance).
type Child = Node | string | number | null | undefined | false;
type Props = Record<string, unknown> & { class?: string; style?: string | Partial<CSSStyleDeclaration> };

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, props: Props | null = null, ...children: (Child | Child[])[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v === undefined || v === null || v === false) continue;
      if (k === 'class') el.className = String(v);
      else if (k === 'style') {
        if (typeof v === 'string') el.setAttribute('style', v);
        else Object.assign(el.style, v);
      } else if (k.startsWith('on') && typeof v === 'function') {
        const ev = k.slice(2).toLowerCase();
        el.addEventListener(ev, v as EventListener);
      } else if (k === 'html') el.innerHTML = String(v);
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, String(v));
    }
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

export function clear(el: HTMLElement) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

/** Bouton tactile : réagit au premier « pointerup » valide, ignore les doubles déclenchements rapprochés. */
export function btn(label: Child | Child[], onTap: () => void, cls = 'btn', extra: Props = {}): HTMLButtonElement {
  let last = 0;
  const b = h('button', { class: cls, type: 'button', ...extra }, ...(Array.isArray(label) ? label : [label]));
  b.addEventListener('click', (e) => {
    e.stopPropagation();
    const now = performance.now();
    if (now - last < 350 || b.disabled) return;
    last = now;
    onTap();
  });
  return b;
}

/**
 * Signale qu'une zone défile. Au doigt, une liste tronquée en bas sans aucun indice
 * se lit comme une liste complète : on affiche donc un dégradé et une barre fine.
 */
export function marquerDefilement(el: HTMLElement) {
  const maj = () => el.classList.toggle('deroule', el.scrollHeight > el.clientHeight + 2);
  // L'appel se fait souvent avant l'insertion dans la page : on remesure une fois posée,
  // une fois la mise en page faite (polices, images), puis à chaque défilement.
  maj();
  setTimeout(maj, 0);
  setTimeout(maj, 250);
  el.addEventListener('scroll', maj, { passive: true });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(maj).observe(el);
  return el;
}

export function fmtKg(v: number): string {
  return `${(Math.round(v * 10) / 10).toString().replace('.', ',')} kg`;
}

export function pct(v: number): string {
  return `${Math.round(v)}%`;
}
