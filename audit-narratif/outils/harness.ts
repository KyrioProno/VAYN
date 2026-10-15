// Banc d'essai narratif : joue des parcours complets dans le moteur réel, sans rendu.
// Outil d'audit uniquement : il ne modifie aucun fichier du jeu.
// Les séquences de l'App (conseil, nuit, expédition, retour, départ, assemblée) sont reproduites
// à l'identique de src/app/App.ts (copie fidèle de la logique, sans l'interface).
import { CONTENT, COUNCIL_ORDER, ASSEMBLY_MOTION } from '../../src/content';
import { REVELATIONS, buildEpilogue, twistText, type Revelation } from '../../src/content/story';
import { Game } from '../../src/engine/game';
import { createInitialState } from '../../src/engine/state';
import { DialogueRunner } from '../../src/engine/dialogue';
import { applyResult, availableArgs, newSession, resolveVote, useArg, councilMembers } from '../../src/engine/council';
import { absTime, fmtClock } from '../../src/engine/time';
import { layoutStrip, objAbs, spotAbs } from '../../src/engine/layout';
import type { CharId, MotionDef, ObjectDef, ScriptedEventDef } from '../../src/engine/types';

export interface Policy {
  council?: (m: MotionDef, r: Run) => { position: string | null; args: 'toward' | 'none' | string[] };
  expedition?: (r: Run) => { companion: string | null; gear: Record<string, number> };
  revelations?: (avail: Revelation[], r: Run) => string[];
  direction?: (r: Run) => { position: string | null; args: 'toward' | 'none' };
  /** Le joueur rentre-t-il par la portière (true) ou laisse-t-il partir le train (false) ? */
}

/** Pièce fermée par une cloison ou une grille (géométrie de train_sections.ts). */
export function lockedRoom(sec: string, x: number, y: number): string | null {
  if (sec === 'machines' && x < 124) return 'd_cabine';
  if (sec === 'admin' && x > 390) return 'd_radio';
  if (sec === 'salon' && x > 334 && x < 420) return 'd_gardemanger';
  if (sec === 'salon' && x > 420) return 'd_cabine_madame';
  if (sec === 'soute' && x > 14 && x < 360 && y < 87) return 'd_cage';
  return null;
}

const SLEEP_SPOT: Record<CharId, string> = { controleur: 'ad_bureau', passager: 'd_couchette_sacha', majordome: 'sa_bar', mecanicien: 'a_couchette' };

export class Run {
  g: Game;
  log: string[] = [];
  pending: ScriptedEventDef[] = [];
  x = 0;
  laid = { train: layoutStrip(CONTENT.train), exterior: layoutStrip(CONTENT.exterior) };
  snaps: { label: string; time: string; hud: string; entries: string[]; flags: Record<string, unknown> }[] = [];
  dead: string | null = null;
  ended = false;
  epilogue: { title: string; lines: string[] }[] = [];
  twist: string[] = [];
  revAvail: string[] = [];
  revUsed: string[] = [];
  votes: Record<string, string> = {};
  argsUsed: string[] = [];
  toasts: string[] = [];
  collapses = 0;
  hazeHit = 0;

  constructor(public char: CharId, public label: string, public policy: Policy = {}) {
    this.g = new Game(CONTENT, createInitialState(CONTENT, char, 'histoire', 'audit-' + label));
    this.g.on<ScriptedEventDef>('scripted', (d) => this.pending.push(d));
    this.g.on<{ cause: string }>('death', (d) => { this.dead = d.cause; this.L(`☠ MORT : ${d.cause}`); });
    this.g.on('collapse', () => { this.collapses++; this.pending.push({ id: '_collapse', ui: '_collapse' }); });
    this.g.on<{ text: string; kind: string }>('toast', (t) => { if (t.kind === 'warn' || t.kind === 'quest' || /Indice|Témoignage|Fait établi/.test(t.text)) this.toasts.push(`${this.clock()} ${t.text}`); });
    this.g.on<{ before: number; after: number }>('time', (t) => this.onTime(t.before, t.after));
    this.x = this.g.state.pos.x;
  }

