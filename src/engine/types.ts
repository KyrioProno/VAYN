// Types partagés du moteur VAYN (aucune dépendance au rendu).

export type CharId = 'controleur' | 'passager' | 'majordome' | 'mecanicien';
export type Mode = 'histoire' | 'onelife';
export type StatKey = 'health' | 'hydration' | 'satiety' | 'rest';
export type ResKey = 'food' | 'water' | 'energy' | 'meds' | 'parts';
export type EntryKind = 'fact' | 'testimony' | 'clue';
export type ItemCat = 'food' | 'meds' | 'tools' | 'trade' | 'docs' | 'quest';
export type Zone = 'train' | 'exterior';
export type Member = 'castel' | 'vasseur' | 'marchetti' | 'sorel' | 'rosa';

/** Condition écrite dans le mini-langage (voir dsl.ts). */
export type Cond = string;
/** Effet écrit dans le mini-langage (voir dsl.ts). */
export type Fx = string;

export interface Stats { health: number; hydration: number; satiety: number; rest: number }
export interface TrainRes { food: number; water: number; energy: number; meds: number; parts: number }
export interface Relation { trust: number; suspicion: number; debt: number; met: boolean }
export interface ItemStack { id: string; qty: number }

export interface ExpeditionState {
  companion: string | null;
  compHealth: number;
  start: number;
  deadline: number;
  returned: boolean;
  missedTrain: boolean;
  log: string[];
}

export interface JournalState {
  entries: Record<string, { at: number; seen: boolean }>;
  hypotheses: Record<string, string>;
  linksTried: string[];
}

export interface ConseqState { id: string; at: number; observed: string[] }

export interface QuestState { status: 'active' | 'done' | 'failed'; obj: Record<string, boolean>; at: number }

export interface GameState {
  version: number;
  runId: string;
  char: CharId;
  mode: Mode;
  time: number;
  playSeconds: number;
  zone: Zone;
  pos: { x: number; y: number };
  stats: Stats;
  res: TrainRes;
  tokens: number;
  inv: ItemStack[];
  storage: ItemStack[];
  flags: Record<string, number | boolean | string>;
  rel: Record<string, Relation>;
  journal: JournalState;
  conseqs: ConseqState[];
  quests: Record<string, QuestState>;
  doors: Record<string, 'open' | 'locked'>;
  objects: Record<string, string>;
  npcLoc: Record<string, string>;
  fired: string[];
  upgrades: string[];
  expedition: ExpeditionState | null;
  checkpointLabel: string;
  dead: boolean;
  chapterDone: boolean;
  /** Sous-texte de la mort (pour l'écran de fin). */
  deathCause?: string;
}

// ---------------------------------------------------------------------------
// Définitions de contenu
// ---------------------------------------------------------------------------

export interface Look {
  body: 'std' | 'coat' | 'long' | 'dress' | 'apron' | 'child' | 'stocky' | 'thin' | 'tails' | 'robe' | 'overalls';
  hat?: 'cap' | 'captain' | 'top' | 'fedora' | 'hood' | 'beret' | 'headlamp' | 'bun' | 'goggles' | 'kerchief' | 'none' | 'bald' | 'hair';
  accent: string;
  eye?: string;
  acc?: Array<'scarf' | 'armband' | 'belt' | 'bowtie' | 'buttons' | 'hem' | 'collar' | 'cross' | 'gloves' | 'tie' | 'necklace' | 'badge' | 'satchel' | 'glasses' | 'bandage'>;
  prop?: 'lamp' | 'wrench' | 'tray' | 'glass' | 'case' | 'baton' | 'ladle' | 'ledger' | 'lantern' | 'jerrican' | 'cane' | 'bag' | 'ticket' | 'clipboard' | 'shotgun' | 'flask' | 'crutch' | 'none';
  base?: string;
  scale?: number;
}

export interface CharDef {
  id: CharId;
  name: string;
  title: string;
  tagline: string;
  accessory: string;
  look: Look;
  color: string;
  bio: string;
  skills: { name: string; desc: string }[];
  access: string[];
  relations: string[];
  difficulty: { label: string; value: number; note: string };
  plot: string;
  startSpot: string;
  startItems: ItemStack[];
  startStorage: ItemStack[];
  tokens: number;
  rel: Record<string, Partial<Relation>>;
  storageObject: string;
  contact: string;
}

export interface ScheduleEntry { from: string; spot: string; if?: Cond }

export interface NpcDef {
  id: string;
  name: string;
  role: string;
  look: Look;
  color: string;
  dialogue?: string;
  schedule: ScheduleEntry[];
  barks?: { if?: Cond; text: string }[];
  desc?: { if?: Cond; text: string }[];
  ambient?: boolean;
  council?: Member;
}

export interface ItemUse { label: string | TextVariant; fx: Fx[]; text?: string | TextVariant; target?: 'self' | 'comp'; if?: Cond }

export interface ItemDef {
  id: string;
  name: string;
  cat: ItemCat;
  weight: number;
  desc: string;
  quest?: boolean;
  value?: number;
  icon: string;
  use?: ItemUse;
}

export interface EntryDef {
  id: string;
  kind: EntryKind;
  title: string;
  text: string;
  source?: string;
  context?: string;
}

export interface QuestionDef { id: string; title: string; unlock: Cond }
export interface HypothesisDef { id: string; q: string; title: string; text: string; supports: string[]; contradicts: string[] }
export interface DeductionDef { a: string; b: string; result: string; text: string }

