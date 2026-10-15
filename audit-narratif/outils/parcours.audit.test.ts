// Parcours joués dans le moteur réel (sans rendu). Outil d'audit : ne modifie aucun fichier du jeu.
// Lancement : npx vitest run --config audit-narratif/outils/vitest.config.ts
// Résultats : audit-narratif/PARCOURS_EXECUTES.md et audit-narratif/journaux/*.txt
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CONTENT } from '../../src/content';
import type { CharId, MotionDef } from '../../src/engine/types';
import { Run, comprehension, type Policy } from './harness';

const OUT = fileURLToPath(new URL('../', import.meta.url));

const START: Record<CharId, string> = { controleur: 'Au travail', passager: 'Aller voir', majordome: 'Aller voir Madame', mecanicien: 'Y aller' };

function begin(r: Run) {
  r.talk('_', [START[r.char]], `start_${r.char}`);
  if (r.char === 'majordome') r.talk('villiers', ['Bien, Madame']);
}

// ------------------------------------------------------------------ politiques de vote
const abstain: Policy = {
  council: () => ({ position: null, args: 'none' }),
  expedition: (r) => ({ companion: null, gear: r.g.itemQty('lampe') ? { ration: 1 } : { lampe: 1, ration: 1 } }),
  revelations: (avail) => avail.map((x) => x.id),
  direction: () => ({ position: null, args: 'none' }),
};
const investigator = (comp: (r: Run) => string | null): Policy => ({
  council: (m: MotionDef) => {
    const pos: Record<string, string> = { expedition: 'theo', rationnement: 'audit', clandestin: 'accueil', k3_radio: 'radio' };
    return { position: pos[m.id], args: 'toward' };
  },
  expedition: (r) => {
    const gear: Record<string, number> = { ration: 2, bandage_comp: 1, cric: 1 };
    if (!r.g.itemQty('lampe')) gear.lampe = 1;
    if (!r.g.itemQty('masque')) gear.masque = 1;
    return { companion: comp(r), gear };
  },
  revelations: (avail) => avail.map((x) => x.id),
  direction: () => ({ position: 'clairval', args: 'toward' }),
});
const opposite: Policy = {
  council: (m: MotionDef) => {
    const pos: Record<string, string> = { expedition: 'eau', rationnement: 'quota', clandestin: 'expulsion', k3_radio: 'filtration' };
    return { position: pos[m.id], args: 'toward' };
  },
  expedition: (r) => ({ companion: 'castel', gear: r.g.itemQty('lampe') ? { ration: 1, jerrican: 1 } : { lampe: 1, ration: 1, jerrican: 1 } }),
  revelations: () => [],
  direction: () => ({ position: 'sud', args: 'toward' }),
};

// ------------------------------------------------------------------ morceaux de parcours
function machinesMain(r: Run) {
  r.act('alarmes', 'Lire');
  r.act('filtration', 'Ouvrir');
  r.act('pompe_secours', 'Examiner');
  r.act('console_cabine', 'Lire le pupitre');
}
function expeditionMain(r: Run, opts: { poste: boolean; theo: 'ramener' | 'rester' | 'rien'; signal?: boolean; extra?: boolean }) {
  if (r.dead || r.g.state.zone !== 'exterior') return;
  if (opts.extra) {
    r.act('bagages', 'Fouiller');
    r.act('mur_messages', 'Lire');
    if (r.g.itemQty('pied_de_biche')) r.act('pharmacie_gare', 'Forcer');
    else if (r.char === 'mecanicien') r.act('pharmacie_gare', 'Crocheter');
    if (r.g.itemQty('jerrican')) r.act('chateau_eau', 'Remplir');
  }
  r.act('traces', 'Examiner');
  if (r.g.itemQty('cric')) r.act('poutre', 'Étayer avec le cric');
  else if (r.g.state.expedition?.companion === 'vasseur') r.act('poutre', 'Étayer avec Vasseur');
  else r.act('poutre', 'Passer dessous');
  r.act('armoire_k', 'Ouvrir');
  if (opts.extra) r.act('etabli_depot', 'Fouiller');
  if (!opts.poste) return;
  const comp = r.g.state.expedition?.companion;
  if (comp === 'mara') r.act('chiens', 'Laisser Mara');
  else if (comp === 'castel') r.act('chiens', 'Laisser Castel');
  else if (r.g.itemQty('ration')) r.act('chiens', 'Leur jeter une ration');
  else r.act('chiens', 'Attendre');
  r.talk('anselme', ['Le VAYN', 'Depuis quand', 'Le récepteur', 'Pouvez-vous mettre le signal']);
  r.act('recepteur', 'Écouter');
  if (opts.signal) r.act('leviers', 'Mettre le signal au rouge');
  if (opts.theo === 'ramener') r.talk('theo', ['Qu’est-ce qui s’est passé', 'Mara va bien', 'Soigner sa jambe', 'On te ramène']);
  else if (opts.theo === 'rester') r.talk('theo', ['Qu’est-ce qui s’est passé', 'Tu dois rester ici']);
  else r.talk('theo', ['Qu’est-ce qui s’est passé']);
}