  clock() { return `J${Math.floor(this.g.state.time / 1440) + 1} ${fmtClock(this.g.state.time)}`; }
  L(s: string) { this.log.push(`[${this.clock()}] ${s}`); }
  hud() { return this.g.currentObjective()?.text ?? '—'; }

  private onTime(before: number, after: number) {
    const g = this.g;
    if (g.state.zone !== 'exterior' || g.state.dead) return;
    const W = this.laid.exterior.width;
    const start = absTime('d2@10:00');
    if (after >= start) {
      const k = (after - start) / 150;
      const front = W + 200 - k * (W + 200);
      if (this.x > front) {
        const mins = after - before;
        const kk = g.itemQty('masque') ? 0.25 : 0.9;
        g.changeStat('health', -mins * kk);
        g.changeCompanionHealth(-mins * 0.7);
        this.hazeHit += mins;
        if (g.state.stats.health <= 0) g.die('Asphyxié dans la brume de Saint-Aubin');
      }
    }
    if (g.flag('depart_retarde') && after >= absTime('d2@12:20') && !g.flag('retard_fini') && !g.flag('train_roule')) {
      g.setFlag('retard_fini');
      if (g.state.zone === 'train') this.departure();
      else this.missedTrain(true);
    }
  }

  snap(label: string) {
    const s = this.g.state;
    this.snaps.push({ label, time: this.clock(), hud: this.hud(), entries: Object.keys(s.journal.entries), flags: { ...s.flags } });
  }

  // ------------------------------------------------------------------ déplacements
  private secX(zone: 'train' | 'exterior', sec: string) {
    const s = this.laid[zone].secById[sec];
    return s.x + s.w / 2;
  }
  walkTo(x: number) {
    if (this.dead || this.ended) return;
    // Marche par petits pas : la brume et les événements datés voient la position réelle.
    const dir = Math.sign(x - this.x);
    while (Math.abs(x - this.x) > 0.5 && !this.dead) {
      const step = Math.min(40, Math.abs(x - this.x));
      this.x += dir * step;
      this.g.walk(step, this.g.flag('theo_suit') ? 1.5 : 1);
    }
    this.x = x;
    this.flush();
  }
  /** Obstacles de l'extérieur : poutre du dépôt, meute du talus. */
  blockedAt(x: number): string | null {
    const g = this.g;
    if (g.state.zone !== 'exterior') return null;
    const L = this.laid.exterior;
    const beam = L.secById['depot'].x + 262;
    const dogs = L.secById['talus'].x + 210;
    const st = g.objState('poutre');
    if (x > beam + 1 && st !== 'etayee' && st !== 'tombee') return 'la poutre du dépôt';
    if (x > dogs + 1 && !g.flag('chiens_partis')) return 'la meute de chiens';
    return null;
  }
  goSec(sec: string) { this.walkTo(this.secX(this.g.state.zone, sec)); }

  findObj(id: string): ObjectDef | undefined {
    return [...CONTENT.train.objects, ...CONTENT.exterior.objects].find((o) => o.id === id);
  }

  /** Utilise une action d'un objet (ou d'une porte) ; renvoie le texte, ou null si impossible. */
  act(id: string, label: string): string | null {
    if (this.dead || this.ended) return null;
    const g = this.g;
    const o = this.findObj(id);
    const d = [...CONTENT.train.doors, ...CONTENT.exterior.doors].find((x) => x.id === id);
    if (o) {
      const zone = CONTENT.train.objects.includes(o) ? 'train' : 'exterior';
      if (zone !== g.state.zone) { this.L(`✗ ${id} : pas dans cette zone`); return null; }
      const ox = objAbs(this.laid[zone], o).x;
      const blk = this.blockedAt(ox);
      if (blk) { this.L(`✗ ${id} : bloqué par ${blk}`); return null; }
      this.walkTo(ox);
      if (this.laid[zone].secById[o.sec]?.dark && !g.itemQty('lampe')) { this.L(`✗ ${id} : trop noir, pas de lampe`); return null; }
      if (o.visible && !g.check(o.visible)) { this.L(`✗ ${id} : invisible`); return null; }
      const lock = lockedRoom(o.sec, o.x, o.y);
      if (zone === 'train' && lock && !g.doorOpen(lock)) { this.L(`✗ ${id} : derrière ${lock} (fermé)`); return null; }
    }
    const list = o ? o.actions : d?.actions;
    if (!list) { this.L(`✗ objet inconnu ${id}`); return null; }
    if (d && g.doorOpen(d.id)) { this.L(`· ${id} déjà ouverte`); return ''; }
    const a = g.availableActions(list).find((x) => x.label.includes(label));
    if (!a) { this.L(`✗ ${id} « ${label} » indisponible (dispo : ${g.availableActions(list).map((x) => x.label).join(' / ') || 'aucune'})`); return null; }
    if (a.tag === 'return') { this.returnToTrain(false); return ''; }
    const t = g.perform(a, `audit:${id}`);
    this.L(`✓ ${id} « ${a.label} » → ${t.replace(/\s+/g, ' ').slice(0, 160)}`);
    this.flush();
    return t;
  }

