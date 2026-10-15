# VAYN — Chapitre I : « Signal faible »

Jeu narratif de survie, d’enquête et d’exploration, en français, pensé pour le téléphone (iPhone et Android) en mode paysage.
Vue en coupe latérale « maison de poupée » des voitures du train, caméra qui suit le personnage à l’horizontale.
Personnages en silhouettes noires avec un seul accent de couleur et deux pixels lumineux pour les yeux.
Toute l’image et tout le son sont **générés par le code** : aucun fichier image ni audio externe.

> Jour 147 après la catastrophe. Le VAYN, train autonome, s’immobilise en gare de Saint-Aubin à 23 h 52. La filtration d’eau est morte, un agent de maintenance a disparu, les réserves ne tombent pas juste. Le pilote automatique repartira le lendemain à midi, avec ou sans vous.

---

## 1. Lancer le jeu

Prérequis : Node.js 20 ou plus (développé avec Node 22), npm.

```bash
npm install
npm run dev        # serveur de développement : http://localhost:5173
```

Autres commandes :

| Commande | Effet |
|---|---|
| `npm run build` | Vérification TypeScript puis build de production dans `dist/` |
| `npm run build:pages` | Même build, écrit dans `docs/` : c’est la version publiée sur GitHub Pages |
| `npm run preview` | Sert `dist/` sur http://localhost:4173 |
| `npm test` | Lance les tests automatisés (Vitest) |
| `npm run typecheck` | Vérification TypeScript seule |

Pages de développement (non incluses dans le build) :
- `/dev/sprites.html` : galerie des personnages ;
- `/dev/furniture.html` : galerie du mobilier ;
- `/dev/world.html` : scène du train seule, sans interface.

### Tester sur téléphone (GitHub Pages)

Le dossier `docs/` contient une version compilée du jeu, prête à être servie par GitHub Pages.
Il est versionné exprès : contrairement à `dist/`, il n’est pas ignoré par Git.

Mise en place, une seule fois, sur github.com :
1. Si le compte GitHub est gratuit, rendre le dépôt public : *Settings → General → Danger Zone → Change repository visibility*.
   Le code et l’historique deviennent alors visibles par tous.
2. *Settings → Pages → Build and deployment* :
   - Source : *Deploy from a branch* ;
   - branche : celle qui contient `docs/` ;
   - dossier : `/docs`.
3. Après une à deux minutes, le jeu est en ligne sur `https://<compte>.github.io/VAYN/`.

Pour publier une nouvelle version : lancer `npm run build:pages`, puis committer `docs/` et pousser.
Le fichier `public/.nojekyll` est copié dans `docs/` ; il empêche GitHub de passer le site dans Jekyll.

### Gestes

- **Toucher le sol** : marcher.
- **Toucher un objet, une porte ou un personnage** : s’y rendre, puis interagir.
- **Glisser** : regarder plus loin dans le train.
- **Pincer** ou molette : zoomer.
- **Bouton « Attendre »** : laisser passer le temps (30 min, 1 h, ou jusqu’au prochain rendez-vous).
- **Onglets à droite** : Carnet, Sac, Train, Menu.
- **Plein écran** : bouton sur l’écran titre et dans Menu, quand le navigateur le permet (Android, ordinateur).
  Sur iPhone, Safari ne le permet pas : « Ajouter à l’écran d’accueil » ouvre le jeu sans barre d’adresse.

Le temps ne s’écoule que lorsque vous agissez, marchez ou attendez. Les dialogues le mettent en pause.

---

## 2. Export iOS et Android (Capacitor 8)

Le projet est configuré pour Capacitor (`capacitor.config.ts`, `webDir: dist`, chemins relatifs `base: './'`).
**Les projets natifs ne sont pas générés dans ce dépôt, et aucun export n’a été construit ni testé sur appareil.**
Procédure :

```bash
npm run build
npx cap add android        # une seule fois, nécessite Android Studio
npx cap add ios            # une seule fois, nécessite macOS + Xcode
npx cap sync               # après chaque build
npx cap open android       # ou : npx cap open ios
```

