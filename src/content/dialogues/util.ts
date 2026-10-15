import type { DChoice, DNode, TextVariant } from '../../engine/types';

/** Nœud de réplique (locuteur par défaut : le PNJ du dialogue). */
export const n = (text: TextVariant, ch?: DChoice[], extra: Partial<DNode> = {}): DNode => ({ text, ...(ch ? { ch } : {}), ...extra });
/** Nœud enchaîné (sans choix). */
export const s = (text: TextVariant, next?: string, extra: Partial<DNode> = {}): DNode => ({ text, ...(next ? { next } : {}), ...extra });
/** Réplique du personnage joué. */
export const pc = (text: TextVariant, next?: string, extra: Partial<DNode> = {}): DNode => ({ who: 'pc', text, ...(next ? { next } : {}), ...extra });
/** Narration. */
export const nar = (text: TextVariant, next?: string, extra: Partial<DNode> = {}): DNode => ({ who: 'narr', text, ...(next ? { next } : {}), ...extra });
/** Choix. */
export const c = (t: string, go?: string, extra: Partial<DChoice> = {}): DChoice => ({ t, ...(go ? { go } : {}), ...extra });
export const back = (t = 'Autre chose…'): DChoice => ({ t, go: 'hub' });
export const bye = (t = 'Partir.'): DChoice => ({ t });