  /** Va trouver un PNJ et déroule son dialogue avec les choix demandés (s'arrête au premier choix absent). */
  talk(npc: string, picks: string[] = [], dlgId?: string): string[] {
    if (this.dead || this.ended) return [];
    const g = this.g;
    const id = dlgId ?? CONTENT.npcs[npc]?.dialogue ?? npc;
    if (CONTENT.npcs[npc]) {
      const spot = g.npcSpot(npc);
      if (!spot) { this.L(`✗ ${npc} absent (aucun point)`); return []; }
      const strip = g.state.zone === 'train' ? CONTENT.train : CONTENT.exterior;
      const sp = strip.spots.find((s) => s.id === spot);
      if (!sp) { this.L(`✗ ${npc} n’est pas dans cette zone (${spot})`); return []; }
      const nx = spotAbs(this.laid[g.state.zone], sp).x;
      const blk = this.blockedAt(nx);
      if (blk) { this.L(`✗ ${npc} : bloqué par ${blk}`); return []; }
      this.walkTo(nx);
      const lock = g.state.zone === 'train' ? lockedRoom(sp.sec, sp.x, sp.y) : null;
      if (lock && !g.doorOpen(lock)) {
        if (lock === 'd_cabine_madame' && npc === 'villiers') this.L('  (on frappe à la cabine de Madame)');
        else if (lock === 'd_cage') this.L(`  (on parle à ${npc} à travers la grille)`);
        else { this.L(`✗ ${npc} est derrière ${lock} (fermé)`); return []; }
      }
    }
    const r = new DialogueRunner(g, id);
    let v = r.start();
    const seen: string[] = [];
    const q = [...picks];
    let guard = 0;
    while (v && guard++ < 300) {
      seen.push(v.text);
      if (v.choices.length) {
        const want = q.shift();
        if (want === undefined) { this.L(`  (fin volontaire du dialogue ${id} ; choix : ${v.choices.map((c) => c.text).join(' / ')})`); break; }
        const c = v.choices.find((x) => x.text.includes(want));
        if (!c) { this.L(`  ✗ choix « ${want} » absent dans ${id}.${v.nodeId} ; choix : ${v.choices.map((x) => x.text).join(' / ')}`); break; }
        this.L(`  ▸ ${id} : « ${c.text} »`);
        v = r.choose(c.index);
      } else v = r.next();
    }
    this.L(`💬 ${id} : ${seen.map((s) => s.replace(/\s+/g, ' ').slice(0, 90)).join(' ‖ ')}`);
    this.flush();
    return seen;
  }

  wait(min: number) { if (!this.dead && !this.ended) { this.g.advance(min); this.flush(); } }
  until(at: string) { const t = absTime(at); if (t > this.g.state.time) this.wait(t - this.g.state.time); }
  link(a: string, b: string) {
    const r = this.g.tryLink(a, b);
    this.L(`🔗 ${a} + ${b} → ${r.ok ? r.result + (r.already ? ' (déjà)' : '') : 'rien'}`);
    return r;
  }

