// Non-régression des corrections narratives (lots A, B et C de l'audit).
// Ces tests protègent l'état du monde : morts, décisions de Théo et de Mara,
// objectifs « faits si… », promesses tenues jusqu'à l'épilogue.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/content';
import { REVELATIONS, buildEpilogue } from '../src/content/story';
import { applyResult, availableArgs, councilMembers, newSession, resolveVote, useArg } from '../src/engine/council';
import { absTime } from '../src/engine/time';
import { newGame, talk } from './helpers';

function section(g: ReturnType<typeof newGame>, titre: string): string {
  return buildEpilogue(g).find((s) => s.title === titre)!.lines.join(' ');
}

function tout(g: ReturnType<typeof newGame>): string {
  return buildEpilogue(g).map((s) => s.lines.join(' ')).join(' ');
}

/** Premier nœud de routage d'un dialogue pour l'état courant. */
function debut(g: ReturnType<typeof newGame>, id: string): { go: string } {
  const start = CONTENT.dialogues[id].start;
  const routes = typeof start === 'string' ? [{ if: undefined, go: start }] : start;
  return routes.find((x) => g.check(x.if))!;
}

function expeditionAvec(g: ReturnType<typeof newGame>, compagnon: string, sante = 100) {
  g.state.expedition = { companion: compagnon, compHealth: sante, start: g.state.time, deadline: g.state.time + 60, returned: false, missedTrain: false, log: [] };
}

describe('D-01 — un compagnon mort ne revient pas à bord', () => {
  it('disparaît du décor, du conseil et de l’épilogue', () => {
    const g = newGame('passager');
    expeditionAvec(g, 'mara');
    g.applyFx(['set:mere_reunie', 'set:mara_libre', 'loc:mara=i_lit_vide']);
    expect(g.npcSpot('mara')).toBeTruthy();

    g.changeCompanionHealth(-100);
    expect(g.checkCompanionDeath()).toBe('mara');

    // 1. plus de point sur le train : impossible de la cliquer ou de lui parler
    expect(g.npcSpot('mara')).toBeNull();
    expect(g.state.npcLoc['mara']).toBe('none');
    // 2. plus de compagnon, et pas de double traitement
    expect(g.state.expedition?.companion).toBeNull();
    expect(g.checkCompanionDeath()).toBeNull();
    // 3. l'épilogue ne dit plus « Mara n'est pas revenue » ni la réunion
    const t = section(g, 'Les gens');
    expect(t).toContain('Mara n’a pas reparu de Saint-Aubin.');
    expect(t).not.toContain('n’est pas revenu de Saint-Aubin');
    expect(t).not.toContain('Sorel et Mara ne se quittent plus');
  });

  it('un membre du conseil mort ne siège plus, ne vote plus, ne peut plus être argumenté', () => {
    const g = newGame('controleur');
    expect(councilMembers(g)).toContain('vasseur');

    expeditionAvec(g, 'vasseur');
    g.changeCompanionHealth(-100);
    expect(g.checkCompanionDeath()).toBe('vasseur');

    expect(councilMembers(g)).not.toContain('vasseur');
    expect(g.npcSpot('vasseur')).toBeNull();

    // plus de vote…
    const r = resolveVote(g, newSession(CONTENT.motions.expedition));
    expect(Object.keys(r.votes)).not.toContain('vasseur');
    // …et plus d'argument qui la vise (argument réellement disponible sur un Passager : « char:passager »)
    const motion = CONTENT.motions.rationnement;
    const argVas = motion.args.find((a) => a.id === 'r_quota_injuste')!;
    const vivant = newGame('passager');
    expect(availableArgs(vivant, newSession(motion)).map((a) => a.id)).toContain(argVas.id);
    expect(useArg(vivant, newSession(motion), argVas.id)).not.toBeNull();
    expect(availableArgs(g, newSession(motion)).map((a) => a.id)).not.toContain(argVas.id);
    expect(useArg(g, newSession(motion), argVas.id)).toBeNull();
    // l'assemblée se tient malgré tout, à trois
    expect(Object.keys(resolveVote(g, newSession(CONTENT.motions.rationnement)).votes)).toHaveLength(3);
  });

  it('un compagnon blessé revient sans accord faux', () => {
    const g = newGame('mecanicien');
    expeditionAvec(g, 'vasseur', 20);
    g.setFlag('companion', 'vasseur');
    const t = section(g, 'Les gens');
    expect(t).toContain('Odile Vasseur a rapporté autre chose que la clé de la filtration.');
    expect(t).not.toContain('est revenu blessé');
  });
});

