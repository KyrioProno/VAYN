// Géométrie du train VAYN : 8 voitures, de la tête (gauche) à la queue (droite).
import type { ActionDef, DoorDef, SectionDef, SpotDef } from '../engine/types';

const A = (label: string, o: Partial<ActionDef> = {}): ActionDef => ({ label, ...o });

const WARM = '#ffc27a';
const COLD = '#cfe4ff';
const GOLD = '#ffd08a';

export const TRAIN_SECTIONS: SectionDef[] = [
  {
    id: 'machines', name: 'Voiture des machines', kind: 'wagon', theme: 'engine', w: 520,
    rooms: [{ x0: 0, x1: 124, name: 'Cabine de conduite' }, { x0: 124, x1: 520, name: 'Salle des machines' }],
    windows: [{ x: 22, w: 36 }, { x: 70, w: 30 }, { x: 300, w: 22 }],
    lamps: [
      { x: 60, y: 40, color: '#9fe0c0', r: 70, power: 0.5, kind: 'screen' },
      { x: 190, y: 30, color: WARM, r: 110, power: 0.9, kind: 'cage', energyDim: true },
      { x: 330, y: 30, color: COLD, r: 110, power: 0.8, kind: 'cage', energyDim: true, flicker: true },
      { x: 460, y: 30, color: WARM, r: 100, power: 0.8, kind: 'cage', energyDim: true },
    ],
    decor: [
      { type: 'cagelamp', x: 190, y: 22 }, { type: 'cagelamp', x: 330, y: 22 }, { type: 'cagelamp', x: 460, y: 22 },
      { type: 'gauge', x: 140, y: 34 }, { type: 'gauge', x: 150, y: 44 },
      { type: 'pipe', x: 132, y: 40 }, { type: 'pipe', x: 286, y: 30 }, { type: 'pipe', x: 512, y: 50 },
      { type: 'sign', x: 404, y: 24, v: 2 }, { type: 'vent', x: 440, y: 40 }, { type: 'hazard', x: 230, y: 18, w: 40 },
      { type: 'board', x: 30, y: 52, w: 20, h: 8 },
    ],
  },
  {
    id: 'atelier', name: 'Voiture atelier', kind: 'wagon', theme: 'workshop', w: 440,
    windows: [{ x: 240, w: 30 }, { x: 330, w: 30 }],
    lamps: [
      { x: 90, y: 30, color: WARM, r: 110, power: 1, kind: 'cage', energyDim: true },
      { x: 250, y: 30, color: WARM, r: 100, power: 0.75, kind: 'cage', energyDim: true },
      { x: 390, y: 34, color: '#ffb060', r: 70, power: 0.6, kind: 'bulb' },
    ],
    decor: [
      { type: 'cagelamp', x: 90, y: 22 }, { type: 'cagelamp', x: 250, y: 22 },
      { type: 'sign', x: 160, y: 18, v: 6 }, { type: 'hooks', x: 290, y: 40 },
      { type: 'shelf', x: 370, y: 40, w: 30 }, { type: 'poster', x: 404, y: 22, v: 1, w: 12, h: 15 },
      { type: 'graffiti', x: 150, y: 48, v: 1 },
    ],
  },
  {
    id: 'infirmerie', name: 'Voiture infirmerie', kind: 'wagon', theme: 'medical', w: 440,
    rooms: [{ x0: 0, x1: 300, name: 'Salle de soins' }, { x0: 300, x1: 440, name: 'Bureau de la docteure' }],
    windows: [{ x: 96, w: 30 }, { x: 184, w: 30 }, { x: 360, w: 26 }],
    lamps: [
      { x: 80, y: 28, color: COLD, r: 110, power: 0.9, kind: 'tube', energyDim: true },
      { x: 220, y: 28, color: COLD, r: 110, power: 0.85, kind: 'tube', energyDim: true, flicker: true },
      { x: 385, y: 50, color: '#ffe6b0', r: 70, power: 0.7, kind: 'desk' },
    ],
    decor: [
      { type: 'tube', x: 80, y: 18 }, { type: 'tube', x: 220, y: 18 }, { type: 'cross', x: 40, y: 26 },
      { type: 'sign', x: 240, y: 46, v: 3 }, { type: 'frame', x: 320, y: 26, v: 0 }, { type: 'shelf', x: 400, y: 34, w: 24 },
      { type: 'clock', x: 280, y: 26 },
    ],
  },
  {
    id: 'cantine', name: 'Voiture cantine', kind: 'wagon', theme: 'canteen', w: 520,
    windows: [{ x: 196, w: 28 }, { x: 284, w: 28 }, { x: 372, w: 28 }, { x: 460, w: 28 }],
    lamps: [
      { x: 70, y: 32, color: WARM, r: 120, power: 1, kind: 'bulb', energyDim: true },
      { x: 240, y: 30, color: WARM, r: 110, power: 0.85, kind: 'bulb', energyDim: true },
      { x: 400, y: 30, color: WARM, r: 120, power: 0.9, kind: 'bulb', energyDim: true },
      { x: 480, y: 50, color: '#ffa860', r: 60, power: 0.7, kind: 'candle', flicker: true },
    ],
    decor: [
      { type: 'sign', x: 120, y: 16, v: 5 }, { type: 'clock', x: 160, y: 30 }, { type: 'graffiti', x: 330, y: 52, v: 2 },
      { type: 'cable', x: 10, y: 15, w: 500 }, { type: 'poster', x: 430, y: 24, v: 3, w: 12, h: 16 },
    ],
  },
  {
    id: 'soute', name: 'Voiture soute', kind: 'wagon', theme: 'cargo', w: 480,
    windows: [{ x: 150, w: 22 }, { x: 330, w: 22 }],
    lamps: [
      { x: 110, y: 30, color: WARM, r: 100, power: 0.8, kind: 'cage', energyDim: true },
      { x: 300, y: 30, color: WARM, r: 90, power: 0.6, kind: 'cage', energyDim: true, flicker: true },
    ],
    decor: [
      { type: 'cagelamp', x: 110, y: 22 }, { type: 'cagelamp', x: 300, y: 22 }, { type: 'sign', x: 220, y: 18, v: 9 },
      { type: 'graffiti', x: 380, y: 30, v: 4 }, { type: 'hazard', x: 20, y: 56, w: 60 },
    ],
    blocks: [],
  },
  {
    id: 'dortoirs', name: 'Voiture dortoirs', kind: 'wagon', theme: 'dorm', w: 480,
    windows: [{ x: 30, w: 26 }, { x: 130, w: 26 }, { x: 230, w: 26 }, { x: 410, w: 26 }],
    lamps: [
      { x: 90, y: 34, color: WARM, r: 90, power: 0.7, kind: 'bulb', energyDim: true },
      { x: 250, y: 34, color: WARM, r: 90, power: 0.6, kind: 'bulb', energyDim: true },
      { x: 440, y: 60, color: '#ff9a50', r: 70, power: 0.8, kind: 'stove', flicker: true },
      { x: 300, y: 50, color: '#c99cff', r: 50, power: 0.45, kind: 'grow' },
    ],
    decor: [
      { type: 'sign', x: 180, y: 16, v: 10 }, { type: 'frame', x: 330, y: 22, v: 2 }, { type: 'graffiti', x: 64, y: 52, v: 0 },
      { type: 'poster', x: 360, y: 20, v: 0, w: 12, h: 15 }, { type: 'hooks', x: 196, y: 40 },
    ],
  },
  {
    id: 'admin', name: 'Voiture administrative', kind: 'wagon', theme: 'office', w: 520,
    rooms: [
      { x0: 0, x1: 210, name: 'Bureau du Contrôle' },
      { x0: 210, x1: 390, name: 'Poste de sécurité' },
      { x0: 390, x1: 520, name: 'Salle radio' },
    ],
    windows: [{ x: 120, w: 28 }, { x: 260, w: 26 }, { x: 430, w: 26 }],
    lamps: [
      { x: 100, y: 52, color: '#d8f0b0', r: 80, power: 0.75, kind: 'desk' },
      { x: 60, y: 30, color: WARM, r: 90, power: 0.6, kind: 'bulb', energyDim: true },
      { x: 300, y: 30, color: WARM, r: 100, power: 0.7, kind: 'bulb', energyDim: true },
      { x: 460, y: 50, color: '#ffb040', r: 70, power: 0.6, kind: 'screen' },
    ],
    decor: [
      { type: 'sign', x: 70, y: 16, v: 7 }, { type: 'clock', x: 190, y: 28 }, { type: 'frame', x: 20, y: 22, v: 1 },
      { type: 'board', x: 230, y: 24, w: 24, h: 14 }, { type: 'poster', x: 360, y: 22, v: 2, w: 12, h: 16 },
      { type: 'vent', x: 480, y: 22 }, { type: 'holes', x: 330, y: 30 },
    ],
  },
  {
    id: 'salon', name: 'Voiture salon', kind: 'wagon', theme: 'salon', w: 520,
    rooms: [
      { x0: 0, x1: 334, name: 'Salon' },
      { x0: 334, x1: 420, name: 'Garde-manger' },
      { x0: 420, x1: 520, name: 'Cabine de Madame' },
    ],
    windows: [{ x: 40, w: 30 }, { x: 136, w: 30 }, { x: 232, w: 30 }, { x: 460, w: 26 }],
    lamps: [
      { x: 104, y: 32, color: GOLD, r: 100, power: 1, kind: 'sconce' },
      { x: 200, y: 32, color: GOLD, r: 100, power: 1, kind: 'sconce' },
      { x: 296, y: 32, color: GOLD, r: 90, power: 0.9, kind: 'sconce' },
      { x: 470, y: 48, color: '#ffc0a0', r: 70, power: 0.7, kind: 'lamp' },
    ],
    decor: [
      { type: 'sconce', x: 104, y: 28 }, { type: 'sconce', x: 200, y: 28 }, { type: 'sconce', x: 296, y: 28 },
      { type: 'column', x: 88 }, { type: 'column', x: 184 }, { type: 'column', x: 280 },
      { type: 'frame', x: 10, y: 26, v: 0, w: 18, h: 13 }, { type: 'mirror', x: 436, y: 24 }, { type: 'sign', x: 370, y: 16, v: 8 },
      { type: 'holes', x: 160, y: 46 },
    ],
  },
];