Les raccourcis `npm run cap:android` et `npm run cap:ios` enchaînent build, synchronisation et ouverture de l’IDE.

Réglages natifs à faire après `cap add` (une seule orientation, le paysage) :
- **Android** : dans `android/app/src/main/AndroidManifest.xml`, ajouter `android:screenOrientation="sensorLandscape"` sur l’activité principale.
- **iOS** : dans Xcode, onglet *General → Deployment Info*, ne cocher que *Landscape Left* et *Landscape Right*.
  Ou, dans `Info.plist`, restreindre `UISupportedInterfaceOrientations` aux deux valeurs paysage.

Sauvegardes : `@capacitor/preferences` sur mobile natif, `localStorage` dans le navigateur (voir `src/app/storage.ts`).
Les zones sûres (encoches, barre de geste) sont gérées en CSS via `env(safe-area-inset-*)`, avec `viewport-fit=cover`.

---

## 3. Architecture

```
src/
  engine/    Moteur pur, sans Phaser ni DOM (entièrement testable)
    types.ts       types du moteur et du contenu
    dsl.ts         mini-langage de conditions (« e:c_alarmes & trust:vasseur>=2 ») et d’effets
    game.ts        façade : temps, survie, inventaire, carnet, missions, relations, ressources, portes, actions
    dialogue.ts    moteur de dialogue (nœuds, choix conditionnels, aiguillages, choix « une fois »)
    council.ts     conseil des quatre : positions, arguments, vote, égalités
    save.ts        sauvegarde automatique, points de reprise, ONE LIFE (pierre tombale), somme de contrôle
    navgrid.ts     grille de navigation et A*
    layout.ts      géométrie des voitures (bande en coupe), placement, navigation
    validate.ts    validation statique de tout le contenu
  content/   Données du chapitre 1 (personnages, PNJ, objets, carnet, missions, dialogues, événements, motions…)
  render/    Pixel art procédural sur canvas (personnages, mobilier, voitures, paysages)
  world/     Scènes Phaser : WorldScene (train / extérieur), RideScene (titre, intro, fin), acteurs, textures
  ui/        Interface DOM/CSS par-dessus le canvas (HUD, dialogues, menus, panneaux, conseil, écrans)
  audio/     Son procédural WebAudio : ambiances, musique clairsemée, effets
  app/       Contrôleur central (App.ts) et stockage
tests/       Tests Vitest : moteur, contenu, parties complètes sans rendu
dev/         Pages de développement
```

Pile technique : Phaser 3.90, TypeScript 5.9, Vite 7, Vitest 5, Capacitor 8. Polices : Oswald, Work Sans, IBM Plex Mono, Silkscreen (paquets @fontsource, embarqués).

---

## 4. Contenu du chapitre 1

**Quatre personnages jouables**, chacun avec compétences, accès, relations, difficulté et intrigue personnelle :

| Personnage | Accès et compétences | Intrigue personnelle |
|---|---|---|
| Le Contrôleur — Aurèle Fontaine | autorité, registres, passe de la cabine de conduite | « La ligne fantôme » : un billet tamponné « cabine 0 » |
| Le Passager — Sacha Morin | discrétion, réseau des dortoirs, troc | « La liste d’attente » : des antibiotiques pour sa sœur Lou |
| Le Majordome — Edmond Lavigne | service, clés du Salon, mémoire des visages | « La lettre de Madame » : une enveloppe cachetée |
| Le Mécanicien — Malo Kerbrat | technique, crochetage, lecture des machines | « Le carnet d’entretien » : une signature sous une révision fantôme |

**Le train** compte 8 voitures et des pièces fermées :
- machines (cabine de conduite verrouillée) ;
- atelier ;
- infirmerie (bureau de la docteure) ;
- cantine et étal du passeur ;
- soute (réserve grillagée, cache) ;
- dortoirs ;
- administration (bureau, poste de sécurité, salle radio fermée) ;
- salon (garde-manger et cabine de Madame fermés).

On y accède par clé, compétence, relation, horaire (la tournée de Rosa à 11:00) ou décision.

**L’extérieur**, pour l’expédition du jour 2 : quai, hall de gare, cour aux marchandises, dépôt sombre, talus aux chiens, poste d’aiguillage.

