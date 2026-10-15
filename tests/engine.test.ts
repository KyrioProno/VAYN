import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/content';
import { evalCond, parseCond, type CondContext } from '../src/engine/dsl';
import { SaveManager, MemoryStorage, KEYS, makeBlob } from '../src/engine/save';
import { cloneState } from '../src/engine/state';
import { NavGrid } from '../src/engine/navgrid';
import { buildNav, layoutStrip } from '../src/engine/layout';
import { newSession, resolveVote, useArg } from '../src/engine/council';
import { absTime } from '../src/engine/time';
import { act, newGame, talk } from './helpers';

const ctx = (over: Partial<CondContext> = {}): CondContext => ({
  flag: (n) => ({ a: true, n: 3, s: 'egal' } as Record<string, unknown>)[n] as never,
  itemQty: (id) => (id === 'ration' ? 2 : 0),
  char: 'controleur', mode: 'histoire', hasEntry: (id) => id === 'c_x', rel: () => 1, met: () => true,
  questStatus: () => 'none', objective: () => false, res: () => 3, tokens: 5, stat: () => 50, time: 600,
  upgrade: () => false, companion: null, zone: 'train', fired: () => false, hypothesis: () => undefined,
  seen: () => false, objState: () => '', doorState: () => 'open', npcAt: () => 'ad_securite', ...over,
});

describe('mini-langage de conditions', () => {
  it('opérateurs, parenthèses, comparaisons', () => {
    expect(evalCond('f:a & !f:b', ctx())).toBe(true);
    expect(evalCond('f:n>=3 & f:s=egal', ctx())).toBe(true);
    expect(evalCond('(f:b | has:ration>=2) & char:controleur', ctx())).toBe(true);
    expect(evalCond('clock>=10:00', ctx())).toBe(true);
    expect(evalCond('clock>=10:01', ctx())).toBe(false);
    expect(evalCond('at:castel=ad_securite & tok>=5', ctx())).toBe(true);
    expect(() => parseCond('f:a & (f:b')).toThrow();
    expect(() => evalCond('inconnu:x', ctx())).toThrow();
  });
});

describe('inventaire', () => {
  it('poids, surcharge, objets de quête protégés', () => {
    const g = newGame('mecanicien');
    expect(g.weight()).toBeCloseTo(2.1, 5); // clé 1 + lampe 0.6 + ration 0.5
    g.give('cric', 3, true);
    expect(g.overloaded()).toBe(true);
    g.give('relais_k3', 1, true);
    expect(g.drop('relais_k3')).toBe(false);
    expect(g.itemQty('relais_k3')).toBe(1);
  });
  it('rangement personnel : transfert sans duplication', () => {
    const g = newGame('mecanicien');
    const before = g.itemQty('ration') + g.storageQty('ration');
    g.transfer('ration', 1, true);
    expect(g.itemQty('ration') + g.storageQty('ration')).toBe(before);
    g.transfer('ration', 1, false);
    expect(g.itemQty('ration') + g.storageQty('ration')).toBe(before);
  });
  it('utiliser un objet consomme et applique ses effets', () => {
    const g = newGame('controleur');
    const s0 = g.state.stats.satiety;
    expect(g.useItem('ration')).toContain('mangez');
    expect(g.itemQty('ration')).toBe(0);
    expect(g.state.stats.satiety).toBeGreaterThan(s0);
  });
});

describe('temps et survie', () => {
  it('les actions et la marche font avancer l’horloge, les jauges baissent', () => {
    const g = newGame('passager');
    const t0 = g.state.time;
    g.walk(800);
    expect(g.state.time - t0).toBe(10);
    const h0 = g.state.stats.hydration;
    g.advance(120);
    expect(g.state.stats.hydration).toBeLessThan(h0);
  });
  it('à bord, la négligence provoque un malaise, pas la mort', () => {
    const g = newGame('passager');
    let collapsed = false;
    g.on('collapse', () => { collapsed = true; });
    g.state.stats.hydration = 0;
    g.state.stats.satiety = 0;
    g.advance(60 * 30);
    expect(g.state.dead).toBe(false);
    expect(collapsed).toBe(true);
  });
  it('dehors, l’épuisement peut tuer', () => {
    const g = newGame('passager');
    g.state.zone = 'exterior';
    g.state.stats = { health: 5, hydration: 0, satiety: 0, rest: 0 };
    g.advance(600);
    expect(g.state.dead).toBe(true);
  });
  it('un événement manqué ne bloque pas : le conseil a lieu quoi qu’il arrive', () => {
    const g = newGame('controleur');
    const ui: string[] = [];
    g.on<{ ui?: string }>('scripted', (d) => ui.push(d.ui ?? ''));
    g.advance(absTime('d1@17:00') - g.state.time);
    expect(ui).toContain('council');
  });
});