describe('D-02 / D-06 / D-19 — Théo', () => {
  it('« personne n’a retrouvé Théo » n’apparaît que si le joueur ne l’a jamais vu', () => {
    const g = newGame('controleur');
    expect(section(g, 'Les gens')).toContain('Personne n’a retrouvé Théo.');

    g.meet('theo');
    expect(section(g, 'Les gens')).toContain('Vous avez entendu Théo, vivant');
    expect(section(g, 'Les gens')).not.toContain('Personne n’a retrouvé Théo.');

    g.setFlag('theo_sauve');
    expect(section(g, 'Les gens')).toContain('Théo dort à l’infirmerie');
  });

  it('laisser Théo au poste se dit de deux façons', () => {
    const g = newGame('controleur');
    g.setFlag('theo_reste');
    expect(section(g, 'Les gens')).toContain('avec Anselme et son fusil');
    g.setFlag('theo_abandonne_signal');
    expect(section(g, 'Les gens')).toContain('Le signal, au loin, a regardé passer le train.');
  });

  it('soigner la jambe ne vide que ce qu’on a (D-26)', () => {
    const g = newGame('mecanicien');
    g.meet('theo');
    g.applyFx(['give:bandage_comp', 'give:antibio']);
    talk(g, 'theo', ['Raconte-moi cette nuit-là', 'Soigner sa jambe']);
    expect(g.itemQty('bandage_comp')).toBe(0);
    expect(g.itemQty('antibio')).toBe(1); // la trousse suffit : on ne gaspille pas les antibiotiques

    const g2 = newGame('mecanicien');
    g2.meet('theo');
    g2.applyFx(['give:antibio']);
    talk(g2, 'theo', ['Raconte-moi cette nuit-là', 'Soigner sa jambe']);
    expect(g2.itemQty('antibio')).toBe(0);
  });

  it('le récit de Théo reste accessible à bord (D-19)', () => {
    const g = newGame('mecanicien');
    g.meet('theo');
    g.setFlag('theo_suit');
    g.applyFx(['loc:theo=i_lit_vide']);
    const lignes = talk(g, 'theo', ['Raconte-moi cette nuit-là']);
    expect(lignes.join(' ')).toContain('J’ai pris le K3 de la filtration');
    expect(g.knows('t_theo_recit')).toBe(true);
  });
});

