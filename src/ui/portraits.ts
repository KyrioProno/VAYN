import type { Look } from '../engine/types';
import { renderPortrait } from '../render/characters';

const cache = new Map<string, HTMLCanvasElement>();

/** Portrait (mis en cache) ; renvoie une copie pour pouvoir l'insérer plusieurs fois dans le DOM. */
export function portrait(look: Look, size = 96, scale = 3, bg = true): HTMLCanvasElement {
  const key = `${JSON.stringify(look)}|${size}|${scale}|${bg}`;
  let src = cache.get(key);
  if (!src) {
    src = renderPortrait(look, size, scale, bg);
    cache.set(key, src);
  }
  const c = document.createElement('canvas');
  c.width = src.width;
  c.height = src.height;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  g.drawImage(src, 0, 0);
  return c;
}
