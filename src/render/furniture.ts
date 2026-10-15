// Mobilier et objets du décor, dessinés en pixel-art (vue 3/4 : dessus + face avant).
// Chaque générateur renvoie un canvas ; l'ancrage est en bas au centre.
import { PC, rng, shade, drawTinyText } from './draw';
import { P } from './palette';

type Gen = () => PC;
const O = P.ink;

function rivets(pc: PC, x: number, y: number, w: number, step: number, c: string) {
  for (let i = x; i < x + w; i += step) pc.px(i, y, c);
}

function bottle(pc: PC, x: number, y: number, c: string) {
  pc.rect(x, y + 2, 2, 4, c);
  pc.px(x, y + 1, c);
  pc.px(x, y, shade(c, 0.3));
  pc.px(x + 1, y + 3, shade(c, 0.35));
}

function paper(pc: PC, x: number, y: number, w: number, h: number) {
  pc.rect(x, y, w, h, P.paper);
  pc.rect(x, y + h - 1, w, 1, shade(P.paper, -0.25));
  for (let j = y + 1; j < y + h - 1; j += 2) pc.hline(x + 1, j, w - 2 - ((j * 7) % 3), shade(P.paper, -0.35));
}

function screen(pc: PC, x: number, y: number, w: number, h: number, c: string) {
  pc.rect(x, y, w, h, '#0c1512');
  pc.rect(x + 1, y + 1, w - 2, h - 2, shade(c, -0.55));
  for (let j = y + 2; j < y + h - 1; j += 2) pc.hline(x + 1, j, w - 3, shade(c, -0.2));
  pc.px(x + 1, y + 1, c);
}

