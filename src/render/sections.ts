// Rendu des sections (wagons, bâtiments, extérieurs) en coupe latérale « maison de poupée ».
import type { LampDef, SectionDef } from '../engine/types';
import { GEO } from '../engine/layout';
import { PC, rng, shade, mix, hex, bakeLighting, drawTinyText, type BakeLight, type RGB } from './draw';
import { P } from './palette';

const { ROOF_TOP, WALL_TOP, FLOOR_Y0, FLOOR_Y1, SILL_Y1, UNDER_Y1, H, WALL_T } = GEO;
const WIN_Y0 = 24;
const WIN_Y1 = 48;

export interface SectionArt {
  bg: PC;
}

interface Theme {
  wall(pc: PC, x0: number, x1: number, seed: number): void;
  floor(pc: PC, x0: number, x1: number, seed: number): void;
  frame: string;
  ambient: number;
  amb: string;
}

// ---------------------------------------------------------------------------
// Motifs de murs
// ---------------------------------------------------------------------------

function steelPanels(pc: PC, x0: number, x1: number, base: string, seam: string) {
  pc.rect(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, base);
  for (let x = x0 + 4; x < x1; x += 30) {
    pc.vline(x, WALL_TOP, FLOOR_Y0 - WALL_TOP, seam);
    pc.vline(x + 1, WALL_TOP, FLOOR_Y0 - WALL_TOP, shade(base, 0.1));
    for (let y = WALL_TOP + 4; y < FLOOR_Y0 - 2; y += 6) {
      pc.px(x - 2, y, shade(base, 0.22));
      pc.px(x + 3, y, shade(base, 0.22));
    }
  }
  pc.hline(x0, WALL_TOP + 22, x1 - x0, seam);
}

function wainscot(pc: PC, x0: number, x1: number, top: number, c: string, rail: string) {
  pc.rect(x0, top, x1 - x0, FLOOR_Y0 - top, c);
  pc.hline(x0, top, x1 - x0, rail);
  pc.hline(x0, top + 1, x1 - x0, shade(rail, -0.3));
  for (let x = x0 + 6; x < x1 - 10; x += 22) {
    pc.frame(x, top + 4, 16, FLOOR_Y0 - top - 8, shade(c, -0.25));
    pc.hline(x + 1, top + 5, 14, shade(c, 0.12));
  }
}

function stains(pc: PC, x0: number, x1: number, y0: number, y1: number, c: string, seed: number, n = 6) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0 - 10);
    const y = y0 + r() * (y1 - y0 - 8);
    pc.dither(Math.round(x), Math.round(y), 4 + Math.floor(r() * 8), 3 + Math.floor(r() * 8), c, 0.35);
  }
}

