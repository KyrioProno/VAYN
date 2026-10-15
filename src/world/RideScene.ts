// Scène « trajet » : le VAYN vu de l'extérieur (titre, cinématique d'intro, fin).
import Phaser from 'phaser';
import type { Look } from '../engine/types';
import { renderSky, renderHills, renderTrees, renderStation, renderGround, renderForeground, renderTrainExterior, PHASE_TINT, type Phase } from '../render/landscape';
import { canvasTexture, charTexture, glowTexture } from './textures';
import { FEET_Y, FRAME_H } from '../render/characters';

export type RideMode = 'title' | 'embark' | 'depart' | 'catastrophe' | 'later' | 'ending';

const MODE: Record<RideMode, { phase: Phase; speed: number; station: boolean }> = {
  title: { phase: 'crepuscule', speed: 70, station: false },
  embark: { phase: 'jour', speed: 0, station: true },
  depart: { phase: 'jour', speed: 90, station: false },
  catastrophe: { phase: 'nuit', speed: 60, station: false },
  later: { phase: 'nuit', speed: 0, station: true },
  ending: { phase: 'crepuscule', speed: 80, station: false },
};

interface Walker { s: Phaser.GameObjects.Sprite; vx: number; t: number }

export class RideScene extends Phaser.Scene {
  private mode: RideMode = 'title';
  private layers: { o: Phaser.GameObjects.TileSprite; f: number }[] = [];
  private station: Phaser.GameObjects.Image | null = null;
  private train!: Phaser.GameObjects.TileSprite;
  private glows: Phaser.GameObjects.Image[] = [];
  private flash: Phaser.GameObjects.Rectangle | null = null;
  private walkers: Walker[] = [];
  private scroll = 0;
  private speed = 0;
  private group: Phaser.GameObjects.GameObject[] = [];
  private readonly VIEW = 150;

  constructor() {
    super('ride');
  }

  init(data: { mode?: RideMode }) {
    this.mode = data.mode ?? 'title';
  }

