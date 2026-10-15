import { describe, expect, it } from 'vitest';
import { CONTENT } from '../src/content';
import { validateContent } from '../src/engine/validate';
import { SPRITES } from '../src/render/furniture';

describe('contenu du chapitre 1', () => {
  it('toutes les références sont valides', () => {
    const errors = validateContent(CONTENT, new Set(Object.keys(SPRITES)));
    if (errors.length) console.log(errors.join('\n'));
    expect(errors).toEqual([]);
  });
});

describe('le validateur détecte les erreurs', () => {
  it('signale une entrée, un objet, un nœud et un sprite inconnus', () => {
    const broken = structuredClone(CONTENT);
    broken.train.objects[0].actions.push({ label: 'x', if: 'e:inconnue & has:rien', fx: ['give:fantome', 'obj:q_main.zzz'] });
    broken.train.objects[1].sprite = 'sprite_absent';
    broken.dialogues.castel.nodes.hub.ch!.push({ t: 'x', go: 'nulle_part' });
    const errors = validateContent(broken, new Set(Object.keys(SPRITES)));
    const joined = errors.join('\n');
    expect(joined).toContain('inconnue');
    expect(joined).toContain('fantome');
    expect(joined).toContain('zzz');
    expect(joined).toContain('sprite_absent');
    expect(joined).toContain('nulle_part');
    expect(errors.length).toBeGreaterThanOrEqual(5);
  });
});
