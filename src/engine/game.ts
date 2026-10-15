// Façade du moteur : état + systèmes (temps, survie, inventaire, carnet, missions,
// relations, ressources, portes, objets, améliorations, événements).
// Aucune dépendance à Phaser ni au DOM : entièrement testable.

import { Emitter } from './emitter';
import { evalCond, parseFx, splitAssign, splitDelta, splitQty, type CondContext } from './dsl';
import { absTime, clockOf, dayOf, hm, MIN_PER_DAY } from './time';
import type {
  Content, GameState, ItemDef, Relation, ResKey, StatKey, TextVariant, HypothesisDef, Fx, UpgradeDef,
} from './types';

export const CAPACITY_KG = 10;
export const WALK_PX_PER_MIN = { train: 80, exterior: 34 } as const;

const DECAY_PER_HOUR = {
  train: { hydration: 3, satiety: 2, rest: 2.4 },
  exterior: { hydration: 5, satiety: 3, rest: 4 },
} as const;

export interface ToastMsg { text: string; kind?: 'info' | 'entry' | 'item' | 'warn' | 'quest' | 'rel' | 'res' }

export class Game extends Emitter {
  state: GameState;
  readonly content: Content;
  private walkAcc = 0;
  /** Empêche la récursion pendant l'avancée du temps. */
  private advancing = false;
  private ctxCache: CondContext | null = null;

  constructor(content: Content, state: GameState) {
    super();
    this.content = content;
    this.state = state;
  }

  // ------------------------------------------------------------------ conditions
  ctx(): CondContext {
    if (this.ctxCache) return this.ctxCache;
    const g = this;
    const c: CondContext = {
      flag: (n) => g.state.flags[n],
      itemQty: (id) => g.itemQty(id),
      get char() { return g.state.char; },
      get mode() { return g.state.mode; },
      hasEntry: (id) => g.knows(id),
      rel: (npc, f) => g.rel(npc)[f],
      met: (npc) => g.rel(npc).met,
      questStatus: (id) => g.state.quests[id]?.status ?? 'none',
      objective: (q, o) => !!g.state.quests[q]?.obj[o],
      res: (k) => g.state.res[k as ResKey] ?? 0,
      get tokens() { return g.state.tokens; },
      stat: (k) => g.state.stats[k as StatKey] ?? 0,
      get time() { return g.state.time; },
      upgrade: (id) => g.state.upgrades.includes(id),
      get companion() { return g.state.expedition?.companion ?? null; },
      get zone() { return g.state.zone; },
      fired: (id) => g.state.fired.includes(id),
      hypothesis: (q) => g.state.journal.hypotheses[q],
      seen: (k) => !!g.state.flags[`v:${k}`],
      objState: (id) => g.state.objects[id] ?? '',
      doorState: (id) => g.state.doors[id] ?? 'open',
      npcAt: (id) => g.npcSpot(id) ?? '',
    };
    this.ctxCache = c;
    return c;
  }

  check(cond?: string): boolean {
    return evalCond(cond, this.ctx());
  }

  /** Résout un texte à variantes conditionnelles, puis remplace les jetons {pc} {title}. */
  text(v: TextVariant | undefined): string {
    if (!v) return '';
    let s: string;
    if (typeof v === 'string') s = v;
    else {
      const hit = v.find((x) => this.check(x.if));
      s = hit ? hit.text : '';
    }
    return this.fmt(s);
  }

  fmt(s: string): string {
    const c = this.content.chars[this.state.char];
    return s
      .replace(/\{pc\}/g, c.name.split(' ')[0])
      .replace(/\{title\}/g, c.title)
      .replace(/\{fullname\}/g, c.name)
      .replace(/\{tok\}/g, String(this.state.tokens))
      .replace(/\{water\}/g, String(this.state.res.water))
      .replace(/\{food\}/g, String(this.state.res.food));
  }

  // ------------------------------------------------------------------ flags
  flag(n: string) { return this.state.flags[n]; }
  setFlag(n: string, v: number | boolean | string = true) {
    this.state.flags[n] = v;
    this.emit('flag', { name: n, value: v });
    this.changed();
  }