**Intrigue** : trois événements liés par l’enquête (panne de filtration, disparition de Théo, détournement des réserves), avec témoignages contradictoires, mensonges et hypothèses concurrentes.
Viennent ensuite une clandestine qui cherche quelqu’un à bord, une émission venue du barrage de Clairval, le conseil de 17:00, l’expédition, le départ, l’assemblée finale, puis la découverte qui clôt le chapitre.

Volume : 13 PNJ principaux et 4 passagers d’ambiance. Le contenu comprend :
- 19 dialogues (192 nœuds) ;
- 54 entrées de carnet et 17 déductions ;
- 4 questions et 13 hypothèses ;
- 7 missions (dont une par personnage) et 5 motions de conseil ;
- 36 objets d’inventaire ;
- 69 éléments de décor interactifs (sur 98) ;
- 28 événements datés.

---

## 5. Ce qui est implémenté

- [x] Écran titre animé (train en mouvement), choix du mode, cinématique d’introduction passable.
  La cinématique enchaîne embarquement, départ, catastrophe et « quelques mois plus tard ».
- [x] Écran de sélection : portrait, résumé, compétences, accès, relations, difficulté, intrigue personnelle.
- [x] Scène de coupe façon « maison de poupée » :
  - éclairage précalculé et teinte des personnages selon les lampes ;
  - fenêtres ouvertes sur un paysage en parallaxe ;
  - poteau de premier plan, soufflets entre voitures, châssis et bogies.
- [x] Déplacement au toucher avec recherche de chemin, portes et grilles verrouillées, glisser pour regarder, pincer pour zoomer.
- [x] Interactions contextuelles : menu d’actions ancré à l’objet, durées affichées, actions risquées signalées, actions liées aux compétences.
- [x] Temps de jeu : actions et marche, rendez-vous datés (repas, tournée de la réserve, fouille de 16:00, conseil de 17:00, couvre-feu, réveil, sirènes, départ, assemblée).
  Les avertissements préviennent avant les échéances ; un événement manqué ne bloque jamais la suite.
- [x] Survie : santé, hydratation, satiété (faim), repos (fatigue).
  - À bord : un malaise ramène à l’infirmerie, sans mort.
  - Dehors : l’épuisement et la brume peuvent tuer.
- [x] Ressources du train : nourriture, eau, énergie, médicaments, pièces.
  Consommation chaque nuit, usages concurrents (réparations, matériel d’expédition, décisions du conseil).
- [x] Inventaire : poids limité à 10 kg (surcharge = marche plus lente), catégories, rangement personnel propre à chaque personnage, objets de quête protégés, actions par objet.
- [x] Carnet :
  - faits confirmés, témoignages, indices ;
  - mise en relation de deux entrées pour établir un fait ;
  - hypothèses avec éléments pour et contre ;
  - missions et conséquences.
  Rien d’inconnu n’est affiché.
- [x] Dialogues dans la scène (cadrage resserré) : conditions selon le personnage, les compétences, les relations, les indices et les promesses.
  Les PNJ mentent, se souviennent, accordent ou retirent leur confiance.
- [x] Conseil des quatre (Sécurité, Maintenance, Approvisionnement, Bien-être) :
  - jusqu’à 4 motions, chacune avec votre position et des arguments tirés de l’enquête (5 par séance) ;
  - votes visibles ;
  - en cas d’égalité, votre position l’emporte si elle fait partie des ex æquo ;
  - les dettes pèsent sur les votes.
  Un siège peut changer de titulaire : un audit révèle le trafic, et Rosa remplace Marchetti.
- [x] Missions à dilemme, par exemple « La ration disparue » : dénoncer, couvrir, ou accuser un autre.
- [x] Expédition :
  - choix du compagnon (4, avec conditions) et du matériel (poids, coût pour les réserves) ;
  - lieux, indices, ressources, dangers annoncés.
  Les dangers se règlent de plusieurs façons :
  - poutre : étayer, se faufiler ou risquer ;
  - chiens : négocier avec de la nourriture, attendre, laisser faire le compagnon, forcer ;
  - dépôt : noir sans lampe ;
  - brume : avance depuis 10:00.
  Le compagnon peut être blessé ou mourir. Le blessé peut être ramené, soigné ou laissé.
