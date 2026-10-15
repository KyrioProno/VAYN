// Registre du contenu du chapitre 1 « Saint-Aubin ».
import type { Content } from '../engine/types';
import { CHARS } from './chars';
import { NPCS } from './npcs';
import { ITEMS } from './items';
import { ENTRIES, QUESTIONS, HYPOTHESES, DEDUCTIONS } from './journal';
import { QUESTS, CONSEQS } from './quests';
import { TRAIN_SECTIONS, TRAIN_DOORS, TRAIN_SPOTS } from './train_sections';
import { TRAIN_OBJECTS } from './train_objects';
import { EXTERIOR } from './exterior';
import { TIMED, SCRIPTED } from './events';
import { MOTIONS } from './motions';
import { UPGRADES } from './upgrades';
import { CASTEL, VASSEUR, MARCHETTI, SOREL } from './dialogues/council';
import { MARA, ROSA, NOE, VIC, AGATHE, JOSEFA, VILLIERS, THEO, ANSELME } from './dialogues/people';
import { STARTS } from './story';

const dialogues = Object.fromEntries(
  [CASTEL, VASSEUR, MARCHETTI, SOREL, MARA, ROSA, NOE, VIC, AGATHE, JOSEFA, VILLIERS, THEO, ANSELME, ...Object.values(STARTS)].map((d) => [d.id, d]),
);

export const CONTENT: Content = {
  chars: CHARS,
  npcs: NPCS,
  items: ITEMS,
  entries: ENTRIES,
  questions: QUESTIONS,
  hypotheses: HYPOTHESES,
  deductions: DEDUCTIONS,
  quests: QUESTS,
  conseqs: CONSEQS,
  dialogues,
  timed: TIMED,
  scripted: SCRIPTED,
  upgrades: UPGRADES,
  motions: MOTIONS,
  train: { id: 'train', sections: TRAIN_SECTIONS, doors: TRAIN_DOORS, objects: TRAIN_OBJECTS, spots: TRAIN_SPOTS, gap: 14 },
  exterior: EXTERIOR,
};

/** Motions présentées au conseil de 17:00, dans l'ordre. */
export const COUNCIL_ORDER = ['expedition', 'rationnement', 'clandestin', 'k3_radio'];
/** Motion de l'assemblée finale. */
export const ASSEMBLY_MOTION = 'direction';
