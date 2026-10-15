// Partie complète du chapitre 1, jouée sans rendu (Mécanicien), du réveil à l'épilogue.
import { describe, expect, it } from 'vitest';
import { CONTENT, COUNCIL_ORDER, ASSEMBLY_MOTION } from '../src/content';
import { REVELATIONS, buildEpilogue, twistText } from '../src/content/story';
import { applyResult, availableArgs, newSession, resolveVote, useArg } from '../src/engine/council';
import { absTime } from '../src/engine/time';
import { spotAbs, layoutStrip } from '../src/engine/layout';
import type { ScriptedEventDef } from '../src/engine/types';
import { act, newGame, talk } from './helpers';

describe('partie complète — le Mécanicien', () => {
  it('enquête, conseil, expédition, retour, assemblée, épilogue', () => {
    const g = newGame('mecanicien');
    const scripted: string[] = [];
    g.on<ScriptedEventDef>('scripted', (d) => scripted.push(d.ui ?? d.id));
    const deaths: string[] = [];
    g.on<{ cause: string }>('death', (d) => deaths.push(d.cause));

    // --- Ouverture
    talk(g, 'start_mecanicien', ['Y aller']);
    expect(g.state.quests.q_main?.status).toBe('active');
    expect(g.state.quests.qp_mecanicien?.status).toBe('active');
    expect(g.state.quests.qp_controleur).toBeUndefined();

    // --- La panne
    act(g, 'etabli', 'Lire le carnet');
    act(g, 'alarmes', 'Lire');
    act(g, 'filtration', 'Ouvrir');
    act(g, 'pompe_secours', 'Examiner');
    act(g, 'bons_sortie', 'Consulter');
    expect(g.state.quests.q_main.obj.machines).toBe(true);
    expect(g.tryLink('c_pompe_secours', 'c_bon_sortie')).toMatchObject({ ok: true, result: 'f_pompe_morte' });
    talk(g, 'vasseur', ['La pompe de secours', 'Le bon de sortie', 'Je te couvre']);
    expect(g.flag('malo_couvre')).toBe(true);
    expect(g.rel('vasseur').trust).toBeGreaterThanOrEqual(4);
    act(g, 'casier_theo', 'Crocheter');
    expect(g.itemQty('carnet_theo')).toBe(1);
    expect(g.tryLink('c_socle_vide', 'c_carnet_theo').result).toBe('f_k3_radio');
    expect(g.tryLink('f_pompe_morte', 'f_k3_radio').result).toBe('f_panne');
    // un lien absurde ne donne rien
    expect(g.tryLink('c_alarmes', 'c_carnet_entretien').ok).toBe(false);

    // --- Les réserves : la tournée de Rosa ouvre la grille à 11:00
    expect(g.doorOpen('d_cage')).toBe(false);
    g.advance(absTime('d1@11:00') - g.state.time);
    expect(g.doorOpen('d_cage')).toBe(true);
    act(g, 'citerne', 'Lire le compteur');
    act(g, 'bureau_reserve', 'Lire le registre');
    expect(g.tryLink('c_registre_cabine0', 'c_compteur_eau').result).toBe('f_detournement');
    g.advance(absTime('d1@11:31') - g.state.time);
    expect(scripted).toContain('rosa_lock');
    g.applyFx(['lock:d_cage']);

    // --- Théo : témoignages
    talk(g, 'noe', ['Tiens, une ration']);
    expect(g.knows('t_noe_saut')).toBe(true);
    talk(g, 'josefa', ['Vous étiez de service', 'Deux jetons']);
    expect(g.knows('t_hotesse_castel')).toBe(true);
    expect(g.tryLink('t_noe_saut', 't_hotesse_castel').result).toBe('f_chronologie');

    // --- Mara
    act(g, 'mur_caisses', 'Déplacer les caisses');
    expect(g.npcSpot('mara')).toBe('s_cache');
    talk(g, 'mara', ['Doucement', 'Que sais-tu de Théo', 'Pourquoi es-tu montée', 'Je peux la garder', 'Castel va fouiller', 'Aux dortoirs']);
    expect(g.itemQty('medaillon')).toBe(1);
    expect(g.flag('mara_cachee_ailleurs')).toBe(true);
    act(g, 'bureau_sorel', 'Examiner le bureau');
    act(g, 'bureau_sorel', 'Rapprocher');
    expect(g.knows('f_mere')).toBe(true);
    talk(g, 'sorel', ['Votre fille est vivante', 'Vous montrer le médaillon']);
    expect(g.flag('mere_reunie')).toBe(true);
    expect(g.npcSpot('mara')).toBe('i_soins');

    // --- 16:00 : la fouille ne trouve personne ; 17:00 : le conseil
    g.advance(absTime('d1@17:00') - g.state.time);
    expect(g.flag('mara_capturee')).toBeUndefined();
    expect(scripted).toContain('council');
    const votes: Record<string, string> = {};
    for (const id of COUNCIL_ORDER) {
      const m = CONTENT.motions[id];
      if (!g.check(m.if)) continue;
      const s = newSession(m);
      s.position = id === 'expedition' ? 'pieces' : id === 'rationnement' ? 'audit' : id === 'k3_radio' ? 'radio' : m.options[0].id;
      for (const a of availableArgs(g, s)) if (a.toward === s.position) useArg(g, s, a.id);
      const r = resolveVote(g, s);
      applyResult(g, s, r);
      votes[id] = r.winner;
    }
    expect(votes.expedition).toBe('pieces');
    expect(votes.rationnement).toBe('audit');
    expect(votes.clandestin).toBeUndefined(); // Mara est protégée par sa mère : pas de motion
    expect(g.flag('marchetti_destitue')).toBe(true);
    expect(g.npcSpot('marchetti')).toBe('d_table');

    // --- Nuit, puis préparation de l'expédition
    g.sleepUntil(absTime('d2@05:30'));
    expect(scripted).toContain('expedition_prep');
    for (const it of ['cric', 'bandage_comp', 'ration']) g.give(it, 1, true);
    g.state.expedition = { companion: 'vasseur', compHealth: 100, start: g.state.time, deadline: absTime('d2@12:00'), returned: false, missedTrain: false, log: [] };
    g.fireScripted('expedition_depart');
    g.advance(absTime('d2@06:30') - g.state.time);
    g.state.zone = 'exterior';
    const sp = CONTENT.exterior.spots.find((x) => x.id === 'q_arrivee')!;
    g.state.pos = spotAbs(layoutStrip(CONTENT.exterior), sp);

    // --- Saint-Aubin
    g.walk(600);
    act(g, 'mur_messages', 'Lire');
    act(g, 'pharmacie_gare', 'Crocheter');
    expect(g.itemQty('antibio')).toBe(1);
    g.walk(900);
    act(g, 'traces', 'Examiner');
    act(g, 'poutre', 'Étayer avec le cric');
    act(g, 'armoire_k', 'Ouvrir');
    act(g, 'etabli_depot', 'Fouiller');
    expect(g.itemQty('relais_k3')).toBe(1);
    g.walk(700);
    act(g, 'chiens', 'Leur jeter une ration');
    g.walk(500);
    g.state.npcLoc = {};
    expect(g.npcSpot('anselme')).toBe('p_leviers');
    expect(g.npcSpot('theo')).toBe('p_lit');
    talk(g, 'anselme', ['Le VAYN', 'Depuis quand', 'Pouvez-vous mettre le signal']);
    act(g, 'leviers', 'Mettre le signal au rouge');
    expect(g.flag('signal_rouge')).toBe(true);
    act(g, 'recepteur', 'Écouter');
    talk(g, 'theo', ['Qu’est-ce qui s’est passé', 'Soigner sa jambe', 'On te ramène']);
    expect(g.flag('theo_suit')).toBe(true);
    expect(g.knows('t_theo_recit')).toBe(true);
    g.walk(2700, 1.5);
    expect(g.state.time).toBeLessThan(absTime('d2@12:00'));
    expect(deaths).toEqual([]);

    // --- Retour à bord (comme App.returnToTrain)
    g.setFlag('theo_sauve');
    g.addConseq('cq_theo_sauve');
    g.state.zone = 'train';
    g.state.expedition.returned = true;
    act(g, 'filtration', 'Installer le relais K3');
    expect(g.objState('filtration')).toBe('repare');
    expect(g.npcSpot('theo')).toBe('i_lit_vide');

    // --- Départ et assemblée
    g.advance(absTime('d2@12:00') - g.state.time);
    expect(scripted).toContain('departure');
    g.setFlag('train_roule');
    g.advance(absTime('d2@15:00') - g.state.time);
    expect(scripted).toContain('assembly');
    for (const r of REVELATIONS) if (g.check(r.if)) g.applyFx(r.fx);
    expect(g.flag('malo_avoue')).toBe(true);
    const m = CONTENT.motions[ASSEMBLY_MOTION];
    const s = newSession(m);
    s.position = 'clairval';
    for (const a of availableArgs(g, s)) if (a.toward === 'clairval') useArg(g, s, a.id);
    const r = resolveVote(g, s);
    applyResult(g, s, r);
    expect(['sud', 'clairval']).toContain(g.flag('direction'));
    g.addEntry('c_vayn2');

    const epi = buildEpilogue(g);
    const twist = twistText(g);
    expect(epi.map((x) => x.title)).toEqual(['Le train', 'Les gens', 'Le Mécanicien']);
    expect(epi[0].lines.join(' ')).toContain('filtration ronronne');
    expect(epi[1].lines.join(' ')).toContain('Théo dort à l’infirmerie');
    expect(twist.join(' ')).toContain('VAYN-2');
    expect(Object.keys(g.state.journal.entries).length).toBeGreaterThanOrEqual(28);
    expect(deaths).toEqual([]);
  });
});

