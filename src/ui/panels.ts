// Panneaux : Carnet, Sac (et rangement), Train, Menu.
import type { App } from '../app/App';
import type { EntryKind, ItemCat, ItemDef, ResKey } from '../engine/types';
import type { Game } from '../engine/game';
import { MEMBER_LABEL, councilMembers } from '../engine/council';
import { fmtDateTime, fmtDuration } from '../engine/time';
import { btn, clear, fmtKg, h, marquerDefilement } from './dom';
import { portrait } from './portraits';
import { icon } from './icons';
import { fullscreenButton } from './fullscreen';

type CarnetTab = 'fact' | 'testimony' | 'clue' | 'hyp' | 'quests' | 'conseq';

function sheet(title: string, tabs: HTMLElement | null, body: HTMLElement, onClose: () => void, foot?: HTMLElement): HTMLElement {
  return h('div', { class: 'sheet' },
    h('div', { class: 'sheet-head' }, h('h2', null, title), tabs, h('div', { class: 'spacer' }), btn(icon('close'), onClose, 'btn small', { 'aria-label': 'Fermer' })),
    body,
    foot ?? null,
  );
}

// ======================================================================== CARNET
export function carnetPanel(app: App, start: CarnetTab = 'clue'): HTMLElement {
  const g = app.game!;
  let tab: CarnetTab = start;
  let selected: string | null = null;
  let linkA: string | null = null;
  let linkMsg: HTMLElement | null = null;
  const tabsEl = h('div', { class: 'subtabs' });
  const body = h('div', { class: 'sheet-body' });
  const foot = h('div', { class: 'linkbar' });
  const KIND_LABEL: Record<EntryKind, string> = { fact: 'Faits confirmés', testimony: 'Témoignages', clue: 'Indices' };

  const entriesOf = (k: EntryKind) => Object.entries(g.state.journal.entries)
    .filter(([id]) => g.content.entries[id]?.kind === k)
    .sort((a, b) => b[1].at - a[1].at)
    .map(([id]) => id);

  const renderTabs = () => {
    clear(tabsEl);
    const defs: [CarnetTab, string, number | null][] = [
      ['fact', 'Faits', entriesOf('fact').length],
      ['testimony', 'Témoignages', entriesOf('testimony').length],
      ['clue', 'Indices', entriesOf('clue').length],
      ['hyp', 'Hypothèses', g.questionsUnlocked().length],
      ['quests', 'Missions', null],
      ['conseq', 'Conséquences', g.state.conseqs.length],
    ];
    for (const [id, label, n] of defs) {
      const b = btn([label, n !== null ? h('span', { class: 'n' }, String(n)) : null], () => {
        tab = id;
        selected = null;
        render();
      }, `subtab${tab === id ? ' on' : ''}`);
      tabsEl.append(b);
    }
  };

  const renderEntries = (k: EntryKind) => {
    const ids = entriesOf(k);
    const list = h('div', { class: 'col list' });
    const detail = h('div', { class: 'col detail' });
    if (!ids.length) list.append(h('div', { class: 'empty' }, k === 'fact' ? 'Aucun fait établi. Reliez des indices et des témoignages pour en déduire.' : 'Rien pour l’instant. Observez, fouillez, interrogez.'));
    if (!selected || !ids.includes(selected)) selected = ids[0] ?? null;
    for (const id of ids) {
      const def = g.content.entries[id];
      const st = g.state.journal.entries[id];
      const cls = ['row', id === selected ? 'on' : '', !st.seen ? 'new' : '', id === linkA ? 'sel' : ''].join(' ');
      list.append(btn([def.title, h('small', null, `${def.source ?? KIND_LABEL[def.kind]} · ${fmtDateTime(st.at)}`)], () => {
        if (linkA && linkA !== id) {
          doLink(linkA, id);
          return;
        }
        selected = id;
        render();
      }, cls));
    }
    if (selected) {
      const def = g.content.entries[selected];
      g.state.journal.entries[selected].seen = true;
      detail.append(h('h3', null, def.title), h('div', { class: 'src' }, `${KIND_LABEL[def.kind]}${def.source ? ' · ' + def.source : ''}`), h('p', null, def.text));
      const hyps = Object.values(g.content.hypotheses).filter((x) => (x.supports.includes(selected!) || x.contradicts.includes(selected!)) && g.questionsUnlocked().includes(x.q));
      if (hyps.length) {
        detail.append(h('div', { class: 'src' }, 'Pèse sur :'));
        for (const x of hyps) detail.append(h('p', { style: 'font-size:12.5px;margin:0 0 4px' }, h('span', { class: x.supports.includes(selected!) ? 'chip blue' : 'chip red' }, x.supports.includes(selected!) ? 'pour' : 'contre'), x.title));
      }
    }
    if (linkMsg) detail.prepend(linkMsg);
    body.append(list, detail);
    clear(foot);
    foot.append(
      h('span', null, linkA ? `Relier « ${g.content.entries[linkA].title} » avec… (touchez une autre entrée, tous onglets)` : 'Comparez deux éléments du carnet pour établir un fait.'),
      h('div', { class: 'spacer' }),
      linkA ? btn('Annuler', () => { linkA = null; render(); }, 'btn small ghost') : btn('Relier…', () => { if (selected) { linkA = selected; linkMsg = null; render(); } }, 'btn small primary', { disabled: !selected }),
    );
  };

  const doLink = (a: string, b: string) => {
    const r = g.tryLink(a, b);
    linkA = null;
    if (r.ok && r.result) {
      linkMsg = h('div', { class: 'reply' }, r.already ? 'Déjà établi : ' : 'Nouveau fait : ', h('b', null, g.content.entries[r.result].title), h('br'), r.text ?? '');
      app.sfx(r.already ? 'tick' : 'fact');
      tab = 'fact';
      selected = r.result;
    } else {
      linkMsg = h('div', { class: 'reply', style: 'border-left-color:#6b6255' }, `« ${g.content.entries[a].title} » et « ${g.content.entries[b].title} » : aucun lien évident.`);
      app.sfx('tick');
      selected = b;
    }
    render();
  };

  const renderHyp = () => {
    const col = h('div', { class: 'col detail' });
    const qs = g.questionsUnlocked();
    if (!qs.length) col.append(h('div', { class: 'empty' }, 'Aucune question ouverte pour l’instant.'));
    for (const q of qs) {
      const qd = g.content.questions[q];
      col.append(h('h3', { style: 'margin-top:6px' }, qd.title));
      const chosen = g.state.journal.hypotheses[q];
      for (const hy of g.hypothesesFor(q)) {
        const sup = g.support(hy);
        const ev = h('div', { class: 'ev' });
        for (const e of sup.pour) ev.append(h('div', { class: 'pour' }, '+ ', g.content.entries[e].title));
        for (const e of sup.contre) ev.append(h('div', { class: 'contre' }, '− ', g.content.entries[e].title));
        if (!sup.pour.length && !sup.contre.length) ev.append(h('div', { style: 'color:var(--dim)' }, 'Aucun élément pour l’instant.'));
        col.append(btn([h('h4', { class: chosen === hy.id ? 'dia' : '' }, hy.title), h('p', null, hy.text), ev], () => {
          g.chooseHypothesis(q, hy.id);
          app.sfx('tick');
          render();
        }, `hyp${chosen === hy.id ? ' on' : ''}`));
      }
    }
    col.append(h('p', { class: 'empty' }, 'Votre hypothèse de travail colore certains arguments au conseil. Rien n’est jamais certain.'));
    body.append(col);
    clear(foot);
  };

  const renderQuests = () => {
    const col = h('div', { class: 'col detail' });
    const qs = Object.entries(g.state.quests).sort((a, b) => Number(!!g.content.quests[b[0]].main) - Number(!!g.content.quests[a[0]].main) || a[1].at - b[1].at);
    if (!qs.length) col.append(h('div', { class: 'empty' }, 'Aucune mission.'));
    for (const [id, st] of qs) {
      const d = g.content.quests[id];
      const status = st.status === 'done' ? ' — terminée' : st.status === 'failed' ? ' — compromise' : '';
      const card = h('div', { class: `card${st.status !== 'active' ? ' done' : ''}` },
        h('h4', { class: d.main ? 'dia' : '' }, d.personal ? 'Personnel — ' : '', d.title, status),
        h('p', null, d.desc));
      for (const o of d.objectives) {
        const done = g.objectiveDone(id, o.id);
        if (!done && !g.check(o.if)) continue;
        card.append(h('div', { class: done ? 'chk on' : 'chk', style: `font-size:13px;margin:4px 0;color:${done ? 'var(--dim)' : 'var(--text)'}` }, h('span', { style: done ? 'text-decoration:line-through' : '' }, g.fmt(o.text))));
      }
      col.append(card);
    }
    body.append(col);
    clear(foot);
  };

  const renderConseq = () => {
    const col = h('div', { class: 'col detail' });
    if (!g.state.conseqs.length) col.append(h('div', { class: 'empty' }, 'Vos choix n’ont encore rien changé. Ça ne durera pas.'));
    for (const c of [...g.state.conseqs].reverse()) {
      const d = g.content.conseqs[c.id];
      const card = h('div', { class: 'card' }, h('div', { class: 'src' }, fmtDateTime(c.at)), h('p', { style: 'color:var(--text)' }, d.text));
      for (const k of c.observed) if (d.observed?.[k]) card.append(h('p', { style: 'font-size:12.5px' }, '→ ', d.observed[k]));
      col.append(card);
    }
    body.append(col);
    clear(foot);
  };

  const render = () => {
    renderTabs();
    clear(body);
    if (tab === 'fact' || tab === 'testimony' || tab === 'clue') renderEntries(tab);
    else if (tab === 'hyp') renderHyp();
    else if (tab === 'quests') renderQuests();
    else renderConseq();
    for (const c of Array.from(body.children)) marquerDefilement(c as HTMLElement);
    app.refreshHud();
  };
  render();
  return sheet('Carnet', tabsEl, body, () => app.closePanel(), foot);
}

