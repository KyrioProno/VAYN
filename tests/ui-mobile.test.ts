// Régressions « écran de téléphone » : ce que le diagnostic visuel a trouvé cassé au doigt.
// Un test moteur ne voit pas une étiquette absente ni un choix hors écran : ces contrôles
// mixent donc comportement réel (moteur) et lecture du code d'interface (garde-fou).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/content';
import { effetUsage } from '../src/ui/panels';
import { newGame } from './helpers';

const RACINE = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const src = (f: string) => readFileSync(join(RACINE, 'src', f), 'utf8');
const CSS = src('ui/styles.css');

describe('Jauges — le nom doit être lisible sans survol', () => {
  it('chaque jauge porte un nom écrit dans le HTML, pas seulement une infobulle', () => {
    const hud = src('ui/hud.ts');
    for (const nom of ['Santé', 'Hydratation', 'Satiété', 'Repos']) {
      expect(hud).toContain(`nom: '${nom}'`);
    }
    // Le nom est dans un élément visible du DOM, pas seulement dans l'attribut title.
    expect(hud).toMatch(/h\('span', \{ class: 'nm' \}, AIDE\[k\]\.nom\)/);
  });

  it('l’infobulle est bien formée : nom, valeur, explication (sans double espace ni tiret orphelin)', () => {
    const g = newGame('controleur');
    const hud = src('ui/hud.ts');
    expect(hud).toContain('`${AIDE[k].nom} : ${s} %. ${AIDE[k].texte}`');
    // Reproductible : plus de « Hydratation  — 78 %.  ce que… »
    const aide = hud.match(/hydration: \{ nom: 'Hydratation', texte: '([^']*)' \}/)![1];
    const titre = `Hydratation : 78 %. ${aide}`;
    expect(titre).not.toMatch(/—/);
    expect(titre).not.toMatch(/\s{2,}/);
    expect(g.state.stats.hydration).toBeGreaterThan(0);
  });

  it('les seuils restent expliqués à l’écran (le test de seuil existe déjà côté moteur)', () => {
    const survie = src('engine/game.ts');
    expect(survie).toMatch(/Vous avez soif/);
    expect(survie).toMatch(/Hydratation critique/);
    expect(survie).toMatch(/La faim revient/);
    expect(survie).toMatch(/La fatigue tombe sur vous/);
  });
});

describe('Effet annoncé d’un objet — le gain annoncé doit être le gain réel', () => {
  it('une gourde bue à 78 % n’annonce que les 22 points qui entrent réellement', () => {
    const g = newGame('controleur');
    g.state.stats.hydration = 78;
    const effet = effetUsage(g, CONTENT.items.eau);
    expect(effet).toContain('+22 hydratation');
    expect(effet).not.toContain('+35 hydratation');
    expect(effet).toContain('réservoir plein');
  });

  it('une ration bue à 70 % de satiété annonce +30 et +4 : rien à arrondir', () => {
    const g = newGame('controleur');
    g.state.stats.satiety = 70;
    const effet = effetUsage(g, CONTENT.items.ration);
    expect(effet).toContain('+30 satiété');
    expect(effet).toContain('+4 hydratation');
  });

  it('réservoir déjà plein : le joueur est prévenu au lieu d’entendre « +35 »', () => {
    const g = newGame('controleur');
    g.state.stats.hydration = 100;
    expect(effetUsage(g, CONTENT.items.eau)).toContain('hydratation au maximum');
  });
});