  changed() {
    this.emit('state');
  }

  toast(text: string, kind: ToastMsg['kind'] = 'info') {
    this.emit<ToastMsg>('toast', { text: this.fmt(text), kind });
  }

  // ------------------------------------------------------------------ effets
  applyFx(list: Fx[] | undefined, source = '') {
    if (!list) return;
    for (const raw of list) this.applyOne(raw, source);
    this.changed();
  }

  private applyOne(raw: string, source: string) {
    const { verb, arg } = parseFx(raw);
    const s = this.state;
    switch (verb) {
      case 'set': {
        const [k, v] = splitAssign(arg);
        let val: number | boolean | string = true;
        if (v !== undefined) val = /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : v === 'true' ? true : v === 'false' ? false : v;
        this.setFlag(k, val);
        break;
      }
      case 'inc': {
        const [k, d] = splitDelta(arg);
        this.setFlag(k, Number(s.flags[k] ?? 0) + d);
        break;
      }
      case 'clr':
        delete s.flags[arg.trim()];
        this.emit('flag', { name: arg.trim(), value: undefined });
        break;
      case 'give': {
        const [id, n] = splitQty(arg);
        this.give(id, n);
        break;
      }
      case 'take': {
        const [id, n] = splitQty(arg);
        this.take(id, n);
        break;
      }
      case 'store': {
        const [id, n] = splitQty(arg);
        this.addStack(s.storage, id, n);
        break;
      }
      case 'entry':
        this.addEntry(arg.trim());
        break;
      case 'trust':
      case 'susp':
      case 'debt': {
        const [npc, d] = splitDelta(arg);
        this.changeRel(npc, verb === 'trust' ? 'trust' : verb === 'susp' ? 'suspicion' : 'debt', d);
        break;
      }
      case 'met':
        this.meet(arg.trim());
        break;
      case 'res': {
        const [k, d] = splitDelta(arg);
        this.changeRes(k as ResKey, d);
        break;
      }
      case 'tok': {
        const d = Number(arg.replace(/\s/g, ''));
        s.tokens = Math.max(0, s.tokens + d);
        this.toast(`${d > 0 ? '+' : ''}${d} jetons`, 'item');
        break;
      }
      case 'stat': {
        const [k, d] = splitDelta(arg);
        this.changeStat(k as StatKey, d);
        break;
      }
      case 'cstat': {
        const [, d] = splitDelta(arg);
        this.changeCompanionHealth(d);
        break;
      }
      case 'time': {
        const d = Number(arg.replace(/\s/g, ''));
        this.advance(d);
        break;
      }
      case 'quest':
        this.startQuest(arg.trim());
        break;
      case 'obj': {
        const i = arg.indexOf('.');
        this.completeObjective(arg.slice(0, i).trim(), arg.slice(i + 1).trim());
        break;
      }
      case 'qdone':
        this.completeQuest(arg.trim());
        break;
      case 'qfail':
        this.failQuest(arg.trim());
        break;
      case 'conseq':
        this.addConseq(arg.trim());
        break;
      case 'observe': {
        const i = arg.indexOf('.');
        this.observeConseq(arg.slice(0, i).trim(), arg.slice(i + 1).trim());
        break;
      }
      case 'unlock':
        this.setDoor(arg.trim(), 'open');
        break;
      case 'lock':
        this.setDoor(arg.trim(), 'locked');
        break;
      case 'objst': {
        const [id, v] = splitAssign(arg);
        this.setObjState(id, v ?? '');
        break;
      }
      case 'upgrade':
        if (!s.upgrades.includes(arg.trim())) s.upgrades.push(arg.trim());
        this.emit('upgrade', arg.trim());
        break;
      case 'toast':
        this.toast(arg.trim());
        break;
      case 'warn':
        this.toast(arg.trim(), 'warn');
        break;
      case 'sfx':
        this.emit('sfx', arg.trim());
        break;
      case 'music':
        this.emit('music', arg.trim());
        break;
      case 'checkpoint':
        s.checkpointLabel = arg.trim();
        this.emit('checkpoint', arg.trim());
        break;
      case 'dlg':
        this.emit('dialogue', arg.trim());
        break;
      case 'ev':
        this.fireScripted(arg.trim());
        break;
      case 'comp':
        if (s.expedition) s.expedition.companion = arg.trim() || null;
        this.setFlag('companion', arg.trim());
        break;
      case 'loc': {
        const [npc, spot] = splitAssign(arg);
        if (spot === undefined || spot === '') delete s.npcLoc[npc];
        else s.npcLoc[npc] = spot;
        this.emit('npc', npc);
        break;
      }
      case 'hide':
        s.npcLoc[arg.trim()] = 'none';
        this.emit('npc', arg.trim());
        break;
      case 'explog':
        if (s.expedition) s.expedition.log.push(this.fmt(arg.trim()));
        break;
      case 'kill':
        this.die(arg.trim() || 'Mort');
        break;
      case 'if': {
        // if:<condition>?<effet1>;<effet2>
        const q = arg.indexOf('?');
        if (q < 0) throw new Error(`Effet conditionnel invalide : ${raw}`);
        if (this.check(arg.slice(0, q))) for (const f of arg.slice(q + 1).split(';')) if (f.trim()) this.applyOne(f.trim(), source);
        break;
      }
      case 'goto':
      case 'end':
        // Gérés par le moteur de dialogue.
        break;
      default:
        throw new Error(`Effet inconnu "${verb}" (${source})`);
    }
  }

