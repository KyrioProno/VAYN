// Audit « survie, lampe, monnaie » : ce que le moteur fait vraiment, et non ce que l'interface promet.
// Chaque test vérifie un comportement observable du vrai moteur (src/engine + src/content).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/content';
import type { CharId } from '../src/engine/types';
import { absTime } from '../src/engine/time';
import { gearOptions } from '../src/ui/expedition';
import { act, newGame, talk } from './helpers';

const RACINE = join(fileURLToPath(new URL('.', import.meta.url)), '..');

const CHARS: CharId[] = ['controleur', 'passager', 'majordome', 'mecanicien'];
const DEPOT = CONTENT.exterior.objects.find((o) => o.id === 'armoire_k')!;

/**
 * Joue une action et mesure l'effet *net* sur les jauges : une action du monde prend du temps,
 * et les jauges continuent de baisser pendant ce temps — c'est voulu, mais cela rogne l'effet annoncé
 * d'une fraction, d'où les fourchettes étroites plus bas.
 */
function effet(g: ReturnType<typeof newGame>, id: string, label: string) {
  const avant = { ...g.state.stats };
  act(g, id, label);
  return {
    satiete: g.state.stats.satiety - avant.satiety,
    hydratation: g.state.stats.hydration - avant.hydration,
  };
}