describe('D-04 / D-05 / D-11 — Mara', () => {
  it('révélée au conseil : la mère et la fille se retrouvent si le conseil accueille Mara', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:f_mere', 'set:mara_capturee']);
    const motion = CONTENT.motions.clandestin;
    const arg = motion.args.find((a) => a.id === 'm_mere')!;
    const s = newSession(motion);
    s.position = 'accueil';
    expect(useArg(g, s, arg.id)).not.toBeNull();
    // N3 : avant le vote, rien n'est acquis.
    expect(g.flag('mere_revelee_conseil')).toBe(true);
    expect(g.flag('mere_reunie')).toBeFalsy();
    expect(g.flag('mara_libre')).toBeFalsy();
    applyResult(g, s, { winner: 'accueil', votes: {}, tie: false, decidedByPlayer: false });
    expect(g.flag('mere_reunie')).toBe(true);
    expect(g.flag('mara_libre')).toBe(true);
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_mere_reunie');
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_mara_accueil');
    expect(g.state.quests.q_mara?.status).toBe('done');
    expect(section(g, 'Les gens')).toContain('Sorel et Mara ne se quittent plus');
  });

  it('la première rencontre en cellule ne rejoue pas la scène de la cachette (D-11)', () => {
    const g = newGame('controleur');
    g.setFlag('mara_capturee');
    const premier = debut(g, 'mara');
    expect(premier.go).toBe('cellule');
    const lignes = talk(g, 'mara', ['Je vais parler au conseil']);
    expect(lignes.join(' ')).toContain('Mara serre les barreaux');
    expect(lignes.join(' ')).not.toContain('éclat de verre');
    expect(g.state.quests.q_mara?.obj?.trouver).toBe(true);
  });

  it('une fois rencontrée en cellule, Mara ne rejoue pas la cachette plus tard', () => {
    const g = newGame('controleur');
    g.setFlag('mara_capturee');
    talk(g, 'mara', ['Je vais parler au conseil']);
    g.applyFx(['set:mara_libre']);
    const apres = debut(g, 'mara');
    expect(apres.go).not.toBe('rencontre');
  });

  it('expulsée : le carnet et l’épilogue racontent la même chose (D-05)', () => {
    const g = newGame('controleur');
    g.setFlag('mara_expulsee');
    expect(CONTENT.conseqs.cq_mara_expulsee.observed!.anselme).toContain('Anselme');
    expect(section(g, 'Les gens')).toContain('Au poste d’aiguillage, Anselme');
    expect(section(g, 'Les gens')).not.toContain('toute petite dans la brume');
  });
});

describe('D-07 / D-21 / D-22 — objectifs et missions', () => {
  it('un objectif se coche par sa condition « fait si… »', () => {
    const g = newGame('controleur');
    g.startQuest('q_main');
    expect(g.objectiveDone('q_main', 'panne')).toBe(false);
    g.applyFx(['entry:t_theo_recit']);
    expect(g.objectiveDone('q_main', 'panne')).toBe(true);
    expect(g.check('o:q_main.panne')).toBe(true);
    // « panne » est accompli sans jamais avoir été coché à la main ; l'affichage reste sur le premier objectif.
    expect(g.currentObjective()?.text).toBe(CONTENT.quests.q_main.objectives[0].text);
    // Et dès que celui-ci est fait, l'affichage passe à la suite — rien ne reste bloqué sur « panne ».
    g.completeObjective('q_main', 'machines');
    expect(g.currentObjective()?.text).toBe(CONTENT.quests.q_main.objectives[2].text);
  });

  it('les réserves et la trace de Théo se cochent par leurs autres voies', () => {
    const g = newGame('controleur');
    g.startQuest('q_main');
    g.applyFx(['entry:f_detournement']);
    expect(g.objectiveDone('q_main', 'reserves')).toBe(true);
    g.meet('theo');
    expect(g.objectiveDone('q_main', 'theo')).toBe(true);
    expect(g.objectiveDone('q_main', 'theo_dehors')).toBe(true);
  });

  it('une mission personnelle se termine (D-21)', () => {
    const g = newGame('mecanicien');
    g.startQuest('qp_mecanicien');
    g.applyFx(['entry:c_carnet_entretien', 'obj:qp_mecanicien.choix', 'qdone:qp_mecanicien']);
    expect(g.state.quests.qp_mecanicien?.status).toBe('done');

    const g2 = newGame('controleur');
    g2.startQuest('qp_controleur');
    g2.applyFx(['entry:f_detournement', 'obj:qp_controleur.choix', 'if:char:controleur?qdone:qp_controleur']);
    expect(g2.state.quests.qp_controleur?.status).toBe('done');

    // pour un autre personnage, l'effet conditionnel ne crée pas de mission fantôme
    const g3 = newGame('passager');
    g3.startQuest('qp_controleur');
    g3.applyFx(['entry:f_detournement', 'obj:qp_controleur.choix', 'if:char:controleur?qdone:qp_controleur']);
    expect(g3.state.quests.qp_controleur?.status).toBe('active');
  });

  it('le tableau des rations ne démarre plus la mission de Rosa (D-16)', () => {
    const g = newGame('majordome');
    const tableau = CONTENT.train.objects.find((o) => o.id === 'tableau_rations')!;
    g.perform(g.availableActions(tableau.actions)[0], 'test:tableau');
    expect(g.knows('c_tableau_rations')).toBe(true);
    expect(g.state.quests.q_ration).toBeUndefined();
  });
});

