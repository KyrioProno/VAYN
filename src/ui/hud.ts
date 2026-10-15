// Affichage tête haute : heure, lieu, objectif, jauges de survie, jetons, onglets.
import type { Game } from '../engine/game';
import { displayDay, fmtClock } from '../engine/time';
import { btn, h } from './dom';
import { icon, type ICON } from './icons';

const ICON_TOKEN = '<span class="ico" style="margin-right:4px">' + '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="8"/><path d="M12 8l3 4-3 4-3-4z"/></svg></span>';

export type TabId = 'carnet' | 'sac' | 'train' | 'menu';

export class Hud {
  readonly el: HTMLElement;
  private clock: HTMLElement;
  private place: HTMLElement;
  private obj: HTMLElement;
  private gauges: Record<string, HTMLElement> = {};
  private tokens: HTMLElement;
  private dots: Record<TabId, HTMLElement> = {} as Record<TabId, HTMLElement>;
  private last: Record<string, string> = {};

  constructor(onTab: (t: TabId) => void, onWait: () => void) {
    this.clock = h('div', { class: 'hud-clock' });
    this.place = h('div', { class: 'hud-place' });
    this.obj = h('div', { class: 'hud-obj' });
    const g = h('div', { class: 'gauges' });
    const defs: [string, keyof typeof ICON, string][] = [
      ['health', 'health', 'Santé'],
      ['hydration', 'water', 'Hydratation'],
      ['satiety', 'food', 'Faim'],
      ['rest', 'rest', 'Fatigue'],
    ];
    for (const [k, ic, title] of defs) {
      const bar = h('b');
      const el = h('div', { class: 'gauge', title }, h('i', null, icon(ic)), h('div', { class: 'bar' }, bar));
      (el as HTMLElement & { bar?: HTMLElement }).bar = bar;
      this.gauges[k] = el;
      g.append(el);
    }
    this.tokens = h('div', { class: 'tokens', title: 'Jetons' });
    const tabs = h('div', { class: 'tabs live' });
    const tabDefs: [TabId, keyof typeof ICON, string][] = [
      ['carnet', 'carnet', 'Carnet'],
      ['sac', 'sac', 'Sac'],
      ['train', 'train', 'Train'],
      ['menu', 'menu', 'Menu'],
    ];
    for (const [id, ic, label] of tabDefs) {
      const dot = h('b', { class: 'dot', style: 'display:none' });
      this.dots[id] = dot;
      tabs.append(btn([h('i', null, icon(ic)), h('span', null, label), dot], () => onTab(id), 'tab', { 'aria-label': label }));
    }
    const wait = btn([icon('wait'), ' Attendre'], onWait, 'btn small hud-wait live');
    this.el = h('div', { class: 'hud' },
      h('div', { class: 'hud-tl' }, this.clock, this.place, this.obj),
      h('div', { class: 'hud-tr' }, this.tokens, g),
      tabs,
      wait,
    );
  }

  private set(key: string, el: HTMLElement, v: string, html = false) {
    if (this.last[key] === v) return;
    this.last[key] = v;
    if (html) el.innerHTML = v;
    else el.textContent = v;
  }

  update(g: Game, place: { section: string; room: string }) {
    const t = g.state.time;
    const deadline = g.state.zone === 'exterior' && g.state.flags['expedition_active'];
    this.set('clock', this.clock, `<small>JOUR ${displayDay(t)}</small>${fmtClock(t)}`, true);
    const late = deadline && t >= 24 * 60 + 11 * 60;
    this.clock.classList.toggle('warn', !!late);
    this.set('place', this.place, place.room ? `${place.section} · ${place.room}` : place.section);
    const o = g.currentObjective();
    this.set('obj', this.obj, o ? o.text : '');
    this.obj.style.display = o ? '' : 'none';
    for (const [k, el] of Object.entries(this.gauges)) {
      const v = g.state.stats[k as keyof typeof g.state.stats];
      const key = `g_${k}`;
      const s = String(Math.round(v));
      if (this.last[key] !== s) {
        this.last[key] = s;
        (el as HTMLElement & { bar: HTMLElement }).bar.style.width = `${Math.max(0, Math.min(100, v))}%`;
        el.classList.toggle('low', v < 35 && v >= 15);
        el.classList.toggle('crit', v < 15);
        el.title = `${el.title.split(' ')[0]} ${s} %`;
      }
    }
    this.set('tok', this.tokens, `${ICON_TOKEN}${g.state.tokens}`, true);
    const unseen = Object.values(g.state.journal.entries).some((e) => !e.seen);
    this.dots.carnet.style.display = unseen ? '' : 'none';
    const canUpgrade = Object.values(g.content.upgrades).some((u) => g.check(u.visible) && g.upgradeStatus(u).ok);
    this.dots.train.style.display = canUpgrade ? '' : 'none';
  }

  show(on: boolean) {
    this.el.style.display = on ? '' : 'none';
  }
}
