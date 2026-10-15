// Outils de dessin pixel-art sur canvas (coordonnées entières, pas d'anticrénelage).

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type RGB = [number, number, number];

export function hex(c: string): RGB {
  const v = c.replace('#', '');
  const n = parseInt(v.length === 3 ? v.split('').map((x) => x + x).join('') : v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function toHex([r, g, b]: RGB): string {
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('');
}

export function mix(a: string, b: string, t: number): string {
  const A = hex(a);
  const B = hex(b);
  return toHex([A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t]);
}

export function shade(c: string, f: number): string {
  const [r, g, b] = hex(c);
  return f >= 0 ? toHex([r + (255 - r) * f, g + (255 - g) * f, b + (255 - b) * f]) : toHex([r * (1 + f), g * (1 + f), b * (1 + f)]);
}

export function hexNum(c: string): number {
  return parseInt(c.replace('#', ''), 16);
}

const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
export function bayer(x: number, y: number): number {
  return BAYER4[(y & 3) * 4 + (x & 3)];
}

export class PC {
  readonly c: HTMLCanvasElement;
  readonly g: CanvasRenderingContext2D;
  readonly w: number;
  readonly h: number;

  constructor(w: number, h: number) {
    this.w = Math.max(1, Math.ceil(w));
    this.h = Math.max(1, Math.ceil(h));
    this.c = document.createElement('canvas');
    this.c.width = this.w;
    this.c.height = this.h;
    const g = this.c.getContext('2d', { willReadFrequently: true });
    if (!g) throw new Error('Canvas 2D indisponible');
    this.g = g;
    g.imageSmoothingEnabled = false;
  }

  rect(x: number, y: number, w: number, h: number, color: string) {
    if (w <= 0 || h <= 0) return;
    this.g.fillStyle = color;
    this.g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  px(x: number, y: number, color: string) {
    this.g.fillStyle = color;
    this.g.fillRect(Math.round(x), Math.round(y), 1, 1);
  }

  clear(x: number, y: number, w: number, h: number) {
    this.g.clearRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  hline(x: number, y: number, w: number, color: string) { this.rect(x, y, w, 1, color); }
  vline(x: number, y: number, h: number, color: string) { this.rect(x, y, 1, h, color); }

  frame(x: number, y: number, w: number, h: number, color: string) {
    this.hline(x, y, w, color);
    this.hline(x, y + h - 1, w, color);
    this.vline(x, y, h, color);
    this.vline(x + w - 1, y, h, color);
  }

  line(x0: number, y0: number, x1: number, y1: number, color: string) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    this.g.fillStyle = color;
    for (;;) {
      this.g.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  /** Remplissage tramé : densité 0..1 de la couleur b sur la zone. */
  dither(x: number, y: number, w: number, h: number, color: string, density: number) {
    this.g.fillStyle = color;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      if (bayer(x + i, y + j) < density) this.g.fillRect(x + i, y + j, 1, 1);
    }
  }

  /** Dégradé vertical par bandes, avec transitions tramées. */
  gradV(x: number, y: number, w: number, h: number, top: string, bottom: string, steps = 6) {
    for (let j = 0; j < h; j++) {
      const t = h <= 1 ? 0 : j / (h - 1);
      const k = t * (steps - 1);
      const k0 = Math.floor(k);
      const f = k - k0;
      const c0 = mix(top, bottom, k0 / Math.max(1, steps - 1));
      const c1 = mix(top, bottom, Math.min(steps - 1, k0 + 1) / Math.max(1, steps - 1));
      for (let i = 0; i < w; i++) {
        this.g.fillStyle = bayer(x + i, y + j) < f ? c1 : c0;
        this.g.fillRect(x + i, y + j, 1, 1);
      }
    }
  }

  noise(x: number, y: number, w: number, h: number, color: string, density: number, seed = 1) {
    const r = rng(seed);
    this.g.fillStyle = color;
    const n = Math.round(w * h * density);
    for (let i = 0; i < n; i++) this.g.fillRect(x + Math.floor(r() * w), y + Math.floor(r() * h), 1, 1);
  }

  ellipse(cx: number, cy: number, rx: number, ry: number, color: string) {
    this.g.fillStyle = color;
    for (let j = -ry; j <= ry; j++) {
      const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (j * j) / (ry * ry + 0.0001))));
      this.g.fillRect(Math.round(cx - half), Math.round(cy + j), half * 2 + 1, 1);
    }
  }

  circle(cx: number, cy: number, r: number, color: string) { this.ellipse(cx, cy, r, r, color); }

  ring(cx: number, cy: number, r: number, color: string) {
    this.g.fillStyle = color;
    for (let a = 0; a < Math.PI * 2; a += 0.5 / Math.max(1, r)) {
      this.g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1);
    }
  }

  poly(pts: [number, number][], color: string) {
    const g = this.g;
    g.fillStyle = color;
    // Remplissage scanline (pas d'anticrénelage).
    const ys = pts.map((p) => p[1]);
    const y0 = Math.floor(Math.min(...ys));
    const y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) {
      const xs: number[] = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i];
        const [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= y + 0.5 && by > y + 0.5) || (by <= y + 0.5 && ay > y + 0.5)) {
          xs.push(ax + ((y + 0.5 - ay) / (by - ay)) * (bx - ax));
        }
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const a = Math.round(xs[i]);
        const b = Math.round(xs[i + 1]);
        if (b > a) g.fillRect(a, y, b - a, 1);
      }
    }
  }

  /** Boîte en perspective 3/4 : face supérieure (profondeur d) puis face avant (hauteur h). */
  box(x: number, y: number, w: number, d: number, h: number, top: string, front: string, outline = '#0d0b0a') {
    this.rect(x, y, w, d, top);
    this.rect(x, y + d, w, h, front);
    this.hline(x + 1, y, w - 2, shade(top, 0.18));
    this.hline(x, y + d, w, shade(front, 0.12));
    this.hline(x, y + d + h - 1, w, shade(front, -0.35));
    this.vline(x, y, d + h, outline);
    this.vline(x + w - 1, y, d + h, outline);
    this.hline(x, y + d + h, w, outline);
    this.hline(x + 1, y - 1, w - 2, outline);
  }

  draw(src: PC | HTMLCanvasElement, x: number, y: number, flip = false) {
    const c = src instanceof PC ? src.c : src;
    if (!flip) this.g.drawImage(c, Math.round(x), Math.round(y));
    else {
      this.g.save();
      this.g.translate(Math.round(x) + c.width, Math.round(y));
      this.g.scale(-1, 1);
      this.g.drawImage(c, 0, 0);
      this.g.restore();
    }
  }

  text(s: string, x: number, y: number, color: string) {
    // Mini-police 3x5 pour les inscriptions murales.
    drawTinyText(this, s, x, y, color);
  }
}