// ------------------------------------------------------------------ P1 : histoire principale uniquement
function P1(char: CharId) {
  const r = new Run(char, `P1-principale-${char}`, abstain);
  begin(r);
  r.snap('début');
  machinesMain(r);
  r.talk('vasseur', ['Qu’est-ce qui a lâché']);
  r.act('bons_sortie', 'Consulter');
  r.talk('castel', ['Que s’est-il passé']);
  r.snap('fin de matinée');
  r.until('d1@13:05');
  r.talk('noe', ['Tu as vu quelque chose']);
  r.act('annonces', 'Lire');
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: false, theo: 'rien' });
  r.walkBack();
  if (r.g.itemQty('relais_k3')) r.talk('vasseur', ['J’ai un relais K3']);
  r.toAssembly();
  return r;
}

// ------------------------------------------------------------------ P2 : explorateur
function P2(char: CharId) {
  const comp = (rr: Run) => (rr.g.rel('vasseur').trust >= 0 ? 'vasseur' : null);
  const r = new Run(char, `P2-explorateur-${char}`, investigator(comp));
  begin(r);
  const g = r.g;
  // Atelier et machines
  r.act('etabli', 'Lire le carnet');
  r.act('couchette_theo', 'Fouiller');
  r.act('etagere', 'Prendre le pied-de-biche');
  machinesMain(r);
  if (char === 'mecanicien') r.act('d_cabine', 'Crocheter');
  else if (char === 'controleur') r.act('d_cabine', 'Ouvrir avec le passe');
  r.act('console_cabine', 'Consulter le journal');
  r.act('bons_sortie', 'Consulter');
  r.link('c_pompe_secours', 'c_bon_sortie');
  r.talk('vasseur', ['Qu’est-ce qui a lâché', 'Et Théo', 'La pompe de secours', char === 'mecanicien' ? 'Tu m’as fait signer' : 'Le bon de sortie', char === 'mecanicien' ? 'J’avouerai' : 'Le conseil doit savoir']);
  if (char === 'mecanicien') r.act('casier_theo', 'Crocheter');
  else {
    r.talk('vasseur', ['Il me faudrait la clé', 'S’il y a une piste']);
    if (g.itemQty('cle_casier')) r.act('casier_theo', 'Ouvrir avec la clé');
    else r.act('casier_theo', 'Forcer');
  }
  r.link('c_socle_vide', 'c_carnet_theo');
  r.link('f_pompe_morte', 'f_k3_radio');
  // Infirmerie
  r.act('bureau_sorel', 'Examiner le bureau');
  r.talk('sorel', ['Comment vont les malades', 'Cette photo']);
  if (char === 'passager') r.talk('sorel', ['Parlez-moi de Lou', 'Et si je trouvais']);
  // Cantine
  r.act('tableau_rations', 'Lire');
  r.act('annonces', 'Lire');
  r.talk('rosa', ['Tu as vu Théo', 'Tu as l’air soucieuse', 'Je peux t’aider à la réserve']);
  r.talk('vic', ['Théo est venu te voir', char === 'passager' ? 'Merci, Vic' : 'Payer 3 jetons']);
  r.talk('agathe', ['Tu as remarqué', 'Je t’offre un peu de tabac']);
  // Soute : la cache
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Doucement', 'Que sais-tu de Théo', 'D’où viens-tu', 'Pourquoi es-tu montée', 'Je peux la garder']);
  r.link('t_rosa_portions', 'c_cache');
  // Dortoirs
  r.act('cache_noe', 'Fouiller');
  if (char === 'passager') r.talk('noe', ['Tu as vu quelque chose', 'C’est toi qui prends', 'Je promets']);
  else r.talk('noe', ['Tiens, une ration', 'C’est toi qui prends', 'Je promets']);
  r.act('hydro', 'Identifier');
  // Administration
  r.talk('castel', ['Que s’est-il passé']);
  r.act('carte_reseau', 'Étudier');
  if (char === 'controleur') r.act('bureau_controle', 'Consulter le registre');
  else r.talk('castel', ['Le registre des passagers', 'Pour retrouver Théo']);
  // Salon
  if (char === 'passager' || char === 'controleur') r.talk('josefa', ['Vous étiez de service', 'Vous pouvez me faire confiance']);
  else r.talk('josefa', ['Vous étiez de service', 'Deux jetons']);
  r.talk('villiers', ['Vous connaissiez Théo']);
  if (char === 'majordome') {
    r.act('d_gardemanger', 'Ouvrir avec les clés');
    r.talk('villiers', ['Ouvrir la lettre']);
  }
  // 11:00 : la réserve
  r.until('d1@11:00');
  if (char === 'passager') r.act('d_cage', 'Se faufiler');
  r.act('citerne', 'Lire le compteur');
  r.act('bureau_reserve', 'Lire le registre');
  r.act('bureau_reserve', 'Fouiller le tiroir');
  r.link('c_registre_cabine0', 'c_compteur_eau');
  r.link('f_detournement', 'c_lettre_marchetti');
  // Midi : Castel déjeune → tiroir, radio
  r.until('d1@12:05');
  r.act('bureau_castel', 'Fouiller le tiroir');
  if (char === 'mecanicien') r.act('d_radio', 'Crocheter');
  else if (char === 'controleur') r.talk('castel', ['J’ai besoin de la clé', 'Règlement']);
  else if (char === 'majordome') r.talk('castel', ['Un café, chef']);
  if (g.itemQty('cle_radio')) r.act('d_radio', 'Ouvrir avec la clé');
  r.act('radio', 'Examiner le poste');
  r.link('c_registre_radio', 'c_relais_radio');
  r.link('c_registre_radio', 't_mara_clairval');
  r.link('c_carnet_theo', 't_vic_k3');
  r.link('t_noe_saut', 't_hotesse_castel');
  r.talk('castel', ['Vous avez croisé Théo', 'Et ce journal radio', 'Le conseil devra']);
  r.talk('castel', ['Parlons de la radio', 'Il y a un journal', 'Je comprends. Mais']);
  if (char === 'mecanicien' || char === 'passager') r.act('d_gardemanger', 'Crocheter');
  r.act('gardemanger', 'Ouvrir');
  r.talk('marchetti', ['Qu’est-ce que la « cabine 0 »', 'Quatre jerricans par nuit', 'Vous auriez dû']);
  if (char === 'majordome') r.talk('marchetti', ['Une lettre de Madame']);
  // La mère et la fille
  r.act('bureau_sorel', 'Rapprocher');
  r.talk('sorel', ['Votre fille est vivante', 'Vous montrer le médaillon']);
  if (char === 'passager') {
    if (!g.itemQty('antibio')) r.talk('marchetti', ['Lou a besoin', 'Je sais pour la']);
    r.act('lit_lou', 'Donner les antibiotiques');
  }
  r.talk('rosa', ['Pour ta ration disparue', 'Je l’ai trouvé']);
  r.snap('avant le conseil');
  r.until('d1@17:00');
  r.talk('mara', ['Tu viendrais avec moi']);
  r.talk('vasseur', ['Vous viendrez à l’expédition']);
  r.until('d1@21:00');
  if (g.doorOpen('d_radio')) r.act('radio', 'Écouter 4,7');
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'ramener', signal: true, extra: true });
  r.walkBack();
  if (g.itemQty('relais_k3')) r.talk('vasseur', ['J’ai un relais K3']);
  r.talk('theo', []);
  r.toAssembly();
  return r;
}

