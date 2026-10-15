// Géométrie d'une « bande » (le train ou la zone extérieure) en vue de coupe latérale 2.5D.
// Les sections (wagons, bâtiments, extérieurs) sont alignées de gauche à droite.
import { NavGrid, type Pt } from './navgrid';
import type { DoorDef, ObjectDef, SectionDef, SpotDef, StripDef } from './types';

/** Constantes verticales (pixels-monde). */
export const GEO = {
  ROOF_TOP: 4,
  WALL_TOP: 13,
  FLOOR_Y0: 66,
  FLOOR_Y1: 114,
  SILL_Y1: 122,
  UNDER_Y1: 150,
  RAIL_Y: 152,
  H: 180,
  WALL_T: 5,
  PART_T: 6,
  GATE_T: 4,
} as const;

/** Bande de sol praticable par défaut. */
export const WALK = { y0: GEO.FLOOR_Y0 + 3, y1: GEO.FLOOR_Y1 - 3 };

export interface LaidSection extends SectionDef { x: number }

export interface Laid {
  strip: StripDef;
  secs: LaidSection[];
  width: number;
  secById: Record<string, LaidSection>;
}

export function layoutStrip(strip: StripDef): Laid {
  let x = strip.gap;
  const secs: LaidSection[] = [];
  for (const s of strip.sections) {
    secs.push({ ...s, x });
    x += s.w + strip.gap;
  }
  const secById: Record<string, LaidSection> = {};
  for (const s of secs) secById[s.id] = s;
  return { strip, secs, width: x, secById };
}

export function sectionAt(l: Laid, x: number): LaidSection | null {
  for (const s of l.secs) if (x >= s.x - l.strip.gap / 2 && x < s.x + s.w + l.strip.gap / 2) return s;
  return x < 0 ? l.secs[0] : l.secs[l.secs.length - 1];
}

export function placeName(l: Laid, x: number): { section: string; room: string; secId: string } {
  const s = sectionAt(l, x);
  if (!s) return { section: '', room: '', secId: '' };
  const rx = x - s.x;
  const room = s.rooms?.find((r) => rx >= r.x0 && rx < r.x1)?.name ?? '';
  return { section: s.name, room, secId: s.id };
}

export function objAbs(l: Laid, o: ObjectDef): Pt {
  const s = l.secById[o.sec];
  if (!s) throw new Error(`Section inconnue ${o.sec} (objet ${o.id})`);
  return { x: s.x + o.x, y: o.y };
}

export function spotAbs(l: Laid, sp: SpotDef): Pt {
  const s = l.secById[sp.sec];
  if (!s) throw new Error(`Section inconnue ${sp.sec} (point ${sp.id})`);
  return { x: s.x + sp.x, y: sp.y };
}

/** Position absolue d'une porte (x du centre de l'ouverture). */
export function doorAbsX(l: Laid, d: DoorDef): number {
  if (d.kind === 'gangway') {
    const [a] = d.between!;
    const sa = l.secById[a];
    if (!sa) throw new Error(`Porte ${d.id} : section inconnue`);
    return sa.x + sa.w + l.strip.gap / 2;
  }
  if (d.kind === 'gate') {
    const s = l.secById[d.sec!];
    return s.x + (d.gate!.gx0 + d.gate!.gx1) / 2;
  }
  const s = l.secById[d.sec!];
  if (!s) throw new Error(`Porte ${d.id} : section inconnue`);
  return s.x + (d.x ?? 0);
}

/** Rectangle de la porte en coordonnées monde (pour le toucher et l'affichage). */
export function doorRect(l: Laid, d: DoorDef): { x: number; y: number; w: number; h: number } {
  const cx = doorAbsX(l, d);
  if (d.kind === 'gate') {
    const s = l.secById[d.sec!];
    const g = d.gate!;
    return { x: s.x + g.gx0, y: g.y - 26, w: g.gx1 - g.gx0, h: 30 };
  }
  const w = d.kind === 'gangway' ? l.strip.gap + GEO.WALL_T * 2 : GEO.PART_T + 4;
  return { x: cx - w / 2, y: d.y0 - 34, w, h: d.y1 - d.y0 + 34 };
}

