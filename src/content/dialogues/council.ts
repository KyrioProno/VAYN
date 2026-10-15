// Dialogues des quatre membres du conseil.
import type { DialogueDef } from '../../engine/types';
import { back, bye, c, n, nar, pc, s } from './util';

export const CASTEL: DialogueDef = {
  id: 'castel', npc: 'castel',
  start: [
    { if: 'zone:exterior', go: 'ext' },
    { if: '!seen:castel.hub', go: 'premier' },
    { go: 'hub' },
  ],
  nodes: {
    premier: n([
      { if: 'char:controleur', text: 'Fontaine. Un homme en moins, un train à l’arrêt, et les voitures qui murmurent. J’attends du Contrôle autre chose que des billets poinçonnés.' },
      { if: 'char:passager', text: 'Morin. Je t’ai à l’œil, tu le sais. Si tu as quelque chose à dire sur cette nuit, c’est maintenant.' },
      { if: 'char:majordome', text: 'Lavigne. Madame vous envoie aux nouvelles ? Dites-lui que tout est sous contrôle.' },
      { if: 'true', text: 'Kerbrat. Ta cheffe m’a déjà servi sa version. J’écoute la tienne.' },
    ], undefined, { next: 'hub' }),
    hub: n([
      { if: 'f:castel_avoue', text: 'Castel garde les yeux baissés sur son registre des rondes.' },
      { if: 'true', text: 'Castel croise les bras. Sa matraque pend à sa ceinture, à portée de main.' },
    ], [
      c('Que s’est-il passé cette nuit ?', 'nuit', { once: true }),
      c('Vous avez croisé Théo cette nuit, n’est-ce pas ?', 'confronte', { if: 'e:t_hotesse_castel & !f:castel_avoue' }),
      c('Parlons de la radio.', 'radio', { if: '(e:c_relais_radio | e:c_registre_radio) & !f:castel_radio_dite' }),
      c('J’ai besoin de la clé de la salle radio.', 'cle', { if: '!has:cle_radio & !door:d_radio=open' }),
      c('Un café, chef ? Vous n’avez pas fermé l’œil.', 'cafe', { if: 'char:majordome & !has:cle_radio & !f:cafe_castel', tag: 'Service' }),
      c('La fouille de la soute, c’est pour quand ?', 'fouille', { if: 'met:mara & clock<16:00 & !f:fouille_detournee & !f:mara_capturee' }),
      c('La fille, dans la cellule…', 'cellule', { if: 'f:mara_capturee & !f:mara_libre' }),
      c('Le registre des passagers, je peux le consulter ?', 'registre', { if: '!char:controleur & !f:registre_autorise' }),
      c('Vous serez de l’expédition ?', 'expe', { if: 'ev:conseil & !ev:expedition_depart' }),
      bye(),
    ]),
    nuit: s('À 23 h 52, le pilote automatique a coupé. Arrêt de sécurité. La filtration est morte, et Théo Lagarde a disparu. Pas de corps, pas de mot.', 'nuit2'),
    nuit2: s('Il a dû sauter. Un instable, ce garçon. Toujours à traîner où il ne devait pas. Je ne l’ai pas vu de la nuit.', 'hub', { fx: ['entry:t_castel_version'] }),
    confronte: pc('Josefa vous a vu dans le couloir de l’administration à minuit vingt. Matraque à la main. Essoufflé.', 'confronte2'),
    confronte2: n('Castel se fige. Un muscle tressaille sur sa mâchoire.', [
      c('Dites-moi la vérité. Je ne suis pas votre ennemi.', 'aveu', { if: 'trust:castel>=1 | char:controleur' }),
      c('Vous lui avez fait du mal ?', 'nie', { if: '!trust:castel>=1 & !char:controleur' }),
      c('Et ce journal radio tamponné « H.C. » ?', 'aveu', { if: 'e:c_registre_radio' }),
    ]),
    nie: s('Je n’ai touché à personne. Sortez, avant que je trouve une raison de vous garder ici.', 'hub', { fx: ['susp:castel+1', 'trust:castel-1'] }),
    aveu: s('… Je l’ai surpris en sortant de la salle radio. Minuit vingt. Il avait bricolé le poste. Je l’ai menacé de la cellule — je voulais lui faire peur, pas plus.', 'aveu2'),
    aveu2: s('Il a filé vers l’arrière. Dix minutes après, il n’était plus à bord. Si j’avais su qu’il sauterait… Ce que je vous dis là ne sort pas d’ici.', 'aveu3', { fx: ['entry:t_castel_aveu', 'set:castel_avoue', 'obj:q_main.theo'] }),
    aveu3: n('Il attend votre réponse, la mâchoire serrée.', [
      c('Ça restera entre nous.', 'hub', { fx: ['trust:castel+2', 'set:castel_couvert'] }),
      c('Le conseil devra l’entendre.', 'hub', { fx: ['trust:castel-1', 'set:castel_a_reveler'] }),
    ]),
    radio: s('Ce poste est hors service depuis des semaines. Fin de l’histoire.', 'radio2'),
    radio2: n('Il soutient votre regard un peu trop longtemps.', [
      c('Il y a un journal d’écoute, tamponné « NE PAS DIFFUSER — H.C. ».', 'radio_aveu', { if: 'e:c_registre_radio' }),
      c('Quelqu’un l’a réparé, pourtant. Avec le K3 de la filtration.', 'radio_k3', { if: 'e:c_relais_radio & !e:c_registre_radio' }),
      back('Laisser tomber.'),
    ]),
    radio_k3: s('Alors c’est Théo qui a tué la filtration. Voilà votre coupable. Écrivez-le dans votre petit carnet.', 'hub', { fx: ['susp:castel+1'] }),
    radio_aveu: s('Oui. J’ai entendu Clairval. Trois soirs. Une voix qui dit « venez ». Et j’ai coupé le poste.', 'radio_aveu2', { fx: ['set:castel_radio_dite'] }),
    radio_aveu2: s('Vous savez ce qui arrive si deux cents personnes apprennent qu’il y a un abri à deux jours de marche ? Elles ouvrent les portes. Elles partent dans la brume. Elles meurent dans un fossé, à trois kilomètres d’ici.', 'radio_aveu3'),
    radio_aveu3: n('Il n’a pas l’air de s’excuser. Il a l’air épuisé.', [
      c('Vous n’aviez pas le droit de décider pour tout le monde.', 'hub', { fx: ['susp:castel+1', 'set:radio_a_reveler'] }),
      c('Je comprends. Mais ça ne pourra pas rester caché.', 'hub', { fx: ['trust:castel+1', 'set:radio_a_reveler'] }),
      c('Je comprends. Je garderai ça pour moi.', 'hub', { fx: ['trust:castel+2', 'set:radio_couverte'] }),
    ]),
    cle: n('La clé ne quitte pas ma ceinture.', [
      c('Règlement, article 12 : le Contrôle accède à toute salle technique en cas d’incident.', 'cle_ok', { if: 'char:controleur & e:c_alarmes', tag: 'Autorité' }),
      c('Faites-moi confiance, chef.', 'cle_ok', { if: 'trust:castel>=2' }),
      c('Le conseil l’exigera, de toute façon.', 'cle_non', { if: '!trust:castel>=2' }),
      back('Tant pis.'),
    ]),
    cle_ok: s('Il décroche la clé avec une lenteur calculée. « Vous me la rendez avant ce soir. Et vous ne touchez à rien. »', 'hub', { fx: ['give:cle_radio', 'susp:castel+1'] }),
    cle_non: s('Le conseil n’a rien exigé du tout. Au revoir.', 'hub'),
    cafe: nar('Vous lui tendez une tasse fumante. Castel la prend sans même vous regarder — on ne regarde pas un domestique. Quand vous repartez avec la tasse vide, sa clé de la salle radio repose au fond de votre poche.', 'hub', { fx: ['give:cle_radio', 'set:cafe_castel'] }),
    fouille: s('À seize heures, je retourne la soute. Caisse par caisse. Si Théo avait un complice, je le trouverai.', 'fouille2'),
    fouille2: n('Il tapote sa matraque.', [
      c('J’ai vu quelqu’un rôder vers le Salon cette nuit. Pas vers la soute.', 'detourne', { if: 'char:passager | char:majordome', tag: 'Mensonge' }),
      c('Bonne chasse.', 'hub'),
    ]),
    detourne: s('Vers le Salon ? … Je ferai d’abord un tour là-bas, alors. Si vous m’avez menti, je le saurai.', 'hub', { fx: ['set:fouille_detournee', 'susp:castel+1'] }),
    cellule: s('Elle se cachait dans la soute. Complice de Théo, j’en mettrais ma main au feu. Le conseil décidera de son sort.', 'cellule2'),
    cellule2: n('Derrière les barreaux, la fille ne vous quitte pas des yeux.', [
      c('C’est la fille de la docteure Sorel.', 'cellule_mere', { if: 'e:f_mere' }),
      c('Elle n’est pas dangereuse. Laissez-la sortir.', 'cellule_non'),
      back('Je vois.'),
    ]),
    cellule_mere: s('… La fille de Sorel ? Bon sang. Bon sang. Qu’elle aille voir sa mère. Mais elle reste à bord, et sous ma responsabilité.', 'hub', { fx: ['set:mara_libre', 'trust:castel+1', 'loc:mara='] }),
    cellule_non: s('Ce n’est pas à vous d’en décider. Ni à moi. Au conseil.', 'hub'),
    registre: n('Le registre ? Pour quoi faire ?', [
      c('Pour retrouver Théo plus vite que vous.', 'registre_ok', { if: 'trust:castel>=1' }),
      c('Simple curiosité.', 'registre_non'),
    ]),
    registre_ok: s('… Prenez-le au bureau du Contrôle. Dites que c’est moi qui vous envoie.', 'hub', { fx: ['set:registre_autorise'] }),
    registre_non: s('La curiosité, ça se soigne en cellule.', 'hub'),
    expe: n([
      { if: 'trust:castel<0', text: 'Avec vous ? Je préfère garder le train.' },
      { if: 'true', text: 'Si le conseil le veut. Quelqu’un doit tenir une arme, dehors. Les chiens, la brume, et le reste.' },
    ], [back('Bien.')]),
    ext: n([
      { if: 'f:coup_de_feu', text: 'Castel recharge sans un mot. « On traîne pas. »' },
      { if: 'clock>=10:00', text: '« La brume monte. On a une heure, peut-être moins. »' },
      { if: 'true', text: '« Reste à vue. Ici, on ne crie pas, on ne court pas. »' },
    ], [bye('Allons-y.')]),
  },
};

