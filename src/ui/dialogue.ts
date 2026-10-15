// Boîte de dialogue en bas d'écran (portrait, nom, texte progressif, choix).
import type { DialogueView } from '../engine/dialogue';
import type { Look } from '../engine/types';
import { btn, clear, h, marquerDefilement } from './dom';
import { portrait } from './portraits';

export interface DialogueBoxOpts {
  look?: (speakerId: string) => Look | null;
  role?: (speakerId: string) => string;
  speed: () => number; // caractères par seconde (0 = instantané)
  onChoice: (index: number) => void;
  onNext: () => void;
  sfx?: (k: string) => void;
}

export class DialogueBox {
  readonly el: HTMLElement;
  private portraitBox: HTMLElement;
  private who: HTMLElement;
  private text: HTMLElement;
  private choices: HTMLElement;
  private cont: HTMLElement;
  private full = '';
  private shown = 0;
  private timer = 0;
  private view: DialogueView | null = null;
  private lastTap = 0;

  constructor(private opts: DialogueBoxOpts) {
    this.portraitBox = h('div', { class: 'portrait' });
    this.who = h('div', { class: 'who' });
    this.text = h('div', { class: 'text' });
    this.choices = h('div', { class: 'choices' });
    this.cont = h('div', { class: 'cont' }, 'Toucher pour continuer ›');
    this.el = h('div', { class: 'dlg live' }, this.portraitBox, h('div', { class: 'body' }, this.who, this.text, this.choices, this.cont));
    this.el.addEventListener('click', () => this.tap());
  }

  show(v: DialogueView) {
    this.view = v;
    this.el.classList.toggle('narr', v.speakerKind === 'narr');
    clear(this.portraitBox);
    const look = v.speakerKind !== 'narr' ? this.opts.look?.(v.speakerId) : null;
    this.portraitBox.style.display = look ? '' : 'none';
    if (look) this.portraitBox.append(portrait(look, 96, 3));
    clear(this.who);
    if (v.speakerName) {
      this.who.append(h('span', { style: `color:${v.speakerColor}` }, v.speakerName));
      const role = this.opts.role?.(v.speakerId);
      if (role) this.who.append(h('small', null, role));
    }
    this.who.style.display = v.speakerName ? '' : 'none';
    this.full = v.text;
    this.shown = 0;
    clear(this.choices);
    this.cont.style.display = 'none';
    clearInterval(this.timer);
    const speed = this.opts.speed();
    if (!speed) this.finishText();
    else {
      this.text.textContent = '';
      const step = Math.max(1, Math.round(speed / 30));
      this.timer = window.setInterval(() => {
        this.shown = Math.min(this.full.length, this.shown + step);
        this.text.textContent = this.full.slice(0, this.shown);
        if (this.shown >= this.full.length) this.finishText();
      }, 1000 / 30);
    }
  }

  private finishText() {
    clearInterval(this.timer);
    this.shown = this.full.length;
    this.text.textContent = this.full;
    const v = this.view;
    if (!v) return;
    clear(this.choices);
    if (v.choices.length) {
      for (const c of v.choices) {
        const label = [] as (string | HTMLElement)[];
        if (c.tag) label.push(h('span', { class: 'chip blue' }, c.tag));
        label.push(c.text);
        this.choices.append(btn(label, () => {
          this.opts.sfx?.('click');
          this.opts.onChoice(c.index);
        }, 'choice'));
      }
      marquerDefilement(this.choices);
      this.cont.style.display = 'none';
    } else {
      this.cont.textContent = v.isEnd ? 'Toucher pour terminer ›' : 'Toucher pour continuer ›';
      this.cont.style.display = '';
    }
  }

  private tap() {
    const now = performance.now();
    if (now - this.lastTap < 250) return;
    this.lastTap = now;
    if (!this.view) return;
    if (this.shown < this.full.length) {
      this.finishText();
      return;
    }
    if (!this.view.choices.length) {
      this.opts.sfx?.('tick');
      this.opts.onNext();
    }
  }

  destroy() {
    clearInterval(this.timer);
    this.el.remove();
  }
}