// ------------------------------------------------------------------ P3 : refuse les missions secondaires
function P3(char: CharId) {
  const r = new Run(char, `P3-refus-${char}`, abstain);
  begin(r);
  if (char === 'majordome') r.act('poele', 'Brûler la lettre');
  machinesMain(r);
  r.talk('vasseur', ['Qu’est-ce qui a lâché', 'Et Théo']);
  r.talk('castel', ['Que s’est-il passé']);
  r.talk('rosa', ['Tu as vu Théo']); // n'accepte pas la ration disparue
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Pose ça', 'Que sais-tu de Théo']); // ne l'aide pas
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'rester' });
  r.walkBack();
  r.toAssembly();
  return r;
}

// ------------------------------------------------------------------ P4 : décisions opposées
function P4(char: CharId) {
  const r = new Run(char, `P4-oppose-${char}`, opposite);
  begin(r);
  const g = r.g;
  machinesMain(r);
  r.act('tableau_rations', 'Lire');
  r.talk('josefa', ['Vous étiez de service', char === 'controleur' || char === 'passager' ? 'Vous pouvez me faire confiance' : 'Deux jetons']);
  r.talk('castel', ['Que s’est-il passé', 'Vous avez croisé Théo', 'Dites-moi la vérité', 'Ça restera entre nous']);
  if (char === 'controleur') r.talk('marchetti', ['J’aurais besoin de la clé', 'Le Contrôle']);
  r.until('d1@11:00');
  if (g.itemQty('cle_reserve')) r.act('d_cage', 'Ouvrir avec la clé');
  r.act('citerne', 'Lire le compteur');
  r.act('bureau_reserve', 'Lire le registre');
  r.link('c_registre_cabine0', 'c_compteur_eau');
  r.talk('marchetti', ['Qu’est-ce que la « cabine 0 »', 'Quatre jerricans par nuit', 'Je garde ça pour moi']);
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Pose ça', 'D’où viens-tu']);
  r.until('d1@17:00'); // Mara capturée à 16:00, puis expulsée au conseil
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'rester', signal: true, extra: true });
  r.walkBack(); // rentre à l'heure : le train doit-il s'arrêter au signal rouge ?
  r.toAssembly();
  return r;
}

// ------------------------------------------------------------------ P5 : manque les indices facultatifs
function P5(char: CharId) {
  const r = new Run(char, `P5-indices-manques-${char}`, { ...abstain, expedition: (rr) => ({ companion: null, gear: rr.g.itemQty('lampe') ? { ration: 2, bandage_comp: 1 } : { lampe: 1, ration: 2, bandage_comp: 1 } }) });
  begin(r);
  r.act('alarmes', 'Lire');
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'ramener' });
  r.walkBack();
  r.talk('theo', []);
  r.toAssembly();
  return r;
}