const THEMES: Record<string, Theme> = {
  engine: {
    frame: P.steel1, ambient: 0.62, amb: '#c8d4e0',
    wall(pc, x0, x1, seed) {
      steelPanels(pc, x0, x1, P.steel2, P.steel1);
      // conduites
      pc.rect(x0, WALL_TOP + 3, x1 - x0, 4, P.rust1);
      pc.hline(x0, WALL_TOP + 3, x1 - x0, P.rust2);
      pc.rect(x0, WALL_TOP + 9, x1 - x0, 2, P.steel3);
      for (let x = x0 + 20; x < x1; x += 46) pc.rect(x, WALL_TOP + 2, 3, 7, P.steel4);
      // bande de danger
      for (let x = x0; x < x1; x += 8) pc.poly([[x, FLOOR_Y0 - 6], [x + 4, FLOOR_Y0 - 6], [x + 8, FLOOR_Y0 - 1], [x + 4, FLOOR_Y0 - 1]], '#5b4a17');
      pc.rect(x0, FLOOR_Y0 - 7, x1 - x0, 1, P.steel1);
      stains(pc, x0, x1, WALL_TOP + 12, FLOOR_Y0 - 10, P.rust1, seed, 8);
    },
    floor(pc, x0, x1) {
      pc.rect(x0, FLOOR_Y0, x1 - x0, FLOOR_Y1 - FLOOR_Y0, P.steel2);
      for (let y = FLOOR_Y0 + 2; y < FLOOR_Y1; y += 4) for (let x = x0 + ((y >> 2) % 2) * 3; x < x1; x += 6) pc.rect(x, y, 2, 1, P.steel3);
      for (let x = x0 + 40; x < x1; x += 64) pc.vline(x, FLOOR_Y0, FLOOR_Y1 - FLOOR_Y0, P.steel1);
    },
  },
  workshop: {
    frame: P.steel1, ambient: 0.58, amb: '#e7d2b4',
    wall(pc, x0, x1, seed) {
      steelPanels(pc, x0, x1, '#2c3036', P.steel1);
      wainscot(pc, x0, x1, FLOOR_Y0 - 16, P.wood1, P.wood2);
      pc.rect(x0, WALL_TOP + 2, x1 - x0, 3, P.steel3);
      stains(pc, x0, x1, WALL_TOP + 8, FLOOR_Y0 - 18, '#1c1a17', seed, 10);
    },
    floor(pc, x0, x1, seed) {
      planks(pc, x0, x1, P.wood2, P.wood1, seed);
      stains(pc, x0, x1, FLOOR_Y0 + 6, FLOOR_Y1 - 4, '#14100c', seed + 3, 9);
    },
  },
  medical: {
    frame: P.steel2, ambient: 0.68, amb: '#d8f0ff',
    wall(pc, x0, x1, seed) {
      pc.rect(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, P.tile1);
      for (let y = WALL_TOP + 2; y < FLOOR_Y0; y += 6) pc.hline(x0, y, x1 - x0, P.tile0);
      for (let x = x0; x < x1; x += 6) pc.vline(x, WALL_TOP, FLOOR_Y0 - WALL_TOP, P.tile0);
      for (let y = WALL_TOP + 3; y < FLOOR_Y0; y += 6) for (let x = x0 + 1; x < x1; x += 6) pc.px(x, y, P.tile2);
      pc.rect(x0, FLOOR_Y0 - 14, x1 - x0, 14, P.green2);
      pc.hline(x0, FLOOR_Y0 - 14, x1 - x0, P.green3);
      stains(pc, x0, x1, WALL_TOP + 4, FLOOR_Y0 - 16, '#3b4a44', seed, 7);
    },
    floor(pc, x0, x1) {
      checker(pc, x0, x1, '#66726d', '#5a6662', 10);
    },
  },
  canteen: {
    frame: P.steel1, ambient: 0.6, amb: '#ffe0b8',
    wall(pc, x0, x1, seed) {
      pc.rect(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, '#55636b');
      // arcades de béton comme sur la référence
      for (let x = x0 + 8; x < x1 - 30; x += 44) {
        pc.rect(x, WALL_TOP + 6, 36, FLOOR_Y0 - WALL_TOP - 6, '#6b7c84');
        pc.ellipse(x + 18, WALL_TOP + 10, 18, 6, '#6b7c84');
        pc.rect(x + 2, WALL_TOP + 12, 32, FLOOR_Y0 - WALL_TOP - 14, '#5b6a72');
        pc.vline(x, WALL_TOP + 8, FLOOR_Y0 - WALL_TOP - 8, '#3e4950');
      }
      pc.rect(x0, FLOOR_Y0 - 12, x1 - x0, 12, '#3a3530');
      pc.hline(x0, FLOOR_Y0 - 12, x1 - x0, P.conc3);
      stains(pc, x0, x1, WALL_TOP + 8, FLOOR_Y0 - 14, '#40494e', seed, 12);
    },
    floor(pc, x0, x1) {
      checker(pc, x0, x1, '#7e715d', '#746753', 12);
    },
  },
  cargo: {
    frame: P.steel1, ambient: 0.42, amb: '#f2cf9c',
    wall(pc, x0, x1, seed) {
      pc.rect(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, '#2b2622');
      for (let x = x0; x < x1; x += 4) {
        pc.vline(x, WALL_TOP, FLOOR_Y0 - WALL_TOP, '#352f2a');
        pc.vline(x + 1, WALL_TOP, FLOOR_Y0 - WALL_TOP, '#221e1b');
      }
      for (let y = WALL_TOP + 14; y < FLOOR_Y0; y += 18) pc.rect(x0, y, x1 - x0, 2, P.rust1);
      stains(pc, x0, x1, WALL_TOP + 4, FLOOR_Y0 - 6, '#17130f', seed, 10);
    },
    floor(pc, x0, x1, seed) {
      planks(pc, x0, x1, '#4a3826', '#33261a', seed);
    },
  },
  dorm: {
    frame: P.wood1, ambient: 0.48, amb: '#f6d5a8',
    wall(pc, x0, x1, seed) {
      pc.rect(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, '#6b5a3c');
      for (let x = x0; x < x1; x += 6) {
        pc.vline(x, WALL_TOP, FLOOR_Y0 - WALL_TOP, '#5d4e33');
        pc.dither(x + 3, WALL_TOP, 1, FLOOR_Y0 - WALL_TOP, '#7c6a49', 0.5);
      }
      wainscot(pc, x0, x1, FLOOR_Y0 - 18, P.wood1, P.wood3);
      stains(pc, x0, x1, WALL_TOP + 2, FLOOR_Y0 - 20, '#4a3d28', seed, 14);
    },
    floor(pc, x0, x1, seed) {
      pc.rect(x0, FLOOR_Y0, x1 - x0, FLOOR_Y1 - FLOOR_Y0, '#4f4536');
      pc.noise(x0, FLOOR_Y0, x1 - x0, FLOOR_Y1 - FLOOR_Y0, '#5b5040', 0.12, seed);
      // tapis élimé central
      pc.rect(x0, FLOOR_Y0 + 14, x1 - x0, 22, '#5a2e22');
      pc.hline(x0, FLOOR_Y0 + 15, x1 - x0, '#7a4a2a');
      pc.hline(x0, FLOOR_Y0 + 34, x1 - x0, '#7a4a2a');
      pc.dither(x0, FLOOR_Y0 + 17, x1 - x0, 16, '#4c271d', 0.3);
    },
  },
  office: {
    frame: P.wood1, ambient: 0.55, amb: '#f3dcb0',
    wall(pc, x0, x1, seed) {
      pc.rect(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, '#2f3b31');
      for (let x = x0 + 3; x < x1; x += 10) pc.vline(x, WALL_TOP, FLOOR_Y0 - WALL_TOP, '#29342b');
      wainscot(pc, x0, x1, FLOOR_Y0 - 22, P.wood2, P.wood3);
      pc.rect(x0, WALL_TOP, x1 - x0, 3, P.wood2);
      stains(pc, x0, x1, WALL_TOP + 4, FLOOR_Y0 - 24, '#243026', seed, 8);
    },
    floor(pc, x0, x1, seed) {
      planks(pc, x0, x1, P.wood2, P.wood1, seed);
      pc.rect(x0, FLOOR_Y0 + 12, x1 - x0, 26, '#203a2c');
      pc.hline(x0, FLOOR_Y0 + 13, x1 - x0, P.gold);
      pc.hline(x0, FLOOR_Y0 + 36, x1 - x0, P.gold);
    },
  },
  salon: {
    frame: P.wood1, ambient: 0.66, amb: '#ffd9a0',
    wall(pc, x0, x1, seed) {
      pc.rect(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, '#a88a5a');
      for (let x = x0; x < x1; x += 8) {
        pc.rect(x, WALL_TOP, 3, FLOOR_Y0 - WALL_TOP, '#b99b68');
        pc.vline(x + 5, WALL_TOP, FLOOR_Y0 - WALL_TOP, '#8f7449');
      }
      pc.rect(x0, WALL_TOP, x1 - x0, 4, P.red1);
      pc.hline(x0, WALL_TOP + 4, x1 - x0, P.gold);
      wainscot(pc, x0, x1, FLOOR_Y0 - 20, P.red1, P.gold);
      stains(pc, x0, x1, WALL_TOP + 6, FLOOR_Y0 - 22, '#7a6340', seed, 6);
    },
    floor(pc, x0, x1) {
      pc.rect(x0, FLOOR_Y0, x1 - x0, FLOOR_Y1 - FLOOR_Y0, P.red2);
      pc.rect(x0, FLOOR_Y0 + 4, x1 - x0, 2, P.gold);
      pc.rect(x0, FLOOR_Y1 - 6, x1 - x0, 2, P.gold);
      for (let y = FLOOR_Y0 + 10; y < FLOOR_Y1 - 8; y += 6) for (let x = x0 + ((y / 6) % 2) * 6; x < x1; x += 12) {
        pc.px(x, y, '#d89a48');
        pc.px(x - 1, y + 1, '#9a3a2c');
        pc.px(x + 1, y + 1, '#9a3a2c');
      }
      pc.dither(x0, FLOOR_Y0 + 8, x1 - x0, FLOOR_Y1 - FLOOR_Y0 - 16, P.red1, 0.18);
    },
  },
  hall: {
    frame: P.conc0, ambient: 0.5, amb: '#d6dce6',
    wall(pc, x0, x1, seed) {
      pc.rect(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, '#8c836f');
      pc.noise(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, '#7a7260', 0.18, seed);
      pc.rect(x0, FLOOR_Y0 - 16, x1 - x0, 16, '#3f5250');
      for (let x = x0; x < x1; x += 5) pc.vline(x, FLOOR_Y0 - 16, 16, '#344543');
      pc.hline(x0, FLOOR_Y0 - 16, x1 - x0, '#5c706c');
      // plâtre arraché
      const r = rng(seed + 9);
      for (let i = 0; i < 8; i++) {
        const x = x0 + r() * (x1 - x0 - 20);
        const y = WALL_TOP + 4 + r() * 24;
        pc.ellipse(x, y, 4 + r() * 8, 2 + r() * 4, '#5e4a3a');
        pc.dither(Math.round(x - 6), Math.round(y - 3), 12, 6, P.brick2, 0.5);
      }
      stains(pc, x0, x1, WALL_TOP, FLOOR_Y0 - 18, '#5f5747', seed, 14);
    },
    floor(pc, x0, x1, seed) {
      checker(pc, x0, x1, '#6a645a', '#605a51', 12);
      debris(pc, x0, x1, seed, 30);
    },
  },
  depot: {
    frame: P.brick0, ambient: 0.32, amb: '#a9b6c6',
    wall(pc, x0, x1, seed) {
      bricks(pc, x0, x1, WALL_TOP, FLOOR_Y0, seed);
      stains(pc, x0, x1, WALL_TOP, FLOOR_Y0 - 4, '#1d120d', seed, 16);
    },
    floor(pc, x0, x1, seed) {
      pc.rect(x0, FLOOR_Y0, x1 - x0, FLOOR_Y1 - FLOOR_Y0, P.conc1);
      pc.noise(x0, FLOOR_Y0, x1 - x0, FLOOR_Y1 - FLOOR_Y0, P.conc0, 0.2, seed);
      // rails noyés
      for (const y of [FLOOR_Y0 + 22, FLOOR_Y0 + 32]) {
        pc.hline(x0, y, x1 - x0, P.steel3);
        pc.hline(x0, y + 1, x1 - x0, P.steel1);
      }
      debris(pc, x0, x1, seed, 40);
    },
  },
  signal: {
    frame: P.wood0, ambient: 0.5, amb: '#e9d4b0',
    wall(pc, x0, x1, seed) {
      pc.rect(x0, WALL_TOP, x1 - x0, FLOOR_Y0 - WALL_TOP, '#4b3a28');
      for (let y = WALL_TOP; y < FLOOR_Y0; y += 5) {
        pc.hline(x0, y, x1 - x0, '#3a2c1e');
        pc.dither(x0, y + 1, x1 - x0, 1, '#5a4630', 0.4);
      }
      stains(pc, x0, x1, WALL_TOP, FLOOR_Y0 - 4, '#2c2016', seed, 10);
    },
    floor(pc, x0, x1, seed) {
      planks(pc, x0, x1, '#5a4430', '#3d2e20', seed);
    },
  },
};