/** Cloisons internes et intercirculations. */
export const TRAIN_DOORS: DoorDef[] = [
  { id: 'd_cabine', name: 'Porte de la cabine', kind: 'partition', sec: 'machines', x: 124, y0: 80, y1: 100, locked: true, lockedText: 'Verrouillée. Une plaque : « Accès réservé — Contrôle ».',
    actions: [
      A('Ouvrir avec le passe du Contrôle', { if: 'has:passe_controle', fx: ['unlock:d_cabine'], text: 'Le passe tourne dans la serrure. La cabine sent l\'huile froide et le café renversé.' }),
      A('Crocheter', { if: 'char:mecanicien & !has:passe_controle', tag: 'Technique', time: 15, fx: ['unlock:d_cabine', 'susp:castel+1'], text: 'Une serrure de sûreté, mais fatiguée. Quinze minutes et un tournevis tordu plus tard, elle cède.' }),
    ],
  },
  { id: 'g_machines_atelier', name: 'Intercirculation', kind: 'gangway', between: ['machines', 'atelier'], y0: 74, y1: 104 },
  { id: 'g_atelier_infirmerie', name: 'Intercirculation', kind: 'gangway', between: ['atelier', 'infirmerie'], y0: 74, y1: 104 },
  { id: 'd_bureau_sorel', name: 'Porte du bureau', kind: 'partition', sec: 'infirmerie', x: 300, y0: 80, y1: 100 },
  { id: 'g_infirmerie_cantine', name: 'Intercirculation', kind: 'gangway', between: ['infirmerie', 'cantine'], y0: 74, y1: 104 },
  { id: 'g_cantine_soute', name: 'Intercirculation', kind: 'gangway', between: ['cantine', 'soute'], y0: 74, y1: 104 },
  {
    id: 'd_cage', name: 'Grille de la réserve', kind: 'gate', sec: 'soute', y0: 0, y1: 0, locked: true,
    gate: { x0: 14, x1: 360, y: 87, gx0: 196, gx1: 222 },
    lockedText: 'Cadenas lourd. La réserve est sous la clé de l\'intendance.',
    actions: [
      A('Ouvrir avec la clé', { if: 'has:cle_reserve', fx: ['unlock:d_cage'], text: 'Le cadenas s\'ouvre. La grille grince sur son rail.' }),
      A('Crocheter le cadenas', { if: 'char:mecanicien & !has:cle_reserve', tag: 'Technique', time: 15, danger: true, fx: ['unlock:d_cage', 'susp:marchetti+1'], text: 'Le cadenas est solide, la charnière beaucoup moins. Vous démontez la charnière.' }),
      A('Se faufiler par le haut', { if: 'char:passager & !has:cle_reserve', tag: 'Discret', time: 10, danger: true, fx: ['unlock:d_cage', 'susp:marchetti+1'], text: 'Le grillage ne monte pas jusqu\'au plafond. Vous passez par-dessus et ouvrez le loquet de l\'intérieur.' }),
      A('Attendre la tournée de Rosa', { if: '!has:cle_reserve & clock<11:00', text: 'Rosa descend chercher les rations vers 11:00. La grille restera ouverte une demi-heure.' }),
    ],
  },
  { id: 'g_soute_dortoirs', name: 'Intercirculation', kind: 'gangway', between: ['soute', 'dortoirs'], y0: 74, y1: 104 },
  { id: 'g_dortoirs_admin', name: 'Intercirculation', kind: 'gangway', between: ['dortoirs', 'admin'], y0: 74, y1: 104 },
  { id: 'd_securite', name: 'Porte du poste de sécurité', kind: 'partition', sec: 'admin', x: 210, y0: 80, y1: 100 },
  { id: 'd_radio', name: 'Porte de la salle radio', kind: 'partition', sec: 'admin', x: 390, y0: 80, y1: 100, locked: true, lockedText: 'Fermée à clé. Castel garde la clé sur lui.',
    actions: [
      A('Ouvrir avec la clé', { if: 'has:cle_radio', fx: ['unlock:d_radio'], text: 'La clé de Castel tourne sans un bruit.' }),
      A('Crocheter', { if: 'char:mecanicien & !has:cle_radio & !at:castel=ad_securite', tag: 'Technique', time: 15, danger: true, fx: ['unlock:d_radio', 'susp:castel+1'], text: 'Castel n\'est pas à son poste. La serrure cède au bout de quinze longues minutes.' }),
      A('Crocheter', { if: 'char:mecanicien & !has:cle_radio & at:castel=ad_securite', tag: 'Technique', text: 'Pas sous le nez de Castel. Revenez quand il ne sera pas à son bureau.' }),
    ],
  },
  { id: 'g_admin_salon', name: 'Intercirculation', kind: 'gangway', between: ['admin', 'salon'], y0: 74, y1: 104 },
  { id: 'd_gardemanger', name: 'Porte du garde-manger', kind: 'partition', sec: 'salon', x: 334, y0: 80, y1: 100, locked: true, lockedText: 'Une serrure de laiton. Fermée.',
    actions: [
      A('Ouvrir avec les clés du Salon', { if: 'has:cles_salon', fx: ['unlock:d_gardemanger'], text: 'La serrure de laiton cède avec un déclic familier.' }),
      A('Crocheter', { if: 'char:mecanicien & !has:cles_salon & !at:josefa=sa_porte', tag: 'Technique', time: 10, danger: true, fx: ['unlock:d_gardemanger', 'susp:villiers+1'], text: 'Une serrure de meuble ancien. Personne ne regarde : elle cède.' }),
      A('Crocheter', { if: 'char:mecanicien & !has:cles_salon & at:josefa=sa_porte', tag: 'Technique', text: 'Josefa monte la garde à l\'entrée du Salon. Pas maintenant.' }),
    ],
  },
  { id: 'd_cabine_madame', name: 'Porte de la cabine de Madame', kind: 'partition', sec: 'salon', x: 420, y0: 80, y1: 100, locked: true, lockedText: 'Cabine privée. On ne frappe pas sans être annoncé.',
    actions: [
      A('Frapper', { if: 'at:villiers=sa_cabine', dlg: 'villiers' }),
      A('Entrer (clés du Salon)', { if: 'has:cles_salon', fx: ['unlock:d_cabine_madame'], text: 'Vous entrez sans bruit, comme toujours.' }),
    ],
  },
];