// ------------------------------------------------------------------ P6 : méfiant
function P6(char: CharId) {
  const pol: Policy = { ...opposite, council: (m) => ({ position: ({ expedition: 'pieces', rationnement: 'egal', clandestin: 'cellule', k3_radio: 'filtration' } as Record<string, string>)[m.id], args: 'toward' }), expedition: (rr) => ({ companion: null, gear: rr.g.itemQty('lampe') ? { ration: 2, cric: 1 } : { lampe: 1, ration: 2, cric: 1 } }), revelations: (avail) => avail.filter((x) => x.id !== 'rev_mere').map((x) => x.id), direction: () => ({ position: 'sud', args: 'toward' }) };
  const r = new Run(char, `P6-mefiant-${char}`, pol);
  begin(r);
  machinesMain(r);
  r.talk('vasseur', ['Qu’est-ce qui a lâché', 'La pompe de secours', 'Si vous le dites']);
  r.talk('castel', ['Que s’est-il passé']);
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Pose ça', 'D’où viens-tu', 'Que sais-tu de Théo', 'Pourquoi es-tu montée', 'Je vais chercher']);
  r.g.chooseHypothesis('q_mara', 'h_mara_menteuse');
  r.act('cache_noe', 'Fouiller');
  r.talk('rosa', ['Tu as l’air soucieuse']);
  r.talk('rosa', ['Pour ta ration disparue', 'C’est Noé']);
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'rien' });
  r.walkBack();
  r.toAssembly();
  return r;
}

// ------------------------------------------------------------------ cas ciblés
function C1() {
  // Mara capturée ; on révèle au conseil qu'elle est la fille de Sorel (argument m_mere).
  const r = new Run('controleur', 'C1-revelation-au-conseil', investigator(() => null));
  begin(r);
  r.act('bureau_sorel', 'Examiner le bureau');
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Doucement', 'Que sais-tu de Théo', 'Pourquoi es-tu montée', 'Je peux la garder']);
  r.act('bureau_sorel', 'Rapprocher');
  r.until('d1@17:00');
  r.L(`Après le conseil : mere_reunie=${r.g.flag('mere_reunie')} mara_libre=${r.g.flag('mara_libre')} mere_revelee_conseil=${r.g.flag('mere_revelee_conseil')}`);
  const s = r.talk('sorel', []);
  r.L(`Sorel propose encore « Votre fille est vivante » : ${s.length ? 'voir dialogue' : '?'}`);
  r.sleep();
  r.walkBack();
  r.toAssembly();
  return r;
}
function C2() {
  // Mara capturée ; on dit à Castel en cellule qu'elle est la fille de Sorel.
  const r = new Run('controleur', 'C2-castel-cellule', abstain);
  begin(r);
  r.act('bureau_sorel', 'Examiner le bureau');
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Doucement', 'Que sais-tu de Théo', 'Pourquoi es-tu montée', 'Je peux la garder']);
  r.act('bureau_sorel', 'Rapprocher');
  r.until('d1@16:10');
  r.talk('castel', ['La fille, dans la cellule', 'C’est la fille de la docteure']);
  r.L(`Après Castel : mere_reunie=${r.g.flag('mere_reunie')} mara_libre=${r.g.flag('mara_libre')}`);
  r.talk('sorel', []);
  r.until('d1@17:00');
  r.sleep();
  r.walkBack();
  r.toAssembly();
  return r;
}
function C3() {
  // Conseil d'abstention : le verdict tombe en « cellule ». Mara reste-t-elle à bord pendant l'expédition ?
  const r = new Run('passager', 'C3-cellule-puis-expedition', opposite);
  begin(r);
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Doucement', 'Que sais-tu de Théo']);
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'rien' });
  r.L(`Mara pendant l'expédition : point=${r.g.npcSpot('mara')} ; drapeaux mara_expulsee=${r.g.flag('mara_expulsee')}`);
  const a = r.talk('anselme', []);
  r.L(`Anselme parle-t-il de Mara ? ${a.some((t) => /petite|Mara|barrage/.test(t)) ? 'oui' : 'non'}`);
  r.walkBack();
  r.toAssembly();
  return r;
}
function C4() {
  // Théo ramené sans lui demander son récit : peut-on l'entendre à bord ?
  const r = new Run('controleur', 'C4-theo-sans-recit', { ...abstain, expedition: (rr) => ({ companion: 'vasseur', gear: { ration: 2, bandage_comp: 1 } }) });
  begin(r);
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'rien', signal: false });
  // (expeditionMain a déjà demandé « Qu'est-ce qui s'est passé » : on refait un essai propre)
  return r;
}
function C4b() {
  const r = new Run('controleur', 'C4b-theo-ramene-direct', { ...abstain, expedition: () => ({ companion: 'vasseur', gear: { ration: 2, bandage_comp: 1 } }) });
  begin(r);
  r.until('d1@17:00');
  r.sleep();
  r.act('traces', 'Examiner');
  r.act('poutre', 'Étayer avec Vasseur');
  r.act('chiens', 'Leur jeter une ration');
  r.talk('anselme', ['Le VAYN']);
  r.talk('theo', ['On te ramène']);
  r.walkBack();
  const t = r.talk('theo', []);
  r.L(`À bord, Théo peut-il raconter ? ${r.g.knows('t_theo_recit') ? 'récit connu' : 'récit inconnu'} ; options : ${t.join(' | ')}`);
  r.toAssembly();
  return r;
}
function C5() {
  // Radio à 21:00 sans avoir rencontré Mara : texte et attribution de l'entrée.
  const r = new Run('mecanicien', 'C5-radio-sans-mara', abstain);
  begin(r);
  r.until('d1@12:05');
  r.act('d_radio', 'Crocheter');
  r.act('radio', 'Examiner le poste');
  r.act('radio', 'Écouter');
  r.until('d1@21:05');
  r.act('radio', 'Écouter 4,7');
  r.L(`Entrée obtenue : t_mara_clairval=${r.g.knows('t_mara_clairval')} (titre « ${CONTENT.entries.t_mara_clairval.title} ») ; Mara rencontrée=${r.g.rel('mara').met}`);
  r.sleep();
  r.walkBack();
  r.toAssembly();
  return r;
}
function C6() {
  // Promesse de silence à Castel, puis révélation de la nuit de Théo à l'assemblée.
  const r = new Run('controleur', 'C6-promesse-castel', { ...abstain, expedition: () => ({ companion: null, gear: { ration: 2, bandage_comp: 1, cric: 1 } }) });
  begin(r);
  r.talk('josefa', ['Vous étiez de service', 'Vous pouvez me faire confiance']);
  r.talk('castel', ['Que s’est-il passé', 'Vous avez croisé Théo', 'Dites-moi la vérité', 'Ça restera entre nous']);
  const before = r.g.rel('castel').trust;
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'ramener' });
  r.walkBack();
  r.toAssembly();
  r.L(`Castel : promesse castel_couvert=${r.g.flag('castel_couvert')} ; révélation rev_theo faite=${r.revUsed.includes('rev_theo')} ; confiance ${before} → ${r.g.rel('castel').trust}`);
  return r;
}
function C7() {
  // Le Passager vole les antibiotiques : l'objectif « Trouver des antibiotiques » se coche-t-il ?
  const r = new Run('passager', 'C7-vol-antibio', abstain);
  begin(r);
  r.talk('sorel', ['Parlez-moi de Lou', 'Et si je trouvais']);
  r.act('pharmacie', 'Subtiliser');
  r.act('lit_lou', 'Donner les antibiotiques');
  r.L(`qp_passager : ${JSON.stringify(r.g.state.quests.qp_passager)}`);
  r.until('d1@17:00');
  r.sleep();
  r.walkBack();
  r.toAssembly();
  return r;
}

