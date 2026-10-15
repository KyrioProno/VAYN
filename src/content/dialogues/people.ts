// Dialogues des passagers et de l'équipage.
import type { DialogueDef } from '../../engine/types';
import { back, bye, c, n, nar, pc, s } from './util';

export const MARA: DialogueDef = {
  id: 'mara', npc: 'mara',
  start: [
    { if: 'zone:exterior', go: 'ext' },
    { if: 'f:mara_capturee & !f:mara_libre', go: 'cellule' },
    { if: '!seen:mara.rencontre & !seen:mara.cellule', go: 'rencontre' },
    { go: 'hub' },
  ],
  nodes: {
    rencontre: n('Une fille maigre, capuche rabattue, brandit un éclat de verre. « Recule. Je te jure que je m’en sers. »', [
      c('Doucement. Je ne te veux pas de mal. Je cherche Théo.', 'rencontre_douce', { fx: ['trust:mara+1'] }),
      c('Pose ça, ou j’appelle Castel.', 'rencontre_dure', { fx: ['trust:mara-1'] }),
    ]),
    rencontre_douce: s('… Théo ? Il n’est pas revenu. Il devait revenir avant l’aube. Il revient toujours.', 'rencontre2'),
    rencontre_dure: s('Non ! Pas lui. S’il te plaît. Je n’ai rien volé. Presque rien.', 'rencontre2'),
    rencontre2: s('Je m’appelle Mara. Ça fait neuf jours que je vis derrière ces caisses.', 'hub', { fx: ['obj:q_mara.trouver'] }),
    cellule: n('Mara serre les barreaux. Petite, le capuche posé sur les barreaux comme un chapeau trop grand. « Toi, c’est bien une du train ? Tu vas les laisser me jeter dehors ? »', [
      c('Je vais parler au conseil.', 'hub', { fx: ['trust:mara+1'] }),
      c('Ta mère est à bord. C’est la docteure Sorel.', 'revele_cellule', { if: 'e:f_mere & !f:mere_reunie' }),
      bye('Je repasserai.'),
    ], { fx: ['met:mara', 'obj:q_mara.trouver'] }),
    hub: n([
      { if: 'f:mere_reunie', text: 'Mara a enlevé sa capuche. Elle a les yeux de sa mère.' },
      { if: 'true', text: 'Mara vous observe, prête à fuir.' },
    ], [
      c('D’où viens-tu ?', 'clairval', { if: '!e:t_mara_clairval' }),
      c('Que sais-tu de Théo ?', 'theo', { if: '!e:t_mara_theo' }),
      c('Pourquoi es-tu montée dans ce train ?', 'pourquoi', { if: 'e:t_mara_theo & !e:t_mara_mere' }),
      c('Ta mère… je crois savoir qui c’est.', 'revele', { if: 'e:f_mere & !f:mere_reunie' }),
      c('Castel va fouiller la soute à 16:00. Il faut te cacher ailleurs.', 'cacher', { if: 'clock<16:00 & !f:mara_cachee_ailleurs & !f:mara_capturee & !f:mara_libre & !f:fouille_detournee' }),
      c('Je ne dirai rien à personne. Ni sur toi, ni sur ta mère.', 'secret', { if: 'e:f_mere & !f:mere_reunie & !f:mere_tue' }),
      c('Tu viendrais avec moi, dehors ?', 'expe', { if: 'ev:conseil & !ev:expedition_depart' }),
      bye(),
    ]),
    clairval: s('Du barrage de Clairval. On est quarante, là-haut. Il y a de l’eau, des turbines, des serres. Chaque soir, à partir de 21 h, on réémet en boucle jusqu’au matin, sur 4,7 mégahertz. Tu ne me crois pas. Personne ne me croit.', 'hub', { fx: ['entry:t_mara_clairval'] }),
    theo: s('C’est lui qui m’a trouvée. Il m’apportait à manger, sa deuxième portion. Il voulait que j’entende Clairval à la radio, mais quelqu’un avait cassé le poste. Il a dit qu’il allait « emprunter une pièce, juste une nuit ».', 'theo2', { fx: ['entry:t_mara_theo', 'trust:mara+1'] }),
    theo2: s('Après, j’ai entendu crier, vers minuit. Et puis plus rien. Il n’est jamais revenu.', 'hub'),
    pourquoi: s('Je cherche quelqu’un. Ma mère. Elle s’appelle Hélène. Je ne connais pas son nom de famille d’aujourd’hui — j’avais douze ans quand on a été séparées. Là-haut, à Clairval, un réfugié de Lyon m’a juré qu’une médecin appelée Hélène montait dans le VAYN. J’ai mis trois semaines à le croire. Alors j’ai fait la route jusqu’ici… et on m’a dit que le train s’arrêtait à Saint-Aubin. J’ai attendu sur le quai. Une fois. Puis je suis montée par la porte de chargement, un soir où le convoi dormait.', 'pourquoi2', { fx: ['entry:t_mara_mere', 'obj:q_mara.confiance'] }),
    pourquoi2: n('Elle sort de sous sa capuche une moitié de médaillon en laiton, gravée « M… ».', [
      c('Je peux la garder ? Je la retrouverai.', 'medaillon', { if: 'trust:mara>=1' }),
      c('Je vais chercher. Garde-la.', 'hub'),
    ]),
    medaillon: s([
      { if: 'char:majordome', text: 'Elle hésite, puis vous la tend. Vous la retournez dans vos gants : vous avez déjà vu sa jumelle. Sur un bureau, à l’infirmerie, posée sur une photo.' },
      { if: 'true', text: 'Elle hésite longtemps. Puis elle vous la tend. « Si tu la perds, je te tue. »' },
    ], 'hub', { fx: ['give:medaillon', 'entry:c_medaillon_mara', 'trust:mara+1'] }),
    revele: pc('Ta mère s’appelle Hélène Sorel. Elle est médecin. Elle est à bord, à l’infirmerie. Elle a l’autre moitié du médaillon.', 'revele2'),
    revele2: nar('Mara ne dit rien. Ses mains tremblent. Puis elle se lève et vous suit sans un mot jusqu’à l’infirmerie, où une femme en blouse lâche le dossier qu’elle tenait.', 'hub', { fx: ['set:mere_reunie', 'set:mara_libre', 'loc:mara=', 'conseq:cq_mere_reunie', 'obj:q_mara.reunion', 'trust:mara+3', 'trust:sorel+3', 'qdone:q_mara'] }),
    revele_cellule: s('Mara ne dit rien. Ses mains tremblent derrière les barreaux. « …Ma mère ? » Vous hochez la tête. Elle se rassoit, le front contre le fer froid.', 'revele_cellule2'),
    revele_cellule2: nar('La docteure Sorel déboule dans le poste de sécurité, ouvre la cellule elle-même — elle a la clé, et personne n’ose lui demander pourquoi — et emmène la gamine à l’infirmerie sans un mot. Mara ne lâche pas sa main.', 'hub', { fx: ['set:mere_reunie', 'set:mara_libre', 'loc:mara=', 'conseq:cq_mere_reunie', 'obj:q_mara.reunion', 'trust:mara+3', 'trust:sorel+3', 'qdone:q_mara'] }),
    secret: s('… Merci. Je ne suis pas prête. Pas encore. Si elle ne me reconnaît pas… je préfère ne pas savoir.', 'hub', { fx: ['set:mere_tue', 'conseq:cq_mere_tue'] }),
    cacher: n('Me cacher où ? Tout le train me cherche.', [
      c('Aux dortoirs, au milieu des autres. Noé et moi, on s’en occupe.', 'cacher_ok', { if: 'char:passager | trust:noe>=2', tag: 'Réseau' }),
      c('Dans l’office du Salon. Personne ne fouille chez Madame.', 'cacher_ok', { if: 'char:majordome', tag: 'Clés du Salon' }),
      c('Reste ici. Je vais occuper Castel.', 'hub'),
    ]),
    cacher_ok: nar('Une couverture sur les épaules, la capuche baissée, Mara traverse le train derrière vous. Personne ne regarde une passagère de plus.', 'hub', { fx: ['set:mara_cachee_ailleurs', 'conseq:cq_mara_cachee', 'obj:q_mara.proteger', 'trust:mara+1'] }),
    expe: n([
      { if: 'trust:mara>=1', text: 'Dehors ? Je suis passée par Saint-Aubin en suivant ce train, pas pour y monter. Je connais le dépôt, le talus… et les chiens. Oui. Je viens.' },
      { if: 'true', text: 'Avec toi ? Je ne te connais pas.' },
    ], [back('D’accord.')]),
    ext: n([
      { if: 'f:chiens_partis', text: '« Le poste d’aiguillage est juste là. Le vieux Anselme m’a donné de l’eau, quand je suis passée. »' },
      { if: 'true', text: '« Doucement, ici. Les chiens dorment sur le talus, après le dépôt. »' },
    ], [bye('Allons-y.')]),
  },
};

