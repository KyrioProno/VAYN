// Conseil des quatre (17:00) et assemblée finale : positions, arguments, vote.
import type { App } from '../app/App';
import { MEMBER_LABEL, applyResult, availableArgs, councilMembers, memberVote, newSession, resolveVote, useArg, type CouncilResult, type CouncilSession } from '../engine/council';
import type { MotionDef } from '../engine/types';
import { REVELATIONS } from '../content/story';
import { btn, clear, h } from './dom';
import { portrait } from './portraits';

export function councilFlow(app: App, motions: MotionDef[], opts: { title: string; intro: string; argBudget: number; onDone: () => void; revelations?: boolean }): HTMLElement {
  const g = app.game!;
  const root = h('div', { class: 'council' });
  let i = 0;
  let argsLeft = opts.argBudget;
  let session: CouncilSession | null = null;
  let result: CouncilResult | null = null;
  let replies: string[] = [];

  const optLabel = (m: MotionDef, id: string) => m.options.find((o) => o.id === id)?.label ?? id;

  const showIntro = () => {
    clear(root);
    root.append(
      h('div', { class: 'council-head' }, h('h1', null, opts.title)),
      h('p', { class: 'council-desc', style: 'max-width:720px;font-size:15px;margin-top:12px' }, opts.intro),
      h('div', { class: 'members', style: 'flex:0 0 auto;max-width:560px;margin:10px 0' }, councilMembers(g).map((m) => memberCard(m, null))),
      h('div', { class: 'council-foot' }, h('span', { class: 'left' }, `Arguments disponibles pour la séance : ${argsLeft}`), h('div', { class: 'spacer' }),
        btn(opts.revelations ? 'Prendre la parole' : 'Ouvrir la séance', () => (opts.revelations ? showRevelations() : startMotion()), 'btn primary')),
    );
  };

  const showRevelations = () => {
    clear(root);
    const list = REVELATIONS.filter((r) => g.check(r.if));
    const chosen = new Set<string>();
    const box = h('div', { class: 'council-side' });
    const go = btn('Ne rien révéler', () => {
      for (const r of list) if (chosen.has(r.id)) g.applyFx(r.fx, `revelation:${r.id}`);
      if (chosen.size) app.sfx('fact');
      startMotion();
    }, 'btn primary');
    const draw = () => {
      clear(box);
      if (!list.length) box.append(h('div', { class: 'empty' }, 'Vous n’avez rien de plus à révéler devant tout le monde.'));
      for (const r of list) {
        box.append(btn([h('b', { class: chosen.has(r.id) ? 'chk on' : 'chk' }, g.text(r.label)), h('small', null, g.text(r.desc))], () => {
          if (chosen.has(r.id)) chosen.delete(r.id);
          else chosen.add(r.id);
          app.sfx('tick');
          draw();
        }, `opt${chosen.has(r.id) ? ' on' : ''}`));
      }
      go.textContent = chosen.size ? `Révéler (${chosen.size})` : 'Ne rien révéler';
    };
    draw();
    root.append(
      h('div', { class: 'council-head' }, h('h1', null, 'Révélations'), h('span', { class: 'step' }, 'Avant le vote')),
      h('p', { class: 'council-desc' }, 'Tout le train est réuni dans la cantine. Ce que vous direz maintenant, tout le monde l’aura entendu. Certaines vérités soudent, d’autres brisent.'),
      box,
      h('div', { class: 'council-foot' }, h('div', { class: 'spacer' }), go),
    );
  };

  const memberCard = (m: string, s: CouncilSession | null) => {
    const npc = g.content.npcs[m];
    const card = h('div', { class: 'member' }, portrait(npc.look, 40, 1, false),
      h('div', null, h('div', { class: 'nm' }, npc.name), h('div', { class: 'seat' }, MEMBER_LABEL[m as keyof typeof MEMBER_LABEL] ?? '')));
    if (s) {
      const info = card.lastElementChild as HTMLElement;
      if (result) info.append(h('div', { class: 'vote' }, `Vote : ${optLabel(s.motion, result.votes[m as keyof typeof result.votes] ?? '')}`));
      else info.append(h('div', { class: 'lean' }, `Penche pour : ${optLabel(s.motion, memberVote(g, s, m as never))}`));
    }
    return card;
  };

  const startMotion = () => {
    while (i < motions.length && !g.check(motions[i].if)) i++;
    if (i >= motions.length) {
      opts.onDone();
      return;
    }
    session = newSession(motions[i]);
    result = null;
    replies = [];
    draw();
  };

  const draw = () => {
    const s = session!;
    const m = s.motion;
    clear(root);
    const side = h('div', { class: 'council-side' });
    side.append(h('h4', null, result ? 'Résultat' : 'Votre position'));
    if (!result) {
      for (const o of m.options) {
        side.append(btn([h('b', { class: s.position === o.id ? 'dia' : '' }, o.label), h('small', null, o.desc)], () => {
          s.position = o.id;
          app.sfx('tick');
          draw();
        }, `opt${s.position === o.id ? ' on' : ''}`));
      }
      const args = availableArgs(g, s);
      side.append(h('h4', null, `Arguments (${argsLeft} restant${argsLeft > 1 ? 's' : ''})`));
      if (!args.length) side.append(h('div', { class: 'empty', style: 'padding:4px 0' }, 'Aucun argument tiré de votre enquête pour cette motion.'));
      for (const a of args) {
        const target = g.content.npcs[a.target]?.name ?? a.target;
        side.append(btn([h('b', null, `« ${g.fmt(a.label)} »`), h('small', null, `S’adresse à ${target} · plaide pour : ${optLabel(m, a.toward)}`)], () => {
          if (argsLeft <= 0) return;
          const reply = useArg(g, s, a.id);
          if (reply) {
            argsLeft--;
            replies.push(reply);
            app.sfx('click');
          }
          draw();
        }, 'opt', { disabled: argsLeft <= 0 }));
      }
    } else {
      const w = optLabel(m, result.winner);
      side.append(h('div', { class: 'reply', style: 'font-size:15px' }, h('b', null, `Adopté : ${w}`), h('br'),
        result.tie ? (result.decidedByPlayer ? 'Égalité : votre position a fait pencher la balance.' : 'Égalité : la motion revient à l’option par défaut.') : 'Majorité claire.'));
      const opt = m.options.find((o) => o.id === result!.winner);
      if (opt) side.append(h('p', { style: 'font-size:13px;color:var(--muted)' }, opt.desc));
    }
    for (const r of replies) side.append(h('div', { class: 'reply' }, r));
    const members = h('div', { class: 'members' }, councilMembers(g).map((mm) => memberCard(mm, s)));
    root.append(
      h('div', { class: 'council-head' }, h('h1', null, m.title), h('span', { class: 'step' }, `${opts.title} · motion ${i + 1}/${motions.length}`)),
      h('p', { class: 'council-desc' }, m.desc),
      h('div', { class: 'council-main' }, members, side),
      h('div', { class: 'council-foot' },
        h('span', { class: 'left' }, result ? '' : s.position ? 'En cas d’égalité, votre position l’emporte si elle fait partie des ex æquo.' : 'Sans position, vous vous abstenez.'),
        h('div', { class: 'spacer' }),
        result
          ? btn(i + 1 < motions.length ? 'Motion suivante' : 'Lever la séance', () => { i++; startMotion(); }, 'btn primary')
          : btn('Passer au vote', () => {
            result = resolveVote(g, s);
            applyResult(g, s, result);
            app.sfx('vote');
            draw();
          }, 'btn primary')),
    );
  };

  showIntro();
  return root;
}