describe('sauvegardes', () => {
  it('somme de contrôle : une sauvegarde modifiée est refusée, le point de reprise prend le relais', async () => {
    const store = new MemoryStorage();
    const sm = new SaveManager(store);
    const g = newGame('controleur');
    await sm.saveCheckpoint(g.state, 'Début');
    g.give('montre', 1, true);
    await sm.save(g.state);
    const raw = (await store.get(KEYS.save))!.replace('"montre"', '"masque"');
    await store.set(KEYS.save, raw);
    const r = await sm.load();
    expect(r.ok && r.fromCheckpoint).toBe(true);
    if (r.ok) expect(r.state.inv.some((s) => s.id === 'montre')).toBe(false);
  });
  it('point de reprise : restauration cohérente, sans duplication d’objets', async () => {
    const sm = new SaveManager(new MemoryStorage());
    const g = newGame('mecanicien');
    await sm.saveCheckpoint(g.state, 'Début');
    g.give('antibio', 1, true);
    await sm.save(g.state);
    const r = await sm.loadCheckpoint();
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.state.inv.filter((s) => s.id === 'antibio').length).toBe(0);
  });
  it('ONE LIFE : après la mort, la partie est enterrée et ne peut plus être chargée', async () => {
    const store = new MemoryStorage();
    const sm = new SaveManager(store);
    const g = newGame('passager', 'onelife');
    await sm.save(g.state);
    const copy = (await store.get(KEYS.save))!;
    expect(await sm.saveCheckpoint(g.state, 'x')).toBe(false);
    g.die('Test');
    await sm.buryRun(g.state);
    expect((await sm.load()).ok).toBe(false);
    // même en réinjectant l'ancienne sauvegarde, la pierre tombale la refuse
    await store.set(KEYS.save, copy);
    const r = await sm.load();
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.reason).toBe('dead');
  });
  it('makeBlob / clonage : l’état est sérialisable', () => {
    const g = newGame('majordome');
    const b = makeBlob(cloneState(g.state), 'x');
    expect(JSON.parse(JSON.stringify(b)).state.char).toBe('majordome');
  });
});

describe('conseil', () => {
  it('les arguments déplacent les votes ; l’égalité profite à la position du joueur', () => {
    const g = newGame('passager');
    const m = CONTENT.motions.rationnement;
    const s = newSession(m);
    s.position = 'egal';
    const r = resolveVote(g, s);
    expect(['egal', 'quota']).toContain(r.winner);
    g.addEntry('c_registre_cabine0');
    g.addEntry('c_compteur_eau');
    g.tryLink('c_registre_cabine0', 'c_compteur_eau');
    const s2 = newSession(m);
    s2.position = 'audit';
    expect(useArg(g, s2, 'r_detournement')).toContain('audit');
    expect(useArg(g, s2, 'r_detournement')).toBeNull(); // un argument ne sert qu'une fois
  });
});

describe('navigation', () => {
  it('A* contourne un obstacle', () => {
    const n = new NavGrid(200, 0, 50, 2);
    n.setRect(0, 0, 200, 50, false);
    n.setRect(90, 0, 20, 40, true);
    const p = n.findPath({ x: 20, y: 10 }, { x: 180, y: 10 });
    expect(p).not.toBeNull();
    expect(p!.some((q) => q.y >= 40)).toBe(true);
  });
  it('une porte verrouillée coupe le train ; ouverte, il redevient continu', () => {
    const laid = layoutStrip(CONTENT.train);
    const closed = buildNav(laid, { doorOpen: (id) => id !== 'd_radio', objVisible: () => true });
    const admin = laid.secById['admin'];
    const from = { x: admin.x + 100, y: 96 };
    const radio = { x: admin.x + 460, y: 100 };
    expect(closed.nearestReachable(from, radio)?.exact).toBe(false);
    const open = buildNav(laid, { doorOpen: () => true, objVisible: () => true });
    expect(open.findPath(from, radio)).not.toBeNull();
  });
});

describe('dialogues', () => {
  it('les choix « une fois » disparaissent, les PNJ se souviennent', () => {
    const g = newGame('controleur');
    talk(g, 'castel', ['Que s’est-il passé']);
    expect(g.knows('t_castel_version')).toBe(true);
    const seen = talk(g, 'castel', []);
    expect(seen.join(' ')).not.toContain('Fontaine. Un homme en moins');
  });
  it('un objet de décor ne propose que les actions possibles', () => {
    const g = newGame('passager');
    expect(() => act(g, 'casier_theo', 'Crocheter')).toThrow();
    g.give('cle_casier', 1, true);
    act(g, 'casier_theo', 'Ouvrir avec la clé');
    expect(g.objState('casier_theo')).toBe('ouvert');
  });
});