export const VASSEUR: DialogueDef = {
  id: 'vasseur', npc: 'vasseur',
  start: [
    { if: 'zone:exterior', go: 'ext' },
    { if: '!seen:vasseur.hub', go: 'premier' },
    { go: 'hub' },
  ],
  nodes: {
    premier: n([
      { if: 'char:mecanicien', text: 'Malo. La filtration est morte, Théo s’est envolé, et Castel me tourne autour comme un vautour. Dis-moi que tu as une bonne nouvelle.' },
      { if: 'true', text: 'Si c’est pour me demander quand l’eau revient : je n’en sais rien. Si c’est pour Théo : je n’en sais pas plus.' },
    ], undefined, { next: 'hub' }),
    hub: n([
      { if: 'f:vasseur_avoue', text: 'Vasseur essuie ses mains sur un chiffon, sans vous regarder.' },
      { if: 'true', text: 'Vasseur relève ses lunettes de soudeuse sur son front.' },
    ], [
      c('Qu’est-ce qui a lâché, exactement ?', 'panne', { once: true }),
      c('Et Théo ? Vous le connaissez mieux que personne.', 'theo', { if: '!e:t_vasseur_theo' }),
      c('La pompe de secours n’a plus de moteur.', 'pompe', { if: 'e:c_pompe_secours & !f:vasseur_avoue' }),
      c('Il me faudrait la clé du casier de Théo.', 'casier', { if: '!has:cle_casier & !obj:casier_theo=ouvert' }),
      c('J’ai un relais K3. On peut relancer la filtration ?', 'k3', { if: 'has:relais_k3 & !obj:filtration=repare' }),
      c('Le stérilisateur de l’infirmerie, c’est réparable ?', 'steri', { if: '!up:up_sterilisateur', once: true }),
      c('Vous viendrez à l’expédition ?', 'expe', { if: 'ev:conseil & !ev:expedition_depart' }),
      bye(),
    ]),
    panne: s('Quelqu’un a sorti le relais K3 de la filtration. Proprement, comme un pro. Et la pompe de secours n’a pas pris le relais. Deux pannes en une nuit, ça ne s’appelle pas de la malchance.', 'hub'),
    theo: s('Théo n’abandonnerait jamais son poste. Jamais. S’il est parti, c’est qu’on l’y a poussé. Demandez donc à Castel où il était cette nuit.', 'hub', { fx: ['entry:t_vasseur_theo'] }),
    pompe: n('Elle a été révisée il y a quinze jours. C’est dans le carnet.', [
      c('Le bon de sortie n° 112 dit le contraire. Le moteur est dans les bacs hydroponiques.', 'pompe_aveu', { if: 'e:c_bon_sortie | f:moteur_identifie' }),
      c('Le carnet ment, et vous le savez.', 'pompe_aveu', { if: 'e:f_pompe_morte' }),
      c('Tu m’as fait signer, Odile. J’ai vu la poussière dans le carter.', 'pompe_aveu', { if: 'char:mecanicien & e:c_carnet_entretien' }),
      back('Si vous le dites.'),
    ]),
    pompe_aveu: s('… D’accord. Oui. J’ai pris le moteur pour les bacs. La circulation avait lâché, on perdait toute la récolte — la moitié des légumes du train. J’allais le remettre. « Bientôt. » Comme tout ici.', 'pompe_aveu2', { fx: ['entry:t_vasseur_pompe', 'set:vasseur_avoue'] }),
    pompe_aveu2: n([
      { if: 'char:mecanicien', text: 'Et toi, tu as signé avec moi. Si ça sort, on tombe tous les deux, Malo.' },
      { if: 'true', text: 'Sans pompe de secours, la panne de cette nuit a arrêté le train. Je le sais. Vous croyez que je dors ?' },
    ], [
      c('J’avouerai devant le conseil que j’ai signé sans vérifier.', 'malo_aveu', { if: 'char:mecanicien', fx: ['set:malo_avoue', 'obj:qp_mecanicien.vasseur', 'obj:qp_mecanicien.choix', 'conseq:cq_malo_aveu', 'trust:vasseur-1'] }),
      c('Je te couvre. Le carnet reste comme il est.', 'malo_couvre', { if: 'char:mecanicien', fx: ['set:malo_couvre', 'set:vasseur_couverte', 'obj:qp_mecanicien.vasseur', 'obj:qp_mecanicien.choix', 'conseq:cq_malo_couvre', 'trust:vasseur+2', 'debt:vasseur+1'] }),
      c('On dira que c’est Théo qui a signé. Il n’est pas là pour dire le contraire.', 'malo_theo', { if: 'char:mecanicien', fx: ['set:malo_accuse_theo', 'obj:qp_mecanicien.vasseur', 'obj:qp_mecanicien.choix', 'conseq:cq_malo_accuse_theo', 'trust:vasseur+1'] }),
      c('Je garderai ça pour moi.', 'hub', { if: '!char:mecanicien', fx: ['set:vasseur_couverte', 'trust:vasseur+2', 'debt:vasseur+1'] }),
      c('Le conseil doit savoir.', 'hub', { if: '!char:mecanicien', fx: ['set:vasseur_a_reveler', 'trust:vasseur-1'] }),
    ]),
    malo_aveu: s('Tu es plus honnête que moi. Plus bête aussi. … Merci de ne pas me laisser seule là-dedans.', 'hub'),
    malo_couvre: s('Je te revaudrai ça. Et on remontera ce moteur dès qu’on aura une pièce de rechange pour les bacs. Promis.', 'hub'),
    malo_theo: s('Elle vous regarde longtemps. « C’est toi qui le dis. Moi, je n’ai rien entendu. » Elle ne vous regarde plus tout à fait pareil.', 'hub'),
    casier: n('Ses affaires, c’est ses affaires.', [
      c('S’il y a une piste dans ce casier, c’est pour lui qu’on la cherche.', 'casier_ok', { if: 'trust:vasseur>=1' }),
      c('Je le forcerai, alors.', 'casier_non'),
    ]),
    casier_ok: s('Elle décroche une petite clé numérotée de son trousseau. « Numéro 7. Si tu trouves quelque chose qui l’aide, tu viens me voir d’abord. »', 'hub', { fx: ['give:cle_casier'] }),
    casier_non: s('Essaie seulement, et je te fais bouffer ton pied-de-biche.', 'hub', { fx: ['susp:vasseur+1'] }),
    k3: s('Un K3 ? Où tu as trouvé ça ? … Donne. Laisse-moi faire.', 'k3_2'),
    k3_2: nar('Vasseur file aux machines, vous sur les talons. Une demi-heure plus tard, la filtration se remet à ronronner. Elle reste un long moment la main posée sur la carrosserie tiède.', 'hub', { fx: ['take:relais_k3', 'time:30', 'objst:filtration=repare', 'conseq:cq_filtration', 'set:filtration_reparee', 'obj:q_main.panne', 'trust:vasseur+1', 'sfx:repair'] }),
    steri: s('Une résistance à remplacer, une heure de boulot. Si on me donne une pièce, je le fais. Voyez avec l’onglet des réparations : c’est le conseil qui tient les comptes des pièces.', 'hub'),
    expe: n([
      { if: 'trust:vasseur<0', text: 'Avec toi ? Non. Je reste avec mes machines.' },
      { if: 'true', text: 'Si on va au dépôt, oui. Il y aura des armoires de relais, des poutres pourries, et personne d’autre que moi pour savoir ce qui tient debout.' },
    ], [back('Compris.')]),
    ext: n([
      { if: 'obj:poutre=etayee', text: '« La poutre tiendra. Le reste, je ne promets rien. »' },
      { if: 'clock>=10:00', text: '« Tu sens ça ? La brume. On fait ce qu’on a à faire et on rentre. »' },
      { if: 'true', text: '« Le dépôt est derrière la cour. S’il reste un K3 dans ce bled, il est là-bas. »' },
    ], [bye('En route.')]),
  },
};