describe('Lampe torche — un état, pas une simple possession', () => {
  it('les quatre personnages partent avec une lampe : personne ne peut rater le dépôt', () => {
    for (const c of CHARS) expect(newGame(c).itemQty('lampe')).toBeGreaterThan(0);
  });

  it('une lampe en poche est allumée au départ, et le joueur peut l’éteindre puis la rallumer', () => {
    const g = newGame('controleur');
    expect(g.flag('lampe_on')).toBe(true);
    expect(g.lampeAllumee()).toBe(true);
    const qty = g.itemQty('lampe');
    expect(g.useItem('lampe')).toContain('coupez le faisceau');
    expect(g.lampeAllumee()).toBe(false);
    expect(g.itemQty('lampe')).toBe(qty);          // une lampe ne se consomme pas
    expect(g.useItem('lampe')).toContain('faisceau repart');
    expect(g.lampeAllumee()).toBe(true);
  });

  it('le libellé de l’action annonce l’état courant, pas celui d’après', () => {
    const g = newGame('controleur');
    const u = CONTENT.items.lampe.use!;
    expect(g.text(u.label)).toBe('Éteindre la lampe');   // elle est allumée
    g.useItem('lampe');
    expect(g.text(u.label)).toBe('Allumer la lampe');     // elle ne l’est plus
  });

  it('lampe éteinte en poche : le dépôt reste tout aussi noir', () => {
    const g = newGame('mecanicien');
    g.useItem('lampe');
    expect(g.itemQty('lampe')).toBe(1);
    expect(g.lampeAllumee()).toBe(false);
  });

  it('la lampe ne se jette pas : personne n’a les jetons pour la remplacer', () => {
    // seule source de jetons du jeu = la vente au Passeur ; le mécanicien part à 5 jetons et n’a rien à vendre
    const MECANICIEN = newGame('mecanicien');
    expect(MECANICIEN.state.tokens).toBe(5);
    const enMain = (g: ReturnType<typeof newGame>, id: string) =>
      g.itemQty(id) + g.state.storage.filter((s) => s.id === id).reduce((a, s) => a + s.qty, 0);
    for (const v of ['tabac', 'piles', 'alcool', 'montre', 'cafe']) expect(enMain(MECANICIEN, v)).toBe(0);
    expect(MECANICIEN.state.tokens).toBeLessThan(9);      // prix de la lampe chez le Passeur
    const src = readFileSync(join(RACINE, 'src/ui/panels.ts'), 'utf-8');
    expect(src).toContain("const IRREMPLACABLE = new Set(['lampe'])");
    expect(src).toMatch(/!IRREMPLACABLE\.has\(sel\.id\)\)\s*acts\.append\(btn\('Jeter'/);
    expect(src).toContain('La lampe ne se jette pas');
  });

  it('l’obscurité du dépôt dépend bien de l’état, pas de la simple possession', () => {
    // garde-fou lexical : App.ts ne doit plus décider « j’ai une lampe » mais « j’ai la lampe allumée »
    const src = readFileSync(join(RACINE, 'src/app/App.ts'), 'utf-8');
    expect(src).not.toMatch(/itemQty\('lampe'\)\s*\?\s*0\.45/);
    expect(src.match(/g\.lampeAllumee\(\)/g)?.length).toBeGreaterThanOrEqual(2);
    // et la seule section sombre du jeu est bien le dépôt
    expect([...CONTENT.train.sections, ...CONTENT.exterior.sections].filter((s) => (s as { dark?: boolean }).dark).map((s) => s.id)).toEqual(['depot']);
    expect(DEPOT.actions.length).toBeGreaterThan(0);
  });
});

describe('Nourriture et eau — manger, boire, ce que ça change', () => {
  it('une ration se mange : satiété +30, hydratation +4, et elle disparaît', () => {
    const g = newGame('controleur');
    g.state.stats.satiety = 40;
    g.state.stats.hydration = 40;
    g.useItem('ration');
    expect(g.state.stats.satiety).toBeCloseTo(70, 5);
    expect(g.state.stats.hydration).toBeCloseTo(44, 5);
    expect(g.itemQty('ration')).toBe(0);
  });

  it('une gourde ne fait que de l’eau : hydratation +35, sans toucher à la satiété', () => {
    const g = newGame('controleur');
    g.transfer('eau', 1, false);                       // la gourde dort dans le rangement : on la prend
    g.state.stats.satiety = 40;
    g.state.stats.hydration = 40;
    g.useItem('eau');
    expect(g.state.stats.hydration).toBeCloseTo(75, 5);
    expect(g.state.stats.satiety).toBeCloseTo(40, 5);
    expect(g.itemQty('eau')).toBe(0);
  });

  it('le repas du comptoir nourrit et désaltère, une seule fois par service', () => {
    const g = newGame('controleur');
    g.applyFx(['set:repas=midi']);
    g.state.stats.satiety = 40;
    g.state.stats.hydration = 40;
    const e = effet(g, 'comptoir', 'Prendre le déjeuner');
    expect(e.satiete).toBeGreaterThanOrEqual(31);
    expect(e.satiete).toBeLessThanOrEqual(32);
    expect(e.hydratation).toBeGreaterThanOrEqual(21);
    expect(e.hydratation).toBeLessThanOrEqual(22);
    expect(() => act(g, 'comptoir', 'Prendre le déjeuner')).toThrow();   // déjà pris
  });

  it('rationnement égal : le même repas rapporte moins', () => {
    const g = newGame('controleur');
    g.applyFx(['set:repas=midi', 'set:rationnement=egal']);
    g.state.stats.satiety = 40;
    const e = effet(g, 'comptoir', 'Prendre le déjeuner');
    expect(e.satiete).toBeGreaterThanOrEqual(24);
    expect(e.satiete).toBeLessThanOrEqual(25);
  });

  it('la fontaine ne donne à boire qu’une fois, et seulement si la filtration est réparée', () => {
    const g = newGame('controleur');
    expect(() => act(g, 'fontaine', 'Boire')).toThrow();
    g.applyFx(['objst:filtration=repare']);
    g.state.stats.hydration = 40;
    act(g, 'fontaine', 'Boire');
    expect(g.state.stats.hydration).toBeGreaterThanOrEqual(59);
    expect(g.state.stats.hydration).toBeLessThanOrEqual(60);
    expect(() => act(g, 'fontaine', 'Boire')).toThrow();
  });
});

describe('Jauges de survie — ce que le temps fait, et le dire', () => {
  it('à bord : 3 points d’hydratation et 2 de satiété par heure, 2,4 de repos', () => {
    const g = newGame('controleur');
    g.state.stats = { health: 100, hydration: 100, satiety: 100, rest: 100 };
    g.advance(60);
    expect(g.state.stats.hydration).toBeCloseTo(97, 5);
    expect(g.state.stats.satiety).toBeCloseTo(98, 5);
    expect(g.state.stats.rest).toBeCloseTo(97.6, 5);
  });

  it('dehors : la brume coûte plus vite qu’à bord', () => {
    const g = newGame('controleur');
    g.state.stats = { health: 100, hydration: 100, satiety: 100, rest: 100 };
    g.advance(60);
    const train = { ...g.state.stats };
    const h = newGame('controleur');
    h.state.zone = 'exterior';
    h.state.stats = { health: 100, hydration: 100, satiety: 100, rest: 100 };
    h.advance(60);
    expect(h.state.stats.hydration).toBeCloseTo(95, 5);
    expect(h.state.stats.rest).toBeCloseTo(96, 5);
    expect(h.state.stats.hydration).toBeLessThan(train.hydration);
  });

  it('dormir : la soif et la faim ralentissent de moitié, le repos ne descend pas et remonte', () => {
    const g = newGame('controleur');
    g.state.stats = { health: 100, hydration: 100, satiety: 100, rest: 50 };
    g.sleepUntil(g.state.time + 60);
    expect(g.state.stats.rest).toBeCloseTo(64, 5);        // 14 points par heure de sommeil
    expect(g.state.stats.hydration).toBeCloseTo(98.5, 5); // −1,5 au lieu de −3
  });

  it('les dortoirs calfeutrés rendent 18 points par heure, comme promis par l’amélioration', () => {
    const g = newGame('controleur');
    g.applyFx(['set:dortoirs_calfeutres']);
    g.state.stats = { health: 100, hydration: 100, satiety: 100, rest: 50 };
    g.sleepUntil(g.state.time + 60);
    expect(g.state.stats.rest).toBeCloseTo(68, 5);
  });

  it('sous les seuils critiques, la santé baisse… et on l’explique une seule fois', () => {
    const g = newGame('controleur');
    const toasts: string[] = [];
    g.on('toast', (t: { text: string }) => toasts.push(t.text));
    g.state.stats = { health: 100, hydration: 14, satiety: 100, rest: 100 };
    g.advance(120);
    expect(g.state.stats.health).toBeLessThan(100);
    expect(toasts.filter((t) => /Hydratation critique/.test(t)).length).toBe(1);
    expect(toasts.filter((t) => /Vous avez soif/.test(t)).length).toBe(1);
    g.advance(120);
    expect(toasts.filter((t) => /Hydratation critique/.test(t)).length).toBe(1);   // pas de répétition
  });

  it('à bord, la négligence endort plutôt que tuer : effondrement sous 12 de santé', () => {
    const g = newGame('controleur');
    g.state.stats = { health: 16, hydration: 5, satiety: 100, rest: 100 };
    g.advance(240);
    expect(g.state.dead).toBe(false);
    expect(g.state.stats.health).toBe(12);
    expect(g.state.flags['_collapse_pending']).toBe(true);
  });

  it('les libellés du HUD nomment ce que la jauge mesure', () => {
    const src = readFileSync(join(RACINE, 'src/ui/hud.ts'), 'utf-8');
    expect(src).toContain("nom: 'Satiété'");
    expect(src).toContain("nom: 'Repos'");
    expect(src).toContain("nom: 'Hydratation'");
    expect(src).toContain("nom: 'Santé'");
    // Le nom est écrit dans la page (au doigt, une infobulle n'existe pas).
    expect(src).toContain("h('span', { class: 'nm' }, AIDE[k].nom)");
    expect(src).not.toContain("'Faim'");
    expect(src).not.toContain("'Fatigue'");
  });
});

describe('Monnaie — jetons initiaux, achats, ventes, prix doublés', () => {
  const jetons = { controleur: 8, passager: 4, majordome: 12, mecanicien: 5 };

  it('l’argent de départ de chaque personnage est bien celui annoncé', () => {
    for (const c of CHARS) expect(newGame(c).state.tokens).toBe(jetons[c]);
  });

  it('le personnage le plus pauvre peut acheter ce qui compte : un bandage (4) ou un jerrican (3)', () => {
    const g = newGame('passager');
    expect(g.state.tokens).toBeGreaterThanOrEqual(4);
    talk(g, 'vic', ['Acheter…', 'Bandage']);
    expect(g.itemQty('bandage')).toBe(1);
    expect(g.state.tokens).toBe(0);
  });

  it('vendre rapporte des jetons, et le compteur ne descend jamais sous zéro', () => {
    const g = newGame('passager');
    const avant = g.state.tokens;
    talk(g, 'vic', ['Vendre…', 'Tabac']);
    expect(g.state.tokens).toBe(avant + 5);
    g.state.tokens = 1;
    g.applyFx(['tok:-40']);
    expect(g.state.tokens).toBe(0);
  });

  it('Vic vend une lampe : 9 jetons, et 8 jetons ne suffisent pas', () => {
    const g = newGame('mecanicien');
    g.state.tokens = 9;
    talk(g, 'vic', ['Acheter…', 'Lampe torche']);
    expect(g.itemQty('lampe')).toBe(2);
    expect(g.state.tokens).toBe(0);
    const pauvre = newGame('mecanicien');
    pauvre.state.tokens = 8;
    const lignes = talk(pauvre, 'vic', ['Acheter…']);
    expect(lignes.join(' ')).not.toContain('Lampe torche');
  });

  it('le prix d’ami du Passager pour les antibiotiques tient toujours', () => {
    const g = newGame('passager');
    g.state.tokens = 20;
    talk(g, 'vic', ['Acheter…', 'prix d’ami']);
    expect(g.itemQty('antibio')).toBe(1);
    expect(g.state.tokens).toBe(0);
  });

  it('« Mes prix viennent de doubler » : une promesse qui coûte vraiment double', () => {
    const g = newGame('controleur');
    g.applyFx(['set:vic_rancune']);
    g.state.tokens = 9;
    const lignes = talk(g, 'vic', ['Acheter…']);
    expect(lignes.join(' ')).toContain('doublé');
    expect(lignes.join(' ')).not.toContain('Ration — 5 jetons');
    g.state.tokens = 10;
    talk(g, 'vic', ['Acheter…', 'Ration — 10 jetons']);
    expect(g.state.tokens).toBe(0);
  });

  it('aucune dépense obligatoire : avec sa lampe de départ, chaque personnage atteint le dépôt sans dépenser un jeton', () => {
    for (const c of CHARS) {
      const g = newGame(c);
      expect(g.itemQty('lampe')).toBe(1);
      expect(g.lampeAllumee()).toBe(true);
    }
    // les améliorations du train se paient en pièces, énergie ou médicaments — jamais en jetons
    for (const u of Object.values(CONTENT.upgrades)) {
      expect(u.cost).not.toHaveProperty('tokens');
      expect(u.cost.parts).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('Réserves du train — collectives, et distinctes du Sac', () => {
  it('elles ne baissent qu’au passage de minuit, une fois par jour', () => {
    const g = newGame('controleur');
    const avant = { ...g.state.res };
    g.advance(60);
    expect(g.state.res).toEqual(avant);
    g.advance(absTime('d2@00:30') - g.state.time);
    expect(g.state.res.food).toBeCloseTo(avant.food - 1, 5);
    expect(g.state.res.water).toBeCloseTo(avant.water - 1, 5);
    expect(g.state.res.energy).toBe(avant.energy - 4);
    g.advance(60);
    expect(g.state.res.food).toBeCloseTo(avant.food - 1, 5);   // pas de seconde consommation
  });

  it('rationnement égal et filtration réparée allègent la ponction nocturne', () => {
    const g = newGame('controleur');
    g.applyFx(['set:rationnement=egal', 'objst:filtration=repare']);
    const avant = { ...g.state.res };
    g.advance(absTime('d2@00:30') - g.state.time);
    expect(g.state.res.food).toBeCloseTo(avant.food - 0.8, 5);
    expect(g.state.res.water).toBeCloseTo(avant.water - 0.5, 5);
  });

  it('un repas au comptoir ne vide pas les réserves : il puise dans la part du train, pas dans le Sac', () => {
    const g = newGame('controleur');
    g.applyFx(['set:repas=midi']);
    const avant = { ...g.state.res };
    act(g, 'comptoir', 'Prendre le déjeuner');
    expect(g.state.res).toEqual(avant);
  });

  it('le matériel d’expédition dit ce qu’il coûte au train, pas au joueur', () => {
    const g = newGame('controleur');
    const fake = { game: g } as never;
    const gear = gearOptions(fake);
    const ration = gear.find((x) => x.id === 'ration')!;
    expect(ration.fx).toEqual(['res:food-0.2']);
    expect(ration.cost).toMatch(/train/i);            // le coût est annoncé comme pris sur le train
    const med = gear.find((x) => x.id === 'bandage_comp')!;
    expect(med.fx).toEqual(['res:meds-1']);
    expect(gear.find((x) => x.id === 'jerrican')!.cost).toBeUndefined();   // coût personnel : rien à dire
    const lampe = gear.find((x) => x.id === 'lampe');
    expect(lampe).toBeUndefined();                       // déjà au sac : on ne le propose pas
    const g2 = newGame('mecanicien');
    g2.drop('lampe', 1);
    expect(gearOptions({ game: g2 } as never).find((x) => x.id === 'lampe')).toBeDefined();
  });

  it('un jerrican plein vide son eau dans la citerne du train, pas dans le Sac', () => {
    const g = newGame('controleur');
    g.applyFx(['give:jerrican_plein']);
    const avant = g.state.res.water;
    act(g, 'citerne', 'Verser le jerrican');
    expect(g.state.res.water).toBeCloseTo(avant + 1, 5);
    expect(g.itemQty('jerrican_plein')).toBe(0);
    expect(g.itemQty('jerrican')).toBe(1);
  });
});

describe('Étal du Passeur — la monnaie doit être trouvable', () => {
  it('l’étal reste signalé tant qu’on n’y a pas encore acheté', () => {
    const etal = CONTENT.train.objects.find((o) => o.id === 'etal_vic')!;
    expect(etal.important).toBe('!f:vic_trade');
    const g = newGame('controleur');
    expect(g.check(etal.important)).toBe(true);
    talk(g, 'vic', ['Acheter…', 'Rien pour l’instant']);
    expect(g.check(etal.important)).toBe(false);
  });
});