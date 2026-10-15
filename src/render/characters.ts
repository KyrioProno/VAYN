// Silhouettes à accessoire : « la silhouette d'abord, un objet fort, un seul accent de couleur ».
// Chaque personnage est une feuille de sprites générée (24 x 36 par image).
import type { Look } from '../engine/types';
import { PC, shade } from './draw';
import { P } from './palette';

export const FRAME_W = 24;
export const FRAME_H = 36;
export const FEET_Y = 34;

export const FRAMES = ['idle0', 'idle1', 'walk0', 'walk1', 'walk2', 'walk3', 'interact', 'talk', 'hurt', 'sit', 'blink'] as const;
export type FrameName = (typeof FRAMES)[number];
export const FRAME_INDEX: Record<FrameName, number> = Object.fromEntries(FRAMES.map((f, i) => [f, i])) as Record<FrameName, number>;

interface Geo {
  hx: number; hy: number; hw: number; hh: number;
  tx: number; ty: number; tw: number; tb: number;
  ax0: number; ax1: number; aw: number; ay0: number; ay1: number;
  lx0: number; lx1: number; lw: number; ly0: number; feet: number;
}

function geoFor(body: Look['body']): Geo {
  const std: Geo = { hx: 9, hy: 6, hw: 6, hh: 6, tx: 7, ty: 13, tw: 10, tb: 24, ax0: 5, ax1: 17, aw: 2, ay0: 14, ay1: 25, lx0: 8, lx1: 13, lw: 3, ly0: 25, feet: FEET_Y };
  switch (body) {
    case 'stocky': return { ...std, hy: 6, tx: 6, tw: 12, ax0: 4, ax1: 18, lx0: 7, lx1: 14, lw: 3 };
    case 'thin': return { ...std, hy: 5, hx: 9, tx: 8, tw: 8, ty: 12, ax0: 6, ax1: 16, ay0: 13, lx0: 9, lx1: 13, lw: 2, ly0: 24 };
    case 'child': return { hx: 10, hy: 13, hw: 5, hh: 5, tx: 9, ty: 19, tw: 7, tb: 27, ax0: 7, ax1: 16, aw: 2, ay0: 20, ay1: 27, lx0: 10, lx1: 13, lw: 2, ly0: 28, feet: FEET_Y };
    default: return std;
  }
}

export interface Pose {
  kind: FrameName;
}

const INK = P.ink;