describe('D-13 / D-14 / D-15 — promesses et conséquences', () => {
  it('promettre le silence à Castel a une suite si l’on raconte sa nuit de Théo', () => {
    const g = newGame('controleur');
    // Le drapeau réellement posé par le dialogue (« Ça restera entre nous », council.ts) :
    g.applyFx(['set:castel_couvert', 'entry:t_theo_recit']);
    const rev = REVELATIONS.find((r) => r.id === 'rev_theo')!;
    expect(g.check(rev.if)).toBe(true);
    const label = typeof rev.label === 'string' ? rev.label : rev.label.find((x) => g.check(x.if))!.text;
    expect(label).toContain('Castel vous avait juré');
    const avant = g.rel('castel').trust;
    g.applyFx(rev.fx);
    expect(g.rel('castel').trust).toBeLessThan(avant - 1);
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_castel_trahie');
    expect(section(g, 'Les gens')).toContain('devant deux cents personnes');
  });

  it('promettre le silence à Mara a une suite si on la révèle à l’assemblée', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:f_mere', 'set:mere_tue']);
    const rev = REVELATIONS.find((r) => r.id === 'rev_mere')!;
    expect(g.check(rev.if)).toBe(true);
    const desc = typeof rev.desc === 'string' ? rev.desc : rev.desc.find((x) => g.check(x.if))!.text;
    expect(desc).toContain('Vous avez promis à Mara');
    g.applyFx(rev.fx);
    expect(g.rel('mara').trust).toBeLessThan(0);
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_mere_trahie');
    expect(section(g, 'Les gens')).toContain('Vous aviez juré à Mara');
  });

  it('« parts égales » ne suit pas un vote au mérite (D-14)', () => {
    const g = newGame('controleur');
    g.setFlag('marchetti_destitue');
    g.setFlag('rationnement', 'quota');
    expect(section(g, 'Le train')).toContain('au mérite');
    const g2 = newGame('controleur');
    g2.setFlag('marchetti_destitue');
    g2.setFlag('rationnement', 'egal');
    expect(section(g2, 'Le train')).toContain('parts sont égales');
  });

  it('« cachet intact » seulement si la lettre n’a pas été ouverte (D-15)', () => {
    const g = newGame('majordome');
    g.applyFx(['set:lettre_remise', 'conseq:cq_lettre_remise']);
    expect(tout(g)).toContain('cachet intact');
    const g2 = newGame('majordome');
    g2.applyFx(['set:lettre_lue', 'set:lettre_remise', 'conseq:cq_lettre_remise_lue']);
    expect(tout(g2)).toContain('cachet brisé');
    expect(tout(g2)).not.toContain('cachet intact');
  });
});