  // ------------------------------------------------------------------ inventaire
  item(id: string): ItemDef {
    const d = this.content.items[id];
    if (!d) throw new Error(`Objet inconnu : ${id}`);
    return d;
  }

  itemQty(id: string): number {
    return this.state.inv.find((s) => s.id === id)?.qty ?? 0;
  }

  storageQty(id: string): number {
    return this.state.storage.find((s) => s.id === id)?.qty ?? 0;
  }

  private addStack(list: GameState['inv'], id: string, n: number) {
    this.item(id);
    const st = list.find((s) => s.id === id);
    if (st) st.qty += n;
    else list.push({ id, qty: n });
  }

  private removeStack(list: GameState['inv'], id: string, n: number): number {
    const st = list.find((s) => s.id === id);
    if (!st) return 0;
    const k = Math.min(n, st.qty);
    st.qty -= k;
    if (st.qty <= 0) list.splice(list.indexOf(st), 1);
    return k;
  }

  give(id: string, n = 1, silent = false) {
    if (n <= 0) return;
    this.addStack(this.state.inv, id, n);
    if (!silent) this.toast(`${this.item(id).name}${n > 1 ? ` ×${n}` : ''} ajouté au sac`, 'item');
    this.emit('inventory');
  }

  take(id: string, n = 1): number {
    const k = this.removeStack(this.state.inv, id, n);
    if (k > 0) this.emit('inventory');
    return k;
  }

  weight(list = this.state.inv): number {
    return list.reduce((w, s) => w + (this.item(s.id).quest ? 0 : this.item(s.id).weight * s.qty), 0);
  }

  overloaded(): boolean {
    return this.weight() > CAPACITY_KG + 1e-6;
  }

  /** Déplace un objet du sac vers le casier (ou l'inverse). Les objets de quête restent possibles à ranger. */
  transfer(id: string, n: number, toStorage: boolean): number {
    const from = toStorage ? this.state.inv : this.state.storage;
    const to = toStorage ? this.state.storage : this.state.inv;
    const k = this.removeStack(from, id, n);
    if (k > 0) this.addStack(to, id, k);
    this.emit('inventory');
    this.changed();
    return k;
  }

  /** Abandonner un objet : interdit pour les objets de quête. */
  drop(id: string, n = 1): boolean {
    if (this.item(id).quest) return false;
    const k = this.take(id, n);
    this.changed();
    return k > 0;
  }

  canUse(id: string): boolean {
    const d = this.item(id);
    if (!d.use || this.itemQty(id) <= 0) return false;
    if (d.use.target === 'comp' && !this.state.expedition?.companion) return false;
    return this.check(d.use.if);
  }

