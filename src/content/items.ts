import type { ItemDef } from '../engine/types';

// Icônes : glyphes simples rendus dans l'interface (pas de fichiers externes).
export const ITEMS: Record<string, ItemDef> = {
  // --- Nourriture & eau
  ration: { id: 'ration', name: 'Ration', cat: 'food', weight: 0.5, value: 6, icon: '▤', desc: 'Pain dense, pâte de lentilles, un carré de sucre. Ça cale.', use: { label: 'Manger', fx: ['stat:satiety+30', 'stat:hydration+4'], text: 'Vous mangez lentement, pour faire durer.' } },
  eau: { id: 'eau', name: 'Gourde d\'eau', cat: 'food', weight: 1, value: 8, icon: '◍', desc: 'Un litre d\'eau filtrée. Précieux depuis l\'arrêt de la filtration.', use: { label: 'Boire', fx: ['stat:hydration+35'], text: 'L\'eau a un léger goût de métal.' } },
  conserve: { id: 'conserve', name: 'Conserve', cat: 'food', weight: 0.6, value: 7, icon: '▣', desc: 'Haricots, étiquette en polonais. Date illisible.', use: { label: 'Manger', fx: ['stat:satiety+26', 'stat:hydration+6'], text: 'Froids, mais nourrissants.' } },
  cafe: { id: 'cafe', name: 'Café noir', cat: 'food', weight: 0.2, value: 6, icon: '☕', desc: 'Un thermos de vrai café. Qui sait d\'où il vient.', use: { label: 'Boire', fx: ['stat:rest+12', 'stat:hydration+6'], text: 'Le monde redevient net pendant un moment.' } },
  // --- Médicaments
  bandage: { id: 'bandage', name: 'Bandage', cat: 'meds', weight: 0.2, value: 6, icon: '✚', desc: 'Gaze propre et sparadrap. Arrête un saignement, protège une plaie.', use: { label: 'Se soigner', fx: ['stat:health+16'], text: 'Vous serrez le bandage. Ça tiendra.' } },
  bandage_comp: { id: 'bandage_comp', name: 'Trousse de secours', cat: 'meds', weight: 0.4, value: 12, icon: '✜', desc: 'De quoi panser une vraie blessure — la vôtre ou celle d\'un compagnon.', use: { label: 'Soigner le compagnon', target: 'comp', fx: ['cstat:comp+30'], text: 'Vous refaites le pansement. Il grimace, mais tient debout.' } },
  antidouleur: { id: 'antidouleur', name: 'Antidouleurs', cat: 'meds', weight: 0.1, value: 10, icon: '◊', desc: 'Quatre comprimés. Masquent la douleur, pas la fatigue.', use: { label: 'Prendre', fx: ['stat:health+8', 'stat:rest-4'], text: 'La douleur recule derrière un voile.' } },
  antibio: { id: 'antibio', name: 'Antibiotiques', cat: 'meds', weight: 0.1, value: 30, icon: '✦', desc: 'Une boîte d\'amoxicilline entamée. Ici, ça vaut une vie.' },
  // --- Outils
  lampe: {
    id: 'lampe', name: 'Lampe torche', cat: 'tools', weight: 0.6, value: 10, icon: '◐',
    desc: 'Dynamo à manivelle. Indispensable dans le noir — éteinte, elle n’éclaire rien.',
    // Le libellé est lu avant l’effet, le texte après : les deux sont donc conditionnés à l’état *final*.
    use: {
      label: [{ if: 'f:lampe_on', text: 'Éteindre la lampe' }, { if: 'true', text: 'Allumer la lampe' }],
      fx: ['toggle:lampe_on'],
      text: [
        { if: 'f:lampe_on', text: 'La manivelle accroche, le faisceau repart. Le dépôt, ses armoires, tout vous revient d’un coup.' },
        { if: 'true', text: 'Vous coupez le faisceau. Le noir du dépôt vous reprend tout de suite.' },
      ],
    },
  },
  pied_de_biche: { id: 'pied_de_biche', name: 'Pied-de-biche', cat: 'tools', weight: 2, value: 10, icon: '⟋', desc: 'Ouvre ce qui ne veut pas s\'ouvrir. Bruyant.' },
  cle_molette: { id: 'cle_molette', name: 'Clé à molette', cat: 'tools', weight: 1, value: 6, icon: '⚒', desc: 'Votre outil fétiche. Elle a votre prénom gravé dessus.' },
  trousse: { id: 'trousse', name: 'Trousse d\'outils', cat: 'tools', weight: 2.5, value: 14, icon: '⌸', desc: 'Tournevis, pinces, fil, fer à souder à gaz.' },
  masque: { id: 'masque', name: 'Masque filtrant', cat: 'tools', weight: 0.5, value: 16, icon: '◘', desc: 'Filtre neuf. Permet de supporter la brume un moment.' },
  jerrican: { id: 'jerrican', name: 'Jerrican vide', cat: 'tools', weight: 1.5, value: 4, icon: '▥', desc: 'Vingt litres. Vide, pour l\'instant.' },
  jerrican_plein: { id: 'jerrican_plein', name: 'Jerrican plein', cat: 'tools', weight: 5.5, value: 14, icon: '▦', desc: 'Lourd. Vingt litres d\'eau à rapporter à la citerne du train.' },
  cric: { id: 'cric', name: 'Cric hydraulique', cat: 'tools', weight: 3, value: 12, icon: '⊥', desc: 'Peut soulever ou étayer une charge lourde.' },
  corde: { id: 'corde', name: 'Corde', cat: 'tools', weight: 1.2, value: 6, icon: '∿', desc: 'Quinze mètres de corde tressée.' },
  // --- Échange
  tabac: { id: 'tabac', name: 'Tabac', cat: 'trade', weight: 0.1, value: 6, icon: '≋', desc: 'Une blague de tabac sec. Monnaie d\'échange.' },
  piles: { id: 'piles', name: 'Piles', cat: 'trade', weight: 0.2, value: 8, icon: '▮', desc: 'Quatre piles, dont trois marchent peut-être.' },
  alcool: { id: 'alcool', name: 'Eau-de-vie', cat: 'trade', weight: 0.4, value: 10, icon: '♁', desc: 'Une flasque de poire. Désinfecte aussi, paraît-il.' },
  montre: { id: 'montre', name: 'Montre gousset', cat: 'trade', weight: 0.1, value: 20, icon: '◷', desc: 'En argent, arrêtée à 4 h 12.' },
  pieces_det: { id: 'pieces_det', name: 'Pièces détachées', cat: 'trade', weight: 1, value: 10, icon: '⚙', desc: 'Roulements, fusibles, durites. À verser aux réserves du train.' },
  // --- Documents
  billet_cabine0: { id: 'billet_cabine0', name: 'Billet « cabine 0 »', cat: 'docs', weight: 0, value: 0, quest: true, icon: '▭', desc: 'Billet de première classe tamponné « cabine 0 ». Aucune cabine 0 sur les plans du VAYN.' },
  lettre_madame: { id: 'lettre_madame', name: 'Lettre cachetée', cat: 'docs', weight: 0, quest: true, icon: '✉', desc: 'Cire rose, armoiries des Villiers. « À M. Marchetti, en main propre. »' },
  lettre_ouverte: { id: 'lettre_ouverte', name: 'Lettre de Madame (ouverte)', cat: 'docs', weight: 0, quest: true, icon: '✉', desc: '« Plus une goutte ne sortira de mon garde-manger tant que ce garçon parlera de ce qu\'il a vu. Arrangez-vous pour qu\'il se taise. Le prix habituel. — C. de V. »' },
  carnet_theo: { id: 'carnet_theo', name: 'Carnet de Théo', cat: 'docs', weight: 0, quest: true, icon: '▯', desc: 'Petit carnet à spirale, écriture serrée. Les dernières pages parlent de « M. », de 4,7 MHz et d\'un relais K3.' },
  registre_radio: { id: 'registre_radio', name: 'Journal radio', cat: 'docs', weight: 0, quest: true, icon: '▯', desc: 'Trois nuits d\'écoute. Tampon rouge : NE PAS DIFFUSER — H.C.' },
  lettre_marchetti: { id: 'lettre_marchetti', name: 'Brouillon de Marchetti', cat: 'docs', weight: 0, quest: true, icon: '✉', desc: '« Madame, comme convenu : quatre jerricans par semaine contre une boîte d\'amoxicilline. La docteure ne sait pas d\'où ils viennent. — P.M. »' },
  // --- Objets de quête
  relais_k3: { id: 'relais_k3', name: 'Relais K3', cat: 'quest', weight: 0, quest: true, icon: '⌧', desc: 'Relais de puissance, référence K3. Exactement ce qu\'il faut à la filtration.' },
  medaillon: { id: 'medaillon', name: 'Demi-médaillon', cat: 'quest', weight: 0, quest: true, icon: '◑', desc: 'La moitié d\'un médaillon en laiton, gravée « M… ». Mara vous l\'a confié.' },
  cle_radio: { id: 'cle_radio', name: 'Clé de la salle radio', cat: 'quest', weight: 0, quest: true, icon: '⚿', desc: 'Une clé plate, étiquette « RADIO ». D\'habitude, elle ne quitte pas la ceinture de Castel.' },
  cle_casier: { id: 'cle_casier', name: 'Clé du casier de Théo', cat: 'quest', weight: 0, quest: true, icon: '⚿', desc: 'Petite clé à numéro 7.' },
  cle_reserve: { id: 'cle_reserve', name: 'Clé de la réserve', cat: 'quest', weight: 0, quest: true, icon: '⚿', desc: 'La clé du cadenas de la grille, en soute.' },
  passe_controle: { id: 'passe_controle', name: 'Passe du Contrôle', cat: 'quest', weight: 0, quest: true, icon: '⚿', desc: 'Ouvre la cabine de conduite et les armoires du Contrôle.' },
  cles_salon: { id: 'cles_salon', name: 'Clés du Salon', cat: 'quest', weight: 0, quest: true, icon: '⚿', desc: 'Trousseau en laiton : office, garde-manger, cabine de Madame.' },
  pignon: { id: 'pignon', name: 'Pignon de draisine', cat: 'quest', weight: 0, quest: true, icon: '⚙', desc: 'Un pignon denté graissé. La draisine de la cour n\'attend que lui.' },
};