describe('autres personnages : ouverture et accès', () => {
  it('le Contrôleur ouvre la cabine et lit le sillon fantôme', () => {
    const g = newGame('controleur');
    talk(g, 'start_controleur', ['Au travail']);
    expect(g.knows('c_billet_cabine0')).toBe(true);
    act(g, 'd_cabine', 'Ouvrir avec le passe');
    expect(g.doorOpen('d_cabine')).toBe(true);
    act(g, 'console_cabine', 'Consulter le journal');
    expect(g.state.quests.qp_controleur.obj.cabine).toBe(true);
    act(g, 'bureau_controle', 'Consulter le registre');
    expect(g.state.quests.qp_controleur.obj.registre).toBe(true);
  });

  it('le Majordome ouvre le garde-manger et reçoit la lettre', () => {
    const g = newGame('majordome');
    talk(g, 'start_majordome', ['Aller voir Madame']);
    talk(g, 'villiers', ['Bien, Madame']);
    expect(g.state.quests.qp_majordome?.status).toBe('active');
    act(g, 'd_gardemanger', 'Ouvrir avec les clés');
    act(g, 'gardemanger', 'Ouvrir');
    expect(g.knows('c_gardemanger_salon')).toBe(true);
    talk(g, 'marchetti', ['Une lettre de Madame']);
    expect(g.flag('lettre_remise')).toBe(true);
    expect(g.flag('garcon_noe')).toBe(true);
  });

  it('le Passager peut obtenir des antibiotiques pour Lou', () => {
    const g = newGame('passager');
    talk(g, 'start_passager', ['Aller voir']);
    talk(g, 'sorel', ['Parlez-moi de Lou', 'Et si je trouvais']);
    expect(g.state.quests.qp_passager.obj.sorel).toBe(true);
    act(g, 'pharmacie', 'Subtiliser');
    act(g, 'lit_lou', 'Donner les antibiotiques');
    expect(g.flag('lou_soignee')).toBe(true);
    expect(g.rel('sorel').suspicion).toBeGreaterThanOrEqual(2);
  });

  it('sans intervention, Castel trouve Mara à 16:00 et le conseil vote son sort', () => {
    const g = newGame('passager');
    g.advance(absTime('d1@16:01') - g.state.time);
    expect(g.flag('mara_capturee')).toBe(true);
    expect(g.npcSpot('mara')).toBe('ad_cellule');
    const m = CONTENT.motions.clandestin;
    expect(g.check(m.if)).toBe(true);
    const s = newSession(m);
    s.position = 'expulsion';
    const r = resolveVote(g, s);
    applyResult(g, s, r);
    expect(['cellule', 'expulsion', 'accueil']).toContain(r.winner);
  });
});