/** Points de positionnement des PNJ et du joueur. */
export const TRAIN_SPOTS: SpotDef[] = [
  // machines
  { id: 'm_turbine', sec: 'machines', x: 250, y: 96, face: -1 },
  { id: 'm_filtration', sec: 'machines', x: 360, y: 88, face: 1 },
  { id: 'm_pompe', sec: 'machines', x: 452, y: 102, face: -1 },
  { id: 'm_cabine', sec: 'machines', x: 70, y: 96, face: -1 },
  // atelier
  { id: 'a_etabli', sec: 'atelier', x: 96, y: 84, face: -1 },
  { id: 'a_etagere', sec: 'atelier', x: 186, y: 84, face: -1 },
  { id: 'a_couchette', sec: 'atelier', x: 360, y: 104, face: -1 },
  { id: 'a_start', sec: 'atelier', x: 140, y: 96, face: 1 },
  // infirmerie
  { id: 'i_lit_lou', sec: 'infirmerie', x: 92, y: 92, face: -1 },
  { id: 'i_soins', sec: 'infirmerie', x: 170, y: 92, face: -1 },
  { id: 'i_bureau', sec: 'infirmerie', x: 380, y: 92, face: -1 },
  { id: 'i_lit_vide', sec: 'infirmerie', x: 212, y: 80, face: 1, pose: 'lie' },
  // cantine
  { id: 'c_comptoir', sec: 'cantine', x: 70, y: 72, face: 1 },
  { id: 'c_table1', sec: 'cantine', x: 300, y: 84, face: 1, pose: 'sit' },
  { id: 'c_table2', sec: 'cantine', x: 340, y: 84, face: -1, pose: 'sit' },
  { id: 'c_table3', sec: 'cantine', x: 410, y: 84, face: 1, pose: 'sit' },
  { id: 'c_table4', sec: 'cantine', x: 450, y: 84, face: -1, pose: 'sit' },
  { id: 'c_stand', sec: 'cantine', x: 490, y: 90, face: -1 },
  { id: 'c_fontaine', sec: 'cantine', x: 160, y: 98, face: 1 },
  { id: 'c_tableau', sec: 'cantine', x: 226, y: 96, face: -1 },
  { id: 'c_queue1', sec: 'cantine', x: 120, y: 100, face: -1 },
  { id: 'c_queue2', sec: 'cantine', x: 140, y: 104, face: -1 },
  // soute
  { id: 's_reserve', sec: 'soute', x: 300, y: 76, face: -1 },
  { id: 's_couloir', sec: 'soute', x: 240, y: 100, face: 1 },
  { id: 's_cache', sec: 'soute', x: 440, y: 80, face: -1 },
  { id: 's_grille', sec: 'soute', x: 209, y: 98, face: -1 },
  // dortoirs
  { id: 'd_couchette_sacha', sec: 'dortoirs', x: 150, y: 96, face: 1 },
  { id: 'd_coin_noe', sec: 'dortoirs', x: 96, y: 104, face: 1 },
  { id: 'd_poele', sec: 'dortoirs', x: 430, y: 92, face: 1 },
  { id: 'd_table', sec: 'dortoirs', x: 390, y: 104, face: 1 },
  { id: 'd_hydro', sec: 'dortoirs', x: 300, y: 90, face: -1 },
  { id: 'd_lit1', sec: 'dortoirs', x: 60, y: 92, face: 1 },
  // administration
  { id: 'ad_bureau', sec: 'admin', x: 110, y: 94, face: -1 },
  { id: 'ad_carte', sec: 'admin', x: 160, y: 90, face: -1 },
  { id: 'ad_securite', sec: 'admin', x: 250, y: 94, face: 1 },
  { id: 'ad_cellule', sec: 'admin', x: 330, y: 84, face: 1 },
  { id: 'ad_cellule_garde', sec: 'admin', x: 300, y: 104, face: 1 },
  { id: 'ad_radio', sec: 'admin', x: 450, y: 92, face: -1 },
  // salon
  { id: 'sa_fauteuil', sec: 'salon', x: 190, y: 86, face: -1, pose: 'sit' },
  { id: 'sa_bar', sec: 'salon', x: 70, y: 94, face: -1 },
  { id: 'sa_piano', sec: 'salon', x: 290, y: 92, face: -1 },
  { id: 'sa_salon', sec: 'salon', x: 130, y: 100, face: 1 },
  { id: 'sa_gardemanger', sec: 'salon', x: 376, y: 94, face: -1 },
  { id: 'sa_cabine', sec: 'salon', x: 470, y: 96, face: -1 },
  { id: 'sa_porte', sec: 'salon', x: 316, y: 98, face: 1 },
];
