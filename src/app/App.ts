// Contrôleur central : relie le moteur, les scènes Phaser, l'interface DOM, l'audio et les sauvegardes.
import Phaser from 'phaser';
import { CONTENT, COUNCIL_ORDER, ASSEMBLY_MOTION } from '../content';
import { INTRO, buildEpilogue, twistText } from '../content/story';
import { Game } from '../engine/game';
import { createInitialState } from '../engine/state';
import { SaveManager } from '../engine/save';
import { DialogueRunner, type DialogueView } from '../engine/dialogue';
import { absTime, clockOf, fmtDateTime, hm } from '../engine/time';
import { spotAbs, layoutStrip, sectionAt } from '../engine/layout';
import type { ActionDef, CharId, Content, DoorDef, GameState, Mode, ObjectDef, ScriptedEventDef } from '../engine/types';
import { AudioEngine } from '../audio/AudioEngine';
import { UI, type ToastKind } from '../ui/UI';
import { Hud, type TabId } from '../ui/hud';
import { DialogueBox } from '../ui/dialogue';
import { actionMenu, type MenuAction } from '../ui/menu';
import { carnetPanel, sacPanel, trainPanel, menuPanel } from '../ui/panels';
import { aboutScreen, charScreen, confirmBox, deathScreen, endingScreen, modeScreen, settingsScreen, statsLines, titleScreen } from '../ui/screens';
import { councilFlow } from '../ui/council';
import { expeditionPrep, gearOptions } from '../ui/expedition';
import { btn, h } from '../ui/dom';
import { icon } from '../ui/icons';
import { WorldScene, type WorldHost } from '../world/WorldScene';
import { RideScene, type RideMode } from '../world/RideScene';
import { createStorage } from './storage';

export interface Settings { master: number; music: number; ambience: number; sfx: number; textSpeed: number }
const DEFAULT_SETTINGS: Settings = { master: 0.8, music: 0.55, ambience: 0.7, sfx: 0.8, textSpeed: 0.6 };

const SLEEP_SPOT: Record<CharId, string> = { controleur: 'ad_bureau', passager: 'd_couchette_sacha', majordome: 'sa_gardemanger', mecanicien: 'd_lit1' };

export class App implements WorldHost {
  readonly content: Content = CONTENT;
  readonly save = new SaveManager(createStorage());
  readonly audio = new AudioEngine();
  readonly ui: UI;
  settings: Settings = { ...DEFAULT_SETTINGS };
  pg!: Phaser.Game;
  game: Game | null = null;
  private hud: Hud;
  private dlg: DialogueRunner | null = null;
  private dlgBox: DialogueBox | null = null;
  private dlgQueue: string[] = [];
  private narration: { onDone?: () => void } | null = null;
  private queue: (() => void)[] = [];
  private unsub: (() => void)[] = [];
  private transitioning = false;
  private lastAutosave = 0;
  private hazeWarned = false;
  private darkWarned = false;
  private flowOpen = false;

  constructor() {
    this.ui = new UI(document.getElementById('ui')!);
    this.hud = new Hud((t) => this.openTab(t), () => this.waitFlow());
    this.ui.hud.append(this.hud.el);
    this.hud.show(false);
  }

