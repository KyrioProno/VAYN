// Préparation de l'expédition de l'aube : compagnon et matériel.
import type { App } from '../app/App';
import { btn, clear, fmtKg, h } from './dom';
import { portrait } from './portraits';

export interface CompanionOption { id: string; ok: boolean; note: string; why?: string }
export interface GearOption { id: string; label: string; note: string; cost?: string; fx: string[]; max: number }

export function companionOptions(app: App): CompanionOption[] {
  const g = app.game!;
  const out: CompanionOption[] = [];
  const v = g.rel('vasseur');
  out.push({ id: 'vasseur', ok: v.trust >= 0 && !(g.flag('vasseur_revelee') && v.trust < 1), note: 'Solide, connaît les structures : elle saura étayer une poutre et porter un blessé.', why: 'Vasseur refuse de partir avec vous.' });
  const c = g.rel('castel');
  out.push({ id: 'castel', ok: c.trust > -2, note: 'Armé. Disperse les chiens, impose le respect. Mais que fera-t-il s’il retrouve Théo ?', why: 'Castel ne vous fait plus confiance.' });
  const m = g.rel('mara');
  const maraFree = !!(g.flag('mara_libre') || g.flag('mara_cachee_ailleurs') || (g.flag('mara_trouvee') && !g.flag('mara_capturee')));
  out.push({
    id: 'mara',
    ok: m.met && !g.flag('mara_expulsee') && maraFree && m.trust >= 1,
    note: 'Elle est passée par Saint-Aubin. Elle connaît le terrain, les chiens, l’aiguilleur. Elle est jeune, et fragile.',
    why: !m.met ? 'Vous ne la connaissez pas.' : g.flag('mara_expulsee') ? 'Elle a été débarquée.' : !maraFree ? 'Elle est en cellule : Castel refuse de la laisser sortir.' : 'Elle ne vous fait pas assez confiance.',
  });
  const n = g.rel('noe');
  out.push({ id: 'noe', ok: n.trust >= 1 && !g.flag('noe_puni'), note: 'Petit et agile, il passe partout. C’est un enfant.', why: g.flag('noe_puni') ? 'Il est privé de sortie.' : 'Il ne veut pas venir avec vous.' });
  return out;
}

export function gearOptions(app: App): GearOption[] {
  const g = app.game!;
  const list: GearOption[] = [
    { id: 'ration', label: 'Ration', note: 'De quoi tenir, ou distraire des chiens.', cost: '−0,2 nourriture du train', fx: ['res:food-0.2'], max: 2 },
    { id: 'bandage_comp', label: 'Trousse de secours', note: 'Pour une vraie blessure.', cost: '−1 médicament du train', fx: ['res:meds-1'], max: 1 },
    { id: 'jerrican', label: 'Jerrican vide', note: 'Le château d’eau de la gare a peut-être encore de l’eau.', fx: [], max: 1 },
    { id: 'cric', label: 'Cric hydraulique', note: 'Pour soulever ou étayer.', fx: [], max: 1 },
  ];
  if (!g.itemQty('lampe')) list.unshift({ id: 'lampe', label: 'Lampe torche', note: 'Le dépôt est plongé dans le noir.', fx: [], max: 1 });
  if (!g.itemQty('masque')) list.push({ id: 'masque', label: 'Masque filtrant', note: 'Le seul de la réserve. Protège un temps de la brume.', fx: [], max: 1 });
  return list;
}

export function expeditionPrep(app: App, onGo: (companion: string | null, gear: Record<string, number>) => void): HTMLElement {
  const g = app.game!;
  const comps = companionOptions(app);
  const gear = gearOptions(app);
  let chosen: string | null = null;
  const qty: Record<string, number> = {};
  const root = h('div', { class: 'council' });
  const mandat = String(g.flag('mandat') ?? 'pieces');
  const MANDAT: Record<string, string> = {
    pieces: 'Mandat du conseil : rapporter un relais K3 et des pièces du dépôt.',
    theo: 'Mandat du conseil : retrouver Théo, vivant ou mort.',
    eau: 'Mandat du conseil : rapporter de l’eau du château d’eau.',
    prudence: 'Mandat du conseil : une sortie éclair, sans prendre de risques.',
  };

  const draw = () => {
    clear(root);
    const left = h('div', { class: 'col', style: 'flex:1;border:1px solid var(--line);background:#13100d' });
    left.append(h('h4', { style: 'margin:0 0 6px;font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)' }, 'Compagnon'));
    for (const c of comps) {
      const npc = g.content.npcs[c.id];
      left.append(btn(h('div', { class: 'comp' }, portrait(npc.look, 42, 1, false), h('div', null, h('b', null, (chosen === c.id ? '◆ ' : '') + npc.name), h('small', null, c.ok ? c.note : c.why ?? ''))), () => {
        if (!c.ok) return;
        chosen = chosen === c.id ? null : c.id;
        app.sfx('tick');
        draw();
      }, `opt${chosen === c.id ? ' on' : ''}`, { disabled: !c.ok }));
    }
    left.append(btn([h('b', null, (chosen === null ? '◆ ' : '') + 'Partir seul'), h('small', null, 'Plus rapide, plus discret. Personne pour vous aider.')], () => { chosen = null; draw(); }, `opt${chosen === null ? ' on' : ''}`));

    const right = h('div', { class: 'col', style: 'flex:1;border:1px solid var(--line);background:#13100d' });
    right.append(h('h4', { style: 'margin:0 0 6px;font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--dim)' }, 'Matériel de l’expédition'));
    let extra = 0;
    for (const it of gear) {
      const n = qty[it.id] ?? 0;
      extra += n * g.item(it.id).weight;
      right.append(h('div', { class: 'card', style: 'display:flex;gap:8px;align-items:center' },
        h('div', { style: 'flex:1' }, h('h4', null, `${it.label} ${n ? `×${n}` : ''}`), h('p', { style: 'margin:0' }, it.note, it.cost ? h('span', { class: 'chip amber', style: 'margin-left:6px' }, it.cost) : null, ` · ${fmtKg(g.item(it.id).weight)}`)),
        btn('−', () => { qty[it.id] = Math.max(0, n - 1); draw(); }, 'btn small', { disabled: n <= 0 }),
        btn('+', () => { qty[it.id] = Math.min(it.max, n + 1); draw(); }, 'btn small', { disabled: n >= it.max })));
    }
    const total = g.weight() + extra;
    right.append(h('div', { class: `weight${total > 10 ? ' over' : ''}`, style: 'margin-top:6px' }, `Charge : ${fmtKg(total)} / ${fmtKg(10)}`, total > 10 ? ' — surchargé, vous marcherez plus lentement' : ''));

    root.append(
      h('div', { class: 'council-head' }, h('h1', null, 'L’expédition de l’aube'), h('span', { class: 'step' }, 'Jour 2 · 06:00')),
      h('p', { class: 'council-desc' }, MANDAT[mandat] ?? MANDAT.pieces, ' Le VAYN repartira à 12:00, avec ou sans vous. La brume se lève en fin de matinée.'),
      h('div', { class: 'prep' }, left, right),
      h('div', { class: 'council-foot' }, h('div', { class: 'spacer' }), btn('Descendre sur le quai', () => onGo(chosen, { ...qty }), 'btn primary')),
    );
  };
  draw();
  return root;
}