describe('D-12 / D-17 / D-30 — cohérence technique', () => {
  it('écouter la radio donne la voix de Clairval, pas le témoignage de Mara (D-12)', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:c_relais_radio']);
    g.advance(absTime('d1@21:05') - g.state.time);
    const radio = CONTENT.train.objects.find((o) => o.id === 'radio')!;
    const ecouter = g.availableActions(radio.actions).find((a) => a.label.includes('4,7'));
    expect(ecouter).toBeTruthy();
    g.perform(ecouter!, 'test:radio');
    expect(g.knows('c_voix_clairval')).toBe(true);
    expect(g.knows('t_mara_clairval')).toBe(false);
  });

  it('la cause de mort dans la brume n’est pas « Blessures » (D-17)', () => {
    const g = newGame('mecanicien');
    let cause = '';
    g.on<{ cause: string }>('death', (d) => (cause = d.cause));
    g.changeStat('health', -100, 'Asphyxié dans la brume de Saint-Aubin');
    expect(g.state.dead).toBe(true);
    expect(cause).toBe('Asphyxié dans la brume de Saint-Aubin');
  });

  it('le pupitre n’est signalé que si la porte de la cabine est ouverte (D-30)', () => {
    const g = newGame('passager');
    const pupitre = CONTENT.train.objects.find((o) => o.id === 'console_cabine')!;
    expect(g.check(pupitre.important!)).toBe(false);
    g.setDoor('d_cabine', 'open');
    expect(g.check(pupitre.important!)).toBe(true);
  });

  it('le trafic d’eau a un seul rythme partout (D-08)', () => {
    const textes = JSON.stringify(CONTENT).toLowerCase();
    expect(textes).not.toContain('quatre jerricans par nuit');
    expect(textes).not.toContain('chaque nuit, vers 23 h');
    expect(textes).toContain('quatre jerricans par semaine');
  });
});
// =====================================================================
// Non-régression des corrections issues de l'audit de vérification
// (rapport audit-narratif/RAPPORT_VERIFICATION.md : N1 à N7)
// =====================================================================

describe('N1 — la promesse faite à Castel (« ça restera entre nous »)', () => {
  const rev = () => REVELATIONS.find((r) => r.id === 'rev_theo')!;
  const libelle = (g: ReturnType<typeof newGame>) => {
    const r = rev();
    return typeof r.label === 'string' ? r.label : r.label.find((x) => g.check(x.if))!.text;
  };

  it('promettre puis raconter : conséquence de trahison, fort abaissement, ligne d’épilogue', () => {
    const g = newGame('controleur');
    g.applyFx(['set:castel_couvert', 'entry:t_theo_recit']); // drapeau réellement posé par le dialogue
    expect(libelle(g)).toContain('Castel vous avait juré');
    const avant = g.rel('castel').trust;
    g.applyFx(rev().fx);
    expect(g.rel('castel').trust).toBeLessThan(avant - 2);
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_castel_trahie');
    expect(section(g, 'Les gens')).toContain('devant deux cents personnes');
  });

  it('n’avoir rien promis : ni conséquence de trahison, ni grande perte de confiance', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:t_theo_recit']);
    expect(libelle(g)).toBe('La nuit de Théo');
    const avant = g.rel('castel').trust;
    g.applyFx(rev().fx);
    expect(g.state.conseqs.map((c) => c.id)).not.toContain('cq_castel_trahie');
    expect(g.rel('castel').trust).toBe(avant - 1);
    expect(section(g, 'Les gens')).not.toContain('devant deux cents personnes');
  });

  it('avoir dit « le conseil devra l’entendre » : raconter est alors ce que Castel demandait', () => {
    const g = newGame('controleur');
    g.applyFx(['set:castel_a_reveler', 'entry:t_theo_recit']);
    const avant = g.rel('castel').trust;
    g.applyFx(rev().fx);
    expect(g.state.conseqs.map((c) => c.id)).not.toContain('cq_castel_trahie');
    expect(g.rel('castel').trust).toBe(avant);
    expect(section(g, 'Les gens')).not.toContain('Vous aviez promis à Castel');
  });
});