  // ------------------------------------------------------------------ séquences (copie de l'App)
  flush() {
    let guard = 0;
    while (this.pending.length && guard++ < 20 && !this.dead) {
      const d = this.pending.shift()!;
      switch (d.ui) {
        case 'council': this.council(); break;
        case 'rosa_lock': this.g.applyFx(['lock:d_cage', 'clr:grille_rosa']); this.L('Rosa referme la grille.'); break;
        case 'forced_sleep': this.L('Sommeil forcé (23:45).'); this.sleepNight(true); break;
        case 'expedition_prep': this.expeditionPrep(); break;
        case 'departure': this.departure(); break;
        case 'assembly': this.assembly(); break;
        case '_collapse': this.collapse(); break;
        default: break;
      }
    }
  }

  private collapse() {
    const g = this.g;
    delete g.state.flags['_collapse_pending'];
    g.advance(120);
    this.L('Malaise : réveil à l’infirmerie.');
    this.talk('sorel', [], 'reveil_infirmerie');
  }

  private council() {
    const g = this.g;
    if (g.state.zone !== 'train') return;
    this.x = this.secX('train', 'cantine');
    g.completeObjective('q_main', 'conseil');
    this.snap('conseil (avant)');
    let budget = 5;
    for (const id of COUNCIL_ORDER) {
      const m = CONTENT.motions[id];
      if (!g.check(m.if)) { this.L(`Conseil : motion « ${m.title} » non présentée`); continue; }
      const p = this.policy.council?.(m, this) ?? { position: null, args: 'none' };
      const s = newSession(m);
      s.position = p.position;
      const avail = availableArgs(g, s);
      const want = p.args === 'none' ? [] : p.args === 'toward' ? avail.filter((a) => a.toward === p.position).map((a) => a.id) : p.args;
      for (const aid of want) { if (budget <= 0) break; const rep = useArg(g, s, aid); if (rep) { budget--; this.argsUsed.push(`${id}.${aid}`); this.L(`  argument ${aid} → ${rep}`); } }
      const r = resolveVote(g, s);
      applyResult(g, s, r);
      this.votes[id] = r.winner;
      this.L(`Conseil : « ${m.title} » → ${r.winner} (position ${p.position ?? 'abstention'}${r.tie ? ` ; égalité ${r.decidedByPlayer ? 'tranchée par la position du joueur' : `→ repli « ${m.fallback} »`}` : ''} ; votes ${JSON.stringify(r.votes)} ; args dispo : ${avail.map((a) => a.id).join(',') || 'aucun'})`);
    }
    g.applyFx(['checkpoint:Après le conseil']);
    this.snap('conseil (après)');
  }

  sleepNight(forced: boolean) {
    const g = this.g;
    g.setFlag('dort');
    g.completeObjective('q_main', 'dormir');
    g.sleepUntil(absTime('d2@05:30'));
    if (g.flag('dortoirs_calfeutres')) g.changeStat('rest', 10);
    if (forced) g.changeStat('rest', -15);
    const sp = CONTENT.train.spots.find((s) => s.id === SLEEP_SPOT[this.char])!;
    g.state.pos = spotAbs(this.laid.train, sp);
    this.x = g.state.pos.x;
    this.flush();
  }

  /** Aller dormir volontairement (menu « Dormir jusqu’à l’aube »). */
  sleep() { this.L('Va dormir.'); this.sleepNight(false); }