function planks(pc: PC, x0: number, x1: number, a: string, b: string, seed: number) {
  pc.rect(x0, FLOOR_Y0, x1 - x0, FLOOR_Y1 - FLOOR_Y0, a);
  const r = rng(seed);
  for (let y = FLOOR_Y0; y < FLOOR_Y1; y += 6) {
    pc.hline(x0, y, x1 - x0, b);
    let x = x0 + Math.floor(r() * 30);
    while (x < x1) {
      pc.vline(x, y, 6, b);
      x += 30 + Math.floor(r() * 30);
    }
    pc.dither(x0, y + 1, x1 - x0, 1, shade(a, 0.12), 0.35);
  }
}

function checker(pc: PC, x0: number, x1: number, a: string, b: string, s: number) {
  // Carrelage discret : carreaux alternés peu contrastés + joints.
  const th = Math.max(3, Math.round(s / 2));
  for (let y = FLOOR_Y0, row = 0; y < FLOOR_Y1; y += th, row++) {
    for (let x = x0 - (row % 2) * Math.round(s / 2), col = 0; x < x1; x += s, col++) {
      const c = (col + row) % 2 === 0 ? a : b;
      const xa = Math.max(x0, x);
      const xb = Math.min(x1, x + s);
      if (xb > xa) pc.rect(xa, y, xb - xa, th, c);
      if (x >= x0) pc.vline(x, y, th, shade(b, -0.18));
    }
    pc.hline(x0, y, x1 - x0, shade(b, -0.22));
    pc.dither(x0, y + 1, x1 - x0, 1, shade(a, 0.08), 0.25);
  }
}