function drawBody(pc: PC, ox: number, look: Look, frame: FrameName) {
  const g = geoFor(look.body);
  const acc = look.accent;
  const eye = look.eye ?? look.accent;
  const has = (a: NonNullable<Look['acc']>[number]) => !!look.acc?.includes(a);
  const ink = look.base ?? INK;
  const R = (x: number, y: number, w: number, h: number, c: string) => pc.rect(ox + x, y, w, h, c);
  const X = (x: number, y: number, c: string) => pc.px(ox + x, y, c);

  // Paramètres d'animation
  let bob = 0;
  let lDx = 0, rDx = 0, lLift = 0, rLift = 0, lArm = 0, rArm = 0;
  let hunch = 0;
  if (frame === 'idle1') bob = 1;
  if (frame === 'walk0') { lDx = -1; rDx = 1; }
  if (frame === 'walk1') { lLift = 2; bob = -1; rArm = -1; }
  if (frame === 'walk2') { lDx = -1; rDx = 1; }
  if (frame === 'walk3') { rLift = 2; bob = -1; lArm = -1; }
  if (frame === 'hurt') { hunch = 2; lLift = 1; }
  const sit = frame === 'sit';
  const sitDrop = sit ? 6 : 0;
  const up = bob + hunch + sitDrop; // décalage vertical du haut du corps

  const longCoat = look.body === 'long' || look.body === 'robe';
  const coat = look.body === 'coat' || look.body === 'tails';
  const dress = look.body === 'dress' || look.body === 'robe';

  // --- Jambes
  if (!dress || sit) {
    if (sit) {
      // Assis : cuisses vers l'avant, tibias vers le bas.
      const y = g.ly0 + sitDrop - 1;
      R(g.lx0, y, 10, 3, ink);
      R(g.lx0 + 8, y + 2, 3, g.feet - y - 2, ink);
      R(g.lx0 + 8, g.feet, 4, 1, ink);
      R(g.lx1 - 1, y + 1, 9, 2, ink);
    } else {
      const legTop = g.ly0;
      const lH = g.feet - legTop - lLift;
      const rH = g.feet - legTop - rLift;
      R(g.lx0 + lDx, legTop, g.lw, lH, ink);
      R(g.lx1 + rDx, legTop, g.lw, rH, ink);
      // pieds
      R(g.lx0 + lDx - 1, g.feet - lLift, g.lw + 1, 1, ink);
      R(g.lx1 + rDx, g.feet - rLift, g.lw + 1, 1, ink);
      if (has('bandage')) R(g.lx0 + lDx, legTop + 4, g.lw, 2, P.cream3);
    }
  } else if (look.body === 'robe') {
    R(g.lx0, g.feet, g.lw + 1, 1, ink);
    R(g.lx1, g.feet, g.lw + 1, 1, ink);
  }

  // --- Torse et vêtements
  const ty = g.ty + up;
  if (dress) {
    const waist = ty + (look.body === 'robe' ? 0 : 7);
    R(g.tx, ty, g.tw, waist - ty + 1, ink);
    const bottom = g.feet - (look.body === 'robe' ? 1 : 0);
    for (let y = waist; y <= bottom; y++) {
      const t = (y - waist) / Math.max(1, bottom - waist);
      const spread = Math.round(t * 3) + (look.body === 'robe' ? 1 : 0);
      R(g.tx - spread, y, g.tw + spread * 2, 1, ink);
    }
    if (has('hem')) R(g.tx - 3, bottom - 1, g.tw + 6, 2, acc);
  } else {
    R(g.tx, ty, g.tw, g.tb - g.ty + 1 - (sit ? 0 : 0), ink);
    // épaules arrondies
    pc.clear(ox + g.tx, ty, 1, 1);
    pc.clear(ox + g.tx + g.tw - 1, ty, 1, 1);
    if (coat || longCoat) {
      const bottom = longCoat ? g.feet - 2 : g.tb + 5;
      for (let y = g.tb + 1; y <= bottom - sitDrop; y++) {
        const spread = y > g.tb + 2 ? 1 : 0;
        R(g.tx - spread, y + (sit ? sitDrop - 2 : 0), g.tw + spread * 2, 1, ink);
      }
      if (look.body === 'tails') {
        // queue-de-pie : ouverture centrale
        pc.clear(ox + g.tx + 3, g.tb + 2, g.tw - 6, 5);
      }
    }
  }

  // tablier
  if (look.body === 'apron') {
    R(g.tx + 1, ty + 2, g.tw - 2, g.tb - g.ty + 4 - (sit ? 3 : 0), acc);
    R(g.tx + 2, ty + 2, g.tw - 4, 1, shade(acc, 0.15));
    R(g.tx + 1, ty + g.tb - g.ty + 4 - (sit ? 3 : 0), g.tw - 2, 1, shade(acc, -0.25));
  }

  // --- Bras
  const armY0 = g.ay0 + up;
  const armLen = g.ay1 - g.ay0;
  // gauche
  R(g.ax0, armY0, g.aw, armLen + lArm, ink);
  // droit selon pose
  const propHand = { x: g.ax1 + 1, y: g.ay1 + up };
  const raised = look.prop === 'tray' || frame === 'talk';
  if (frame === 'interact') {
    R(g.ax1, armY0, g.aw, 3, ink);
    R(g.ax1 + 1, armY0 + 2, 5, 2, ink);
    propHand.x = g.ax0;
    propHand.y = g.ay1 + up;
  } else if (raised) {
    R(g.ax1, armY0, g.aw, 5, ink);
    R(g.ax1 + 1, armY0 + 3, 4, 2, ink);
    R(g.ax1 + 4, armY0 + 1, 1, 3, ink);
    propHand.x = g.ax1 + 3;
    propHand.y = armY0 + 1;
  } else {
    R(g.ax1, armY0, g.aw, armLen + rArm, ink);
  }
  if (has('gloves')) {
    R(g.ax0, armY0 + armLen + lArm - 2, g.aw, 2, acc);
    if (frame !== 'interact' && !raised) R(g.ax1, armY0 + armLen + rArm - 2, g.aw, 2, acc);
    if (raised) R(g.ax1 + 4, armY0 + 1, 1, 2, acc);
    if (frame === 'interact') R(g.ax1 + 5, armY0 + 2, 1, 2, acc);
  }

  // --- Cou et tête
  const hy = g.hy + up;
  R(g.hx + 2, hy + g.hh, 2, 1, ink);
  R(g.hx, hy, g.hw, g.hh, ink);
  pc.clear(ox + g.hx, hy, 1, 1);
  pc.clear(ox + g.hx + g.hw - 1, hy, 1, 1);

  // --- Accessoires (accent)
  if (has('scarf')) {
    R(g.hx - 1, hy + g.hh, g.hw + 2, 2, acc);
    R(g.hx + g.hw - 2, hy + g.hh + 2, 2, 3, acc);
  }
  if (has('collar')) R(g.hx, ty, g.hw, 1, acc);
  if (has('armband')) R(g.ax0, armY0 + 3, g.aw, 2, acc);
  if (has('belt')) R(g.tx, g.tb + up - 1, g.tw, 1, acc);
  if (has('bowtie')) {
    const bx = g.hx + 1;
    X(bx, ty, acc); X(bx + 3, ty, acc);
    R(bx, ty + 1, 4, 1, acc);
    R(bx + 1, ty + 2, 2, 5, shade(acc, 0.25));
  }
  if (has('buttons')) for (const k of [3, 6, 9]) X(g.tx + Math.floor(g.tw / 2), ty + k, acc);
  if (has('tie')) R(g.tx + Math.floor(g.tw / 2), ty, 1, 7, acc);
  if (has('cross')) {
    R(g.tx + 1, ty + 3, 3, 1, acc);
    R(g.tx + 2, ty + 2, 1, 3, acc);
  }
  if (has('necklace')) for (let i = 0; i < g.hw; i += 2) X(g.hx + i, ty + 1, acc);
  if (has('badge')) R(g.tx + 1, ty + 2, 2, 2, acc);
  if (has('satchel')) {
    pc.line(ox + g.tx + g.tw - 1, ty, ox + g.tx + 1, g.tb + up - 2, acc);
    R(g.tx - 2, g.tb + up - 3, 4, 4, ink);
    R(g.tx - 2, g.tb + up - 3, 4, 1, acc);
  }

  // --- Couvre-chefs
  const hx = g.hx;
  const hw = g.hw;
  switch (look.hat) {
    case 'cap':
      R(hx - 1, hy - 2, hw + 2, 3, ink);
      R(hx + hw, hy, 3, 1, ink);
      if (look.acc?.includes('badge')) X(hx + 2, hy - 1, acc);
      break;
    case 'captain':
      R(hx - 2, hy - 3, hw + 4, 1, ink);
      R(hx - 1, hy - 2, hw + 2, 3, ink);
      R(hx + hw - 1, hy, 3, 1, ink);
      R(hx + 2, hy - 2, 2, 1, acc);
      break;
    case 'top':
      R(hx, hy - 6, hw, 6, ink);
      R(hx - 2, hy - 1, hw + 4, 1, ink);
      R(hx, hy - 2, hw, 1, acc);
      break;
    case 'fedora':
      R(hx, hy - 4, hw, 4, ink);
      pc.clear(ox + hx + 2, hy - 4, 2, 1);
      R(hx - 3, hy - 1, hw + 6, 1, ink);
      R(hx, hy - 2, hw, 1, acc);
      break;
    case 'hood': {
      R(hx - 2, hy - 2, hw + 4, g.hh + 4, ink);
      pc.clear(ox + hx - 2, hy - 2, 1, 1);
      pc.clear(ox + hx + hw + 1, hy - 2, 1, 1);
      R(hx - 3, hy + 3, 1, g.hh, ink);
      R(hx + hw + 2, hy + 3, 1, g.hh, ink);
      // ouverture du visage soulignée par l'accent
      R(hx, hy, hw, g.hh - 1, P.ink2);
      R(hx - 1, hy - 1, hw + 2, 1, acc);
      R(hx - 1, hy - 1, 1, g.hh, acc);
      R(hx + hw, hy - 1, 1, g.hh, acc);
      break;
    }
    case 'beret':
      R(hx - 1, hy - 2, hw + 1, 2, ink);
      X(hx + 2, hy - 3, ink);
      break;
    case 'headlamp':
      R(hx, hy - 1, hw, 2, acc);
      R(hx + 2, hy - 1, 2, 1, '#f4fbff');
      break;
    case 'bun':
      R(hx + 1, hy - 3, hw - 2, 3, ink);
      R(hx - 1, hy + 1, 1, g.hh, ink);
      R(hx + hw, hy + 1, 1, g.hh, ink);
      break;
    case 'goggles':
      R(hx - 1, hy + 1, hw + 2, 1, shade(acc, -0.3));
      X(hx + 1, hy + 1, acc);
      X(hx + 4, hy + 1, acc);
      break;
    case 'kerchief':
      R(hx - 1, hy - 1, hw + 2, 2, acc);
      R(hx + hw, hy + 1, 2, 2, acc);
      break;
    case 'hair':
      R(hx - 1, hy, 1, g.hh + 3, ink);
      R(hx + hw, hy, 1, g.hh + 3, ink);
      R(hx, hy - 1, hw, 1, ink);
      break;
    default:
      break;
  }

  // --- Objet fort (main droite)
  drawProp(pc, ox, look, propHand.x, propHand.y, frame, ink);

  // --- Lumière de contour (haut-gauche) pour la lisibilité sur fond sombre
  rimLight(pc, ox, ink);

  // --- Yeux
  if (frame !== 'blink') {
    const ey = hy + (look.body === 'child' ? 2 : 2);
    const ex = hx + (look.body === 'child' ? 1 : 2);
    if (has('glasses')) {
      R(ex - 1, ey, 2, 1, P.cold);
      R(ex + 2, ey, 2, 1, P.cold);
      X(ex + 1, ey, shade(P.cold, -0.4));
    } else {
      X(ex, ey, eye);
      X(ex + 2, ey, eye);
    }
  }
}