describe('N3 — la réunion obtenue au conseil ne dépend que du verdict', () => {
  const motion = CONTENT.motions.clandestin;
  const conseil = (g: ReturnType<typeof newGame>, winner: string) => {
    const s = newSession(motion);
    s.position = winner;
    useArg(g, s, 'm_mere');
    applyResult(g, s, { winner, votes: {}, tie: false, decidedByPlayer: false });
  };

  it('l’argument seul ne change rien à l’état de Mara', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:f_mere', 'set:mara_capturee']);
    const s = newSession(motion);
    s.position = 'expulsion';
    expect(useArg(g, s, 'm_mere')).not.toBeNull();
    expect(g.flag('mere_revelee_conseil')).toBe(true);
    expect(g.flag('mere_reunie')).toBeFalsy();
    expect(g.flag('mara_libre')).toBeFalsy();
    expect(g.state.conseqs.map((c) => c.id)).not.toContain('cq_mere_reunie');
  });

  it('verdict « expulsion » : aucune réunion, et l’épilogue raconte l’expulsion', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:f_mere', 'set:mara_capturee']);
    conseil(g, 'expulsion');
    expect(g.flag('mara_expulsee')).toBe(true);
    expect(g.flag('mere_reunie')).toBeFalsy();
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_mara_expulsee');
    expect(g.state.conseqs.map((c) => c.id)).not.toContain('cq_mere_reunie');
    expect(section(g, 'Les gens')).toContain('Mara a été débarquée à Saint-Aubin');
    expect(section(g, 'Les gens')).not.toContain('ne se quittent plus');
  });

  it('verdict « cellule » : pas de réunion non plus', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:f_mere', 'set:mara_capturee']);
    conseil(g, 'cellule');
    expect(g.flag('mara_cellule')).toBe(true);
    expect(g.flag('mere_reunie')).toBeFalsy();
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_mara_cellule');
    expect(section(g, 'Les gens')).toContain('Mara attend dans sa cellule');
  });

  it('verdict « accueil » : la réunion a lieu, et elle est la seule qui compte', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:f_mere', 'set:mara_capturee']);
    conseil(g, 'accueil');
    expect(g.flag('mere_reunie')).toBe(true);
    expect(g.flag('mara_libre')).toBe(true);
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_mara_accueil');
    expect(g.state.conseqs.map((c) => c.id)).toContain('cq_mere_reunie');
  });
});

describe('N2 / N2b — plus aucune scène de révélation après le verdict du conseil', () => {
  const motion = CONTENT.motions.clandestin;
  const verdict = (g: ReturnType<typeof newGame>, winner: string) =>
    applyResult(g, newSession(motion), { winner, votes: {}, tie: false, decidedByPlayer: false });

  it('verdict « cellule » : ni Castel ni Sorel ne peuvent réunir la mère et la fille', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:f_mere', 'set:mara_capturee']);
    verdict(g, 'cellule');
    expect(() => talk(g, 'castel', ['La fille, dans la cellule'])).toThrow();
    expect(() => talk(g, 'sorel', ['Votre fille est vivante'])).toThrow();
    expect(g.flag('mere_reunie')).toBeFalsy();
    expect(g.flag('mara_libre')).toBeFalsy();
    expect(g.state.conseqs.map((c) => c.id)).not.toContain('cq_mere_reunie');
    expect(g.state.quests.q_mara?.obj?.reunion).toBeFalsy();
  });

  it('verdict « expulsion » : Mara ne peut pas revenir à bord', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:f_mere', 'set:mara_capturee']);
    verdict(g, 'expulsion');
    expect(g.npcSpot('mara')).toBeNull();
    expect(() => talk(g, 'sorel', ['Votre fille est vivante'])).toThrow();
    expect(() => talk(g, 'castel', ['La fille, dans la cellule'])).toThrow();
    expect(g.flag('mere_reunie')).toBeFalsy();
    expect(g.npcSpot('mara')).toBeNull();
  });

  it('l’assemblée ne peut plus réunir la mère et la fille après un verdict qui l’interdit', () => {
    const revMere = REVELATIONS.find((r) => r.id === 'rev_mere')!;
    for (const winner of ['cellule', 'expulsion']) {
      const g = newGame('controleur');
      g.applyFx(['entry:f_mere', 'set:mara_capturee']);
      expect(g.check(revMere.if)).toBe(true);
      verdict(g, winner);
      expect(g.check(revMere.if)).toBe(false);
    }
    const libre = newGame('controleur');
    libre.applyFx(['entry:f_mere', 'set:mara_capturee']);
    verdict(libre, 'accueil');
    expect(libre.check(revMere.if)).toBe(true);
  });

  it('avant le verdict, la scène de cellule fonctionne toujours', () => {
    const g = newGame('controleur');
    g.applyFx(['entry:f_mere', 'set:mara_capturee']);
    const lignes = talk(g, 'castel', ['La fille, dans la cellule', 'C’est la fille de la docteure Sorel']);
    expect(lignes.join(' ')).toContain('Bon sang');
    expect(g.flag('mere_reunie')).toBe(true);
    expect(g.flag('mara_libre')).toBe(true);
  });
});