export const ROSA: DialogueDef = {
  id: 'rosa', npc: 'rosa',
  start: [{ if: 'f:marchetti_destitue & !seen:rosa.interim', go: 'interim' }, { go: 'hub' }],
  nodes: {
    interim: s('Me voilà au conseil, moi qui sais à peine compter mes louches. Bon. Ça fera des parts égales, au moins.', 'hub'),
    hub: n([
      { if: 'char:passager', text: 'Rosa vous sourit par-dessus ses marmites. « Sacha. Tu manges assez, au moins ? »' },
      { if: 'true', text: 'Rosa essuie le comptoir d’un geste circulaire. « Qu’est-ce que je te sers ? Des nouvelles ? »' },
    ], [
      c('Un quignon pour moi ?', 'quignon', { if: 'char:passager & !f:quignon_rosa' }),
      c('Tu as vu Théo, ces derniers jours ?', 'theo', { if: '!e:t_rosa_portions' }),
      c('Tu as l’air soucieuse.', 'ration', { if: '!q:q_ration' }),
      c('Pour ta ration disparue…', 'ration_fin', { if: 'q:q_ration=active & f:ration_coupable' }),
      c('Je peux t’aider à la réserve, à 11 h ?', 'reserve', { if: 'clock<11:00 & !f:rosa_invite' }),
      bye(),
    ]),
    quignon: s('Tiens, cache-le. Et ne le dis pas aux autres, sinon j’en ai deux cents sur le dos.', 'hub', { fx: ['give:ration', 'set:quignon_rosa'] }),
    theo: s('Théo ? Gentil garçon. Depuis une dizaine de jours, il prenait une deuxième portion. « Pour le chat de la soute », qu’il disait. Il n’y a pas de chat dans ce train. Je n’ai rien dit : on a tous nos petits secrets.', 'hub', { fx: ['entry:t_rosa_portions'] }),
    ration: s('Chaque matin, il me manque une ration. Une seule. Je ne veux pas d’histoires, pas de Castel, juste savoir qui. Tu ouvres l’œil pour moi ?', 'hub', { fx: ['quest:q_ration'] }),
    ration_fin: n('Alors ? Tu as trouvé mon voleur ?', [
      c('C’est Noé. Il met des rations de côté.', 'denonce'),
      c('Je l’ai trouvé. Voilà une ration, on n’en parle plus.', 'couvre', { if: 'has:ration' }),
      c('C’est Vic, le passeur. Il revend tout.', 'vic', { tag: 'Mensonge' }),
    ]),
    denonce: s('Noé… Le pauvre gosse. Je vais devoir le dire à Castel, tu sais. C’est la règle.', 'hub', { fx: ['conseq:cq_ration_noe_denonce', 'trust:noe-3', 'trust:rosa+1', 'set:noe_puni', 'obj:q_ration.decider', 'qdone:q_ration'] }),
    couvre: s('Elle prend la ration, vous regarde longtemps. « D’accord. Je ne demande rien. Mais tu es une bonne personne, toi. »', 'hub', { fx: ['take:ration', 'conseq:cq_ration_couvert', 'trust:rosa+1', 'trust:noe+1', 'obj:q_ration.decider', 'qdone:q_ration'] }),
    vic: s('Vic ? Ce serpent. Ça ne m’étonne pas. Je vais le dire à Castel.', 'hub', { fx: ['conseq:cq_ration_vic', 'set:vic_rancune', 'trust:vic-2', 'susp:vic+2', 'obj:q_ration.decider', 'qdone:q_ration'] }),
    reserve: s('Pourquoi pas ? À 11 h devant la grille de la soute. Je n’aurai pas l’œil partout, si tu vois ce que je veux dire.', 'hub', { fx: ['set:rosa_invite', 'trust:rosa+1'] }),
  },
};

