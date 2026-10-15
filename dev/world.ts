import Phaser from 'phaser';
import { WorldScene, type WorldHost } from '../src/world/WorldScene';
import { Game } from '../src/engine/game';
import { TRAIN_SECTIONS, TRAIN_DOORS, TRAIN_SPOTS } from '../src/content/train_sections';
import type { Content, ObjectDef } from '../src/engine/types';
import { createInitialState } from '../src/engine/state';

const objects: ObjectDef[] = [
  { id: 'turbine', sec: 'machines', name: 'Turbine', sprite: 'turbine', x: 230, y: 80, block: [92, 14], actions: [{ label: 'Examiner' }] },
  { id: 'filtration', sec: 'machines', name: 'Filtration', sprite: 'filtration_broken', x: 360, y: 76, block: [38, 8], actions: [{ label: 'Examiner' }] },
  { id: 'pompe', sec: 'machines', name: 'Pompe', sprite: 'pump_dead', x: 440, y: 106, block: [28, 8], actions: [{ label: 'Examiner' }] },
  { id: 'alarm', sec: 'machines', name: 'Alarmes', sprite: 'alarm_panel', x: 166, y: 70, elev: 26, actions: [{ label: 'Lire' }] },
  { id: 'console', sec: 'machines', name: 'Console', sprite: 'cab_console', x: 60, y: 80, block: [36, 10], actions: [{ label: 'Lire' }] },
  { id: 'etabli', sec: 'atelier', name: 'Établi', sprite: 'workbench', x: 92, y: 76, block: [54, 9], actions: [{ label: 'Examiner' }] },
  { id: 'etagere', sec: 'atelier', name: 'Étagère', sprite: 'parts_shelf', x: 186, y: 72, block: [38, 6], actions: [{ label: 'Examiner' }] },
  { id: 'casier', sec: 'atelier', name: 'Casier', sprite: 'locker', x: 290, y: 74, block: [16, 5], actions: [{ label: 'Ouvrir' }] },
  { id: 'couchette', sec: 'atelier', name: 'Couchette', sprite: 'bunk_theo', x: 380, y: 76, block: [50, 8], actions: [{ label: 'Fouiller' }] },
  { id: 'lit1', sec: 'infirmerie', name: 'Lit', sprite: 'bed_med_patient', x: 70, y: 82, block: [42, 8], actions: [{ label: 'Voir' }] },
  { id: 'lit2', sec: 'infirmerie', name: 'Lit', sprite: 'bed_med', x: 140, y: 82, block: [42, 8], actions: [{ label: 'Voir' }] },
  { id: 'steri', sec: 'infirmerie', name: 'Stérilisateur', sprite: 'sterilizer_off', x: 250, y: 76, block: [20, 6], actions: [{ label: 'Voir' }] },
  { id: 'pharma', sec: 'infirmerie', name: 'Pharmacie', sprite: 'med_cabinet', x: 330, y: 74, block: [20, 5], actions: [{ label: 'Voir' }] },
  { id: 'bureau', sec: 'infirmerie', name: 'Bureau', sprite: 'doc_desk', x: 396, y: 80, block: [34, 8], actions: [{ label: 'Voir' }] },
  { id: 'comptoir', sec: 'cantine', name: 'Comptoir', sprite: 'counter_kitchen', x: 76, y: 88, block: [90, 12], actions: [{ label: 'Voir' }] },
  { id: 'tableau', sec: 'cantine', name: 'Tableau', sprite: 'ration_board', x: 226, y: 70, elev: 22, actions: [{ label: 'Lire' }] },
  { id: 'notice', sec: 'cantine', name: 'Annonces', sprite: 'notice_board', x: 262, y: 70, elev: 24, actions: [{ label: 'Lire' }] },
  { id: 'banc1', sec: 'cantine', name: 'Banc', sprite: 'bench', x: 320, y: 84, actions: [] },
  { id: 'table1', sec: 'cantine', name: 'Table', sprite: 'table', x: 320, y: 98, block: [36, 8], actions: [] },
  { id: 'banc2', sec: 'cantine', name: 'Banc', sprite: 'bench', x: 430, y: 84, actions: [] },
  { id: 'table2', sec: 'cantine', name: 'Table', sprite: 'table', x: 430, y: 98, block: [36, 8], actions: [] },
  { id: 'stand', sec: 'cantine', name: 'Étal', sprite: 'passeur_stall', x: 488, y: 78, block: [38, 8], actions: [{ label: 'Voir' }] },
  { id: 'tank', sec: 'soute', name: 'Citerne', sprite: 'water_tank', x: 60, y: 78, block: [32, 8], actions: [{ label: 'Voir' }] },
  { id: 'crates', sec: 'soute', name: 'Caisses', sprite: 'crate_stack', x: 130, y: 80, block: [38, 8], actions: [] },
  { id: 'desk', sec: 'soute', name: 'Registre', sprite: 'reserve_desk', x: 320, y: 80, block: [30, 8], actions: [{ label: 'Lire' }] },
  { id: 'wall', sec: 'soute', name: 'Caisses', sprite: 'crate_wall', x: 436, y: 100, block: [48, 16], actions: [{ label: 'Déplacer' }] },
  { id: 'bunk1', sec: 'dortoirs', name: 'Couchette', sprite: 'bunk', x: 50, y: 74, block: [50, 8], actions: [] },
  { id: 'bunk2', sec: 'dortoirs', name: 'Couchette', sprite: 'bunk_red', x: 150, y: 74, block: [50, 8], actions: [] },
  { id: 'bunk3', sec: 'dortoirs', name: 'Couchette', sprite: 'bunk', x: 250, y: 74, block: [50, 8], actions: [] },
  { id: 'hydro', sec: 'dortoirs', name: 'Hydro', sprite: 'hydro_shelf', x: 330, y: 72, block: [32, 6], actions: [{ label: 'Voir' }] },
  { id: 'poele', sec: 'dortoirs', name: 'Poêle', sprite: 'stove_small', x: 450, y: 74, block: [16, 6], actions: [] },
  { id: 'dtable', sec: 'dortoirs', name: 'Table', sprite: 'dorm_table', x: 400, y: 100, block: [24, 6], actions: [] },
  { id: 'odesk', sec: 'admin', name: 'Bureau', sprite: 'office_desk', x: 100, y: 80, block: [40, 9], actions: [{ label: 'Voir' }] },
  { id: 'map', sec: 'admin', name: 'Carte', sprite: 'map_network', x: 160, y: 70, elev: 26, actions: [{ label: 'Voir' }] },
  { id: 'keys', sec: 'admin', name: 'Clés', sprite: 'key_cabinet', x: 40, y: 70, elev: 28, actions: [{ label: 'Voir' }] },
  { id: 'cell', sec: 'admin', name: 'Cellule', sprite: 'cell', x: 340, y: 90, actions: [] },
  { id: 'radio', sec: 'admin', name: 'Radio', sprite: 'radio_k3', x: 456, y: 78, block: [38, 8], actions: [{ label: 'Voir' }] },
  { id: 'bar', sec: 'salon', name: 'Bar', sprite: 'bar_salon', x: 56, y: 78, block: [56, 10], actions: [{ label: 'Voir' }] },
  { id: 'arm1', sec: 'salon', name: 'Fauteuil', sprite: 'armchair', x: 150, y: 84, actions: [] },
  { id: 'stable', sec: 'salon', name: 'Table', sprite: 'salon_table', x: 175, y: 88, actions: [] },
  { id: 'arm2', sec: 'salon', name: 'Fauteuil', sprite: 'armchair', x: 200, y: 84, flip: true, actions: [] },
  { id: 'piano', sec: 'salon', name: 'Piano', sprite: 'piano', x: 290, y: 76, block: [44, 8], actions: [{ label: 'Jouer' }] },
  { id: 'pantry', sec: 'salon', name: 'Garde-manger', sprite: 'pantry', x: 376, y: 72, block: [26, 6], actions: [{ label: 'Ouvrir' }] },
  { id: 'secr', sec: 'salon', name: 'Secrétaire', sprite: 'secretary', x: 450, y: 72, block: [24, 6], actions: [{ label: 'Voir' }] },
  { id: 'bed', sec: 'salon', name: 'Lit', sprite: 'bed_lux', x: 490, y: 92, block: [40, 10], actions: [] },
];
const content = {
  chars: { controleur: { id: 'controleur', name: 'Aurèle Fontaine', title: 'Contrôleur', look: { body: 'coat', hat: 'captain', accent: '#8fc1ff', acc: ['buttons'], prop: 'lamp' }, color: '#8fc1ff', startSpot: 'c_fontaine', rel: {}, startItems: [], startStorage: [], tokens: 5 } },
  npcs: {
    rosa: { id: 'rosa', name: 'Rosa', role: 'Cantinière', look: { body: 'apron', hat: 'bun', accent: '#ece2c8', eye: '#ffd25a', prop: 'ladle' }, color: '#ece2c8', schedule: [{ from: '00:00', spot: 'c_comptoir' }] },
    castel: { id: 'castel', name: 'Castel', role: 'Sécurité', look: { body: 'stocky', hat: 'cap', accent: '#e0483e', acc: ['armband', 'badge'], prop: 'baton' }, color: '#e0483e', schedule: [{ from: '00:00', spot: 'c_table2' }] },
    noe: { id: 'noe', name: 'Noé', role: 'Gamin', look: { body: 'child', hat: 'cap', accent: '#ff6b3d', acc: ['scarf'], prop: 'flask' }, color: '#ff6b3d', schedule: [{ from: '00:00', spot: 'c_table1' }] },
    vic: { id: 'vic', name: 'Vic', role: 'Passeur', look: { body: 'long', hat: 'fedora', accent: '#d9a441', acc: ['belt'], prop: 'case' }, color: '#d9a441', schedule: [{ from: '00:00', spot: 'c_stand' }] },
  },
  items: {}, entries: {}, questions: {}, hypotheses: {}, deductions: [], quests: {}, conseqs: {}, dialogues: {}, timed: [], scripted: {}, upgrades: {}, motions: {},
  train: { id: 'train', sections: TRAIN_SECTIONS, doors: TRAIN_DOORS, objects, spots: TRAIN_SPOTS, gap: 14 },
  exterior: { id: 'ext', sections: [], doors: [], objects: [], spots: [], gap: 0 },
} as unknown as Content;
const state = createInitialState(content, 'controleur' as any, 'histoire');
const params = new URLSearchParams(location.search);
if (params.get('x')) state.pos = { x: Number(params.get('x')), y: 96 };
if (params.get('t')) state.time = Number(params.get('t'));
const game = new Game(content, state);
const host: WorldHost = { game, content, busy: () => false, reachedObject: (o) => console.log('obj', o.id), reachedNpc: (n) => console.log('npc', n), reachedDoor: (d) => console.log('door', d.id), walked: (px) => game.walk(px), frame: () => {} };
const dpr = Math.min(3, window.devicePixelRatio || 1);
const pg = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: innerWidth * dpr, height: innerHeight * dpr, pixelArt: true, backgroundColor: '#000', scale: { mode: Phaser.Scale.NONE, zoom: 1 / dpr }, scene: [] });
pg.scene.add('world', WorldScene, true, { host, zone: 'train' });
(window as any).pg = pg;