function drawProp(pc: PC, ox: number, look: Look, hx: number, hy: number, frame: FrameName, ink: string) {
  const acc = look.accent;
  const R = (x: number, y: number, w: number, h: number, c: string) => pc.rect(ox + x, y, w, h, c);
  const X = (x: number, y: number, c: string) => pc.px(ox + x, y, c);
  switch (look.prop) {
    case 'lamp':
      X(hx, hy, ink);
      R(hx - 1, hy + 1, 4, 5, ink);
      R(hx, hy + 2, 2, 3, acc);
      X(hx, hy + 2, '#ffffff');
      break;
    case 'wrench':
      R(hx, hy - 11, 1, 13, acc);
      R(hx - 1, hy - 12, 3, 2, acc);
      X(hx, hy - 12, P.ink);
      break;
    case 'tray':
      R(hx - 3, hy - 1, 8, 1, acc);
      R(hx - 2, hy, 6, 1, shade(acc, -0.35));
      R(hx - 2, hy - 4, 1, 3, P.cream3);
      R(hx + 2, hy - 3, 1, 2, P.cream3);
      break;
    case 'glass':
      R(hx - 1, hy - 6, 3, 2, acc);
      X(hx, hy - 4, acc);
      X(hx, hy - 3, acc);
      R(hx - 1, hy - 2, 3, 1, acc);
      break;
    case 'case':
      R(hx - 1, hy + 2, 6, 5, acc);
      R(hx + 1, hy + 1, 2, 1, acc);
      R(hx - 1, hy + 6, 6, 1, shade(acc, -0.35));
      R(hx - 1, hy + 4, 6, 1, shade(acc, -0.2));
      break;
    case 'baton':
      R(hx, hy - 9, 1, 12, P.steel4);
      R(hx, hy - 10, 1, 2, acc);
      break;
    case 'ladle':
      R(hx, hy - 8, 1, 11, P.steel5);
      R(hx - 1, hy + 3, 3, 2, P.steel5);
      break;
    case 'ledger':
      R(hx - 1, hy - 7, 5, 6, acc);
      R(hx, hy - 6, 3, 4, shade(acc, -0.3));
      break;
    case 'lantern':
      X(hx, hy, ink);
      R(hx - 1, hy + 1, 4, 5, ink);
      R(hx, hy + 2, 2, 3, P.warm2);
      R(hx - 1, hy + 1, 4, 1, acc);
      break;
    case 'jerrican':
      R(hx - 2, hy, 6, 7, acc);
      R(hx - 1, hy - 1, 2, 1, acc);
      R(hx - 2, hy + 3, 6, 1, shade(acc, -0.3));
      break;
    case 'cane':
      R(hx + 1, hy - 1, 1, FEET_Y - hy + 1, P.wood2);
      R(hx, hy - 1, 2, 1, P.wood3);
      break;
    case 'bag':
      R(hx - 2, hy - 3, 6, 7, ink);
      R(hx - 1, hy - 4, 4, 1, acc);
      break;
    case 'ticket':
      R(hx, hy - 6, 4, 5, P.paper);
      X(hx + 1, hy - 5, P.ink);
      X(hx + 2, hy - 3, P.ink);
      R(hx, hy - 2, 4, 1, acc);
      break;
    case 'clipboard':
      R(hx - 1, hy - 8, 5, 7, P.wood3);
      R(hx, hy - 7, 3, 5, P.paper);
      R(hx, hy - 8, 3, 1, acc);
      break;
    case 'shotgun':
      pc.line(ox + hx - 7, hy - 9, ox + hx + 3, hy + 1, P.steel3);
      pc.line(ox + hx - 6, hy - 9, ox + hx + 4, hy + 1, P.steel2);
      R(hx + 2, hy, 3, 3, P.wood2);
      break;
    case 'flask':
      R(hx - 1, hy + 1, 4, 5, acc);
      X(hx, hy, acc);
      X(hx + 1, hy + 3, shade(acc, -0.35));
      break;
    case 'crutch':
      R(hx + 1, hy - 12, 1, FEET_Y - hy + 12, P.wood3);
      R(hx - 1, hy - 12, 4, 1, P.wood3);
      break;
    default:
      break;
  }
  void frame;
}