describe('Rangement — pas de bouton qui n’existe pas', () => {
  it('l’effet n’est annoncé comme utilisable que dans le Sac', () => {
    const panels = src('ui/panels.ts');
    expect(panels).toContain("if (d.use && effet && sel.where === 'inv')");
    expect(panels).toContain("`Dans le rangement : à prendre dans le Sac pour l'utiliser — ${effet}.`");
  });

  it('un objet non jetable n’a jamais de bouton Jeter', () => {
    const panels = src('ui/panels.ts');
    expect(panels).toContain('const IRREMPLACABLE = new Set([\'lampe\'])');
    expect(panels).toMatch(/!IRREMPLACABLE\.has\(sel\.id\)\) acts\.append\(btn\('Jeter'/);
  });
});

describe('Zones défilantes — le défilement doit être devinable', () => {
  it('tout conteneur qui défile est marqué (dégradé + ascenseur fin)', () => {
    expect(CSS).toContain('.deroule');
    expect(CSS).toMatch(/\.deroule::-webkit-scrollbar/);
    const dom = src('ui/dom.ts');
    expect(dom).toContain('marquerDefilement');
    expect(dom).toMatch(/scrollHeight > el\.clientHeight \+ 2/);
  });

  it('les trois panneaux (Carnet, Sac, Train) marquent leurs colonnes', () => {
    const panels = src('ui/panels.ts');
    expect(panels.match(/marquerDefilement\(c as HTMLElement\)/g)?.length).toBe(2);
    expect(panels).toContain('marquerDefilement(col);');
    expect(panels).toContain('marquerDefilement(left);');
    expect(src('ui/dialogue.ts')).toContain('marquerDefilement(this.choices)');
  });

  it('le dialogue gagne de la hauteur sur petit écran (58vh faisait passer le 4e choix hors d’écran)', () => {
    expect(CSS).not.toContain('max-height: 58vh');
    expect(CSS).toContain('max-height: min(74vh, 420px)');
    expect(CSS).toMatch(/@media \(max-height: 440px\)/);
    expect(CSS).toMatch(/\.dlg \.choice \{ min-height: 34px/);
  });
});

describe('Onglets — passer d’un panneau à l’autre doit marcher du premier coup', () => {
  it('un panneau ouvert n’est pas une raison de refermer : on change d’onglet', () => {
    const app = src('app/App.ts');
    const bloc = app.slice(app.indexOf('openTab(t: TabId)'), app.indexOf('\n  closePanel() {'));
    // uiBusy() inclut hasPanel : l’ancienne version refermait le panneau au lieu de changer d’onglet.
    expect(bloc).not.toContain('this.uiBusy()');
    expect(bloc).toContain('const occupe = !!this.dlg || !!this.narration || this.ui.hasMenu');
  });

  it('un dialogue ou une transition reste prioritaire', () => {
    const app = src('app/App.ts');
    const bloc = app.slice(app.indexOf('openTab(t: TabId)'), app.indexOf('\n  closePanel() {'));
    expect(bloc).toContain('this.transitioning;');
    const compact = bloc.replace(/\s+/g, ' ');
    expect(compact).toContain('if (occupe) {');
    expect(compact).toContain('if (this.ui.hasPanel) this.closePanel();');
    expect(compact.indexOf('this.closePanel();')).toBeLessThan(compact.indexOf('this.sfx('));
  });
});

describe('Messages — ils ne doivent masquer ni les jauges, ni la fiche, ni le dialogue', () => {
  it('les messages sont posés sous la bande du HUD, à gauche : jamais sur les jauges', () => {
    // Avant : top 8 px centré, donc par-dessus les jauges du coin haut droit.
    expect(CSS).toMatch(/\.toasts \{[^}]*top: calc\(80px \+ var\(--sat\)\)/);
    expect(CSS).toMatch(/\.toasts \{[^}]*left: calc\(10px \+ var\(--sal\)\)/);
    expect(CSS).not.toMatch(/\.toasts \{[^}]*left: 50%/);
  });

  it('le bloc du HUD ne descend pas dans cette bande : objectif sur une ligne', () => {
    expect(CSS).toMatch(/\.hud-obj \.tx \{[^}]*text-overflow: ellipsis/);
    expect(src('ui/hud.ts')).toContain("h('span', { class: 'tx' })");
  });

  it('dialogue ouvert : les messages se replient en haut à gauche, jamais sur le texte', () => {
    expect(CSS).toContain('.dlg-ouverte .toasts { top: calc(8px + var(--sat));');
    const dlg = src('ui/dialogue.ts');
    expect(dlg).toContain("document.body.classList.toggle('dlg-ouverte', dialogueOuverts > 0)");
    expect(dlg).toContain('dialogueOuverts++;');
    expect(dlg).toContain('dialogueOuverts = Math.max(0, dialogueOuverts - 1);');
    expect(src('ui/UI.ts')).toContain("document.body.classList.contains('dlg-ouverte')");
    // Les onglets sont inactifs pendant un dialogue : ils doivent l'annoncer, pas rester insensibles.
    expect(CSS).toMatch(/\.dlg-ouverte \.tabs \{[^}]*pointer-events: none/);
  });

  it('écran plein (panneau, expédition, réglages) : deux messages au maximum, en plus petits', () => {
    const ui = src('ui/UI.ts');
    expect(ui).toContain('const max = this.plein || document.body.classList.contains');
    expect(ui).toContain("this.toasts.classList.toggle('compact', this.plein)");
    expect(ui).toContain('while (this.plein && this.toasts.children.length > 2)');
    expect(ui).toContain('while (this.toasts.children.length > max)');
    expect(ui).toMatch(/return this\.hasPanel \|\| this\.hasFlow \|\| this\.hasScreen;/);
    expect(CSS).toContain('.toasts.low.compact');
  });

  it('jeu libre : trois messages au maximum, pour ne pas atteindre le bouton « Attendre »', () => {
    // La pile part de 80 px ; trois messages de 67 px descendent à 293 px, le bouton commence à 344.
    expect(src('ui/UI.ts')).toMatch(/\? 2 : 3;/);
  });
});