- [x] Train manqué : jamais une fin automatique. Trois rattrapages possibles :
  - signal au rouge (avec l’accord de l’aiguilleur) ;
  - draisine réparée ;
  - sursis de 20 minutes si Vasseur vous fait confiance.
  Sans aucune de ces solutions, le train part.
- [x] Retour avec conséquences (eau rapportée, blessé à bord, pièces), départ du train : le paysage défile ensuite par les fenêtres.
- [x] Assemblée finale : révélations publiques au choix, puis vote sur la route (sud ou Clairval).
  Viennent ensuite une découverte finale et un épilogue construit selon l’état de la partie (train, personnes, fin personnelle).
- [x] Améliorations du train (6) : coût, durée, effets visibles. Exemples : stérilisateur allumé, pompe remontée.
- [x] Modes **Histoire** (sauvegarde automatique et points de reprise) et **ONE LIFE** (mort définitive).
  - En ONE LIFE, l’identifiant de la partie est inscrit dans une « pierre tombale » avant l’effacement.
  - Une sauvegarde réinjectée est refusée.
  - Une somme de contrôle détecte les sauvegardes corrompues.
  - Restauration cohérente sans duplication d’objets.
  - Les séquences obligatoires interrompues (conseil, préparation, départ, assemblée) sont relancées au chargement.
- [x] Interface mobile : zones sûres, cibles tactiles d’au moins 44 px, anti-double-déclenchement, message « tournez votre appareil » en portrait sur écran tactile (sur ordinateur, une fenêtre étroite affiche le jeu quand même), bouton plein écran.
- [x] Son procédural avec réglages de volume (général, musique, ambiance, effets) et vitesse du texte :
  - ambiances : train à l’arrêt, train en marche, extérieur ;
  - musique rare et sobre selon l’humeur ;
  - effets : sirène, déclics, métal, carnet…

## 6. Ce qui est incomplet ou simplifié

- **Aucun test sur un vrai téléphone**, et aucun build natif iOS ou Android n’a été produit.
  Seuls la configuration Capacitor et la procédure sont fournies.
- **Le son n’a pas été écouté** : il est généré et branché, mais l’environnement de développement n’a pas de sortie audio.
- Équilibrage (vitesse de baisse des jauges, budget de temps de l’expédition, poids des votes) réglé par calcul et par les tests automatiques, **pas par des sessions de jeu humaines**.
- Pas de mise en page portrait (le jeu demande de tourner l’appareil).
- La progression d’un dialogue en cours n’est pas sauvegardée : on reprend au menu de conversation du personnage.
- Les PNJ se déplacent en temps réel entre leurs postes. Après une attente de 20 minutes ou plus, ils sont replacés directement.
- Les panneaux peints dans le décor utilisent une police 3×5 sans accents (« CONTROLE », « DEPOT »).
- Les objets du sac n’ont pas de dessin : ils sont signalés par une pastille (initiale, couleur de catégorie).
  Les icônes du HUD sont en SVG.
- Une seule sauvegarde en cours à la fois (plus un point de reprise en mode Histoire).

## 7. Tests et résultats

```bash
npm test
```

Dernier résultat : **25 tests sur 25 réussis**, en 3 fichiers.
Le typage (`tsc --noEmit`) et le build de production (`vite build`) réussissent aussi.

| Fichier | Ce qui est vérifié |
|---|---|
| `tests/content.test.ts` (3) | Validation statique de tout le contenu, et preuve que le validateur détecte bien des erreurs volontaires. Le validateur couvre conditions, effets, nœuds de dialogue, sprites, points de passage, objectifs et révélations. |
| `tests/engine.test.ts` (17) | Voir le détail ci-dessous. |
| `tests/playthrough.test.ts` (5) | Une partie complète du Mécanicien jouée sans rendu, plus des parcours propres aux autres personnages (voir ci-dessous). |