  private expeditionPrep() {
    const g = this.g;
    if (g.state.zone !== 'train') return;
    this.snap('aube (préparation)');
    const p = this.policy.expedition?.(this) ?? { companion: null, gear: {} };
    // Mêmes règles que companionOptions (src/ui/expedition.ts).
    if (p.companion) {
      const rel = (n: string) => g.rel(n);
      const maraFree = !!(g.flag('mara_libre') || g.flag('mara_cachee_ailleurs') || (g.flag('mara_trouvee') && !g.flag('mara_capturee')));
      const ok: Record<string, boolean> = {
        vasseur: rel('vasseur').trust >= 0 && !(g.flag('vasseur_revelee') && rel('vasseur').trust < 1),
        castel: rel('castel').trust > -2,
        mara: rel('mara').met && !g.flag('mara_expulsee') && maraFree && rel('mara').trust >= 1,
        noe: rel('noe').trust >= 1 && !g.flag('noe_puni'),
      };
      if (!ok[p.companion]) { this.L(`(compagnon ${p.companion} refusé par les règles de l’écran de préparation : départ seul)`); p.companion = null; }
    }
    // gearOptions (ui/expedition.ts)
    const fxOf: Record<string, string[]> = { ration: ['res:food-0.2'], bandage_comp: ['res:meds-1'], jerrican: [], cric: [], lampe: [], masque: [] };
    for (const [id, n] of Object.entries(p.gear)) for (let i = 0; i < n; i++) { g.give(id, 1, true); g.applyFx(fxOf[id] ?? []); }
    g.state.expedition = { companion: p.companion, compHealth: 100, start: g.state.time, deadline: absTime('d2@12:00'), returned: false, missedTrain: false, log: [] };
    if (p.companion) g.setFlag('companion', p.companion);
    g.setFlag('expedition_active');
    g.fireScripted('expedition_depart');
    g.advance(Math.max(0, absTime('d2@06:30') - g.state.time));
    g.state.zone = 'exterior';
    const sp = CONTENT.exterior.spots.find((s) => s.id === 'q_arrivee')!;
    g.state.pos = spotAbs(this.laid.exterior, sp);
    this.x = g.state.pos.x;
    this.L(`Expédition : compagnon ${p.companion ?? 'aucun'}, matériel ${JSON.stringify(p.gear)}`);
    this.talk('_', [], 'depart_quai');
  }

  returnToTrain(late: boolean) {
    const g = this.g;
    const e = g.state.expedition;
    const lines: string[] = [];
    const jer = g.itemQty('jerrican_plein');
    if (jer) { g.take('jerrican_plein', jer); g.give('jerrican', jer, true); g.changeRes('water', jer); g.addConseq('cq_eau_tour'); lines.push(`Vous versez ${jer * 20} litres dans la citerne.`); }
    if (g.flag('theo_suit')) { g.setFlag('theo_sauve'); g.addConseq('cq_theo_sauve'); g.completeObjective('q_main', 'theo'); lines.push('Théo est hissé à bord.'); }
    else if (g.flag('signal_rouge') && g.flag('theo_reste')) { g.setFlag('theo_sauve'); g.addConseq('cq_theo_sauve'); lines.push(late ? 'Au poste d\'aiguillage, Anselme hisse Théo dans la voiture de queue avant de vous faire signe.' : 'Le VAYN s\'est arrêté devant le poste d\'aiguillage, comme Anselme l\'avait promis. Il a hissé Théo dans la voiture de queue.'); }
    else if (g.flag('theo_reste')) g.addConseq('cq_theo_laisse');
    if (e?.companion && e.compHealth < 40) { g.addConseq('cq_comp_blesse'); lines.push(`${CONTENT.npcs[e.companion].name} rentre blessé.`); }
    if (g.itemQty('relais_k3')) lines.push('Le relais K3 est dans votre poche.');
    if (e) e.returned = true;
    g.setFlag('expedition_finie');
    delete g.state.flags['expedition_active'];
    g.state.zone = 'train';
    const sp = CONTENT.train.spots.find((s) => s.id === 's_couloir')!;
    g.state.pos = spotAbs(this.laid.train, sp);
    this.x = g.state.pos.x;
    if (g.itemQty('relais_k3') || g.state.objects['filtration'] === 'repare') g.completeObjective('q_main', 'expedition');
    g.applyFx(['checkpoint:Retour d’expédition']);
    this.L(`Retour à bord${late ? ' (en retard)' : ''} : ${lines.join(' ') || '—'}`);
    this.snap('retour à bord');
    if (late || (g.flag('depart_retarde') && !g.flag('retard_fini'))) this.departure();
    this.flush();
  }

  private departure() {
    const g = this.g;
    if (g.flag('train_roule')) return;
    if (g.state.zone === 'exterior') { this.missedTrain(false); return; }
    g.setFlag('train_roule');
    if (g.flag('mara_expulsee')) g.observeConseq('cq_mara_expulsee', 'anselme');
    g.applyFx(['checkpoint:Départ de Saint-Aubin']);
    this.L('Départ du train (12:00).');
  }