export const SPRITES: Record<string, Gen> = {
  train_steps: () => {
    // Marchepied de portière, lumière chaude qui s'échappe du train.
    const pc = new PC(22, 16);
    pc.rect(2, 0, 18, 3, P.steel3);
    pc.rect(3, 3, 16, 2, P.steel1);
    pc.rect(4, 6, 14, 2, P.steel3);
    pc.rect(5, 8, 12, 2, P.steel1);
    pc.rect(6, 11, 10, 2, P.steel3);
    pc.rect(7, 13, 8, 3, P.steel1);
    pc.vline(1, 0, 14, P.steel4);
    pc.vline(20, 0, 14, P.steel4);
    pc.px(1, 0, P.amber);
    pc.px(20, 0, P.amber);
    return pc;
  },
  dogs: () => {
    // Meute de chiens couchés / debout, silhouettes sombres aux yeux brillants.
    const pc = new PC(44, 22);
    const dog = (x: number, y: number, stand: boolean, flip: boolean) => {
      const c = '#1b1714';
      const f = (dx: number) => (flip ? x + 12 - dx : x + dx);
      if (stand) {
        pc.rect(Math.min(f(2), f(11)), y, 10, 4, c);
        for (const lx of [2, 4, 9, 11]) pc.rect(f(lx), y + 4, 1, 4, c);
        pc.rect(Math.min(f(11), f(14)), y - 3, 4, 4, c);
        pc.px(f(15), y - 1, c);
        pc.px(f(13), y - 2, '#ffd25a');
        pc.px(f(0), y - 1, c);
        pc.px(f(1), y, c);
      } else {
        pc.rect(Math.min(f(1), f(12)), y + 4, 12, 4, c);
        pc.rect(Math.min(f(11), f(14)), y + 2, 4, 3, c);
        pc.px(f(13), y + 3, '#ffd25a');
      }
    };
    dog(2, 8, false, false);
    dog(14, 6, true, true);
    dog(26, 9, false, true);
    dog(28, 2, true, false);
    dog(8, 13, false, false);
    return pc;
  },
  signal_mast: () => signalMast(false),
  signal_mast_red: () => signalMast(true),
  cargo_door: () => {
    // Porte coulissante de chargement, sur la paroi du fond (bas = sol).
    const pc = new PC(34, 54);
    pc.rect(0, 0, 34, 54, P.steel1);
    pc.rect(2, 2, 30, 52, P.steel2);
    pc.rect(3, 3, 28, 51, P.steel3);
    for (let y = 8; y < 52; y += 7) pc.hline(4, y, 26, shade(P.steel3, -0.2));
    pc.rect(3, 3, 28, 2, P.steel4);
    pc.rect(26, 24, 3, 8, P.steel5);
    pc.rect(27, 25, 1, 6, P.amber);
    pc.dither(3, 40, 28, 14, P.rust2, 0.25);
    pc.rect(0, 0, 34, 1, P.steel4);
    pc.rect(6, 12, 10, 6, '#c9b46a');
    pc.rect(7, 13, 8, 1, O);
    pc.rect(7, 15, 6, 1, O);
    return pc;
  },
  fountain: () => {
    const pc = new PC(16, 30);
    pc.rect(3, 0, 10, 12, P.steel3);
    pc.rect(4, 1, 8, 10, '#3a6f8f');
    pc.rect(5, 2, 2, 7, '#7fb7d6');
    pc.box(1, 12, 14, 3, 6, P.steel4, P.steel2);
    pc.rect(7, 13, 2, 1, P.steel5);
    pc.rect(4, 18, 8, 12, P.steel2);
    pc.rect(5, 19, 6, 10, P.steel1);
    pc.rect(6, 22, 4, 4, P.alarm);
    pc.rect(7, 23, 2, 2, P.ink);
    return pc;
  },
  // ------------------------------------------------------------- cantine
  table: () => {
    const pc = new PC(38, 22);
    pc.box(1, 2, 36, 9, 3, P.steel3, P.steel2);
    pc.rect(3, 14, 2, 8, O);
    pc.rect(33, 14, 2, 8, O);
    pc.rect(5, 14, 28, 1, shade(P.steel1, -0.2));
    // vaisselle
    pc.rect(8, 4, 4, 2, P.steel5);
    pc.rect(24, 5, 5, 2, P.cream2);
    pc.px(17, 4, P.cream3);
    pc.px(18, 6, P.rust2);
    return pc;
  },
  bench: () => {
    const pc = new PC(34, 12);
    pc.box(1, 2, 32, 4, 3, P.wood3, P.wood2);
    for (let x = 6; x < 33; x += 8) pc.vline(x, 2, 4, P.wood2);
    pc.rect(3, 9, 2, 3, O);
    pc.rect(29, 9, 2, 3, O);
    return pc;
  },
  counter_kitchen: () => {
    const pc = new PC(92, 40);
    // fourneau et étagères murales derrière
    pc.rect(6, 0, 34, 3, P.steel2);
    pc.rect(48, 2, 30, 2, P.wood2);
    for (let i = 0; i < 4; i++) pc.circle(54 + i * 7, 0, 2, P.steel4);
    pc.rect(8, 3, 2, 8, P.steel3);
    // marmites
    pc.box(14, 4, 12, 3, 6, P.steel4, P.steel3);
    pc.box(30, 6, 9, 2, 4, P.rust3, P.rust2);
    // comptoir
    pc.box(1, 14, 90, 10, 14, P.conc3, P.rust1);
    for (let x = 6; x < 90; x += 11) pc.vline(x, 25, 12, shade(P.rust1, -0.25));
    pc.hline(1, 30, 90, shade(P.rust1, 0.12));
    pc.rect(60, 16, 10, 5, P.wood3);
    pc.circle(66, 18, 2, P.cream2);
    pc.rect(44, 15, 6, 3, P.steel4);
    pc.rect(76, 16, 6, 4, P.cream1);
    pc.px(78, 17, P.plant);
    return pc;
  },
  ration_board: () => {
    const pc = new PC(36, 26);
    pc.rect(0, 0, 36, 22, P.wood1);
    pc.rect(2, 2, 32, 18, '#1f2a24');
    drawTinyText(pc, 'RATIONS', 4, 3, P.cream2);
    for (let j = 0; j < 3; j++) {
      pc.hline(4, 10 + j * 3, 12, P.cream1);
      pc.hline(20, 10 + j * 3, 4 + j * 3, j === 2 ? P.amber : P.cream1);
    }
    pc.rect(0, 22, 36, 4, 'rgba(0,0,0,0)');
    return pc;
  },
  notice_board: () => {
    const pc = new PC(30, 22);
    pc.rect(0, 0, 30, 20, P.wood2);
    pc.rect(2, 2, 26, 16, P.wood3);
    paper(pc, 4, 3, 8, 9);
    paper(pc, 14, 4, 10, 7);
    paper(pc, 9, 12, 9, 5);
    pc.px(8, 3, P.alarm);
    pc.px(19, 4, P.alarm);
    pc.rect(15, 5, 8, 4, '#d8c9a0');
    pc.rect(16, 6, 3, 2, '#3a332a');
    return pc;
  },
  passeur_stall: () => {
    const pc = new PC(40, 30);
    pc.box(1, 12, 38, 7, 9, P.wood2, P.wood1);
    // marchandise
    pc.rect(5, 8, 7, 5, P.gold);
    pc.rect(14, 6, 5, 7, P.rust2);
    bottle(pc, 22, 6, P.green3);
    bottle(pc, 25, 7, P.rust3);
    pc.rect(29, 9, 7, 4, P.cream2);
    pc.rect(3, 22, 2, 8, O);
    pc.rect(35, 22, 2, 8, O);
    // tissu
    pc.rect(1, 0, 38, 3, P.red1);
    for (let x = 1; x < 39; x += 4) pc.rect(x, 3, 2, 2, P.red1);
    return pc;
  },

  // ------------------------------------------------------------- machines / atelier
  turbine: () => {
    const pc = new PC(96, 58);
    pc.rect(4, 50, 88, 8, P.steel1);
    pc.box(8, 8, 80, 10, 34, P.steel3, P.steel2);
    // cylindre
    pc.ellipse(48, 25, 30, 13, P.steel4);
    pc.ellipse(48, 25, 26, 11, P.steel3);
    for (let i = -24; i <= 24; i += 6) pc.vline(48 + i, 16, 18, shade(P.steel2, -0.2));
    pc.ellipse(48, 25, 6, 5, P.steel1);
    pc.circle(48, 25, 2, P.rust2);
    // tuyaux
    pc.rect(12, 2, 4, 8, P.rust2);
    pc.rect(80, 0, 4, 10, P.rust2);
    pc.rect(12, 2, 72, 3, P.rust2);
    pc.hline(12, 2, 72, P.rust3);
    // jauges
    pc.circle(18, 40, 3, P.cream2);
    pc.px(18, 39, P.alarm);
    pc.circle(78, 40, 3, P.cream2);
    pc.px(79, 40, P.ink);
    rivets(pc, 10, 44, 76, 6, P.steel4);
    pc.rect(30, 46, 36, 3, '#3b3216');
    for (let x = 30; x < 66; x += 6) pc.rect(x, 46, 3, 3, P.amber);
    return pc;
  },
  filtration_broken: () => filtration(false),
  filtration_ok: () => filtration(true),
  pump_dead: () => pump(false),
  pump_ok: () => pump(true),
  alarm_panel: () => {
    const pc = new PC(24, 20);
    pc.rect(0, 0, 24, 18, P.steel2);
    pc.frame(0, 0, 24, 18, P.steel1);
    screen(pc, 3, 3, 12, 8, P.alarm);
    pc.px(4, 4, P.alarm);
    for (let i = 0; i < 3; i++) pc.rect(17, 3 + i * 4, 4, 2, i === 0 ? P.alarm : i === 1 ? P.amber : '#3a3a3a');
    drawTinyText(pc, 'ALR', 3, 12, P.steel5);
    return pc;
  },
  biomass: () => {
    const pc = new PC(30, 24);
    for (let i = 0; i < 3; i++) {
      pc.box(1 + i * 9, 4 + (i % 2) * 2, 9, 4, 13 - (i % 2) * 2, P.rust2, P.rust1);
      pc.hline(2 + i * 9, 11 + (i % 2), 7, P.rust3);
    }
    return pc;
  },
  cab_console: () => {
    const pc = new PC(40, 30);
    pc.box(2, 8, 36, 8, 12, P.steel3, P.steel2);
    screen(pc, 6, 2, 12, 8, P.ok);
    screen(pc, 22, 2, 12, 8, P.amber);
    for (let i = 0; i < 6; i++) pc.px(6 + i * 5, 12, i % 2 ? P.alarm : P.ok);
    pc.rect(16, 18, 8, 2, P.steel1);
    return pc;
  },
  cab_logbook: () => {
    const pc = new PC(14, 10);
    pc.rect(1, 3, 12, 6, P.red1);
    pc.rect(2, 2, 10, 2, P.paper);
    pc.hline(1, 8, 12, shade(P.red1, -0.3));
    return pc;
  },
  workbench: () => {
    const pc = new PC(56, 36);
    // panneau à outils derrière
    pc.rect(4, 0, 48, 14, P.wood2);
    for (let y = 2; y < 14; y += 3) for (let x = 6; x < 52; x += 3) pc.px(x, y, P.wood1);
    pc.rect(8, 2, 2, 9, P.steel4);
    pc.rect(7, 2, 4, 2, P.steel4);
    pc.rect(16, 3, 8, 2, P.rust3);
    pc.rect(19, 5, 2, 6, P.wood4);
    pc.circle(32, 6, 3, P.steel4);
    pc.circle(32, 6, 1, P.wood2);
    pc.rect(40, 2, 2, 10, P.steel5);
    pc.rect(45, 4, 4, 6, P.alarm);
    // établi
    pc.box(1, 16, 54, 8, 8, P.wood3, P.wood2);
    pc.rect(3, 32, 2, 4, O);
    pc.rect(51, 32, 2, 4, O);
    pc.rect(10, 17, 8, 4, P.steel4);
    pc.rect(30, 18, 5, 3, P.rust2);
    pc.rect(40, 17, 3, 5, P.steel3);
    pc.rect(6, 27, 44, 2, shade(P.wood1, -0.2));
    return pc;
  },
  parts_shelf: () => shelfWith((pc) => {
    for (let s = 0; s < 3; s++) for (let i = 0; i < 4; i++) {
      const c = [P.steel4, P.rust3, P.cream1, P.steel3][(i + s) % 4];
      pc.rect(4 + i * 8, 4 + s * 11, 6, 6, c);
      pc.hline(4 + i * 8, 4 + s * 11, 6, shade(c, 0.3));
    }
  }),
  parts_shelf_empty: () => shelfWith((pc) => {
    pc.rect(5, 4, 6, 6, P.steel4);
    pc.rect(22, 26, 6, 6, P.rust3);
  }),
  locker: () => locker(false, P.steel3),
  locker_open: () => locker(true, P.steel3),
  locker_green: () => locker(false, P.green2),
  bunk_theo: () => bunk(false, P.cream1),
  toolbox: () => {
    const pc = new PC(16, 12);
    pc.box(1, 3, 14, 3, 6, P.alarm, shade(P.alarm, -0.35));
    pc.rect(5, 1, 6, 2, P.steel1);
    return pc;
  },
  clipboard_wall: () => {
    const pc = new PC(12, 14);
    pc.rect(1, 1, 10, 13, P.wood3);
    paper(pc, 2, 3, 8, 10);
    pc.rect(4, 0, 4, 2, P.steel4);
    return pc;
  },
  drawer_cabinet: () => {
    const pc = new PC(18, 26);
    pc.box(1, 4, 16, 4, 20, P.steel3, P.steel2);
    for (let i = 0; i < 4; i++) {
      pc.hline(2, 9 + i * 5, 14, P.steel1);
      pc.rect(7, 11 + i * 5, 4, 1, P.steel5);
    }
    return pc;
  },

  // ------------------------------------------------------------- infirmerie
  bed_med: () => medBed(false),
  bed_med_patient: () => medBed(true),
  med_cabinet: () => {
    const pc = new PC(22, 38);
    pc.box(1, 4, 20, 4, 32, P.cream2, P.cream1);
    pc.rect(3, 9, 16, 12, '#2b3a40');
    for (let s = 0; s < 2; s++) for (let i = 0; i < 4; i++) bottle(pc, 4 + i * 4, 10 + s * 6, [P.cold, P.amber, P.cream3, P.plant][(i + s) % 4]);
    pc.rect(9, 24, 4, 4, '#b8323a');
    pc.rect(10, 23, 2, 6, '#b8323a');
    pc.rect(9, 25, 4, 2, '#b8323a');
    pc.rect(16, 29, 2, 2, P.steel4);
    return pc;
  },
  sterilizer_off: () => sterilizer(false),
  sterilizer_on: () => sterilizer(true),
  doc_desk: () => {
    const pc = new PC(36, 26);
    pc.box(1, 8, 34, 8, 10, P.wood3, P.wood2);
    paper(pc, 6, 9, 8, 5);
    pc.rect(20, 3, 3, 7, P.steel4);
    pc.rect(18, 2, 8, 3, P.cream3);
    pc.rect(27, 9, 5, 4, P.cream1);
    pc.px(29, 10, P.alarm);
    pc.rect(3, 22, 2, 4, O);
    pc.rect(31, 22, 2, 4, O);
    return pc;
  },
  curtain_med: () => {
    const pc = new PC(8, 48);
    pc.rect(0, 0, 8, 2, P.steel4);
    for (let y = 2; y < 44; y++) for (let x = 0; x < 8; x++) pc.px(x, y, (x + (y >> 3)) % 3 ? '#a9bdb6' : '#8ea39b');
    return pc;
  },

  // ------------------------------------------------------------- soute
  crate: () => crate(16, 14, P.wood3),
  crate_big: () => crate(22, 18, P.wood3),
  crate_stack: () => {
    const pc = new PC(40, 40);
    pc.draw(crate(20, 16, P.wood3), 0, 22);
    pc.draw(crate(20, 16, P.wood2), 20, 22);
    pc.draw(crate(18, 14, P.wood3), 10, 8);
    drawTinyText(pc, 'VAYN', 3, 31, P.wood0);
    return pc;
  },
  crate_wall: () => {
    // pile de caisses qui masque la cache (côté droit de la soute)
    const pc = new PC(50, 46);
    pc.draw(crate(24, 18, P.wood2), 0, 26);
    pc.draw(crate(24, 18, P.wood3), 24, 26);
    pc.draw(crate(22, 16, P.wood3), 2, 10);
    pc.draw(crate(22, 16, P.wood2), 25, 10);
    pc.draw(crate(16, 10, P.wood3), 16, 0);
    return pc;
  },
  crate_wall_moved: () => {
    const pc = new PC(50, 46);
    pc.draw(crate(24, 18, P.wood2), 0, 26);
    pc.draw(crate(22, 16, P.wood3), 2, 10);
    return pc;
  },
  water_tank: () => {
    const pc = new PC(36, 48);
    pc.box(2, 4, 32, 8, 34, P.blue3, P.blue2);
    for (let x = 6; x < 32; x += 7) pc.vline(x, 13, 32, shade(P.blue2, -0.25));
    pc.rect(25, 16, 4, 22, '#0d1218');
    pc.rect(26, 30, 2, 8, P.cold);
    drawTinyText(pc, 'EAU', 7, 18, P.cream2);
    pc.rect(4, 46, 4, 2, O);
    pc.rect(28, 46, 4, 2, O);
    return pc;
  },
  reserve_desk: () => {
    const pc = new PC(32, 26);
    pc.box(1, 8, 30, 7, 11, P.wood2, P.wood1);
    pc.rect(5, 6, 10, 4, P.green2);
    pc.hline(5, 6, 10, P.green3);
    pc.rect(20, 4, 3, 5, P.steel4);
    pc.rect(19, 3, 6, 2, P.amber);
    pc.rect(3, 22, 2, 4, O);
    pc.rect(27, 22, 2, 4, O);
    return pc;
  },
  med_crate: () => {
    const pc = crate(18, 14, P.cream1);
    pc.rect(7, 6, 4, 4, '#b8323a');
    return pc;
  },
  nook: () => {
    const pc = new PC(34, 14);
    pc.rect(1, 4, 30, 8, '#3a3550');
    for (let x = 1; x < 31; x += 3) pc.vline(x, 4, 8, '#2c2840');
    pc.rect(24, 2, 8, 5, P.cream2);
    pc.circle(5, 11, 2, P.steel4);
    pc.circle(10, 12, 2, P.steel4);
    pc.rect(15, 9, 5, 3, P.paper);
    return pc;
  },

  // ------------------------------------------------------------- dortoirs
  bunk: () => bunk(true, P.cream1),
  bunk_empty: () => bunk(false, P.blue3),
  bunk_red: () => bunk(true, P.red2),
  laundry: () => {
    const pc = new PC(60, 14);
    pc.line(0, 2, 59, 2, P.cream0);
    const cols = [P.cream2, P.blue3, P.red2, P.cream1, P.green3];
    for (let i = 0; i < 5; i++) {
      const x = 4 + i * 11;
      pc.rect(x, 3, 7, 6 + (i % 3) * 2, cols[i]);
      pc.hline(x, 3, 7, shade(cols[i], 0.2));
    }
    return pc;
  },
  hydro_shelf: () => {
    const pc = new PC(34, 40);
    pc.box(1, 2, 32, 4, 34, P.steel2, P.steel1);
    for (let s = 0; s < 3; s++) {
      pc.rect(3, 8 + s * 10, 28, 2, P.steel3);
      for (let i = 0; i < 5; i++) {
        const x = 5 + i * 5;
        pc.rect(x, 4 + s * 10, 3, 4, i % 2 ? P.plant : P.plant2);
        pc.px(x + 1, 3 + s * 10, P.plant2);
      }
      pc.rect(3, 10 + s * 10, 28, 1, '#a674ff55');
    }
    return pc;
  },
  dorm_table: () => {
    const pc = new PC(26, 18);
    pc.box(1, 4, 24, 6, 4, P.wood3, P.wood2);
    pc.rect(3, 14, 2, 4, O);
    pc.rect(21, 14, 2, 4, O);
    pc.rect(7, 2, 3, 3, P.cream2);
    pc.rect(15, 3, 5, 2, P.rust2);
    return pc;
  },
  stove_small: () => {
    const pc = new PC(18, 24);
    pc.box(2, 4, 14, 4, 14, P.steel2, P.steel1);
    pc.rect(5, 12, 8, 5, '#2a0e06');
    pc.rect(6, 14, 6, 2, P.warm3);
    pc.rect(7, 0, 3, 5, P.steel2);
    return pc;
  },
  noe_stash: () => {
    const pc = new PC(18, 8);
    pc.rect(1, 3, 16, 5, P.wood1);
    pc.rect(3, 2, 6, 3, P.cream1);
    pc.px(12, 3, P.gold);
    pc.px(14, 4, P.gold);
    return pc;
  },

  // ------------------------------------------------------------- administration
  office_desk: () => {
    const pc = new PC(42, 30);
    pc.box(1, 10, 40, 9, 11, P.wood3, P.wood1);
    pc.rect(3, 26, 2, 4, O);
    pc.rect(37, 26, 2, 4, O);
    // lampe de bureau verte
    pc.rect(30, 4, 2, 7, P.steel3);
    pc.rect(27, 2, 8, 3, P.green3);
    pc.hline(27, 2, 8, P.green3);
    paper(pc, 6, 11, 9, 5);
    paper(pc, 16, 12, 7, 4);
    pc.rect(9, 22, 8, 1, P.gold);
    return pc;
  },
  register: () => {
    const pc = new PC(20, 12);
    pc.rect(1, 4, 18, 7, P.red1);
    pc.rect(2, 3, 16, 3, P.paper);
    pc.vline(10, 3, 3, shade(P.paper, -0.3));
    pc.hline(1, 10, 18, shade(P.red1, -0.4));
    return pc;
  },
  filing: () => {
    const pc = new PC(16, 34);
    pc.box(1, 4, 14, 4, 28, P.green2, P.green1);
    for (let i = 0; i < 4; i++) {
      pc.hline(2, 10 + i * 7, 12, P.green0);
      pc.rect(6, 12 + i * 7, 4, 1, P.steel5);
      pc.rect(5, 13 + i * 7, 6, 2, P.paper);
    }
    return pc;
  },
  key_cabinet: () => {
    const pc = new PC(18, 18);
    pc.rect(0, 0, 18, 16, P.wood2);
    pc.rect(2, 2, 14, 12, P.wood1);
    for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) {
      pc.px(4 + i * 3, 4 + j * 5, P.steel5);
      pc.rect(4 + i * 3, 5 + j * 5, 1, 2, i === 2 && j === 1 ? P.wood1 : P.gold);
    }
    return pc;
  },
  cell: () => {
    const pc = new PC(52, 56);
    pc.rect(0, 0, 52, 3, P.steel2);
    for (let x = 1; x < 52; x += 5) {
      pc.rect(x, 3, 2, 50, P.steel3);
      pc.vline(x, 3, 50, P.steel4);
    }
    pc.rect(0, 26, 52, 2, P.steel2);
    pc.rect(0, 53, 52, 3, P.steel1);
    return pc;
  },
  cell_bench: () => {
    const pc = new PC(30, 12);
    pc.box(1, 3, 28, 4, 4, P.steel3, P.steel2);
    pc.rect(3, 10, 2, 2, O);
    pc.rect(25, 10, 2, 2, O);
    return pc;
  },
  radio: () => radio(false),
  radio_k3: () => radio(true),
  radio_log: () => {
    const pc = new PC(18, 14);
    pc.box(1, 4, 16, 4, 6, P.steel3, P.steel2);
    pc.rect(5, 9, 8, 1, P.steel5);
    return pc;
  },
  map_network: () => {
    const pc = new PC(44, 26);
    pc.rect(0, 0, 44, 24, P.wood1);
    pc.rect(2, 2, 40, 20, '#cbbf9c');
    const r = rng(7);
    for (let i = 0; i < 6; i++) pc.line(4 + r() * 36, 4 + r() * 16, 4 + r() * 36, 4 + r() * 16, '#6a5a45');
    pc.line(4, 15, 40, 9, '#2d2620');
    pc.circle(14, 13, 1, P.alarm);
    pc.circle(33, 7, 1, '#3a6ec8');
    pc.px(34, 5, P.ink);
    return pc;
  },
  chair: () => {
    const pc = new PC(12, 20);
    pc.rect(2, 0, 8, 10, P.wood2);
    pc.box(1, 9, 10, 3, 3, P.wood3, P.wood2);
    pc.rect(2, 15, 1, 5, O);
    pc.rect(9, 15, 1, 5, O);
    return pc;
  },

  // ------------------------------------------------------------- salon
  armchair: () => {
    const pc = new PC(22, 24);
    pc.rect(3, 0, 16, 12, P.red2);
    pc.rect(4, 1, 14, 2, P.red3);
    pc.box(1, 10, 20, 5, 6, P.red2, P.red1);
    pc.rect(0, 6, 4, 12, P.gold);
    pc.rect(18, 6, 4, 12, P.gold);
    pc.rect(1, 7, 2, 10, P.red1);
    pc.rect(19, 7, 2, 10, P.red1);
    pc.rect(3, 21, 2, 3, P.gold);
    pc.rect(17, 21, 2, 3, P.gold);
    return pc;
  },
  salon_table: () => {
    const pc = new PC(24, 26);
    pc.ellipse(12, 8, 11, 4, P.gold);
    pc.ellipse(12, 7, 10, 3, P.red1);
    pc.rect(11, 11, 2, 12, P.gold);
    pc.rect(7, 23, 10, 2, P.gold);
    bottle(pc, 8, 1, P.green3);
    pc.rect(14, 3, 2, 3, P.cream3);
    pc.circle(12, 0, 1, '#ff4060');
    return pc;
  },
  piano: () => {
    const pc = new PC(46, 34);
    pc.box(2, 2, 42, 6, 22, '#1b1010', '#120a0a');
    pc.rect(6, 12, 34, 4, P.cream3);
    for (let x = 7; x < 40; x += 3) pc.rect(x, 12, 1, 2, P.ink);
    pc.rect(6, 30, 3, 4, O);
    pc.rect(37, 30, 3, 4, O);
    pc.rect(14, 3, 8, 3, P.gold);
    return pc;
  },
  bar_salon: () => {
    const pc = new PC(58, 40);
    pc.rect(6, 0, 46, 12, P.wood1);
    for (let i = 0; i < 8; i++) bottle(pc, 9 + i * 5, 3, [P.gold, P.green3, P.red2, P.cream2][i % 4]);
    pc.box(1, 18, 56, 8, 12, P.wood3, P.red1);
    pc.hline(1, 26, 56, P.gold);
    for (let x = 8; x < 56; x += 12) pc.rect(x, 29, 6, 6, shade(P.red1, -0.25));
    pc.rect(18, 19, 3, 4, P.cream3);
    pc.rect(34, 19, 3, 4, P.cream3);
    return pc;
  },
  pantry: () => {
    const pc = new PC(28, 40);
    pc.box(1, 4, 26, 4, 34, P.wood3, P.wood2);
    pc.vline(14, 9, 29, P.wood1);
    pc.rect(11, 22, 2, 3, P.gold);
    pc.rect(16, 22, 2, 3, P.gold);
    return pc;
  },
  pantry_open: () => {
    const pc = new PC(28, 40);
    pc.box(1, 4, 26, 4, 34, P.wood3, P.wood1);
    pc.rect(3, 9, 22, 28, '#1b120c');
    for (let i = 0; i < 3; i++) {
      pc.rect(4 + i * 7, 12, 6, 9, P.blue3);
      drawTinyText(pc, 'V', 5 + i * 7, 14, P.cream2);
    }
    for (let i = 0; i < 4; i++) pc.rect(4 + i * 5, 26, 4, 4, P.green2);
    bottle(pc, 6, 31, P.gold);
    bottle(pc, 12, 31, P.red2);
    return pc;
  },
  secretary: () => {
    const pc = new PC(26, 36);
    pc.box(1, 6, 24, 5, 26, P.wood3, P.wood2);
    pc.rect(3, 13, 20, 7, P.wood1);
    paper(pc, 5, 14, 7, 5);
    pc.rect(15, 15, 5, 3, P.red2);
    pc.rect(3, 23, 20, 1, P.gold);
    pc.rect(3, 32, 2, 4, O);
    pc.rect(21, 32, 2, 4, O);
    return pc;
  },
  bed_lux: () => {
    const pc = new PC(44, 24);
    pc.rect(1, 0, 6, 18, P.gold);
    pc.box(4, 6, 38, 8, 8, P.cream3, P.red1);
    pc.rect(8, 7, 9, 5, '#f4efe2');
    pc.rect(20, 8, 20, 6, P.red2);
    pc.rect(5, 22, 2, 2, P.gold);
    pc.rect(39, 22, 2, 2, P.gold);
    return pc;
  },
  gramophone: () => {
    const pc = new PC(18, 30);
    pc.box(2, 18, 14, 4, 6, P.wood3, P.wood2);
    pc.line(9, 18, 12, 6, P.gold);
    pc.ellipse(13, 5, 5, 4, P.gold);
    pc.ellipse(13, 5, 3, 2, '#3b2a12');
    pc.rect(4, 28, 2, 2, O);
    pc.rect(12, 28, 2, 2, O);
    return pc;
  },

  // ------------------------------------------------------------- extérieur
  station_bench: () => {
    const pc = new PC(36, 18);
    pc.rect(2, 0, 32, 6, P.wood2);
    pc.hline(2, 2, 32, P.wood1);
    pc.box(1, 6, 34, 4, 3, P.wood3, P.wood2);
    pc.rect(3, 13, 2, 5, P.steel1);
    pc.rect(31, 13, 2, 5, P.steel1);
    return pc;
  },
  luggage: () => {
    const pc = new PC(30, 16);
    pc.box(1, 6, 16, 3, 7, P.rust2, P.rust1);
    pc.box(14, 3, 14, 3, 9, P.green2, P.green1);
    pc.rect(18, 1, 6, 2, P.ink);
    pc.rect(4, 9, 10, 1, P.gold);
    pc.rect(8, 2, 3, 4, P.paper);
    return pc;
  },
  ticket_counter: () => {
    const pc = new PC(60, 44);
    pc.rect(2, 0, 56, 22, P.wood2);
    pc.rect(6, 4, 20, 14, '#121820');
    pc.rect(34, 4, 20, 14, '#121820');
    pc.line(8, 6, 22, 16, '#3c5266');
    pc.line(36, 15, 50, 6, '#3c5266');
    pc.box(1, 22, 58, 6, 14, P.wood3, P.wood1);
    drawTinyText(pc, 'GUICHET', 15, 30, P.gold);
    return pc;
  },
  pharmacy_cabinet: () => {
    const pc = new PC(22, 36);
    pc.box(1, 4, 20, 4, 30, P.cream1, P.cream0);
    pc.rect(3, 9, 16, 22, '#202a2a');
    pc.line(4, 10, 17, 29, '#55666a');
    pc.rect(8, 16, 6, 2, '#2f8f4e');
    pc.rect(10, 14, 2, 6, '#2f8f4e');
    bottle(pc, 5, 24, P.amber);
    return pc;
  },
  message_wall: () => {
    const pc = new PC(56, 30);
    const r = rng(19);
    for (let i = 0; i < 14; i++) {
      const x = Math.floor(r() * 48);
      const y = Math.floor(r() * 22);
      paper(pc, x, y, 5 + Math.floor(r() * 4), 4 + Math.floor(r() * 4));
    }
    pc.line(6, 26, 40, 26, P.cream2);
    drawTinyText(pc, 'MAMAN', 6, 20, '#1b1b1b');
    return pc;
  },
  water_tower: () => {
    const pc = new PC(64, 118);
    pc.box(8, 6, 48, 6, 30, P.rust2, P.rust1);
    for (let x = 12; x < 54; x += 6) pc.vline(x, 13, 28, shade(P.rust1, -0.25));
    pc.rect(6, 4, 52, 3, P.steel2);
    pc.poly([[8, 2], [32, -8], [56, 2]], P.steel2);
    for (const x of [12, 28, 36, 52]) pc.rect(x, 43, 3, 75, P.steel1);
    pc.line(12, 60, 52, 90, P.steel1);
    pc.line(52, 60, 12, 90, P.steel1);
    pc.rect(30, 42, 4, 50, P.steel2);
    pc.rect(30, 92, 22, 4, P.steel2);
    pc.rect(48, 92, 4, 10, P.steel2);
    drawTinyText(pc, 'S-A', 22, 22, P.cream1);
    return pc;
  },
  water_crane: () => {
    const pc = new PC(34, 54);
    pc.rect(14, 8, 6, 46, P.steel2);
    pc.rect(13, 48, 8, 6, P.steel1);
    pc.rect(14, 6, 18, 5, P.steel2);
    pc.rect(28, 10, 3, 10, P.steel1);
    pc.circle(17, 30, 3, P.rust3);
    pc.rect(16, 28, 2, 4, P.rust2);
    return pc;
  },
  draisine: () => {
    const pc = new PC(46, 26);
    pc.box(2, 12, 42, 5, 5, P.wood3, P.wood2);
    pc.rect(20, 2, 3, 11, P.steel2);
    pc.rect(10, 1, 24, 3, P.steel3);
    pc.circle(9, 22, 4, P.steel1);
    pc.circle(36, 22, 4, P.steel1);
    pc.circle(9, 22, 1, P.steel4);
    pc.circle(36, 22, 1, P.steel4);
    return pc;
  },
  relay_cabinet: () => {
    const pc = new PC(26, 42);
    pc.box(1, 4, 24, 4, 36, P.steel3, P.steel2);
    pc.rect(4, 10, 18, 26, P.steel1);
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) pc.rect(6 + i * 6, 12 + j * 6, 4, 4, j === 1 && i === 2 ? P.rust3 : P.steel4);
    pc.rect(20, 22, 2, 4, P.amber);
    drawTinyText(pc, 'K', 9, 6, P.amber);
    return pc;
  },
  relay_cabinet_open: () => {
    const pc = new PC(26, 42);
    pc.box(1, 4, 24, 4, 36, P.steel3, P.steel2);
    pc.rect(4, 10, 18, 26, '#0f1215');
    for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) if ((i + j) % 3) pc.rect(6 + i * 6, 12 + j * 6, 4, 4, P.steel3);
    return pc;
  },
  beam_sag: () => {
    const pc = new PC(70, 54);
    pc.rect(6, 0, 4, 54, P.rust1);
    pc.rect(60, 0, 4, 54, P.rust1);
    pc.line(8, 6, 40, 22, P.rust2);
    pc.line(8, 7, 40, 23, P.rust2);
    pc.line(8, 8, 40, 24, P.rust1);
    pc.line(40, 22, 62, 4, P.rust2);
    pc.line(40, 23, 62, 5, P.rust1);
    pc.px(40, 25, P.alarm);
    for (let i = 0; i < 6; i++) pc.px(30 + i * 3, 30 + (i % 2) * 3, P.conc2);
    return pc;
  },
  beam_braced: () => {
    const pc = new PC(70, 54);
    pc.rect(6, 0, 4, 54, P.rust1);
    pc.rect(60, 0, 4, 54, P.rust1);
    pc.line(8, 6, 62, 6, P.rust2);
    pc.line(8, 7, 62, 7, P.rust1);
    pc.rect(34, 8, 4, 46, P.wood3);
    pc.rect(30, 50, 12, 4, P.steel2);
    return pc;
  },
  rubble: () => {
    const pc = new PC(36, 14);
    const r = rng(3);
    for (let i = 0; i < 18; i++) {
      const w = 3 + Math.floor(r() * 6);
      const x = Math.floor(r() * (34 - w));
      const y = 4 + Math.floor(r() * 8);
      pc.rect(x, y, w, 3, [P.conc1, P.conc2, P.brick2, P.conc3][i % 4]);
    }
    return pc;
  },
  signal_levers: () => {
    const pc = new PC(60, 30);
    pc.box(1, 18, 58, 4, 8, P.steel2, P.steel1);
    for (let i = 0; i < 9; i++) {
      const lean = i % 3 === 0 ? 3 : -1;
      pc.line(6 + i * 6, 18, 6 + i * 6 + lean, 4, i % 4 === 0 ? P.alarm : i % 4 === 1 ? P.cold : P.steel4);
      pc.rect(5 + i * 6 + lean, 2, 3, 3, P.steel5);
    }
    return pc;
  },
  receiver: () => {
    const pc = new PC(30, 26);
    pc.box(1, 12, 28, 6, 8, P.wood2, P.wood1);
    pc.box(4, 2, 20, 4, 9, P.steel3, P.steel2);
    pc.rect(6, 7, 8, 3, P.amber);
    pc.circle(19, 8, 2, P.steel5);
    pc.rect(6, 10, 1, 1, P.ok);
    pc.rect(2, 22, 2, 4, O);
    pc.rect(26, 22, 2, 4, O);
    return pc;
  },
  cot: () => {
    const pc = new PC(40, 14);
    pc.box(1, 3, 38, 6, 3, '#5d6650', '#454c3b');
    pc.rect(3, 12, 2, 2, O);
    pc.rect(35, 12, 2, 2, O);
    return pc;
  },
  fence: () => {
    const pc = new PC(64, 24);
    for (let x = 2; x < 64; x += 12) pc.rect(x, 0, 2, 24, P.wood1);
    pc.rect(0, 6, 64, 2, P.wood2);
    pc.rect(0, 15, 64, 2, P.wood2);
    return pc;
  },
  station_sign: () => {
    const pc = new PC(64, 40);
    pc.rect(6, 12, 3, 28, P.steel1);
    pc.rect(55, 12, 3, 28, P.steel1);
    pc.rect(0, 0, 64, 13, P.blue2);
    pc.frame(0, 0, 64, 13, P.cream1);
    drawTinyText(pc, 'ST-AUBIN', 15, 4, P.cream3);
    return pc;
  },
  lamp_post: () => {
    const pc = new PC(18, 70);
    pc.rect(8, 6, 2, 64, P.steel1);
    pc.rect(5, 66, 8, 4, P.steel1);
    pc.rect(9, 4, 8, 2, P.steel1);
    pc.rect(14, 6, 4, 3, P.steel2);
    return pc;
  },
  car_wreck: () => {
    const pc = new PC(60, 28);
    pc.poly([[4, 14], [14, 4], [40, 4], [52, 14], [58, 16], [58, 24], [2, 24], [2, 16]], P.rust1);
    pc.rect(16, 6, 10, 7, '#0c1014');
    pc.rect(28, 6, 10, 7, '#0c1014');
    pc.circle(14, 24, 4, P.ink);
    pc.circle(46, 24, 4, P.ink);
    pc.line(4, 18, 56, 18, P.rust2);
    return pc;
  },
  bones: () => {
    const pc = new PC(20, 6);
    pc.rect(2, 3, 6, 1, P.cream2);
    pc.rect(11, 2, 5, 1, P.cream2);
    pc.px(1, 2, P.cream2);
    pc.px(8, 4, P.cream2);
    pc.px(15, 3, P.cream1);
    return pc;
  },
  bush: () => {
    const pc = new PC(30, 18);
    pc.ellipse(10, 11, 9, 6, '#1e2a1c');
    pc.ellipse(19, 10, 10, 7, '#243322');
    pc.ellipse(15, 8, 6, 5, '#2b3c27');
    return pc;
  },
  barrel: () => {
    const pc = new PC(14, 20);
    pc.rect(2, 2, 10, 17, P.rust2);
    pc.ellipse(7, 2, 5, 2, P.rust3);
    pc.hline(2, 7, 10, P.rust1);
    pc.hline(2, 14, 10, P.rust1);
    return pc;
  },
};

