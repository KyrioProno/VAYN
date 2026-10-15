// Zone extérieure : la gare de Saint-Aubin et ses abords (expédition de l'aube, jour 2).
import type { ActionDef, DoorDef, ObjectDef, SectionDef, SpotDef, StripDef } from '../engine/types';

const A = (label: string, o: Partial<ActionDef> = {}): ActionDef => ({ label, ...o });

const SECTIONS: SectionDef[] = [
  { id: 'quai', name: 'Quai de Saint-Aubin', kind: 'outdoor', theme: 'platform', w: 440 },
  {
    id: 'hall', name: 'Hall de la gare', kind: 'building', theme: 'hall', w: 460,
    windows: [{ x: 60, w: 40 }, { x: 200, w: 40 }, { x: 350, w: 40 }],
    lamps: [
      { x: 80, y: 40, color: '#d8e4f0', r: 90, power: 0.55, kind: 'skylight' },
      { x: 220, y: 40, color: '#d8e4f0', r: 90, power: 0.55, kind: 'skylight' },
      { x: 370, y: 40, color: '#d8e4f0', r: 90, power: 0.5, kind: 'skylight' },
    ],
    decor: [
      { type: 'sign', x: 150, y: 16, v: 12 }, { type: 'clock', x: 290, y: 24 }, { type: 'poster', x: 120, y: 26, v: 1, w: 12, h: 16 },
      { type: 'crack', x: 250, y: 30 }, { type: 'holes', x: 420, y: 40 }, { type: 'graffiti', x: 30, y: 46, v: 3 },
    ],
  },
  { id: 'cour', name: 'Cour des marchandises', kind: 'outdoor', theme: 'yard', w: 480 },
  {
    id: 'depot', name: 'Dépôt des locomotives', kind: 'building', theme: 'depot', w: 540, dark: true,
    windows: [{ x: 70, w: 24 }, { x: 470, w: 24 }],
    lamps: [{ x: 130, y: 30, color: '#b8c8d8', r: 70, power: 0.4, kind: 'shaft' }],
    decor: [
      { type: 'hazard', x: 200, y: 18, w: 80 }, { type: 'pipe', x: 40, y: 30 }, { type: 'crack', x: 330, y: 40 },
      { type: 'sign', x: 400, y: 20, v: 13 }, { type: 'holes', x: 260, y: 26 }, { type: 'cable', x: 10, y: 15, w: 520 },
    ],
  },
  { id: 'talus', name: 'Talus de la voie', kind: 'outdoor', theme: 'embankment', w: 420 },
  {
    id: 'poste', name: 'Poste d\'aiguillage', kind: 'building', theme: 'signal', w: 380,
    windows: [{ x: 40, w: 50 }, { x: 150, w: 50 }, { x: 270, w: 50 }],
    lamps: [
      { x: 230, y: 50, color: '#ffb040', r: 80, power: 0.7, kind: 'lamp' },
      { x: 110, y: 34, color: '#ffd8a0', r: 90, power: 0.5, kind: 'bulb' },
    ],
    decor: [
      { type: 'sign', x: 190, y: 16, v: 14 }, { type: 'board', x: 330, y: 26, w: 24, h: 16 }, { type: 'clock', x: 250, y: 22 },
      { type: 'frame', x: 20, y: 24, v: 2 },
    ],
  },
];

const DOORS: DoorDef[] = [
  { id: 'x_quai_hall', name: 'Entrée du hall', kind: 'gangway', between: ['quai', 'hall'], y0: 76, y1: 104 },
  { id: 'x_hall_cour', name: 'Sortie vers la cour', kind: 'gangway', between: ['hall', 'cour'], y0: 76, y1: 104 },
  { id: 'x_cour_depot', name: 'Portail du dépôt', kind: 'gangway', between: ['cour', 'depot'], y0: 76, y1: 104 },
  { id: 'x_depot_talus', name: 'Brèche du dépôt', kind: 'gangway', between: ['depot', 'talus'], y0: 76, y1: 104 },
  { id: 'x_talus_poste', name: 'Porte du poste', kind: 'gangway', between: ['talus', 'poste'], y0: 76, y1: 104 },
];

