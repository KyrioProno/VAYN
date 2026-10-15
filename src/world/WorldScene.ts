// Scène du monde : une « bande » en coupe (le train ou la zone extérieure), caméra latérale.
import Phaser from 'phaser';
import type { Game } from '../engine/game';
import type { Content, DoorDef, ObjectDef, SectionDef, StripDef, Zone } from '../engine/types';
import {
  GEO, WALK, buildNav, doorAbsX, doorRect, layoutStrip, objAbs, objStand, placeName, spotAbs, type Laid, type LaidSection,
} from '../engine/layout';
import type { NavGrid, Pt } from '../engine/navgrid';
import { dayPhase } from '../engine/time';
import { lightAt, hex } from '../render/draw';
import {
  renderSection, renderGangway, renderPartition, renderDoorLeaf, renderGate, sectionLights, sectionAmbient,
} from '../render/sections';
import {
  renderSky, renderHills, renderTrees, renderStation, renderGround, renderForeground, renderTrainExterior, renderHaze,
  PHASE_TINT, type Phase,
} from '../render/landscape';
import { Actor } from './Actor';
import { canvasTexture, charTexture, spriteTexture, glowTexture } from './textures';

export interface WorldHost {
  game: Game;
  content: Content;
  busy(): boolean;
  reachedObject(o: ObjectDef): void;
  reachedNpc(id: string): void;
  reachedDoor(d: DoorDef): void;
  walked(px: number): void;
  frame(scene: WorldScene): void;
}

interface ObjView {
  o: ObjectDef;
  img: Phaser.GameObjects.Image;
  glow?: Phaser.GameObjects.Image;
  sprite: string;
  abs: Pt;
}

interface DoorView {
  d: DoorDef;
  top?: Phaser.GameObjects.Image;
  bottom?: Phaser.GameObjects.Image;
  leaf?: Phaser.GameObjects.Image;
  gate?: Phaser.GameObjects.Image;
  leafKey?: string;
}

interface LampView {
  glow: Phaser.GameObjects.Image;
  base: number;
  flicker: boolean;
  energyDim: boolean;
  phase: number;
}

export const VIEW_H = 200;
const CAM_Y = 90;

export class WorldScene extends Phaser.Scene {
  host!: WorldHost;
  zone: Zone = 'train';
  strip!: StripDef;
  laid!: Laid;
  nav!: NavGrid;
  player!: Actor;
  companion: Actor | null = null;
  npcs = new Map<string, Actor>();
  objs = new Map<string, ObjView>();
  doors = new Map<string, DoorView>();
  lamps: LampView[] = [];
  private layers: { obj: Phaser.GameObjects.TileSprite | Phaser.GameObjects.Image; f: number; y: number; tile: boolean; drift?: number }[] = [];
  private phase: Phase = 'jour';
  private camX = 0;
  private freeLook = 0;
  baseZoom = 4;
  userZoom = 1;
  private focus: { x: number; zoom: number } | null = null;
  private dim!: Phaser.GameObjects.Rectangle;
  private haze: Phaser.GameObjects.TileSprite | null = null;
  private dark: Phaser.GameObjects.RenderTexture | null = null;
  private navDirty = true;
  private unsub: (() => void)[] = [];
  private pointers = new Map<number, { x: number; y: number; sx: number; sy: number; t: number }>();
  private pinch: { d: number; z: number } | null = null;
  private dragging = false;
  private tapMarker!: Phaser.GameObjects.Image;
  private ready = false;

  constructor() {
    super('world');
  }

  init(data: { host: WorldHost; zone: Zone }) {
    this.host = data.host;
    this.zone = data.zone;
    this.strip = data.zone === 'train' ? this.host.content.train : this.host.content.exterior;
    this.laid = layoutStrip(this.strip);
    this.npcs = new Map();
    this.objs = new Map();
    this.doors = new Map();
    this.lamps = [];
    this.layers = [];
    this.companion = null;
    this.haze = null;
    this.dark = null;
    this.focus = null;
    this.freeLook = 0;
    this.navDirty = true;
    this.unsub = [];
    this.pointers = new Map();
    this.ready = false;
  }

  get eng(): Game {
    return this.host.game;
  }