export const NOE: DialogueDef = {
  id: 'noe', npc: 'noe',
  start: [{ if: 'zone:exterior', go: 'ext' }, { if: 'f:noe_puni', go: 'boude' }, { go: 'hub' }],
  nodes: {
    boude: n('Noé vous tourne le dos. « Je parle pas aux balances. »', [bye()]),
    hub: n([
      { if: 'char:passager', text: 'Noé surgit à votre coude. « Sacha ! T’as vu ? Le train s’est arrêté ! »' },
      { if: 'true', text: 'Le gamin vous dévisage, les mains dans les poches de son short trop grand.' },
    ], [
      c('Tu as vu quelque chose, cette nuit ?', 'nuit', { if: '!e:t_noe_saut' }),
      c('Tiens, une ration. Tu as vu quelque chose, cette nuit ?', 'nuit_ration', { if: '!e:t_noe_saut & !char:passager & trust:noe<1 & has:ration' }),
      c('C’est toi qui prends des rations au comptoir ?', 'rations', { if: 'f:cachette_noe_vue & !f:noe_parle_cache' }),
      c('Pour qui gardes-tu ces rations ?', 'rations', { if: 'trust:noe>=2 & !f:noe_parle_cache & e:t_noe_saut' }),
      c('Tu voudrais venir dehors, demain ?', 'expe', { if: 'ev:conseil & !ev:expedition_depart' }),
      bye(),
    ]),
    nuit: n([
      { if: 'char:passager | trust:noe>=1', text: 'J’étais réveillé, j’avais faim. Vers minuit et demi, quelqu’un a sauté par la porte de la soute, avec une lampe. Il a couru vers le grand hangar, là-bas. Le dépôt.' },
      { if: 'true', text: 'Je dis rien aux uniformes. Ni aux larbins. Ni à personne.' },
    ], undefined, { next: 'nuit_fin' }),
    nuit_fin: { route: [{ if: 'char:passager | trust:noe>=1', go: 'nuit_ok' }, { go: 'hub' }] },
    nuit_ok: s('Il boitait pas, à ce moment-là. Il courait vite. Comme quelqu’un qui a peur.', 'hub', { fx: ['entry:t_noe_saut'] }),
    nuit_ration: nar('Noé fait disparaître la ration dans son short avec une vitesse de prestidigitateur.', 'nuit', { fx: ['take:ration', 'trust:noe+2'] }),
    rations: s('… Tu promets que tu dis rien ? C’est pour la fille de la soute. Derrière les caisses. Moi, j’en ajoutais un peu le matin ; Théo aussi, avant lui. Maintenant qu’il est plus là, il n’y a plus que moi.', 'rations2', { fx: ['set:noe_parle_cache', 'set:ration_coupable', 'obj:q_ration.enquete'] }),
    rations2: n('Il vous fixe, le menton tremblant.', [
      c('Je promets. Tu as bien fait.', 'hub', { fx: ['trust:noe+2'] }),
      c('Il va falloir le dire à Rosa.', 'hub', { fx: ['trust:noe-1'] }),
    ]),
    expe: n([
      { if: 'trust:noe>=1', text: 'Dehors ? Pour de vrai ? Je suis petit, je passe partout ! Dis oui, dis oui !' },
      { if: 'true', text: 'Avec toi ? Bof.' },
    ], [back('On verra.')]),
    ext: n([
      { if: 'f:noe_blesse', text: '« Ça va, ça va… J’ai juste un peu mal. Beaucoup. »' },
      { if: 'true', text: '« C’est grand, dehors. Ça sent bizarre. »' },
    ], [bye('Reste près de moi.')]),
  },
};

