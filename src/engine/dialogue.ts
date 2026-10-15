// Moteur de dialogue : nœuds, choix conditionnels, effets, aiguillages.
import type { Game } from './game';
import type { DialogueDef, DNode } from './types';

export interface DialogueChoiceView { index: number; text: string; tag?: string }

export interface DialogueView {
  dialogueId: string;
  nodeId: string;
  speakerId: string;
  speakerName: string;
  speakerColor: string;
  speakerKind: 'npc' | 'pc' | 'narr';
  text: string;
  choices: DialogueChoiceView[];
  isEnd: boolean;
}

export class DialogueRunner {
  readonly def: DialogueDef;
  private game: Game;
  private nodeId = '';
  ended = false;
  view: DialogueView | null = null;
  /** PNJ impliqués (pour le cadrage caméra). */
  readonly npc?: string;

  constructor(game: Game, id: string) {
    const def = game.content.dialogues[id];
    if (!def) throw new Error(`Dialogue inconnu : ${id}`);
    this.def = def;
    this.game = game;
    this.npc = def.npc;
  }

  start(): DialogueView | null {
    const s = this.def.start;
    let target: string | undefined;
    if (typeof s === 'string') target = s;
    else target = s.find((x) => this.game.check(x.if))?.go;
    if (!target) return this.finish();
    if (this.def.npc && this.game.content.npcs[this.def.npc]) this.game.meet(this.def.npc);
    return this.enter(target);
  }

  private node(id: string): DNode {
    const n = this.def.nodes[id];
    if (!n) throw new Error(`Nœud inconnu ${this.def.id}.${id}`);
    return n;
  }

  private enter(id: string, depth = 0): DialogueView | null {
    if (depth > 30) throw new Error(`Boucle d'aiguillage dans ${this.def.id}`);
    const n = this.node(id);
    this.nodeId = id;
    this.game.state.flags[`v:${this.def.id}.${id}`] = true;
    if (n.fx) this.game.applyFx(n.fx, `dlg:${this.def.id}.${id}`);
    if (this.game.state.dead) return this.finish();
    if (n.route) {
      const r = n.route.find((x) => this.game.check(x.if));
      if (!r) return this.finish();
      return this.enter(r.go, depth + 1);
    }
    const text = this.game.text(n.text);
    if (!text && n.next && !n.ch) return this.enter(n.next, depth + 1);
    const choices = (n.ch ?? [])
      .map((c, index) => ({ c, index }))
      .filter(({ c, index }) => this.game.check(c.if) && !(c.once && this.game.state.flags[this.onceKey(index)]))
      .map(({ c, index }) => ({ index, text: this.game.fmt(c.t), tag: c.tag }));
    const who = n.who ?? this.def.npc ?? 'narr';
    const sp = this.speaker(who);
    const isEnd = choices.length === 0 && !n.next;
    this.view = {
      dialogueId: this.def.id,
      nodeId: id,
      speakerId: who,
      speakerName: sp.name,
      speakerColor: sp.color,
      speakerKind: sp.kind,
      text,
      choices,
      isEnd,
    };
    return this.view;
  }

  private onceKey(index: number) {
    return `c:${this.def.id}.${this.nodeId}.${index}`;
  }

  private speaker(who: string): { name: string; color: string; kind: 'npc' | 'pc' | 'narr' } {
    if (who === 'pc') {
      const c = this.game.content.chars[this.game.state.char];
      return { name: c.name, color: c.color, kind: 'pc' };
    }
    if (who === 'narr') return { name: '', color: '#cbbfa8', kind: 'narr' };
    const npc = this.game.content.npcs[who];
    if (npc) return { name: npc.name, color: npc.color, kind: 'npc' };
    return { name: who, color: '#cbbfa8', kind: 'npc' };
  }

  /** Choix d'une réponse (index d'origine dans le nœud). */
  choose(index: number): DialogueView | null {
    if (this.ended || !this.view) return null;
    const n = this.node(this.nodeId);
    const c = n.ch?.[index];
    if (!c || !this.view.choices.some((x) => x.index === index)) return this.view;
    if (c.once) this.game.state.flags[this.onceKey(index)] = true;
    if (c.fx) this.game.applyFx(c.fx, `dlg:${this.def.id}.${this.nodeId}#${index}`);
    if (this.game.state.dead) return this.finish();
    if (c.fx?.includes('end') || !c.go) return this.finish();
    return this.enter(c.go);
  }

  /** Continuer (nœud sans choix). */
  next(): DialogueView | null {
    if (this.ended || !this.view) return null;
    const n = this.node(this.nodeId);
    if (n.ch && this.view.choices.length) return this.view;
    if (n.next) return this.enter(n.next);
    return this.finish();
  }

  private finish(): null {
    this.ended = true;
    this.view = null;
    this.game.emit('dialogueEnd', this.def.id);
    this.game.changed();
    return null;
  }
}
