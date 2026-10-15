// Cinématique d'introduction, scènes d'ouverture, épilogue.
import type { DialogueDef } from '../engine/types';
import type { Game } from '../engine/game';
import { c, n, nar, s } from './dialogues/util';

export type IntroScene = 'embark' | 'depart' | 'catastrophe' | 'later';
export interface IntroCard { scene: IntroScene; title?: string; text: string; dur: number }

export const INTRO: IntroCard[] = [
  { scene: 'embark', title: 'Embarquement', text: 'Lyon-Perrache. Dernier départ avant la fermeture des lignes.', dur: 4200 },
  { scene: 'embark', text: 'Ils sont deux cent douze à monter à bord du VAYN, le train qui roule seul.', dur: 4600 },
  { scene: 'embark', text: 'En tête, on charge des malles et de l’argenterie. En queue, on serre des enfants et un sac pour quatre.', dur: 5200 },
  { scene: 'embark', text: 'On a besoin des autres : une médecin, des mécaniciens, une cuisinière, un contrôleur. Ceux-là voyagent au milieu.', dur: 5200 },
  { scene: 'embark', text: 'Personne ne remarque l’homme en gris, sans bagage, qui regarde la locomotive comme on regarde un vieil ennemi.', dur: 5600 },
  { scene: 'depart', title: 'Départ', text: 'Le VAYN est autonome : pilote automatique, turbine, filtration d’eau, serres hydroponiques.', dur: 4800 },
  { scene: 'depart', text: 'Mais il a ses règles. Il s’arrête quand ses systèmes faiblissent. Il repart quand il l’a décidé.', dur: 5000 },
  { scene: 'depart', text: 'Et il n’attend personne.', dur: 3400 },
  { scene: 'catastrophe', title: 'Catastrophe', text: 'Le troisième soir, la radio se met à grésiller.', dur: 3800 },
  { scene: 'catastrophe', text: '« …tous les réseaux… Paris ne répond plus… restez à l’abri, restez… »', dur: 4600 },
  { scene: 'catastrophe', text: 'Puis, une à une, les voix s’éteignent. Personne ne sait si le monde est mort — ou seulement silencieux.', dur: 5600 },
  { scene: 'later', title: 'Quelques mois plus tard', text: 'Jour 147. Gare de Saint-Aubin, 23 h 52.', dur: 4200 },
  { scene: 'later', text: 'Sans prévenir, le VAYN s’immobilise.', dur: 3800 },
];