describe('N4 — le deuil de Sorel suppose la rencontre', () => {
  it('Mara morte après la réunion : Sorel fait deuil, l’épilogue parle du dîner pour deux', () => {
    const g = newGame('passager');
    expeditionAvec(g, 'mara');
    g.applyFx(['set:mere_reunie', 'set:mara_libre', 'loc:mara=i_lit_vide']);
    g.changeCompanionHealth(-100);
    g.checkCompanionDeath();
    expect(debut(g, 'sorel').go).toBe('deuil');
    expect(section(g, 'Les gens')).toContain('préparer le dîner pour deux');
  });

  it('Mara morte sans réunion : pas de scène de deuil, et Sorel n’a jamais su son nom', () => {
    const g = newGame('passager');
    expeditionAvec(g, 'mara');
    g.applyFx(['set:mara_cachee_ailleurs', 'hide:mara']);
    g.changeCompanionHealth(-100);
    g.checkCompanionDeath();
    expect(debut(g, 'sorel').go).toBe('hub');
    expect(section(g, 'Les gens')).toContain('n’a jamais su qui elle était');
    expect(section(g, 'Les gens')).not.toContain('dîner pour deux');
  });
});

describe('N5 — les promesses faites au conseil ont désormais une suite', () => {
  const cas = [
    { drapeau: 'castel_a_reveler', revele: 'theo_public', texte: 'le conseil entendrait la vérité' },
    { drapeau: 'radio_a_reveler', revele: 'radio_revelee', texte: 'cela ne pouvait pas rester caché' },
    { drapeau: 'vasseur_a_reveler', revele: 'vasseur_revelee', texte: 'la vérité sur la pompe de secours' },
    { drapeau: 'marchetti_menace', revele: 'marchetti_destitue', texte: 'le conseil en entendrait parler ce soir' },
  ];
  for (const { drapeau, revele, texte } of cas) {
    it(`${drapeau} : promesse non tenue rappelée, promesse tenue oubliée`, () => {
      const promis = newGame('controleur');
      promis.applyFx([`set:${drapeau}`]);
      expect(section(promis, 'Les gens')).toContain(texte);

      const tenu = newGame('controleur');
      tenu.applyFx([`set:${drapeau}`, `set:${revele}`]);
      expect(section(tenu, 'Les gens')).not.toContain(texte);

      const jamais = newGame('controleur');
      expect(section(jamais, 'Les gens')).not.toContain(texte);
    });
  }
});