export const VIC: DialogueDef = {
  id: 'vic', npc: 'vic',
  start: [{ if: 'f:vic_rancune & !seen:vic.rancune', go: 'rancune' }, { go: 'hub' }],
  nodes: {
    rancune: s('Toi. On m’a privé de dîner à cause d’un mensonge. Mes prix viennent de doubler, l’ami.', 'hub'),
    hub: n('Vic écarte les pans de son manteau : un étal portatif de trésors douteux. « Tout se troque. Même les secrets. »', [
      c('Acheter…', 'acheter'),
      c('Vendre…', 'vendre'),
      c('Théo est venu te voir, récemment ?', 'theo', { if: '!e:t_vic_k3' }),
      bye(),
    ]),
    acheter: n('Jetons : {tok}. Qu’est-ce qui te ferait plaisir ?', [
      c('Masque filtrant — 14 jetons', 'acheter', { if: 'tok>=14 & !f:vic_masque', fx: ['tok:-14', 'give:masque', 'set:vic_masque'] }),
      c('Pied-de-biche — 8 jetons', 'acheter', { if: 'tok>=8 & !f:vic_pied', fx: ['tok:-8', 'give:pied_de_biche', 'set:vic_pied'] }),
      c('Cric hydraulique — 10 jetons', 'acheter', { if: 'tok>=10 & !f:vic_cric', fx: ['tok:-10', 'give:cric', 'set:vic_cric'] }),
      c('Bandage — 4 jetons', 'acheter', { if: 'tok>=4', fx: ['tok:-4', 'give:bandage'] }),
      c('Jerrican vide — 3 jetons', 'acheter', { if: 'tok>=3 & !f:vic_jerrican', fx: ['tok:-3', 'give:jerrican', 'set:vic_jerrican'] }),
      c('Antibiotiques — 30 jetons', 'acheter', { if: 'tok>=30 & !f:vic_antibio & !char:passager', fx: ['tok:-30', 'give:antibio', 'set:vic_antibio', 'obj:qp_passager.trouver'] }),
      c('Antibiotiques — 20 jetons (prix d’ami)', 'acheter', { if: 'tok>=20 & !f:vic_antibio & char:passager', tag: 'Débrouille', fx: ['tok:-20', 'give:antibio', 'set:vic_antibio', 'obj:qp_passager.trouver'] }),
      c('Ration — 5 jetons', 'acheter', { if: 'tok>=5', fx: ['tok:-5', 'give:ration'] }),
      back('Rien pour l’instant.'),
    ]),
    vendre: n('Montre voir ce que tu as.', [
      c('Tabac — 5 jetons', 'vendre', { if: 'has:tabac', fx: ['take:tabac', 'tok:+5'] }),
      c('Piles — 6 jetons', 'vendre', { if: 'has:piles', fx: ['take:piles', 'tok:+6'] }),
      c('Eau-de-vie — 8 jetons', 'vendre', { if: 'has:alcool', fx: ['take:alcool', 'tok:+8'] }),
      c('Montre gousset — 16 jetons', 'vendre', { if: 'has:montre', fx: ['take:montre', 'tok:+16'] }),
      c('Café — 5 jetons', 'vendre', { if: 'has:cafe', fx: ['take:cafe', 'tok:+5'] }),
      back('C’est tout.'),
    ]),
    theo: n([
      { if: 'char:passager', text: 'Pour toi, c’est gratuit. Il y a trois jours, Théo m’a demandé un relais K3. Je n’en avais pas. Il avait l’air de quelqu’un qui prépare une bêtise.' },
      { if: 'true', text: 'Une info sur Théo ? Ça vaut trois jetons, l’ami.' },
    ], [
      c('Merci, Vic.', 'hub', { if: 'char:passager', fx: ['entry:t_vic_k3'] }),
      c('Payer 3 jetons.', 'theo_paye', { if: '!char:passager & tok>=3', fx: ['tok:-3'] }),
      back('Trop cher.'),
    ]),
    theo_paye: s('Il y a trois jours, Théo m’a demandé un relais K3. Je n’en avais pas. Il voulait savoir où on trouve ces relais : dans les dépôts de signalisation, m’a-t-il dit. Comme on parle d’une mauvaise idée.', 'hub', { fx: ['entry:t_vic_k3'] }),
  },
};

