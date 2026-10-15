// Conseil des quatre : positions, arguments, vote.
import type { Game } from './game';
import type { Member, MotionDef } from './types';

export interface CouncilSession {
  motion: MotionDef;
  position: string | null;
  used: string[];
  mods: Partial<Record<Member, Record<string, number>>>;
}

export const MEMBER_LABEL: Record<Member, string> = {
  castel: 'Sécurité',
  vasseur: 'Maintenance',
  marchetti: 'Approvisionnement',
  sorel: 'Bien-être',
  rosa: 'Approvisionnement (intérim)',
};

export function councilMembers(game: Game): Member[] {
  // Un membre mort pendant une expédition ne siège plus, ne vote plus et ne peut plus être argumenté.
  const mort = game.flag('compagnon_mort');
  return (['castel', 'vasseur', game.flag('marchetti_destitue') ? 'rosa' : 'marchetti', 'sorel'] as Member[])
    .filter((m) => m !== mort);
}

export function newSession(motion: MotionDef): CouncilSession {
  return { motion, position: null, used: [], mods: {} };
}

export function availableArgs(game: Game, s: CouncilSession) {
  const members = councilMembers(game);
  return s.motion.args.filter((a) => members.includes(a.target) && !s.used.includes(a.id) && game.check(a.if));
}

export function useArg(game: Game, s: CouncilSession, argId: string): string | null {
  const a = s.motion.args.find((x) => x.id === argId);
  if (!a || s.used.includes(argId) || !game.check(a.if)) return null;
  s.used.push(argId);
  const m = (s.mods[a.target] ??= {});
  m[a.toward] = (m[a.toward] ?? 0) + a.strength;
  if (a.fx) game.applyFx(a.fx, `arg:${a.id}`);
  return game.fmt(a.reply);
}

export function memberScores(game: Game, s: CouncilSession, member: Member): Record<string, number> {
  const out: Record<string, number> = {};
  const base = s.motion.base[member] ?? {};
  const rel = game.rel(member);
  for (const o of s.motion.options) {
    let v = base[o.id] ?? 0;
    v += s.mods[member]?.[o.id] ?? 0;
    if (s.position === o.id) {
      v += rel.trust / 2;
      v -= rel.suspicion / 2;
      v += Math.max(0, rel.debt) * 0.75;
    }
    out[o.id] = Math.round(v * 100) / 100;
  }
  return out;
}

export function memberVote(game: Game, s: CouncilSession, member: Member): string {
  const sc = memberScores(game, s, member);
  const base = s.motion.base[member] ?? {};
  let best = s.motion.options[0].id;
  for (const o of s.motion.options) {
    const a = sc[o.id];
    const b = sc[best];
    if (a > b || (a === b && (base[o.id] ?? 0) > (base[best] ?? 0))) best = o.id;
  }
  return best;
}

export interface CouncilResult { winner: string; votes: Partial<Record<Member, string>>; tie: boolean; decidedByPlayer: boolean }

export function resolveVote(game: Game, s: CouncilSession): CouncilResult {
  const votes: Partial<Record<Member, string>> = {};
  const count: Record<string, number> = {};
  for (const m of councilMembers(game)) {
    const v = memberVote(game, s, m);
    votes[m] = v;
    count[v] = (count[v] ?? 0) + 1;
  }
  const max = Math.max(...Object.values(count));
  const top = Object.keys(count).filter((k) => count[k] === max);
  let winner: string;
  let decidedByPlayer = false;
  if (top.length === 1) winner = top[0];
  else if (s.position && top.includes(s.position)) {
    winner = s.position;
    decidedByPlayer = true;
  } else winner = s.motion.fallback;
  return { winner, votes, tie: top.length > 1, decidedByPlayer };
}

/** Applique le résultat : effets de l'option, drapeau du vote, réactions des membres. */
export function applyResult(game: Game, s: CouncilSession, r: CouncilResult) {
  const opt = s.motion.options.find((o) => o.id === r.winner)!;
  game.setFlag(`vote_${s.motion.id}`, r.winner);
  game.applyFx(opt.fx, `motion:${s.motion.id}`);
  if (s.position) {
    for (const m of councilMembers(game)) {
      const v = r.votes[m];
      if (v === s.position && v === r.winner) game.changeRel(m, 'trust', 0.5);
      else if (v !== s.position && r.winner === s.position) game.changeRel(m, 'trust', -0.5);
    }
  }
  game.changed();
}
