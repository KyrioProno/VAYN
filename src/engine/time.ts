// Horloge du chapitre. `time` = minutes écoulées depuis le jour 1 à 00:00.
// Le jour 1 du chapitre correspond au « Jour 147 » après la catastrophe.

export const FIRST_DAY_NUMBER = 147;
export const MIN_PER_DAY = 1440;

export function dayOf(time: number): number {
  return Math.floor(time / MIN_PER_DAY) + 1;
}

export function clockOf(time: number): number {
  return ((time % MIN_PER_DAY) + MIN_PER_DAY) % MIN_PER_DAY;
}

export function displayDay(time: number): number {
  return FIRST_DAY_NUMBER + dayOf(time) - 1;
}

export function fmtClock(time: number): string {
  const c = Math.floor(clockOf(time));
  const h = Math.floor(c / 60);
  const m = c % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function fmtDateTime(time: number): string {
  return `Jour ${displayDay(time)} · ${fmtClock(time)}`;
}

/** "HH:MM" → minutes dans la journée. */
export function hm(s: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
  if (!m) throw new Error(`Heure invalide: ${s}`);
  return Number(m[1]) * 60 + Number(m[2]);
}

/** "d2@06:00" → minutes absolues ; "06:00" seul → jour 1. ; nombre → tel quel. */
export function absTime(s: string | number): number {
  if (typeof s === 'number') return s;
  const t = s.trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  const m = /^d(\d+)@(\d{1,2}:\d{2})$/.exec(t);
  if (m) return (Number(m[1]) - 1) * MIN_PER_DAY + hm(m[2]);
  return hm(t);
}

export function fmtDuration(min: number): string {
  const m = Math.max(0, Math.round(min));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${String(r).padStart(2, '0')}` : `${h} h`;
}

/** Période de la journée (pour la lumière extérieure). */
export function dayPhase(time: number): 'nuit' | 'aube' | 'jour' | 'crepuscule' {
  const c = clockOf(time) / 60;
  if (c < 5.5 || c >= 21) return 'nuit';
  if (c < 8) return 'aube';
  if (c < 18) return 'jour';
  return 'crepuscule';
}