  private missedTrain(final: boolean) {
    // Même ordre que App.missedTrainFlow : sursis de Vasseur d'abord, puis signal / draisine, sinon abandon.
    const g = this.g;
    const vasseurHelps = !final && !g.flag('depart_retarde') && (g.rel('vasseur').trust >= 3 || this.char === 'mecanicien') && g.state.expedition?.companion !== 'vasseur';
    if (vasseurHelps) { g.setFlag('depart_retarde'); this.L('Sursis : Vasseur bloque le pilote 20 minutes.'); return; }
    if (g.flag('signal_rouge')) { this.L('Train manqué → course jusqu’au poste (signal rouge).'); g.advance(20); g.changeStat('health', -5); this.returnToTrain(true); return; }
    if (g.flag('draisine_ok')) { this.L('Train manqué → draisine.'); g.advance(40); g.changeStat('health', -8); g.changeCompanionHealth(-10); if (g.flag('theo_reste') && g.flag('signal_rouge')) g.setFlag('theo_abandonne_signal'); this.returnToTrain(true); return; }
    if (g.state.expedition) g.state.expedition.missedTrain = true;
    g.die('Abandonné à Saint-Aubin');
  }

  private assembly() {
    const g = this.g;
    if (g.state.zone !== 'train' || g.state.chapterDone) return;
    this.snap('assemblée (avant)');
    this.L(`Assemblée : train_roule=${g.flag('train_roule')} (le départ a-t-il eu lieu ?)`);
    const avail = REVELATIONS.filter((r) => g.check(r.if));
    this.revAvail = avail.map((r) => r.id);
    const chosen = this.policy.revelations?.(avail, this) ?? avail.map((r) => r.id);
    for (const r of avail) if (chosen.includes(r.id)) { g.applyFx(r.fx, `revelation:${r.id}`); this.revUsed.push(r.id); }
    const m = CONTENT.motions[ASSEMBLY_MOTION];
    const p = this.policy.direction?.(this) ?? { position: null, args: 'none' };
    const s = newSession(m);
    s.position = p.position;
    let budget = 3;
    const argsAvail = availableArgs(g, s);
    if (p.args === 'toward') for (const a of argsAvail.filter((x) => x.toward === p.position)) { if (budget-- <= 0) break; useArg(g, s, a.id); this.argsUsed.push(`direction.${a.id}`); }
    const res = resolveVote(g, s);
    applyResult(g, s, res);
    this.votes.direction = res.winner;
    this.L(`Assemblée : révélations dispo [${this.revAvail.join(', ') || 'aucune'}], faites [${this.revUsed.join(', ') || 'aucune'}] ; direction → ${res.winner} (votes ${JSON.stringify(res.votes)} ; args dispo ${argsAvail.map((a) => a.id).join(',') || 'aucun'})`);
    g.completeObjective('q_main', 'assemblee');
    g.completeQuest('q_main');
    g.addEntry('c_vayn2');
    g.state.chapterDone = true;
    this.epilogue = buildEpilogue(g);
    this.twist = twistText(g);
    this.ended = true;
    this.snap('fin');
  }

  /** Expédition : rentrer au train en marchant jusqu'à la portière. */
  /** Reflet fidèle de App.checkCompanion : la règle vit dans le moteur (Game.checkCompanionDeath). */
  checkCompanion() {
    const mort = this.g.checkCompanionDeath();
    if (mort) this.L(`${CONTENT.npcs[mort].name} meurt : ${mort} est retiré du bord (point : ${this.g.npcSpot(mort) ?? 'aucun'}).`);
  }

  walkBack() {
    if (this.dead || this.ended || this.g.state.zone !== 'exterior') return;
    const o = this.findObj('portiere')!;
    this.walkTo(objAbs(this.laid.exterior, o).x);
    if (this.dead) return;
    // Comme l'App : la portière appelle toujours returnToTrain(false), même pendant le sursis de Vasseur.
    if (this.g.state.zone === 'exterior' && !this.g.flag('train_roule')) this.returnToTrain(false);
  }