// ---------------------------------------------------------------------------

function filtration(ok: boolean): PC {
  const pc = new PC(40, 52);
  pc.box(2, 4, 36, 6, 40, P.steel3, P.steel2);
  // cuves
  pc.rect(6, 12, 10, 26, P.blue2);
  pc.rect(7, 13, 3, 24, P.blue3);
  pc.rect(20, 12, 6, 26, P.steel1);
  // armoire de relais
  pc.rect(28, 14, 8, 16, '#0f1215');
  for (let i = 0; i < 3; i++) pc.rect(29, 15 + i * 5, 6, 3, i === 1 && !ok ? '#0f1215' : P.steel4);
  if (!ok) pc.frame(29, 20, 6, 3, P.amber);
  pc.rect(30, 33, 4, 3, ok ? P.ok : P.alarm);
  pc.rect(4, 2, 32, 3, P.rust2);
  pc.rect(10, 0, 3, 4, P.rust2);
  pc.rect(4, 48, 4, 4, P.ink);
  pc.rect(32, 48, 4, 4, P.ink);
  drawTinyText(pc, 'H2O', 6, 40, P.cream1);
  return pc;
}

function pump(ok: boolean): PC {
  const pc = new PC(30, 26);
  pc.box(1, 8, 28, 5, 10, P.steel2, P.steel1);
  if (ok) {
    pc.ellipse(15, 8, 8, 5, P.steel4);
    pc.ellipse(15, 8, 4, 3, P.steel3);
  } else {
    pc.ellipse(15, 8, 8, 5, '#0d0f11');
    pc.line(9, 6, 21, 10, P.steel3);
  }
  pc.rect(2, 2, 4, 8, P.rust2);
  pc.rect(24, 4, 4, 6, P.rust2);
  pc.rect(12, 18, 6, 2, ok ? P.ok : '#3a3a3a');
  pc.rect(3, 23, 3, 3, O);
  pc.rect(24, 23, 3, 3, O);
  return pc;
}