export const AGATHE: DialogueDef = {
  id: 'agathe', npc: 'agathe',
  start: 'hub',
  nodes: {
    hub: n('Agathe pose son jerrican vide et s’étire le dos. « On porte de l’eau qu’on n’a plus. C’est drôle, non ? »', [
      c('Tu as remarqué quelque chose d’étrange, la nuit dernière ?', 'nuit', { if: '!e:t_agathe_soute' }),
      c('Comment va l’eau ?', 'eau', { once: true }),
      bye(),
    ]),
    nuit: n([
      { if: 'char:passager | trust:agathe>=1 | char:mecanicien', text: 'Vers 23 h, je suis allée remplir les gourdes des petits. La grille de la réserve était ouverte. Quelqu’un portait des jerricans vers l’arrière du train. Il faisait noir, je n’ai pas vu qui.' },
      { if: 'true', text: 'Rien vu, rien entendu. Les gens qui voient des choses, ici, finissent par avoir des ennuis.' },
    ], undefined, { next: 'nuit_fin' }),
    nuit_fin: { route: [{ if: 'char:passager | trust:agathe>=1 | char:mecanicien', go: 'nuit_ok' }, { go: 'nuit_non' }] },
    nuit_ok: s('Vers l’arrière, donc. Ils ont traversé les dortoirs sans s’arrêter ; après, il n’y a que l’administration… et le Salon.', 'hub', { fx: ['entry:t_agathe_soute'] }),
    nuit_non: n('Elle hausse les épaules.', [
      c('Je t’offre un peu de tabac, pour le dos.', 'nuit_tabac', { if: 'has:tabac' }),
      back('Tant pis.'),
    ]),
    nuit_tabac: nar('Elle empoche le tabac avec un demi-sourire.', 'nuit', { fx: ['take:tabac', 'trust:agathe+1'] }),
    eau: s([
      { if: 'obj:filtration=repare', text: 'Ça repart, depuis que la filtration tourne. Je n’ai jamais été aussi contente de porter des jerricans pleins.' },
      { if: 'res:water<2', text: 'Il reste à peine de quoi tenir deux jours. Après… je ne veux pas savoir.' },
      { if: 'true', text: 'Trois jours de réserve, à peu près. Si la filtration ne repart pas, on boira l’eau des radiateurs.' },
    ], 'hub'),
  },
};

