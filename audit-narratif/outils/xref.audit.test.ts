// Audit narratif : références croisées du contenu (drapeaux, entrées, objectifs, conséquences).
// Outil d'audit : ne modifie aucun fichier du jeu. Résultat : audit-narratif/REFERENCES_CROISEES.md
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { it } from 'vitest';
import { CONTENT } from '../../src/content';
import { REVELATIONS } from '../../src/content/story';
import { condRefs, parseFx, splitAssign, splitDelta } from '../../src/engine/dsl';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUT = fileURLToPath(new URL('../', import.meta.url));

type Src = string;
const flagSet = new Map<string, Set<Src>>();
const flagRead = new Map<string, Set<Src>>();
const entrySrc = new Map<string, Set<Src>>();
const entryRead = new Map<string, Set<Src>>();
const objDone = new Map<string, Set<Src>>();
const objRead = new Map<string, Set<Src>>();
const questStart = new Map<string, Set<Src>>();
const conseqSrc = new Map<string, Set<Src>>();
const charGate = new Map<string, Set<string>>(); // source -> chars required (heuristic)
const add = (m: Map<string, Set<Src>>, k: string, s: Src) => { if (!m.has(k)) m.set(k, new Set()); m.get(k)!.add(s); };

function cond(c: string | undefined, where: Src) {
  if (!c) return;
  for (const r of condRefs(c)) {
    const a = r.arg ?? '';
    if (r.key === 'f') add(flagRead, a, where);
    if (r.key === 'e') add(entryRead, a, where);
    if (r.key === 'o') add(objRead, a, where);
  }
}
function fx(list: string[] | undefined, where: Src) {
  for (const raw of list ?? []) {
    const { verb, arg } = parseFx(raw);
    switch (verb) {
      case 'set': add(flagSet, splitAssign(arg)[0], where); break;
      case 'inc': add(flagSet, splitDelta(arg)[0], where); break;
      case 'entry': add(entrySrc, arg.trim(), where); break;
      case 'obj': add(objDone, arg.trim(), where); break;
      case 'quest': add(questStart, arg.trim(), where); break;
      case 'conseq': add(conseqSrc, arg.trim(), where); break;
      case 'if': {
        const q = arg.indexOf('?');
        cond(arg.slice(0, q), where + ' [if]');
        fx(arg.slice(q + 1).split(';').filter(Boolean), where + ' [if]');
        break;
      }
    }
  }
}
function textVar(t: unknown, where: Src) {
  if (Array.isArray(t)) for (const v of t as { if: string }[]) cond(v.if, where + ' (texte)');
}

// Dialogues
for (const d of Object.values(CONTENT.dialogues)) {
  if (Array.isArray(d.start)) for (const r of d.start) cond(r.if, `dlg:${d.id}:start→${r.go}`);
  for (const [nid, n] of Object.entries(d.nodes)) {
    const w = `dlg:${d.id}.${nid}`;
    textVar(n.text, w);
    fx(n.fx, w);
    for (const r of n.route ?? []) cond(r.if, w + `:route→${r.go}`);
    for (const ch of n.ch ?? []) {
      const cw = `${w} «${ch.t.slice(0, 40)}»`;
      cond(ch.if, cw);
      fx(ch.fx, cw);
    }
  }
}
// Objets et portes
for (const strip of [CONTENT.train, CONTENT.exterior]) {
  for (const o of strip.objects) {
    const w = `obj:${o.id}`;
    cond(o.visible, w + ' (visible)');
    cond(o.important as string | undefined, w + ' (important)');
    if (Array.isArray(o.sprite)) for (const s of o.sprite) cond(s.if, w + ' (sprite)');
    cond((o as { light?: { if?: string } }).light?.if, w + ' (lumière)');
    for (const a of o.actions) {
      const aw = `${w} «${a.label}»`;
      cond(a.if, aw);
      fx(a.fx, aw);
      textVar(a.text, aw);
    }
  }
  for (const d of strip.doors) for (const a of d.actions ?? []) { const aw = `door:${d.id} «${a.label}»`; cond(a.if, aw); fx(a.fx, aw); }
}
for (const t of CONTENT.timed) { cond(t.if, `timed:${t.id}@${t.at}`); fx(t.fx, `timed:${t.id}@${t.at}`); }
for (const s of Object.values(CONTENT.scripted)) fx(s.fx, `scripted:${s.id}`);
for (const m of Object.values(CONTENT.motions)) {
  cond(m.if, `motion:${m.id}`);
  for (const o of m.options) fx(o.fx, `motion:${m.id}=${o.id}`);
  for (const a of m.args) { cond(a.if, `arg:${m.id}.${a.id}`); fx(a.fx, `arg:${m.id}.${a.id}`); }
}
for (const q of Object.values(CONTENT.quests)) for (const o of q.objectives) cond(o.if, `quest:${q.id}.${o.id} (visible)`);
for (const q of Object.values(CONTENT.questions)) cond(q.unlock, `question:${q.id}`);
for (const u of Object.values(CONTENT.upgrades)) { cond(u.if, `up:${u.id}`); cond(u.visible, `up:${u.id} (visible)`); fx(u.fx, `up:${u.id}`); }
for (const n of Object.values(CONTENT.npcs)) {
  for (const e of n.schedule) cond(e.if, `npc:${n.id} horaire ${e.from}→${e.spot}`);
  for (const b of n.barks ?? []) cond(b.if, `npc:${n.id} bark`);
  for (const b of n.desc ?? []) cond(b.if, `npc:${n.id} desc`);
}
for (const r of REVELATIONS) { cond(r.if, `rev:${r.id}`); fx(r.fx, `rev:${r.id}`); }
for (const d of CONTENT.deductions) add(entrySrc, d.result, `déduction:${d.a}+${d.b}`);
for (const i of Object.values(CONTENT.items)) if (i.use) { cond(i.use.if, `item:${i.id}`); fx(i.use.fx, `item:${i.id}`); }