describe('N6 / N7 — contenus morts et libellés de soin', () => {
  it('N7 : sans trousse mais avec antibiotiques, le texte dit ce qui a été utilisé', () => {
    const g = newGame('mecanicien');
    g.meet('theo');
    g.applyFx(['give:antibio']);
    const lignes = talk(g, 'theo', ['Raconte-moi cette nuit-là', 'Soigner sa jambe']);
    expect(lignes.join(' ')).toContain('les antibiotiques et une compresse');
    expect(g.itemQty('antibio')).toBe(0);
  });

  it('N6 : la mort de Théo est retirée, ses deux fins réelles sont intactes', () => {
    const g = newGame('controleur');
    expect(tout(g)).not.toContain('Son casier reste fermé');
    g.setFlag('theo_reste');
    expect(section(g, 'Les gens')).toContain('avec Anselme et son fusil');
    const sauve = newGame('controleur');
    sauve.setFlag('theo_sauve');
    expect(section(sauve, 'Les gens')).toContain('Théo dort à l’infirmerie');
  });

  it('N6 : l’aide de Vasseur annoncée par le refus du relais existe, dans son dialogue', () => {
    const g = newGame('passager');
    g.applyFx(['give:relais_k3']);
    const filtration = CONTENT.train.objects.find((o) => o.id === 'filtration')!;
    const refus = g.availableActions(filtration.actions).find((a) => a.label === 'Installer le relais K3')!;
    expect(refus).toBeDefined();
    // Sans trousse et sans être mécanicien, le relais s'installe seulement avec elle.
    talk(g, 'vasseur', ['J’ai un relais K3']);
    expect(g.state.objects['filtration']).toBe('repare');
  });
});

describe('Garde-fou — aucun drapeau lu sans être posé', () => {
  /** Identifiants lisibles mais posés ailleurs que par `set:` (le scan est lexical). */
  const IGNORES: Record<string, string> = {
    conseil: 'événement (state.fired), lu par le helper local f() d’App.ts',
    depart: 'événement (state.fired), lu par le helper local f() d’App.ts',
    reveil: 'événement (state.fired), lu par le helper local f() d’App.ts',
    assemblee: 'événement (state.fired), lu par le helper local f() d’App.ts',
    expedition_depart: 'événement (state.fired), lu par le helper local f() d’App.ts',
    vote_expedition: 'posé par council.applyResult : setFlag(`vote_${motion.id}`)',
    vote_rationnement: 'posé par council.applyResult : setFlag(`vote_${motion.id}`)',
  };

  it('tout f:x lu dans le code est posé quelque part', () => {
    const racine = fileURLToPath(new URL('../src', import.meta.url));
    const fichiers: string[] = [];
    const parcourir = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const chemin = join(d, e.name);
        if (e.isDirectory()) parcourir(chemin);
        else if (e.name.endsWith('.ts')) fichiers.push(chemin);
      }
    };
    parcourir(racine);
    const poses = new Set<string>();
    const lus: { nom: string; ou: string }[] = [];
    const ajouter = (m: RegExpMatchArray, f: string, n: number) => poses.add(m[1]);
    for (const f of fichiers) {
      readFileSync(f, 'utf8').split('\n').forEach((ligne, n) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(ligne)) return; // commentaires de documentation
        const ou = `${f.slice(racine.length + 1)}:${n + 1}`;
        for (const re of [/set:([a-z0-9_]+)/g, /setFlag\('([a-z0-9_]+)'/g, /\.set\('([a-z0-9_]+)'/g, /once: '([a-z0-9_]+)'/g, /entry:([a-z0-9_]+)/g, /give:([a-z0-9_]+)/g]) {
          for (const m of ligne.matchAll(re)) ajouter(m, f, n);
        }
        for (const re of [/(?:^|[^a-zA-Z_.])f:([a-z0-9_]+)/g, /\bf\('([a-z0-9_]+)'\)/g]) {
          for (const m of ligne.matchAll(re)) {
            // f('x') est le helper d'App.ts qui teste les événements, pas un drapeau.
            if (re.source.includes("f\\(") && f.endsWith(join('app', 'App.ts'))) continue;
            lus.push({ nom: m[1], ou });
          }
        }
      });
    }
    const orphelins = lus.filter((x) => !poses.has(x.nom) && !(x.nom in IGNORES));
    expect(orphelins.map((x) => `${x.nom} (${x.ou})`).join(', ')).toBe('');
  });
});