  create() {
    const g = this.eng;
    this.phase = dayPhase(g.state.time);
    this.cameras.main.setBackgroundColor('#07080a');
    this.cameras.main.roundPixels = true;
    this.buildBackdrop();
    this.buildSections();
    this.buildDoors();
    this.buildObjects();
    this.rebuildNav();

    // Joueur
    const c = this.host.content.chars[g.state.char];
    const start = this.nav.nearestWalkable(g.state.pos, 60) ?? g.state.pos;
    this.player = new Actor(this, 'pc', charTexture(this, `pc_${c.id}`, c.look), start.x, start.y);
    this.player.speed = this.zone === 'train' ? 52 : 40;
    this.player.onStep = (d) => {
      this.host.walked(d);
    };
    this.camX = this.player.x;

    this.syncNpcs(true);
    this.syncCompanion();

    // Voile d'énergie / nuit
    this.dim = this.add.rectangle(0, 0, 10, 10, 0x000000, 0).setOrigin(0, 0).setDepth(1400).setScrollFactor(0);
    if (this.zone === 'exterior') {
      this.haze = this.add.tileSprite(0, 0, 900, GEO.H + 40, canvasTexture(this, 'fx:haze', () => renderHaze())).setOrigin(0, 0).setDepth(1600).setAlpha(0);
    }
    this.tapMarker = this.add.image(0, 0, glowTexture(this)).setDepth(GEO.FLOOR_Y0 - 1).setScale(0.2, 0.08).setAlpha(0).setBlendMode(Phaser.BlendModes.ADD);

    this.setupInput();
    this.layout();
    this.scale.on('resize', this.layout, this);

    const ev = (name: string, fn: (p: any) => void) => this.unsub.push(g.on(name, fn));
    ev('door', () => {
      this.refreshDoors();
      this.navDirty = true;
    });
    ev('object', () => {
      this.refreshObjects();
      this.navDirty = true;
    });
    ev('state', () => {
      this.refreshObjects();
    });
    ev('npc', () => this.syncNpcs(false));
    ev('time', () => {
      this.syncNpcs(false);
      const ph = dayPhase(g.state.time);
      if (ph !== this.phase) {
        this.phase = ph;
        this.refreshBackdropTint();
      }
    });
    ev('companion', () => this.syncCompanion());
    this.events.once('shutdown', () => {
      for (const u of this.unsub) u();
      this.unsub = [];
      this.scale.off('resize', this.layout, this);
    });
    this.refreshBackdropTint();
    this.ready = true;
  }

  // ------------------------------------------------------------------ construction
  private buildBackdrop() {
    const ph = this.phase;
    const W = this.laid.width;
    const sky = this.add.tileSprite(0, -20, 1200, 220, canvasTexture(this, `bg:sky:${ph}`, () => renderSky(ph))).setOrigin(0, 0).setDepth(-1000);
    this.layers.push({ obj: sky, f: 0.02, y: -20, tile: true });
    const hills = this.add.tileSprite(0, -10, 1200, 200, canvasTexture(this, `bg:hills:${ph}`, () => renderHills(ph))).setOrigin(0, 0).setDepth(-990);
    this.layers.push({ obj: hills, f: 0.12, y: -10, tile: true });
    const trees = this.add.tileSprite(0, 0, 1200, 200, canvasTexture(this, `bg:trees:${ph}`, () => renderTrees(ph))).setOrigin(0, 0).setDepth(-980);
    this.layers.push({ obj: trees, f: 0.3, y: 0, tile: true });
    if (this.zone === 'train') {
      const sw = Math.round(W * 0.6 + 900);
      const st = this.add.image(0, 0, canvasTexture(this, `bg:station:${ph}:${sw}`, () => renderStation(ph, sw))).setOrigin(0, 0).setDepth(-970);
      this.layers.push({ obj: st, f: 0.6, y: 0, tile: false });
      const ground = this.add.tileSprite(0, GEO.UNDER_Y1, 1200, GEO.H - GEO.UNDER_Y1 + 60, canvasTexture(this, 'bg:ground', () => renderGround())).setOrigin(0, 0).setDepth(-200);
      this.layers.push({ obj: ground, f: 1, y: GEO.UNDER_Y1, tile: true });
      const fg = this.add.tileSprite(0, GEO.H - 200 + 30, 1200, 200, canvasTexture(this, 'bg:fg', () => renderForeground())).setOrigin(0, 0).setDepth(3000).setAlpha(0.96);
      this.layers.push({ obj: fg, f: 1.5, y: GEO.H - 200 + 30, tile: true });
    } else {
      const ground = this.add.tileSprite(0, GEO.SILL_Y1, 1200, GEO.H - GEO.SILL_Y1 + 60, canvasTexture(this, 'bg:ground', () => renderGround())).setOrigin(0, 0).setDepth(-200);
      this.layers.push({ obj: ground, f: 1, y: GEO.SILL_Y1, tile: true });
    }
  }

  private refreshBackdropTint() {
    const t = PHASE_TINT[this.phase];
    for (const l of this.layers) {
      if (l.obj.depth >= 3000) continue;
      if (l.obj.depth <= -970) l.obj.setTint(t);
    }
  }

