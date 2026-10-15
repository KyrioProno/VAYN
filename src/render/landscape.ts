// Paysage en parallaxe : ciel, collines, gare, ballast, premier plan, brume.
import { PC, rng, shade, mix, drawTinyText } from './draw';
import { P } from './palette';
import { GEO } from '../engine/layout';

export type Phase = 'nuit' | 'aube' | 'jour' | 'crepuscule';

const SKY: Record<Phase, [string, string, string]> = {
  nuit: ['#06080d', '#0d1420', '#1a2230'],
  aube: ['#1c2234', '#5a4a58', '#c98a62'],
  jour: ['#3d4c5c', '#7d8a92', '#b3ada0'],
  crepuscule: ['#151a2a', '#4a2f3a', '#b0563a'],
};

/** Teinte globale appliquée aux couches extérieures selon le moment. */
export const PHASE_TINT: Record<Phase, number> = {
  nuit: 0x4a5878,
  aube: 0xc8a8a0,
  jour: 0xe8e4dc,
  crepuscule: 0xc08070,
};

export function renderSky(phase: Phase, w = 256, h = 200): PC {
  const pc = new PC(w, h);
  const [a, b, c] = SKY[phase];
  pc.gradV(0, 0, w, Math.floor(h * 0.55), a, b, 8);
  pc.gradV(0, Math.floor(h * 0.55), w, h - Math.floor(h * 0.55), b, c, 8);
  const r = rng(phase.length * 13);
  if (phase === 'nuit') {
    for (let i = 0; i < 70; i++) pc.px(Math.floor(r() * w), Math.floor(r() * h * 0.6), r() > 0.8 ? '#cfd8ff' : '#6d7894');
  }
  // nuages en bandes
  for (let i = 0; i < 9; i++) {
    const y = Math.floor(10 + r() * h * 0.5);
    const x = Math.floor(r() * w);
    const len = 30 + Math.floor(r() * 70);
    const col = mix(b, phase === 'nuit' ? '#2a3448' : '#d8cfc0', 0.35);
    pc.dither(x, y, len, 3, col, 0.55);
    pc.dither(x + 8, y - 2, len - 16, 2, col, 0.35);
    if (x + len > w) pc.dither(0, y, x + len - w, 3, col, 0.55);
  }
  return pc;
}

/** Collines lointaines (bouclable). */
export function renderHills(phase: Phase, w = 640, h = 200): PC {
  const pc = new PC(w, h);
  const base = phase === 'nuit' ? '#121822' : phase === 'jour' ? '#4a5258' : '#2a2a34';
  const far = mix(base, SKY[phase][2], 0.45);
  const r = rng(5);
  const ridge = (col: string, y0: number, amp: number, seed: number) => {
    const rr = rng(seed);
    const ph1 = rr() * 6;
    const ph2 = rr() * 6;
    for (let x = 0; x < w; x++) {
      const t = (x / w) * Math.PI * 2;
      const y = y0 + Math.sin(t * 2 + ph1) * amp + Math.sin(t * 5 + ph2) * amp * 0.4 + Math.sin(t * 13) * 2;
      pc.vline(x, Math.round(y), h - Math.round(y), col);
    }
  };
  ridge(far, 92, 10, 3);
  ridge(mix(base, far, 0.4), 108, 8, 9);
  // pylônes
  for (let x = 40; x < w; x += 160) {
    const y = 96 + Math.floor(r() * 8);
    pc.line(x, y, x - 4, y + 22, shade(base, -0.2));
    pc.line(x, y, x + 4, y + 22, shade(base, -0.2));
    pc.hline(x - 6, y + 3, 13, shade(base, -0.2));
  }
  for (let x = 0; x < w; x++) pc.px(x, 100 + Math.round(Math.sin((x / w) * Math.PI * 8) * 3), shade(base, -0.2));
  return pc;
}

