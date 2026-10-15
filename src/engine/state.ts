import type { CharId, Content, GameState, Mode } from './types';
import { absTime } from './time';
import { layoutStrip, spotAbs } from './layout';

export const STATE_VERSION = 1;
export const START_TIME = absTime('d1@07:00');

export function newRunId(): string {
  const r = Math.random().toString(36).slice(2, 8);
  return `run-${Date.now().toString(36)}-${r}`;
}

/** Crée l'état initial d'une nouvelle partie pour le personnage et le mode choisis. */
export function createInitialState(content: Content, char: CharId, mode: Mode, runId = newRunId()): GameState {
  const def = content.chars[char];
  const spot = content.train.spots.find((s) => s.id === def.startSpot);
  const laid = layoutStrip(content.train);
  const start = spot ? spotAbs(laid, spot) : { x: 100, y: 90 };
  const rel: GameState['rel'] = {};
  for (const id of Object.keys(content.npcs)) {
    const base = def.rel[id] ?? {};
    rel[id] = { trust: base.trust ?? 0, suspicion: base.suspicion ?? 0, debt: base.debt ?? 0, met: base.met ?? false };
  }
  const doors: GameState['doors'] = {};
  for (const d of [...content.train.doors, ...content.exterior.doors]) doors[d.id] = d.locked ? 'locked' : 'open';
  return {
    version: STATE_VERSION,
    runId,
    char,
    mode,
    time: START_TIME,
    playSeconds: 0,
    zone: 'train',
    pos: { x: start.x, y: start.y },
    stats: { health: 100, hydration: 78, satiety: 70, rest: 72 },
    res: { food: 9, water: 3, energy: 58, meds: 12, parts: 4 },
    tokens: def.tokens,
    inv: def.startItems.map((s) => ({ ...s })),
    storage: def.startStorage.map((s) => ({ ...s })),
    flags: { [`pc_${char}`]: true },
    rel,
    journal: { entries: {}, hypotheses: {}, linksTried: [] },
    conseqs: [],
    quests: {},
    doors,
    objects: {},
    npcLoc: {},
    fired: [],
    upgrades: [],
    expedition: null,
    checkpointLabel: 'Début du chapitre',
    dead: false,
    chapterDone: false,
  };
}

export function cloneState(s: GameState): GameState {
  return JSON.parse(JSON.stringify(s)) as GameState;
}