function bricks(pc: PC, x0: number, x1: number, y0: number, y1: number, seed: number) {
  pc.rect(x0, y0, x1 - x0, y1 - y0, P.brick1);
  const r = rng(seed);
  for (let y = y0; y < y1; y += 4) {
    const off = ((y - y0) / 4) % 2 ? 4 : 0;
    for (let x = x0 - off; x < x1; x += 8) {
      const c = [P.brick2, P.brick1, P.brick3, P.brick2][Math.floor(r() * 4)];
      pc.rect(Math.max(x0, x), y, Math.min(7, x1 - Math.max(x0, x)), 3, c);
    }
  }
}

function debris(pc: PC, x0: number, x1: number, seed: number, n: number) {
  const r = rng(seed * 7 + 1);
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0);
    const y = FLOOR_Y0 + 4 + r() * (FLOOR_Y1 - FLOOR_Y0 - 8);
    const w = 1 + Math.floor(r() * 3);
    pc.rect(x, y, w, 1, r() > 0.5 ? P.conc3 : P.conc0);
  }
}

// ---------------------------------------------------------------------------
// Décor mural (cuit dans l'arrière-plan)
// ---------------------------------------------------------------------------

function wallDecor(pc: PC, d: NonNullable<SectionDef['decor']>[number], theme: string) {
  const x = d.x;
  const y = d.y ?? 26;
  const v = d.v ?? 0;
  switch (d.type) {
    case 'sconce':
      pc.rect(x - 1, y + 2, 3, 6, P.gold);
      pc.rect(x - 3, y, 7, 3, P.gold2);
      pc.rect(x - 2, y - 3, 5, 3, P.warm2);
      break;
    case 'cagelamp':
      pc.rect(x - 3, y, 7, 5, P.steel1);
      pc.rect(x - 2, y + 1, 5, 3, P.warm2);
      pc.vline(x - 1, y, 5, P.steel1);
      pc.vline(x + 1, y, 5, P.steel1);
      break;
    case 'tube':
      pc.rect(x - 10, y, 20, 3, P.steel3);
      pc.rect(x - 9, y + 1, 18, 1, P.cold2);
      break;
    case 'poster': {
      const w = d.w ?? 14;
      const h = d.h ?? 18;
      const c = [P.cream2, '#b9a27a', '#8fa3a8', '#c4b080'][v % 4];
      pc.rect(x, y, w, h, c);
      pc.rect(x + 2, y + 2, w - 4, h / 2, shade(c, -0.3));
      pc.hline(x + 2, y + h - 5, w - 4, shade(c, -0.45));
      pc.hline(x + 2, y + h - 3, w - 6, shade(c, -0.45));
      pc.px(x + w - 2, y + 1, shade(c, -0.5));
      pc.clear(x + w - 3, y + h - 3, 3, 3);
      break;
    }
    case 'frame': {
      const w = d.w ?? 14;
      const h = d.h ?? 11;
      pc.rect(x, y, w, h, P.gold);
      pc.rect(x + 2, y + 2, w - 4, h - 4, ['#2c3a4a', '#3a2a24', '#2e3a2a'][v % 3]);
      pc.dither(x + 2, y + 2 + (h - 4) / 2, w - 4, (h - 4) / 2, '#5a4a30', 0.4);
      break;
    }
    case 'clock':
      pc.circle(x, y, 5, P.wood2);
      pc.circle(x, y, 4, P.cream3);
      pc.vline(x, y - 3, 3, P.ink);
      pc.hline(x, y, 3, P.ink);
      break;
    case 'vent':
      pc.rect(x, y, 14, 8, P.steel1);
      for (let j = 1; j < 8; j += 2) pc.hline(x + 1, y + j, 12, P.steel3);
      break;
    case 'pipe':
      pc.rect(x, WALL_TOP, 3, FLOOR_Y0 - WALL_TOP, P.rust1);
      pc.vline(x, WALL_TOP, FLOOR_Y0 - WALL_TOP, P.rust2);
      pc.rect(x - 1, y, 5, 2, P.steel3);
      break;
    case 'sign': {
      const label = ['SORTIE', 'EAU', 'DANGER', 'SILENCE', 'INFIRMERIE', 'CANTINE', 'ATELIER', 'CONTROLE', 'SALON', 'SOUTE', 'DORTOIRS', 'MACHINES', 'PAS PERDUS', 'DEPOT', 'POSTE 4'][v] ?? 'VAYN';
      const w = label.length * 4 + 5;
      pc.rect(x, y, w, 9, theme === 'salon' ? P.red1 : P.blue1);
      pc.frame(x, y, w, 9, theme === 'salon' ? P.gold : P.steel3);
      drawTinyText(pc, label, x + 3, y + 2, theme === 'salon' ? P.gold2 : P.cream2);
      break;
    }
    case 'holes':
      for (let i = 0; i < 5; i++) {
        pc.px(x + i * 4 + (i % 2) * 2, y + (i % 3) * 3, P.ink);
        pc.px(x + i * 4 + (i % 2) * 2 + 1, y + (i % 3) * 3, shade('#888888', -0.4));
      }
      break;
    case 'crack':
      pc.line(x, y, x + 6, y + 8, P.ink2);
      pc.line(x + 6, y + 8, x + 3, y + 16, P.ink2);
      pc.line(x + 6, y + 8, x + 12, y + 11, P.ink2);
      break;
    case 'column':
      pc.rect(x - 3, WALL_TOP, 7, FLOOR_Y0 - WALL_TOP, P.wood1);
      pc.vline(x - 2, WALL_TOP, FLOOR_Y0 - WALL_TOP, P.gold);
      pc.rect(x - 5, WALL_TOP, 11, 4, P.gold);
      pc.rect(x - 5, FLOOR_Y0 - 4, 11, 4, P.gold);
      break;
    case 'drape':
      for (let j = 0; j < 22; j++) {
        pc.rect(x - 9 + Math.floor(j / 6), WALL_TOP + 4 + j, 6, 1, j % 2 ? P.red2 : P.red3);
        pc.rect(x + 4 - Math.floor(j / 6), WALL_TOP + 4 + j, 6, 1, j % 2 ? P.red2 : P.red3);
      }
      pc.rect(x - 12, WALL_TOP + 3, 24, 3, P.red1);
      break;
    case 'shelf': {
      const w = d.w ?? 26;
      pc.rect(x, y, w, 2, P.wood3);
      pc.hline(x, y + 2, w, P.wood0);
      const r = rng(x);
      for (let i = 2; i < w - 3; i += 4) pc.rect(x + i, y - 3 - Math.floor(r() * 3), 3, 3 + Math.floor(r() * 3), [P.cream1, P.rust2, P.steel4, P.green3][Math.floor(r() * 4)]);
      break;
    }
    case 'hooks':
      for (let i = 0; i < 4; i++) {
        pc.px(x + i * 6, y, P.steel5);
        pc.rect(x + i * 6 - 1, y + 1, 4, 8 + (i % 2) * 3, [P.rust1, P.blue2, P.green1, P.wood2][i]);
      }
      break;
    case 'board':
      pc.rect(x, y, d.w ?? 22, d.h ?? 14, '#1d2620');
      pc.frame(x, y, d.w ?? 22, d.h ?? 14, P.wood2);
      for (let j = 3; j < (d.h ?? 14) - 2; j += 3) pc.hline(x + 3, y + j, (d.w ?? 22) - 8 - (j % 5), P.cream1);
      break;
    case 'gauge':
      pc.circle(x, y, 4, P.steel1);
      pc.circle(x, y, 3, P.cream2);
      pc.line(x, y, x + 2, y - 2, P.alarm);
      break;
    case 'hazard':
      for (let i = 0; i < (d.w ?? 24); i += 6) pc.rect(x + i, y, 3, 4, P.amber);
      break;
    case 'graffiti':
      drawTinyText(pc, ['ILS MENTENT', 'OU EST THEO ?', 'EAU = VIE', 'CLAIRVAL', 'NE PAS OUVRIR'][v] ?? '?', x, y, ['#c84a3a', '#d8d0b8', '#5b9bd8', '#e0c050', '#c84a3a'][v] ?? P.cream2);
      break;
    case 'mirror':
      pc.rect(x, y, 10, 14, P.gold);
      pc.rect(x + 1, y + 1, 8, 12, '#5a7088');
      pc.line(x + 2, y + 10, x + 6, y + 3, '#8aa4bc');
      break;
    case 'cross':
      pc.rect(x, y + 3, 9, 3, '#b8323a');
      pc.rect(x + 3, y, 3, 9, '#b8323a');
      break;
    case 'cable':
      for (let i = 0; i < (d.w ?? 60); i++) pc.px(x + i, y + Math.round(Math.sin(i / 9) * 2 + (i % 30 === 0 ? 1 : 0)), P.ink2);
      break;
    case 'bigwindow':
      break;
    default:
      break;
  }
}

