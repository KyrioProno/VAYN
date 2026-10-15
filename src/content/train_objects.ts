// Objets interactifs du train. x relatif à la section, y = profondeur au sol.
import type { ActionDef, ObjectDef } from '../engine/types';

const A = (label: string, o: Partial<ActionDef> = {}): ActionDef => ({ label, ...o });

/** Repas au comptoir (drapeau « repas » posé par les événements datés). */
function meals(): ActionDef[] {
  const list: [string, string][] = [
    ['matin', 'Prendre le petit-déjeuner'],
    ['midi', 'Prendre le déjeuner'],
    ['soir', 'Prendre le dîner'],
    ['matin2', 'Prendre un café et du pain'],
    ['midi2', 'Prendre le déjeuner'],
  ];
  const out: ActionDef[] = [];
  for (const [k, label] of list) {
    out.push(A(label, {
      if: `f:repas=${k} & !f:pris_${k} & !f:rationnement=egal`,
      time: 15,
      fx: [`set:pris_${k}`, 'stat:satiety+32', 'stat:hydration+22'],
      text: [
        { if: 'f:rationnement=quota & (char:mecanicien | char:passager)', text: 'Rosa vous sert la part des travailleurs. Le regard des autres pèse plus lourd que l\'assiette.' },
        { if: 'true', text: 'Rosa remplit votre gamelle sans un mot de trop. Soupe claire, pain noir, un gobelet d\'eau compté.' },
      ],
    }));
    out.push(A(label, {
      if: `f:repas=${k} & !f:pris_${k} & f:rationnement=egal`,
      time: 15,
      fx: [`set:pris_${k}`, 'stat:satiety+25', 'stat:hydration+18'],
      text: 'Ration égale pour tous : la louche de Rosa est un peu moins pleine. Au Salon aussi, paraît-il.',
    }));
  }
  return out;
}

const sleep = (label = 'Dormir / se reposer'): ActionDef => A(label, { tag: 'sleep' });