export interface QuestDef {
  id: string;
  title: string;
  desc: string;
  personal?: CharId;
  main?: boolean;
  objectives: { id: string; text: string; if?: Cond; doneIf?: Cond }[];
}

export interface ConseqDef { id: string; text: string; observed?: Record<string, string> }

export type TextVariant = string | { if: Cond; text: string }[];

export interface DChoice {
  t: string;
  if?: Cond;
  tag?: string;
  fx?: Fx[];
  go?: string;
  once?: boolean;
}

export interface DNode {
  who?: string;
  text?: TextVariant;
  fx?: Fx[];
  next?: string;
  ch?: DChoice[];
  /** Nœud d'aiguillage : saute vers la première cible dont la condition est vraie. */
  route?: { if?: Cond; go: string }[];
}

export interface DialogueDef {
  id: string;
  npc?: string;
  start: string | { if?: Cond; go: string }[];
  nodes: Record<string, DNode>;
}

export interface TimedEventDef { id: string; at: string; if?: Cond; fx: Fx[] }

export interface ScriptedEventDef { id: string; fx?: Fx[]; ui?: string; arg?: string }

export interface UpgradeDef {
  id: string;
  name: string;
  desc: string;
  effect: string;
  cost: { parts: number; energy?: number; meds?: number };
  time: number;
  if?: Cond;
  visible?: Cond;
  fx: Fx[];
}

export interface MotionOption { id: string; label: string; desc: string; fx: Fx[] }
export interface MotionArg {
  id: string;
  label: string;
  if: Cond;
  target: Member;
  toward: string;
  strength: number;
  reply: string;
  fx?: Fx[];
}
export interface MotionDef {
  id: string;
  title: string;
  desc: string;
  if?: Cond;
  options: MotionOption[];
  base: Partial<Record<Member, Record<string, number>>>;
  fallback: string;
  args: MotionArg[];
}

// --- Décor / monde ------------------------------------------------------------

export interface ActionDef {
  label: string;
  if?: Cond;
  fx?: Fx[];
  text?: TextVariant;
  time?: number;
  once?: string;
  tag?: string;
  dlg?: string;
  danger?: boolean;
}

export interface ObjectDef {
  id: string;
  /** Section (wagon / zone) ; x est relatif au bord gauche de la section. */
  sec: string;
  name: string;
  sprite: string | { if: Cond; sprite: string }[];
  x: number;
  y: number;
  block?: [number, number];
  blockOffset?: number;
  stand?: { dx: number; dy: number };
  visible?: Cond;
  actions: ActionDef[];
  important?: Cond;
  light?: { color: string; r: number; dy?: number; flicker?: boolean; if?: Cond };
  flip?: boolean;
  depthBias?: number;
  /** Élévation du sprite au-dessus de son point d'ancrage (objets muraux, objets posés). */
  elev?: number;
  /** Ne pas teinter selon l'éclairage (objets lumineux). */
  emissive?: boolean;
}

export interface DoorDef {
  id: string;
  name: string;
  /** partition : section + x relatif. gangway : entre deux sections consécutives. */
  sec?: string;
  x?: number;
  between?: [string, string];
  y0: number;
  y1: number;
  kind: 'partition' | 'gangway' | 'gate';
  locked?: boolean;
  /** Pour kind 'gate' : grille horizontale de x0 à x1 (relatifs à sec) à la profondeur y ; ouverture gx0..gx1. */
  gate?: { x0: number; x1: number; y: number; gx0: number; gx1: number };
  actions?: ActionDef[];
  lockedText?: string;
}

export interface SpotDef { id: string; sec: string; x: number; y: number; face?: 1 | -1; pose?: 'stand' | 'sit' | 'lie' }

export interface RoomDef { x0: number; x1: number; name: string }

export interface LampDef { x: number; y: number; color: string; r: number; power?: number; flicker?: boolean; kind?: string; energyDim?: boolean }

export interface SectionDef {
  id: string;
  name: string;
  kind: 'wagon' | 'outdoor' | 'building';
  theme: string;
  w: number;
  x?: number;
  rooms?: RoomDef[];
  windows?: { x: number; w: number }[];
  lamps?: LampDef[];
  decor?: { type: string; x: number; y?: number; w?: number; h?: number; v?: number }[];
  ambient?: number;
  floor?: { y0: number; y1: number };
  /** Section plongée dans le noir (lampe nécessaire). */
  dark?: boolean;
  blocks?: { x: number; y: number; w: number; h: number }[];
}

export interface StripDef {
  id: string;
  sections: SectionDef[];
  doors: DoorDef[];
  objects: ObjectDef[];
  spots: SpotDef[];
  gap: number;
}

export interface Content {
  chars: Record<CharId, CharDef>;
  npcs: Record<string, NpcDef>;
  items: Record<string, ItemDef>;
  entries: Record<string, EntryDef>;
  questions: Record<string, QuestionDef>;
  hypotheses: Record<string, HypothesisDef>;
  deductions: DeductionDef[];
  quests: Record<string, QuestDef>;
  conseqs: Record<string, ConseqDef>;
  dialogues: Record<string, DialogueDef>;
  timed: TimedEventDef[];
  scripted: Record<string, ScriptedEventDef>;
  upgrades: Record<string, UpgradeDef>;
  motions: Record<string, MotionDef>;
  train: StripDef;
  exterior: StripDef;
}