// Police 3x5 (majuscules, chiffres, ponctuation simple).
const GLYPHS: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
  F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
  K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
  P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
  Z: '111001010100111', '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110',
  '4': '101101111001001', '5': '111100110001110', '6': '011100111101111', '7': '111001010010010', '8': '111101111101111',
  '9': '111101111001110', '-': '000000111000000', '.': '000000000000010', ':': '000010000010000', '/': '001001010100100',
  '!': '010010010000010', '?': '110001010000010', '+': '000010111010000', '%': '101001010100101', "'": '010010000000000',
  '#': '101111101111101', ' ': '000000000000000', '×': '000101010101000', '°': '010101010000000',
};

export function drawTinyText(pc: PC, s: string, x: number, y: number, color: string) {
  let cx = x;
  const up = s.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const ch of up) {
    const g = GLYPHS[ch] ?? GLYPHS[' '];
    for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (g[j * 3 + i] === '1') pc.px(cx + i, y + j, color);
    cx += 4;
  }
}

export function tinyTextWidth(s: string): number {
  return s.length * 4 - 1;
}

// ---------------------------------------------------------------------------
// Éclairage précalculé (lumière par pixel + tramage ordonné)
// ---------------------------------------------------------------------------

export interface BakeLight { x: number; y: number; r: number; color: string; power: number }

export function bakeLighting(pc: PC, lights: BakeLight[], ambient: RGB, opts: { x0?: number; y0?: number; w?: number; h?: number; levels?: number; maxBoost?: number } = {}) {
  const x0 = opts.x0 ?? 0;
  const y0 = opts.y0 ?? 0;
  const w = opts.w ?? pc.w;
  const h = opts.h ?? pc.h;
  const levels = opts.levels ?? 10;
  const maxBoost = opts.maxBoost ?? 1.45;
  const img = pc.g.getImageData(x0, y0, w, h);
  const d = img.data;
  const L = lights.map((l) => ({ ...l, c: hex(l.color).map((v) => v / 255) as RGB }));
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const k = (j * w + i) * 4;
      if (d[k + 3] === 0) continue;
      const X = x0 + i;
      const Y = y0 + j;
      let lr = ambient[0];
      let lg = ambient[1];
      let lb = ambient[2];
      for (const l of L) {
        const dx = (X - l.x) / l.r;
        const dy = ((Y - l.y) * 1.25) / l.r;
        const dist = dx * dx + dy * dy;
        if (dist >= 1) continue;
        const f = (1 - Math.sqrt(dist)) ** 1.6 * l.power;
        lr += l.c[0] * f;
        lg += l.c[1] * f;
        lb += l.c[2] * f;
      }
      const th = bayer(X, Y) - 0.5;
      const q = (v: number) => Math.min(maxBoost, Math.max(0, Math.round(v * levels + th) / levels));
      d[k] = Math.min(255, d[k] * q(lr));
      d[k + 1] = Math.min(255, d[k + 1] * q(lg));
      d[k + 2] = Math.min(255, d[k + 2] * q(lb));
    }
  }
  pc.g.putImageData(img, x0, y0);
}

/** Calcule le facteur de lumière (0..1.4) en un point, pour teinter les sprites. */
export function lightAt(x: number, y: number, lights: BakeLight[], ambient: RGB): RGB {
  let lr = ambient[0];
  let lg = ambient[1];
  let lb = ambient[2];
  for (const l of lights) {
    const c = hex(l.color);
    const dx = (x - l.x) / l.r;
    const dy = ((y - l.y) * 1.25) / l.r;
    const dist = dx * dx + dy * dy;
    if (dist >= 1) continue;
    const f = (1 - Math.sqrt(dist)) ** 1.6 * l.power;
    lr += (c[0] / 255) * f;
    lg += (c[1] / 255) * f;
    lb += (c[2] / 255) * f;
  }
  return [lr, lg, lb];
}
