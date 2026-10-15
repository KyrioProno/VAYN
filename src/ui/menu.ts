// Menu contextuel d'actions, ancré près de l'objet touché.
import { fmtDuration } from '../engine/time';
import { btn, h } from './dom';

export interface MenuAction {
  label: string;
  tag?: string;
  time?: number;
  danger?: boolean;
  run: () => void;
}

export function actionMenu(opts: { title: string; note?: string; actions: MenuAction[]; x: number; y: number; onClose: () => void; sfx?: (k: string) => void }): HTMLElement {
  const acts = h('div', { class: 'acts' });
  for (const a of opts.actions) {
    const label: (string | HTMLElement)[] = [];
    if (a.tag) label.push(h('span', { class: a.danger ? 'chip red' : 'chip blue' }, a.tag));
    else if (a.danger) label.push(h('span', { class: 'chip red' }, 'Risqué'));
    label.push(a.label);
    if (a.time) label.push(h('span', { class: 'time' }, fmtDuration(a.time)));
    acts.append(btn(label, () => {
      opts.sfx?.('click');
      a.run();
    }, a.danger ? 'act danger' : 'act'));
  }
  acts.append(btn('Fermer', () => {
    opts.sfx?.('tick');
    opts.onClose();
  }, 'btn ghost small'));
  const el = h('div', { class: 'amenu' }, h('h3', null, opts.title), opts.note ? h('p', { class: 'note' }, opts.note) : null, acts);
  // positionnement après insertion (mesure)
  requestAnimationFrame(() => {
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = opts.x - r.width / 2;
    let y = opts.y - r.height - 12;
    if (y < 8) y = Math.min(vh - r.height - 8, opts.y + 16);
    x = Math.max(8, Math.min(vw - r.width - 70, x));
    y = Math.max(8, Math.min(vh - r.height - 8, y));
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });
  el.style.left = '-9999px';
  el.style.top = '0px';
  el.addEventListener('click', (e) => e.stopPropagation());
  return el;
}