// ======================================================================== SAC
const CAT_LABEL: Record<ItemCat, string> = { food: 'Vivres', meds: 'Soins', tools: 'Outils', trade: 'Troc', docs: 'Documents', quest: 'Objets importants' };
const CAT_COLOR: Record<ItemCat, string> = { food: '#e8b45a', meds: '#ff8a7a', tools: '#9fb8c8', trade: '#d9a441', docs: '#e8dcc6', quest: '#8fc1ff' };
/** Pastille d'objet : initiale en police pixel, couleur de catégorie (aucune police de symboles requise). */
function itemBadge(name: string, cat: ItemCat): HTMLElement {
  const letter = name.replace(/^(Le |La |Les |L’|L')/, '').charAt(0).toUpperCase();
  return h('span', { class: 'ic', style: `color:${CAT_COLOR[cat]};border-color:${CAT_COLOR[cat]}55` }, letter);
}

const GAUGE_NOM: Record<string, string> = { health: 'Santé', hydration: 'Hydratation', satiety: 'Satiété', rest: 'Repos' };

/** Objets qu'on ne jette pas : la lampe est le seul éclairage du dépôt, et personne n'a les jetons pour la remplacer. */
const IRREMPLACABLE = new Set(['lampe']);

/**
 * « +30 satiété · +4 hydratation » : l'effet lisible d'utiliser un objet.
 * Le gain annoncé est le gain *réel* : une jauge pleine ne rend pas plus que la place qui reste.
 */
export function effetUsage(g: Game, d: ItemDef): string {
  const parts: string[] = [];
  for (const fx of d.use?.fx ?? []) {
    const m = /^(?:if:[^?]+\?)?stat:([a-z]+)([+-][0-9.]+)$/.exec(fx);
    if (!m) continue;
    const nom = GAUGE_NOM[m[1]]?.toLowerCase() ?? m[1];
    const v = Number(m[2]);
    if (v > 0) {
      const place = 100 - g.state.stats[m[1] as keyof typeof g.state.stats];
      if (place <= 0.5) {
        parts.push(`${nom} au maximum`);
        continue;
      }
      if (v > place) {
        parts.push(`+${Math.round(place)} ${nom} (réservoir plein)`);
        continue;
      }
    }
    parts.push(`${v > 0 ? '+' : ''}${v} ${nom}`);
  }
  return parts.join(' · ');
}

export function sacPanel(app: App, storage = false): HTMLElement {
  const g = app.game!;
  let sel: { id: string; where: 'inv' | 'sto' } | null = null;
  const body = h('div', { class: 'sheet-body' });
  const weight = h('div', { class: 'weight' });
  const msg = h('div');

  const list = (where: 'inv' | 'sto') => {
    const stacks = where === 'inv' ? g.state.inv : g.state.storage;
    const col = h('div', { class: storage ? 'col list' : 'col list' });
    col.append(h('div', { class: 'inv-cat', style: 'margin-top:0' }, where === 'inv' ? 'Sur vous' : 'Rangement personnel'));
    if (!stacks.length) col.append(h('div', { class: 'empty' }, where === 'inv' ? 'Vos poches sont vides.' : 'Rien de rangé ici.'));
    const byCat = new Map<ItemCat, typeof stacks>();
    for (const s of stacks) {
      const d = g.item(s.id);
      if (!byCat.has(d.cat)) byCat.set(d.cat, []);
      byCat.get(d.cat)!.push(s);
    }
    for (const cat of Object.keys(CAT_LABEL) as ItemCat[]) {
      const ss = byCat.get(cat);
      if (!ss) continue;
      col.append(h('div', { class: 'inv-cat' }, CAT_LABEL[cat]));
      for (const s of ss) {
        const d = g.item(s.id);
        const on = sel?.id === s.id && sel.where === where;
        col.append(btn(h('div', { class: 'item-row' }, itemBadge(d.name, d.cat), h('span', { class: 'nm' }, d.name), h('span', { class: 'q' }, s.qty > 1 ? `×${s.qty}` : '')), () => {
          sel = { id: s.id, where };
          msg.textContent = '';
          render();
        }, `row${on ? ' on' : ''}`));
      }
    }
    return col;
  };

  const detail = () => {
    const col = h('div', { class: 'col detail' });
    col.append(msg);
    if (!sel) {
      col.append(h('div', { class: 'empty' }, storage ? 'Touchez un objet pour le ranger ou le reprendre.' : 'Touchez un objet pour le détail et les actions possibles.'));
      return col;
    }
    const d = g.item(sel.id);
    const qty = sel.where === 'inv' ? g.itemQty(sel.id) : g.storageQty(sel.id);
    if (qty <= 0) {
      sel = null;
      return detail();
    }
    if (sel.id === 'lampe') col.append(h('div', { class: 'src' }, g.lampeAllumee() ? 'Lampe allumée — elle éclaire le dépôt.' : 'Lampe éteinte — elle n’éclaire rien.'));
    if (IRREMPLACABLE.has(sel.id)) col.append(h('p', { class: 'src', style: 'margin:4px 0 0' }, 'La lampe ne se jette pas : c’est le seul endroit noir du jeu, et vous n’avez pas les jetons pour la remplacer.'));
    // L'effet n'est proposé que là où le bouton existe : dans le rangement, on ne peut pas boire sur place.
    const effet = effetUsage(g, d);
    if (d.use && effet && sel.where === 'inv') col.append(h('div', { class: 'src' }, `À utiliser : ${effet}`));
    else if (d.use && effet) col.append(h('div', { class: 'src' }, `Dans le rangement : à prendre dans le Sac pour l'utiliser — ${effet}.`));
    col.append(h('h3', null, d.name), h('div', { class: 'src' }, `${CAT_LABEL[d.cat]} · ${d.weight ? fmtKg(d.weight) : 'sans poids'}${d.value ? ` · valeur ${d.value} jetons` : ''}${d.quest ? ' · protégé' : ''}`), h('p', null, d.desc));
    const acts = h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap' });
    if (sel.where === 'inv') {
      if (d.use && g.canUse(sel.id)) acts.append(btn(g.text(d.use.label), () => {
        const t = app.useItem(sel!.id);
        msg.replaceChildren(h('div', { class: 'reply' }, t ?? ''));
        render();
      }, 'btn small primary'));
      else if (d.use) acts.append(btn(g.text(d.use.label), () => undefined, 'btn small', { disabled: true }));
      if (storage && !d.quest) acts.append(btn('Ranger', () => { g.transfer(sel!.id, 1, true); app.sfx('tick'); render(); }, 'btn small'));
      if (storage && !d.quest && qty > 1) acts.append(btn('Tout ranger', () => { g.transfer(sel!.id, qty, true); app.sfx('tick'); render(); }, 'btn small'));
      if (!d.quest && !storage && !IRREMPLACABLE.has(sel.id)) acts.append(btn('Jeter', () => { g.drop(sel!.id, 1); app.sfx('tick'); render(); }, 'btn small danger'));
    } else {
      acts.append(btn('Prendre', () => {
        const n = g.transfer(sel!.id, 1, false);
        if (!n) msg.replaceChildren(h('div', { class: 'reply' }, 'Trop lourd.'));
        app.sfx('tick');
        render();
      }, 'btn small primary'));
    }
    col.append(acts);
    return col;
  };

  const render = () => {
    clear(body);
    body.append(list('inv'));
    if (storage) body.append(list('sto'));
    body.append(detail());
    for (const c of Array.from(body.children)) marquerDefilement(c as HTMLElement);
    const w = g.weight();
    clear(weight);
    weight.className = `weight${g.overloaded() ? ' over' : ''}`;
    weight.append(`${fmtKg(w)} / ${fmtKg(10)}`, h('div', { class: `meter${w > 10 ? ' low' : ''}` }, h('b', { style: `width:${Math.min(100, (w / 10) * 100)}%` })), g.overloaded() ? 'Surchargé : vous marchez plus lentement.' : '');
    app.refreshHud();
  };
  render();
  return sheet(storage ? 'Rangement' : 'Sac', weight, body, () => app.closePanel());
}

// ======================================================================== TRAIN
export function trainPanel(app: App): HTMLElement {
  const g = app.game!;
  type T = 'res' | 'up' | 'rel';
  let tab: T = 'res';
  const tabsEl = h('div', { class: 'subtabs' });
  const body = h('div', { class: 'sheet-body' });

  const RES: [ResKey, string, (v: number) => string][] = [
    ['water', 'Eau', (v) => { const use = g.state.objects['filtration'] === 'repare' ? 0.5 : 1; return `${v} jours de réserve · −${use}/jour`; }],
    ['food', 'Nourriture', (v) => { const use = g.flag('rationnement') === 'egal' ? 0.8 : 1; return `${v} jours · −${use}/jour`; }],
    ['energy', 'Énergie', (v) => `${v} % · −4/jour`],
    ['meds', 'Médicaments', (v) => `${v} doses`],
    ['parts', 'Pièces détachées', (v) => `${v} lots (réparations)`],
  ];

  const render = () => {
    clear(tabsEl);
    for (const [id, label] of [['res', 'Ressources'], ['up', 'Réparations'], ['rel', 'Personnes']] as [T, string][]) {
      tabsEl.append(btn(label, () => { tab = id; render(); }, `subtab${tab === id ? ' on' : ''}`));
    }
    clear(body);
    const col = h('div', { class: 'col detail' });
    if (tab === 'res') {
      const kv = h('div', { class: 'kv', style: 'max-width:560px' });
      for (const [k, label, note] of RES) {
        const v = g.state.res[k];
        const max = k === 'energy' ? 100 : k === 'meds' ? 20 : k === 'parts' ? 8 : 10;
        const low = (k === 'water' && v < 2) || (k === 'food' && v < 3) || (k === 'energy' && v < 30);
        kv.append(h('div', { class: 'k' }, label), h('div', null, h('div', { class: `meter${low ? ' low' : ''}` }, h('b', { style: `width:${Math.min(100, (v / max) * 100)}%` })), h('div', { style: 'font-size:12px;color:var(--muted);margin-top:3px' }, note(v))));
      }
      col.append(h('h3', null, 'Réserves du VAYN'), kv);
      col.append(h('p', { class: 'empty', style: 'padding-left:0' }, 'Réserves collectives : tout le VAYN y puise. Elles baissent chaque nuit à minuit, et les réparations comme le matériel d’expédition y puisent. En revanche vos gourdes, rations et médicaments personnels restent dans le Sac : ils ne font pas bouger ces chiffres.'));
      col.append(h('h3', { style: 'margin-top:12px' }, 'Le conseil des quatre'));
      for (const m of councilMembers(g)) {
        const npc = g.content.npcs[m];
        col.append(h('div', { class: 'rel' }, portrait(npc.look, 34, 1, false), h('span', { class: 'nm' }, npc.name), h('span', { class: 'lab' }, MEMBER_LABEL[m])));
      }
    } else if (tab === 'up') {
      col.append(h('p', { style: 'font-size:13px;color:var(--muted);margin:0 0 10px' }, `Pièces disponibles : ${g.state.res.parts} · Énergie : ${g.state.res.energy} %. Chaque réparation prend du temps.`));
      for (const u of Object.values(g.content.upgrades)) {
        if (!g.check(u.visible)) continue;
        const done = g.state.upgrades.includes(u.id);
        const st = g.upgradeStatus(u);
        const time = g.state.char === 'mecanicien' ? Math.round(u.time * 0.6) : u.time;
        const cost = [`${u.cost.parts} pièce${u.cost.parts > 1 ? 's' : ''}`, u.cost.energy ? `${u.cost.energy} énergie` : '', u.cost.meds ? `${u.cost.meds} médicaments` : '', fmtDuration(time)].filter(Boolean).join(' · ');
        col.append(h('div', { class: `card${done ? ' done' : ''}` },
          h('h4', null, done ? '✓ ' : '', u.name),
          h('p', null, u.desc),
          h('div', { class: 'eff' }, u.effect),
          h('div', { class: 'cost' }, cost),
          done ? null : btn(st.ok ? 'Réaliser' : st.reason ?? 'Indisponible', () => {
            if (g.installUpgrade(u.id)) {
              app.sfx('repair');
              render();
            }
          }, st.ok ? 'btn small primary' : 'btn small', { disabled: !st.ok })));
      }
    } else {
      const met = Object.values(g.content.npcs).filter((n) => !n.ambient && g.rel(n.id).met);
      if (!met.length) col.append(h('div', { class: 'empty' }, 'Vous n’avez encore parlé à personne.'));
      for (const n of met) {
        const r = g.rel(n.id);
        const extra = [r.debt > 0 ? `vous doit ${r.debt}` : r.debt < 0 ? `vous lui devez ${-r.debt}` : '', r.suspicion >= 2 ? 'méfiant' : ''].filter(Boolean).join(' · ');
        col.append(h('div', { class: 'rel' }, portrait(n.look, 34, 1, false), h('span', { class: 'nm' }, n.name, h('small', { style: 'display:block;color:var(--dim);font-size:11px' }, n.role)), h('span', { class: 'lab' }, g.relLabel(n.id), extra ? ` · ${extra}` : '')));
      }
    }
    body.append(col);
    marquerDefilement(col);
    app.refreshHud();
  };
  render();
  return sheet('Train', tabsEl, body, () => app.closePanel());
}

// ======================================================================== MENU
export function menuPanel(app: App): HTMLElement {
  const g = app.game!;
  const body = h('div', { class: 'sheet-body' });
  // Deux colonnes : tout tient sur un téléphone en paysage, sans faire défiler.
  const left = h('div', { class: 'col list' });
  const col = h('div', { class: 'col detail' });
  const info = h('div', { class: 'kv', style: 'margin-bottom:14px' },
    h('div', { class: 'k' }, 'Personnage'), h('div', null, `${g.content.chars[g.state.char].title} — ${g.content.chars[g.state.char].name}`),
    h('div', { class: 'k' }, 'Mode'), h('div', null, g.state.mode === 'onelife' ? 'ONE LIFE (mort définitive)' : 'Histoire (points de reprise)'),
    h('div', { class: 'k' }, 'Point de reprise'), h('div', null, g.state.mode === 'onelife' ? '—' : g.state.checkpointLabel),
    h('div', { class: 'k' }, 'Temps de jeu'), h('div', null, fmtDuration(g.state.playSeconds / 60)),
  );
  const status = h('div', { style: 'font-size:13px;color:var(--muted);min-height:20px;margin:6px 0' });
  const actions = h('div', { style: 'display:flex;flex-direction:column;gap:8px;max-width:340px' },
    btn('Sauvegarder maintenant', async () => {
      const ok = await app.saveNow('Sauvegarde manuelle');
      status.textContent = ok ? 'Partie sauvegardée.' : 'Sauvegarde impossible pour le moment.';
    }, 'btn primary'),
    g.state.mode === 'histoire' ? btn('Revenir au dernier point de reprise', () => app.confirm('Revenir au point de reprise ? La progression depuis sera perdue.', () => app.loadCheckpoint()), 'btn') : null,
    btn('Paramètres', () => app.openSettings(), 'btn'),
    fullscreenButton('btn'),
    btn('Retour au titre', () => app.confirm('Revenir à l’écran titre ? La partie est sauvegardée automatiquement.', () => app.toTitle()), 'btn danger'),
  );
  left.append(info, h('p', { class: 'empty', style: 'padding-left:0;margin-top:10px' }, 'Gestes : toucher pour marcher ou interagir · glisser pour regarder · pincer pour zoomer.'));
  col.append(actions, status);
  body.append(left, col);
  marquerDefilement(left);
  marquerDefilement(col);
  return sheet('Menu', null, body, () => app.closePanel());
}