  /** Passe la fin du jour 2 jusqu'à l'assemblée (après le retour). */
  toAssembly() {
    if (this.dead || this.ended) return;
    if (this.g.state.zone === 'exterior') { this.until('d2@12:00'); this.until('d2@12:25'); }
    this.until('d2@12:00');
    this.until('d2@15:00');
  }

  report(): string {
    const g = this.g;
    const out: string[] = [];
    out.push(`### ${this.label} — ${CONTENT.chars[this.char].title}`);
    out.push(this.dead ? `**Mort : ${this.dead}**` : this.ended ? 'Chapitre terminé.' : '**Chapitre NON terminé.**');
    out.push(`Votes : ${JSON.stringify(this.votes)} ; arguments : ${this.argsUsed.join(', ') || 'aucun'}`);
    out.push(`Révélations possibles à l’assemblée : ${this.revAvail.join(', ') || 'aucune'} ; faites : ${this.revUsed.join(', ') || 'aucune'}`);
    out.push(`Malaises : ${this.collapses} ; minutes dans la brume : ${this.hazeHit}`);
    out.push('Instantanés (heure — objectif affiché dans le HUD — entrées) :');
    for (const s of this.snaps) out.push(`- ${s.label} [${s.time}] HUD : « ${s.hud} » — ${s.entries.length} entrées`);
    const ent = Object.keys(g.state.journal.entries);
    out.push(`Carnet final (${ent.length}) : ${ent.join(', ')}`);
    out.push('Missions : ' + Object.entries(g.state.quests).map(([id, q]) => `${id}=${q.status} [${CONTENT.quests[id].objectives.map((o) => (g.objectiveDone(id, o.id) ? '✓' : '·') + o.id).join(' ')}]`).join(' | '));
    out.push('Conséquences : ' + g.state.conseqs.map((c) => c.id + (c.observed.length ? `(+${c.observed.join(',')})` : '')).join(', '));
    if (this.twist.length) out.push('Fin (découverte) : ' + this.twist.join(' '));
    for (const sec of this.epilogue) out.push(`Épilogue — ${sec.title} : ${sec.lines.join(' ')}`);
    return out.join('\n');
  }
}

/** Grille de compréhension : le joueur dispose-t-il de quoi comprendre chaque révélation ? */
export function comprehension(r: Run): Record<string, string> {
  const k = (id: string) => r.g.knows(id);
  const out: Record<string, string> = {};
  out['Panne : cause'] = k('f_panne') || k('t_theo_recit') ? 'oui' : k('f_k3_radio') || k('f_pompe_morte') || k('t_vasseur_pompe') ? 'partielle' : 'non';
  out['Théo : ce qui lui est arrivé'] = k('t_theo_recit') ? 'oui (récit de Théo)' : k('f_chronologie') && k('c_traces_theo') ? 'reconstituée' : k('t_castel_aveu') || k('t_noe_saut') || k('c_traces_theo') ? 'partielle' : 'non';
  out['Réserves : où va l’eau'] = k('f_echange_antibio') || k('t_marchetti_aveu') ? 'oui (avec le motif)' : k('f_detournement') ? 'oui (sans le motif)' : k('c_registre_cabine0') || k('c_compteur_eau') || k('t_agathe_soute') || k('c_tableau_rations') ? 'soupçon' : 'non';
  out['Clandestine : qui, pourquoi'] = k('f_mere') ? 'oui' : k('t_mara_mere') ? 'motif connu' : r.g.rel('mara').met ? 'rencontrée' : 'non';
  out['Clairval : existe ?'] = k('c_emission_clairval') && (k('c_registre_radio') || k('t_mara_clairval') || k('c_mur_messages')) ? 'indices + doute (boucle)' : k('c_registre_radio') || k('t_mara_clairval') || k('c_mur_messages') ? 'indices sans doute' : k('c_emission_clairval') ? 'boucle seule (doute)' : 'non';
  out['Castel a caché Clairval'] = k('f_signal_cache') ? 'oui' : k('c_registre_radio') ? 'indice' : 'non';
  out['VAYN-2 : préparé ?'] = k('c_cabine_horaire') || k('t_anselme') ? 'préparé' : 'découverte brute';
  return out;
}