export const JOSEFA: DialogueDef = {
  id: 'josefa', npc: 'josefa',
  start: 'hub',
  nodes: {
    hub: n([
      { if: 'char:majordome', text: 'Josefa ajuste son col. « Edmond. Madame vous a sonné deux fois. »' },
      { if: 'true', text: 'Josefa vous barre à moitié le passage, avec un sourire professionnel. « Le Salon est réservé, d’habitude. Mais rien n’est habituel aujourd’hui. »' },
    ], [
      c('Vous étiez de service, cette nuit ?', 'nuit', { if: '!e:t_hotesse_castel' }),
      c('Que pensez-vous de Madame ?', 'madame', { once: true }),
      bye(),
    ]),
    nuit: n([
      { if: 'char:majordome | trust:josefa>=1', text: 'J’ai porté une tisane à l’administration, vers minuit vingt. J’ai croisé Castel dans le couloir. Essoufflé, la matraque à la main. Il ne m’a même pas vue.' },
      { if: 'true', text: 'J’étais de service, oui. Je n’ai rien vu dont je puisse parler.' },
    ], undefined, { next: 'nuit_fin' }),
    nuit_fin: { route: [{ if: 'char:majordome | trust:josefa>=1', go: 'nuit_ok' }, { go: 'nuit_non' }] },
    nuit_ok: s('Je ne l’ai dit à personne. Castel a des yeux partout.', 'hub', { fx: ['entry:t_hotesse_castel'] }),
    nuit_non: n('Elle regarde nerveusement vers l’administration.', [
      c('Vous pouvez me faire confiance. Ça restera entre nous.', 'nuit_promesse', { if: 'char:controleur | char:passager' }),
      c('Deux jetons pour votre discrétion ?', 'nuit_jetons', { if: 'tok>=2' }),
      back('Je comprends.'),
    ]),
    nuit_promesse: nar('Josefa vous jauge un long moment, puis baisse la voix.', 'nuit', { fx: ['trust:josefa+1'] }),
    nuit_jetons: nar('Les jetons disparaissent dans sa poche de tablier.', 'nuit', { fx: ['tok:-2', 'trust:josefa+1'] }),
    madame: s('Madame est généreuse avec ceux qui lui sont utiles. Les autres, elle ne les voit pas. Moi, elle me voit encore. Pour l’instant.', 'hub'),
  },
};

export const VILLIERS: DialogueDef = {
  id: 'villiers', npc: 'villiers',
  start: [
    { if: 'char:majordome & !seen:villiers.lettre', go: 'lettre' },
    { if: 'f:lettre_revelee', go: 'froide' },
    { go: 'hub' },
  ],
  nodes: {
    lettre: s('Edmond. Enfin. Cette lettre doit parvenir à M. Marchetti, en main propre. Aujourd’hui. Et vous ne la confiez à personne, cela va sans dire.', 'lettre2', { fx: ['quest:qp_majordome'] }),
    lettre2: n('Elle vous tend l’enveloppe scellée de cire rose. Ses bagues cliquettent.', [
      c('Bien, Madame.', 'hub'),
      c('Puis-je savoir de quoi il s’agit, Madame ?', 'lettre3'),
    ]),
    lettre3: s('Vous pouvez savoir que vous êtes à mon service depuis vingt ans, Edmond. Cela devrait suffire.', 'hub', { fx: ['trust:villiers-1'] }),
    froide: n('Madame de Villiers regarde à travers vous comme à travers une vitre sale.', [bye()]),
    hub: n('Madame de Villiers fait tourner le cognac dans son verre. « Oui ? »', [
      c('Vous connaissiez Théo Lagarde ?', 'theo', { if: '!e:t_villiers_theo' }),
      c('Votre garde-manger est plein de l’eau de tout le monde.', 'eau', { if: 'e:f_detournement & !f:villiers_confrontee' }),
      c('Ouvrir la lettre à la vapeur, dans l’office.', 'ouvrir', { if: 'char:majordome & has:lettre_madame', tag: 'Discret' }),
      bye(),
    ]),
    theo: n([
      { if: 'char:majordome | trust:villiers>=1', text: 'Ce garçon réparait mon chauffe-eau. Charmant, mais il posait beaucoup trop de questions sur mon garde-manger. Les domestiques curieux finissent mal, Edmond — vous le savez mieux que personne.' },
      { if: 'true', text: 'Je ne fréquente pas le personnel de maintenance.' },
    ], undefined, { next: 'theo_fin' }),
    theo_fin: { route: [{ if: 'char:majordome | trust:villiers>=1', go: 'theo_ok' }, { go: 'hub' }] },
    theo_ok: s('Ne faites pas cette tête. Je ne lui ai rien fait. Je n’ai pas besoin de faire quoi que ce soit, d’ordinaire.', 'hub', { fx: ['entry:t_villiers_theo'] }),
    eau: s('Je paie, mon ami. Avec ce qui manque le plus à bord : des médicaments. Marchetti les porte à l’infirmerie. Chaque litre que je bois a sauvé un enfant. Pouvez-vous en dire autant ?', 'hub', { fx: ['set:villiers_confrontee', 'entry:f_echange_antibio'] }),
    ouvrir: nar('Dans l’office, au-dessus de la bouilloire, la cire se ramollit. « Plus une goutte ne sortira de mon garde-manger tant que ce garçon parlera de ce qu’il a vu. Arrangez-vous pour qu’il se taise. Le prix habituel. — C. de V. » Quel garçon ?', 'hub', { fx: ['take:lettre_madame', 'give:lettre_ouverte', 'set:lettre_lue', 'entry:c_lettre_madame', 'time:15'] }),
  },
};

