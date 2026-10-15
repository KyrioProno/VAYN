// Validation statique du contenu : toutes les références du mini-langage doivent exister.
import { condRefs, parseCond, parseFx, splitAssign, splitDelta, splitQty } from './dsl';
import { absTime } from './time';
import type { ActionDef, Content, DialogueDef, Fx } from './types';

const FX_VERBS = new Set([
  'set', 'inc', 'clr', 'give', 'take', 'store', 'entry', 'trust', 'susp', 'debt', 'met', 'res', 'tok', 'stat', 'cstat', 'time',
  'quest', 'obj', 'qdone', 'qfail', 'conseq', 'observe', 'unlock', 'lock', 'objst', 'upgrade', 'toast', 'warn', 'sfx', 'music',
  'checkpoint', 'dlg', 'ev', 'comp', 'loc', 'hide', 'explog', 'kill', 'goto', 'end', 'if',
]);
const RES = new Set(['food', 'water', 'energy', 'meds', 'parts']);
const STATS = new Set(['health', 'hydration', 'satiety', 'rest']);

export function validateContent(c: Content, sprites?: Set<string>): string[] {
  const errors: string[] = [];
  const objIds = new Set([...c.train.objects, ...c.exterior.objects].map((o) => o.id));
  const doorIds = new Set([...c.train.doors, ...c.exterior.doors].map((d) => d.id));
  const spotIds = new Set([...c.train.spots, ...c.exterior.spots].map((s) => s.id));
  const evIds = new Set([...c.timed.map((t) => t.id), ...Object.keys(c.scripted)]);
  const secIds = new Set([...c.train.sections, ...c.exterior.sections].map((s) => s.id));

  const checkCond = (src: string | undefined, where: string) => {
    if (!src) return;
    try {
      parseCond(src);
    } catch (e) {
      errors.push(`${where} : ${(e as Error).message}`);
      return;
    }
    for (const r of condRefs(src)) {
      const a = r.arg ?? '';
      const bad = (what: string) => errors.push(`${where} : ${what} inconnu « ${a} » dans « ${src} »`);
      switch (r.key) {
        case 'e': if (!c.entries[a]) bad('entrée'); break;
        case 'has': if (!c.items[a]) bad('objet'); break;
        case 'char': if (!(c.chars as Record<string, unknown>)[a]) bad('personnage'); break;
        case 'trust': case 'susp': case 'debt': case 'met': case 'comp': if (a && !c.npcs[a]) bad('PNJ'); break;
        case 'q': if (!c.quests[a]) bad('mission'); break;
        case 'o': {
          const [q, o] = a.split('.');
          if (!c.quests[q]?.objectives.some((x) => x.id === o)) bad('objectif');
          break;
        }
        case 'up': if (!c.upgrades[a]) bad('amélioration'); break;
        case 'ev': if (!evIds.has(a)) bad('événement'); break;
        case 'hyp': {
          if (!c.questions[a]) bad('question');
          if (r.val && !c.hypotheses[r.val]) errors.push(`${where} : hypothèse inconnue « ${r.val} »`);
          break;
        }
        case 'door': if (!doorIds.has(a)) bad('porte'); break;
        case 'obj': if (!objIds.has(a)) bad('objet de décor'); break;
        case 'at': {
          if (!c.npcs[a]) bad('PNJ');
          if (r.val && !spotIds.has(r.val)) errors.push(`${where} : point inconnu « ${r.val} »`);
          break;
        }
        case 'res': if (!RES.has(a)) bad('ressource'); break;
        case 'stat': if (!STATS.has(a)) bad('statistique'); break;
        case 'zone': if (a !== 'train' && a !== 'exterior') bad('zone'); break;
        case 'mode': if (a !== 'histoire' && a !== 'onelife') bad('mode'); break;
        case 'seen': {
          const [d, node] = a.split('.');
          if (!c.dialogues[d]?.nodes[node]) bad('nœud de dialogue');
          break;
        }
        case 'clock': case 't': case 'day': case 'tok': case 'f': case 'true': case 'false': break;
        case 'dead': if (!c.npcs[a]) bad('PNJ'); break;
        default: errors.push(`${where} : condition « ${r.key} » inconnue`);
      }
    }
  };

  const checkFx = (list: Fx[] | undefined, where: string) => {
    for (const raw of list ?? []) {
      const { verb, arg } = parseFx(raw);
      const bad = (what: string, v = arg) => errors.push(`${where} : ${what} inconnu « ${v} » (${raw})`);
      if (!FX_VERBS.has(verb)) {
        errors.push(`${where} : effet inconnu « ${verb} »`);
        continue;
      }
      try {
        switch (verb) {
          case 'give': case 'take': case 'store': {
            const [id] = splitQty(arg);
            if (!c.items[id]) bad('objet', id);
            break;
          }
          case 'entry': if (!c.entries[arg.trim()]) bad('entrée'); break;
          case 'trust': case 'susp': case 'debt': {
            const [npc] = splitDelta(arg);
            if (!c.npcs[npc]) bad('PNJ', npc);
            break;
          }
          case 'met': case 'hide': if (!c.npcs[arg.trim()]) bad('PNJ'); break;
          case 'res': { const [k] = splitDelta(arg); if (!RES.has(k)) bad('ressource', k); break; }
          case 'stat': { const [k] = splitDelta(arg); if (!STATS.has(k)) bad('statistique', k); break; }
          case 'cstat': splitDelta(arg); break;
          case 'tok': case 'time': if (Number.isNaN(Number(arg.replace(/\s/g, '')))) errors.push(`${where} : nombre attendu (${raw})`); break;
          case 'quest': case 'qdone': case 'qfail': if (!c.quests[arg.trim()]) bad('mission'); break;
          case 'obj': {
            const [q, o] = arg.split('.').map((x) => x.trim());
            if (!c.quests[q]?.objectives.some((x) => x.id === o)) bad('objectif');
            break;
          }
          case 'conseq': if (!c.conseqs[arg.trim()]) bad('conséquence'); break;
          case 'observe': if (!c.conseqs[arg.split('.')[0].trim()]) bad('conséquence'); break;
          case 'unlock': case 'lock': if (!doorIds.has(arg.trim())) bad('porte'); break;
          case 'objst': { const [id] = splitAssign(arg); if (!objIds.has(id)) bad('objet de décor', id); break; }
          case 'upgrade': if (!c.upgrades[arg.trim()]) bad('amélioration'); break;
          case 'dlg': if (!c.dialogues[arg.trim()]) bad('dialogue'); break;
          case 'ev': if (!c.scripted[arg.trim()]) bad('événement scénarisé'); break;
          case 'comp': if (arg.trim() && !c.npcs[arg.trim()]) bad('PNJ'); break;
          case 'loc': {
            const [npc, spot] = splitAssign(arg);
            if (!c.npcs[npc]) bad('PNJ', npc);
            if (spot && spot !== 'none' && !spotIds.has(spot)) bad('point', spot);
            break;
          }
          case 'if': {
            const q = arg.indexOf('?');
            if (q < 0) { errors.push(`${where} : effet conditionnel sans « ? » (${raw})`); break; }
            checkCond(arg.slice(0, q), where);
            checkFx(arg.slice(q + 1).split(';').map((x) => x.trim()).filter(Boolean), where);
            break;
          }
          case 'set': case 'inc': case 'clr': case 'toast': case 'warn': case 'sfx': case 'music': case 'checkpoint': case 'explog': case 'kill': case 'goto': case 'end':
            break;
        }
      } catch (e) {
        errors.push(`${where} : ${(e as Error).message}`);
      }
    }
  };

  const checkText = (t: unknown, where: string) => {
    if (Array.isArray(t)) for (const v of t as { if: string }[]) checkCond(v.if, where);
  };

  const checkAction = (a: ActionDef, where: string) => {
    checkCond(a.if, where);
    checkFx(a.fx, where);
    checkText(a.text, where);
    if (a.dlg && !c.dialogues[a.dlg]) errors.push(`${where} : dialogue inconnu « ${a.dlg} »`);
    if (!a.text && !a.fx && !a.dlg && !a.tag) errors.push(`${where} : action sans effet`);
  };

  // Objets
  for (const strip of [c.train, c.exterior]) {
    const ids = new Set<string>();
    for (const o of strip.objects) {
      const w = `objet ${o.id}`;
      if (ids.has(o.id)) errors.push(`${w} : identifiant en double`);
      ids.add(o.id);
      if (!secIds.has(o.sec)) errors.push(`${w} : section inconnue ${o.sec}`);
      const sp = typeof o.sprite === 'string' ? [o.sprite] : o.sprite.map((x) => x.sprite);
      if (typeof o.sprite !== 'string') for (const x of o.sprite) checkCond(x.if, w);
      if (sprites) for (const n of sp) if (!sprites.has(n)) errors.push(`${w} : sprite inconnu ${n}`);
      checkCond(o.visible, w);
      checkCond(o.important, w);
      checkCond(o.light?.if, w);
      o.actions.forEach((a, i) => checkAction(a, `${w} action ${i} (${a.label})`));
    }
    for (const d of strip.doors) {
      if (d.kind === 'partition' && (!d.sec || !secIds.has(d.sec))) errors.push(`porte ${d.id} : section inconnue`);
      if (d.kind === 'gangway' && (!d.between || !d.between.every((x) => secIds.has(x)))) errors.push(`porte ${d.id} : sections inconnues`);
      (d.actions ?? []).forEach((a, i) => checkAction(a, `porte ${d.id} action ${i}`));
    }
    for (const s of strip.spots) if (!secIds.has(s.sec)) errors.push(`point ${s.id} : section inconnue`);
  }

  // PNJ
  for (const npc of Object.values(c.npcs)) {
    const w = `PNJ ${npc.id}`;
    for (const e of npc.schedule) {
      checkCond(e.if, w);
      if (e.spot !== 'none' && !spotIds.has(e.spot)) errors.push(`${w} : point inconnu ${e.spot}`);
    }
    if (npc.dialogue && !c.dialogues[npc.dialogue]) errors.push(`${w} : dialogue inconnu ${npc.dialogue}`);
    for (const b of npc.barks ?? []) checkCond(b.if, w);
    if (!npc.ambient && !npc.dialogue) errors.push(`${w} : ni dialogue ni répliques d'ambiance`);
  }

  // Personnages jouables
  for (const ch of Object.values(c.chars)) {
    const w = `personnage ${ch.id}`;
    if (!spotIds.has(ch.startSpot)) errors.push(`${w} : point de départ inconnu`);
    for (const it of [...ch.startItems, ...ch.startStorage]) if (!c.items[it.id]) errors.push(`${w} : objet inconnu ${it.id}`);
    for (const id of Object.keys(ch.rel)) if (!c.npcs[id]) errors.push(`${w} : PNJ inconnu ${id}`);
    if (ch.storageObject && !objIds.has(ch.storageObject)) errors.push(`${w} : objet de rangement inconnu`);
    if (!c.dialogues[`start_${ch.id}`]) errors.push(`${w} : scène d'ouverture manquante`);
  }

  // Dialogues
  for (const d of Object.values(c.dialogues)) checkDialogue(d);
  function checkDialogue(d: DialogueDef) {
    const w = `dialogue ${d.id}`;
    if (d.npc && !c.npcs[d.npc]) errors.push(`${w} : PNJ inconnu ${d.npc}`);
    const starts = typeof d.start === 'string' ? [{ go: d.start }] : d.start;
    for (const st of starts) {
      checkCond((st as { if?: string }).if, w);
      if (!d.nodes[st.go]) errors.push(`${w} : départ vers nœud inconnu ${st.go}`);
    }
    for (const [id, node] of Object.entries(d.nodes)) {
      const nw = `${w}.${id}`;
      checkText(node.text, nw);
      checkFx(node.fx, nw);
      if (node.next && !d.nodes[node.next]) errors.push(`${nw} : suite inconnue ${node.next}`);
      if (node.who && node.who !== 'pc' && node.who !== 'narr' && !c.npcs[node.who]) errors.push(`${nw} : locuteur inconnu ${node.who}`);
      for (const r of node.route ?? []) {
        checkCond(r.if, nw);
        if (!d.nodes[r.go]) errors.push(`${nw} : aiguillage vers nœud inconnu ${r.go}`);
      }
      for (const ch of node.ch ?? []) {
        checkCond(ch.if, nw);
        checkFx(ch.fx, nw);
        if (ch.go && !d.nodes[ch.go]) errors.push(`${nw} : choix vers nœud inconnu ${ch.go}`);
      }
    }
  }

  // Carnet
  for (const h of Object.values(c.hypotheses)) {
    if (!c.questions[h.q]) errors.push(`hypothèse ${h.id} : question inconnue`);
    for (const e of [...h.supports, ...h.contradicts]) if (!c.entries[e]) errors.push(`hypothèse ${h.id} : entrée inconnue ${e}`);
  }
  for (const q of Object.values(c.questions)) checkCond(q.unlock, `question ${q.id}`);
  for (const d of c.deductions) for (const e of [d.a, d.b, d.result]) if (!c.entries[e]) errors.push(`déduction ${d.a}+${d.b} : entrée inconnue ${e}`);
  for (const q of Object.values(c.quests)) for (const o of q.objectives) checkCond(o.if, `mission ${q.id}.${o.id}`);

  // Événements
  for (const t of c.timed) {
    try { absTime(t.at); } catch { errors.push(`événement ${t.id} : heure invalide ${t.at}`); }
    checkCond(t.if, `événement ${t.id}`);
    checkFx(t.fx, `événement ${t.id}`);
  }
  for (const s of Object.values(c.scripted)) checkFx(s.fx, `scénario ${s.id}`);
  for (const u of Object.values(c.upgrades)) {
    checkCond(u.if, `amélioration ${u.id}`);
    checkCond(u.visible, `amélioration ${u.id}`);
    checkFx(u.fx, `amélioration ${u.id}`);
  }
  for (const m of Object.values(c.motions)) {
    const w = `motion ${m.id}`;
    checkCond(m.if, w);
    const opts = new Set(m.options.map((o) => o.id));
    if (!opts.has(m.fallback)) errors.push(`${w} : option de repli inconnue`);
    for (const o of m.options) checkFx(o.fx, `${w}.${o.id}`);
    for (const [mem, prefs] of Object.entries(m.base)) for (const k of Object.keys(prefs ?? {})) if (!opts.has(k)) errors.push(`${w} : préférence ${mem}→${k} inconnue`);
    for (const a of m.args) {
      checkCond(a.if, `${w}.${a.id}`);
      checkFx(a.fx, `${w}.${a.id}`);
      if (!opts.has(a.toward)) errors.push(`${w}.${a.id} : option visée inconnue`);
    }
  }
  return errors;
}