  private buildSections() {
    for (const s of this.laid.secs) {
      const key = `sec:${this.zone}:${s.id}`;
      const i = this.laid.secs.indexOf(s);
      const ends = this.zone === 'train' ? { left: i > 0, right: i < this.laid.secs.length - 1 } : { left: true, right: true };
      canvasTexture(this, key, () => renderSection(s, ends).bg);
      this.add.image(s.x, 0, key).setOrigin(0, 0).setDepth(-100);
      if (s.kind === 'outdoor' && s.theme === 'platform') {
        const tk = `bg:trainext:${this.phase}:${s.w}`;
        canvasTexture(this, tk, () => renderTrainExterior(this.phase, s.w + 40));
        this.add.image(s.x - 20, GEO.FLOOR_Y0 - 64, tk).setOrigin(0, 0).setDepth(-150);
      }
      // lampes
      const amb = sectionAmbient(s);
      void amb;
      for (const l of s.lamps ?? []) {
        const glow = this.add.image(s.x + l.x, l.y, glowTexture(this)).setBlendMode(Phaser.BlendModes.ADD).setDepth(1500);
        glow.setTint(Phaser.Display.Color.HexStringToColor(l.color).color);
        const base = 0.16 + (l.power ?? 0.8) * 0.16;
        glow.setScale((l.r / 32) * 0.75, (l.r / 32) * 0.6).setAlpha(base);
        this.lamps.push({ glow, base, flicker: !!l.flicker, energyDim: !!l.energyDim, phase: Math.random() * 10 });
      }
    }
    // soufflets entre voitures
    if (this.zone === 'train') {
      const gk = canvasTexture(this, `gangway:${this.strip.gap}`, () => renderGangway(this.strip.gap));
      for (let i = 0; i < this.laid.secs.length - 1; i++) {
        const a = this.laid.secs[i];
        this.add.image(a.x + a.w - GEO.WALL_T, 0, gk).setOrigin(0, 0).setDepth(-101);
      }
    }
  }

  private secOf(id: string): LaidSection {
    return this.laid.secById[id];
  }

  private buildDoors() {
    for (const d of this.strip.doors) {
      const v: DoorView = { d };
      if (d.kind === 'partition') {
        const s = this.secOf(d.sec!);
        const x = s.x + (d.x ?? 0);
        const p = renderPartition(s.theme, d.y0, d.y1);
        const kt = canvasTexture(this, `part:${d.id}:t`, () => p.top);
        const kb = canvasTexture(this, `part:${d.id}:b`, () => p.bottom);
        v.top = this.add.image(x, d.y0, kt).setOrigin(0.5, 1).setDepth(d.y0 - 0.5);
        v.bottom = this.add.image(x, GEO.FLOOR_Y1 + 1, kb).setOrigin(0.5, 1).setDepth(GEO.FLOOR_Y1 + 1);
        const tint = this.lightTint(x, (d.y0 + d.y1) / 2 - 20, s);
        v.top.setTint(tint);
        v.bottom.setTint(tint);
        const lk = canvasTexture(this, `leaf:${s.theme}:${d.y1 - d.y0 + 24}:1`, () => renderDoorLeaf(s.theme, d.y1 - d.y0 + 24, true).c);
        const ok = canvasTexture(this, `leaf:${s.theme}:${d.y1 - d.y0 + 24}:0`, () => renderDoorLeaf(s.theme, d.y1 - d.y0 + 24, false).c);
        void ok;
        v.leaf = this.add.image(x, d.y1, lk).setOrigin(0.5, 1).setDepth(d.y1 - 0.3).setTint(tint);
        v.leafKey = lk;
      } else if (d.kind === 'gate' && d.gate) {
        const s = this.secOf(d.sec!);
        const g = d.gate;
        const kc = canvasTexture(this, `gate:${d.id}:c`, () => renderGate(g.x1 - g.x0).c);
        const ko = canvasTexture(this, `gate:${d.id}:o`, () => renderGate(g.x1 - g.x0, [g.gx0 - g.x0, g.gx1 - g.x0]).c);
        void ko;
        v.gate = this.add.image(s.x + g.x0, g.y + 1, kc).setOrigin(0, 1).setDepth(g.y + 0.5);
        v.gate.setTint(this.lightTint(s.x + (g.x0 + g.x1) / 2, g.y - 14, s));
      }
      this.doors.set(d.id, v);
    }
    this.refreshDoors();
  }

  private refreshDoors() {
    for (const v of this.doors.values()) {
      const open = this.eng.doorOpen(v.d.id);
      if (v.leaf) v.leaf.setVisible(!open);
      if (v.gate) {
        const g = v.d.gate!;
        v.gate.setTexture(open ? `gate:${v.d.id}:o` : `gate:${v.d.id}:c`);
        void g;
      }
    }
  }