export const TRAIN_OBJECTS: ObjectDef[] = [
  // ================================================================ MACHINES
  {
    id: 'console_cabine', sec: 'machines', name: 'Pupitre de conduite', sprite: 'cab_console', x: 44, y: 78, block: [40, 10],
    // Le pupitre est derrière la porte de la cabine : on ne le signale que si elle est ouverte.
    important: '!f:console_lue & door:d_cabine=open',
    actions: [
      A('Lire le pupitre', {
        fx: ['set:console_lue', 'set:sait_depart'],
        text: 'ARRÊT DE SÉCURITÉ — CIRCUIT EAU. Reprise automatique : demain 12:00 (fenêtre de départ maximale atteinte). Le pilote automatique repartira, que la filtration soit réparée ou non.',
      }),
      A('Consulter le journal de bord', {
        fx: ['entry:c_cabine_horaire', 'obj:qp_controleur.cabine'],
        text: [
          { if: 'char:controleur', text: 'Votre écriture, page après page. Et puis, glissé à la fin, un horaire que vous n\'avez jamais vu : votre propre ligne, un mois plus tôt, sous l\'indicatif « VAYN-2 ». Une ligne fantôme.' },
          { if: 'true', text: 'Le journal du Contrôle. À la fin, un horaire imprimé : le même trajet que le VAYN, un mois plus tôt, sous l\'indicatif « VAYN-2 ».' },
        ],
      }),
    ],
  },
  {
    id: 'alarmes', sec: 'machines', name: 'Tableau d\'alarmes', sprite: 'alarm_panel', x: 166, y: 70, elev: 26, emissive: true,
    important: '!e:c_alarmes',
    light: { color: '#ff5040', r: 26, flicker: true, if: '!obj:filtration=repare' },
    actions: [
      A('Lire le journal d\'alarmes', {
        fx: ['entry:c_alarmes', 'obj:q_main.machines'],
        text: [
          { if: 'char:mecanicien', text: '« Bascule sur secours : ÉCHEC. » Pas une surcharge : la pompe n\'a même pas tenté de démarrer. Comme s\'il n\'y avait rien au bout du câble.' },
          { if: 'true', text: '23:40, la filtration s\'arrête. 23:41, la pompe de secours ne prend pas le relais. 23:52, le train s\'immobilise en gare de Saint-Aubin.' },
        ],
      }),
    ],
  },
  {
    id: 'turbine', sec: 'machines', name: 'Turbine principale', sprite: 'turbine', x: 232, y: 80, block: [92, 12],
    actions: [
      A('Examiner', {
        text: [
          { if: 'res:energy<30', text: 'La turbine tousse. Les batteries baissent : il faudra choisir ce qu\'on éclaire.' },
          { if: 'true', text: 'La turbine tourne au ralenti sur les batteries. Elle n\'est pas en cause : c\'est l\'eau qui a arrêté le train.' },
        ],
      }),
    ],
  },
  {
    id: 'filtration', sec: 'machines', name: 'Filtration d\'eau', x: 360, y: 76, block: [38, 8],
    sprite: [{ if: 'obj:filtration=repare', sprite: 'filtration_ok' }, { if: 'true', sprite: 'filtration_broken' }],
    important: '!e:c_socle_vide | (has:relais_k3 & !obj:filtration=repare)',
    actions: [
      A('Ouvrir l\'armoire', {
        if: '!obj:filtration=repare',
        time: 5,
        fx: ['entry:c_socle_vide'],
        text: [
          { if: 'char:mecanicien', text: 'Le socle du relais K3 est vide. Vis alignées, cosses protégées : c\'est le travail de quelqu\'un qui comptait le remettre. Vous connaissez cette manie. Théo.' },
          { if: 'true', text: 'Un emplacement vide au milieu des relais, étiqueté K3. Rien n\'est arraché : quelqu\'un a retiré la pièce proprement, et rangé les vis à côté.' },
        ],
      }),
      A('Installer le relais K3', {
        if: 'has:relais_k3 & !obj:filtration=repare & (char:mecanicien | has:trousse)',
        tag: 'Réparation',
        time: 30,
        fx: ['take:relais_k3', 'objst:filtration=repare', 'conseq:cq_filtration', 'set:filtration_reparee', 'sfx:repair', 'obj:q_main.panne'],
        text: 'Le relais s\'enclenche avec un claquement net. Une seconde de silence… puis la filtration se remet à ronronner. Quelque part dans le train, quelqu\'un applaudit.',
      }),
      A('Installer le relais K3', {
        if: 'has:relais_k3 & !obj:filtration=repare & !char:mecanicien & !has:trousse',
        text: 'Sans outils, vous risquez de griller la pièce. Il vous faut une trousse d\'outils, ou l\'aide de Vasseur.',
      }),
      A('Écouter', { if: 'obj:filtration=repare', text: 'Le ronron régulier de la filtration. Le plus beau bruit du monde.' }),
    ],
  },
  {
    id: 'pompe_secours', sec: 'machines', name: 'Pompe de secours', x: 446, y: 106, block: [28, 8],
    sprite: [{ if: 'up:up_pompe', sprite: 'pump_ok' }, { if: 'true', sprite: 'pump_dead' }],
    important: '!e:c_pompe_secours',
    actions: [
      A('Examiner', {
        if: '!up:up_pompe',
        time: 5,
        fx: ['entry:c_pompe_secours'],
        text: [
          { if: 'char:mecanicien', text: 'Le carter est vide. Les boulons portent la marque d\'une clé à mâchoire ébréchée — celle de Vasseur. Et la poussière dit trois semaines, au moins.' },
          { if: 'true', text: 'Le capot de la pompe de secours est posé de travers. Dessous : rien. Le moteur a disparu, et la poussière accumulée dit que ça ne date pas d\'hier.' },
        ],
      }),
      A('Examiner', { if: 'up:up_pompe', text: 'Le moteur des bacs a retrouvé sa place. La pompe de secours est prête — les bacs hydroponiques, eux, tournent au ralenti.' }),
    ],
  },
  {
    id: 'chaudiere', sec: 'machines', name: 'Chaudière à biomasse', sprite: 'biomass', x: 492, y: 76, block: [28, 7],
    actions: [
      A('Charger la chaudière (30 min)', {
        once: 'chaudiere_1',
        time: 30,
        fx: ['res:energy+5', 'stat:rest-6'],
        text: 'Épluchures, cartons, sciure : vous enfournez tout. La chaudière grogne, les ampoules reprennent un peu de couleur.',
      }),
      A('Examiner', { if: 'f:chaudiere_1', text: 'Il n\'y a plus rien à brûler pour aujourd\'hui.' }),
    ],
  },
  // ================================================================ ATELIER
  {
    id: 'etabli', sec: 'atelier', name: 'Établi', sprite: 'workbench', x: 92, y: 76, block: [54, 9],
    important: '!e:c_carnet_entretien',
    actions: [
      A('Lire le carnet d\'entretien', {
        time: 5,
        fx: ['entry:c_carnet_entretien', 'obj:qp_mecanicien.voir'],
        text: [
          { if: 'char:mecanicien', text: '« Pompe de secours : révisée, opérationnelle. O. Vasseur. » Et dessous, votre propre signature. Vous vous souvenez de ce soir-là : Vasseur vous a tendu le stylo, vous étiez épuisé. Vous n\'avez rien vérifié.' },
          { if: 'true', text: '« Pompe de secours : révisée, opérationnelle », il y a quinze jours. Signé O. Vasseur, contresigné M. Kerbrat.' },
        ],
      }),
      A('Bricoler (Technique)', {
        if: 'char:mecanicien',
        once: 'bricole_bandage',
        time: 20,
        fx: ['give:bandage_comp'],
        text: 'Avec de la gaze de la réserve de l\'atelier et une boîte de conserve, vous montez une trousse de secours digne de ce nom.',
      }),
    ],
  },
  {
    id: 'etagere', sec: 'atelier', name: 'Étagère à pièces', x: 186, y: 72, block: [38, 6],
    sprite: [{ if: 'f:etagere_fouillee', sprite: 'parts_shelf_empty' }, { if: 'true', sprite: 'parts_shelf' }],
    actions: [
      A('Fouiller les étagères', {
        once: 'etagere_fouillee',
        time: 10,
        fx: ['give:corde', 'give:piles'],
        text: 'Une corde tressée et des piles oubliées derrière une caisse de fusibles. Pas de K3, évidemment.',
      }),
      A('Prendre le pied-de-biche', {
        once: 'pied_pris',
        fx: ['give:pied_de_biche'],
        text: 'Le pied-de-biche de l\'équipe. Personne ne le cherchera… avant d\'en avoir besoin.',
      }),
    ],
  },
  {
    id: 'bons_sortie', sec: 'atelier', name: 'Bons de sortie', sprite: 'clipboard_wall', x: 222, y: 70, elev: 22,
    important: '!e:c_bon_sortie & e:c_pompe_secours',
    actions: [
      A('Consulter les bons', {
        time: 5,
        fx: ['entry:c_bon_sortie'],
        text: 'Bon n° 112, il y a trois semaines : « 1 moteur de pompe, 0,75 kW — pour bacs hydroponiques (dortoirs). » Paraphe : O.V.',
      }),
    ],
  },
  {
    id: 'casier_malo', sec: 'atelier', name: 'Votre casier', sprite: 'locker_green', x: 262, y: 74, block: [16, 5], visible: 'char:mecanicien',
    actions: [A('Ouvrir votre casier', { tag: 'storage' })],
  },
  {
    id: 'casier_theo', sec: 'atelier', name: 'Casier de Théo', x: 296, y: 74, block: [16, 5],
    sprite: [{ if: 'obj:casier_theo=ouvert', sprite: 'locker_open' }, { if: 'true', sprite: 'locker' }],
    important: '!obj:casier_theo=ouvert',
    actions: [
      A('Examiner', { if: '!obj:casier_theo=ouvert', text: 'Casier n° 7, « T. LAGARDE ». Fermé à clé. Vasseur garde un double des clés de son équipe.' }),
      A('Ouvrir avec la clé', {
        if: '!obj:casier_theo=ouvert & has:cle_casier', time: 5,
        fx: ['objst:casier_theo=ouvert', 'give:carnet_theo', 'entry:c_carnet_theo', 'obj:q_main.theo'],
        text: 'Une veste, une photo de mer, et un petit carnet à spirale glissé derrière la tablette. Les dernières pages sont écrites serré, comme on écrit un secret.',
      }),
      A('Crocheter', {
        if: '!obj:casier_theo=ouvert & !has:cle_casier & char:mecanicien', tag: 'Technique', time: 10,
        fx: ['objst:casier_theo=ouvert', 'give:carnet_theo', 'entry:c_carnet_theo', 'obj:q_main.theo'],
        text: 'Deux épingles, trente secondes. Théo n\'a jamais cru aux serrures. Derrière la tablette, son carnet.',
      }),
      A('Forcer au pied-de-biche', {
        if: '!obj:casier_theo=ouvert & !has:cle_casier & has:pied_de_biche', danger: true, time: 5,
        fx: ['objst:casier_theo=ouvert', 'give:carnet_theo', 'entry:c_carnet_theo', 'susp:vasseur+1', 'obj:q_main.theo', 'sfx:metal'],
        text: 'La porte cède dans un hurlement de tôle. Tout l\'atelier a dû l\'entendre. Derrière la tablette : un carnet à spirale.',
      }),
    ],
  },
  {
    id: 'couchette_theo', sec: 'atelier', name: 'Couchette de Théo', sprite: 'bunk_theo', x: 382, y: 76, block: [50, 8],
    important: '!e:c_couchette_theo',
    actions: [
      A('Fouiller la couchette', {
        time: 10,
        fx: ['entry:c_couchette_theo', 'set:dessin_vu'],
        text: 'Lit fait au carré. Son sac de nuit et sa frontale ont disparu. Sous l\'oreiller, un dessin maladroit : un grand mur d\'eau, et « MERCI THÉO », écrit au feutre, de biais.',
      }),
    ],
  },
  {
    id: 'caisse_outils', sec: 'atelier', name: 'Caisse à outils', sprite: 'toolbox', x: 140, y: 104,
    actions: [
      A('Prendre la trousse d\'outils', {
        if: '!char:mecanicien', once: 'trousse_prise',
        fx: ['give:trousse', 'susp:vasseur+1'],
        text: 'Vous empruntez la trousse de l\'atelier. Vasseur va pester.',
      }),
      A('Examiner', { if: 'char:mecanicien', text: 'Votre trousse est dans votre casier. Celle-ci, c\'est celle de l\'équipe.' }),
    ],
  },
  // ================================================================ INFIRMERIE
  {
    id: 'lit_lou', sec: 'infirmerie', name: 'Lit de Lou', x: 70, y: 82, block: [42, 8],
    sprite: 'bed_med_patient',
    important: 'char:passager & !f:lou_soignee',
    actions: [
      A('Voir la patiente', {
        text: [
          { if: 'f:lou_soignee', text: 'Lou dort enfin d\'un sommeil calme. Sa main n\'est plus brûlante.' },
          { if: 'char:passager', text: 'Lou ouvre les yeux, vous reconnaît, essaie de sourire. Sa main est brûlante. « Tu restes un peu ? »' },
          { if: 'true', text: 'Une adolescente fiévreuse. Étiquette au pied du lit : LOU MORIN — liste d\'attente : 4.' },
        ],
      }),
      A('Rester auprès de Lou (30 min)', {
        if: 'char:passager & !f:lou_veillee', time: 30,
        fx: ['set:lou_veillee', 'stat:rest+6'],
        text: 'Vous lui racontez la mer qu\'aucune de vous deux n\'a jamais vue. Elle s\'endort avant la fin.',
      }),
      A('Donner les antibiotiques', {
        if: 'has:antibio & !f:lou_soignee', time: 5,
        fx: ['take:antibio', 'set:lou_soignee', 'conseq:cq_lou_soignee', 'obj:qp_passager.soigner', 'qdone:qp_passager', 'trust:sorel+1'],
        text: [
          { if: 'char:passager', text: 'Vous lui faites avaler le premier comprimé. « C\'est amer », dit-elle. Vous riez, et vous ne savez pas pourquoi vous pleurez en même temps.' },
          { if: 'true', text: 'Vous confiez la boîte à l\'infirmière de garde. La petite aura sa dose ce soir.' },
        ],
      }),
    ],
  },
  {
    id: 'lit_vide', sec: 'infirmerie', name: 'Lit libre', sprite: 'bed_med', x: 196, y: 82, block: [42, 8],
    actions: [
      A('Se reposer (1 h)', { time: 60, fx: ['stat:rest+12', 'stat:health+5'], text: 'Les draps sentent le désinfectant. Vous fermez les yeux une heure.' }),
    ],
  },
  {
    id: 'rideau', sec: 'infirmerie', name: 'Rideau', sprite: 'curtain_med', x: 150, y: 74, actions: [],
  },
  {
    id: 'sterilisateur', sec: 'infirmerie', name: 'Stérilisateur', x: 262, y: 76, block: [20, 6],
    sprite: [{ if: 'up:up_sterilisateur', sprite: 'sterilizer_on' }, { if: 'true', sprite: 'sterilizer_off' }],
    actions: [
      A('Examiner', {
        text: [
          { if: 'up:up_sterilisateur', text: 'Le voyant vert est allumé. La docteure n\'a plus à faire bouillir ses instruments dans une casserole.' },
          { if: 'true', text: 'Résistance grillée. Sans lui, la docteure fait bouillir ses instruments dans une casserole. (Réparable depuis l\'onglet Train.)' },
        ],
      }),
    ],
  },
  {
    id: 'pharmacie', sec: 'infirmerie', name: 'Pharmacie', sprite: 'med_cabinet', x: 328, y: 74, block: [20, 5],
    important: 'char:passager & !f:liste_vue',
    actions: [
      A('Examiner', {
        fx: ['set:liste_vue'],
        text: 'Fermée à clé. Scotchée sur la vitre : « Antibiotiques : 2 boîtes. Liste d\'attente : 1. Petit Ferrand — 2. M. Aubert (Salon) — 3. Mme Kowalski — 4. Lou Morin. »',
      }),
      A('Subtiliser une boîte', {
        if: 'char:passager & !f:antibio_vole', tag: 'Discret', danger: true, time: 10,
        fx: ['give:antibio', 'set:antibio_vole', 'susp:sorel+2', 'res:meds-1'],
        text: 'La vitre ferme mal. Vous glissez une boîte sous votre manteau. Quelqu\'un, plus haut sur la liste, n\'aura rien.',
      }),
      A('Crocheter', {
        if: 'char:mecanicien & !f:antibio_vole', tag: 'Technique', danger: true, time: 15,
        fx: ['give:antibio', 'set:antibio_vole', 'susp:sorel+2', 'res:meds-1'],
        text: 'La serrure est une blague. Une boîte d\'amoxicilline change de propriétaire.',
      }),
    ],
  },
  {
    id: 'bureau_sorel', sec: 'infirmerie', name: 'Bureau de la docteure', sprite: 'doc_desk', x: 396, y: 80, block: [34, 8],
    important: '!e:c_medaillon_sorel',
    actions: [
      A('Examiner le bureau', {
        time: 5,
        fx: ['entry:c_medaillon_sorel'],
        text: [
          { if: 'char:majordome', text: 'Une photo : une fillette au bord d\'un lac. À côté, une moitié de médaillon en laiton, gravée « …ARA ». Vous avez déjà vu sa jumelle — vous en êtes certain.' },
          { if: 'true', text: 'Des dossiers, une tasse froide. Une photo : une fillette au bord d\'un lac. Posée dessus, une moitié de médaillon gravée « …ARA ».' },
        ],
      }),
      A('Rapprocher les deux moitiés', {
        if: 'has:medaillon & e:c_medaillon_sorel & !e:f_mere',
        fx: ['entry:c_medaillon_mara', 'entry:f_mere', 'obj:q_mara.mere'],
        text: 'Les deux moitiés s\'emboîtent sans un jeu : « MARA ». Vous restez un long moment, le médaillon reconstitué dans la paume.',
      }),
    ],
  },
  // ================================================================ CANTINE
  {
    id: 'comptoir', sec: 'cantine', name: 'Comptoir', sprite: 'counter_kitchen', x: 76, y: 88, block: [92, 12],
    actions: [
      ...meals(),
      A('Examiner', { text: [{ if: 'f:repas', text: 'Le service est ouvert.' }, { if: 'true', text: 'Le comptoir est fermé. Repas : 08:00, 12:00 et 19:00.' }] }),
    ],
  },
  {
    id: 'fontaine', sec: 'cantine', name: 'Fontaine', sprite: 'fountain', x: 150, y: 72, elev: 0, block: [14, 5],
    actions: [
      A('Boire', {
        if: 'obj:filtration=repare & !f:fontaine_bu', fx: ['set:fontaine_bu', 'stat:hydration+20'],
        text: 'L\'eau coule de nouveau, claire et froide.',
      }),
      A('Examiner', {
        if: '!obj:filtration=repare',
        text: 'Cadenassée depuis l\'arrêt de la filtration. Une pancarte : « Distribution d\'eau aux repas uniquement. »',
      }),
    ],
  },
  {
    id: 'tableau_rations', sec: 'cantine', name: 'Tableau des rations', sprite: 'ration_board', x: 222, y: 70, elev: 24,
    important: '!e:c_tableau_rations',
    actions: [
      A('Lire', {
        fx: ['entry:c_tableau_rations'],
        text: [
          { if: 'char:controleur', text: 'Vous refaites les comptes de tête. Les distributions ne collent pas avec la baisse de la citerne : il manque environ quatre jerricans par semaine. Ce n\'est pas de l\'évaporation, c\'est une habitude.' },
          { if: 'true', text: 'Les chiffres à la craie ne tombent pas juste : la citerne baisse plus vite que les distributions. Quelqu\'un se sert.' },
        ],
      }),
    ],
  },
  {
    id: 'annonces', sec: 'cantine', name: 'Panneau d\'annonces', sprite: 'notice_board', x: 262, y: 70, elev: 26,
    actions: [
      A('Lire', {
        fx: ['set:annonces_lues'],
        text: '« CONSEIL DES QUATRE — 17:00, CANTINE : l\'expédition, les rations. » — « AVIS : Théo LAGARDE, maintenance, absent depuis cette nuit. Toute information au poste de sécurité. » — « Troc : piles contre tabac, voir Vic. »',
      }),
    ],
  },
  { id: 'banc1', sec: 'cantine', name: 'Banc', sprite: 'bench', x: 320, y: 84, actions: [] },
  { id: 'table1', sec: 'cantine', name: 'Table', sprite: 'table', x: 320, y: 98, block: [36, 6], actions: [] },
  { id: 'banc2', sec: 'cantine', name: 'Banc', sprite: 'bench', x: 430, y: 84, actions: [] },
  { id: 'table2', sec: 'cantine', name: 'Table', sprite: 'table', x: 430, y: 98, block: [36, 6], actions: [] },
  {
    id: 'etal_vic', sec: 'cantine', name: 'Étal du Passeur', sprite: 'passeur_stall', x: 488, y: 78, block: [38, 8],
    actions: [A('Commercer', { dlg: 'vic' })],
  },
  // ================================================================ SOUTE
  {
    id: 'citerne', sec: 'soute', name: 'Citerne', sprite: 'water_tank', x: 56, y: 78, block: [34, 8],
    important: '!e:c_compteur_eau',
    actions: [
      A('Lire le compteur', {
        time: 5,
        fx: ['entry:c_compteur_eau'],
        text: 'Un compteur mécanique à rouleaux, avec un enregistreur à papier. Deux nuits sur sept, vers 23 h, un trait : deux jerricans, une quarantaine de litres. Aucune distribution à cette heure-là.',
      }),
      A('Verser le jerrican', {
        if: 'has:jerrican_plein', time: 5,
        fx: ['take:jerrican_plein', 'give:jerrican', 'res:water+1', 'conseq:cq_eau_tour'],
        text: 'Vingt litres de plus dans la citerne. Ce n\'est pas rien.',
      }),
    ],
  },
  { id: 'caisses_vivres', sec: 'soute', name: 'Caisses de vivres', sprite: 'crate_stack', x: 128, y: 80, block: [38, 8], actions: [A('Examiner', { text: 'Rations militaires, conserves. Moins qu\'au dernier inventaire, d\'après les étiquettes.' })] },
  { id: 'caisse_med', sec: 'soute', name: 'Caisse médicale', sprite: 'med_crate', x: 236, y: 76, actions: [A('Examiner', { text: 'Scellée par la docteure Sorel. Le scellé est intact.' })] },
  { id: 'caisse_big', sec: 'soute', name: 'Caisse', sprite: 'crate_big', x: 170, y: 74, actions: [] },
  {
    id: 'bureau_reserve', sec: 'soute', name: 'Bureau de l\'intendance', sprite: 'reserve_desk', x: 318, y: 80, block: [30, 8],
    important: '!e:c_registre_cabine0',
    actions: [
      A('Lire le registre', {
        time: 10,
        fx: ['entry:c_registre_cabine0', 'obj:qp_controleur.cabine0'],
        text: [
          { if: 'char:controleur', text: 'Sorties nocturnes : « cabine 0 — 2 jerricans, 6 conserves ». Paraphe P.M. Le même tampon que sur votre billet. Une cabine fantôme qu\'on ravitaille deux fois par semaine — quatre jerricans, au total.' },
          { if: 'true', text: 'Colonnes propres, écriture appliquée. Et, deux fois par semaine, la nuit : « cabine 0 — 2 jerricans, 6 conserves ». Paraphe : P.M.' },
        ],
      }),
      A('Fouiller le tiroir', {
        once: 'tiroir_marchetti', time: 5, danger: true,
        fx: ['give:lettre_marchetti', 'entry:c_lettre_marchetti', 'susp:marchetti+1'],
        text: 'Sous les reçus, le brouillon d\'une lettre, raturé : « Madame, comme convenu : quatre jerricans par semaine contre une boîte d\'amoxicilline… »',
      }),
    ],
  },
  {
    id: 'porte_chargement', sec: 'soute', name: 'Porte de chargement', sprite: 'cargo_door', x: 392, y: 68, elev: 0,
    actions: [
      A('Examiner', {
        fx: ['set:loquet_vu'],
        text: 'La porte coulissante donne sur le quai. Le loquet a été ouvert de l\'intérieur, cette nuit : la graisse est encore fraîche, et il y a une trace de botte sur le marchepied.',
      }),
      A('Descendre sur le quai', {
        if: '!ev:expedition_depart',
        text: 'Castel a interdit toute sortie : la brume, les chiens, « et ce qui rôde ». Le conseil de 17:00 décidera d\'une expédition.',
      }),
    ],
  },
  {
    id: 'mur_caisses', sec: 'soute', name: 'Caisses empilées', sprite: 'crate_wall', x: 444, y: 102, block: [62, 34], visible: '!f:cache_ouverte',
    important: '(e:t_rosa_portions | e:c_carnet_theo | f:dessin_vu | f:noe_parle_cache) & !f:cache_ouverte',
    actions: [
      A('Examiner', {
        text: [
          { if: 'e:t_rosa_portions | e:c_carnet_theo | f:noe_parle_cache', text: 'Un mur de caisses trop bien rangé, collé à la paroi. Derrière, quelque chose bouge — une respiration retenue.' },
          { if: 'true', text: 'Des caisses empilées jusqu\'au plafond. Rien d\'anormal… sauf peut-être cet espace, derrière.' },
        ],
      }),
      A('Déplacer les caisses', {
        if: 'char:passager', tag: 'Discret', time: 10,
        fx: ['set:cache_ouverte', 'entry:c_cache', 'obj:q_mara.trouver', 'set:mara_trouvee'],
        text: 'Vous faites glisser les caisses sans un bruit. Derrière : une couverture, deux bols, des dessins de barrage… et deux yeux qui vous fixent dans le noir.',
      }),
      A('Déplacer les caisses (20 min)', {
        if: '!char:passager', time: 20,
        fx: ['set:cache_ouverte', 'entry:c_cache', 'obj:q_mara.trouver', 'set:mara_trouvee', 'stat:rest-5'],
        text: 'Les caisses raclent le plancher. Quand la dernière bascule, vous découvrez une couverture, deux bols, des dessins de barrage… et deux yeux qui vous fixent dans le noir.',
      }),
    ],
  },
  { id: 'mur_caisses_ouvert', sec: 'soute', name: 'Caisses déplacées', sprite: 'crate_wall_moved', x: 400, y: 104, block: [30, 12], visible: 'f:cache_ouverte', actions: [] },
  {
    id: 'cache', sec: 'soute', name: 'La cache', sprite: 'nook', x: 446, y: 74, visible: 'f:cache_ouverte',
    actions: [A('Examiner', { text: 'Une couverture, deux bols, un écouteur bricolé avec un fil de cuivre. Et des dizaines de dessins : un barrage immense, des fenêtres allumées.' })],
  },
  // ================================================================ DORTOIRS
  { id: 'couchette1', sec: 'dortoirs', name: 'Couchettes', sprite: 'bunk', x: 50, y: 74, block: [50, 8], actions: [sleep()] },
  {
    id: 'couchette_sacha', sec: 'dortoirs', name: 'Couchette de Sacha', sprite: 'bunk_red', x: 150, y: 74, block: [50, 8],
    actions: [
      A('Ouvrir votre sac', { if: 'char:passager', tag: 'storage' }),
      sleep(),
    ],
  },
  { id: 'couchette3', sec: 'dortoirs', name: 'Couchettes', sprite: 'bunk_empty', x: 250, y: 74, block: [50, 8], actions: [sleep()] },
  {
    id: 'cache_noe', sec: 'dortoirs', name: 'Cachette', sprite: 'noe_stash', x: 112, y: 108,
    actions: [
      A('Fouiller', {
        if: '!f:cachette_noe_vue', time: 5,
        fx: ['set:cachette_noe_vue', 'set:ration_coupable', 'obj:q_ration.enquete'],
        text: [
          { if: 'f:dessin_vu', text: 'Sous la couchette, une boîte à biscuits : deux rations emballées dans du papier journal, et un dessin de barrage — le même que celui trouvé sous l\'oreiller de Théo. Noé met des vivres de côté — pour quelqu\'un.' },
          { if: 'true', text: 'Sous la couchette, une boîte à biscuits : deux rations emballées dans du papier journal, et un dessin de barrage, aux tours fines, avec une phrase en dessous : « MERCI THÉO ». Noé met des vivres de côté — pour quelqu\'un.' },
        ],
      }),
      A('Examiner', { if: 'f:cachette_noe_vue', text: 'La boîte à biscuits de Noé. Vous la remettez exactement en place.' }),
    ],
  },
  {
    id: 'hydro', sec: 'dortoirs', name: 'Bacs hydroponiques', sprite: 'hydro_shelf', x: 304, y: 72, block: [32, 6],
    light: { color: '#c99cff', r: 30 },
    actions: [
      A('Examiner', {
        text: [
          { if: 'up:up_pompe', text: 'Sans le moteur, la circulation tourne au ralenti. Les feuilles jaunissent déjà.' },
          { if: 'up:up_hydro', text: 'Les bacs étendus débordent de vert. On mangera un peu mieux.' },
          { if: 'true', text: 'Laitues, haricots, aromates. Le petit moteur qui fait circuler l\'eau ronronne — un moteur de pompe, vous semble-t-il.' },
        ],
      }),
      A('Identifier le moteur', {
        if: 'e:c_bon_sortie & !up:up_pompe', fx: ['set:moteur_identifie'],
        text: 'Plaque signalétique : « Pompe auxiliaire — VAYN — 0,75 kW ». Le moteur de la pompe de secours fait pousser les salades.',
      }),
    ],
  },
  { id: 'linge', sec: 'dortoirs', name: 'Linge', sprite: 'laundry', x: 210, y: 70, elev: 30, actions: [] },
  { id: 'table_dortoir', sec: 'dortoirs', name: 'Table', sprite: 'dorm_table', x: 396, y: 100, block: [24, 6], actions: [] },
  {
    id: 'poele', sec: 'dortoirs', name: 'Poêle', sprite: 'stove_small', x: 450, y: 74, block: [16, 6],
    light: { color: '#ff9a50', r: 24, flicker: true },
    actions: [
      A('Se réchauffer (30 min)', { time: 30, fx: ['stat:rest+5'], text: 'La chaleur vous engourdit les doigts, puis l\'esprit.' }),
      A('Brûler la lettre de Madame', {
        if: 'has:lettre_madame | has:lettre_ouverte', danger: true,
        fx: ['take:lettre_madame', 'take:lettre_ouverte', 'set:lettre_brulee', 'conseq:cq_lettre_brulee', 'obj:qp_majordome.remettre', 'qdone:qp_majordome'],
        text: 'La cire rose fond en premier. Puis le papier se recroqueville, et avec lui vingt ans de loyauté.',
      }),
    ],
  },
  // ================================================================ ADMINISTRATION
  {
    id: 'armoire_cles', sec: 'admin', name: 'Armoire à clés', sprite: 'key_cabinet', x: 40, y: 70, elev: 28,
    actions: [
      A('Examiner', { text: 'Toutes les clés du train, sauf deux crochets vides : « RADIO » et « RÉSERVE ».' }),
    ],
  },
  {
    id: 'bureau_controle', sec: 'admin', name: 'Bureau du Contrôle', sprite: 'office_desk', x: 100, y: 80, block: [40, 9],
    important: 'char:controleur & !e:c_registre_passagers',
    actions: [
      A('Consulter le registre des passagers', {
        if: 'char:controleur | trust:castel>=2 | f:registre_autorise', time: 10,
        fx: ['entry:c_registre_passagers', 'obj:qp_controleur.registre'],
        text: '212 passagers, cabines, couchettes. Théo Lagarde, maintenance, couchette atelier. Aucune cabine 0 — mais une colonne « livraisons » au nom du Salon, raturée à l\'encre noire.',
      }),
      A('Consulter le registre des passagers', {
        if: '!char:controleur & !trust:castel>=2 & !f:registre_autorise',
        text: 'Le registre est sous clé dans le tiroir du Contrôle. Il faudrait l\'autorisation du Contrôleur — ou de Castel.',
      }),
      A('Ouvrir le tiroir personnel', { if: 'char:controleur', tag: 'storage' }),
    ],
  },
  { id: 'lit_camp_controle', sec: 'admin', name: 'Lit de camp', sprite: 'cot', x: 48, y: 106, visible: 'char:controleur', actions: [sleep()] },
  {
    id: 'carte_reseau', sec: 'admin', name: 'Carte du réseau', sprite: 'map_network', x: 160, y: 70, elev: 26,
    actions: [
      A('Étudier la carte', {
        fx: ['set:carte_vue'],
        text: 'Saint-Aubin, puis l\'embranchement de Vercel : au sud, la ligne vers la côte et Port-Sel ; à l\'est, la vallée et le barrage de Clairval. Quelqu\'un a entouré Clairval au crayon, puis l\'a barré.',
      }),
    ],
  },
  { id: 'classeur', sec: 'admin', name: 'Classeur', sprite: 'filing', x: 192, y: 72, block: [14, 5], actions: [A('Examiner', { text: 'Des formulaires de réclamation. Le plus récent : « Mon eau a un goût de rouille. » Sans réponse.' })] },
  {
    id: 'bureau_castel', sec: 'admin', name: 'Bureau de Castel', sprite: 'office_desk', x: 252, y: 80, block: [40, 9],
    important: 'e:c_relais_radio & !e:c_registre_radio',
    actions: [
      A('Examiner', { text: 'Rien ne traîne. Un tiroir fermé à clé, une matraque de rechange, un registre des rondes tenu au cordeau.' }),
      A('Fouiller le tiroir', {
        if: '!has:registre_radio & !f:registre_radio_lu & !at:castel=ad_securite', danger: true, time: 10,
        fx: ['give:registre_radio', 'entry:c_registre_radio', 'susp:castel+1', 'set:registre_radio_lu'],
        text: 'Le tiroir cède sous la lame d\'un coupe-papier. Dessous, un journal d\'écoute : « 4,7 MHz, 21 h, voix humaine, Clairval ». Tampon rouge : NE PAS DIFFUSER — H.C.',
      }),
    ],
  },
  { id: 'cellule', sec: 'admin', name: 'Cellule', sprite: 'cell', x: 340, y: 92, depthBias: 0.5, actions: [] },
  { id: 'banc_cellule', sec: 'admin', name: 'Banc', sprite: 'cell_bench', x: 340, y: 76, actions: [] },
  {
    id: 'radio', sec: 'admin', name: 'Poste radio', x: 456, y: 78, block: [38, 8],
    sprite: [{ if: 'f:k3_retire_radio', sprite: 'radio' }, { if: 'true', sprite: 'radio_k3' }],
    important: '!e:c_relais_radio',
    actions: [
      A('Examiner le poste', {
        time: 5,
        fx: ['entry:c_relais_radio'],
        text: [
          { if: 'f:k3_retire_radio', text: 'Le socle bricolé est vide : le K3 est reparti dans la filtration. Le poste est muet.' },
          { if: 'true', text: 'Un relais K3 branché en dérivation, fils de récupération, soudures propres. Quelqu\'un a ressuscité ce poste en cachette.' },
        ],
      }),
      A('Écouter 4,7 MHz', {
        if: '!f:k3_retire_radio & clock>=21:00', time: 20,
        fx: ['entry:c_voix_clairval', 'set:clairval_entendu'],
        text: 'Du souffle. Puis une voix d\'homme, fatiguée, en boucle : « …Clairval, barrage… nous sommes quarante… venez par la vallée… » Une boucle enregistrée ? Ou un appel vivant ?',
      }),
      A('Écouter', {
        if: '!f:k3_retire_radio & clock<21:00',
        text: [
          { if: 'e:t_mara_clairval', text: 'Du souffle sur toutes les fréquences. Mara parlait de 21 h.' },
          { if: 'e:c_registre_radio', text: 'Du souffle sur toutes les fréquences. Le journal de Castel parlait de 21 h.' },
          { if: 'true', text: 'Du souffle sur toutes les fréquences. Rien, à cette heure-ci.' },
        ],
      }),
      A('Retirer le K3', {
        if: '!f:k3_retire_radio & !obj:filtration=repare & e:f_k3_radio', danger: true, time: 10,
        fx: ['set:k3_retire_radio', 'give:relais_k3', 'set:radio_muette'],
        text: 'Vous dessoudez le relais. Le poste s\'éteint dans un dernier grésillement. La filtration, elle, pourrait repartir.',
      }),
    ],
  },
  { id: 'journal_radio', sec: 'admin', name: 'Cahier d\'écoute', sprite: 'radio_log', x: 492, y: 80, elev: 0, actions: [A('Lire', { text: 'Le cahier d\'écoute officiel. Dernière entrée il y a huit jours, de la main de Castel : « RAS. Poste hors service. »' })] },
  // ================================================================ SALON
  {
    id: 'bar', sec: 'salon', name: 'Bar', sprite: 'bar_salon', x: 56, y: 78, block: [56, 10],
    actions: [
      A('Servir un verre (Service)', {
        if: 'char:majordome & !f:verre_servi', time: 10,
        fx: ['set:verre_servi', 'trust:villiers+1'],
        text: 'Vous préparez le cognac de Madame, exactement comme elle l\'aime. Certaines habitudes survivent à la fin du monde.',
      }),
      A('Examiner', { text: 'Des bouteilles à moitié pleines, des verres en cristal. Ici, on ne rationne pas le cognac.' }),
    ],
  },
  { id: 'fauteuil1', sec: 'salon', name: 'Fauteuil', sprite: 'armchair', x: 156, y: 84, actions: [] },
  { id: 'table_salon', sec: 'salon', name: 'Guéridon', sprite: 'salon_table', x: 176, y: 90, block: [16, 5], actions: [] },
  { id: 'fauteuil2', sec: 'salon', name: 'Fauteuil', sprite: 'armchair', x: 204, y: 84, flip: true, actions: [] },
  { id: 'gramophone', sec: 'salon', name: 'Gramophone', sprite: 'gramophone', x: 238, y: 74, actions: [A('Remonter le gramophone', { time: 5, fx: ['sfx:gramophone'], text: 'Une valse grinçante s\'élève. Pendant trois minutes, on pourrait croire que rien n\'est arrivé.' })] },
  { id: 'piano', sec: 'salon', name: 'Piano', sprite: 'piano', x: 290, y: 76, block: [44, 8], actions: [A('Jouer quelques notes', { time: 5, fx: ['sfx:piano'], text: 'Le piano est désaccordé. Les notes tombent de travers, comme tout le reste.' })] },
  {
    id: 'gardemanger', sec: 'salon', name: 'Garde-manger', x: 372, y: 72, block: [26, 6],
    sprite: [{ if: 'f:gardemanger_ouvert', sprite: 'pantry_open' }, { if: 'true', sprite: 'pantry' }],
    important: '!e:c_gardemanger_salon',
    actions: [
      A('Ouvrir', {
        fx: ['set:gardemanger_ouvert', 'entry:c_gardemanger_salon'],
        text: [
          { if: 'char:majordome', text: 'Vous connaissez chaque étagère. Mais vous n\'aviez jamais compté : douze jerricans marqués du V de la réserve commune, des caisses de rations militaires. Bien plus que pour Madame et M. Aubert.' },
          { if: 'true', text: 'Des jerricans marqués du V de la réserve commune, des caisses de rations militaires, du café, du sucre. Bien plus que pour deux personnes.' },
        ],
      }),
      A('Prendre une conserve', { if: 'f:gardemanger_ouvert & !f:conserve_salon', danger: true, fx: ['set:conserve_salon', 'give:conserve'], text: 'Une boîte de plus ou de moins, qui le remarquera ?' }),
    ],
  },
  {
    id: 'office_salon', sec: 'salon', name: 'Office', sprite: 'drawer_cabinet', x: 404, y: 72, block: [16, 5],
    actions: [
      A('Ouvrir l\'office', { if: 'char:majordome', tag: 'storage' }),
      A('Examiner', { if: '!char:majordome', text: 'L\'office du majordome. Argenterie, nappes, et une odeur d\'encaustique.' }),
    ],
  },
  { id: 'lit_camp_office', sec: 'salon', name: 'Lit de camp', sprite: 'cot', x: 380, y: 106, visible: 'char:majordome', actions: [sleep()] },
  {
    id: 'secretaire', sec: 'salon', name: 'Secrétaire', sprite: 'secretary', x: 452, y: 72, block: [24, 6],
    actions: [
      A('Examiner', { text: 'Le secrétaire de Madame. Papier à lettres, cire rose, armoiries des Villiers.' }),
      A('Fouiller la correspondance', {
        if: '!f:secretaire_fouille', danger: true, time: 10,
        fx: ['set:secretaire_fouille', 'susp:villiers+1', 'entry:t_villiers_theo'],
        text: 'Une note de la main de Madame : « Le garçon de la maintenance pose trop de questions sur le garde-manger. À régler. » Daté d\'il y a quatre jours.',
      }),
    ],
  },
  { id: 'lit_madame', sec: 'salon', name: 'Lit', sprite: 'bed_lux', x: 490, y: 94, block: [40, 10], actions: [] },
];