  create() {
    this.cameras.main.setBackgroundColor('#05060a');
    this.build();
    this.scale.on('resize', this.layout, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.layout, this));
  }

  setMode(m: RideMode) {
    if (m === this.mode) return;
    this.mode = m;
    this.build();
  }

  private clearAll() {
    for (const o of this.group) o.destroy();
    this.group = [];
    this.layers = [];
    this.glows = [];
    this.walkers = [];
    this.station = null;
    this.flash = null;
  }

  private add2<T extends Phaser.GameObjects.GameObject>(o: T): T {
    this.group.push(o);
    return o;
  }

  private build() {
    this.clearAll();
    const cfg = MODE[this.mode];
    const ph = cfg.phase;
    const tint = PHASE_TINT[ph];
    const tile = (key: string, gen: () => HTMLCanvasElement | { c: HTMLCanvasElement }, y: number, h: number, f: number, depth: number, tinted = true) => {
      const k = canvasTexture(this, key, gen as () => HTMLCanvasElement);
      const ts = this.add2(this.add.tileSprite(0, y, 2400, h, k).setOrigin(0, 0).setDepth(depth));
      if (tinted) ts.setTint(tint);
      this.layers.push({ o: ts, f });
      return ts;
    };
    tile(`bg:sky:${ph}`, () => renderSky(ph), -30, 220, 0.02, -100, false);
    tile(`bg:hills:${ph}`, () => renderHills(ph), -10, 200, 0.1, -90);
    tile(`bg:trees:${ph}`, () => renderTrees(ph), 6, 200, 0.35, -80);
    if (cfg.station) {
      const k = canvasTexture(this, `bg:station:${ph}:1600`, () => renderStation(ph, 1600));
      this.station = this.add2(this.add.image(-420, 4, k).setOrigin(0, 0).setDepth(-70).setTint(tint));
      // quai au premier plan
      const q = this.add2(this.add.rectangle(-2000, 158, 8000, 60, ph === 'nuit' ? 0x1a1a1e : 0x3a3732).setOrigin(0, 0).setDepth(5));
      void q;
      this.add2(this.add.rectangle(-2000, 158, 8000, 2, ph === 'nuit' ? 0x2c2c30 : 0x6a655c).setOrigin(0, 0).setDepth(6));
    }
    tile('bg:ground', () => renderGround(), 150, 70, 1, -10, false).setTint(ph === 'nuit' ? 0x8090a8 : 0xffffff);
    const tk = canvasTexture(this, `bg:trainext:${ph}:1200`, () => renderTrainExterior(ph, 1200));
    this.train = this.add2(this.add.tileSprite(0, 152 - 66, 1200, 70, tk).setOrigin(0, 0).setDepth(0));
    if (ph === 'nuit' || ph === 'crepuscule') {
      // fenêtres éclairées : halos chauds
      for (let i = 0; i < 18; i++) {
        const g = this.add2(this.add.image(0, 152 - 66 + 22, glowTexture(this)).setBlendMode(Phaser.BlendModes.ADD).setTint(0xffb060).setAlpha(0.22).setScale(0.5, 0.35).setDepth(1));
        (g as Phaser.GameObjects.Image & { ox: number }).ox = 26 + (i % 6) * 36 + Math.floor(i / 6) * 240;
        this.glows.push(g);
      }
    }
    const fg = tile('bg:fg', () => renderForeground(), 150 - 200 + 52, 200, 1.7, 50, false);
    fg.setAlpha(cfg.speed ? 0.95 : 0);
    if (this.mode === 'catastrophe') {
      this.flash = this.add2(this.add.rectangle(0, 0, 4000, 400, 0xff4020, 0).setOrigin(0, 0).setDepth(40).setBlendMode(Phaser.BlendModes.ADD));
    }
    if (this.mode === 'embark') this.spawnCrowd();
    if (this.mode === 'later') this.speed = 30;
    else this.speed = cfg.speed;
    this.layout();
  }

  private spawnCrowd() {
    const looks: [string, Look, number][] = [
      ['r1', { body: 'dress', hat: 'bun', accent: '#f3b6cf', base: '#2a0f1c', acc: ['hem', 'necklace'], prop: 'glass' }, 26],
      ['r2', { body: 'tails', hat: 'none', accent: '#efdcae', acc: ['bowtie', 'gloves'], prop: 'case' }, 24],
      ['r3', { body: 'std', hat: 'kerchief', accent: '#5aa0e6', prop: 'bag' }, 30],
      ['r4', { body: 'child', hat: 'cap', accent: '#ff6b3d', acc: ['scarf'], prop: 'none' }, 34],
      ['r5', { body: 'coat', hat: 'bun', accent: '#e8f4f4', acc: ['cross'], prop: 'bag' }, 28],
      ['r6', { body: 'std', hat: 'headlamp', accent: '#35d0b0', acc: ['belt'], prop: 'wrench' }, 31],
      ['r7', { body: 'long', hat: 'hood', accent: '#f5a742', prop: 'bag' }, 27],
      ['r8', { body: 'apron', hat: 'bun', accent: '#ece2c8', prop: 'bag' }, 25],
    ];
    looks.forEach(([id, look, v], i) => {
      const key = charTexture(this, `ride_${id}`, look);
      const s = this.add2(this.add.sprite(20 + i * 52, 170 + (i % 3) * 5, key, 'walk0').setOrigin(0.5, FEET_Y / FRAME_H).setDepth(20 + (i % 3)));
      this.walkers.push({ s, vx: v * 0.6, t: Math.random() });
    });
    // l'homme en gris, immobile
    const grey = charTexture(this, 'ride_gris', { body: 'coat', hat: 'fedora', accent: '#9aa0a8', prop: 'none' });
    const g = this.add2(this.add.sprite(330, 176, grey, 'idle0').setOrigin(0.5, FEET_Y / FRAME_H).setDepth(25).setFlipX(true));
    this.walkers.push({ s: g, vx: 0, t: 0 });
  }

  private layout() {
    const cam = this.cameras.main;
    const z = Math.max(1, Math.round(this.scale.height / this.VIEW));
    cam.setZoom(z);
    cam.centerOn(this.scale.width / z / 2, 112);
  }

  override update(_t: number, dt: number) {
    const s = Math.min(50, dt) / 1000;
    const cfg = MODE[this.mode];
    if (this.mode === 'later') this.speed = Math.max(0, this.speed - 9 * s);
    else this.speed += (cfg.speed - this.speed) * Math.min(1, s * 0.8);
    this.scroll += this.speed * s;
    const cam = this.cameras.main;
    const viewW = this.scale.width / cam.zoom;
    const left = cam.midPoint.x - viewW / 2;
    for (const l of this.layers) {
      l.o.x = left - 20;
      l.o.tilePositionX = this.scroll * l.f + (left - 20) * 0;
    }
    // Le train reste cadré ; les voitures défilent lentement pour suggérer sa longueur.
    this.train.x = left - 20;
    this.train.width = viewW + 60;
    this.train.tilePositionX = 140;
    for (const g of this.glows) {
      const ox = (g as Phaser.GameObjects.Image & { ox: number }).ox;
      g.x = left - 20 + ox - 140 + 10;
      g.visible = g.x < left + viewW + 20;
      if (this.mode === 'catastrophe') g.setAlpha(Math.random() < 0.02 ? 0 : 0.2);
    }
    if (this.station) this.station.x = left - 420 - this.scroll * 0.6;
    if (this.flash) {
      const a = Math.random() < 0.012 ? 0.35 : Math.max(0, this.flash.fillAlpha - s * 0.6);
      this.flash.setFillStyle(0xff5030, a);
      this.flash.x = left - 20;
    }
    for (const w of this.walkers) {
      if (!w.vx) continue;
      w.s.x += w.vx * s;
      w.t += s * (w.vx / 7);
      w.s.setFrame(`walk${Math.floor(w.t * 4) % 4}`);
      if (w.s.x > left + viewW + 40) w.s.x = left - 40 - Math.random() * 120;
    }
  }
}