  useItem(id: string): string | null {
    const d = this.item(id);
    if (!this.canUse(id)) return null;
    const use = d.use!;
    if (d.cat === 'food' || d.cat === 'meds') this.take(id, 1);
    this.applyFx(use.fx, `item:${id}`);
    this.emit('sfx', d.cat === 'food' ? 'eat' : 'use');
    return use.text ? this.fmt(use.text) : null;
  }

  // ------------------------------------------------------------------ stats & ressources
  changeStat(k: StatKey, d: number) {
    const s = this.state.stats;
    s[k] = clamp(s[k] + d, 0, 100);
    this.emit('stats');
    if (k === 'health' && s.health <= 0) this.die(this.state.deathCause || 'Blessures');
  }

  changeRes(k: ResKey, d: number) {
    const r = this.state.res;
    if (!(k in r)) throw new Error(`Ressource inconnue : ${k}`);
    r[k] = Math.max(0, Math.round((r[k] + d) * 10) / 10);
    if (k === 'energy') r[k] = Math.min(100, r[k]);
    this.emit('res', { key: k, delta: d });
    const label: Record<ResKey, string> = { food: 'Nourriture', water: 'Eau', energy: 'Énergie', meds: 'Médicaments', parts: 'Pièces' };
    this.toast(`Réserves du train — ${label[k]} ${d > 0 ? '+' : ''}${d}`, 'res');
  }

  changeCompanionHealth(d: number) {
    const e = this.state.expedition;
    if (!e || !e.companion) return;
    e.compHealth = clamp(e.compHealth + d, 0, 100);
    this.emit('companion');
  }

  // ------------------------------------------------------------------ temps
  /** Fait avancer l'horloge (survie, événements datés, consommation journalière). */
  advance(minutes: number) {
    if (minutes <= 0 || this.state.dead) return;
    if (this.advancing) {
      this.state.time += minutes;
      return;
    }
    this.advancing = true;
    try {
      const before = this.state.time;
      const after = before + minutes;
      this.state.time = after;
      this.tickSurvival(minutes);
      // Consommation journalière à minuit.
      const days = Math.floor(after / MIN_PER_DAY) - Math.floor(before / MIN_PER_DAY);
      for (let i = 0; i < days; i++) this.dailyConsumption();
      this.processTimed(after);
      this.emit('time', { before, after });
      this.changed();
    } finally {
      this.advancing = false;
    }
  }

  /** Temps de marche, converti en minutes de jeu. */
  walk(px: number, slow = 1) {
    const zone = this.state.zone;
    let rate = WALK_PX_PER_MIN[zone];
    if (this.state.stats.rest < 20) rate *= 0.8;
    if (this.overloaded()) rate *= 0.7;
    this.walkAcc += (px / rate) * slow;
    if (this.walkAcc >= 1) {
      const m = Math.floor(this.walkAcc);
      this.walkAcc -= m;
      this.advance(m);
    }
  }

  private tickSurvival(minutes: number) {
    const s = this.state.stats;
    const zone = this.state.zone;
    const h = minutes / 60;
    const rates = DECAY_PER_HOUR[zone];
    const sleeping = !!this.state.flags['_sleeping'];
    s.hydration = clamp(s.hydration - rates.hydration * h * (sleeping ? 0.5 : 1), 0, 100);
    s.satiety = clamp(s.satiety - rates.satiety * h * (sleeping ? 0.5 : 1), 0, 100);
    if (!sleeping) s.rest = clamp(s.rest - rates.rest * h, 0, 100);
    let dmg = 0;
    if (s.hydration < 15) dmg += 1.5 * h;
    if (s.satiety < 15) dmg += 1.2 * h;
    if (s.rest < 8) dmg += 0.5 * h;
    if (dmg > 0) {
      if (zone === 'train') {
        // À bord, la négligence ne tue pas : on s'effondre et on se réveille à l'infirmerie.
        const next = s.health - dmg;
        if (next < 12) {
          s.health = 12;
          if (!this.state.flags['_collapse_pending']) {
            this.state.flags['_collapse_pending'] = true;
            this.emit('collapse');
          }
        } else s.health = next;
      } else {
        s.health = clamp(s.health - dmg, 0, 100);
        if (s.health <= 0) this.die('Épuisement');
      }
    } else if (s.hydration > 45 && s.satiety > 45 && s.rest > 35) {
      s.health = clamp(s.health + 0.8 * h, 0, 100);
    }
    this.emit('stats');
  }