function shelfWith(fill: (pc: PC) => void): PC {
  const pc = new PC(40, 44);
  pc.rect(1, 0, 38, 44, P.steel1);
  pc.rect(2, 1, 36, 42, '#151a1f');
  for (let s = 0; s < 4; s++) pc.rect(1, 10 + s * 11, 38, 2, P.steel3);
  fill(pc);
  pc.vline(1, 0, 44, P.steel3);
  pc.vline(38, 0, 44, P.steel2);
  return pc;
}

function locker(open: boolean, c: string): PC {
  const pc = new PC(18, 40);
  pc.box(1, 3, 16, 3, 35, shade(c, 0.1), c);
  for (let y = 9; y < 14; y += 2) pc.hline(4, y, 10, shade(c, -0.35));
  if (open) {
    pc.rect(3, 7, 12, 30, '#0c0e10');
    pc.rect(4, 22, 9, 2, P.steel4);
    pc.rect(5, 17, 6, 5, P.cream1);
    pc.rect(14, 6, 4, 32, shade(c, -0.2));
  } else {
    pc.rect(12, 22, 2, 4, P.steel5);
  }
  return pc;
}

function bunk(sleeper: boolean, blanket: string): PC {
  const pc = new PC(52, 46);
  pc.rect(1, 0, 3, 46, P.steel2);
  pc.rect(48, 0, 3, 46, P.steel2);
  // couchette haute
  pc.box(2, 6, 48, 6, 4, blanket, P.steel1);
  pc.rect(4, 4, 9, 3, P.cream3);
  // couchette basse
  pc.box(2, 28, 48, 6, 6, P.cream0, P.steel1);
  if (sleeper) {
    pc.rect(5, 26, 8, 4, P.ink);
    pc.rect(12, 27, 30, 6, blanket);
    pc.hline(12, 27, 30, shade(blanket, 0.2));
  } else {
    pc.rect(5, 26, 9, 3, P.cream3);
    pc.rect(16, 29, 20, 4, shade(blanket, -0.1));
  }
  // rideau
  for (let y = 14; y < 26; y++) pc.rect(40, y, 8, 1, (y >> 1) % 2 ? '#5b4a3a' : '#4a3a2c');
  pc.rect(2, 44, 48, 2, P.steel1);
  return pc;
}