export const THEO: DialogueDef = {
  id: 'theo', npc: 'theo',
  start: [{ if: 'zone:train', go: 'train' }, { if: '!seen:theo.rencontre', go: 'rencontre' }, { go: 'hub' }],
  nodes: {
    train: n([
      { if: 'char:mecanicien & e:f_pompe_morte & !f:vasseur_couverte', text: 'Théo grimace en souriant. « Malo. Tu sais pour la pompe ? Elle n’avait pas le choix. Dis-lui que je n’en ai jamais douté. »' },
      { if: 'char:mecanicien', text: 'Théo grimace en souriant. « Malo. Dis à Vasseur que je lui dois une pompe. Et à Mara… dis-lui que je suis désolé pour la radio. »' },
      { if: 'true', text: 'Théo somnole, la jambe sanglée. Il vous remercie d’un hochement de tête.' },
    ], [
      c('Raconte-moi cette nuit-là.', 'recit', { if: '!e:t_theo_recit' }),
      bye(),
    ]),
    rencontre: s([
      { if: 'char:mecanicien', text: 'Malo ? … Bon sang, Malo. Je savais que si quelqu’un venait, ce serait toi.' },
      { if: 'true', text: 'Vous venez du VAYN ? Il n’est pas parti ? Dieu merci…' },
    ], 'hub', { fx: ['met:theo', 'obj:q_main.theo'] }),
    hub: n('Théo est allongé sur un lit de camp, la jambe bandée de chiffons. Fiévreux, mais lucide.', [
      c('Qu’est-ce qui s’est passé, Théo ?', 'recit', { if: '!e:t_theo_recit' }),
      c('Mara va bien.', 'mara', { if: 'met:mara & !f:theo_mara_dit' }),
      c('Soigner sa jambe.', 'soigne', { if: '(has:bandage_comp | has:antibio | has:bandage) & !f:theo_soigne' }),
      c('On te ramène au train.', 'ramener', { if: '!f:theo_suit & !f:theo_reste' }),
      c('Tu dois rester ici, pour l’instant.', 'rester', { if: '!f:theo_suit & !f:theo_reste' }),
      bye('Je reviens.'),
    ]),
    recit: s('J’ai pris le K3 de la filtration pour réparer la radio. Pour Mara — pour qu’elle entende Clairval. Une nuit seulement. Je ne savais pas que la pompe de secours était vide. Je te jure que je ne savais pas.', 'recit2'),
    recit2: s('Castel m’a surpris en sortant de la salle radio. Il a dit qu’il me mettrait en cellule, qu’il dirait que j’avais saboté le train. J’ai paniqué. Je me suis dit : je trouve un K3 au dépôt, je répare tout, et personne ne saura.', 'recit3'),
    recit3: s('La poutre a cédé sur ma jambe. J’ai rampé jusqu’ici. Anselme m’a ramassé. C’est tout. C’est bête, hein ?', 'hub', { fx: ['entry:t_theo_recit'] }),
    mara: s('Elle va bien ? Vraiment ? … Alors ça valait le coup. Presque.', 'hub', { fx: ['set:theo_mara_dit'] }),
    soigne: n([
      { if: 'f:soin_trousse', text: 'Vous videz la trousse de secours : antiseptique, gaze, bandage propre. Théo serre les dents, puis souffle, soulagé. Il pourra marcher, avec de l’aide.' },
      { if: 'f:soin_antibio', text: 'Vous n’avez pas de trousse : vous vous enservez avec les antibiotiques et une compresse. Théo serre les dents, puis souffle, soulagé. Il pourra marcher, avec de l’aide.' },
      { if: 'true', text: 'Vous faites de votre mieux avec ce que vous avez. Théo serre les dents, puis souffle, soulagé. Il pourra marcher, avec de l’aide.' },
    ], undefined, { next: 'hub', fx: ['if:has:bandage_comp?take:bandage_comp;set:soin_trousse', 'if:!f:soin_trousse & has:antibio?take:antibio;set:soin_antibio', 'if:!f:soin_trousse & !has:antibio?take:bandage', 'set:theo_soigne', 'time:15'] }),
    ramener: n([
      { if: 'f:theo_soigne | comp:vasseur | comp:castel', text: 'Il se redresse en serrant les dents. « Allons-y. Doucement. »' },
      { if: 'true', text: 'Je ne tiendrai pas debout sans un vrai pansement, ou quelqu’un de costaud pour me porter.' },
    ], undefined, { next: 'ramener_fin' }),
    ramener_fin: { route: [{ if: 'f:theo_soigne | comp:vasseur | comp:castel', go: 'ramener_ok' }, { go: 'hub' }] },
    ramener_ok: nar('Théo passe un bras autour de vos épaules. Vous avancerez moins vite, mais il rentre.', undefined, { fx: ['set:theo_suit', 'loc:theo='] }),
    rester: s('Anselme s’occupera de moi. Si le train peut s’arrêter au signal… Il connaît le levier n° 4. Allez. Ne ratez pas votre train à cause de moi.', 'hub', { fx: ['set:theo_reste'] }),
  },
};