export function objStand(l: Laid, o: ObjectDef): Pt {
  const p = objAbs(l, o);
  if (o.stand) return { x: p.x + o.stand.dx, y: p.y + o.stand.dy };
  return { x: p.x, y: Math.min(WALK.y1 - 1, p.y + 7) };
}

export interface NavOptions {
  doorOpen(id: string): boolean;
  objVisible(o: ObjectDef): boolean;
}

/** Construit la grille de navigation selon l'état courant des portes et des objets. */
export function buildNav(l: Laid, opt: NavOptions): NavGrid {
  const grid = new NavGrid(l.width, GEO.FLOOR_Y0, GEO.FLOOR_Y1, 2);
  const secs = l.secs;
  for (let i = 0; i < secs.length; i++) {
    const s = secs[i];
    const fy0 = s.floor?.y0 ?? WALK.y0;
    const fy1 = s.floor?.y1 ?? WALK.y1;
    const closedLeft = s.kind !== 'outdoor';
    const closedRight = s.kind !== 'outdoor';
    const x0 = s.x + (closedLeft ? GEO.WALL_T : 0);
    const x1 = s.x + s.w - (closedRight ? GEO.WALL_T : 0);
    grid.setRect(x0, fy0, x1 - x0, fy1 - fy0, false);
    // Raccord entre deux sections extérieures (sol continu, y compris l'interstice).
    const next = secs[i + 1];
    if (next && s.kind === 'outdoor' && next.kind === 'outdoor') {
      const ny0 = Math.max(fy0, next.floor?.y0 ?? WALK.y0);
      const ny1 = Math.min(fy1, next.floor?.y1 ?? WALK.y1);
      grid.setRect(s.x + s.w - 1, ny0, l.strip.gap + 2, ny1 - ny0, false);
    }
    for (const b of s.blocks ?? []) grid.setRect(s.x + b.x, b.y, b.w, b.h, true);
    // Cloisons internes entre pièces (bloquées, l'ouverture est ajoutée par les portes).
    for (const r of s.rooms ?? []) {
      if (r.x0 > 0) grid.setRect(s.x + r.x0 - GEO.PART_T / 2, GEO.FLOOR_Y0, GEO.PART_T, GEO.FLOOR_Y1 - GEO.FLOOR_Y0, true);
    }
  }
  // Objets (empreintes au sol).
  for (const o of l.strip.objects) {
    if (!o.block || !opt.objVisible(o)) continue;
    const p = objAbs(l, o);
    const [w, d] = o.block;
    grid.setRect(p.x - w / 2, p.y - d + (o.blockOffset ?? 0), w, d, true);
  }
  // Grilles horizontales (soute).
  for (const d of l.strip.doors) {
    if (d.kind !== 'gate' || !d.gate) continue;
    const s = l.secById[d.sec!];
    const g = d.gate;
    grid.setRect(s.x + g.x0, g.y - GEO.GATE_T / 2, g.x1 - g.x0, GEO.GATE_T, true);
  }
  // Ouvertures des portes.
  for (const d of l.strip.doors) {
    const open = opt.doorOpen(d.id);
    if (d.kind === 'gate' && d.gate) {
      const s = l.secById[d.sec!];
      const g = d.gate;
      if (open) grid.setRect(s.x + g.gx0, g.y - GEO.GATE_T, g.gx1 - g.gx0, GEO.GATE_T * 2, false);
      continue;
    }
    const cx = doorAbsX(l, d);
    const w = d.kind === 'gangway' ? l.strip.gap + GEO.WALL_T * 2 + 4 : GEO.PART_T + 4;
    if (open) grid.setRect(cx - w / 2, d.y0, w, d.y1 - d.y0, false);
    else grid.setRect(cx - w / 2 + 2, GEO.FLOOR_Y0, w - 4, GEO.FLOOR_Y1 - GEO.FLOOR_Y0, true);
  }
  return grid;
}