function medBed(patient: boolean): PC {
  const pc = new PC(44, 24);
  pc.rect(1, 2, 3, 20, P.steel4);
  pc.rect(40, 6, 3, 16, P.steel4);
  pc.box(2, 8, 40, 7, 5, '#d9e2df', P.steel3);
  pc.rect(4, 9, 8, 4, '#f3f6f4');
  if (patient) {
    pc.rect(5, 7, 6, 4, P.ink);
    pc.px(8, 8, '#ffcf5a');
    pc.rect(11, 9, 28, 6, '#8fb3c4');
    pc.hline(11, 9, 28, '#a9c9d6');
  } else {
    pc.rect(13, 10, 26, 4, '#b8c8d0');
  }
  pc.rect(4, 20, 2, 4, O);
  pc.rect(38, 20, 2, 4, O);
  return pc;
}

function sterilizer(on: boolean): PC {
  const pc = new PC(22, 22);
  pc.box(1, 6, 20, 5, 10, P.steel4, P.steel3);
  pc.rect(4, 12, 10, 4, '#1a2026');
  pc.rect(16, 12, 3, 3, on ? P.ok : '#2a2a2a');
  if (!on) pc.line(4, 12, 13, 15, P.amber);
  pc.rect(2, 20, 18, 2, P.steel1);
  return pc;
}