function C8() {
  // Mara (réunie avec sa mère) part en expédition et meurt dans la brume.
  const r = new Run('passager', 'C8-mara-meurt', { ...investigator(() => 'mara'), revelations: () => [] });
  begin(r);
  r.act('bureau_sorel', 'Examiner le bureau');
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Doucement', 'Que sais-tu de Théo', 'Pourquoi es-tu montée', 'Je peux la garder']);
  r.act('bureau_sorel', 'Rapprocher');
  r.talk('sorel', ['Votre fille est vivante', 'Vous montrer']);
  r.until('d1@17:00');
  r.talk('mara', ['Tu viendrais avec moi']);
  r.sleep();
  r.L(`compagnon : ${r.g.state.expedition?.companion}`);
  expeditionMain(r, { poste: true, theo: 'rien' });
  // Mort du compagnon simulée (le test porte sur l'épilogue et l'assemblée, pas sur les dégâts).
  r.g.changeCompanionHealth(-100);
  r.L(`santé compagnon=${r.g.state.expedition?.compHealth} ; joueur=${Math.round(r.g.state.stats.health)}`);
  r.checkCompanion(); // App.checkCompanion (corrigé : hide:)
  r.walkBack();
  r.L(`Après le retour : Mara est au point ${r.g.npcSpot('mara')}`);
  r.talk('mara', []);
  r.talk('sorel', []);
  r.toAssembly();
  return r;
}
function C9() {
  // Vasseur meurt pendant l'expédition : vote-t-elle encore à l'assemblée ?
  const r = new Run('controleur', 'C9-vasseur-meurt', { ...abstain, expedition: () => ({ companion: 'vasseur', gear: { ration: 2 } }), direction: () => ({ position: 'clairval', args: 'none' }) });
  begin(r);
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'rien' });
  r.g.changeCompanionHealth(-100);
  r.checkCompanion(); // App.checkCompanion (corrigé : hide:)
  r.walkBack();
  r.L(`Après le retour : Vasseur est au point ${r.g.npcSpot('vasseur')} ; on peut lui parler :`);
  r.talk('vasseur', []);
  r.toAssembly();
  return r;
}