const OBJECTS: ObjectDef[] = [
  // ================================================================ QUAI
  {
    id: 'portiere', sec: 'quai', name: 'Portière du VAYN', sprite: 'train_steps', x: 70, y: 70, block: [20, 4],
    important: 'has:relais_k3 | clock>=11:00',
    actions: [
      A('Remonter à bord', { tag: 'return' }),
    ],
  },
  { id: 'banc_quai', sec: 'quai', name: 'Banc', sprite: 'station_bench', x: 196, y: 74, actions: [A('Souffler un moment (15 min)', { time: 15, fx: ['stat:rest+4'], text: 'Le banc est humide de rosée. Au loin, le château d\'eau découpe le ciel.' })] },
  {
    id: 'bagages', sec: 'quai', name: 'Bagages abandonnés', sprite: 'luggage', x: 268, y: 102,
    actions: [
      A('Fouiller', { once: 'bagages_fouilles', time: 10, fx: ['give:bandage', 'give:tabac'], text: 'Une valise éventrée, des vêtements d\'enfant. Au fond, un bandage encore emballé et une blague de tabac.' }),
    ],
  },
  { id: 'panneau_gare', sec: 'quai', name: 'Panneau', sprite: 'station_sign', x: 340, y: 70, elev: 0, actions: [] },
  { id: 'lampadaire_quai', sec: 'quai', name: 'Lampadaire', sprite: 'lamp_post', x: 410, y: 72, actions: [] },
  // ================================================================ HALL
  {
    id: 'guichet', sec: 'hall', name: 'Guichet', sprite: 'ticket_counter', x: 96, y: 80, block: [58, 10],
    actions: [
      A('Fouiller le guichet', { once: 'guichet_fouille', time: 15, fx: ['give:piles', 'give:montre'], text: 'Derrière la vitre étoilée : des billets jamais vendus, une caisse vide… et une montre gousset arrêtée à 4 h 12, oubliée dans un tiroir.' }),
    ],
  },
  {
    id: 'pharmacie_gare', sec: 'hall', name: 'Armoire à pharmacie', sprite: 'pharmacy_cabinet', x: 206, y: 72, block: [20, 5],
    important: '!f:pharmacie_gare_ouverte',
    actions: [
      A('Examiner', { if: '!f:pharmacie_gare_ouverte', text: 'Une armoire métallique, croix verte écaillée, cadenassée. À travers la grille : des boîtes, intactes.' }),
      A('Forcer au pied-de-biche', {
        if: '!f:pharmacie_gare_ouverte & has:pied_de_biche', time: 10,
        fx: ['set:pharmacie_gare_ouverte', 'give:antibio', 'give:bandage', 'give:antidouleur', 'sfx:metal'],
        text: 'Le cadenas saute. Une boîte d\'antibiotiques, des bandages, des antidouleurs. Une fortune, ici.',
      }),
      A('Crocheter', {
        if: '!f:pharmacie_gare_ouverte & char:mecanicien & !has:pied_de_biche', tag: 'Technique', time: 15,
        fx: ['set:pharmacie_gare_ouverte', 'give:antibio', 'give:bandage', 'give:antidouleur'],
        text: 'Un cadenas de gare, rouillé jusqu\'au cœur. Il cède. Antibiotiques, bandages, antidouleurs.',
      }),
      A('Briser la grille à mains nues', {
        if: '!f:pharmacie_gare_ouverte & !has:pied_de_biche & !char:mecanicien', danger: true, time: 15,
        fx: ['set:pharmacie_gare_ouverte', 'give:antibio', 'give:bandage', 'stat:health-10', 'set:chiens_alertes'],
        text: 'Vous tirez, vous cognez, la grille finit par plier. Vos mains saignent, et le vacarme a dû porter loin. Mais la boîte d\'antibiotiques est à vous.',
      }),
    ],
  },
  {
    id: 'mur_messages', sec: 'hall', name: 'Mur des messages', sprite: 'message_wall', x: 320, y: 70, elev: 22,
    important: '!e:c_mur_messages',
    actions: [
      A('Lire les messages', {
        time: 10, fx: ['entry:c_mur_messages'],
        text: '« Maman, on est partis vers Port-Sel » — « Ne buvez pas l\'eau de la rivière » — et, d\'une écriture appliquée, daté du Jour 101 : « Clairval tient. Barrage. Quarante personnes. Venez par la vallée. Signé : J. Sorel-Arnaud. »',
      }),
    ],
  },
  { id: 'banc_hall', sec: 'hall', name: 'Banc', sprite: 'station_bench', x: 420, y: 76, actions: [] },
  { id: 'gravats_hall', sec: 'hall', name: 'Gravats', sprite: 'rubble', x: 250, y: 106, block: [30, 6], actions: [] },
  // ================================================================ COUR
  { id: 'grue_eau', sec: 'cour', name: 'Grue à eau', sprite: 'water_crane', x: 40, y: 76, actions: [] },
  {
    id: 'chateau_eau', sec: 'cour', name: 'Château d\'eau', sprite: 'water_tower', x: 132, y: 78, block: [40, 8],
    important: 'has:jerrican',
    actions: [
      A('Remplir le jerrican (15 min)', {
        if: 'has:jerrican', time: 15, fx: ['take:jerrican', 'give:jerrican_plein'],
        text: 'Le robinet crache une eau brune, puis claire. Vingt litres. Le jerrican pèse soudain très lourd.',
      }),
      A('Examiner', { if: '!has:jerrican', text: 'La cuve est encore à moitié pleine. Avec un jerrican, on pourrait rapporter de l\'eau au train.' }),
    ],
  },
  {
    id: 'draisine', sec: 'cour', name: 'Draisine', sprite: 'draisine', x: 300, y: 98, block: [44, 8],
    actions: [
      A('Examiner', { if: '!f:draisine_ok', text: 'Une draisine à bras, en état — sauf le pignon de transmission, absent. Avec elle, on pourrait rattraper un train lent.' }),
      A('Monter le pignon', { if: 'has:pignon & !f:draisine_ok', time: 20, fx: ['take:pignon', 'set:draisine_ok', 'sfx:repair'], text: 'Le pignon s\'emboîte, la chaîne se tend. La draisine est prête.' }),
      A('Examiner', { if: 'f:draisine_ok', text: 'La draisine est prête. Si le train part sans vous, elle sera votre dernière chance.' }),
    ],
  },
  {
    id: 'epave', sec: 'cour', name: 'Épave de voiture', sprite: 'car_wreck', x: 410, y: 102, block: [56, 8],
    actions: [
      A('Fouiller la boîte à gants', { once: 'epave_fouillee', time: 10, fx: ['give:masque'], text: 'Une carte routière, un paquet de mouchoirs… et un masque filtrant encore sous plastique.' }),
    ],
  },
  { id: 'os', sec: 'cour', name: 'Ossements', sprite: 'bones', x: 220, y: 108, actions: [A('Examiner', { text: 'Des os rongés. Des chiens — beaucoup de chiens.' })] },
  { id: 'tonneau', sec: 'cour', name: 'Tonneau', sprite: 'barrel', x: 460, y: 74, actions: [] },
  // ================================================================ DÉPÔT
  {
    id: 'traces', sec: 'depot', name: 'Traces', sprite: 'rubble', x: 170, y: 104,
    important: '!e:c_traces_theo',
    actions: [
      A('Examiner', {
        time: 5, fx: ['entry:c_traces_theo', 'obj:q_main.theo'],
        text: 'Du sang séché sur le béton. Une lampe frontale brisée — celle de Théo, son nom est gravé dessus. Des traces de pas irrégulières repartent vers l\'est, vers le talus.',
      }),
    ],
  },
  {
    id: 'poutre', sec: 'depot', name: 'Poutre affaissée', sprite: 'beam_sag', x: 262, y: 112, block: [24, 46], visible: '!obj:poutre=etayee & !obj:poutre=tombee',
    important: 'true',
    actions: [
      A('Examiner', { text: 'Une poutre maîtresse s\'est affaissée, retenue par un tas de gravats. Passer dessous, c\'est parier sur la patience du béton.' }),
      A('Étayer avec le cric (20 min)', { if: 'has:cric', time: 20, fx: ['objst:poutre=etayee', 'sfx:metal'], text: 'Le cric grince, la poutre remonte de quelques centimètres et se cale. Le passage est sûr.' }),
      A('Étayer avec Vasseur (15 min)', { if: 'comp:vasseur & !has:cric', time: 15, fx: ['objst:poutre=etayee', 'trust:vasseur+1'], text: 'Vasseur jauge la poutre, glisse deux traverses, cale le tout d\'un coup d\'épaule. « Passe. Je tiens. »' }),
      A('Laisser Noé se faufiler', { if: 'comp:noe', danger: true, time: 10, fx: ['objst:poutre=tombee', 'cstat:comp-35', 'set:noe_blesse'], text: 'Noé se glisse dessous avant que vous puissiez dire quoi que ce soit. La poutre craque, s\'effondre derrière lui. Il ressort en boitant, blanc comme un linge, mais il ressort.' }),
      A('Passer dessous (risqué)', { if: '!comp:noe', danger: true, time: 5, fx: ['objst:poutre=tombee', 'stat:health-18'], text: 'Vous rampez. La poutre gémit, un bloc de béton vous heurte l\'épaule. Derrière vous, tout s\'effondre dans un nuage de poussière. Vous êtes passé — de justesse.' }),
    ],
  },
  { id: 'poutre_ok', sec: 'depot', name: 'Poutre étayée', sprite: 'beam_braced', x: 262, y: 112, visible: 'obj:poutre=etayee', actions: [] },
  { id: 'poutre_tombee', sec: 'depot', name: 'Gravats', sprite: 'rubble', x: 262, y: 110, visible: 'obj:poutre=tombee', actions: [] },
  {
    id: 'armoire_k', sec: 'depot', name: 'Armoire de relais', x: 430, y: 72, block: [24, 5],
    sprite: [{ if: 'obj:armoire_k=ouverte', sprite: 'relay_cabinet_open' }, { if: 'true', sprite: 'relay_cabinet' }],
    important: '!obj:armoire_k=ouverte',
    actions: [
      A('Ouvrir l\'armoire', {
        if: '!obj:armoire_k=ouverte', time: 10,
        fx: ['objst:armoire_k=ouverte', 'entry:c_armoire_k', 'give:relais_k3', 'entry:f_depot'],
        text: 'Une armoire de signalisation, intacte. Dans sa graisse, un relais K3 — et deux autres, grillés. Vous emballez le bon dans un chiffon comme un objet sacré.',
      }),
    ],
  },
  {
    id: 'etabli_depot', sec: 'depot', name: 'Établi du dépôt', sprite: 'workbench', x: 360, y: 76, block: [54, 9],
    actions: [
      A('Fouiller', { once: 'etabli_depot_fouille', time: 15, fx: ['give:pignon', 'res:parts+1'], text: 'Des outils rouillés, des boîtes de boulons… et un pignon denté graissé, étiqueté « draisine ». Quelques pièces récupérables, aussi.' }),
    ],
  },
  { id: 'caisses_depot', sec: 'depot', name: 'Caisses', sprite: 'crate_stack', x: 70, y: 80, block: [38, 8], actions: [A('Fouiller', { once: 'caisses_depot', time: 15, fx: ['res:parts+2'], text: 'Des roulements, des fusibles, des durites. Ça fera deux bons lots de pièces pour l\'atelier.' })] },
  { id: 'gravats_depot', sec: 'depot', name: 'Gravats', sprite: 'rubble', x: 500, y: 104, actions: [] },
  // ================================================================ TALUS
  {
    id: 'chiens', sec: 'talus', name: 'Meute de chiens', sprite: 'dogs', x: 210, y: 112, block: [40, 46], visible: '!f:chiens_partis',
    important: 'true',
    actions: [
      A('Observer', { text: 'Cinq chiens maigres, couchés en travers du talus. Le plus gros vous fixe. Ils ne sont pas encore agressifs. Pas encore.' }),
      A('Leur jeter une ration', { if: 'has:ration', time: 5, fx: ['take:ration', 'set:chiens_partis'], text: 'Vous lancez la ration loin sur la gauche. La meute s\'y précipite en grondant. Le passage est libre.' }),
      A('Leur jeter une conserve ouverte', { if: 'has:conserve & !has:ration', time: 5, fx: ['take:conserve', 'set:chiens_partis'], text: 'L\'odeur des haricots suffit. Les chiens se battent pour la boîte. Vous passez.' }),
      A('Laisser Mara faire', { if: 'comp:mara', time: 5, fx: ['set:chiens_partis', 'trust:mara+1'], text: 'Mara s\'accroupit et siffle doucement, trois notes. Le gros chien remue la queue. « Ils me connaissent. Je suis passée par ici, il y a dix jours. »' }),
      A('Laisser Castel les disperser', { if: 'comp:castel', time: 5, fx: ['set:chiens_partis', 'set:coup_de_feu'], text: 'Castel tire en l\'air. La meute détale dans les fourrés. L\'écho roule longtemps sur la vallée.' }),
      A('Attendre qu\'ils s\'éloignent (45 min)', { time: 45, fx: ['set:chiens_partis'], text: 'Vous attendez, immobile, le cœur battant. La meute finit par se lever et disparaître vers les bois. Le temps, lui, a filé.' }),
      A('Forcer le passage', { danger: true, time: 5, fx: ['set:chiens_partis', 'stat:health-22', 'cstat:comp-20'], text: 'Vous foncez en criant. Les chiens attaquent. Des crocs, du sang, puis la meute recule enfin. Vous êtes passé, à quel prix.' }),
    ],
  },
  { id: 'cloture', sec: 'talus', name: 'Clôture', sprite: 'fence', x: 330, y: 70, actions: [] },
  { id: 'buisson1', sec: 'talus', name: 'Buisson', sprite: 'bush', x: 90, y: 74, actions: [] },
  { id: 'buisson2', sec: 'talus', name: 'Buisson', sprite: 'bush', x: 380, y: 110, actions: [] },
  { id: 'signal_talus', sec: 'talus', name: 'Signal', x: 40, y: 72, sprite: [{ if: 'f:signal_rouge', sprite: 'signal_mast_red' }, { if: 'true', sprite: 'signal_mast' }], actions: [] },
  // ================================================================ POSTE D'AIGUILLAGE
  {
    id: 'leviers', sec: 'poste', name: 'Leviers d\'aiguillage', sprite: 'signal_levers', x: 96, y: 78, block: [58, 8],
    actions: [
      A('Examiner', { text: 'Des leviers à main, numérotés. Le n° 4 commande le signal de la voie principale.' }),
      A('Mettre le signal au rouge', {
        if: 'f:anselme_accord & !f:signal_rouge', time: 5,
        fx: ['set:signal_rouge', 'conseq:cq_signal_rouge', 'sfx:lever'],
        text: 'Anselme pose sa main sur la vôtre. Ensemble, vous tirez le levier n° 4. Au loin, le signal bascule au rouge. Le VAYN s\'arrêtera ici.',
      }),
      A('Mettre le signal au rouge', { if: '!f:anselme_accord & !f:signal_rouge', text: 'Anselme pose le canon de son fusil sur le levier. « Pas sans moi, et pas sans raison. »' }),
    ],
  },
  {
    id: 'recepteur', sec: 'poste', name: 'Récepteur radio', sprite: 'receiver', x: 226, y: 78, block: [28, 6],
    important: '!e:c_emission_clairval',
    actions: [
      A('Écouter', {
        time: 10, fx: ['entry:c_emission_clairval'],
        text: 'Une voix d\'homme, enregistrée, tourne en boucle : « Ici Clairval, barrage. Nous sommes quarante. Venez par la vallée… Jour 96. » Puis un silence, puis la boucle recommence. Rien de plus récent que le Jour 96.',
      }),
    ],
  },
  { id: 'lit_theo', sec: 'poste', name: 'Lit de camp', sprite: 'cot', x: 316, y: 98, actions: [] },
];

const SPOTS: SpotDef[] = [
  { id: 'q_arrivee', sec: 'quai', x: 90, y: 92, face: 1 },
  { id: 'q_banc', sec: 'quai', x: 196, y: 84, face: 1 },
  { id: 'h_centre', sec: 'hall', x: 230, y: 96, face: 1 },
  { id: 'y_chateau', sec: 'cour', x: 140, y: 94, face: 1 },
  { id: 'dp_entree', sec: 'depot', x: 60, y: 96, face: 1 },
  { id: 't_entree', sec: 'talus', x: 60, y: 92, face: 1 },
  { id: 'p_leviers', sec: 'poste', x: 120, y: 92, face: 1 },
  { id: 'p_lit', sec: 'poste', x: 316, y: 98, face: -1, pose: 'lie' },
  { id: 'p_coin', sec: 'poste', x: 270, y: 104, face: -1 },
];

export const EXTERIOR: StripDef = { id: 'exterior', sections: SECTIONS, doors: DOORS, objects: OBJECTS, spots: SPOTS, gap: 10 };