  private dailyConsumption() {
    const r = this.state.res;
    const rationing = this.state.flags['rationnement'];
    const foodUse = rationing === 'egal' ? 0.8 : 1;
    const waterUse = this.state.objects['filtration'] === 'repare' ? 0.5 : 1;
    r.food = Math.max(0, Math.round((r.food - foodUse) * 10) / 10);
    r.water = Math.max(0, Math.round((r.water - waterUse) * 10) / 10);
    r.energy = Math.max(0, r.energy - 4);
    this.emit('res', { key: 'daily', delta: 0 });
  }

  private processTimed(now: number) {
    const due = this.content.timed
      .filter((e) => !this.state.fired.includes(e.id) && absTime(e.at) <= now)
      .sort((a, b) => absTime(a.at) - absTime(b.at));
    for (const e of due) {
      this.state.fired.push(e.id);
      if (this.check(e.if)) this.applyFx(e.fx, `timed:${e.id}`);
    }
  }

  /** Dormir / se reposer jusqu'à une heure donnée (absolue). */
  sleepUntil(target: number) {
    const mins = target - this.state.time;
    if (mins <= 0) return;
    this.state.flags['_sleeping'] = true;
    this.advance(mins);
    delete this.state.flags['_sleeping'];
    this.changeStat('rest', Math.min(100, (mins / 60) * 14));
    this.changed();
  }

  // ------------------------------------------------------------------ événements scénarisés
  fireScripted(id: string) {
    const def = this.content.scripted[id];
    if (!def) throw new Error(`Événement inconnu : ${id}`);
    if (!this.state.fired.includes(id)) this.state.fired.push(id);
    this.applyFx(def.fx, `ev:${id}`);
    if (def.ui) this.emit('scripted', def);
  }

  // ------------------------------------------------------------------ carnet
  knows(id: string): boolean {
    return !!this.state.journal.entries[id];
  }

  addEntry(id: string): boolean {
    const def = this.content.entries[id];
    if (!def) throw new Error(`Entrée de carnet inconnue : ${id}`);
    if (this.knows(id)) return false;
    this.state.journal.entries[id] = { at: this.state.time, seen: false };
    const label = def.kind === 'fact' ? 'Fait établi' : def.kind === 'testimony' ? 'Témoignage' : 'Indice';
    this.toast(`${label} : ${def.title}`, 'entry');
    this.emit('entry', def);
    this.emit('sfx', def.kind === 'fact' ? 'fact' : 'entry');
    this.changed();
    return true;
  }

  /** Relier deux entrées du carnet. */
  tryLink(a: string, b: string): { ok: boolean; result?: string; already?: boolean; text?: string } {
    if (!this.knows(a) || !this.knows(b) || a === b) return { ok: false };
    const key = [a, b].sort().join('+');
    if (!this.state.journal.linksTried.includes(key)) this.state.journal.linksTried.push(key);
    const d = this.content.deductions.find((x) => (x.a === a && x.b === b) || (x.a === b && x.b === a));
    if (!d) {
      this.changed();
      return { ok: false };
    }
    if (this.knows(d.result)) return { ok: true, result: d.result, already: true, text: d.text };
    this.addEntry(d.result);
    this.emit('music', 'reveal');
    return { ok: true, result: d.result, text: d.text };
  }

  questionsUnlocked(): string[] {
    return Object.values(this.content.questions).filter((q) => this.check(q.unlock)).map((q) => q.id);
  }

  hypothesesFor(q: string): HypothesisDef[] {
    return Object.values(this.content.hypotheses).filter((h) => h.q === q);
  }