// Code (App, UI, story, engine) : drapeaux lus/écrits par le code TypeScript.
const codeFiles = ['src/app/App.ts', 'src/content/story.ts', 'src/ui/expedition.ts', 'src/ui/council.ts', 'src/ui/panels.ts', 'src/engine/game.ts', 'src/world/WorldScene.ts', 'src/ui/hud.ts'];
for (const f of codeFiles) {
  const src = fs.readFileSync(ROOT + f, 'utf8');
  for (const m of src.matchAll(/setFlag\('([\w]+)'/g)) add(flagSet, m[1], `code:${f}`);
  for (const m of src.matchAll(/(?:\bf|flag)\('([\w]+)'\)/g)) add(flagRead, m[1], `code:${f}`);
  for (const m of src.matchAll(/flags\['([\w]+)'\]/g)) add(flagRead, m[1], `code:${f}`);
  for (const m of src.matchAll(/knows\('([\w]+)'\)/g)) add(entryRead, m[1], `code:${f}`);
  for (const m of src.matchAll(/addEntry\('([\w]+)'\)/g)) add(entrySrc, m[1], `code:${f}`);
  for (const m of src.matchAll(/completeObjective\('([\w]+)', '([\w]+)'\)/g)) add(objDone, `${m[1]}.${m[2]}`, `code:${f}`);
  for (const m of src.matchAll(/addConseq\('([\w]+)'\)/g)) add(conseqSrc, m[1], `code:${f}`);
  for (const m of src.matchAll(/applyFx\(\[([^\]]*)\]/g)) {
    const items = [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
    fx(items, `code:${f}`);
  }
}
// Drapeaux implicites posés par le moteur
for (const k of ['vote_expedition', 'vote_rationnement', 'vote_clandestin', 'vote_k3_radio', 'vote_direction', 'repas', 'companion', 'once']) add(flagSet, k, 'moteur');
for (const strip of [CONTENT.train, CONTENT.exterior]) for (const o of strip.objects) for (const a of o.actions) if (a.once) add(flagSet, a.once, `once:${o.id}`);
for (const k of ['pris_matin', 'pris_midi', 'pris_soir', 'pris_matin2', 'pris_midi2']) add(flagSet, k, 'meals()');

const out: string[] = [];
const P = (s = '') => out.push(s);
P('# Références croisées (généré)');
P('');
P('Fichier généré par `audit-narratif/outils/xref.audit.test.ts`. Ne pas modifier à la main.');
P('\n## Drapeaux lus mais jamais posés');
for (const [k, s] of [...flagRead].sort()) if (!flagSet.has(k)) P(`- ${k} ← lu par ${[...s].join(' ; ')}`);
P('\n## Drapeaux posés mais jamais lus');
for (const [k, s] of [...flagSet].sort()) if (!flagRead.has(k)) P(`- ${k} ← posé par ${[...s].join(' ; ')}`);
P('\n## Entrées du carnet : sources');
for (const id of Object.keys(CONTENT.entries)) {
  const s = entrySrc.get(id);
  P(`- ${id} [${CONTENT.entries[id].kind}] ← ${s ? [...s].join(' ; ') : '**AUCUNE SOURCE**'}`);
}
P('\n## Entrées jamais utilisées dans une condition, une déduction ou une hypothèse');
const usedInLogic = new Set<string>([...entryRead.keys(), ...CONTENT.deductions.flatMap((d) => [d.a, d.b]), ...Object.values(CONTENT.hypotheses).flatMap((h) => [...h.supports, ...h.contradicts])]);
for (const id of Object.keys(CONTENT.entries)) if (!usedInLogic.has(id)) P(`- ${id}`);
P('\n## Objectifs : comment ils se terminent');
for (const q of Object.values(CONTENT.quests)) for (const o of q.objectives) {
  const k = `${q.id}.${o.id}`;
  const s = objDone.get(k);
  P(`- ${k} « ${o.text} » ← ${s ? [...s].join(' ; ') : '**JAMAIS COMPLÉTÉ**'}`);
}
P('\n## Missions : démarrage');
for (const q of Object.keys(CONTENT.quests)) P(`- ${q} ← ${questStart.has(q) ? [...questStart.get(q)!].join(' ; ') : '(démarre par un objectif)'}`);
P('\n## Conséquences : sources');
for (const id of Object.keys(CONTENT.conseqs)) P(`- ${id} ← ${conseqSrc.has(id) ? [...conseqSrc.get(id)!].join(' ; ') : '**JAMAIS DÉCLENCHÉE**'}`);
P('\n## Lecteurs des entrées clés');
for (const id of ['f_mere', 'f_signal_cache', 'f_detournement', 'f_k3_radio', 'f_panne', 't_theo_recit', 't_mara_clairval']) P(`- ${id} lu par : ${[...(entryRead.get(id) ?? [])].join(' ; ')}`);
it('écrit les références croisées', () => {
  fs.writeFileSync(OUT + 'REFERENCES_CROISEES.md', out.join('\n') + '\n');
});