function rimLight(pc: PC, ox: number, ink: string) {
  const img = pc.g.getImageData(ox, 0, FRAME_W, FRAME_H);
  const d = img.data;
  const inkRgb = [parseInt(ink.slice(1, 3), 16), parseInt(ink.slice(3, 5), 16), parseInt(ink.slice(5, 7), 16)];
  const isInk = (i: number) => d[i + 3] > 0 && Math.abs(d[i] - inkRgb[0]) < 6 && Math.abs(d[i + 1] - inkRgb[1]) < 6 && Math.abs(d[i + 2] - inkRgb[2]) < 6;
  const empty = (x: number, y: number) => x < 0 || y < 0 || x >= FRAME_W || y >= FRAME_H || d[(y * FRAME_W + x) * 4 + 3] === 0;
  const marks: number[] = [];
  for (let y = 0; y < FRAME_H; y++) for (let x = 0; x < FRAME_W; x++) {
    const i = (y * FRAME_W + x) * 4;
    if (!isInk(i)) continue;
    if (empty(x - 1, y) || empty(x, y - 1)) marks.push(i);
  }
  for (const i of marks) {
    d[i] = 0x26; d[i + 1] = 0x20; d[i + 2] = 0x1c;
  }
  pc.g.putImageData(img, ox, 0);
}