  support(h: HypothesisDef): { pour: string[]; contre: string[] } {
    return { pour: h.supports.filter((e) => this.knows(e)), contre: h.contradicts.filter((e) => this.knows(e)) };
  }

  chooseHypothesis(q: string, h: string) {
    this.state.journal.hypotheses[q] = h;
    this.emit('journal');
    this.changed();
  }

  // ------------------------------------------------------------------ conséquences
  addConseq(id: string) {
    if (!this.content.conseqs[id]) throw new Error(`Conséquence inconnue : ${id}`);
    if (this.state.conseqs.some((c) => c.id === id)) return;
    this.state.conseqs.push({ id, at: this.state.time, observed: [] });
    this.emit('conseq', id);
  }

  observeConseq(id: string, key: string) {
    const def = this.content.conseqs[id];
    if (!def?.observed?.[key]) throw new Error(`Observation inconnue : ${id}.${key}`);
    let c = this.state.conseqs.find((x) => x.id === id);
    if (!c) {
      c = { id, at: this.state.time, observed: [] };
      this.state.conseqs.push(c);
    }
    if (!c.observed.includes(key)) {
      c.observed.push(key);
      this.toast('Le carnet note un changement.', 'info');
    }
  }

  // ------------------------------------------------------------------ missions
  startQuest(id: string) {
    const def = this.content.quests[id];
    if (!def) throw new Error(`Mission inconnue : ${id}`);
    if (this.state.quests[id]) return;
    this.state.quests[id] = { status: 'active', obj: {}, at: this.state.time };
    this.toast(`Nouvelle mission : ${def.title}`, 'quest');
    this.emit('quest', id);
  }

  completeObjective(q: string, o: string) {
    const def = this.content.quests[q];
    if (!def || !def.objectives.some((x) => x.id === o)) throw new Error(`Objectif inconnu : ${q}.${o}`);
    // Les missions personnelles des autres personnages ne s'activent jamais.
    if (def.personal && def.personal !== this.state.char) return;
    if (!this.state.quests[q]) this.startQuest(q);
    if (this.state.quests[q].obj[o]) return;
    this.state.quests[q].obj[o] = true;
    this.emit('quest', q);
  }

  completeQuest(id: string) {
    if (!this.content.quests[id]) throw new Error(`Mission inconnue : ${id}`);
    const q = this.state.quests[id] ?? (this.state.quests[id] = { status: 'active', obj: {}, at: this.state.time });
    if (q.status === 'done') return;
    q.status = 'done';
    this.toast(`Mission terminée : ${this.content.quests[id].title}`, 'quest');
    this.emit('quest', id);
  }

  failQuest(id: string) {
    if (!this.content.quests[id]) throw new Error(`Mission inconnue : ${id}`);
    const q = this.state.quests[id] ?? (this.state.quests[id] = { status: 'active', obj: {}, at: this.state.time });
    if (q.status !== 'active') return;
    q.status = 'failed';
    this.toast(`Mission compromise : ${this.content.quests[id].title}`, 'warn');
    this.emit('quest', id);
  }

  /** Objectif courant affiché dans le HUD. */
  currentObjective(): { quest: string; text: string } | null {
    const order = Object.values(this.content.quests).sort((a, b) => Number(!!b.main) - Number(!!a.main));
    for (const def of order) {
      const q = this.state.quests[def.id];
      if (!q || q.status !== 'active') continue;
      const o = def.objectives.find((x) => !q.obj[x.id] && this.check(x.if));
      if (o) return { quest: def.id, text: this.fmt(o.text) };
    }
    return null;
  }

  // ------------------------------------------------------------------ relations
  rel(npc: string): Relation {
    let r = this.state.rel[npc];
    if (!r) {
      if (!this.content.npcs[npc]) throw new Error(`Personnage inconnu : ${npc}`);
      r = this.state.rel[npc] = { trust: 0, suspicion: 0, debt: 0, met: false };
    }
    return r;
  }

