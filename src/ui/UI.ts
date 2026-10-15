// Racine de l'interface DOM : calques, notifications, étiquettes du monde, fondus.
import { h, clear } from './dom';

export type ToastKind = 'info' | 'entry' | 'quest' | 'warn' | 'item';

export class UI {
  readonly root: HTMLElement;
  readonly hud: HTMLElement;
  readonly labels: HTMLElement;
  readonly toasts: HTMLElement;
  readonly menu: HTMLElement;
  readonly dlg: HTMLElement;
  readonly panel: HTMLElement;
  readonly flow: HTMLElement;
  readonly screen: HTMLElement;
  private fadeEl: HTMLElement;
  private loadingEl: HTMLElement | null = null;
  private labelPool = new Map<string, HTMLElement>();
  private bubbles = new Map<string, { el: HTMLElement; until: number }>();

  constructor(root: HTMLElement) {
    this.root = root;
    const layer = (cls: string) => {
      const el = h('div', { class: cls });
      root.append(el);
      return el;
    };
    this.labels = layer('labels');
    this.hud = layer('hud');
    this.menu = layer('menu-layer');
    this.dlg = layer('dlg-layer');
    this.panel = layer('panel-layer');
    this.flow = layer('flow-layer');
    this.screen = layer('screen-layer');
    this.toasts = layer('toasts');
    this.fadeEl = layer('fade');
    document.body.append(h('div', { class: 'rotate' }, h('i', null, '⟳'), 'Tournez votre appareil', h('small', null, 'VAYN se joue à l’horizontale')));
    for (const el of [this.menu, this.dlg, this.panel, this.flow, this.screen]) {
      el.style.position = 'absolute';
      el.style.inset = '0';
    }
  }

  // ------------------------------------------------------------------ notifications
  toast(text: string, kind: ToastKind = 'info') {
    const el = h('div', { class: `toast ${kind}` }, text);
    this.toasts.append(el);
    while (this.toasts.children.length > 4) this.toasts.firstElementChild?.remove();
    const life = kind === 'warn' ? 5200 : kind === 'entry' || kind === 'quest' ? 4000 : 3200;
    setTimeout(() => el.classList.add('out'), life);
    setTimeout(() => el.remove(), life + 450);
  }

  // ------------------------------------------------------------------ écrans
  setScreen(el: HTMLElement | null) {
    clear(this.screen);
    if (el) this.screen.append(el);
    this.toasts.classList.toggle('low', !!el);
  }

  setFlow(el: HTMLElement | null) {
    clear(this.flow);
    if (el) this.flow.append(el);
  }

  setPanel(el: HTMLElement | null) {
    clear(this.panel);
    if (el) this.panel.append(el);
  }

  setMenu(el: HTMLElement | null) {
    clear(this.menu);
    if (el) this.menu.append(el);
  }

  get hasPanel() {
    return this.panel.childElementCount > 0;
  }

  get hasMenu() {
    return this.menu.childElementCount > 0;
  }

  get hasFlow() {
    return this.flow.childElementCount > 0;
  }

  get hasScreen() {
    return this.screen.childElementCount > 0;
  }

  fade(on: boolean, ms = 450): Promise<void> {
    this.fadeEl.style.transitionDuration = `${ms}ms`;
    this.fadeEl.classList.toggle('on', on);
    return new Promise((r) => setTimeout(r, ms + 30));
  }

  loading(progress: number | null, label = 'Chargement') {
    if (progress === null) {
      this.loadingEl?.remove();
      this.loadingEl = null;
      return;
    }
    if (!this.loadingEl) {
      this.loadingEl = h('div', { class: 'loading' }, h('div', null, label), h('div', { class: 'bar' }, h('b', { style: 'width:0%' })));
      document.body.append(this.loadingEl);
    }
    (this.loadingEl.querySelector('.bar b') as HTMLElement).style.width = `${Math.round(progress * 100)}%`;
  }

  // ------------------------------------------------------------------ étiquettes du monde
  /** Met à jour les étiquettes : clé → position écran (px CSS) et contenu. */
  syncLabels(items: { key: string; x: number; y: number; html: string; cls: string }[]) {
    const seen = new Set<string>();
    for (const it of items) {
      seen.add(it.key);
      let el = this.labelPool.get(it.key);
      if (!el) {
        el = h('div', { class: it.cls });
        el.innerHTML = it.html;
        (el as HTMLElement & { _html?: string })._html = it.html;
        this.labels.append(el);
        this.labelPool.set(it.key, el);
      }
      const anyEl = el as HTMLElement & { _html?: string };
      if (anyEl._html !== it.html) {
        el.innerHTML = it.html;
        anyEl._html = it.html;
      }
      el.style.left = `${Math.round(it.x)}px`;
      el.style.top = `${Math.round(it.y)}px`;
    }
    for (const [k, el] of this.labelPool) {
      if (!seen.has(k)) {
        el.remove();
        this.labelPool.delete(k);
      }
    }
  }

  clearLabels() {
    for (const el of this.labelPool.values()) el.remove();
    this.labelPool.clear();
    for (const b of this.bubbles.values()) b.el.remove();
    this.bubbles.clear();
  }

  /** Bulle de réplique d'ambiance au-dessus d'un PNJ. */
  bubble(key: string, text: string, ms = 3600) {
    this.bubbles.get(key)?.el.remove();
    const el = h('div', { class: 'bubble' }, text);
    this.labels.append(el);
    this.bubbles.set(key, { el, until: performance.now() + ms });
  }

  placeBubbles(pos: (key: string) => { x: number; y: number } | null) {
    const now = performance.now();
    for (const [k, b] of this.bubbles) {
      const p = pos(k);
      if (!p || now > b.until) {
        b.el.remove();
        this.bubbles.delete(k);
        continue;
      }
      b.el.style.left = `${Math.round(p.x)}px`;
      b.el.style.top = `${Math.round(p.y)}px`;
    }
  }
}
