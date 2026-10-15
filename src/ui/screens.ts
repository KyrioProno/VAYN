// Écrans plein cadre : titre, mode, personnage, paramètres, confirmation, fin, mort.
import type { App, Settings } from '../app/App';
import type { CharDef, CharId, Mode } from '../engine/types';
import { fmtDuration } from '../engine/time';
import { btn, clear, h } from './dom';
import { portrait } from './portraits';
import { icon } from './icons';
import { fullscreenButton } from './fullscreen';

export function titleScreen(app: App, opts: { canContinue: string | null; hasHistory: boolean }): HTMLElement {
  const menu = h('div', { class: 'title-menu' });
  if (opts.canContinue) menu.append(btn(['Continuer', h('small', { style: 'display:block;font-family:var(--mono);font-size:10.5px;color:var(--muted);text-transform:none;letter-spacing:0' }, opts.canContinue)], () => app.continueGame(), 'btn primary'));
  menu.append(btn('Nouvelle partie', () => app.newGameFlow(), opts.canContinue ? 'btn' : 'btn primary'));
  menu.append(btn('Paramètres', () => app.openSettings(), 'btn'));
  const fs = fullscreenButton('btn ghost');
  if (fs) menu.append(fs);
  menu.append(btn('À propos', () => app.showAbout(), 'btn ghost'));
  return h('div', { class: 'screen' },
    h('div', { class: 'title-logo' }, 'VAYN'),
    h('div', { class: 'title-sub' }, 'Chapitre I — Signal faible'),
    menu,
    h('div', { class: 'title-foot' }, 'v0.1 · prototype jouable · sauvegarde locale'),
  );
}

export function aboutScreen(app: App): HTMLElement {
  return h('div', { class: 'screen dark' },
    h('h1', null, 'À propos'),
    h('p', { class: 'lead' }, 'VAYN est un jeu narratif de survie et d’enquête. Deux cent douze passagers, un train autonome, un monde silencieux. Vos choix restent.'),
    h('p', { class: 'lead' }, 'Toute l’image et tout le son sont générés par le jeu lui-même, sans fichier externe. Les sauvegardes restent sur votre appareil.'),
    btn('Retour', () => app.toTitle(), 'btn'),
  );
}

export function modeScreen(app: App, onPick: (m: Mode) => void): HTMLElement {
  return h('div', { class: 'screen dark' },
    h('h1', null, 'Choisissez votre mode'),
    h('p', { class: 'lead' }, 'Le mode ne change pas l’histoire. Il change le prix de vos erreurs.'),
    h('div', { class: 'modes' },
      btn([h('h3', null, 'Histoire'), h('p', null, 'Sauvegarde automatique et points de reprise. Si vous mourez, vous reprenez au dernier point de reprise.'), h('span', { class: 'chip blue' }, 'Recommandé')], () => onPick('histoire'), 'mode-card'),
      btn([h('h3', null, 'ONE LIFE'), h('p', null, 'Une seule vie. La mort est définitive : la partie est effacée, sans retour possible. Les décisions pèsent double.'), h('span', { class: 'chip red' }, 'Mort définitive')], () => onPick('onelife'), 'mode-card onelife'),
    ),
    h('div', { style: 'margin-top:14px' }, btn('Retour', () => app.toTitle(), 'btn ghost')),
  );
}

export function charScreen(app: App, onPick: (c: CharId) => void): HTMLElement {
  const root = h('div', { class: 'screen dark' });
  const chars = Object.values(app.content.chars);
  const showGrid = () => {
    clear(root);
    const grid = h('div', { class: 'chars' });
    for (const c of chars) {
      const card = btn([
        h('div', { class: 'art' }, portrait(c.look, 120, 4, true)),
        h('div', { class: 'info' }, h('div', { class: 'ttl' }, c.title), h('div', { class: 'nm' }, c.name), h('div', { class: 'acc' }, c.accessory)),
      ], () => showDetail(c), 'char-card');
      card.style.setProperty('--accent', c.color);
      grid.append(card);
    }
    root.append(h('h1', null, 'Qui êtes-vous ?'), h('p', { class: 'lead' }, 'Quatre passagers, une même nuit. Chacun voit le train autrement.'), grid,
      h('div', { class: 'bar-bottom' }, btn('Retour', () => app.toTitle(), 'btn ghost'), h('span')));
  };
  const showDetail = (c: CharDef) => {
    clear(root);
    const dots = h('span', { class: 'dots' });
    for (let i = 1; i <= 3; i++) dots.append(h('i', { class: i <= c.difficulty.value ? 'on' : '' }));
    const right = h('div', { class: 'right' },
      h('h2', null, c.title),
      h('div', { style: 'font-size:13px;color:var(--muted)' }, c.name),
      h('div', { class: 'tag' }, `« ${c.tagline} »`),
      h('p', null, c.bio),
      h('h4', null, 'Compétences'),
      h('ul', null, c.skills.map((s) => h('li', { class: 'skill' }, h('b', null, s.name), ' — ', s.desc))),
      h('h4', null, 'Accès'),
      h('ul', null, c.access.map((a) => h('li', null, a))),
      h('h4', null, 'Relations'),
      h('ul', null, c.relations.map((a) => h('li', null, a))),
      h('h4', null, 'Difficulté'),
      h('p', null, c.difficulty.label, dots, h('br'), h('span', { style: 'color:var(--muted);font-size:12.5px' }, c.difficulty.note)),
      h('h4', null, 'Intrigue personnelle'),
      h('p', null, c.plot),
    );
    const det = h('div', { class: 'char-detail' }, h('div', { class: 'left' }, portrait(c.look, 220, 6, true)), right);
    det.style.setProperty('--accent', c.color);
    root.append(det, h('div', { class: 'bar-bottom' }, btn([icon('back'), ' Les autres'], showGrid, 'btn ghost'), btn(`Jouer ${c.title.replace(/^Le /, 'le ')}`, () => onPick(c.id), 'btn primary')));
  };
  showGrid();
  return root;
}