function C10() {
  // Première conversation avec Mara alors qu'elle est déjà en cellule (cas le plus fréquent en jeu minimal).
  const r = new Run('controleur', 'C10-mara-premiere-fois-en-cellule', abstain);
  begin(r);
  r.until('d1@16:10');
  r.L(`Mara : point=${r.g.npcSpot('mara')} ; rencontrée=${r.g.rel('mara').met}`);
  r.talk('mara', ['Doucement']);
  r.until('d1@17:00');
  r.sleep();
  r.walkBack();
  r.toAssembly();
  return r;
}

function C11() {
  // Signal au rouge + retour à l'heure : Théo doit monter à bord (D-02).
  const r = new Run('passager', 'C11-theo-signal-rouge', abstain);
  begin(r);
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'rester', signal: true });
  r.walkBack();
  r.toAssembly();
  return r;
}

function C12() {
  // L'identité de Mara est révélée au conseil : la mère et la fille doivent se retrouver (D-04).
  const r = new Run('controleur', 'C12-mere-revelee-au-conseil', investigator(() => null));
  begin(r);
  r.act('bureau_sorel', 'Examiner le bureau');
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Doucement', 'Que sais-tu de Théo', 'Pourquoi es-tu montée', 'Je peux la garder']);
  r.act('bureau_sorel', 'Rapprocher');
  r.L(`médaillon récupéré : ${r.g.itemQty('medaillon')}`);
  r.g.tryLink('c_medaillon_mara', 'c_medaillon_sorel');
  r.L(`f_mere connu : ${r.g.knows('f_mere')}`);
  r.until('d1@17:00');
  r.sleep();
  expeditionMain(r, { poste: false });
  r.walkBack();
  r.talk('sorel', ['Je suis désolée']);
  r.toAssembly();
  return r;
}


function avantConseil(r: Run) {
  // La filiation, trouvée normalement (bureau de Sorel + médaillon).
  r.act('bureau_sorel', 'Examiner le bureau');
  r.act('mur_caisses', 'Déplacer');
  r.talk('mara', ['Doucement', 'Que sais-tu de Théo', 'D\u2019où viens-tu', 'Pourquoi es-tu montée', 'Je peux la garder']);
  r.act('bureau_sorel', 'Rapprocher');
  r.link('c_medaillon_mara', 'c_medaillon_sorel');
  // Le témoignage de Josefa, puis l'aveu de Castel et son tiroir : c'est ce qui achète sa confiance.
  r.talk('josefa', ['Vous étiez de service', 'Vous pouvez me faire confiance']);
  r.talk('castel', ['Que s\u2019est-il passé', 'Vous avez croisé Théo', 'Dites-moi la vérité', 'Ça restera entre nous']);
  r.until('d1@12:05');
  r.act('bureau_castel', 'Fouiller le tiroir');
  r.talk('castel', ['Parlons de la radio', 'Il y a un journal', 'Je garderai ça pour moi']);
}

function C13() {
  // N3 + N2 : on dit au conseil que Mara est la fille de Sorel, et le council-la en cellule.
  // Les scènes de révélation (cellule_mere, mere) doivent alors disparaître, comme la réunion.
  const r = new Run('controleur', 'C13-revelation-puis-cellule', {
    council: (m: MotionDef) => {
      const pos: Record<string, string> = { expedition: 'theo', rationnement: 'quota', clandestin: 'cellule', k3_radio: 'radio' };
      return { position: pos[m.id], args: m.id === 'clandestin' ? ['m_mere'] : 'toward' };
    },
    expedition: (rr) => ({ companion: null, gear: rr.g.itemQty('lampe') ? { ration: 1 } : { lampe: 1, ration: 1 } }),
    revelations: (avail) => avail.map((x) => x.id),
    direction: () => ({ position: 'clairval', args: 'toward' }),
  });
  begin(r);
  // Le moteur de la pompe de secours : Vasseur avoue, et couvre le contrôleur jusqu'au bout.
  r.act('pompe_secours', 'Examiner');
  r.act('bons_sortie', 'Consulter les bons');
  r.link('c_pompe_secours', 'c_bon_sortie');
  r.talk('vasseur', ['La pompe de secours n\u2019a plus de moteur', 'Le bon de sortie', 'Je garderai ça pour moi']);
  avantConseil(r);
  r.L(`Avant le conseil : f_mere=${r.g.knows('f_mere')} f_pompe_morte=${r.g.knows('f_pompe_morte')} castel_couvert=${r.g.flag('castel_couvert')} castel confiance=${r.g.rel('castel').trust} soupçon=${r.g.rel('castel').suspicion} vasseur confiance=${r.g.rel('vasseur').trust} dette=${r.g.rel('vasseur').debt}`);
  r.until('d1@17:00');
  r.L(`Après le conseil : vote=${r.g.flag('vote_clandestin')} mere_revelee_conseil=${r.g.flag('mere_revelee_conseil')} mere_reunie=${r.g.flag('mere_reunie')} point de Mara=${r.g.npcSpot('mara')}`);
  // Scènes qui contrediraient le verdict : elles ne doivent plus exister.
  r.talk('castel', ['La fille, dans la cellule']);
  r.talk('sorel', ['Votre fille est vivante']);
  r.L(`Tentatives après le verdict : mere_reunie=${r.g.flag('mere_reunie')} consequences=${r.g.state.conseqs.map((c) => c.id).join(', ')}`);
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'rien' });
  r.walkBack();
  r.toAssembly();
  return r;
}