  changeRel(npc: string, field: 'trust' | 'suspicion' | 'debt', d: number) {
    const r = this.rel(npc);
    const lim = field === 'trust' ? [-5, 5] : field === 'suspicion' ? [0, 5] : [-3, 3];
    r[field] = clamp(r[field] + d, lim[0], lim[1]);
    this.emit('relation', { npc, field, delta: d });
  }

  meet(npc: string) {
    const r = this.rel(npc);
    if (!r.met) {
      r.met = true;
      this.emit('relation', { npc, field: 'met', delta: 1 });
    }
  }

  relLabel(npc: string): string {
    const t = this.rel(npc).trust;
    if (t >= 3) return 'Allié';
    if (t >= 1) return 'Bienveillant';
    if (t <= -3) return 'Hostile';
    if (t <= -1) return 'Méfiant';
    return 'Neutre';
  }

  // ------------------------------------------------------------------ monde
  doorOpen(id: string): boolean {
    return (this.state.doors[id] ?? 'open') === 'open';
  }

  setDoor(id: string, v: 'open' | 'locked') {
    this.state.doors[id] = v;
    this.emit('door', id);
    if (v === 'open') this.emit('sfx', 'unlock');
  }

  objState(id: string): string {
    return this.state.objects[id] ?? '';
  }

  setObjState(id: string, v: string) {
    if (v === '') delete this.state.objects[id];
    else this.state.objects[id] = v;
    this.emit('object', id);
  }

  /** Position prévue d'un PNJ (identifiant de point) selon son emploi du temps et les surcharges. */
  npcSpot(id: string): string | null {
    const o = this.state.npcLoc[id];
    if (o !== undefined) return o === 'none' ? null : o;
    const def = this.content.npcs[id];
    if (!def) return null;
    const clock = clockOf(this.state.time);
    const cands = def.schedule.filter((e) => this.check(e.if));
    if (!cands.length) return null;
    let best: { e: (typeof cands)[0]; t: number } | null = null;
    let latest: { e: (typeof cands)[0]; t: number } | null = null;
    for (const e of cands) {
      const t = hm(e.from);
      if (t <= clock && (!best || t >= best.t)) best = { e, t };
      if (!latest || t >= latest.t) latest = { e, t };
    }
    const pick = (best ?? latest)!.e;
    return pick.spot === 'none' ? null : pick.spot;
  }

  // ------------------------------------------------------------------ améliorations du train
  upgradeStatus(u: UpgradeDef): { ok: boolean; reason?: string } {
    if (this.state.upgrades.includes(u.id)) return { ok: false, reason: 'Déjà réalisé' };
    if (!this.check(u.if)) return { ok: false, reason: 'Compétence ou autorisation requise' };
    if (this.state.res.parts < u.cost.parts) return { ok: false, reason: 'Pas assez de pièces' };
    if (u.cost.energy && this.state.res.energy < u.cost.energy) return { ok: false, reason: "Pas assez d'énergie" };
    if (u.cost.meds && this.state.res.meds < u.cost.meds) return { ok: false, reason: 'Pas assez de médicaments' };
    return { ok: true };
  }

  installUpgrade(id: string): boolean {
    const u = this.content.upgrades[id];
    if (!u || !this.upgradeStatus(u).ok) return false;
    this.state.res.parts -= u.cost.parts;
    if (u.cost.energy) this.state.res.energy -= u.cost.energy;
    if (u.cost.meds) this.state.res.meds -= u.cost.meds;
    this.state.upgrades.push(id);
    this.emit('res', { key: 'parts', delta: -u.cost.parts });
    this.advance(this.state.char === 'mecanicien' ? Math.round(u.time * 0.6) : u.time);
    this.applyFx(u.fx, `upgrade:${id}`);
    this.emit('upgrade', id);
    this.emit('sfx', 'repair');
    this.toast(`Amélioration réalisée : ${u.name}`, 'quest');
    this.changed();
    return true;
  }

  // ------------------------------------------------------------------ mort
  die(cause: string) {
    if (this.state.dead) return;
    this.state.dead = true;
    this.state.deathCause = cause;
    this.emit('death', { cause });
  }

  get day(): number {
    return dayOf(this.state.time);
  }
}

export function clamp(v: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, v));
}