  private resolveSprite(o: ObjectDef): string {
    if (typeof o.sprite === 'string') return o.sprite;
    const hit = o.sprite.find((s) => this.eng.check(s.if));
    return hit ? hit.sprite : o.sprite[o.sprite.length - 1].sprite;
  }

  private buildObjects() {
    for (const o of this.strip.objects) {
      const abs = objAbs(this.laid, o);
      const sprite = this.resolveSprite(o);
      const img = this.add.image(abs.x, abs.y - (o.elev ?? 0), spriteTexture(this, sprite)).setOrigin(0.5, 1);
      img.setFlipX(!!o.flip);
      img.setDepth(abs.y + (o.depthBias ?? 0));
      const view: ObjView = { o, img, sprite, abs };
      if (o.light) {
        view.glow = this.add.image(abs.x, abs.y - (o.elev ?? 0) - img.height / 2 + (o.light.dy ?? 0), glowTexture(this))
          .setBlendMode(Phaser.BlendModes.ADD).setDepth(1500)
          .setTint(Phaser.Display.Color.HexStringToColor(o.light.color).color)
          .setScale(o.light.r / 32, (o.light.r / 32) * 0.8).setAlpha(0.3);
      }
      this.objs.set(o.id, view);
    }
    this.refreshObjects();
  }

  private refreshObjects() {
    for (const v of this.objs.values()) {
      const vis = this.eng.check(v.o.visible);
      v.img.setVisible(vis);
      const sprite = this.resolveSprite(v.o);
      if (sprite !== v.sprite) {
        v.sprite = sprite;
        v.img.setTexture(spriteTexture(this, sprite));
      }
      if (v.glow) v.glow.setVisible(vis && this.eng.check(v.o.light?.if));
      if (!v.o.emissive) {
        const s = this.secAt(v.abs.x);
        v.img.setTint(this.lightTint(v.abs.x, v.abs.y - (v.o.elev ?? 0) - v.img.height * 0.5, s));
      }
    }
  }

  isObjVisible(o: ObjectDef): boolean {
    return this.eng.check(o.visible);
  }

  rebuildNav() {
    this.nav = buildNav(this.laid, {
      doorOpen: (id) => this.eng.doorOpen(id),
      objVisible: (o) => this.eng.check(o.visible),
    });
    this.navDirty = false;
  }

  // ------------------------------------------------------------------ éclairage
  secAt(x: number): LaidSection {
    for (const s of this.laid.secs) if (x >= s.x - this.strip.gap / 2 && x < s.x + s.w + this.strip.gap / 2) return s;
    return this.laid.secs[x < 0 ? 0 : this.laid.secs.length - 1];
  }

  lightTint(x: number, y: number, s: LaidSection | SectionDef): number {
    const sx = (s as LaidSection).x ?? 0;
    const L = sectionLights(s).map((l) => ({ ...l, x: l.x + sx }));
    const a = sectionAmbient(s);
    const c = lightAt(x, y, L, a);
    const f = (v: number) => Math.max(0.18, Math.min(1, v * 1.12));
    return Phaser.Display.Color.GetColor(Math.round(f(c[0]) * 255), Math.round(f(c[1]) * 255), Math.round(f(c[2]) * 255));
  }

  // ------------------------------------------------------------------ PNJ
  /** Place / déplace les PNJ selon leur emploi du temps. */
  syncNpcs(initial: boolean) {
    const g = this.eng;
    const content = this.host.content;
    const spots = new Map(this.strip.spots.map((s) => [s.id, s]));
    const comp = g.state.expedition?.companion;
    for (const id of Object.keys(content.npcs)) {
      if (this.zone === 'exterior' && id === comp) continue;
      const spotId = g.npcSpot(id);
      const sp = spotId ? spots.get(spotId) : undefined;
      let a = this.npcs.get(id);
      if (!sp) {
        if (a) {
          a.destroy();
          this.npcs.delete(id);
        }
        continue;
      }
      const p = spotAbs(this.laid, sp);
      if (!a) {
        const def = content.npcs[id];
        a = new Actor(this, id, charTexture(this, `npc_${id}`, def.look), p.x, p.y);
        a.speed = def.ambient ? 30 : 36;
        a.facing = sp.face ?? 1;
        a.pose = sp.pose === 'sit' ? 'sit' : sp.pose === 'lie' ? 'lie' : 'stand';
        this.npcs.set(id, a);
        (a as any).spot = sp.id;
        continue;
      }
      if ((a as any).spot === sp.id) continue;
      (a as any).spot = sp.id;
      const arrive = () => {
        a!.facing = sp.face ?? a!.facing;
        a!.pose = sp.pose === 'sit' ? 'sit' : sp.pose === 'lie' ? 'lie' : 'stand';
      };
      if (initial || !this.ready) {
        a.teleport(p.x, p.y);
        arrive();
        continue;
      }
      a.pose = 'stand';
      if (this.navDirty) this.rebuildNav();
      const path = this.nav.findPath({ x: a.x, y: a.y }, p);
      if (path && path.length < 400) a.setPath(path, arrive);
      else {
        a.teleport(p.x, p.y);
        arrive();
      }
    }
  }