// ---------------------------------------------------------------------------
// Sections
// ---------------------------------------------------------------------------

export function sectionLights(sec: SectionDef): BakeLight[] {
  return (sec.lamps ?? []).map((l: LampDef) => ({ x: l.x, y: l.y, r: l.r, color: l.color, power: l.power ?? 0.9 }));
}

export function sectionAmbient(sec: SectionDef): RGB {
  const th = THEMES[sec.theme];
  const a = sec.ambient ?? th?.ambient ?? 0.55;
  const c = hex(th?.amb ?? '#ffffff').map((v) => (v / 255) * a) as RGB;
  return c;
}

export function renderSection(sec: SectionDef, ends: { left: boolean; right: boolean } = { left: true, right: true }): SectionArt {
  const W = sec.w;
  const pc = new PC(W, H);
  const seed = sec.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const th = THEMES[sec.theme] ?? THEMES.cargo;

  if (sec.kind === 'outdoor') {
    renderOutdoor(pc, sec, seed);
    return { bg: pc };
  }

  const wagon = sec.kind === 'wagon';
  const x0 = WALL_T;
  const x1 = W - WALL_T;

  // Mur du fond + sol
  th.wall(pc, x0, x1, seed);
  th.floor(pc, x0, x1, seed);
  for (const d of sec.decor ?? []) wallDecor(pc, d, sec.theme);

  // Fenêtres (découpes transparentes laissant voir le paysage)
  for (const w of sec.windows ?? []) drawWindow(pc, w.x, w.w, sec.theme, wagon);

  // Ombre portée au pied du mur
  for (let j = 0; j < 4; j++) pc.rect(x0, FLOOR_Y0 + j, x1 - x0, 1, `rgba(0,0,0,${0.42 - j * 0.1})`);
  // Ombre sous le plafond
  for (let j = 0; j < 4; j++) pc.rect(x0, WALL_TOP + j, x1 - x0, 1, `rgba(0,0,0,${0.4 - j * 0.09})`);

  // Éclairage précalculé (mur + sol)
  bakeLighting(pc, sectionLights(sec), sectionAmbient(sec), { y0: WALL_TOP, h: FLOOR_Y1 - WALL_TOP, maxBoost: 1.5 });

  // Bord avant coupé du plancher
  pc.rect(0, FLOOR_Y1, W, SILL_Y1 - FLOOR_Y1, wagon ? P.steel1 : P.conc0);
  pc.hline(0, FLOOR_Y1, W, wagon ? P.steel3 : P.conc2);
  pc.hline(0, FLOOR_Y1 + 1, W, wagon ? P.steel2 : P.conc1);
  if (wagon) for (let x = 6; x < W; x += 12) pc.px(x, FLOOR_Y1 + 4, P.steel3);

  if (wagon) {
    roof(pc, W, sec.theme);
    undercarriage(pc, W, seed);
  } else {
    // Toit / plafond de bâtiment
    pc.rect(0, ROOF_TOP, W, WALL_TOP - ROOF_TOP, th.frame);
    pc.hline(0, ROOF_TOP, W, shade(th.frame, 0.25));
    for (let x = 4; x < W; x += 20) pc.rect(x, ROOF_TOP + 2, 10, 2, shade(th.frame, 0.15));
    // fondations
    pc.rect(0, SILL_Y1, W, 10, P.conc0);
    pc.noise(0, SILL_Y1, W, 10, P.conc1, 0.3, seed);
  }

  // Parois d'extrémité (vues par la tranche)
  endWall(pc, 0, th.frame, wagon, ends.left);
  endWall(pc, W - WALL_T, th.frame, wagon, ends.right);

  return { bg: pc };
}

