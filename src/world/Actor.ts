// Personnage animé dans la scène (joueur, PNJ, compagnon).
import Phaser from 'phaser';
import type { Pt } from '../engine/navgrid';
import { FEET_Y, FRAME_H } from '../render/characters';
import { shadowTexture } from './textures';

export type ActorPose = 'stand' | 'sit' | 'lie' | 'hurt';

export class Actor {
  readonly id: string;
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly shadow: Phaser.GameObjects.Image;
  x: number;
  y: number;
  facing: 1 | -1 = 1;
  path: Pt[] = [];
  /** Vitesse en pixels-monde par seconde. */
  speed = 46;
  pose: ActorPose = 'stand';
  talking = false;
  interacting = 0;
  onArrive: (() => void) | null = null;
  onStep: ((dist: number) => void) | null = null;
  private animT = Math.random() * 3;
  private blinkT = 2 + Math.random() * 3;
  private walkDist = 0;
  visible = true;

  constructor(scene: Phaser.Scene, id: string, texture: string, x: number, y: number) {
    this.id = id;
    this.x = x;
    this.y = y;
    this.shadow = scene.add.image(x, y, shadowTexture(scene)).setOrigin(0.5, 0.5);
    this.sprite = scene.add.sprite(x, y, texture, 'idle0').setOrigin(0.5, FEET_Y / FRAME_H);
    this.sync();
  }

  get moving(): boolean {
    return this.path.length > 0;
  }

  setPath(path: Pt[], onArrive: (() => void) | null = null) {
    this.path = path.slice();
    this.onArrive = onArrive;
    if (!this.path.length && onArrive) {
      this.onArrive = null;
      onArrive();
    }
  }

  stop() {
    this.path = [];
    this.onArrive = null;
  }

  face(x: number) {
    if (Math.abs(x - this.x) > 1) this.facing = x > this.x ? 1 : -1;
  }

  teleport(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.path = [];
    this.sync();
  }

  update(dt: number) {
    const s = dt / 1000;
    this.animT += s;
    if (this.interacting > 0) this.interacting -= s;
    let frame = 'idle0';
    if (this.path.length) {
      const target = this.path[0];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const d = Math.hypot(dx, dy);
      const step = this.speed * s;
      if (d <= step) {
        this.x = target.x;
        this.y = target.y;
        this.path.shift();
        this.onStep?.(d);
        if (!this.path.length) {
          const cb = this.onArrive;
          this.onArrive = null;
          cb?.();
        }
      } else {
        this.x += (dx / d) * step;
        this.y += (dy / d) * step;
        this.onStep?.(step);
      }
      if (Math.abs(dx) > 0.5) this.facing = dx > 0 ? 1 : -1;
      this.walkDist += step;
      const k = Math.floor(this.walkDist / 4.2) % 4;
      frame = `walk${k}`;
    } else if (this.pose === 'sit') {
      frame = 'sit';
    } else if (this.pose === 'hurt') {
      frame = 'hurt';
    } else if (this.interacting > 0) {
      frame = 'interact';
    } else if (this.talking) {
      frame = Math.floor(this.animT * 2.2) % 3 === 0 ? 'talk' : 'idle0';
    } else {
      frame = Math.floor(this.animT / 0.9) % 2 === 0 ? 'idle0' : 'idle1';
      this.blinkT -= s;
      if (this.blinkT < 0) {
        frame = 'blink';
        if (this.blinkT < -0.14) this.blinkT = 2.5 + Math.random() * 4;
      }
    }
    this.sprite.setFrame(frame);
    this.sync();
  }

  sync() {
    const lie = this.pose === 'lie';
    this.sprite.setPosition(Math.round(this.x), Math.round(this.y));
    this.sprite.setFlipX(this.facing < 0);
    this.sprite.setAngle(lie ? -90 * this.facing : 0);
    if (lie) this.sprite.setPosition(Math.round(this.x), Math.round(this.y) - 3);
    this.sprite.setDepth(this.y + 0.2);
    this.shadow.setPosition(Math.round(this.x), Math.round(this.y) + 0.5);
    this.shadow.setDepth(this.y - 0.4);
    this.shadow.setScale(lie ? 2 : 1, 1);
    this.sprite.setVisible(this.visible);
    this.shadow.setVisible(this.visible);
  }

  setTint(c: number) {
    this.sprite.setTint(c);
  }

  destroy() {
    this.sprite.destroy();
    this.shadow.destroy();
  }
}
