// Régressions de l'audit de jouabilité du Chapitre I (référence b493e4f).
// Trois défauts confirmés, tous dans l'état d'affichage des objectifs :
//   A1 — un objectif invisible ne doit jamais pouvoir s'achever tout seul ;
//   A2 — une mission personnelle ne doit jamais s'activer chez un autre personnage ;
//   A3 — toute voie de réunion de Mara doit cocher l'objectif « reunion ».
import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/content';
import { REVELATIONS } from '../src/content/story';
import { act, newGame } from './helpers';

const obj = (g: ReturnType<typeof newGame>, id: string) => CONTENT.quests.q_main.objectives.find((o) => o.id === id)!;

describe('A1 — un objectif invisible ne s\'acheve pas tout seul', () => {
  it('« Trouver ce qui a fait tomber la filtration » n\'est pas barré avant d\'être visible', () => {
    const g = newGame('controleur');
    g.startQuest('q_main');
    // La filtration est réparée, mais « machines » n'est pas encore fait : son `if` est faux.
    g.applyFx(['objst:filtration=repare']);
    expect(g.check(obj(g, 'panne').if)).toBe(false);
    expect(g.objectiveDone('q_main', 'panne')).toBe(false);
    g.completeObjective('q_main', 'machines');
    expect(g.check(obj(g, 'panne').if)).toBe(true);
    expect(g.objectiveDone('q_main', 'panne')).toBe(true);
  });

  it('« Expédition » reste à faire même après la réparation de la filtration', () => {
    const g = newGame('controleur');
    g.startQuest('q_main');
    g.applyFx(['objst:filtration=repare']);
    expect(g.check(obj(g, 'expedition').if)).toBe(false);
    expect(g.objectiveDone('q_main', 'expedition')).toBe(false);

    // Au moment du départ, l'objectif devient visible… et doit rester à faire.
    g.fireScripted('expedition_depart');
    expect(g.check(obj(g, 'expedition').if)).toBe(true);
    expect(g.objectiveDone('q_main', 'expedition')).toBe(false);

    // Il ne se coche qu'au retour à bord, par le chemin explicite de App.returnToTrain().
    g.completeObjective('q_main', 'expedition');
    expect(g.objectiveDone('q_main', 'expedition')).toBe(true);
  });

  it('l\'objectif du HUD pendant l\'expédition est bien « Expédition »', () => {
    const g = newGame('controleur');
    g.startQuest('q_main');
    // Situation réelle au départ de l'expédition : panne comprise, conseil fait, couché,
    // trace de Théo retrouvée, filtration réparée au conseil.
    g.applyFx(['objst:filtration=repare', 'obj:q_main.theo']);
    g.completeObjective('q_main', 'machines');
    g.completeObjective('q_main', 'conseil');
    g.completeObjective('q_main', 'dormir');
    g.fireScripted('expedition_depart');
    // Le rappel « revenir avant 12:00 » doit être la seule ligne d'aide du joueur à Saint-Aubin.
    expect(g.currentObjective()?.text).toBe(obj(g, 'expedition').text);
  });

  it('« Retrouver la trace de Théo » n\'est pas pré-cochée pour le Mécanicien', () => {
    const g = newGame('mecanicien');
    g.startQuest('q_main');
    expect(g.rel('theo').met).toBe(true); // fait de départ, cf. src/content/chars.ts
    // Objectif sans condition de visibilité : la règle des objectifs invisibles ne s'y applique pas.
    // Ce qui compte, c'est qu'il ne soit jamais présenté comme à faire une fois la trace retrouvée.
    expect(g.objectiveDone('q_main', 'theo')).toBe(true);
  });

  it('le Mécanicien garde « Retrouver Théo » visible pendant l\'expédition', () => {
    const g = newGame('mecanicien');
    g.startQuest('q_main');
    g.fireScripted('expedition_depart');
    g.state.zone = 'exterior';
    expect(g.check(obj(g, 'theo_dehors').if)).toBe(true);
    expect(g.objectiveDone('q_main', 'theo_dehors')).toBe(false);
    // Les traces dans le dépôt suffisent : l'objectif est alors réellement accompli.
    g.applyFx(['entry:c_traces_theo']);
    expect(g.objectiveDone('q_main', 'theo_dehors')).toBe(true);
  });

  it('pour les autres personnages, « Retrouver Théo » se coche en le rencontrant', () => {
    const g = newGame('controleur');
    g.startQuest('q_main');
    g.fireScripted('expedition_depart');
    g.state.zone = 'exterior';
    expect(g.objectiveDone('q_main', 'theo_dehors')).toBe(false);
    g.meet('theo');
    expect(g.objectiveDone('q_main', 'theo_dehors')).toBe(true);
  });
});

describe('A2 — une mission personnelle ne s\'active pas chez un autre personnage', () => {
  it('donner les antibiotiques à Lou ne crée pas la mission du Passager chez le Mécanicien', () => {
    const g = newGame('mecanicien');
    g.give('antibio', 1);
    act(g, 'lit_lou', 'Donner les antibiotiques');
    expect(g.flag('lou_soignee')).toBe(true);
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_lou_soignee');
    expect(g.state.quests.qp_passager).toBeUndefined();
  });

  it('startQuest, completeQuest et failQuest respectent la garde personal', () => {
    const g = newGame('controleur');
    g.startQuest('qp_passager');
    g.completeQuest('qp_passager');
    g.failQuest('qp_majordome');
    expect(g.state.quests.qp_passager).toBeUndefined();
    expect(g.state.quests.qp_majordome).toBeUndefined();
    // La mission de son propre personnage reste parfaitement fonctionnelle.
    g.startQuest('qp_controleur');
    expect(g.state.quests.qp_controleur?.status).toBe('active');
  });

  it('la mission personnelle du personnage concerné se termine toujours', () => {
    const g = newGame('passager');
    g.startQuest('qp_passager');
    g.applyFx(['obj:qp_passager.sorel', 'qdone:qp_passager']);
    expect(g.state.quests.qp_passager?.status).toBe('done');
  });
});

describe('A3 — toute voie de réunion de Mara coche « reunion »', () => {
  it('la révélation d\'assemblée (rev_mere) coche l\'objectif', () => {
    const g = newGame('passager');
    g.startQuest('q_mara');
    // Mara cachée dans les dortoirs, jamais capturée : la révélation d'assemblée est possible.
    g.applyFx(['entry:f_mere', 'set:mara_cachee_ailleurs']);
    const rev = REVELATIONS.find((r) => r.id === 'rev_mere')!;
    expect(g.check(rev.if)).toBe(true);
    // L'objectif est bien visible au moment où la révélation se produit.
    const reunion = CONTENT.quests.q_mara.objectives.find((o) => o.id === 'reunion')!;
    expect(g.check(reunion.if)).toBe(true);
    expect(g.objectiveDone('q_mara', 'reunion')).toBe(false);

    g.applyFx(rev.fx);
    expect(g.state.quests.q_mara?.status).toBe('done');
    expect(g.objectiveDone('q_mara', 'reunion')).toBe(true);
  });

  it('chaque autre voie de réunion coche aussi l\'objectif', () => {
    const g = newGame('passager');
    g.startQuest('q_mara');
    g.applyFx(['entry:f_mere']);
    g.applyFx(['obj:q_mara.reunion', 'qdone:q_mara']);
    expect(g.objectiveDone('q_mara', 'reunion')).toBe(true);
  });
});