function drawWindow(pc: PC, x: number, w: number, theme: string, wagon: boolean) {
  const frame = theme === 'salon' ? P.gold : theme === 'dorm' || theme === 'office' || theme === 'signal' ? P.wood2 : P.steel3;
  const y0 = theme === 'signal' ? WALL_TOP + 6 : WIN_Y0;
  const y1 = theme === 'signal' ? WIN_Y1 + 4 : WIN_Y1;
  pc.rect(x - 2, y0 - 2, w + 4, y1 - y0 + 5, frame);
  pc.hline(x - 2, y0 - 2, w + 4, shade(frame, 0.25));
  pc.clear(x, y0, w, y1 - y0);
  // vitre sale semi-transparente
  pc.rect(x, y0, w, y1 - y0, 'rgba(40,52,64,0.28)');
  pc.line(x + 3, y1 - 3, x + Math.min(w - 2, 12), y0 + 2, 'rgba(200,220,255,0.18)');
  pc.line(x + 6, y1 - 2, x + Math.min(w - 2, 16), y0 + 5, 'rgba(200,220,255,0.12)');
  if (w > 24) pc.rect(x + Math.floor(w / 2) - 1, y0, 2, y1 - y0, frame);
  pc.rect(x - 3, y1 + 1, w + 6, 2, shade(frame, -0.2));
  if (theme === 'salon') {
    // rideaux
    for (let j = 0; j < y1 - y0 + 4; j++) {
      pc.rect(x - 4, y0 - 3 + j, 4 + (j > 18 ? 1 : 0), 1, j % 2 ? P.red2 : P.red3);
      pc.rect(x + w - (j > 18 ? 1 : 0), y0 - 3 + j, 4 + (j > 18 ? 1 : 0), 1, j % 2 ? P.red2 : P.red3);
    }
  }
  if (theme === 'cargo' || theme === 'depot') {
    for (let i = x + 3; i < x + w; i += 5) pc.vline(i, y0, y1 - y0, P.steel1);
  }
  void wagon;
}

function roof(pc: PC, W: number, theme: string) {
  const c = theme === 'salon' ? '#3a1c18' : P.steel1;
  pc.rect(2, ROOF_TOP, W - 4, WALL_TOP - ROOF_TOP, c);
  pc.rect(0, ROOF_TOP + 2, W, WALL_TOP - ROOF_TOP - 2, c);
  pc.hline(3, ROOF_TOP, W - 6, shade(c, 0.35));
  pc.hline(1, ROOF_TOP + 1, W - 2, shade(c, 0.18));
  for (let x = 8; x < W - 6; x += 10) pc.px(x, ROOF_TOP + 4, shade(c, 0.3));
  pc.hline(0, WALL_TOP - 1, W, P.ink);
  if (theme === 'salon') pc.hline(0, WALL_TOP - 3, W, P.gold);
  // aérateurs sur le toit
  for (let x = 40; x < W - 40; x += 120) {
    pc.rect(x, ROOF_TOP - 3, 16, 4, P.steel2);
    pc.hline(x, ROOF_TOP - 3, 16, P.steel3);
  }
}