export const MARCHETTI: DialogueDef = {
  id: 'marchetti', npc: 'marchetti',
  start: [{ if: 'f:marchetti_destitue', go: 'destitue' }, { go: 'hub' }],
  nodes: {
    destitue: n('Marchetti fixe la table. « Vous êtes contents ? Plus de médicaments du Salon, maintenant. Plus rien. »', [bye()]),
    hub: n([
      { if: 'f:marchetti_avoue', text: 'Marchetti nettoie ses lunettes, encore et encore.' },
      { if: 'true', text: 'Marchetti referme son registre d’un geste sec. « Oui ? »' },
    ], [
      c('Les réserves tombent juste ?', 'comptes', { once: true }),
      c('Qu’est-ce que la « cabine 0 » ?', 'cabine0', { if: '(e:c_registre_cabine0 | e:c_billet_cabine0) & !f:marchetti_avoue' }),
      c('J’aurais besoin de la clé de la réserve.', 'cle', { if: '!has:cle_reserve & !door:d_cage=open' }),
      c('Lou a besoin d’antibiotiques. Vous savez en trouver.', 'lou', { if: 'char:passager & !f:lou_soignee & !f:marchetti_antibio' }),
      c('Une lettre de Madame, en main propre.', 'lettre', { if: 'has:lettre_madame | has:lettre_ouverte' }),
      bye(),
    ]),
    comptes: s('Chaque litre est inscrit. Il y a l’évaporation, la casse, les fuites… Un train, ça fuit de partout.', 'hub', { fx: ['entry:t_marchetti_version'] }),
    cabine0: n('Il pâlit. « Une erreur d’écriture. Une vieille référence. »', [
      c('Quatre jerricans par nuit, vers 23 h. Le compteur de la citerne s’en souvient.', 'aveu', { if: 'e:c_compteur_eau | e:f_detournement' }),
      c('« Quatre jerricans contre une boîte d’amoxicilline. » C’est votre écriture.', 'aveu', { if: 'e:c_lettre_marchetti' }),
      c('Les jerricans de la réserve dorment dans le garde-manger du Salon.', 'aveu', { if: 'e:c_gardemanger_salon' }),
      back('Une erreur d’écriture, bien sûr.'),
    ]),
    aveu: s('… Madame a des médicaments. Beaucoup. Elle les a apportés à bord dans ses malles. Elle veut de l’eau, je lui donne de l’eau. Elle me donne des antibiotiques, je les dépose à l’infirmerie, la nuit.', 'aveu2', { fx: ['entry:t_marchetti_aveu', 'set:marchetti_avoue', 'entry:f_echange_antibio'] }),
    aveu2: n('Sorel ne sait pas d’où ils viennent. Sans ça, trois enfants seraient morts ce mois-ci. Trois. Alors oui, je vole l’eau de tout le monde.', [
      c('Vous auriez dû le dire au conseil.', 'hub', { fx: ['set:audit_preuves', 'trust:marchetti-1'] }),
      c('Je garde ça pour moi. Mais vous me devez beaucoup.', 'couvre', { fx: ['set:marchetti_couvert', 'debt:marchetti+2', 'conseq:cq_marchetti_couvert', 'obj:qp_controleur.choix'] }),
      c('Le conseil en entendra parler ce soir.', 'hub', { fx: ['set:audit_preuves', 'set:marchetti_menace', 'trust:marchetti-2'] }),
    ]),
    couvre: s('Il hoche la tête, soulagé et humilié à la fois. « Je n’oublierai pas. »', 'hub', { fx: ['trust:marchetti+1'] }),
    cle: n('La réserve, c’est ma responsabilité.', [
      c('Le Contrôle doit pouvoir vérifier les stocks. C’est le règlement.', 'cle_ok', { if: 'char:controleur & e:c_tableau_rations', tag: 'Autorité' }),
      c('Vous me devez une faveur.', 'cle_ok', { if: 'debt:marchetti>=1' }),
      back('Je comprends.'),
    ]),
    cle_ok: s('Il vous tend la clé du cadenas du bout des doigts. « Vous refermerez derrière vous. »', 'hub', { fx: ['give:cle_reserve'] }),
    lou: n('Des antibiotiques ? Je ne suis pas pharmacien.', [
      c('Je sais pour la « cabine 0 ». Une boîte pour Lou, et je n’ai rien vu.', 'lou_ok', { if: 'f:marchetti_avoue | e:f_detournement' }),
      c('Je vous en prie.', 'lou_non'),
    ]),
    lou_ok: s('Il ferme les yeux. « La prochaine boîte… je la garde pour votre sœur. Tenez. C’est la dernière que j’avais. »', 'hub', { fx: ['give:antibio', 'set:marchetti_antibio', 'debt:marchetti-1', 'obj:qp_passager.trouver'] }),
    lou_non: s('Je suis désolé. Vraiment.', 'hub'),
    lettre: n([
      { if: 'has:lettre_ouverte', text: 'Il examine le cachet brisé, puis vous. « On lit le courrier de sa maîtresse, maintenant ? »' },
      { if: 'true', text: 'Il brise le cachet rose, lit, soupire longuement.' },
    ], undefined, { next: 'lettre2', fx: ['take:lettre_madame', 'take:lettre_ouverte', 'set:lettre_remise', 'conseq:cq_lettre_remise', 'obj:qp_majordome.remettre'] }),
    lettre2: s('Le gamin… Noé. Il a vu les jerricans, une nuit. Il en parle aux dortoirs. Madame veut que je le fasse taire. Je lui donnerai des rations, je suppose. C’est comme ça qu’on achète le silence, ici.', 'hub', { fx: ['set:garcon_noe', 'obj:qp_majordome.garcon'] }),
  },
};