function C14() {
  // Même révélation au conseil, mais le conseil vote l'expulsion : plus aucun retour à bord.
  const r = new Run('controleur', 'C14-revelation-puis-expulsion', {
    council: (m: MotionDef) => {
      const pos: Record<string, string> = { expedition: 'theo', rationnement: 'quota', clandestin: 'expulsion', k3_radio: 'radio' };
      return { position: pos[m.id], args: m.id === 'clandestin' ? ['m_mere'] : 'toward' };
    },
    expedition: (rr) => ({ companion: null, gear: rr.g.itemQty('lampe') ? { ration: 1 } : { lampe: 1, ration: 1 } }),
    revelations: (avail) => avail.map((x) => x.id),
    direction: () => ({ position: 'clairval', args: 'toward' }),
  });
  begin(r);
  avantConseil(r);
  r.L(`Avant le conseil : f_mere=${r.g.knows('f_mere')} castel confiance=${r.g.rel('castel').trust} soupçon=${r.g.rel('castel').suspicion} vasseur confiance=${r.g.rel('vasseur').trust} dette=${r.g.rel('vasseur').debt}`);
  r.until('d1@17:00');
  r.L(`Après le conseil : vote=${r.g.flag('vote_clandestin')} mere_revelee_conseil=${r.g.flag('mere_revelee_conseil')} mere_reunie=${r.g.flag('mere_reunie')} point de Mara=${r.g.npcSpot('mara')}`);
  r.talk('castel', ['La fille, dans la cellule']);
  r.talk('sorel', ['Votre fille est vivante']);
  r.L(`Tentatives après le verdict : mere_reunie=${r.g.flag('mere_reunie')} consequences=${r.g.state.conseqs.map((c) => c.id).join(', ')}`);
  r.sleep();
  expeditionMain(r, { poste: true, theo: 'rien' });
  r.walkBack();
  r.toAssembly();
  return r;
}