function undercarriage(pc: PC, W: number, seed: number) {
  pc.rect(6, SILL_Y1, W - 12, 6, P.ink);
  pc.rect(10, SILL_Y1 + 6, W - 20, 3, '#141210');
  // caisses techniques
  const r = rng(seed + 11);
  for (let x = Math.floor(W * 0.3); x < W * 0.7 - 20; x += 30 + Math.floor(r() * 16)) {
    const w = 18 + Math.floor(r() * 10);
    pc.rect(x, SILL_Y1 + 6, w, 10 + Math.floor(r() * 4), '#1a1816');
    pc.hline(x, SILL_Y1 + 6, w, '#2a2622');
    for (let i = x + 3; i < x + w - 2; i += 4) pc.vline(i, SILL_Y1 + 9, 5, '#24211e');
  }
  for (const bx of [Math.floor(W * 0.16), Math.floor(W * 0.84)]) bogie(pc, bx);
  // attelages
  pc.rect(0, SILL_Y1 + 8, 8, 4, '#1a1715');
  pc.rect(W - 8, SILL_Y1 + 8, 8, 4, '#1a1715');
}

function bogie(pc: PC, cx: number) {
  const y = UNDER_Y1 - 8;
  pc.rect(cx - 26, y - 12, 52, 8, '#191715');
  pc.hline(cx - 26, y - 12, 52, '#2c2824');
  for (const dx of [-14, 14]) {
    pc.circle(cx + dx, y, 8, '#0f0e0d');
    pc.ring(cx + dx, y, 8, '#2a2622');
    pc.circle(cx + dx, y, 2, '#3a3530');
    pc.line(cx + dx - 6, y, cx + dx + 6, y, '#1e1c1a');
  }
  pc.rect(cx - 4, y - 9, 8, 6, '#24211e');
  for (let i = -2; i <= 2; i++) pc.hline(cx - 3, y - 8 + i + 2, 6, i % 2 ? '#3a3530' : '#24211e');
}

function endWall(pc: PC, x: number, c: string, wagon: boolean, open = true) {
  pc.rect(x, wagon ? ROOF_TOP + 2 : ROOF_TOP, WALL_T, FLOOR_Y1 - ROOF_TOP, c);
  pc.vline(x, ROOF_TOP + 2, FLOOR_Y1 - ROOF_TOP, shade(c, 0.25));
  pc.vline(x + WALL_T - 1, ROOF_TOP + 2, FLOOR_Y1 - ROOF_TOP, shade(c, -0.3));
  // ouverture d'intercirculation (gangway) : on évide le bas
  if (!open) return;
  pc.clear(x, FLOOR_Y0 + 4, WALL_T, FLOOR_Y1 - FLOOR_Y0 - 14);
  pc.rect(x, FLOOR_Y0 + 4, WALL_T, 2, shade(c, 0.15));
}

/** Soufflet d'intercirculation entre deux wagons. */
export function renderGangway(gap: number): PC {
  const w = gap + WALL_T * 2;
  const pc = new PC(w, H);
  pc.rect(0, WALL_TOP + 4, w, FLOOR_Y0 - WALL_TOP - 4, '#15120f');
  for (let x = 0; x < w; x += 3) pc.vline(x, WALL_TOP + 4, FLOOR_Y0 - WALL_TOP - 4, '#211c18');
  pc.rect(0, FLOOR_Y0, w, FLOOR_Y1 - FLOOR_Y0, '#2a2622');
  for (let y = FLOOR_Y0 + 2; y < FLOOR_Y1; y += 4) pc.hline(0, y, w, '#36302a');
  pc.rect(0, FLOOR_Y1, w, 4, P.steel1);
  pc.rect(0, ROOF_TOP + 4, w, 6, '#1a1714');
  return pc;
}

/** Cloison interne entre deux pièces : haut (derrière) et bas (devant) séparés pour le tri en profondeur. */
export function renderPartition(theme: string, doorY0: number, doorY1: number): { top: PC; bottom: PC } {
  const th = THEMES[theme] ?? THEMES.cargo;
  const T = GEO.PART_T;
  const c = th.frame;
  const top = new PC(T + 4, doorY0 - WALL_TOP + 1);
  top.rect(2, 0, T, top.h, c);
  top.vline(2, 0, top.h, shade(c, 0.28));
  top.vline(T + 1, 0, top.h, shade(c, -0.3));
  // chambranle
  top.rect(0, top.h - 26, T + 4, 2, shade(c, 0.2));
  top.rect(0, top.h - 26, 1, 26, shade(c, 0.12));
  top.rect(T + 3, top.h - 26, 1, 26, shade(c, -0.2));
  const bh = FLOOR_Y1 - doorY1 + 2;
  const bottom = new PC(T + 4, Math.max(2, bh));
  bottom.rect(2, 0, T, bottom.h, c);
  bottom.vline(2, 0, bottom.h, shade(c, 0.28));
  bottom.vline(T + 1, 0, bottom.h, shade(c, -0.3));
  bottom.rect(0, 0, T + 4, 1, shade(c, 0.2));
  return { top, bottom };
}