export const SOREL: DialogueDef = {
  id: 'sorel', npc: 'sorel',
  start: [{ if: 'f:mere_reunie', go: 'reunie' }, { go: 'hub' }],
  nodes: {
    reunie: n('Sorel ne lâche pas la main de Mara. Elle a l’air de quelqu’un qui a dormi quatre ans d’un coup. « Merci. Je ne sais pas comment on dit merci pour ça. »', [
      c('Prenez soin d’elle.', 'hub'),
      bye(),
    ]),
    hub: n('La docteure lève les yeux de ses dossiers. Des cernes jusqu’aux pommettes.', [
      c('Comment vont les malades ?', 'malades', { once: true }),
      c('Parlez-moi de Lou.', 'lou', { if: 'char:passager & !f:lou_soignee' }),
      c('Cette photo, sur votre bureau…', 'photo', { if: 'e:c_medaillon_sorel & !e:t_sorel_fille' }),
      c('Votre fille est vivante. Elle est à bord.', 'mere', { if: 'e:f_mere & !f:mere_reunie' }),
      c('Pouvez-vous m’examiner ?', 'soin', { if: 'stat:health<75 & !f:soin_sorel' }),
      c('D’où viennent vos antibiotiques ?', 'antibio', { if: 'e:f_echange_antibio & !f:sorel_sait' }),
      bye(),
    ]),
    malades: s('Fièvres, plaies infectées, un cas de dysenterie. Il me reste deux boîtes d’antibiotiques. Marchetti m’en trouve parfois — je ne pose pas de questions. Ici, on ne pose plus de questions.', 'hub'),
    lou: s('Elle est quatrième sur la liste. Je ne peux pas la faire passer devant un enfant de cinq ans. Je suis désolée, vraiment.', 'lou2', { fx: ['obj:qp_passager.sorel'] }),
    lou2: n('Elle soutient votre regard. Elle a déjà eu cette conversation cent fois.', [
      c('Et si je trouvais une boîte moi-même ?', 'lou_trouve'),
      c('Vous la laissez mourir pour une liste.', 'lou_dur'),
    ]),
    lou_trouve: s('Alors je vous montrerai comment la lui donner. Et je ne vous demanderai pas d’où elle vient.', 'hub', { fx: ['trust:sorel+1'] }),
    lou_dur: s('Je les laisse tous mourir un peu, chaque jour, pour une liste. Vous voulez ma place ?', 'hub', { fx: ['trust:sorel-1'] }),
    photo: s('Ma fille. Mara. Elle était chez son père, à Lyon, le premier jour. Lyon s’est effondrée. Je garde la moitié de son médaillon ; elle avait l’autre.', 'photo2', { fx: ['entry:t_sorel_fille'] }),
    photo2: s('Pardon. Ce n’est pas une conversation pour un jour comme aujourd’hui.', 'hub'),
    mere: n('Sorel devient très pâle. « Ne jouez pas avec ça. »', [
      c('Vous montrer le médaillon reconstitué.', 'mere2', { if: 'has:medaillon' }),
      c('Elle s’appelle Mara. Elle cherche une certaine Hélène.', 'mere2'),
    ]),
    mere2: nar('Sorel se lève si vite que sa chaise bascule. Elle ne dit rien. Elle court. Quand vous la rattrapez, elle serre contre elle une fille maigre aux yeux immenses, et aucune des deux ne parle pendant longtemps.', 'hub', { fx: ['set:mere_reunie', 'set:mara_libre', 'loc:mara=', 'conseq:cq_mere_reunie', 'obj:q_mara.reunion', 'trust:sorel+3', 'trust:mara+2', 'qdone:q_mara'] }),
    soin: nar('Sorel nettoie, recoud, bande. Vingt minutes plus tard, vous repartez avec un pansement propre et l’ordre formel de boire.', 'hub', { fx: ['time:20', 'stat:health+20', 'set:soin_sorel'] }),
    antibio: n('Comment ça, d’où ? Marchetti les trouve.', [
      c('Il les échange contre l’eau commune, avec Madame de Villiers.', 'antibio2'),
      back('Laissez tomber.'),
    ]),
    antibio2: s('… J’ai soigné des enfants avec de l’eau volée à d’autres enfants. Vous voulez que je vous remercie de me l’avoir dit ?', 'hub', { fx: ['set:sorel_sait', 'trust:sorel-1'] }),
  },
};
