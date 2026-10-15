// Grille de navigation + A* (8 directions, sans coupe d'angle) + lissage par ligne de vue.
// Coordonnées en pixels-monde ; la grille couvre la bande de sol praticable [y0, y1].

export interface Pt { x: number; y: number }

export class NavGrid {
  readonly cols: number;
  readonly rows: number;
  readonly cell: number;
  readonly y0: number;
  readonly width: number;
  private blocked: Uint8Array;

  constructor(width: number, y0: number, y1: number, cell = 4) {
    this.cell = cell;
    this.y0 = y0;
    this.width = width;
    this.cols = Math.ceil(width / cell);
    this.rows = Math.ceil((y1 - y0) / cell);
    this.blocked = new Uint8Array(this.cols * this.rows).fill(1);
  }

  /** Marque un rectangle (pixels) comme praticable ou bloqué. */
  setRect(x: number, y: number, w: number, h: number, blocked: boolean) {
    const c0 = Math.max(0, Math.floor(x / this.cell));
    const c1 = Math.min(this.cols - 1, Math.ceil((x + w) / this.cell) - 1);
    const r0 = Math.max(0, Math.floor((y - this.y0) / this.cell));
    const r1 = Math.min(this.rows - 1, Math.ceil((y + h - this.y0) / this.cell) - 1);
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) this.blocked[r * this.cols + c] = blocked ? 1 : 0;
  }

  inBounds(c: number, r: number) {
    return c >= 0 && r >= 0 && c < this.cols && r < this.rows;
  }

  walkableCell(c: number, r: number): boolean {
    return this.inBounds(c, r) && this.blocked[r * this.cols + c] === 0;
  }

  toCell(p: Pt): [number, number] {
    return [Math.floor(p.x / this.cell), Math.floor((p.y - this.y0) / this.cell)];
  }

  cellCenter(c: number, r: number): Pt {
    return { x: c * this.cell + this.cell / 2, y: this.y0 + r * this.cell + this.cell / 2 };
  }

  walkable(p: Pt): boolean {
    const [c, r] = this.toCell(p);
    return this.walkableCell(c, r);
  }

  /** Cellule praticable la plus proche (recherche en anneaux). */
  nearestWalkable(p: Pt, maxR = 40): Pt | null {
    const [c0, r0] = this.toCell(p);
    if (this.walkableCell(c0, r0)) return this.cellCenter(c0, r0);
    for (let rad = 1; rad <= maxR; rad++) {
      let best: [number, number] | null = null;
      let bestD = Infinity;
      for (let dr = -rad; dr <= rad; dr++) {
        for (let dc = -rad; dc <= rad; dc++) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== rad) continue;
          const c = c0 + dc;
          const r = r0 + dr;
          if (!this.walkableCell(c, r)) continue;
          const d = dc * dc + dr * dr * 1.4;
          if (d < bestD) {
            bestD = d;
            best = [c, r];
          }
        }
      }
      if (best) return this.cellCenter(best[0], best[1]);
    }
    return null;
  }

  /** Composante connexe accessible depuis p. */
  reachable(p: Pt): Uint8Array {
    const seen = new Uint8Array(this.cols * this.rows);
    const start = this.nearestWalkable(p, 6);
    if (!start) return seen;
    const [sc, sr] = this.toCell(start);
    const stack = [sr * this.cols + sc];
    seen[stack[0]] = 1;
    while (stack.length) {
      const i = stack.pop()!;
      const c = i % this.cols;
      const r = (i - c) / this.cols;
      const nb = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [dc, dr] of nb) {
        const nc = c + dc;
        const nr = r + dr;
        if (!this.walkableCell(nc, nr)) continue;
        const j = nr * this.cols + nc;
        if (!seen[j]) {
          seen[j] = 1;
          stack.push(j);
        }
      }
    }
    return seen;
  }

  /** Point accessible le plus proche de la cible (si la cible elle-même est inaccessible). */
  nearestReachable(from: Pt, target: Pt): { pt: Pt; exact: boolean } | null {
    const reach = this.reachable(from);
    const t = this.nearestWalkable(target, 12);
    if (t) {
      const [c, r] = this.toCell(t);
      if (reach[r * this.cols + c]) return { pt: t, exact: true };
    }
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < reach.length; i++) {
      if (!reach[i]) continue;
      const c = i % this.cols;
      const r = (i - c) / this.cols;
      const p = this.cellCenter(c, r);
      const d = (p.x - target.x) ** 2 + ((p.y - target.y) * 1.5) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best < 0) return null;
    const c = best % this.cols;
    return { pt: this.cellCenter(c, (best - c) / this.cols), exact: false };
  }

  findPath(from: Pt, to: Pt): Pt[] | null {
    const s = this.nearestWalkable(from, 8);
    const g = this.nearestWalkable(to, 8);
    if (!s || !g) return null;
    const [sc, sr] = this.toCell(s);
    const [gc, gr] = this.toCell(g);
    const N = this.cols * this.rows;
    const start = sr * this.cols + sc;
    const goal = gr * this.cols + gc;
    if (start === goal) return [{ x: to.x, y: to.y }];
    const gScore = new Float32Array(N).fill(Infinity);
    const came = new Int32Array(N).fill(-1);
    const closed = new Uint8Array(N);
    const heap = new MinHeap();
    gScore[start] = 0;
    heap.push(start, this.h(sc, sr, gc, gr));
    const dirs = [
      [1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1],
      [1, 1, Math.SQRT2], [1, -1, Math.SQRT2], [-1, 1, Math.SQRT2], [-1, -1, Math.SQRT2],
    ];
    let found = false;
    let iter = 0;
    while (heap.size) {
      const cur = heap.pop();
      if (cur === goal) {
        found = true;
        break;
      }
      if (closed[cur]) continue;
      closed[cur] = 1;
      if (++iter > 200000) break;
      const c = cur % this.cols;
      const r = (cur - c) / this.cols;
      for (const [dc, dr, cost] of dirs) {
        const nc = c + dc;
        const nr = r + dr;
        if (!this.walkableCell(nc, nr)) continue;
        if (dc && dr && (!this.walkableCell(c + dc, r) || !this.walkableCell(c, r + dr))) continue;
        const j = nr * this.cols + nc;
        if (closed[j]) continue;
        const ng = gScore[cur] + cost;
        if (ng < gScore[j]) {
          gScore[j] = ng;
          came[j] = cur;
          heap.push(j, ng + this.h(nc, nr, gc, gr));
        }
      }
    }
    if (!found) return null;
    const cells: number[] = [];
    for (let i = goal; i !== -1; i = came[i]) cells.push(i);
    cells.reverse();
    const pts = cells.map((i) => {
      const c = i % this.cols;
      return this.cellCenter(c, (i - c) / this.cols);
    });
    // La destination exacte si elle est praticable.
    if (this.walkable(to)) pts[pts.length - 1] = { x: to.x, y: to.y };
    return this.smooth([s, ...pts.slice(1)]);
  }

  private h(c: number, r: number, gc: number, gr: number) {
    const dx = Math.abs(c - gc);
    const dy = Math.abs(r - gr);
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  }

  /** Ligne de vue praticable entre deux points (échantillonnage fin). */
  lineClear(a: Pt, b: Pt): boolean {
    const d = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(d / (this.cell * 0.5)));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = a.x + (b.x - a.x) * t;
      const y = a.y + (b.y - a.y) * t;
      // Marge d'un demi-pixel pour éviter de raser les angles.
      if (!this.walkable({ x, y }) || !this.walkable({ x: x + 1.2, y }) || !this.walkable({ x: x - 1.2, y })) return false;
    }
    return true;
  }

  smooth(pts: Pt[]): Pt[] {
    if (pts.length <= 2) return pts.slice(1);
    const out: Pt[] = [];
    let anchor = pts[0];
    let i = 1;
    while (i < pts.length) {
      let j = pts.length - 1;
      while (j > i && !this.lineClear(anchor, pts[j])) j--;
      out.push(pts[j]);
      anchor = pts[j];
      i = j + 1;
    }
    return out;
  }
}

class MinHeap {
  private ids: number[] = [];
  private keys: number[] = [];
  get size() { return this.ids.length; }
  push(id: number, key: number) {
    this.ids.push(id);
    this.keys.push(key);
    let i = this.ids.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.keys[p] <= this.keys[i]) break;
      this.swap(i, p);
      i = p;
    }
  }
  pop(): number {
    const top = this.ids[0];
    const lastId = this.ids.pop()!;
    const lastKey = this.keys.pop()!;
    if (this.ids.length) {
      this.ids[0] = lastId;
      this.keys[0] = lastKey;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < this.ids.length && this.keys[l] < this.keys[m]) m = l;
        if (r < this.ids.length && this.keys[r] < this.keys[m]) m = r;
        if (m === i) break;
        this.swap(i, m);
        i = m;
      }
    }
    return top;
  }
  private swap(a: number, b: number) {
    [this.ids[a], this.ids[b]] = [this.ids[b], this.ids[a]];
    [this.keys[a], this.keys[b]] = [this.keys[b], this.keys[a]];
  }
}
