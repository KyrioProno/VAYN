// Mini-langage de conditions et d'effets utilisé par toutes les données de contenu.
//
// CONDITIONS (exemples) :
//   "f:mara_met"                 drapeau vrai
//   "f:conseil>=2"               comparaison numérique
//   "has:relais_k3"              objet possédé   | "has:ration>=2"
//   "char:mecanicien"            personnage joué
//   "e:c_socle_vide"             entrée du carnet connue
//   "trust:vasseur>=2"           confiance (aussi susp:, debt:)
//   "met:sorel"                  personnage rencontré
//   "q:q_theo" / "q:q_theo=done" état de mission  | "o:q_theo.vasseur" objectif accompli
//   "res:water<2"  "tok>=10"  "stat:health<30"
//   "day>=2"  "clock>=17:00"  "t>=d2@06:00"
//   "up:sterilisateur"  "comp:mara"  "zone:exterior"  "ev:conseil1"
//   "hyp:q_theo=h_theo_dehors"  "seen:castel.radio"  "obj:filtration=repare"  "door:d_soute=open"
//   "mode:onelife"  "true"  "false"  "at:castel=ad_securite" (PNJ à un point)
// Combinaisons : & (et), | (ou), ! (non), parenthèses.
//
// EFFETS : voir applyFx() dans game.ts (set:, inc:, give:, take:, entry:, trust:, res:, time:, ...)

import { absTime, clockOf, dayOf, hm } from './time';

export type Op = '>=' | '<=' | '>' | '<' | '=' | '!=';

export type CondNode =
  | { t: 'and'; a: CondNode[] }
  | { t: 'or'; a: CondNode[] }
  | { t: 'not'; a: CondNode }
  | { t: 'atom'; key: string; arg?: string; op?: Op; val?: string };

const ATOM_RE = /^([a-zA-Z_][\w]*)(?::([\w.\-]+))?(?:\s*(>=|<=|!=|=|>|<)\s*([\w.:@\-+]+))?/;

const cache = new Map<string, CondNode>();

export function parseCond(src: string): CondNode {
  const hit = cache.get(src);
  if (hit) return hit;
  let pos = 0;
  const s = src;
  const ws = () => {
    while (pos < s.length && /\s/.test(s[pos])) pos++;
  };
  const expr = (): CondNode => {
    const parts = [term()];
    ws();
    while (s[pos] === '|') {
      pos++;
      parts.push(term());
      ws();
    }
    return parts.length === 1 ? parts[0] : { t: 'or', a: parts };
  };
  const term = (): CondNode => {
    const parts = [factor()];
    ws();
    while (s[pos] === '&') {
      pos++;
      parts.push(factor());
      ws();
    }
    return parts.length === 1 ? parts[0] : { t: 'and', a: parts };
  };
  const factor = (): CondNode => {
    ws();
    if (s[pos] === '!') {
      pos++;
      return { t: 'not', a: factor() };
    }
    if (s[pos] === '(') {
      pos++;
      const e = expr();
      ws();
      if (s[pos] !== ')') throw new Error(`Condition invalide (parenthèse) : "${src}"`);
      pos++;
      return e;
    }
    const m = ATOM_RE.exec(s.slice(pos));
    if (!m) throw new Error(`Condition invalide à la position ${pos} : "${src}"`);
    pos += m[0].length;
    return { t: 'atom', key: m[1], arg: m[2], op: m[3] as Op | undefined, val: m[4] };
  };
  const node = expr();
  ws();
  if (pos !== s.length) throw new Error(`Condition invalide (reste "${s.slice(pos)}") : "${src}"`);
  cache.set(src, node);
  return node;
}

export interface CondContext {
  flag(name: string): number | boolean | string | undefined;
  itemQty(id: string): number;
  char: string;
  mode: string;
  hasEntry(id: string): boolean;
  rel(npc: string, field: 'trust' | 'suspicion' | 'debt'): number;
  met(npc: string): boolean;
  questStatus(id: string): 'active' | 'done' | 'failed' | 'none';
  objective(q: string, o: string): boolean;
  res(key: string): number;
  tokens: number;
  stat(key: string): number;
  time: number;
  upgrade(id: string): boolean;
  companion: string | null;
  zone: string;
  fired(id: string): boolean;
  hypothesis(q: string): string | undefined;
  seen(key: string): boolean;
  objState(id: string): string;
  doorState(id: string): string;
  npcAt(id: string): string;
}

function cmp(a: number | string, op: Op, b: number | string): boolean {
  switch (op) {
    case '>=': return a >= b;
    case '<=': return a <= b;
    case '>': return a > b;
    case '<': return a < b;
    case '=': return a === b;
    case '!=': return a !== b;
  }
}

function num(v: string | undefined, dflt = 0): number {
  if (v === undefined) return dflt;
  const n = Number(v);
  if (Number.isNaN(n)) throw new Error(`Nombre attendu : ${v}`);
  return n;
}

export function evalCond(src: string | undefined, ctx: CondContext): boolean {
  if (!src) return true;
  return evalNode(parseCond(src), ctx);
}