  syncCompanion() {
    const e = this.eng.state.expedition;
    const id = this.zone === 'exterior' ? e?.companion : null;
    if (!id) {
      this.companion?.destroy();
      this.companion = null;
      return;
    }
    if (this.companion && this.companion.id === id) {
      this.companion.pose = (e!.compHealth ?? 100) < 35 ? 'hurt' : 'stand';
      return;
    }
    this.companion?.destroy();
    const def = this.host.content.npcs[id];
    const p = this.player ? { x: this.player.x - 16, y: this.player.y } : this.eng.state.pos;
    const q = this.nav.nearestWalkable(p, 40) ?? p;
    this.companion = new Actor(this, id, charTexture(this, `npc_${id}`, def.look), q.x, q.y);
    this.companion.speed = 44;
  }

  // ------------------------------------------------------------------ entrées tactiles
  private setupInput() {
    this.input.addPointer(2);
    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      this.pointers.set(p.id, { x: p.x, y: p.y, sx: p.x, sy: p.y, t: performance.now() });
      if (this.pointers.size === 2) {
        const [a, b] = [...this.pointers.values()];
        this.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: this.userZoom };
        this.dragging = true;
      }
    });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      const st = this.pointers.get(p.id);
      if (!st) return;
      const dx = p.x - st.x;
      st.x = p.x;
      st.y = p.y;
      if (this.pinch && this.pointers.size >= 2) {
        const [a, b] = [...this.pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        this.userZoom = Phaser.Math.Clamp(this.pinch.z * (d / Math.max(1, this.pinch.d)), 0.8, 1.9);
        this.layout();
        return;
      }
      if (!this.dragging && Math.hypot(p.x - st.sx, p.y - st.sy) > 12 * this.dpr()) this.dragging = true;
      if (this.dragging && this.pointers.size === 1) {
        this.camX -= dx / this.cameras.main.zoom;
        this.freeLook = 4;
      }
    });
    const up = (p: Phaser.Input.Pointer) => {
      const st = this.pointers.get(p.id);
      this.pointers.delete(p.id);
      if (this.pointers.size < 2) this.pinch = null;
      if (!st) return;
      const wasDrag = this.dragging;
      if (this.pointers.size === 0) this.dragging = false;
      const dt = performance.now() - st.t;
      if (!wasDrag && dt < 600 && Math.hypot(p.x - st.sx, p.y - st.sy) <= 12 * this.dpr()) {
        const wp = this.cameras.main.getWorldPoint(p.x, p.y);
        this.tap(wp.x, wp.y);
      }
    };
    this.input.on('pointerup', up);
    this.input.on('pointerupoutside', up);
    this.input.on('wheel', (_p: unknown, _o: unknown, _dx: number, dy: number) => {
      this.userZoom = Phaser.Math.Clamp(this.userZoom * (dy > 0 ? 0.9 : 1.1), 0.8, 1.9);
      this.layout();
    });
  }

  private dpr(): number {
    return Math.min(3, window.devicePixelRatio || 1);
  }

  /** Point d'entrée d'un toucher (coordonnées monde). */
  tap(x: number, y: number) {
    if (this.host.busy() || this.eng.state.dead) return;
    // PNJ
    let best: { id: string; d: number } | null = null;
    for (const [id, a] of this.npcs) {
      if (!a.visible) continue;
      const top = a.pose === 'lie' ? a.y - 12 : a.y - 31;
      if (x >= a.x - 8 && x <= a.x + 8 && y >= top && y <= a.y + 3) {
        const d = Math.abs(x - a.x) + Math.abs(y - (a.y - 14)) * 0.5;
        if (!best || d < best.d) best = { id, d };
      }
    }
    if (best) {
      this.walkToNpc(best.id);
      return;
    }
    // Objets (le plus en avant d'abord)
    const hits: ObjView[] = [];
    for (const v of this.objs.values()) {
      if (!v.img.visible || !v.o.actions.length) continue;
      const b = v.img.getBounds();
      const pad = 3;
      if (x >= b.x - pad && x <= b.right + pad && y >= b.y - pad && y <= b.bottom + pad) hits.push(v);
    }
    if (hits.length) {
      hits.sort((a, b) => b.img.depth - a.img.depth || a.img.width * a.img.height - b.img.width * b.img.height);
      // Préférer un objet dont la face touchée est petite (ex. registre posé sur un bureau)
      const small = hits.find((h) => h.img.width * h.img.height < 400);
      this.walkToObject((small ?? hits[0]).o);
      return;
    }
    // Portes verrouillées
    for (const v of this.doors.values()) {
      if (this.eng.doorOpen(v.d.id)) continue;
      const r = doorRect(this.laid, v.d);
      if (x >= r.x - 4 && x <= r.x + r.w + 4 && y >= r.y && y <= r.y + r.h) {
        this.walkToDoor(v.d);
        return;
      }
    }
    // Sol
    const ty = Phaser.Math.Clamp(y, WALK.y0, WALK.y1);
    this.walkTo({ x, y: ty });
  }

  private ensureNav() {
    if (this.navDirty) this.rebuildNav();
  }

  /** Marche jusqu'à un point ; si inaccessible, s'approche au plus près (et signale la porte fermée). */
  walkTo(target: Pt, onArrive?: () => void, opts: { blockedDoorHint?: boolean } = { blockedDoorHint: true }): boolean {
    this.ensureNav();
    const from = { x: this.player.x, y: this.player.y };
    const near = this.nav.nearestReachable(from, target);
    if (!near) return false;
    const path = this.nav.findPath(from, near.pt);
    if (!path) return false;
    this.showTapMarker(near.pt);
    this.freeLook = 0;
    if (!near.exact && opts.blockedDoorHint) {
      const d = this.blockingDoor(target);
      this.player.setPath(path, () => {
        if (d) this.host.reachedDoor(d);
      });
      return false;
    }
    this.player.setPath(path, onArrive ?? null);
    return near.exact;
  }

  /** Porte fermée la plus pertinente entre le joueur et la cible. */
  private blockingDoor(target: Pt): DoorDef | null {
    const px = this.player.x;
    let best: { d: DoorDef; dist: number } | null = null;
    for (const v of this.doors.values()) {
      if (this.eng.doorOpen(v.d.id)) continue;
      const dx = doorAbsX(this.laid, v.d);
      const between = (dx - px) * (dx - target.x) <= 0 || v.d.kind === 'gate';
      if (!between) continue;
      if (v.d.kind === 'gate') {
        const g = v.d.gate!;
        const s = this.secOf(v.d.sec!);
        if (!(target.x >= s.x + g.x0 && target.x <= s.x + g.x1 && target.y < g.y)) continue;
      }
      const dist = Math.abs(dx - px);
      if (!best || dist < best.dist) best = { d: v.d, dist };
    }
    return best?.d ?? null;
  }

  walkToObject(o: ObjectDef) {
    const stand = objStand(this.laid, o);
    const abs = objAbs(this.laid, o);
    this.ensureNav();
    const from = { x: this.player.x, y: this.player.y };
    const near = this.nav.nearestReachable(from, stand);
    if (!near) return;
    const dist = Math.hypot(near.pt.x - stand.x, (near.pt.y - stand.y) * 1.5);
    if (!near.exact && dist > 18) {
      // l'objet est derrière une porte fermée
      const d = this.blockingDoor(stand);
      const path = this.nav.findPath(from, near.pt);
      if (path) this.player.setPath(path, () => (d ? this.host.reachedDoor(d) : this.host.reachedObject(o)));
      return;
    }
    const path = this.nav.findPath(from, near.pt);
    if (!path) return;
    this.freeLook = 0;
    this.player.setPath(path, () => {
      this.player.face(abs.x);
      this.player.interacting = 0.35;
      this.host.reachedObject(o);
    });
  }

  walkToNpc(id: string) {
    const a = this.npcs.get(id);
    if (!a) return;
    a.stop();
    const side = this.player.x < a.x ? -1 : 1;
    const target = { x: a.x + side * 14, y: Phaser.Math.Clamp(a.y + (a.pose === 'lie' ? 10 : 2), WALK.y0, WALK.y1) };
    this.ensureNav();
    const from = { x: this.player.x, y: this.player.y };
    const near = this.nav.nearestReachable(from, target);
    if (!near) return;
    const dist = Math.hypot(near.pt.x - a.x, near.pt.y - a.y);
    const path = this.nav.findPath(from, near.pt);
    if (!path) return;
    this.freeLook = 0;
    if (dist > 34) {
      const d = this.blockingDoor(target);
      this.player.setPath(path, () => {
        if (d) this.host.reachedDoor(d);
      });
      return;
    }
    this.player.setPath(path, () => {
      this.player.face(a.x);
      if (a.pose !== 'lie' && a.pose !== 'sit') a.face(this.player.x);
      this.host.reachedNpc(id);
    });
  }

  walkToDoor(d: DoorDef) {
    const x = doorAbsX(this.laid, d);
    const side = this.player.x < x ? -1 : 1;
    let target: Pt = { x: x + side * 10, y: (d.y0 + d.y1) / 2 };
    if (d.kind === 'gate' && d.gate) target = { x, y: d.gate.y + 8 };
    this.walkTo(target, () => {
      this.player.face(x);
      this.host.reachedDoor(d);
    }, { blockedDoorHint: false });
  }

  private showTapMarker(p: Pt) {
    this.tapMarker.setPosition(p.x, p.y).setAlpha(0.7).setScale(0.22, 0.09);
    this.tweens.killTweensOf(this.tapMarker);
    this.tweens.add({ targets: this.tapMarker, alpha: 0, scaleX: 0.4, scaleY: 0.14, duration: 450 });
  }

  // ------------------------------------------------------------------ caméra
  layout() {
    const cam = this.cameras.main;
    const h = this.scale.height;
    this.baseZoom = Math.max(1, Math.round(h / VIEW_H));
    const z = this.baseZoom * this.userZoom * (this.focus?.zoom ?? 1);
    cam.setZoom(z);
    const viewW = this.scale.width / z;
    for (const l of this.layers) {
      if (l.tile) {
        const ts = l.obj as Phaser.GameObjects.TileSprite;
        const need = Math.ceil(viewW + 64);
        if (Math.abs(ts.width - need) > 32 || ts.width < need) ts.setSize(need + 128, ts.height);
      }
    }
    if (this.haze) {
      const need = Math.ceil(viewW + 64);
      if (this.haze.width < need) this.haze.setSize(need + 128, this.haze.height);
    }
    this.dim.setSize(this.scale.width / z + 4, this.scale.height / z + 4);
  }

  /** Cadrage de dialogue : resserre entre le joueur et l'interlocuteur. */
  setFocus(x: number | null) {
    this.focus = x === null ? null : { x, zoom: 1.12 };
    this.layout();
  }

  viewLeft(): number {
    const cam = this.cameras.main;
    return cam.midPoint.x - this.scale.width / cam.zoom / 2;
  }

  /** Coordonnées écran (pixels CSS) d'un point du monde. */
  worldToScreen(x: number, y: number): { x: number; y: number } {
    const cam = this.cameras.main;
    const z = cam.zoom;
    const left = cam.midPoint.x - this.scale.width / z / 2;
    const top = cam.midPoint.y - this.scale.height / z / 2;
    const d = this.dpr();
    return { x: ((x - left) * z) / d, y: ((y - top) * z) / d };
  }

  place() {
    return placeName(this.laid, this.player.x);
  }

  // ------------------------------------------------------------------ boucle
  override update(_t: number, dtRaw: number) {
    if (!this.ready) return;
    const dt = Math.min(50, dtRaw);
    const g = this.eng;
    const busy = this.host.busy();
    // Joueur
    this.player.update(dt);
    this.player.setTint(this.lightTint(this.player.x, this.player.y - 16, this.secAt(this.player.x)));
    g.state.pos.x = Math.round(this.player.x);
    g.state.pos.y = Math.round(this.player.y);
    // PNJ
    for (const a of this.npcs.values()) {
      if (busy && a.talking) a.path.length && a.stop();
      a.update(dt);
      a.setTint(this.lightTint(a.x, a.y - 16, this.secAt(a.x)));
    }
    // Compagnon
    if (this.companion) {
      const c = this.companion;
      const d = Math.hypot(c.x - this.player.x, (c.y - this.player.y) * 1.4);
      if (d > 30 && !c.moving) {
        this.ensureNav();
        const behind = { x: this.player.x - this.player.facing * 16, y: this.player.y + 3 };
        const near = this.nav.nearestReachable({ x: c.x, y: c.y }, behind);
        const path = near ? this.nav.findPath({ x: c.x, y: c.y }, near.pt) : null;
        if (path) c.setPath(path, () => c.face(this.player.x));
      }
      c.update(dt);
      c.setTint(this.lightTint(c.x, c.y - 16, this.secAt(c.x)));
    }
    // Caméra
    const cam = this.cameras.main;
    if (this.freeLook > 0) {
      this.freeLook -= dt / 1000;
      if (this.player.moving) this.freeLook = 0;
    } else {
      const target = this.focus ? this.focus.x : this.player.x;
      this.camX += (target - this.camX) * (1 - Math.exp(-dt / 180));
    }
    const viewW = this.scale.width / cam.zoom;
    const margin = 30;
    const minX = viewW / 2 - margin;
    const maxX = this.laid.width - viewW / 2 + margin;
    this.camX = minX > maxX ? this.laid.width / 2 : Phaser.Math.Clamp(this.camX, minX, maxX);
    cam.centerOn(Math.round(this.camX * cam.zoom) / cam.zoom, CAM_Y);
    const left = this.camX - viewW / 2;
    const top = CAM_Y - this.scale.height / cam.zoom / 2;
    // Parallaxe
    for (const l of this.layers) {
      if (l.tile) {
        const ts = l.obj as Phaser.GameObjects.TileSprite;
        if (l.f === 1) {
          ts.setPosition(Math.floor(left / 64) * 64 - 64, l.y);
          ts.tilePositionX = 0;
        } else {
          ts.setPosition(left - 32, l.y);
          ts.tilePositionX = (left - 32) * l.f;
        }
      } else {
        l.obj.setPosition(left * (1 - l.f) - 120, l.y);
      }
    }
    // Lampes
    const energy = g.state.res.energy;
    const t = performance.now() / 1000;
    for (const L of this.lamps) {
      let a = L.base;
      if (L.energyDim && energy < 35) a *= 0.55 + (energy / 35) * 0.45;
      if (L.flicker || (L.energyDim && energy < 20)) {
        const n = Math.sin(t * 13 + L.phase) * Math.sin(t * 7.3 + L.phase * 2);
        if (n > 0.82) a *= 0.35;
      }
      L.glow.setAlpha(a);
    }
    // Voile (énergie basse, nuit)
    let dimA = 0;
    if (this.zone === 'train') {
      if (energy < 40) dimA += (40 - energy) / 40 * 0.3;
      if (this.phase === 'nuit') dimA += 0.12;
    } else {
      dimA += this.phase === 'nuit' ? 0.35 : this.phase === 'crepuscule' || this.phase === 'aube' ? 0.12 : 0;
    }
    this.dim.setPosition(0, 0).setFillStyle(0x05070c, dimA);
    // Brume extérieure
    if (this.haze) {
      const front = this.hazeFront();
      const viewR = left + viewW;
      this.haze.setPosition(Math.max(left - 32, front), top - 10);
      this.haze.tilePositionX = t * 6;
      this.haze.setAlpha(front < viewR ? 0.85 : 0);
    }
    if (this.dark) this.updateDark(left, top);
    if (this.navDirty && !this.player.moving) this.rebuildNav();
    this.host.frame(this);
  }

  /** Position x du front de brume (scène extérieure) : progresse depuis la droite à partir de 10:00. */
  hazeFront(): number {
    const t = this.eng.state.time;
    const start = 24 * 60 + 10 * 60; // J2 10:00
    const W = this.laid.width;
    if (t < start) return W + 200;
    const k = (t - start) / 150; // 2 h 30 pour tout couvrir
    return W + 200 - k * (W + 200);
  }

  private updateDark(_left: number, _top: number) {
    // réservé : obscurité du dépôt (voir ExteriorDark dans l'App si nécessaire)
  }

  /** Aide pour les étiquettes DOM : PNJ visibles à l'écran. */
  visibleNpcs(): { id: string; x: number; y: number; actor: Actor }[] {
    const cam = this.cameras.main;
    const viewW = this.scale.width / cam.zoom;
    const left = this.camX - viewW / 2;
    const out: { id: string; x: number; y: number; actor: Actor }[] = [];
    for (const [id, a] of this.npcs) if (a.visible && a.x > left - 20 && a.x < left + viewW + 20) out.push({ id, x: a.x, y: a.y, actor: a });
    if (this.companion) out.push({ id: this.companion.id, x: this.companion.x, y: this.companion.y, actor: this.companion });
    return out;
  }

  visibleObjects(): ObjView[] {
    const cam = this.cameras.main;
    const viewW = this.scale.width / cam.zoom;
    const left = this.camX - viewW / 2;
    return [...this.objs.values()].filter((v) => v.img.visible && v.abs.x > left - 30 && v.abs.x < left + viewW + 30);
  }

  npcActor(id: string): Actor | null {
    if (this.companion?.id === id) return this.companion;
    return this.npcs.get(id) ?? null;
  }

  /** Téléporte le joueur à un point (changement de zone, réveil…). */
  placePlayer(x: number, y: number) {
    this.ensureNav();
    const p = this.nav.nearestWalkable({ x, y }, 60) ?? { x, y };
    this.player.teleport(p.x, p.y);
    this.camX = p.x;
    if (this.companion) this.companion.teleport(p.x - 14, p.y);
  }
}

export function colorNum(c: string): number {
  const [r, g, b] = hex(c);
  return (r << 16) | (g << 8) | b;
}