/** Battant de porte (fermé) dans l'ouverture d'une cloison. */
export function renderDoorLeaf(theme: string, h: number, locked: boolean): PC {
  const th = THEMES[theme] ?? THEMES.cargo;
  const pc = new PC(GEO.PART_T + 2, h);
  const c = theme === 'salon' ? P.red2 : theme === 'office' || theme === 'dorm' ? P.wood2 : shade(th.frame, 0.18);
  pc.rect(0, 0, pc.w, h, c);
  pc.vline(0, 0, h, shade(c, 0.25));
  pc.vline(pc.w - 1, 0, h, shade(c, -0.35));
  pc.rect(2, 3, pc.w - 4, 2, shade(c, -0.25));
  pc.px(pc.w - 2, Math.floor(h * 0.55), locked ? P.alarm : P.ok);
  return pc;
}

/** Grille de séparation horizontale (soute) : posée en profondeur. */
export function renderGate(w: number, opening?: [number, number]): PC {
  const pc = new PC(w, 34);
  for (let x = 0; x < w; x += 2) for (let y = 2; y < 32; y += 2) if ((x + y) % 4 === 0) pc.px(x, y, P.steel3);
  pc.rect(0, 0, w, 2, P.steel2);
  pc.rect(0, 32, w, 2, P.steel1);
  for (let x = 0; x < w; x += 24) pc.rect(x, 0, 2, 34, P.steel2);
  if (opening) pc.clear(opening[0], 0, opening[1] - opening[0], 34);
  return pc;
}

// ---------------------------------------------------------------------------
// Sections extérieures (quai, cour, talus)
// ---------------------------------------------------------------------------

function renderOutdoor(pc: PC, sec: SectionDef, seed: number) {
  const W = sec.w;
  const r = rng(seed);
  const ground = sec.theme === 'platform' ? '#4c4842' : sec.theme === 'embankment' ? '#2f3424' : '#3d3730';
  // sol
  pc.rect(0, FLOOR_Y0 - 2, W, H - FLOOR_Y0 + 2, ground);
  if (sec.theme === 'platform') {
    for (let x = 0; x < W; x += 24) pc.vline(x, FLOOR_Y0, FLOOR_Y1 - FLOOR_Y0, '#3f3b36');
    for (let y = FLOOR_Y0 + 12; y < FLOOR_Y1; y += 12) pc.hline(0, y, W, '#3f3b36');
    pc.rect(0, FLOOR_Y1 - 4, W, 3, '#b49a3c');
    pc.rect(0, FLOOR_Y1, W, 10, '#2c2925');
    pc.hline(0, FLOOR_Y1, W, '#5e5850');
    pc.noise(0, FLOOR_Y0, W, FLOOR_Y1 - FLOOR_Y0, '#57524b', 0.08, seed);
    // ballast sous le quai
    pc.rect(0, FLOOR_Y1 + 10, W, H - FLOOR_Y1 - 10, '#24211d');
    pc.noise(0, FLOOR_Y1 + 10, W, H - FLOOR_Y1 - 10, '#3a352f', 0.3, seed + 1);
  } else if (sec.theme === 'yard') {
    pc.noise(0, FLOOR_Y0, W, H - FLOOR_Y0, '#4f483e', 0.3, seed);
    pc.noise(0, FLOOR_Y0, W, H - FLOOR_Y0, '#2b2621', 0.2, seed + 2);
    for (const y of [FLOOR_Y0 + 14, FLOOR_Y0 + 36]) {
      for (let x = 0; x < W; x += 6) pc.rect(x, y - 2, 3, 7, '#3a2a1c');
      pc.hline(0, y, W, P.steel4);
      pc.hline(0, y + 1, W, P.steel1);
      pc.hline(0, y + 3, W, P.steel4);
      pc.hline(0, y + 4, W, P.steel1);
    }
    for (let i = 0; i < 30; i++) {
      const x = r() * W;
      const y = FLOOR_Y0 + r() * (FLOOR_Y1 - FLOOR_Y0);
      pc.vline(Math.round(x), Math.round(y) - 2, 3, '#4f6a3a');
      pc.px(Math.round(x) + 1, Math.round(y) - 1, '#5d7a44');
    }
    pc.rect(0, FLOOR_Y1 + 2, W, H - FLOOR_Y1, '#241f1a');
  } else {
    // talus herbeux
    pc.noise(0, FLOOR_Y0, W, H - FLOOR_Y0, '#3c4430', 0.35, seed);
    pc.noise(0, FLOOR_Y0, W, H - FLOOR_Y0, '#262b1d', 0.2, seed + 3);
    for (let x = 0; x < W; x += 2) {
      const h = 2 + Math.floor(r() * 4);
      pc.vline(x, FLOOR_Y0 - h, h, r() > 0.5 ? '#3f4a2c' : '#4c5834');
    }
    // sentier
    pc.rect(0, FLOOR_Y0 + 18, W, 14, '#4a3f32');
    pc.noise(0, FLOOR_Y0 + 18, W, 14, '#5b4e3c', 0.3, seed + 4);
    pc.rect(0, FLOOR_Y1 + 2, W, H - FLOOR_Y1, '#1f2318');
  }
  // bord du terrain
  for (let j = 0; j < 4; j++) pc.dither(0, FLOOR_Y0 - 2 + j, W, 1, '#000000', 0.4 - j * 0.1);
  bakeLighting(pc, sectionLights(sec), sectionAmbient(sec), { y0: FLOOR_Y0 - 8, h: H - FLOOR_Y0 + 8, maxBoost: 1.3 });
  void mix;
}

export function themeAmbient(theme: string): number {
  return THEMES[theme]?.ambient ?? 0.55;
}
