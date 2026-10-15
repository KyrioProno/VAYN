// Création paresseuse des textures Phaser à partir des générateurs procéduraux.
import Phaser from 'phaser';
import type { Look } from '../engine/types';
import { FRAMES, FRAME_H, FRAME_W, renderCharacterSheet } from '../render/characters';
import { SPRITES } from '../render/furniture';
import type { PC } from '../render/draw';

export function canvasTexture(scene: Phaser.Scene, key: string, make: () => HTMLCanvasElement | PC): string {
  if (scene.textures.exists(key)) return key;
  const c = make();
  const canvas = c instanceof HTMLCanvasElement ? c : c.c;
  scene.textures.addCanvas(key, canvas);
  return key;
}

export function charTexture(scene: Phaser.Scene, id: string, look: Look): string {
  const key = `chr:${id}`;
  if (scene.textures.exists(key)) return key;
  const sheet = renderCharacterSheet(look);
  const tex = scene.textures.addCanvas(key, sheet)!;
  FRAMES.forEach((f, i) => tex.add(f, 0, i * FRAME_W, 0, FRAME_W, FRAME_H));
  return key;
}

export function spriteTexture(scene: Phaser.Scene, name: string): string {
  const key = `spr:${name}`;
  if (scene.textures.exists(key)) return key;
  const gen = SPRITES[name];
  if (!gen) throw new Error(`Sprite inconnu : ${name}`);
  scene.textures.addCanvas(key, gen().c);
  return key;
}

/** Halo lumineux radial (additif). */
export function glowTexture(scene: Phaser.Scene): string {
  const key = 'fx:glow';
  if (scene.textures.exists(key)) return key;
  const s = 64;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, 'rgba(255,255,255,0.9)');
  grad.addColorStop(0.25, 'rgba(255,255,255,0.45)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.12)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, s, s);
  scene.textures.addCanvas(key, c);
  return key;
}

/** Ombre portée elliptique sous les personnages. */
export function shadowTexture(scene: Phaser.Scene): string {
  const key = 'fx:shadow';
  if (scene.textures.exists(key)) return key;
  const c = document.createElement('canvas');
  c.width = 18;
  c.height = 5;
  const g = c.getContext('2d')!;
  g.fillStyle = 'rgba(0,0,0,0.45)';
  g.fillRect(3, 0, 12, 5);
  g.fillRect(1, 1, 16, 3);
  g.fillStyle = 'rgba(0,0,0,0.25)';
  g.fillRect(0, 2, 18, 1);
  scene.textures.addCanvas(key, c);
  return key;
}

/** Cône de lumière de lampe (pour le dépôt sombre). */
export function coneTexture(scene: Phaser.Scene): string {
  const key = 'fx:cone';
  if (scene.textures.exists(key)) return key;
  const w = 120;
  const h = 60;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, w, 0);
  grad.addColorStop(0, 'rgba(255,240,200,0.55)');
  grad.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(0, h / 2 - 3);
  g.lineTo(w, 0);
  g.lineTo(w, h);
  g.lineTo(0, h / 2 + 3);
  g.closePath();
  g.fill();
  scene.textures.addCanvas(key, c);
  return key;
}