/** Feuille de sprites complète (11 images). */
export function renderCharacterSheet(look: Look): HTMLCanvasElement {
  const pc = new PC(FRAME_W * FRAMES.length, FRAME_H);
  FRAMES.forEach((f, i) => drawBody(pc, i * FRAME_W, look, f));
  return pc.c;
}

/** Portrait agrandi (DOM) sur halo coloré, dans l'esprit des cartes de référence. */
export function renderPortrait(look: Look, size = 168, scale = 5, bg = true): HTMLCanvasElement {
  const sheet = renderCharacterSheet(look);
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  if (bg) {
    const grad = g.createRadialGradient(size / 2, size * 0.5, 4, size / 2, size * 0.5, size * 0.5);
    grad.addColorStop(0, hexA(look.accent, 0.42));
    grad.addColorStop(0.55, hexA(look.accent, 0.14));
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
  }
  const w = FRAME_W * scale;
  const h = FRAME_H * scale;
  g.fillStyle = 'rgba(0,0,0,0.55)';
  g.beginPath();
  g.ellipse(size / 2, (size - h) / 2 + FEET_Y * scale + scale, 8 * scale, 1.6 * scale, 0, 0, Math.PI * 2);
  g.fill();
  g.drawImage(sheet, 0, 0, FRAME_W, FRAME_H, (size - w) / 2, (size - h) / 2 + scale * 1, w, h);
  return c;
}

function hexA(c: string, a: number) {
  const n = parseInt(c.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
