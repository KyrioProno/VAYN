// Outils de test : pilotage du moteur sans rendu.
import { CONTENT } from '../src/content';
import { Game } from '../src/engine/game';
import { createInitialState } from '../src/engine/state';
import { DialogueRunner } from '../src/engine/dialogue';
import type { CharId, Mode } from '../src/engine/types';

export function newGame(char: CharId, mode: Mode = 'histoire'): Game {
  return new Game(CONTENT, createInitialState(CONTENT, char, mode, 'test-run'));
}

/** Exécute l'action dont le libellé contient `label` sur l'objet (ou la porte) `id`. */
export function act(g: Game, id: string, label: string): string {
  const all = [...CONTENT.train.objects, ...CONTENT.exterior.objects];
  const o = all.find((x) => x.id === id);
  const d = [...CONTENT.train.doors, ...CONTENT.exterior.doors].find((x) => x.id === id);
  const list = o ? o.actions : d?.actions;
  if (!list) throw new Error(`Objet inconnu ${id}`);
  const a = g.availableActions(list).find((x) => x.label.includes(label));
  if (!a) throw new Error(`Action « ${label} » indisponible sur ${id}. Disponibles : ${g.availableActions(list).map((x) => x.label).join(' / ')}`);
  return g.perform(a, `test:${id}`);
}

/** Déroule un dialogue en choisissant successivement les réponses contenant les libellés donnés. */
export function talk(g: Game, id: string, picks: string[] = []): string[] {
  const r = new DialogueRunner(g, id);
  let v = r.start();
  const seen: string[] = [];
  let guard = 0;
  const queue = [...picks];
  while (v && guard++ < 200) {
    seen.push(v.text);
    if (v.choices.length) {
      const want = queue.shift();
      if (want === undefined) break;
      const c = v.choices.find((x) => x.text.includes(want));
      if (!c) throw new Error(`Choix « ${want} » absent dans ${id}.${v.nodeId}. Choix : ${v.choices.map((x) => x.text).join(' / ')}`);
      v = r.choose(c.index);
    } else v = r.next();
  }
  return seen;
}