  // ======================================================================== démarrage
  async boot() {
    this.ui.loading(0.15);
    this.settings = await this.save.getSettings(DEFAULT_SETTINGS);
    this.applySettings();
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    this.pg = new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'game',
      width: Math.round(window.innerWidth * dpr),
      height: Math.round(window.innerHeight * dpr),
      backgroundColor: '#05060a',
      pixelArt: true,
      roundPixels: true,
      banner: false,
      scale: { mode: Phaser.Scale.NONE, zoom: 1 / dpr },
      input: { activePointers: 3 },
      scene: [],
    });
    await new Promise<void>((r) => this.pg.events.once('ready', () => r()));
    this.pg.scene.add('ride', RideScene, false);
    this.pg.scene.add('world', WorldScene, false);
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('orientationchange', () => setTimeout(() => this.resize(), 250));
    document.addEventListener('pointerdown', () => this.audio.unlock(), true);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) void this.autosave(true);
    });
    setInterval(() => {
      if (this.game && !document.hidden && !this.game.state.dead) this.game.state.playSeconds++;
      if (this.game && performance.now() - this.lastAutosave > 120000) void this.autosave();
    }, 1000);
    this.ui.loading(0.9);
    await this.toTitle();
    this.ui.loading(null);
  }

  private resize() {
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    this.pg.scale.resize(Math.round(window.innerWidth * dpr), Math.round(window.innerHeight * dpr));
    this.pg.scale.setZoom(1 / dpr);
    this.world()?.layout();
  }

  world(): WorldScene | null {
    const s = this.pg?.scene.getScene('world') as WorldScene | null;
    return s && this.pg.scene.isActive('world') ? s : null;
  }

  ride(): RideScene | null {
    const s = this.pg?.scene.getScene('ride') as RideScene | null;
    return s && this.pg.scene.isActive('ride') ? s : null;
  }

  private startRide(mode: RideMode) {
    if (this.pg.scene.isActive('world')) this.pg.scene.stop('world');
    if (this.pg.scene.isActive('ride')) this.ride()!.setMode(mode);
    else this.pg.scene.start('ride', { mode });
  }

  // ======================================================================== paramètres
  applySettings() {
    this.audio.setVolumes(this.settings);
  }

  async persistSettings() {
    await this.save.setSettings(this.settings);
  }

  openSettings() {
    const prev = this.ui.screen.firstElementChild as HTMLElement | null;
    const el = settingsScreen(this, () => {
      this.ui.setScreen(null);
      if (prev) this.ui.screen.append(prev);
      this.pump();
    });
    this.ui.screen.replaceChildren(el);
  }

  textSpeed(): number {
    const v = this.settings.textSpeed;
    return v >= 0.99 ? 0 : 25 + v * 110;
  }

  sfx(k: string) {
    this.audio.sfx(k);
  }

  // ======================================================================== écran titre et nouvelle partie
  async toTitle() {
    this.teardownGame();
    this.startRide('title');
    this.audio.setAmbience('title');
    this.audio.setMood('title');
    const meta = await this.save.meta();
    let label: string | null = null;
    if (meta) {
      const c = this.content.chars[meta.char as CharId];
      label = `${c?.title ?? meta.char} · ${fmtDateTime(meta.time)} · ${meta.mode === 'onelife' ? 'ONE LIFE' : 'Histoire'}`;
    }
    this.ui.setScreen(titleScreen(this, { canContinue: label, hasHistory: false }));
  }

  showAbout() {
    this.ui.setScreen(aboutScreen(this));
  }

  async continueGame() {
    const r = await this.save.load();
    if (!r.ok) {
      this.ui.toast(r.reason === 'dead' ? 'Cette partie ONE LIFE est terminée.' : r.reason === 'corrupt' ? 'Sauvegarde illisible.' : 'Aucune sauvegarde.', 'warn');
      await this.toTitle();
      return;
    }
    await this.startGame(r.state, false);
    if (r.fromCheckpoint) this.ui.toast(`Reprise au point : ${r.label}`, 'info');
  }

  async newGameFlow() {
    const meta = await this.save.meta();
    const go = () => this.ui.setScreen(modeScreen(this, (m) => this.playIntro(() => this.pickChar(m))));
    if (meta) this.confirm('Une partie est déjà en cours. La remplacer par une nouvelle ?', go);
    else go();
  }

  private pickChar(mode: Mode) {
    this.startRide('title');
    this.ui.setScreen(charScreen(this, (c) => void this.startNew(c, mode)));
  }

  /** Cinématique d'introduction (passable). */
  playIntro(onDone: () => void) {
    this.startRide('embark');
    this.audio.setAmbience('moving');
    this.audio.setMood('calm');
    let i = 0;
    let timer = 0;
    const card = h('div', { class: 'intro-card' });
    const root = h('div', { class: 'screen letterbox', style: 'justify-content:flex-end' }, card);
    const finish = () => {
      clearTimeout(timer);
      root.remove();
      onDone();
    };
    const skip = btn(['Passer ', icon('skip')], finish, 'btn small skip');
    root.append(skip);
    const show = () => {
      if (i >= INTRO.length) {
        finish();
        return;
      }
      const c = INTRO[i];
      this.ride()?.setMode(c.scene);
      if (c.scene === 'catastrophe') this.audio.setMood('tension');
      if (c.scene === 'later') this.audio.setAmbience('train');
      card.className = 'intro-card';
      void card.offsetWidth;
      card.className = 'intro-card in';
      card.replaceChildren(c.title ? h('div', { class: 't' }, c.title) : '', h('div', { class: 'x' }, c.text));
      timer = window.setTimeout(() => { i++; show(); }, c.dur);
    };
    root.addEventListener('click', () => { clearTimeout(timer); i++; show(); });
    this.ui.setScreen(root);
    show();
  }

  async startNew(char: CharId, mode: Mode) {
    const state = createInitialState(this.content, char, mode);
    await this.startGame(state, true);
  }

  // ======================================================================== partie
  private teardownGame() {
    for (const u of this.unsub) u();
    this.unsub = [];
    this.dlgBox?.destroy();
    this.dlgBox = null;
    this.dlg = null;
    this.dlgQueue = [];
    this.narration = null;
    this.queue = [];
    this.flowOpen = false;
    this.ui.setMenu(null);
    this.ui.setPanel(null);
    this.ui.setFlow(null);
    this.ui.setScreen(null);
    this.ui.clearLabels();
    this.hud.show(false);
    if (this.pg?.scene.isActive('world')) this.pg.scene.stop('world');
    this.game = null;
  }

  async startGame(state: GameState, fresh: boolean) {
    this.teardownGame();
    await this.ui.fade(true, 300);
    const g = new Game(this.content, state);
    this.game = g;
    this.bindGame(g);
    this.enterWorld();
    this.hud.show(true);
    this.refreshHud();
    await this.ui.fade(false, 500);
    if (fresh) {
      this.startDialogue(`start_${state.char}`);
      this.enqueue(() => {
        this.ui.toast('Touchez le sol pour marcher, un objet ou une personne pour interagir. Glissez pour regarder, pincez pour zoomer.', 'info');
        this.pump();
      });
      await this.autosave(true);
    } else if (state.chapterDone) {
      this.enqueue(() => this.showEnding());
    } else this.resumePending();
  }

  private enterWorld() {
    const g = this.game!;
    if (this.pg.scene.isActive('ride')) this.pg.scene.stop('ride');
    if (this.pg.scene.isActive('world')) this.pg.scene.stop('world');
    this.pg.scene.start('world', { host: this, zone: g.state.zone });
    this.updateAmbience();
  }

  /** Après un chargement : relance une séquence obligatoire interrompue (conseil, expédition, départ, assemblée). */
  private resumePending() {
    const g = this.game!;
    const f = (id: string) => g.state.fired.includes(id);
    if (!g.flag('intro_vu')) this.enqueue(() => this.startDialogue(`start_${g.state.char}`));
    if (f('conseil') && g.flag('vote_expedition') === undefined) this.enqueue(() => this.councilFlow());
    if (f('reveil') && !f('expedition_depart') && g.state.zone === 'train') this.enqueue(() => this.expeditionPrepFlow());
    if (f('depart') && !g.flag('train_roule')) this.enqueue(() => this.departureFlow());
    if (f('assemblee') && !g.state.chapterDone && g.state.zone === 'train') this.enqueue(() => this.assemblyFlow());
  }

  private updateAmbience() {
    const g = this.game;
    if (!g) return;
    if (g.state.zone === 'exterior') {
      this.audio.setAmbience('exterior');
      this.audio.setMood('expedition');
    } else {
      this.audio.setAmbience(g.flag('train_roule') ? 'moving' : 'train');
      this.audio.setMood('calm');
    }
  }

  private bindGame(g: Game) {
    const on = <T>(ev: string, fn: (p: T) => void) => this.unsub.push(g.on<T>(ev, fn));
    on<{ text: string; kind: ToastKind }>('toast', (t) => {
      this.ui.toast(t.text, t.kind);
      if (t.kind === 'warn') this.sfx('warn');
      else if (t.kind === 'quest') this.sfx('quest');
      else if (t.kind === 'item') this.sfx('item');
    });
    on<string>('sfx', (k) => this.sfx(k === 'entry' ? 'entry' : k));
    on<string>('music', (k) => { if (k === 'reveal') this.sfx('fact'); });
    on<string>('dialogue', (id) => this.startDialogue(id));
    on<ScriptedEventDef>('scripted', (def) => this.enqueue(() => this.runScripted(def)));
    on<{ cause: string }>('death', (d) => this.enqueue(() => void this.onDeath(d.cause), true));
    on('collapse', () => this.enqueue(() => this.collapseFlow()));
    on<string>('checkpoint', (label) => setTimeout(() => void this.checkpoint(label), 0));
    on('companion', () => this.checkCompanion());
    on<{ before: number; after: number }>('time', (t) => this.onTime(t.before, t.after));
    on('change', () => this.refreshHud());
  }

  refreshHud() {
    const g = this.game;
    if (!g) return;
    const w = this.world();
    this.hud.update(g, w ? w.place() : { section: '', room: '' });
  }

  // ======================================================================== file d'attente des séquences
  /** Une séquence (conseil, sommeil…) attend que l'interface soit libre. */
  enqueue(fn: () => void, front = false) {
    if (front) this.queue.unshift(fn);
    else this.queue.push(fn);
    setTimeout(() => this.pump(), 0);
  }

  private uiBusy(): boolean {
    return !!this.dlg || !!this.narration || this.ui.hasMenu || this.ui.hasPanel || this.flowOpen || this.ui.hasScreen || this.transitioning;
  }

  pump() {
    if (this.uiBusy()) return;
    const fn = this.queue.shift();
    if (fn) fn();
  }

  busy(): boolean {
    return this.uiBusy() || !this.game || this.game.state.dead;
  }

  // ======================================================================== hôte de la scène monde
  frame(scene: WorldScene) {
    const g = this.game;
    if (!g) return;
    this.hud.update(g, scene.place());
    const items: { key: string; x: number; y: number; html: string; cls: string }[] = [];
    for (const n of scene.visibleNpcs()) {
      const def = this.content.npcs[n.id];
      if (!def) continue;
      const p = scene.worldToScreen(n.x, n.y + 2);
      const met = g.rel(n.id).met || def.ambient;
      const name = met ? def.name : def.role;
      items.push({ key: `n:${n.id}`, x: p.x, y: p.y, html: def.ambient ? `<span style="opacity:.7">${name}</span>` : name, cls: 'npc-label' });
    }
    if (!this.uiBusy()) {
      for (const v of scene.visibleObjects()) {
        if (!v.o.important || !g.check(v.o.important)) continue;
        if (!this.availableActions(v.o.actions).length) continue;
        const p = scene.worldToScreen(v.abs.x, v.abs.y - (v.o.elev ?? 0) - v.img.height - 2);
        items.push({ key: `o:${v.o.id}`, x: p.x, y: p.y, html: '', cls: 'obj-mark' });
      }
    }
    this.ui.syncLabels(items);
    this.ui.placeBubbles((k) => {
      const a = scene.npcActor(k);
      return a ? scene.worldToScreen(a.x, a.y - 34) : null;
    });
    // obscurité du dépôt
    if (g.state.zone === 'exterior') {
      const sec = sectionAt(scene.laid, scene.player.x);
      const dark = !!sec?.dark && !g.lampeAllumee();
      scene.setDark(sec?.dark ? (g.lampeAllumee() ? 0.45 : 0.86) : 0);
      if (dark && !this.darkWarned) {
        this.darkWarned = true;
        this.ui.toast(g.itemQty('lampe')
          ? 'Il fait noir comme dans un four. Votre lampe est éteinte : ouvrez le Sac pour l’allumer.'
          : 'Il fait noir comme dans un four. Sans lampe, impossible de fouiller quoi que ce soit.', 'warn');
      }
    }
  }

  private availableActions(list: ActionDef[] | undefined): ActionDef[] {
    return this.game!.availableActions(list);
  }

  reachedObject(o: ObjectDef) {
    const g = this.game!;
    const w = this.world();
    if (!w) return;
    const sec = w.laid.secById[o.sec];
    if (sec?.dark && !g.lampeAllumee()) {
      this.narrate(g.itemQty('lampe')
        ? 'Il fait trop noir pour distinguer quoi que ce soit. Votre lampe est éteinte : ouvrez le Sac, et allumez-la.'
        : 'Il fait trop noir pour distinguer quoi que ce soit. Il vous faudrait une lampe — le Passeur en vend peut-être.');
      return;
    }
    const acts = this.availableActions(o.actions);
    if (!acts.length) {
      this.ui.toast(`${o.name} : rien de plus à faire ici.`);
      return;
    }
    const abs = w.objs.get(o.id)!;
    const p = w.worldToScreen(abs.abs.x, abs.abs.y - (o.elev ?? 0) - abs.img.height);
    const items: MenuAction[] = acts.map((a) => ({ label: g.fmt(a.label), tag: a.tag && !['storage', 'sleep', 'return'].includes(a.tag) ? a.tag : undefined, time: g.actionTime(a) || undefined, danger: a.danger, run: () => this.runAction(a, o.name) }));
    this.ui.setMenu(actionMenu({ title: o.name, actions: items, x: p.x, y: p.y, onClose: () => this.closeMenu(), sfx: (k) => this.sfx(k) }));
  }

  reachedDoor(d: DoorDef) {
    const g = this.game!;
    const w = this.world();
    if (!w || g.doorOpen(d.id)) return;
    const acts = this.availableActions(d.actions);
    const p = w.worldToScreen(w.player.x, w.player.y - 40);
    const items: MenuAction[] = acts.map((a) => ({ label: g.fmt(a.label), tag: a.tag, time: a.time, danger: a.danger, run: () => this.runAction(a, d.name) }));
    this.ui.setMenu(actionMenu({ title: d.name, note: d.lockedText ?? 'Fermé.', actions: items, x: p.x, y: p.y, onClose: () => this.closeMenu(), sfx: (k) => this.sfx(k) }));
    this.sfx('door');
  }

  reachedNpc(id: string) {
    const g = this.game!;
    const def = this.content.npcs[id];
    if (!def) return;
    if (def.ambient || !def.dialogue) {
      const barks = (def.barks ?? []).filter((b) => g.check(b.if));
      const pick = barks.filter((b) => b.if).length ? barks.filter((b) => b.if) : barks;
      const b = pick[Math.floor(Math.random() * pick.length)];
      if (b) this.ui.bubble(id, g.fmt(b.text));
      return;
    }
    this.startDialogue(def.dialogue, id);
  }

  walked(px: number) {
    const g = this.game;
    if (!g) return;
    g.walk(px, g.flag('theo_suit') ? 1.5 : 1);
  }

  closeMenu() {
    this.ui.setMenu(null);
    this.pump();
  }

  // ======================================================================== actions
  runAction(a: ActionDef, title: string) {
    const g = this.game!;
    this.ui.setMenu(null);
    if (a.tag === 'storage') {
      this.ui.setPanel(sacPanel(this, true));
      return;
    }
    if (a.tag === 'sleep') {
      this.sleepFlow();
      return;
    }
    if (a.tag === 'return') {
      this.confirm('Remonter à bord ? L’expédition sera terminée.', () => void this.returnToTrain(false));
      return;
    }
    const w = this.world();
    if (w) w.player.interacting = 0.6;
    const text = g.perform(a, `action:${title}`);
    if (g.state.dead) return;
    if (text) this.narrate(text, title, () => { if (a.dlg) this.startDialogue(a.dlg); });
    else if (a.dlg) this.startDialogue(a.dlg);
    else this.pump();
    void this.autosave();
  }

  useItem(id: string): string | null {
    const g = this.game!;
    const t = g.useItem(id);
    this.sfx('item');
    return t;
  }

  // ======================================================================== dialogues et narration
  private dlgBoxFor(): DialogueBox {
    const box = new DialogueBox({
      look: (sid) => (sid === 'pc' ? this.content.chars[this.game!.state.char].look : this.content.npcs[sid]?.look ?? null),
      role: (sid) => (sid === 'pc' ? this.content.chars[this.game!.state.char].title : this.content.npcs[sid]?.role ?? ''),
      speed: () => this.textSpeed(),
      onChoice: (i) => this.dlgChoose(i),
      onNext: () => this.dlgNext(),
      sfx: (k) => this.sfx(k),
    });
    this.ui.dlg.append(box.el);
    return box;
  }

  narrate(text: string, title = '', onDone?: () => void) {
    if (this.dlgBox) this.dlgBox.destroy();
    this.narration = { onDone };
    this.dlgBox = this.dlgBoxFor();
    const v: DialogueView = { dialogueId: '', nodeId: '', speakerId: 'narr', speakerName: title, speakerColor: '#9a8f7e', speakerKind: 'narr', text, choices: [], isEnd: true };
    this.dlgBox.show(v);
  }

  startDialogue(id: string, npcId?: string) {
    if (this.dlg || this.narration) {
      if (!this.dlgQueue.includes(id)) this.dlgQueue.push(id);
      return;
    }
    const g = this.game;
    if (!g) return;
    const r = new DialogueRunner(g, id);
    const v = r.start();
    if (!v) {
      this.pump();
      return;
    }
    this.dlg = r;
    this.dlgBox?.destroy();
    this.dlgBox = this.dlgBoxFor();
    const w = this.world();
    const npc = npcId ?? r.npc;
    const a = npc ? w?.npcActor(npc) : null;
    if (w && a) {
      a.stop();
      a.talking = true;
      w.setFocus((a.x + w.player.x) / 2);
    }
    this.dlgBox.show(v);
  }

  private dlgChoose(i: number) {
    if (!this.dlg) return;
    const v = this.dlg.choose(i);
    if (v) this.dlgBox!.show(v);
    else this.endDialogue();
  }

  private dlgNext() {
    if (this.narration) {
      const cb = this.narration.onDone;
      this.narration = null;
      this.dlgBox?.destroy();
      this.dlgBox = null;
      cb?.();
      this.afterTalk();
      return;
    }
    if (!this.dlg) return;
    const v = this.dlg.next();
    if (v) this.dlgBox!.show(v);
    else this.endDialogue();
  }

  private endDialogue() {
    const r = this.dlg;
    this.dlg = null;
    this.dlgBox?.destroy();
    this.dlgBox = null;
    const w = this.world();
    if (w) {
      w.setFocus(null);
      for (const a of w.npcs.values()) a.talking = false;
      if (w.companion) w.companion.talking = false;
      w.syncNpcs(false);
    }
    void r;
    void this.autosave();
    this.afterTalk();
  }

  private afterTalk() {
    const next = this.dlgQueue.shift();
    if (next) {
      this.startDialogue(next);
      return;
    }
    this.refreshHud();
    this.pump();
  }

  // ======================================================================== panneaux
  openTab(t: TabId) {
    if (!this.game || this.uiBusy()) {
      if (this.ui.hasPanel) this.closePanel();
      return;
    }
    this.sfx('click');
    if (t === 'carnet') this.ui.setPanel(carnetPanel(this));
    else if (t === 'sac') this.ui.setPanel(sacPanel(this, false));
    else if (t === 'train') this.ui.setPanel(trainPanel(this));
    else this.ui.setPanel(menuPanel(this));
  }

  closePanel() {
    this.ui.setPanel(null);
    this.refreshHud();
    void this.autosave();
    this.pump();
  }

  confirm(text: string, onYes: () => void) {
    const prev = this.ui.screen.firstElementChild as HTMLElement | null;
    const restore = () => {
      this.ui.setScreen(null);
      if (prev) this.ui.screen.append(prev);
    };
    this.ui.screen.replaceChildren(confirmBox(text, () => { restore(); this.ui.setPanel(null); onYes(); }, () => { restore(); this.pump(); }));
  }

  // ======================================================================== sauvegardes
  async autosave(force = false): Promise<boolean> {
    const g = this.game;
    if (!g || g.state.dead) return false;
    if (this.flowOpen || this.transitioning) return false;
    if (!force && performance.now() - this.lastAutosave < 4000) return false;
    this.lastAutosave = performance.now();
    return this.save.save(g.state);
  }

  async saveNow(label: string): Promise<boolean> {
    const g = this.game;
    if (!g) return false;
    this.lastAutosave = performance.now();
    return this.save.save(g.state, label);
  }

  private async checkpoint(label: string) {
    const g = this.game;
    if (!g || g.state.dead) return;
    await this.save.save(g.state, label);
    if (await this.save.saveCheckpoint(g.state, label)) this.ui.toast(`Point de reprise : ${label}`, 'info');
  }

  async loadCheckpoint() {
    const r = await this.save.loadCheckpoint();
    if (!r.ok) {
      this.ui.toast('Aucun point de reprise disponible.', 'warn');
      await this.toTitle();
      return;
    }
    await this.save.save(r.state, r.label);
    await this.startGame(r.state, false);
    this.ui.toast(`Reprise : ${r.label}`, 'info');
  }

  // ======================================================================== temps, brume, compagnon
  private onTime(before: number, after: number) {
    const g = this.game!;
    const w = this.world();
    if (g.state.zone === 'exterior' && w && !g.state.dead) {
      const mins = after - before;
      const front = w.hazeFront();
      if (w.player.x > front) {
        const k = g.itemQty('masque') ? 0.25 : 0.9;
        g.changeStat('health', -mins * k, 'Asphyxié dans la brume de Saint-Aubin');
        g.changeCompanionHealth(-mins * 0.7);
        if (!this.hazeWarned) {
          this.hazeWarned = true;
          this.ui.toast(g.itemQty('masque') ? 'La brume vous enveloppe. Le masque filtre, mais ça pique les yeux.' : 'La brume vous brûle la gorge. Sortez-en, vite !', 'warn');
          this.sfx('hurt');
        }
      }
      if (g.flag('depart_retarde') && after >= absTime('d2@12:20') && !g.flag('retard_fini')) {
        g.setFlag('retard_fini');
        this.enqueue(() => (g.state.zone === 'train' ? this.departureFlow() : this.missedTrainFlow(true)));
      }
    }
  }

  private checkCompanion() {
    const g = this.game!;
    const mort = g.checkCompanionDeath();
    if (!mort) return;
    this.world()?.syncCompanion();
    this.enqueue(() => this.narrate(`${this.content.npcs[mort].name} s’effondre et ne se relève pas. Vous restez à genoux près de son corps plus longtemps que vous ne pouvez vous le permettre.`, 'Perte'));
  }

  // ======================================================================== séquences scénarisées
  private runScripted(def: ScriptedEventDef) {
    switch (def.ui) {
      case 'council': this.councilFlow(); break;
      case 'rosa_lock': this.rosaLock(); break;
      case 'forced_sleep': this.forcedSleep(); break;
      case 'expedition_prep': this.expeditionPrepFlow(); break;
      case 'departure': this.departureFlow(); break;
      case 'assembly': this.assemblyFlow(); break;
      case 'ending': this.showEnding(); break;
      default: this.pump();
    }
  }

  private openFlow(el: HTMLElement) {
    this.flowOpen = true;
    this.ui.setFlow(el);
  }

  private closeFlow() {
    this.flowOpen = false;
    this.ui.setFlow(null);
    this.refreshHud();
    this.pump();
  }

  private async teleportPlayer(spotId: string) {
    const g = this.game!;
    const strip = g.state.zone === 'train' ? this.content.train : this.content.exterior;
    const sp = strip.spots.find((s) => s.id === spotId);
    if (!sp) return;
    const p = spotAbs(layoutStrip(strip), sp);
    g.state.pos = { ...p };
    this.world()?.placePlayer(p.x, p.y);
  }

  private councilFlow() {
    const g = this.game!;
    if (g.state.zone !== 'train') return;
    this.transitioning = true;
    void this.ui.fade(true, 350).then(async () => {
      await this.teleportPlayer('c_fontaine');
      this.transitioning = false;
      this.audio.setMood('tension');
      g.completeObjective('q_main', 'conseil');
      const motions = COUNCIL_ORDER.map((id) => this.content.motions[id]);
      this.openFlow(councilFlow(this, motions, {
        title: 'Conseil des quatre',
        intro: 'Dix-sept heures. La cantine est pleine à craquer : passagers debout sur les bancs, enfants sur les épaules. Au bout de la table, les quatre membres du conseil. Vous avez une voix — et ce que vous avez appris aujourd’hui.',
        argBudget: 5,
        onDone: () => {
          this.closeFlow();
          this.audio.setMood('calm');
          g.applyFx(['checkpoint:Après le conseil']);
          this.narrate('Le conseil se disperse dans un brouhaha de chaises. L’expédition partira à l’aube. Il vous reste la soirée — et une nuit de sommeil, si vous y arrivez.', 'Conseil');
        },
      }));
      await this.ui.fade(false, 400);
    });
  }

  private rosaLock() {
    const g = this.game!;
    const w = this.world();
    const inside = (() => {
      if (!w || g.state.zone !== 'train') return false;
      const sec = w.laid.secById['soute'];
      const gate = this.content.train.doors.find((d) => d.id === 'd_cage')!.gate!;
      return w.player.x > sec.x + gate.x0 && w.player.x < sec.x + gate.x1 && w.player.y < gate.y;
    })();
    g.applyFx(['lock:d_cage', 'clr:grille_rosa']);
    if (inside) {
      void this.teleportPlayer('s_grille').then(() => this.narrate('Rosa referme la grille en faisant tinter ses clés. « Allez, dehors. Je n’ai rien vu, et toi non plus. »', 'Réserve'));
    } else {
      this.ui.toast('Rosa a refermé la grille de la réserve.');
      this.pump();
    }
  }

  private sleepFlow() {
    const g = this.game!;
    const t = g.state.time;
    const day = Math.floor(t / 1440) + 1;
    const items: MenuAction[] = [];
    if (day === 1 && (g.state.fired.includes('conseil') || clockOf(t) >= hm('20:00'))) {
      items.push({ label: 'Dormir jusqu’à l’aube', run: () => this.sleepNight(false) });
    }
    if (day === 2 && g.flag('train_roule') && t < absTime('d2@15:00')) {
      items.push({ label: 'Se reposer jusqu’à l’assemblée (15:00)', run: () => this.rest(absTime('d2@15:00') - t) });
    }
    items.push({ label: 'Se reposer une heure', time: 60, run: () => this.rest(60) });
    items.push({ label: 'Se reposer deux heures', time: 120, run: () => this.rest(120) });
    const w = this.world()!;
    const p = w.worldToScreen(w.player.x, w.player.y - 40);
    this.ui.setMenu(actionMenu({ title: 'Repos', note: day === 1 && !g.state.fired.includes('conseil') ? 'Le conseil se réunit à 17:00 : il vous réveillera.' : undefined, actions: items, x: p.x, y: p.y, onClose: () => this.closeMenu(), sfx: (k) => this.sfx(k) }));
  }

  /** Bouton « Attendre » du HUD. */
  waitFlow() {
    const g = this.game;
    if (!g || this.uiBusy()) return;
    const t = g.state.time;
    const items: MenuAction[] = [
      { label: 'Attendre 30 minutes', time: 30, run: () => this.wait(30) },
      { label: 'Attendre une heure', time: 60, run: () => this.wait(60) },
    ];
    const marks: [string, string][] = [['d1@11:00', 'la tournée de Rosa (11:00)'], ['d1@17:00', 'le conseil (17:00)'], ['d1@21:00', '21:00'], ['d2@15:00', 'l’assemblée (15:00)']];
    for (const [at, label] of marks) {
      const target = absTime(at);
      if (target > t && target - t <= 8 * 60 && (at !== 'd2@15:00' || g.flag('train_roule'))) {
        items.push({ label: `Attendre ${label}`, time: target - t, run: () => this.wait(target - t) });
        break;
      }
    }
    const p = { x: 120, y: window.innerHeight - 70 };
    this.ui.setMenu(actionMenu({ title: 'Laisser passer le temps', note: g.state.zone === 'exterior' ? 'Dehors, chaque minute compte : le train part à 12:00.' : 'Le temps ne passe que lorsque vous agissez, marchez ou attendez.', actions: items, x: p.x, y: p.y, onClose: () => this.closeMenu(), sfx: (k) => this.sfx(k) }));
  }

  private wait(mins: number) {
    const g = this.game!;
    this.ui.setMenu(null);
    g.advance(mins);
    this.refreshHud();
    this.pump();
  }

  private rest(mins: number) {
    const g = this.game!;
    this.ui.setMenu(null);
    this.transitioning = true;
    void this.ui.fade(true, 400).then(async () => {
      g.sleepUntil(g.state.time + mins);
      if (g.flag('dortoirs_calfeutres')) g.changeStat('rest', 5);
      this.transitioning = false;
      await this.ui.fade(false, 500);
      this.pump();
    });
  }

  private sleepNight(forced: boolean) {
    const g = this.game!;
    this.ui.setMenu(null);
    this.transitioning = true;
    void this.ui.fade(true, 600).then(async () => {
      g.setFlag('dort');
      g.completeObjective('q_main', 'dormir');
      g.sleepUntil(absTime('d2@05:30'));
      if (g.flag('dortoirs_calfeutres')) g.changeStat('rest', 10);
      if (forced) g.changeStat('rest', -15);
      await this.teleportPlayer(SLEEP_SPOT[g.state.char]);
      this.transitioning = false;
      await this.ui.fade(false, 700);
      this.pump();
    });
  }

  private forcedSleep() {
    this.narrate('La fatigue vous tombe dessus d’un coup. Vous vous endormez là où vous êtes, roulé dans votre manteau.', 'Nuit', () => this.sleepNight(true));
  }

  private collapseFlow() {
    const g = this.game!;
    this.transitioning = true;
    void this.ui.fade(true, 500).then(async () => {
      delete g.state.flags['_collapse_pending'];
      g.advance(120);
      await this.teleportPlayer('i_soins');
      this.transitioning = false;
      await this.ui.fade(false, 600);
      this.startDialogue('reveil_infirmerie');
    });
  }

  // ======================================================================== expédition
  private expeditionPrepFlow() {
    const g = this.game!;
    if (g.state.zone !== 'train') return;
    this.audio.setMood('tension');
    this.openFlow(expeditionPrep(this, (comp, gear) => {
      this.closeFlowSilently();
      void this.startExpedition(comp, gear);
    }));
  }

  private closeFlowSilently() {
    this.flowOpen = false;
    this.ui.setFlow(null);
  }

  private async startExpedition(companion: string | null, gear: Record<string, number>) {
    const g = this.game!;
    const opts = gearOptions(this);
    for (const [id, n] of Object.entries(gear)) {
      const o = opts.find((x) => x.id === id);
      for (let i = 0; i < n; i++) {
        g.give(id, 1, true);
        if (o) g.applyFx(o.fx);
      }
    }
    g.state.expedition = { companion, compHealth: 100, start: g.state.time, deadline: absTime('d2@12:00'), returned: false, missedTrain: false, log: [] };
    if (companion) g.setFlag('companion', companion);
    g.setFlag('expedition_active');
    g.fireScripted('expedition_depart');
    g.advance(Math.max(0, absTime('d2@06:30') - g.state.time));
    this.transitioning = true;
    await this.ui.fade(true, 600);
    g.state.zone = 'exterior';
    const sp = this.content.exterior.spots.find((s) => s.id === 'q_arrivee')!;
    g.state.pos = spotAbs(layoutStrip(this.content.exterior), sp);
    this.hazeWarned = false;
    this.darkWarned = false;
    this.enterWorld();
    this.transitioning = false;
    await this.ui.fade(false, 700);
    this.startDialogue('depart_quai');
  }

  private async returnToTrain(late: boolean) {
    const g = this.game!;
    const e = g.state.expedition;
    this.transitioning = true;
    await this.ui.fade(true, 600);
    // Bilan
    const lines: string[] = [];
    const jer = g.itemQty('jerrican_plein');
    if (jer) {
      g.take('jerrican_plein', jer);
      g.give('jerrican', jer, true);
      g.changeRes('water', jer);
      g.addConseq('cq_eau_tour');
      lines.push(`Vous versez ${jer * 20} litres dans la citerne.`);
    }
    if (g.flag('theo_suit')) {
      g.setFlag('theo_sauve');
      g.addConseq('cq_theo_sauve');
      g.completeObjective('q_main', 'theo');
      lines.push('Théo est hissé à bord. Sorel l’emmène aussitôt à l’infirmerie.');
    } else if (g.flag('signal_rouge') && g.flag('theo_reste')) {
      // Anselme a mis le signal au rouge : le VAYN s'arrêtera devant sa porte, et Théo monte.
      g.setFlag('theo_sauve');
      g.addConseq('cq_theo_sauve');
      lines.push(late
        ? 'Au poste d’aiguillage, Anselme hisse Théo dans la voiture de queue avant de vous faire signe.'
        : 'Le VAYN s’est arrêté devant le poste d’aiguillage, comme Anselme l’avait promis. Il a hissé Théo dans la voiture de queue avant de vous faire signe.');
    } else if (g.flag('theo_reste')) {
      g.addConseq('cq_theo_laisse');
    }
    if (e?.companion) {
      if (e.compHealth < 40) {
        g.addConseq('cq_comp_blesse');
        lines.push(`${this.content.npcs[e.companion].name} rentre blessé.`);
      }
    }
    if (g.itemQty('relais_k3')) lines.push('Le relais K3 est dans votre poche. La filtration n’attend plus que lui.');
    if (e) e.returned = true;
    g.setFlag('expedition_finie');
    delete g.state.flags['expedition_active'];
    g.state.zone = 'train';
    const sp = this.content.train.spots.find((s) => s.id === 's_couloir')!;
    g.state.pos = spotAbs(layoutStrip(this.content.train), sp);
    if (g.itemQty('relais_k3') || g.state.objects['filtration'] === 'repare') g.completeObjective('q_main', 'expedition');
    this.enterWorld();
    this.transitioning = false;
    await this.ui.fade(false, 700);
    g.applyFx(['checkpoint:Retour d’expédition']);
    this.narrate(lines.length ? lines.join(' ') : 'Vous remontez à bord, couvert de poussière. Le train sent le fer chaud et la soupe.', 'Retour à bord', () => {
      // Sursis de Vasseur : le départ n'a jamais eu lieu, il faut le relancer.
      if (late || (g.flag('depart_retarde') && !g.flag('retard_fini'))) this.enqueue(() => this.departureFlow());
    });
  }

  private departureFlow() {
    const g = this.game!;
    if (g.flag('train_roule')) {
      this.pump();
      return;
    }
    if (g.state.zone === 'exterior') {
      this.missedTrainFlow(false);
      return;
    }
    g.setFlag('train_roule');
    g.state.expedition && (g.state.expedition.missedTrain = false);
    if (g.flag('mara_expulsee')) g.observeConseq('cq_mara_expulsee', 'anselme');
    this.updateAmbience();
    this.world()?.setMoving(true);
    g.applyFx(['checkpoint:Départ de Saint-Aubin']);
    this.sfx('horn');
    this.narrate('12:00. Le pilote automatique relâche les freins dans un long soupir. Le VAYN s’ébranle, quitte la gare de Saint-Aubin, et la brume referme le paysage derrière lui. L’assemblée de tout le train est fixée à 15:00, à la cantine.', 'Départ');
  }

  private missedTrainFlow(final: boolean) {
    const g = this.game!;
    const items: MenuAction[] = [];
    if (g.flag('signal_rouge')) {
      items.push({ label: 'Courir jusqu’au poste d’aiguillage, où le train s’est arrêté', time: 20, run: () => { this.ui.setMenu(null); g.advance(20); g.changeStat('health', -5); void this.returnToTrain(true); } });
    }
    if (g.flag('draisine_ok')) {
      items.push({ label: 'Rattraper le train en draisine', time: 40, danger: true, run: () => { this.ui.setMenu(null); g.advance(40); g.changeStat('health', -8); g.changeCompanionHealth(-10); if (g.flag('theo_reste') && g.flag('signal_rouge')) g.setFlag('theo_abandonne_signal'); void this.returnToTrain(true); } });
    }
    const vasseurHelps = !final && !g.flag('depart_retarde') && (g.rel('vasseur').trust >= 3 || g.state.char === 'mecanicien') && g.state.expedition?.companion !== 'vasseur';
    if (vasseurHelps) {
      g.setFlag('depart_retarde');
      this.narrate('Les freins devraient siffler… mais rien. Au loin, à la portière de la soute, Vasseur agite les bras : elle a bloqué le pilote automatique. « Vingt minutes ! Pas une de plus ! »', 'Sursis');
      return;
    }
    if (!items.length) {
      g.state.expedition && (g.state.expedition.missedTrain = true);
      this.narrate('Les sirènes se sont tues. Au loin, le VAYN s’éloigne, de plus en plus petit, jusqu’à n’être plus qu’un trait de fumée dans la brume. Personne ne reviendra vous chercher.', 'Le train est parti', () => g.die('Abandonné à Saint-Aubin'));
      return;
    }
    const w = this.world()!;
    const p = w.worldToScreen(w.player.x, w.player.y - 40);
    this.ui.setMenu(actionMenu({ title: 'Le train part sans vous', note: 'Le VAYN s’ébranle. Il reste une chance.', actions: items, x: p.x, y: p.y, onClose: () => this.missedTrainFlow(true), sfx: (k) => this.sfx(k) }));
  }

  // ======================================================================== assemblée et fin
  private assemblyFlow() {
    const g = this.game!;
    if (g.state.zone !== 'train' || g.state.chapterDone) return;
    this.transitioning = true;
    void this.ui.fade(true, 400).then(async () => {
      await this.teleportPlayer('c_fontaine');
      this.transitioning = false;
      this.audio.setMood('tension');
      this.openFlow(councilFlow(this, [this.content.motions[ASSEMBLY_MOTION]], {
        title: 'Assemblée de tout le train',
        intro: '15:00. Le VAYN roule vers l’embranchement de Vercel. Toute la population est entassée dans la cantine et les voitures voisines. Avant de choisir la route, on veut savoir ce qui s’est passé à Saint-Aubin. Et ce que vous savez.',
        argBudget: 3,
        revelations: true,
        onDone: () => {
          this.closeFlowSilently();
          g.completeObjective('q_main', 'assemblee');
          g.completeQuest('q_main');
          g.addEntry('c_vayn2');
          g.state.chapterDone = true;
          void this.autosave(true);
          this.showEnding();
        },
      }));
      await this.ui.fade(false, 400);
    });
  }

  private showEnding() {
    const g = this.game!;
    this.audio.setMood('ending');
    this.audio.setAmbience('moving');
    this.hud.show(false);
    this.ui.clearLabels();
    const data = { twist: twistText(g), epilogue: buildEpilogue(g), stats: statsLines(this) };
    void this.save.addHistory({ runId: g.state.runId, char: g.state.char, mode: g.state.mode, endedAt: Date.now(), outcome: 'fin', time: g.state.time, lines: data.epilogue.flatMap((s) => s.lines).slice(0, 6) });
    this.startRide('ending');
    this.ui.setScreen(endingScreen(this, data));
  }

  private async onDeath(cause: string) {
    const g = this.game!;
    this.sfx('hurt');
    this.hud.show(false);
    this.ui.clearLabels();
    this.ui.setMenu(null);
    this.ui.setPanel(null);
    this.closeFlowSilently();
    this.dlgBox?.destroy();
    this.dlgBox = null;
    this.dlg = null;
    this.narration = null;
    await this.save.addHistory({ runId: g.state.runId, char: g.state.char, mode: g.state.mode, endedAt: Date.now(), outcome: 'mort', cause, time: g.state.time, lines: [] });
    let hasCp = false;
    if (g.state.mode === 'onelife') await this.save.buryRun(g.state);
    else hasCp = !!(await this.save.checkpointMeta());
    this.ui.setScreen(deathScreen(this, cause, g.state.mode, hasCp));
  }
}