/** Scène d'ouverture propre à chaque personnage (dialogue lancé au début de la partie). */
export const STARTS: Record<string, DialogueDef> = {
  start_controleur: {
    id: 'start_controleur', npc: 'castel',
    start: 'a',
    nodes: {
      a: nar('Jour 147, 07:00. Bureau du Contrôle. Le train est immobile depuis sept heures, et le silence des roues est pire que leur vacarme.', 'b'),
      b: s('Fontaine ! La filtration est morte, le pilote automatique refuse de repartir, et Théo Lagarde, de la maintenance, a disparu cette nuit.', 'c'),
      c: s('Je veux un rapport avant le conseil de 17:00. Et pas de panique dans les voitures. Vous savez parler aux gens. Moi, je les compte.', 'd'),
      d: n('Castel repart vers son poste sans attendre de réponse. Dans votre poche, un billet de première classe vous brûle les doigts : tamponné « cabine 0 ».', [
        c('Au travail.', undefined, { fx: ['quest:q_main', 'quest:qp_controleur', 'entry:c_billet_cabine0', 'set:intro_vu', 'checkpoint:Début du chapitre'] }),
      ]),
    },
  },
  start_passager: {
    id: 'start_passager', npc: 'noe',
    start: 'a',
    nodes: {
      a: nar('Jour 147, 07:00. Dortoirs. Vous avez dormi tout habillé, comme toujours. Lou n’est pas dans la couchette du dessous : elle est à l’infirmerie depuis trois jours.', 'b'),
      b: s('Sacha ! Sacha, réveille-toi ! Le train s’est arrêté cette nuit ! Il y a plus d’eau aux robinets, et Théo, le gentil mécano, il a disparu !', 'c'),
      c: s('Castel dit qu’il a sauté. Moi je dis que c’est pas vrai. Et la docteure, elle dit que les médicaments, ça va manquer…', 'd'),
      d: n('Noé repart en courant annoncer la nouvelle à tout le wagon. Les médicaments vont manquer. Lou est quatrième sur la liste.', [
        c('Aller voir ce qui se passe.', undefined, { fx: ['quest:q_main', 'quest:qp_passager', 'set:intro_vu', 'checkpoint:Début du chapitre'] }),
      ]),
    },
  },
  start_majordome: {
    id: 'start_majordome', npc: 'josefa',
    start: 'a',
    nodes: {
      a: nar('Jour 147, 07:00. Le Salon. Vous avez déjà ciré l’argenterie, plié les serviettes et constaté que l’eau ne coulait plus.', 'b'),
      b: s('Edmond. Madame vous demande dans sa cabine. Tout de suite, a-t-elle dit — et elle l’a dit deux fois.', 'c'),
      c: s('On dit qu’un gars de la maintenance a disparu cette nuit. Théo. Celui qui réparait le chauffe-eau de Madame.', 'd'),
      d: n('Josefa retourne à son poste. Les clés du Salon pèsent dans votre poche : l’office, le garde-manger, la cabine de Madame.', [
        c('Aller voir Madame.', undefined, { fx: ['quest:q_main', 'set:intro_vu', 'checkpoint:Début du chapitre'] }),
      ]),
    },
  },
  start_mecanicien: {
    id: 'start_mecanicien', npc: 'vasseur',
    start: 'a',
    nodes: {
      a: nar('Jour 147, 07:00. L’atelier. L’alarme s’est tue il y a sept heures, mais vous l’entendez encore. La couchette de Théo est vide, son lit fait au carré.', 'b'),
      b: s('Malo ! Ramène-toi aux machines ! La filtration est morte, la pompe de secours n’a pas démarré, et Castel cherche un coupable.', 'c'),
      c: nar('La voix de Vasseur grésille dans l’interphone. La pompe de secours n’a pas démarré. Vous pensez à une signature, en bas d’une page du carnet d’entretien.', 'd'),
      d: n('Sur l’établi, le carnet attend.', [
        c('Y aller.', undefined, { fx: ['quest:q_main', 'quest:qp_mecanicien', 'set:intro_vu', 'checkpoint:Début du chapitre'] }),
      ]),
    },
  },
  reveil_infirmerie: {
    id: 'reveil_infirmerie', npc: 'sorel',
    start: 'a',
    nodes: {
      a: nar('Le monde bascule. Quand vous rouvrez les yeux, une lumière blanche grésille au plafond de l’infirmerie.', 'b'),
      b: s('Vous vous êtes effondré dans le couloir. Déshydratation, épuisement. Buvez ça, et mangez quelque chose avant de repartir jouer les héros.', undefined, { fx: ['stat:hydration+30', 'stat:satiety+20', 'stat:rest+20', 'stat:health+15'] }),
    },
  },
  depart_quai: {
    id: 'depart_quai', start: 'a',
    nodes: {
      a: nar('Jour 2, 06:30. La portière de la soute s’ouvre sur le quai désert. L’air sent le fer mouillé et l’herbe. Quelque part, un chien aboie.', 'b'),
      b: nar('Le VAYN repartira à 12:00, avec ou sans vous. Les sirènes préviendront à 11:00, 11:30 et 11:50. Si la brume se lève, ne restez pas dedans.', undefined, { fx: ['checkpoint:Expédition'] }),
    },
  },
};