export function settingsScreen(app: App, onClose: () => void): HTMLElement {
  const s = app.settings;
  const row = (label: string, key: keyof Settings, min = 0, max = 1, step = 0.05) => {
    const input = h('input', { type: 'range', min, max, step, value: String(s[key]) }) as HTMLInputElement;
    input.addEventListener('input', () => {
      (s as unknown as Record<string, number>)[key] = Number(input.value);
      app.applySettings();
    });
    return h('div', { class: 'settings-row' }, h('label', null, label), input);
  };
  return h('div', { class: 'screen dark' },
    h('div', { style: 'width:min(560px,80vw);background:var(--panel);border:1px solid var(--line2);padding:14px 18px;border-radius:3px;max-height:90vh;overflow-y:auto' },
      h('h1', null, 'Paramètres'),
      row('Volume général', 'master'),
      row('Musique', 'music'),
      row('Ambiance', 'ambience'),
      row('Effets', 'sfx'),
      row('Vitesse du texte', 'textSpeed', 0, 1, 0.1),
      h('p', { style: 'font-size:12px;color:var(--muted);margin:10px 0' }, 'Vitesse du texte au maximum : affichage instantané.'),
      h('div', { style: 'display:flex;justify-content:flex-end;margin-top:8px' }, btn('Fermer', () => { app.persistSettings(); onClose(); }, 'btn primary')),
    ),
  );
}

export function confirmBox(text: string, onYes: () => void, onNo: () => void, yes = 'Confirmer', no = 'Annuler'): HTMLElement {
  return h('div', { class: 'screen dark' },
    h('div', { style: 'width:min(460px,80vw);background:var(--panel);border:1px solid var(--line2);padding:16px 18px;border-radius:3px' },
      h('p', { style: 'margin:0 0 14px;line-height:1.5' }, text),
      h('div', { style: 'display:flex;gap:8px;justify-content:flex-end' }, btn(no, onNo, 'btn ghost'), btn(yes, onYes, 'btn primary')),
    ),
  );
}

export function deathScreen(app: App, cause: string, mode: Mode, hasCheckpoint: boolean): HTMLElement {
  const box = h('div', { class: 'ending death' },
    h('h1', null, mode === 'onelife' ? 'Fin du voyage' : 'Vous êtes mort'),
    h('div', { class: 'sub' }, cause),
    h('p', null, mode === 'onelife'
      ? 'En ONE LIFE, il n’y a pas de retour. Cette partie est terminée et effacée. Le VAYN continuera sans vous.'
      : 'Le VAYN continuera sans vous… à moins de revenir au dernier point de reprise.'),
    h('div', { style: 'display:flex;gap:10px;margin-top:16px' },
      mode === 'histoire' && hasCheckpoint ? btn('Reprendre au point de reprise', () => app.loadCheckpoint(), 'btn primary') : null,
      btn('Retour au titre', () => app.toTitle(), 'btn'),
    ),
  );
  return box;
}

export function endingScreen(app: App, data: { twist: string[]; epilogue: { title: string; lines: string[] }[]; stats: string[] }): HTMLElement {
  const box = h('div', { class: 'ending' },
    h('h1', null, 'Fin du chapitre I'),
    h('div', { class: 'sub' }, 'Signal faible'),
    h('div', { class: 'twist' }, data.twist.map((t) => h('p', null, t))),
    ...data.epilogue.flatMap((s) => (s.lines.length ? [h('h3', null, s.title), ...s.lines.map((l) => h('p', null, l))] : [])),
    h('h3', null, 'Votre voyage'),
    h('div', { class: 'stats' }, data.stats.map((s) => h('div', null, s))),
    h('h3', null, 'À suivre'),
    h('p', null, 'Chapitre II — « Le train qui ne s’arrête pas ». Vos choix seront repris.'),
    h('div', { style: 'display:flex;gap:10px;margin-top:16px' }, btn('Retour au titre', () => app.toTitle(), 'btn primary')),
  );
  return box;
}

export function statsLines(app: App): string[] {
  const g = app.game!;
  const entries = Object.keys(g.state.journal.entries).length;
  const total = Object.keys(g.content.entries).length;
  return [
    `Personnage : ${g.content.chars[g.state.char].title} — ${g.content.chars[g.state.char].name}`,
    `Mode : ${g.state.mode === 'onelife' ? 'ONE LIFE' : 'Histoire'}`,
    `Éléments du carnet : ${entries} / ${total}`,
    `Conséquences : ${g.state.conseqs.length}`,
    `Temps de jeu : ${fmtDuration(g.state.playSeconds / 60)}`,
  ];
}