/** Arbres et ruines à mi-distance (bouclable). */
export function renderTrees(phase: Phase, w = 640, h = 200): PC {
  const pc = new PC(w, h);
  const c = phase === 'nuit' ? '#0c1016' : phase === 'jour' ? '#2c3430' : '#1a1a20';
  const r = rng(77);
  for (let x = 0; x < w; x += 6 + Math.floor(r() * 10)) {
    const th = 18 + Math.floor(r() * 26);
    const base = 132;
    const kind = r();
    if (kind < 0.55) {
      // feuillu
      pc.vline(x, base - th / 2, th / 2, c);
      pc.ellipse(x, base - th * 0.7, 5 + r() * 6, th * 0.35, c);
    } else if (kind < 0.85) {
      // conifère
      for (let j = 0; j < th; j++) pc.hline(Math.round(x - (j * 0.28)), base - th + j, Math.round(j * 0.56) + 1, c);
    } else {
      // ruine
      const bw = 18 + Math.floor(r() * 18);
      pc.rect(x, base - th, bw, th, c);
      for (let i = 0; i < 3; i++) pc.clear(x + 3 + i * 6, base - th + 5, 3, 4);
      pc.clear(x + bw - 6, base - th, 6, 5);
    }
  }
  pc.rect(0, 130, w, h - 130, c);
  return pc;
}

/** Arrière-plan de la gare de Saint-Aubin (vu depuis le train, côté couloir). Largeur fixe. */
export function renderStation(phase: Phase, w: number): PC {
  const h = 150;
  const pc = new PC(w, h);
  const lit = phase === 'nuit' || phase === 'crepuscule';
  const wall = phase === 'nuit' ? '#1c1a1c' : '#3e3a36';
  const roof = phase === 'nuit' ? '#121216' : '#26262a';
  const r = rng(31);
  // halle principale
  const hx = Math.floor(w * 0.42);
  pc.rect(hx, 34, 300, 116, wall);
  pc.poly([[hx - 10, 36], [hx + 150, 6], [hx + 310, 36]], roof);
  for (let i = 0; i < 7; i++) {
    const x = hx + 18 + i * 40;
    pc.rect(x, 60, 22, 40, lit && i % 3 === 1 ? '#5a4632' : '#121418');
    pc.ellipse(x + 11, 60, 11, 6, lit && i % 3 === 1 ? '#5a4632' : '#121418');
    pc.vline(x + 11, 54, 46, wall);
  }
  pc.rect(hx + 110, 24, 80, 14, P.blue1);
  drawTinyText(pc, 'SAINT-AUBIN', hx + 128, 28, '#8fa3b8');
  pc.circle(hx + 150, 16, 6, '#d8d0b8');
  pc.circle(hx + 150, 16, 5, phase === 'nuit' ? '#6a6458' : '#c8c0a8');
  // marquise sur colonnes le long de tout le quai
  for (let x = 0; x < w; x += 64) {
    pc.rect(x + 30, 70, 3, 80, '#1a1a1e');
  }
  pc.rect(0, 64, w, 7, roof);
  pc.hline(0, 71, w, '#0c0c10');
  for (let x = 0; x < w; x += 6) pc.vline(x, 64, 7, shade(roof, 0.12));
  // entrepôts et château d'eau
  pc.rect(Math.floor(w * 0.08), 52, 160, 98, shade(wall, -0.1));
  for (let i = 0; i < 4; i++) pc.rect(Math.floor(w * 0.08) + 14 + i * 36, 70, 20, 30, '#101216');
  const tx = Math.floor(w * 0.82);
  pc.rect(tx, 20, 46, 28, P.rust1);
  pc.poly([[tx - 2, 20], [tx + 23, 8], [tx + 48, 20]], roof);
  for (const dx of [4, 20, 38]) pc.rect(tx + dx, 48, 3, 102, '#1a1612');
  // lampadaires
  for (let x = 90; x < w; x += 220) {
    pc.rect(x, 74, 2, 76, '#141416');
    pc.rect(x - 4, 74, 10, 2, '#141416');
    if (lit && r() > 0.3) pc.rect(x - 3, 76, 3, 2, P.warm2);
  }
  // végétation qui envahit
  for (let x = 0; x < w; x += 3) {
    const hh = Math.floor(r() * 10);
    pc.vline(x, h - hh, hh, phase === 'nuit' ? '#0f140f' : '#2a3424');
  }
  return pc;
}