/** Paragraphes de l'épilogue, construits à partir de l'état final. */
export function buildEpilogue(g: Game): { title: string; lines: string[] }[] {
  const f = (k: string) => g.flag(k);
  const out: { title: string; lines: string[] }[] = [];
  const train: string[] = [];
  if (g.state.objects['filtration'] === 'repare') train.push('La filtration ronronne. On recommence à boire sans compter les gorgées.');
  else train.push('La filtration est toujours morte. La citerne baisse chaque jour, et chaque gorgée se discute.');
  if (f('marchetti_destitue')) train.push('Rosa tient les comptes de la réserve. Les parts sont égales, le Salon grince des dents.');
  else if (f('marchetti_couvert')) train.push('La « cabine 0 » continue d’être ravitaillée, la nuit. Vous êtes l’un des rares à savoir pourquoi.');
  if (g.state.res.water < 1.5) train.push(`Il reste ${g.state.res.water} jours d’eau. Il faudra une autre gare, et vite.`);
  out.push({ title: 'Le train', lines: train });

  const gens: string[] = [];
  if (f('theo_sauve')) gens.push('Théo dort à l’infirmerie, la jambe dans une attelle. Il a demandé à voir Mara avant même de demander de l’eau.');
  else if (f('theo_mort')) gens.push('Théo n’est jamais revenu. Son casier reste fermé. Personne n’ose l’ouvrir.');
  else if (f('theo_reste')) gens.push('Théo est resté au poste d’aiguillage avec Anselme. Le signal, au loin, a regardé passer le train.');
  else gens.push('Personne n’a retrouvé Théo. Dans les dortoirs, on dit déjà qu’il a été dévoré par les chiens. On dit beaucoup de choses.');
  if (f('mere_reunie')) gens.push('Sorel et Mara ne se quittent plus. La docteure a recousu la capuche de sa fille, maladroitement, comme on recoud quatre ans d’absence.');
  else if (f('mara_expulsee')) gens.push('Mara est restée sur le quai de Saint-Aubin, toute petite dans la brume. Sa mère ne saura jamais qu’elle l’a croisée.');
  else if (f('mara_capturee') && !f('mara_libre')) gens.push('Mara attend dans sa cellule. Sorel lui apporte ses repas sans savoir pourquoi cette gamine la fixe ainsi.');
  else if (f('mara_libre')) gens.push('Mara a une couchette, une ration et une place à table. Elle regarde la docteure, parfois, avec une question au bord des lèvres.');
  const comp = g.state.expedition?.companion ?? (g.flag('companion') as string | undefined);
  if (f('compagnon_mort')) gens.push(`${g.content.npcs[String(f('compagnon_mort'))]?.name ?? 'Votre compagnon'} n’est pas revenu de Saint-Aubin.`);
  else if (comp && (g.state.expedition?.compHealth ?? 100) < 40) gens.push(`${g.content.npcs[comp]?.name ?? 'Votre compagnon'} est revenu blessé de l’expédition. Ça se soigne. Ça se pardonne, aussi, peut-être.`);
  if (f('radio_revelee')) gens.push('Tout le train sait désormais que Castel a caché Clairval. Il a gardé son brassard, mais plus personne ne baisse les yeux devant lui.');
  out.push({ title: 'Les gens', lines: gens });

  const perso: string[] = [];
  switch (g.state.char) {
    case 'controleur':
      if (g.knows('c_cabine_horaire')) perso.push('Dans la cabine, vous avez recopié l’horaire du VAYN-2 sur une page de votre carnet. Une ligne fantôme, avec un mois d’avance sur vous. Quelqu’un, quelque part, a écrit votre trajet avant vous.');
      if (f('marchetti_destitue')) perso.push('La « cabine 0 » a été rayée du registre. Pour la première fois depuis le départ, les comptes tombent juste.');
      else if (f('marchetti_couvert')) perso.push('Vous avez laissé la « cabine 0 » sur le registre. Un contrôleur qui ferme les yeux, c’est aussi un contrôleur qui sait tout.');
      else perso.push('La « cabine 0 » reste une énigme. Vous la contrôlerez au prochain arrêt.');
      break;
    case 'passager':
      if (f('lou_soignee')) perso.push('La fièvre de Lou est tombée dans la nuit. Elle a réclamé de la confiture, qu’il n’y a plus nulle part. Vous avez ri comme un idiot.');
      else perso.push('Lou brûle toujours. Il reste la prochaine gare, la prochaine boîte, la prochaine liste.');
      if (f('antibio_vole')) perso.push('Quelqu’un, plus haut sur la liste, n’a pas eu sa boîte. Vous ne demandez pas qui.');
      break;
    case 'majordome':
      if (f('lettre_remise')) perso.push('Vous avez remis la lettre, cachet intact. Noé a reçu des rations pour se taire. Vous êtes resté un bon domestique — vous n’êtes pas certain d’être resté quelqu’un de bien.');
      else if (f('lettre_brulee')) perso.push('La lettre a brûlé dans le poêle des dortoirs. Madame vous sonne toujours, mais vous prenez votre temps pour répondre.');
      else perso.push('La lettre dort au fond de votre poche, comme une décision qu’on remet au lendemain.');
      break;
    case 'mecanicien':
      if (f('malo_avoue')) perso.push('Vous avez avoué votre signature. On vous regarde autrement à l’atelier : comme quelqu’un sur qui on peut compter, justement parce qu’il s’est trompé une fois.');
      else if (f('malo_couvre')) perso.push('Le carnet d’entretien dit toujours « révisée, opérationnelle ». Vasseur vous offre son café chaque matin. Il a un goût de complicité.');
      else if (f('malo_accuse_theo')) perso.push('Vous avez dit que c’était Théo. Si Théo revient un jour, il faudra le regarder en face.');
      else perso.push('Votre signature est toujours au bas de la page. Personne ne l’a encore lue. Personne, pour l’instant.');
      break;
  }
  out.push({ title: g.content.chars[g.state.char].title, lines: perso });
  return out;
}

