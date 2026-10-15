// Sauvegardes : sauvegarde automatique, points de reprise, règles ONE LIFE.
//
// - Une seule partie en cours (clé SAVE), plus un point de reprise (clé CHECKPOINT) en mode Histoire.
// - Somme de contrôle pour détecter une sauvegarde corrompue (pas une protection cryptographique).
// - ONE LIFE : à la mort, l'identifiant de partie est inscrit dans une « pierre tombale » AVANT
//   l'effacement des fichiers ; une sauvegarde dont l'identifiant est inscrit est refusée au chargement.

import type { GameState } from './types';
import { STATE_VERSION } from './state';

export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export const KEYS = {
  save: 'vayn:save',
  checkpoint: 'vayn:checkpoint',
  tombstones: 'vayn:tombstones',
  settings: 'vayn:settings',
  history: 'vayn:history',
} as const;

export interface SaveBlob {
  v: number;
  runId: string;
  savedAt: number;
  label: string;
  sum: string;
  state: GameState;
}

export interface SaveMeta { runId: string; savedAt: number; label: string; char: string; mode: string; time: number }

export interface RunSummary {
  runId: string;
  char: string;
  mode: string;
  endedAt: number;
  outcome: 'mort' | 'fin';
  cause?: string;
  time: number;
  lines: string[];
}

const SALT = 'VAYN·signal-faible·';

export function checksum(text: string): string {
  // FNV-1a 32 bits
  let h = 0x811c9dc5;
  const s = SALT + text;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function makeBlob(state: GameState, label: string): SaveBlob {
  const json = JSON.stringify(state);
  return { v: STATE_VERSION, runId: state.runId, savedAt: Date.now(), label, sum: checksum(json), state: JSON.parse(json) };
}

export function verifyBlob(raw: string | null): SaveBlob | null {
  if (!raw) return null;
  try {
    const b = JSON.parse(raw) as SaveBlob;
    if (!b || b.v !== STATE_VERSION || !b.state) return null;
    if (checksum(JSON.stringify(b.state)) !== b.sum) return null;
    return b;
  } catch {
    return null;
  }
}

export class MemoryStorage implements StorageAdapter {
  data = new Map<string, string>();
  async get(k: string) { return this.data.get(k) ?? null; }
  async set(k: string, v: string) { this.data.set(k, v); }
  async remove(k: string) { this.data.delete(k); }
}

export type LoadResult =
  | { ok: true; state: GameState; label: string; fromCheckpoint: boolean }
  | { ok: false; reason: 'none' | 'corrupt' | 'dead' };

export class SaveManager {
  constructor(private store: StorageAdapter) {}

  async tombstones(): Promise<string[]> {
    try {
      return JSON.parse((await this.store.get(KEYS.tombstones)) ?? '[]') as string[];
    } catch {
      return [];
    }
  }

  async isDead(runId: string): Promise<boolean> {
    return (await this.tombstones()).includes(runId);
  }

  async save(state: GameState, label = 'Sauvegarde automatique'): Promise<boolean> {
    if (state.mode === 'onelife' && (state.dead || (await this.isDead(state.runId)))) return false;
    if (state.dead) return false;
    await this.store.set(KEYS.save, JSON.stringify(makeBlob(state, label)));
    return true;
  }

  async saveCheckpoint(state: GameState, label: string): Promise<boolean> {
    if (state.mode !== 'histoire' || state.dead) return false;
    await this.store.set(KEYS.checkpoint, JSON.stringify(makeBlob(state, label)));
    return true;
  }

  async meta(): Promise<SaveMeta | null> {
    const b = verifyBlob(await this.store.get(KEYS.save));
    if (!b) return null;
    if (b.state.mode === 'onelife' && (await this.isDead(b.runId))) return null;
    if (b.state.dead) return null;
    return { runId: b.runId, savedAt: b.savedAt, label: b.label, char: b.state.char, mode: b.state.mode, time: b.state.time };
  }

  async load(): Promise<LoadResult> {
    const raw = await this.store.get(KEYS.save);
    if (!raw) return { ok: false, reason: 'none' };
    const b = verifyBlob(raw);
    if (!b) {
      // Sauvegarde corrompue : en mode Histoire, on tente le point de reprise.
      const cp = await this.loadCheckpoint();
      if (cp.ok) return cp;
      return { ok: false, reason: 'corrupt' };
    }
    if (b.state.mode === 'onelife' && (await this.isDead(b.runId))) {
      await this.wipeRun();
      return { ok: false, reason: 'dead' };
    }
    if (b.state.dead) {
      if (b.state.mode === 'histoire') {
        const cp = await this.loadCheckpoint();
        if (cp.ok) return cp;
      }
      return { ok: false, reason: 'dead' };
    }
    return { ok: true, state: b.state, label: b.label, fromCheckpoint: false };
  }

  async loadCheckpoint(): Promise<LoadResult> {
    const b = verifyBlob(await this.store.get(KEYS.checkpoint));
    if (!b || b.state.mode !== 'histoire') return { ok: false, reason: 'none' };
    return { ok: true, state: b.state, label: b.label, fromCheckpoint: true };
  }

  async checkpointMeta(): Promise<{ label: string; time: number } | null> {
    const b = verifyBlob(await this.store.get(KEYS.checkpoint));
    if (!b || b.state.mode !== 'histoire') return null;
    return { label: b.label, time: b.state.time };
  }

  /** Mort en ONE LIFE : pierre tombale d'abord, effacement ensuite. */
  async buryRun(state: GameState): Promise<void> {
    const t = await this.tombstones();
    if (!t.includes(state.runId)) t.push(state.runId);
    await this.store.set(KEYS.tombstones, JSON.stringify(t.slice(-200)));
    await this.wipeRun();
  }

  async wipeRun(): Promise<void> {
    await this.store.remove(KEYS.save);
    await this.store.remove(KEYS.checkpoint);
  }

  async addHistory(s: RunSummary): Promise<void> {
    const list = await this.history();
    list.unshift(s);
    await this.store.set(KEYS.history, JSON.stringify(list.slice(0, 20)));
  }

  async history(): Promise<RunSummary[]> {
    try {
      return JSON.parse((await this.store.get(KEYS.history)) ?? '[]') as RunSummary[];
    } catch {
      return [];
    }
  }

  async getSettings<T>(dflt: T): Promise<T> {
    try {
      const raw = await this.store.get(KEYS.settings);
      return raw ? { ...dflt, ...(JSON.parse(raw) as T) } : dflt;
    } catch {
      return dflt;
    }
  }

  async setSettings<T>(v: T): Promise<void> {
    await this.store.set(KEYS.settings, JSON.stringify(v));
  }
}
