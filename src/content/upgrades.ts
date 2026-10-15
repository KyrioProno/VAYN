import type { UpgradeDef } from '../engine/types';

export const UPGRADES: Record<string, UpgradeDef> = {
  up_sterilisateur: {
    id: 'up_sterilisateur', name: 'Réparer le stérilisateur',
    desc: 'Une résistance neuve pour le stérilisateur de l’infirmerie.',
    effect: '+2 médicaments en réserve, soins plus sûrs. Visible à l’infirmerie.',
    cost: { parts: 1 }, time: 60,
    if: 'char:mecanicien | trust:vasseur>=1 | has:trousse',
    fx: ['res:meds+2', 'conseq:cq_sterilisateur', 'trust:sorel+1'],
  },
  up_pompe: {
    id: 'up_pompe', name: 'Remonter la pompe de secours',
    desc: 'Rendre son moteur à la pompe de secours… en le reprenant aux bacs hydroponiques.',
    effect: 'La filtration ne sera plus jamais seule. Mais les bacs ralentissent : −1 nourriture.',
    cost: { parts: 2 }, time: 90,
    if: 'e:t_vasseur_pompe | char:mecanicien | f:moteur_identifie',
    visible: 'e:c_pompe_secours',
    fx: ['res:food-1', 'conseq:cq_pompe', 'trust:vasseur+1'],
  },
  up_hydro: {
    id: 'up_hydro', name: 'Étendre les bacs hydroponiques',
    desc: 'Deux bacs de plus, branchés sur le moteur actuel.',
    effect: '+2 nourriture. Impossible si la pompe de secours a récupéré son moteur.',
    cost: { parts: 2, energy: 6 }, time: 60,
    if: '!up:up_pompe',
    fx: ['res:food+2', 'conseq:cq_hydro'],
  },
  up_delestage: {
    id: 'up_delestage', name: 'Délester le Salon',
    desc: 'Couper les lignes privées du Salon et les rebrancher sur le réseau commun.',
    effect: '+12 énergie. Madame de Villiers ne vous le pardonnera pas.',
    cost: { parts: 0 }, time: 30,
    if: 'char:mecanicien | char:controleur | trust:vasseur>=1',
    fx: ['res:energy+12', 'trust:villiers-2', 'conseq:cq_delestage', 'set:salon_deleste'],
  },
  up_calfeutrage: {
    id: 'up_calfeutrage', name: 'Calfeutrer les dortoirs',
    desc: 'Boucher les fentes des parois avec des chiffons et du goudron.',
    effect: 'Le sommeil aux dortoirs récupère davantage. Les dortoirs vous en sont reconnaissants.',
    cost: { parts: 1 }, time: 45,
    fx: ['set:dortoirs_calfeutres', 'conseq:cq_calfeutrage', 'trust:rosa+1', 'trust:agathe+1'],
  },
  up_antenne: {
    id: 'up_antenne', name: 'Antenne de toit',
    desc: 'Tirer une antenne sur le toit de la voiture administrative.',
    effect: 'Une fois l’émission de 21 h commencée, le poste tient 4,7 MHz à toute heure — et l’écoute prend dix minutes au lieu de vingt. Sans effet si le K3 repart dans la filtration.',
    cost: { parts: 1 }, time: 40,
    if: 'e:c_relais_radio & !f:k3_retire_radio',
    visible: 'e:c_relais_radio',
    fx: ['set:antenne'],
  },
};