/** La découverte finale : un message du VAYN-2. */
export function twistText(g: Game): string[] {
  const radioOk = !g.flag('radio_muette');
  const dir = g.flag('direction');
  const lines: string[] = [];
  lines.push(dir === 'clairval'
    ? '16:40. Le VAYN s’engage dans la vallée. Au loin, entre deux crêtes, on devine la ligne grise du barrage de Clairval.'
    : '16:40. L’embranchement de Vercel passe sous les roues. Le VAYN file vers le sud, vers la côte.');
  lines.push(radioOk
    ? 'En salle radio, le poste s’allume de lui-même. Un souffle, puis une voix, hachée, pressante :'
    : 'Dans la cabine de conduite, le pupitre s’allume tout seul. Message prioritaire, canal de service :');
  lines.push('« …ici VAYN-2… je répète, ici VAYN-2… ne vous arrêtez pas à Clairval… quoi qu’il arrive… ne vous arrêtez pas à Clai… »');
  lines.push('Puis plus rien. Seulement le bruit des roues, et deux cent douze personnes qui se regardent sans comprendre.');
  lines.push('Il existe un autre VAYN. Et il sait quelque chose que vous ignorez.');
  return lines;
}

/** Révélations possibles devant l'assemblée finale. */
export interface Revelation { id: string; label: string; desc: string; if: string; fx: string[] }
export const REVELATIONS: Revelation[] = [
  { id: 'rev_radio', label: 'Castel a caché Clairval', desc: 'Lire le journal radio tamponné « NE PAS DIFFUSER — H.C. ».', if: 'e:f_signal_cache & !f:radio_revelee & !f:radio_couverte', fx: ['set:radio_revelee', 'conseq:cq_radio_publique', 'trust:castel-2', 'trust:sorel+1'] },
  { id: 'rev_pompe', label: 'La pompe de secours sacrifiée', desc: 'Dire que Vasseur a démonté le moteur et maquillé le carnet.', if: 'e:f_pompe_morte & !f:vasseur_couverte & !f:vasseur_revelee & !char:mecanicien', fx: ['set:vasseur_revelee', 'conseq:cq_vasseur_exposee', 'trust:vasseur-2'] },
  { id: 'rev_aveu', label: 'Avouer votre signature', desc: 'Reconnaître publiquement que vous avez contresigné une révision fantôme.', if: 'char:mecanicien & e:c_carnet_entretien & !f:malo_avoue', fx: ['set:malo_avoue', 'conseq:cq_malo_aveu', 'obj:qp_mecanicien.choix', 'trust:castel+1'] },
  { id: 'rev_trafic', label: 'Le trafic de la « cabine 0 »', desc: 'Exposer l’échange d’eau contre des antibiotiques entre Marchetti et le Salon.', if: 'e:f_detournement & !f:marchetti_destitue & !f:marchetti_couvert', fx: ['set:marchetti_destitue', 'conseq:cq_marchetti_destitue', 'trust:marchetti-3', 'trust:villiers-2', 'obj:qp_controleur.choix'] },
  { id: 'rev_mere', label: 'Mara est la fille de Sorel', desc: 'Réunir publiquement la mère et la fille.', if: 'e:f_mere & !f:mere_reunie & !f:mara_expulsee', fx: ['set:mere_reunie', 'set:mara_libre', 'loc:mara=', 'conseq:cq_mere_reunie', 'trust:sorel+3', 'trust:mara+2', 'qdone:q_mara'] },
  { id: 'rev_theo', label: 'La nuit de Théo', desc: 'Raconter ce que Théo vous a dit : la radio, Castel, le dépôt.', if: 'e:t_theo_recit & !f:theo_public', fx: ['set:theo_public', 'trust:castel-1', 'trust:vasseur+1'] },
  { id: 'rev_lettre', label: 'La lettre de Madame', desc: 'Lire à voix haute la lettre cachetée de Madame de Villiers.', if: 'e:c_lettre_madame & !f:lettre_remise & !f:lettre_brulee & !f:lettre_revelee', fx: ['set:lettre_revelee', 'take:lettre_ouverte', 'conseq:cq_lettre_revelee', 'trust:villiers-3', 'obj:qp_majordome.remettre'] },
];