/** Ballast + rails sous le train (bouclable, 64 px). */
export function renderGround(w = 64): PC {
  const pc = new PC(w, GEO.H - GEO.UNDER_Y1 + 40);
  const y0 = 0;
  pc.rect(0, y0, w, pc.h, '#1d1a17');
  pc.noise(0, y0, w, pc.h, '#2c2823', 0.35, 4);
  pc.noise(0, y0, w, pc.h, '#141210', 0.2, 5);
  for (let x = 2; x < w; x += 10) pc.rect(x, 4, 6, 3, '#2a2016');
  pc.rect(0, 1, w, 2, '#5e5a54');
  pc.hline(0, 1, w, '#8a857c');
  pc.rect(0, 8, w, 2, '#4a4640');
  return pc;
}

/** Premier plan (poteaux, buissons) qui passe devant la caméra. */
export function renderForeground(w = 1600, h = 200): PC {
  const pc = new PC(w, h);
  const c = '#060505';
  // poteau télégraphique
  pc.rect(200, 20, 8, h - 20, c);
  pc.rect(170, 44, 70, 5, c);
  pc.rect(178, 60, 54, 4, c);
  for (const x of [174, 190, 220, 234]) pc.rect(x, 40, 3, 4, c);
  // buissons et herbes hautes
  const r = rng(9);
  for (let x = 0; x < w; x += 2) {
    const hh = Math.floor((Math.sin(x / 37) + 1) * 8 + r() * 6);
    pc.vline(x, h - hh, hh, c);
  }
  pc.ellipse(1020, h - 10, 40, 16, c);
  pc.ellipse(1060, h - 18, 26, 18, c);
  return pc;
}

/** Vue extérieure du train VAYN, en fond du quai (scène extérieure). */
export function renderTrainExterior(phase: Phase, w: number): PC {
  const h = 70;
  const pc = new PC(w, h);
  const body = phase === 'nuit' ? '#151a20' : '#2a333c';
  const lit = true;
  let x = 0;
  let i = 0;
  while (x < w) {
    const ww = 240;
    pc.rect(x + 2, 6, ww - 4, 50, body);
    pc.rect(x + 4, 2, ww - 8, 6, shade(body, -0.25));
    pc.hline(x + 2, 6, ww - 4, shade(body, 0.2));
    pc.rect(x + 2, 40, ww - 4, 3, P.blue3);
    for (let k = 0; k < 6; k++) {
      const wx = x + 16 + k * 36;
      pc.rect(wx, 14, 20, 16, lit && (k + i) % 3 !== 0 ? '#6a5236' : '#0e1216');
      pc.hline(wx, 14, 20, shade(body, 0.3));
    }
    drawTinyText(pc, 'VAYN', x + 100, 46, '#7c8a96');
    pc.rect(x + 30, 56, 40, 8, '#0c0c0c');
    pc.rect(x + ww - 70, 56, 40, 8, '#0c0c0c');
    pc.circle(x + 40, 62, 5, '#0a0a0a');
    pc.circle(x + 60, 62, 5, '#0a0a0a');
    pc.circle(x + ww - 60, 62, 5, '#0a0a0a');
    pc.circle(x + ww - 40, 62, 5, '#0a0a0a');
    x += ww;
    i++;
  }
  return pc;
}

/** Nappe de brume (scène extérieure), bouclable. */
export function renderHaze(w = 256, h = 180): PC {
  const pc = new PC(w, h);
  const r = rng(12);
  for (let y = 0; y < h; y++) {
    const d = 0.25 + 0.55 * (y / h);
    for (let x = 0; x < w; x++) {
      const n = Math.sin(x / 19 + y / 7) * 0.12 + Math.sin(x / 7 - y / 11) * 0.08 + (r() - 0.5) * 0.1;
      if (Math.random() < d + n) pc.px(x, y, 'rgba(176,184,150,0.55)');
    }
  }
  return pc;
}
