import { renderCharacterSheet, renderPortrait, FRAME_W, FRAME_H } from '../src/render/characters';
import type { Look } from '../src/engine/types';
const looks: Record<string, Look> = {
  controleur: { body: 'coat', hat: 'captain', accent: '#8fc1ff', acc: ['buttons'], prop: 'lamp' },
  passager: { body: 'long', hat: 'hood', accent: '#f5a742', prop: 'ticket' },
  majordome: { body: 'tails', hat: 'none', accent: '#efdcae', acc: ['bowtie', 'gloves'], prop: 'tray' },
  mecanicien: { body: 'std', hat: 'headlamp', accent: '#35d0b0', acc: ['belt'], prop: 'wrench' },
  castel: { body: 'stocky', hat: 'cap', accent: '#e0483e', acc: ['armband', 'badge'], prop: 'baton' },
  vasseur: { body: 'std', hat: 'goggles', accent: '#ffbf3f', acc: ['belt'], prop: 'bag' },
  marchetti: { body: 'thin', hat: 'none', accent: '#9bd65a', acc: ['glasses', 'tie'], prop: 'ledger' },
  sorel: { body: 'coat', hat: 'bun', accent: '#e8f4f4', acc: ['cross'], prop: 'none' },
  mara: { body: 'thin', hat: 'hood', accent: '#b48cff', acc: ['scarf'], prop: 'bag' },
  rosa: { body: 'apron', hat: 'bun', accent: '#ece2c8', eye: '#ffd25a', prop: 'ladle' },
  noe: { body: 'child', hat: 'cap', accent: '#ff6b3d', acc: ['scarf'], prop: 'flask' },
  passeur: { body: 'long', hat: 'fedora', accent: '#d9a441', acc: ['belt'], prop: 'case' },
  agathe: { body: 'std', hat: 'kerchief', accent: '#5aa0e6', prop: 'jerrican' },
  josefa: { body: 'dress', hat: 'bun', accent: '#e0559b', acc: ['collar'], prop: 'clipboard' },
  villiers: { body: 'dress', hat: 'bun', accent: '#f3b6cf', base: '#2a0f1c', acc: ['hem', 'necklace'], prop: 'glass' },
  theo: { body: 'std', hat: 'cap', accent: '#f6e05e', acc: ['satchel', 'bandage'], prop: 'crutch' },
  aiguilleur: { body: 'coat', hat: 'beret', accent: '#ff6a4d', acc: ['scarf'], prop: 'shotgun' },
};
const out = document.getElementById('out')!;
const row = document.createElement('div'); row.className = 'row'; out.append(row);
for (const [k, l] of Object.entries(looks)) {
  const d = document.createElement('div'); d.className = 'c';
  d.append(renderPortrait(l, 150, 4));
  const t = document.createElement('div'); t.textContent = k; d.append(t); row.append(d);
}
const row2 = document.createElement('div'); row2.className = 'row'; out.append(row2);
for (const k of ['controleur', 'passager', 'majordome', 'mecanicien', 'castel', 'rosa', 'villiers']) {
  const s = renderCharacterSheet(looks[k]);
  const c = document.createElement('canvas'); c.width = s.width * 3; c.height = s.height * 3;
  const g = c.getContext('2d')!; g.imageSmoothingEnabled = false; g.fillStyle = '#8a7b62'; g.fillRect(0,0,c.width,c.height); g.drawImage(s, 0, 0, s.width * 3, s.height * 3);
  row2.append(c);
}