export const ANSELME: DialogueDef = {
  id: 'anselme', npc: 'anselme',
  start: [{ if: '!seen:anselme.rencontre', go: 'rencontre' }, { go: 'hub' }],
  nodes: {
    rencontre: n([
      { if: 'comp:mara', text: 'Un vieil homme braque un fusil sur la porte, puis l’abaisse en voyant Mara. « La petite du barrage ! Entrez. Entrez vite. »' },
      { if: 'true', text: 'Un vieil homme braque un fusil de chasse sur la porte. « Un pas de plus et je tire. Qui vous envoie ? »' },
    ], [
      c('Le VAYN. On cherche un homme blessé, Théo.', 'rencontre2'),
      c('Personne. On passait.', 'rencontre_mefiant'),
    ]),
    rencontre2: s('Le gamin à la jambe cassée ? Il est là. Je l’ai traîné hors du talus avant que les chiens s’en chargent. Entrez. Doucement.', 'hub', { fx: ['trust:anselme+1'] }),
    rencontre_mefiant: s('Personne ne passe par Saint-Aubin. Plus maintenant. Mais vous n’avez pas l’air de pillards. Pas assez maigres.', 'hub'),
    hub: n([
      { if: 'f:mara_expulsee', text: 'Anselme garde son fusil en travers des genoux. « La petite du barrage ? Je l’ai installée près du poêle, avec de l’eau et une couverture. Elle n’a pas voulu rester : avant l’aube, elle remontait vers la vallée. »' },
      { if: 'true', text: 'Anselme garde son fusil en travers des genoux. Derrière lui, les leviers luisent de graisse.' },
    ], [
      c('Depuis quand êtes-vous ici ?', 'histoire', { if: '!e:t_anselme' }),
      c('Le récepteur, là, il capte Clairval ?', 'radio', { once: true }),
      c('Pouvez-vous mettre le signal au rouge ? Le train s’arrêterait ici.', 'signal', { if: '!f:anselme_accord' }),
      c('Vous avez besoin de quelque chose ?', 'troc', { if: '!f:anselme_troc' }),
      bye(),
    ]),
    histoire: s('Depuis toujours. Aiguilleur, comme mon père. Il y a un mois, un train est passé sans s’arrêter. Même livrée que le vôtre, même nom sur la caisse. Un VAYN. Il roulait vers le sud comme s’il avait le diable aux trousses.', 'hub', { fx: ['entry:t_anselme'] }),
    radio: s('Il capte une voix, en boucle. Le barrage. Ça fait des semaines que c’est la même. Les vivants, ça change de message, d’habitude.', 'hub'),
    signal: n([
      { if: 'trust:anselme>=1 | comp:mara | f:anselme_troc', text: 'Le levier n° 4. Il ne sert plus à rien depuis des mois. Pour vous… d’accord. Votre train s’arrêtera devant ma porte, et vous prendrez le gamin avec vous.' },
      { if: 'true', text: 'Et pourquoi je ferais ça pour des inconnus ?' },
    ], undefined, { next: 'signal_fin' }),
    signal_fin: { route: [{ if: 'trust:anselme>=1 | comp:mara | f:anselme_troc', go: 'signal_ok' }, { go: 'hub' }] },
    signal_ok: s('Allez-y, tirez le n° 4 avec moi quand vous voulez.', 'hub', { fx: ['set:anselme_accord'] }),
    troc: n('De quoi manger. Et des nouvelles du monde, si vous en avez.', [
      c('Lui donner une ration.', 'troc_ok', { if: 'has:ration', fx: ['take:ration'] }),
      c('Lui donner une conserve.', 'troc_ok', { if: 'has:conserve', fx: ['take:conserve'] }),
      c('Lui raconter le train, les deux cents passagers.', 'troc_nouvelles'),
    ]),
    troc_ok: s('Il mange la moitié tout de suite et range le reste avec soin. « Vous êtes des gens bien. Il en reste. »', 'hub', { fx: ['set:anselme_troc', 'trust:anselme+1'] }),
    troc_nouvelles: s('Deux cents. Deux cents vivants qui roulent. … Merci. Ça fait du bien de savoir ça.', 'hub', { fx: ['trust:anselme+1'] }),
  },
};