function evalNode(n: CondNode, ctx: CondContext): boolean {
  switch (n.t) {
    case 'and': return n.a.every((x) => evalNode(x, ctx));
    case 'or': return n.a.some((x) => evalNode(x, ctx));
    case 'not': return !evalNode(n.a, ctx);
    case 'atom': return evalAtom(n, ctx);
  }
}

function evalAtom(n: Extract<CondNode, { t: 'atom' }>, ctx: CondContext): boolean {
  const { key, arg = '', op, val } = n;
  switch (key) {
    case 'true': return true;
    case 'false': return false;
    case 'f': {
      const v = ctx.flag(arg);
      if (!op) return !!v;
      if (val !== undefined && /^-?\d+(\.\d+)?$/.test(val)) return cmp(Number(v ?? 0), op, Number(val));
      return cmp(String(v ?? ''), op, String(val ?? ''));
    }
    case 'has': return op ? cmp(ctx.itemQty(arg), op, num(val)) : ctx.itemQty(arg) >= 1;
    case 'char': return ctx.char === arg;
    case 'mode': return ctx.mode === arg;
    case 'e': return ctx.hasEntry(arg);
    case 'trust': return cmp(ctx.rel(arg, 'trust'), op ?? '>=', num(val, 1));
    case 'susp': return cmp(ctx.rel(arg, 'suspicion'), op ?? '>=', num(val, 1));
    case 'debt': return cmp(ctx.rel(arg, 'debt'), op ?? '>=', num(val, 1));
    case 'met': return ctx.met(arg);
    case 'q': {
      const st = ctx.questStatus(arg);
      if (!op) return st === 'active' || st === 'done';
      return cmp(st, op, val ?? '');
    }
    case 'o': {
      const i = arg.indexOf('.');
      return ctx.objective(arg.slice(0, i), arg.slice(i + 1));
    }
    case 'res': return cmp(ctx.res(arg), op ?? '>=', num(val, 1));
    case 'tok': return cmp(ctx.tokens, op ?? '>=', num(val, 1));
    case 'stat': return cmp(ctx.stat(arg), op ?? '>=', num(val, 1));
    case 'day': return cmp(dayOf(ctx.time), op ?? '>=', num(val, 1));
    case 'clock': return cmp(clockOf(ctx.time), op ?? '>=', hm(val ?? '00:00'));
    case 't': return cmp(ctx.time, op ?? '>=', absTime(val ?? '0'));
    case 'up': return ctx.upgrade(arg);
    case 'comp': return arg ? ctx.companion === arg : !!ctx.companion;
    case 'zone': return ctx.zone === arg;
    case 'ev': return ctx.fired(arg);
    case 'hyp': {
      const h = ctx.hypothesis(arg);
      return op ? cmp(h ?? '', op, val ?? '') : !!h;
    }
    case 'seen': return ctx.seen(arg);
    case 'obj': return op ? cmp(ctx.objState(arg), op, val ?? '') : ctx.objState(arg) !== '';
    case 'door': return op ? cmp(ctx.doorState(arg), op, val ?? '') : ctx.doorState(arg) === 'open';
    case 'at': return op ? cmp(ctx.npcAt(arg), op, val ?? '') : ctx.npcAt(arg) !== '';
    default:
      throw new Error(`Condition inconnue : ${key}`);
  }
}

/** Collecte les références d'une condition (pour la validation du contenu). */
export function condRefs(src: string): { key: string; arg?: string; val?: string }[] {
  const out: { key: string; arg?: string; val?: string }[] = [];
  const walk = (n: CondNode) => {
    if (n.t === 'atom') out.push({ key: n.key, arg: n.arg, val: n.val });
    else if (n.t === 'not') walk(n.a);
    else n.a.forEach(walk);
  };
  walk(parseCond(src));
  return out;
}

// ---------------------------------------------------------------------------
// Effets
// ---------------------------------------------------------------------------

export interface ParsedFx { verb: string; arg: string }

export function parseFx(src: string): ParsedFx {
  const i = src.indexOf(':');
  if (i < 0) return { verb: src.trim(), arg: '' };
  return { verb: src.slice(0, i).trim(), arg: src.slice(i + 1) };
}

/** "nom+3" / "nom-2" / "nom" → [nom, delta] */
export function splitDelta(arg: string, dflt = 1): [string, number] {
  const m = /^([\w.]+)\s*([+-]\s*\d+(?:\.\d+)?)?$/.exec(arg.trim());
  if (!m) throw new Error(`Effet invalide : ${arg}`);
  return [m[1], m[2] ? Number(m[2].replace(/\s/g, '')) : dflt];
}

/** "nom*3" → [nom, 3] */
export function splitQty(arg: string): [string, number] {
  const m = /^([\w]+)(?:\*(\d+))?$/.exec(arg.trim());
  if (!m) throw new Error(`Effet invalide : ${arg}`);
  return [m[1], m[2] ? Number(m[2]) : 1];
}

/** "nom=val" → [nom, val] */
export function splitAssign(arg: string): [string, string | undefined] {
  const i = arg.indexOf('=');
  if (i < 0) return [arg.trim(), undefined];
  return [arg.slice(0, i).trim(), arg.slice(i + 1).trim()];
}