Détail de `tests/engine.test.ts` :
- mini-langage de conditions ;
- inventaire : poids, surcharge, objets protégés, rangement sans duplication ;
- temps et survie : malaise à bord, mort dehors, conseil qui a lieu même si on l’ignore ;
- sauvegardes : corruption, point de reprise, pierre tombale ONE LIFE ;
- votes du conseil ;
- navigation A* et portes ;
- mémoire des dialogues.

La partie complète du Mécanicien enchaîne : enquête, déductions, tournée de 11:00, témoignages, clandestine, réunion mère et fille, conseil (votes réels), nuit, expédition, retour, réparation, départ, assemblée, épilogue et découverte finale.

Les parcours des autres personnages vérifient :
- la cabine et le sillon fantôme du Contrôleur ;
- le garde-manger et la lettre du Majordome ;
- les antibiotiques de Lou pour le Passager ;
- la capture de Mara à 16:00 sans intervention, puis le vote de son sort.

**Vérifications manuelles faites** dans un navigateur sans écran (Chromium headless, 844×390, captures d’écran) :
- titre, choix du mode, cinématique, sélection et fiche de personnage ;
- entrée en jeu avec chacun des quatre personnages ;
- dialogue avec Castel ;
- menu de l’établi et repas au comptoir ;
- déplacement des PNJ vers la cantine à l’heure du repas ;
- panneaux Carnet (dont la mise en relation de deux indices), Sac, Train, Menu ;
- conseil (ouverture, motion, vote) ;
- préparation d’expédition, quai, dépôt sombre, poste d’aiguillage dans la brume ;
- retour à bord par la portière, bilan, départ du train avec le paysage qui défile ;
- assemblée avec révélations et écran de fin ;
- sauvegarde puis reprise après rechargement de la page (« Continuer ») ;
- mort en ONE LIFE : écran de fin, sauvegarde effacée, pierre tombale, plus de « Continuer » ;
- démarrage du build de production.

**Non vérifié manuellement** : une partie entière jouée d’une traite au doigt, du réveil à l’épilogue. Elle n’est couverte que par le test automatique sans rendu.

## 8. Bugs connus et limites

- Les noms des PNJ peuvent se chevaucher quand deux personnages sont côte à côte, et un nom peut apparaître devant un comptoir si le PNJ est derrière.
- La brume blesse le compagnon dès que le joueur est dedans, même si le compagnon est encore à l’écart.
- Sur un écran très large, la caméra peut montrer le vide au-delà de la première ou de la dernière voiture (marge volontaire de 30 px).
- Le premier chargement génère toutes les textures à la volée. Il prend quelques secondes sur un appareil lent, sans barre de progression dans la scène.
- La fenêtre de départ de 12:00 est vérifiée sur l’horloge du jeu : si vous êtes déjà à bord, le départ attend la fin de l’action en cours.

## 9. Feuille de route du chapitre II — « Le train qui ne s’arrête pas »

1. **Import de l’état du chapitre I** : route choisie, sort de Théo, de Mara et du compagnon, siège de l’approvisionnement, confiance de chaque PNJ, fin personnelle.
2. **Le VAYN-2** : rattraper ou fuir le train jumeau, décrypter ses messages, comprendre pourquoi il ne faut pas s’arrêter à Clairval.
3. **Deux branches** :
   - Clairval : le barrage, ses quarante survivants, le mystère de l’émission en boucle ;
   - le sud : Port-Sel, la côte, le réseau ferré qui se défait.
4. **Nouveaux lieux** : toit du train en marche, locomotive, intérieur du VAYN-2, une gare habitée.
5. **Nouveaux systèmes** :
   - gestion de la vitesse et des aiguillages ;
   - triangulation radio ;
   - réparations en plusieurs étapes ;
   - santé mentale des passagers ;
   - rumeurs qui se propagent dans les voitures.
6. **L’homme en gris** de l’embarquement, et la question de qui a programmé le sillon fantôme.
7. **Technique** :
   - sauvegardes multiples ;
   - mise en page portrait ;
   - option d’accessibilité (texte agrandi, contraste) ;
   - tests sur appareils réels ;
   - publication sur les magasins d’applications.