describe('audit narratif — parcours', () => {
  it('joue tous les parcours et écrit le rapport', () => {
    const runs: Run[] = [];
    const chars: CharId[] = ['controleur', 'passager', 'majordome', 'mecanicien'];
    for (const c of chars) runs.push(P1(c));
    for (const c of chars) runs.push(P2(c));
    runs.push(P3('passager'), P3('majordome'));
    runs.push(P4('controleur'), P4('mecanicien'));
    runs.push(P5('mecanicien'), P5('majordome'));
    runs.push(P6('passager'), P6('controleur'));
    runs.push(C1(), C2(), C3(), C4b(), C5(), C6(), C7(), C8(), C9(), C10(), C11(), C12(), C13(), C14());

    const out: string[] = ['# Parcours exécutés (moteur réel, sans rendu)', '', 'Fichier généré par `audit-narratif/outils/parcours.audit.test.ts`. Ne pas modifier à la main.', '', 'Chaque parcours joue le chapitre dans le vrai moteur (`src/engine`) avec le vrai contenu (`src/content`).', 'Les séquences de l’application (conseil, nuit, expédition, retour, départ, assemblée) sont recopiées de `src/app/App.ts`.', 'La marche est approchée en ligne droite ; les PNJ sont placés selon leur emploi du temps. Aucun rendu, aucune interface.', ''];
    const grid: string[] = ['| Parcours | ' + Object.keys(comprehension(runs[0])).join(' | ') + ' |', '|' + '---|'.repeat(Object.keys(comprehension(runs[0])).length + 1)];
    for (const r of runs) {
      out.push(r.report(), '');
      grid.push(`| ${r.label} | ${Object.values(comprehension(r)).join(' | ')} |`);
    }
    out.push('## Grille de compréhension', '', ...grid, '');
    fs.writeFileSync(OUT + 'PARCOURS_EXECUTES.md', out.join('\n'));
    fs.mkdirSync(OUT + 'journaux', { recursive: true });
    for (const r of runs) fs.writeFileSync(OUT + `journaux/${r.label}.txt`, r.log.join('\n') + '\n\nNOTIFICATIONS\n' + r.toasts.join('\n') + '\n');

    // --- non-régression (les parcours ci-dessus doivent rester cohérents de bout en bout)
    const c11 = runs.find((r) => r.label === 'C11-theo-signal-rouge')!;
    expect(c11.dead).toBeNull();
    expect(c11.g.flag('theo_sauve')).toBe(true);          // D-02 : le signal rouge vaut même retour à l'heure
    expect(c11.g.flag('train_roule')).toBe(true);
    expect(c11.g.state.conseqs.map((c) => c.id)).toContain('cq_theo_sauve');
    expect(c11.g.state.conseqs.map((c) => c.id)).not.toContain('cq_theo_laisse');
    expect(c11.epilogue.find((s) => s.title === 'Les gens')!.lines.join(' ')).toContain('Théo dort à l’infirmerie');

    const c12 = runs.find((r) => r.label === 'C12-mere-revelee-au-conseil')!;
    expect(c12.dead).toBeNull();
    expect(c12.g.flag('mere_reunie')).toBe(true);          // D-04 : l'argument du conseil vaut la réunion
    expect(c12.g.state.conseqs.map((c) => c.id)).toContain('cq_mere_reunie');
    expect(c12.g.state.quests.q_mara?.status).toBe('done');
    expect(c12.g.npcSpot('mara')).not.toBeNull();

    const c8 = runs.find((r) => r.label === 'C8-mara-meurt')!;
    expect(c8.g.flag('compagnon_mort')).toBe('mara');      // D-01 : morte, donc invisible
    expect(c8.g.npcSpot('mara')).toBeNull();
    expect(c8.log.some((l) => /mara absent/.test(l))).toBe(true);

    const c9 = runs.find((r) => r.label === 'C9-vasseur-meurt')!;
    const vote = runs.find((r) => r.label === 'C9-vasseur-meurt')!.g.state.flags['vote_direction'];
    expect(vote).toBeTruthy();
    expect(c9.log.some((l) => /"vasseur":/.test(l.split('Assemblée')[1] ?? ''))).toBe(false); // D-01 : elle ne vote plus

    const c3 = runs.find((r) => r.label === 'C3-cellule-puis-expedition')!;
    expect(c3.g.flag('vote_clandestin')).toBe('cellule');   // le libellé du parcours dit ce qui est réellement joué
    expect(c3.g.flag('mara_expulsee')).toBeFalsy();
    expect(c3.log.some((l) => /Anselme parle-t-il de Mara \? non/.test(l))).toBe(true);

    const c13 = runs.find((r) => r.label === 'C13-revelation-puis-cellule')!;
    expect(c13.dead).toBeNull();
    expect(c13.ended).toBe(true);
    expect(c13.argsUsed).toContain('clandestin.m_mere');                    // l'argument a bien été porté au conseil
    expect(c13.g.flag('mere_revelee_conseil')).toBe(true);                  // N3 : la filiation a été dite…
    expect(c13.g.flag('vote_clandestin')).toBe('cellule');                  // … mais c'est le verdict qui décide.
    expect(c13.log.some((l) => /Le sort de la clandestine.*→ cellule \(position cellule/.test(l))).toBe(true);
    expect(c13.votes.clandestin).toBe('cellule');
    expect(c13.g.flag('mere_reunie')).toBeFalsy();                         // N3 : aucune réunion n'a eu lieu.
    expect(c13.g.state.conseqs.map((x) => x.id)).not.toContain('cq_mere_reunie');
    expect(c13.g.flag('mara_cellule')).toBe(true);                          // N2 : la fille reste enfermée.
    expect(c13.g.state.conseqs.map((x) => x.id)).toContain('cq_mara_cellule');
    expect(c13.g.npcSpot('mara')).toBe('ad_cellule');
    expect(c13.log.some((l) => /✗ choix « La fille, dans la cellule » absent/.test(l))).toBe(true);
    expect(c13.log.some((l) => /✗ choix « Votre fille est vivante » absent/.test(l))).toBe(true);
    const gens13 = c13.epilogue.find((s2) => s2.title === 'Les gens')!.lines.join(' ');
    expect(gens13).toContain('Mara attend dans sa cellule');
    expect(gens13).toContain('la porte, elle, est restée fermée');
    expect(gens13).not.toContain('ne se quittent plus');

    const c14 = runs.find((r) => r.label === 'C14-revelation-puis-expulsion')!;
    expect(c14.dead).toBeNull();
    expect(c14.ended).toBe(true);
    expect(c14.argsUsed).toContain('clandestin.m_mere');
    expect(c14.g.flag('mere_revelee_conseil')).toBe(true);
    expect(c14.g.flag('vote_clandestin')).toBe('expulsion');                // N3 : le conseil décide, pas l'argument.
    expect(c14.g.flag('mara_expulsee')).toBe(true);
    expect(c14.g.flag('mara_libre')).toBeFalsy();                           // N2b : aucun retour à bord.
    expect(c14.g.flag('mere_reunie')).toBeFalsy();
    expect(c14.g.npcSpot('mara')).toBeNull();                               // débarquée : plus aucun point sur le train
    expect(c14.g.state.conseqs.map((x) => x.id)).toContain('cq_mara_expulsee');
    expect(c14.g.state.conseqs.map((x) => x.id)).not.toContain('cq_mere_reunie');
    expect(c14.log.some((l) => /✗ choix « La fille, dans la cellule » absent/.test(l))).toBe(true);
    expect(c14.log.some((l) => /✗ choix « Votre fille est vivante » absent/.test(l))).toBe(true);
    expect(c14.epilogue.find((s2) => s2.title === 'Les gens')!.lines.join(' ')).toContain('débarquée à Saint-Aubin');

    expect(runs.length).toBeGreaterThanOrEqual(30);
  });
});