function crate(w: number, h: number, c: string): PC {
  const pc = new PC(w, h);
  const d = Math.max(3, Math.floor(h * 0.28));
  pc.box(0, 1, w, d, h - d - 2, shade(c, 0.12), c);
  pc.line(1, d + 2, w - 2, h - 3, shade(c, -0.3));
  pc.hline(1, d + Math.floor((h - d) / 2), w - 2, shade(c, -0.25));
  return pc;
}

function radio(k3: boolean): PC {
  const pc = new PC(40, 36);
  pc.box(1, 16, 38, 7, 12, P.wood2, P.wood1);
  pc.box(4, 2, 30, 5, 14, P.steel3, P.steel2);
  screen(pc, 7, 8, 10, 6, P.amber);
  pc.circle(23, 11, 3, P.steel5);
  pc.circle(30, 11, 2, P.steel5);
  if (k3) {
    pc.rect(20, 0, 8, 6, P.steel4);
    pc.rect(21, 1, 6, 4, '#b8b08a');
    pc.line(24, 6, 28, 16, P.alarm);
  }
  pc.rect(3, 31, 2, 5, O);
  pc.rect(35, 31, 2, 5, O);
  return pc;
}

function signalMast(red: boolean): PC {
  const pc = new PC(12, 64);
  pc.rect(5, 14, 2, 50, P.steel2);
  pc.vline(5, 14, 50, P.steel3);
  pc.rect(1, 0, 10, 16, P.ink);
  pc.rect(2, 1, 8, 14, '#1c1e22');
  pc.circle(6, 5, 2, red ? '#ff3a2a' : '#3a1210');
  pc.circle(6, 11, 2, red ? '#10301a' : '#3aff6a');
  pc.rect(3, 62, 6, 2, P.steel1);
  return pc;
}
