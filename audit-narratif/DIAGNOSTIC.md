# VAYN — Chapitre I : diagnostic narratif

Aucun fichier du jeu n'a été modifié pour ce diagnostic.
Les seuls ajouts sont dans `audit-narratif/` : ce document, la carte, les rapports et les outils.

La carte complète (chronologie, causes, personnages, secrets, indices, missions, choix) est dans [`CARTE_NARRATIVE.md`](CARTE_NARRATIVE.md).

---

## 0. Méthode et limites

### Ce qui a été fait

1. **Lecture intégrale du contenu narratif.**
   - Les 13 dialogues (`src/content/dialogues/*`) et les scènes d'ouverture.
   - Le carnet, les missions, les objets du train et de l'extérieur, les événements, les motions.
   - L'épilogue (`story.ts`) et les séquences de `App.ts` (conseil, nuit, expédition, retour, départ, assemblée).
2. **Références croisées automatiques** ([`REFERENCES_CROISEES.md`](REFERENCES_CROISEES.md)) :
   - chaque drapeau posé ou lu ;
   - chaque source d'entrée du carnet ;
   - la façon dont chaque objectif se coche ;
   - chaque conséquence jamais déclenchée.
3. **26 parcours joués de bout en bout dans le vrai moteur** (`src/engine`, avec le vrai contenu), sans rendu ([`PARCOURS_EXECUTES.md`](PARCOURS_EXECUTES.md), journaux détaillés dans `journaux/`) :

   | Famille | Parcours |
   |---|---|
   | Histoire principale seulement | P1, avec les 4 personnages |
   | Explorateur | P2, avec les 4 personnages |
   | Refuse les missions secondaires | P3 : Passager, Majordome |
   | Décisions opposées au parcours attendu | P4 : Contrôleur, Mécanicien |
   | Indices facultatifs manqués | P5 : Mécanicien, Majordome |
   | Méfiant envers ceux qu'il faudrait croire | P6 : Passager, Contrôleur |
   | Cas ciblés | C1 à C10 (révélation au conseil, cellule, expulsion, Théo ramené sans récit, radio, promesses, vol, mort d'un compagnon, première rencontre en cellule) |

   Relance : `npx vitest run --config audit-narratif/outils/vitest.config.ts`. `npm test` n'est pas concerné.

### Limites, à lire avant les conclusions

- **Aucun de ces parcours n'a été joué dans le navigateur.** Ils passent par le moteur réel, mais l'interface n'existe pas dans le banc d'essai.
- **Les séquences de l'App sont recopiées dans le banc d'essai.** C'est le cas des séquences de conseil, nuit, expédition, retour, départ, train manqué et assemblée. Une copie peut différer de l'original ; je l'ai relue ligne à ligne contre `App.ts`.
- **La marche est approchée en ligne droite.** Les PNJ sont placés selon leur emploi du temps, sans trajet, et les pièces fermées sont estimées d'après la géométrie des cloisons. Les horaires des parcours sont donc indicatifs.
- **Parler à Marchetti à travers la grille de la réserve** a été autorisé dans le banc d'essai. Le jeu réel peut l'empêcher : à vérifier.
- **Les morts de compagnon (C8, C9) ont été provoquées directement** (santé du compagnon mise à 0). Ces tests portent sur ce qui se passe *après* la mort, pas sur la probabilité qu'elle arrive.

---

## 1. Résumé fidèle de l'histoire implémentée

**Ouverture.** Jour 147 après la catastrophe, 07:00. Le VAYN est immobilisé en gare de Saint-Aubin depuis 23 h 52.
- La filtration d'eau est morte.
- Théo Lagarde, de la maintenance, a disparu.
- Les réserves ne tombent pas juste.
- Le pilote automatique repartira le lendemain à midi, que la filtration soit réparée ou non.

Chaque personnage commence avec son fardeau :
- le Contrôleur, un billet « cabine 0 » ;
- le Passager, sa sœur Lou quatrième sur la liste des antibiotiques ;
- le Majordome, une lettre cachetée de Madame ;
- le Mécanicien, sa signature sous une révision fantôme.

**Jour 1 : l'enquête.** Elle est libre.
- La voiture des machines montre deux pannes : le relais K3 retiré proprement, et la pompe de secours sans moteur.
- Les témoins permettent de reconstituer la nuit de Théo.
- La réserve, le compteur, le garde-manger du Salon et un brouillon révèlent le trafic « cabine 0 » : de l'eau contre des antibiotiques.
- Derrière les caisses de la soute vit Mara, venue du barrage de Clairval, que Théo nourrissait. Elle cherche sa mère « Hélène », et deux demi-médaillons prouvent que c'est la docteure Sorel.
- Le tiroir de Castel et le poste radio montrent que Castel a entendu Clairval et l'a caché.
- À 16:00, Castel fouille la soute ; à 17:00, le conseil vote l'expédition, le rationnement, le sort de Mara et le relais de la radio.

**Jour 2 : l'expédition.** À l'aube, avec ou sans compagnon, le joueur dispose de 5 h 30.
- Dans le hall de la gare : le mur des messages (« Clairval tient », Jour 101).
- Au dépôt : les traces de Théo, une poutre, une armoire avec un K3.
- Sur le talus : une meute de chiens.
- Au poste d'aiguillage : Anselme, qui a vu passer un autre VAYN un mois plus tôt. Son récepteur répète Clairval en boucle depuis le Jour 96.
- Théo, blessé, y raconte sa nuit. On peut le ramener, le laisser, ou faire mettre le signal au rouge.
- La brume monte dès 10:00, le train part à 12:00, et rater le train peut se rattraper.

**Fin.** À 15:00, l'assemblée de tout le train : révélations publiques, puis choix de la route (sud ou Clairval).
- À 16:40, un message : « ici VAYN-2… ne vous arrêtez pas à Clairval ».
- L'épilogue reprend le train, les gens et la fin personnelle.

---

## 2. Évaluation de la cohérence globale

| Plan | Jugement | Pourquoi |
|---|---|---|
| **Vérité de fond** (ce qui s'est passé) | **Solide** | La chaîne causale tient : Clairval, Castel, Mara, Théo, le K3, la pompe vide, l'arrêt. Chaque événement majeur a une cause et un mobile humain. Les fausses pistes sont des mensonges motivés. |
| **Indices et déductions** | **Bonne, avec une faille** | Les 17 déductions relient des indices qui se répondent. Une seule affirme une concordance démentie par les chiffres (D-08). |
| **Mystères** | **Bien dosés** | Clairval, le VAYN-2, l'horaire fantôme et l'homme en gris sont préparés sans être expliqués, et rien ne les contredit. |
| **Conséquences des choix** | **Fragile aux marges** | Les choix courants sont repris. Mais plusieurs choix moins fréquents ne sont pas respectés ensuite (D-01 à D-06, D-13 à D-15). |
| **Compréhension sur le chemin principal** | **Faible** | Un joueur qui suit seulement les objectifs finit sans savoir qui a pris le K3 ni pourquoi, ni où est Théo, ni où va l'eau (P1, 4 personnages sur 4). L'objectif affiché reste bloqué sur « Trouver ce qui a fait tomber la filtration » jusqu'au retour d'expédition (D-07). |
| **Progression** | **Jamais bloquante** | Les 26 parcours atteignent la fin. Le fil principal est porté par l'horloge : conseil, expédition et assemblée ont toujours lieu. |
| **Quatre personnages** | **Cohérent** | Mêmes faits, accès différents, aucun personnage indispensable. Seul défaut : les missions personnelles ne passent jamais à « terminée » (D-21). |

En résumé, l'histoire est cohérente **en profondeur**.
Les problèmes sont :
- l'état du monde après certains choix ;
- le guidage du joueur qui va droit au but ;
- une douzaine de petites contradictions de texte : géographie, chiffres, chronologie.

---

## 3. Bugs narratifs : contradictions réelles

Classés par gravité. Pour chaque bug : la preuve (fichier et ligne, ou parcours), l'effet, et la correction minimale proposée, **non appliquée**.

### Gravité haute : l'état du monde contredit ce que le joueur a vécu

#### D-01 — Un compagnon mort réapparaît à bord, parle et vote

**Preuve**
- C8 : Mara meurt pendant l'expédition. De retour, elle est à l'infirmerie : « Mara a enlevé sa capuche. Elle a les yeux de sa mère. »
- C8, épilogue : « Sorel et Mara ne se quittent plus… » puis « Mara n'est pas revenu de Saint-Aubin. »
- C9 : Vasseur morte est à son établi, répond, et vote « clairval » à l'assemblée.
- Code : `App.checkCompanion` (`App.ts:675`) ne retire pas le PNJ ; `councilMembers` (`engine/council.ts:20`) ne filtre pas les morts.

**Effet** : contradiction flagrante, et accords faux (« revenu » pour Mara et Vasseur, `story.ts:114`, `App.ts:936`).

**Correction minimale**
- À la mort : `hide:<id>`.
- Exclure du conseil un membre mort.
- Dans l'épilogue, sauter les lignes de statut d'un compagnon mort.
- Tourner les phrases sans accord (« Saint-Aubin a gardé Mara. »).
- L'argument `d_mere` doit exiger que Mara soit vivante.

#### D-02 — Le signal au rouge est ignoré si l'on rentre à l'heure

**Preuve**
- P4-Contrôleur : Anselme a promis « votre train s'arrêtera devant ma porte, et vous prendrez le gamin avec vous ».
- Le joueur met le signal au rouge, laisse Théo au poste et rentre à 10:46.
- Épilogue : « Théo est resté au poste… Le signal, au loin, a regardé passer le train. »
- Théo n'est récupéré que si l'on rate le train (P4-Mécanicien). Code : `App.returnToTrain` (`App.ts:921–929`).

**Correction minimale**
- Au départ normal, si le signal est rouge et que Théo est resté : le train s'arrête au poste, Théo monte (`theo_sauve`), une phrase de narration.
- La ligne « a regardé passer le train » seulement sans signal rouge.

#### D-03 — Sursis de Vasseur : le départ n'a jamais lieu

**Preuve**
- P4-Mécanicien : Vasseur bloque le pilote 20 minutes, et le joueur remonte par la portière.
- Or la portière appelle toujours `returnToTrain(false)`, qui ne relance le départ que si `late` est vrai (`App.ts:952`). `train_roule` n'est donc jamais posé :
  - pas de narration de départ ;
  - le train ne roule pas ;
  - pas de point de reprise « Départ » ;
  - Théo n'est pas récupéré malgré le signal.
- L'assemblée de 15:00 a lieu quand même, « le VAYN roule vers l'embranchement ».
- Reproduit avec la logique recopiée de l'App, **non vérifié dans le navigateur**.

**Correction minimale** : dans `returnToTrain`, relancer le départ si `late` est vrai **ou** si le sursis est actif.

#### D-04 — L'identité de Mara est révélée sans que la mère et la fille se retrouvent

**Preuve**
- C1 : au conseil, l'argument « C'est la fille de la docteure Sorel » est prononcé devant Sorel, membre du conseil. Ensuite, Sorel propose encore « Votre fille est vivante. Elle est à bord. »
- La réunion n'arrive qu'en la révélant **de nouveau** à l'assemblée, le lendemain.
- C2 : Castel répond « Qu'elle aille voir sa mère » (`council.ts:84`) ; même résultat. L'épilogue peut alors dire qu'elle regarde la docteure « avec une question au bord des lèvres ».

**Correction minimale** : ajouter à `m_mere` (`motions.ts:78`) et à `cellule_mere` les mêmes effets que la réunion chez Sorel : `mere_reunie`, la conséquence, les objectifs, la fin de la mission de Mara.

#### D-05 — Mara expulsée : deux destins incompatibles

**Preuve** : P4-Contrôleur. Le carnet note au départ « Au poste d'aiguillage, Mara a trouvé refuge chez Anselme » (`App.ts:968`). Mais :
- au poste, le matin même, ni Mara ni Anselme n'en parlent ;
- l'épilogue dit « Mara est restée sur le quai… toute petite dans la brume » (`story.ts:110`).

**Correction minimale, sans nouveau personnage à l'écran** :
- une réplique d'Anselme si Mara est expulsée (« La petite du barrage ? Passée à l'aube, elle remontait vers la vallée. ») ;
- une observation et un épilogue alignés (« repartie seule vers Clairval »).

Autre option, plus lourde : la placer au poste avec deux répliques.

#### D-06 — « Personne n'a retrouvé Théo », alors que le joueur lui a parlé

**Preuve**
- P6-Passager et C8 : le joueur rencontre Théo et entend son récit, sans décider de le ramener ni de le laisser.
- P6 : il raconte même sa nuit devant tout le train à l'assemblée.
- Épilogue : « Personne n'a retrouvé Théo… dévoré par les chiens » (`story.ts:108`).

**Correction minimale** : une branche d'épilogue « vous l'avez vu vivant » si Théo a été rencontré sans décision.

#### D-11 — La première rencontre avec Mara en cellule rejoue la scène de la cachette

**Preuve**
- C10 : c'est le cas le plus probable pour un joueur qui ne fouille pas la soute.
- En cellule, Mara « brandit un éclat de verre », dit « Ça fait dix jours que je vis derrière ces caisses », et reste « prête à fuir ».
- Le nœud de cellule est sauté. Cause : l'ordre du routage (`people.ts:9`).

**Correction minimale** : tester la cellule avant la première rencontre, avec une variante de présentation propre à la cellule.

### Gravité moyenne : faits contradictoires dans le texte

#### D-08 — Le trafic d'eau n'a pas un rythme unique

| Source | Ce qu'elle dit |
|---|---|
| Registre (`train_objects.ts:405–406`, `journal.ts:17`) | « deux fois par semaine », 4 jerricans |
| Compteur (`train_objects.ts:385`, `journal.ts:18`) | « chaque nuit », 80 litres |
| Brouillon (`journal.ts:20`, `train_objects.ts:412`, `items.ts:37`) | « quatre jerricans par semaine » |
| Tableau, version du Contrôleur (`train_objects.ts:354`) | 4 jerricans par semaine |
| Marchetti (`council.ts:190`) | « Quatre jerricans par nuit » |
| Fait établi (`journal.ts:58`) et argument (`motions.ts:52`) | « chaque nuit » |

La déduction annonce que les sorties « tombent pile » (`journal.ts:100`). Le Contrôleur, dont le métier est de lire les registres, est le premier à le voir.

**Correction minimale** : un seul rythme partout, par exemple 2 jerricans, deux nuits par semaine, soit 4 par semaine. Cela touche environ 8 textes, sans mécanique.

#### D-09 — Géographie du train contredite

L'ordre réel des voitures est : machines (tête), atelier, infirmerie, cantine, soute, dortoirs, administration, Salon (queue).

| Texte | Problème | Proposition |
|---|---|---|
| Castel : « Il a filé vers l'arrière » (`council.ts:44`, `journal.ts:35`) | Depuis la salle radio, la soute est vers l'**avant**. | « vers l'avant, vers la soute » |
| Agathe : « Pas vers les dortoirs. Les dortoirs, c'est devant la soute » (`people.ts:197`) | Les dortoirs sont juste **derrière** la soute. | « Ils ont traversé les dortoirs sans s'arrêter. Après, il n'y a que l'administration… et le Salon. » |
| Introduction : « En tête… malles et argenterie. En queue… des enfants » (`story.ts:12`) | Le Salon est en queue, les dortoirs au milieu. | Retirer « en tête / en queue » |
| Mara : « à trois voitures d'ici » (`people.ts:51`) | Faux depuis la soute comme depuis la cellule. | « à l'infirmerie » |

#### D-10 — Mara : chronologie, motif et embarquement

**Chronologie**
- « Ça fait dix jours que je vis derrière ces caisses » (`people.ts:20`).
- Mais face aux chiens : « Je suis passée par ici, il y a dix jours » (`exterior.ts:194`).
- Et pour l'expédition : « Je suis passée par Saint-Aubin pour monter dans ce train » (`people.ts:61`).
- Or le train n'est à Saint-Aubin que depuis la veille.

**Manques**
- Comment sait-elle que sa mère est à bord du VAYN, alors qu'elle ne connaît que son prénom ?
- Où et comment est-elle montée ?

**Correction minimale**
- Retirer « il y a dix jours » et « pour monter dans ce train ».
- Ajouter une phrase à `pourquoi`, par exemple : « À Clairval, un réfugié de Lyon m'a juré qu'une médecin appelée Hélène était montée dans le VAYN. »
- Une phrase sur l'embarquement, par exemple : « Je l'ai rattrapé plus haut sur la ligne, un soir où il s'était arrêté. »

Cela garde le doute, et donc le mystère.

#### D-12 — L'écoute de la radio est attribuée à Mara, et la nomme avant qu'on la connaisse

**Preuve**
- C5 : à 12:59, sans jamais avoir vu Mara, « Écouter » répond « Mara parlait de 21 h » (`train_objects.ts:574`).
- À 21:00, la notification dit « L'heure de Clairval, d'après Mara » (`events.ts:24`).
- Écouter 4,7 MHz donne l'entrée **« Mara : “Clairval existe” »**, dont le texte se termine par « Personne d'autre ne l'a confirmé » (`train_objects.ts:571`). Le joueur vient pourtant de l'entendre lui-même.

**Correction minimale** : une entrée propre à l'écoute (« La voix de Clairval »), et des textes conditionnés à ce que le joueur sait (témoignage de Mara ou journal radio).

#### D-13 — Les promesses sont mémorisées ou non selon les personnages

| Promesse | Effet ensuite |
|---|---|
| Garder le secret de la radio | ✓ la révélation est retirée |
| Couvrir Vasseur | ✓ la révélation est retirée |
| Couvrir Marchetti | ✓ la révélation est retirée |
| « Ça restera entre nous » (Castel, aveu de l'altercation) | ✗ rien n'est lu ensuite (`castel_couvert`). C6 : on peut raconter « la nuit de Théo » devant tout le train ; Castel perd 1 point, sans réaction. |
| « Je ne dirai rien à personne » (Mara) | ✗ `rev_mere` reste proposé sans conséquence (vérifié). |

**Correction minimale** : soit retirer ces révélations, soit les garder avec une mention « vous aviez promis » et une vraie réaction (confiance fortement en baisse, une ligne d'épilogue).

#### D-14 — L'épilogue dit « parts égales » après un vote de parts au mérite

**Preuve** : P2-Passager. Le conseil vote « parts au mérite », le trafic est ensuite révélé, et l'épilogue dit « Les parts sont égales » (`story.ts:99`).

**Correction** : conditionner la phrase au vote, ou la rendre neutre (« plus rien ne part vers le Salon la nuit »).

#### D-15 — « Cachet intact » après avoir ouvert la lettre

**Preuve**
- P2-Majordome : la lettre est ouverte à la vapeur, puis remise ; Marchetti remarque même « le cachet brisé ».
- L'épilogue et la conséquence disent pourtant « cachet intact » (`story.ts:133`, `quests.ts:99`).

**Correction** : retenir que la lettre a été lue, et prévoir deux variantes de texte.

#### D-16 — Lire le tableau des rations démarre la mission de Rosa et coche l'enquête

**Preuve**
- P2, quatre personnages : le tableau parle de l'**eau**, mais son effet coche « Découvrir qui prend la ration en trop » (`train_objects.ts:352`).
- La mission démarre sans Rosa, et sa demande (« Tu as l'air soucieuse ») disparaît.

**Correction** : retirer `obj:q_ration.enquete` de ce tableau.

#### D-17 — Mourir dans la brume affiche « Blessures »

**Preuve** : `changeStat` déclare la mort avec « Blessures » (`game.ts:404`) avant la cause propre à la brume (`App.ts:658–664`). Observé dans un premier essai.

**Correction** : poser la cause avant d'infliger les dégâts.

#### D-18 — Petites contradictions de dialogue

| Texte | Problème | Proposition |
|---|---|---|
| Noé, introduction du Passager : « Castel dit qu'il a sauté. Moi je dis que c'est pas vrai » (`story.ts:45`) | Noé a vu quelqu'un sauter à 00:30. | « Castel dit qu'il s'est sauvé. Théo, il se sauve pas. » |
| Rosa : « Chaque matin, il me manque une ration » / Noé : « maintenant Théo est plus là, alors c'est moi » (`people.ts:89`, `people.ts:125`) | Noé n'aurait commencé que ce matin. | Noé : « Moi, j'ajoutais un peu le matin. Maintenant, il n'y a plus que moi. » |
| Vic (version payante) : « Il a parlé du dépôt de la gare » il y a trois jours (`people.ts:179`) | L'arrêt à Saint-Aubin est accidentel. | « Il voulait savoir où on trouve ces relais : dans les dépôts de signalisation. » |
| Le vieux Bastien : « Trois jours qu'on est arrêtés » (`npcs.ts:172`) | Arrêtés depuis la nuit. | « Arrêtés en pleine nuit, sans prévenir… » |
| « Jour 2, 06:30 » (`story.ts:86`) et pupitre « J2 12:00 » (`train_objects.ts:46`) | Le HUD affiche « Jour 148 ». | « Jour 148, 06:30 » ; « demain 12:00 » |

#### D-19 — Le récit de Théo est introuvable si on ne le demande pas au poste

**Preuve** : C4b, Théo ramené directement. À bord, il n'a qu'une réplique, sans choix (`people.ts:276`).

**Correction** : ajouter l'option « Raconte-moi cette nuit » au nœud à bord.

#### D-20 — L'émission est à 21 h, mais Théo emprunte le K3 à 23 h 40 « une nuit seulement »

**Preuve** : Mara (`people.ts:39`), le journal de Castel et le carnet de Théo disent tous « 21 h ». Pourquoi Théo démonte-t-il le K3 près de trois heures plus tard ?

**Correction minimale** : « chaque soir, à partir de 21 h, en boucle jusqu'au matin ». C'est cohérent avec la « boucle » d'Anselme, et ne touche qu'une réplique et une entrée.

---

## 4. Risques de confusion (pas des contradictions)

- **D-29.** Le mot du Jour 101 est signé « J. Sorel-Arnaud » (`exterior.ts:107`).
  - Ce nom n'apparaît nulle part ailleurs, ni dans le carnet ni dans la feuille de route du chapitre II.
  - Il frôle « Sorel » alors que Mara dit ignorer le nom de famille de sa mère.
  - Intention inconnue : voir la section 7.
- **D-27.** Le dessin sous l'oreiller de Théo est « un dessin d'enfant… d'une écriture maladroite ». Or Mara a environ 16 ans (12 ans il y a 4 ans).
- **D-27.** La cachette de Noé contient « le même [dessin] que dans l'atelier », même si l'on n'a pas vu l'atelier (`train_objects.ts:472`).
- **D-27.** Marchetti : « La prochaine boîte… je la garde pour votre sœur. Tenez. C'est la dernière que j'avais » : deux idées contradictoires dans la même réplique.
- **D-27.** Théo : « Dis à Vasseur que je lui dois une pompe ». C'est Vasseur qui a vidé la pompe.
- **D-27.** L'origine du billet « cabine 0 » dans la poche du Contrôleur n'est jamais dite.
- **D-24.** L'écran d'expédition annonce pour Castel : « Mais que fera-t-il s'il retrouve Théo ? ». Il ne se passe rien de particulier entre eux.
- **D-30.** Le pupitre de conduite est signalé à tous mais enfermé dans la cabine : le Passager et le Majordome ne pourront jamais y accéder, et le marqueur trompe.
  - Le Passager n'entre en salle radio qu'au prix d'un long détour (confiance 2 avec Castel).
  - Ce sont des choix d'accès acceptables, car il existe d'autres chemins (carnet de Théo).

---

## 5. Progression et missions

**Aucune mission principale n'est bloquante.** Les 26 parcours vont jusqu'à l'assemblée et à l'épilogue.
Le fil principal est porté par l'horloge : conseil à 17:00, réveil à 05:30, départ à 12:00, assemblée à 15:00.

### D-07 — Les objectifs principaux ne suivent pas la compréhension

C'est le problème de progression le plus important.

- **« Trouver ce qui a fait tomber la filtration »** ne se coche **qu'à la réparation**, pas quand le joueur a compris (`f_panne`, récit de Théo).
  - Dans les parcours où le conseil ne répare pas la filtration (P1, P3 à P6), l'objectif affiché reste bloqué dessus jusqu'à l'installation du K3. Cela couvre toute la nuit et toute l'expédition, et va jusqu'à la fin si le K3 n'est pas installé.
  - « Dormir avant l'expédition » et « Expédition : trouver un relais K3 » ne s'affichent donc jamais.
- **« Comprendre où part l'eau »** ne se coche **que par un audit voté avec preuves**.
  - P2-Passager et P2-Mécanicien comprennent tout, mais perdent le vote.
  - L'objectif affiché reste « Comprendre où part l'eau » pendant la nuit, l'expédition et jusqu'à l'assemblée.
- **« Retrouver la trace de Théo »** se coche avec les traces du dépôt.
  - Dans P1, le joueur rentre avec le K3 sans jamais aller au poste.
  - Il manque alors la scène qui explique tout (Théo), le VAYN-2 d'Anselme et la boucle de Clairval.
  - L'objectif d'expédition ne parle que du K3.

**Correction minimale**
- Permettre à un objectif de se cocher par une condition (« fait si… »). C'est une petite fonction du moteur.
- Panne : `f_panne`, ou récit de Théo, ou filtration réparée.
- Réserves : `f_detournement`, ou aveu de Marchetti, ou échange connu.
- Ajouter pendant l'expédition un objectif « Retrouver Théo (traces vers le talus, à l'est du dépôt) », coché par la rencontre.

### Autres problèmes

- **D-21.** Les quatre missions personnelles ne passent jamais à « terminée », même tous objectifs cochés (P2).
- **D-22.** Des objectifs ne se cochent pas par d'autres voies tout aussi valables :
  - « Trouver des antibiotiques » ne se coche pas par le vol (C7) ni par la pharmacie de la gare ;
  - « Retrouver la personne qu'elle cherche » ne se coche pas par la déduction du carnet ;
  - « Décider de son sort avant la fouille » ne se coche pas par la réunion avec Sorel ni par le mensonge à Castel.
- **D-28.** Avec le chemin principal seul, la fin donne peu de réponses : voir la section 6.

---

## 6. Ce que garde un joueur qui ne fait pas tout

| Parcours | Panne | Théo | Réserves | Mara | Clairval | VAYN-2 |
|---|---|---|---|---|---|---|
| P1, histoire principale (×4) | mécanisme seul | partiel (version de Castel, traces) | rien | rencontrée par la fouille | rien | découverte brute |
| P3, refuse les quêtes secondaires | ✓ (Théo) | ✓ | rien | rencontrée | boucle seule | préparée |
| P5, indices manqués | ✓ (Théo) | ✓ | rien | rencontrée | boucle seule | préparée |
| P6, méfiant | ✓ (Théo) | ✓ | rien | motif connu | doute | préparée |
| P2, explorateur (×4) | ✓ | ✓ | ✓ avec le motif | ✓ | indices + doute | préparée |

Une seule visite au poste d'aiguillage donne presque toute l'histoire principale : panne, nuit de Théo, VAYN-2 et doute sur Clairval.
C'est une bonne nouvelle : **il suffit d'y conduire le joueur** (D-07) pour que l'histoire reste compréhensible sans tout faire.
Le trafic d'eau reste, lui, une piste d'enquête. C'est acceptable pour un mystère, à condition que l'objectif ne bloque pas l'affichage.

---

## 7. Informations manquantes pour juger certaines parties

1. **Les réponses prévues pour les mystères du chapitre II** (VAYN-2, homme en gris, auteur de l'horaire fantôme, sort de Clairval). La feuille de route les cite sans les trancher. J'ai seulement vérifié que rien, dans le chapitre I, ne les contredit.
2. **« J. Sorel-Arnaud »** (D-29) : est-ce une amorce voulue (le père de Mara ? un frère ?) ou un reste ? Selon la réponse : la garder et l'assumer, ou retirer « Sorel ».
3. **Le rythme « officiel » du trafic d'eau** (D-08) : lequel garder ? Je propose deux jerricans, deux nuits par semaine.
4. **L'âge voulu de Mara** : 16 ans d'après les dialogues, ce qui contredit « dessin d'enfant ».
5. **Le niveau de réponse garanti sans exploration** (D-28) : choix de conception. Faut-il que le joueur minimal entende toujours le récit de Théo ?
6. **Le comportement réel de l'interface**, non testé ici : parler à travers la grille, trajets des PNJ, probabilité réelle de perdre un compagnon, lisibilité des notifications.

---

## 8. Mystères volontaires (à préserver)

Voir aussi la section 11 de la carte.

- Castel se contredit (« il a dû sauter », « je ne l'ai pas vu ») : faille de menteur.
- Castel dit « hors service depuis des semaines », alors que le cahier officiel s'arrête il y a 8 jours : il ment.
- Vasseur crie au sabotage pour cacher la pompe.
- Deux « garçons » chez Madame : la note vise Théo, la lettre vise Noé.
- Clairval : boucle depuis le Jour 96, mot du Jour 101, Mara qui en parle au présent.
- Le VAYN-2, l'horaire fantôme dans le journal du Contrôleur, l'homme en gris, la brume.
- L'ironie de l'épilogue quand le lien mère-fille n'a pas été découvert.

---

## 9. Améliorations possibles (pas des bugs)

- **D-23.** Des systèmes qui promettent un effet sans en produire :
  - l'antenne de toit ne change rien ;
  - « le vacarme a dû porter loin » (grille de la gare) n'alerte pas les chiens.
- **D-23.** Du contenu mort : la conséquence « laisser les antibiotiques à un autre » n'est jamais proposée ; la mort de Théo n'existe pas, mais l'épilogue la prévoit.
- **D-25.** Si le conseil a rendu le K3 à la filtration, le K3 du dépôt ne sert à rien. On ne peut pas rendre la radio à Sorel et Mara.
- **D-26.** « Soigner sa jambe » retire une trousse de secours, même si l'on n'a qu'un bandage ou des antibiotiques. Sans trousse, le soin ne coûte rien.
- **D-24.** Une courte scène Castel–Théo si Castel est le compagnon.
- **D-28.** Garantir un minimum de réponses publiques à l'assemblée, par exemple si Théo a été ramené.

---

## 10. Plan de correction par priorité (proposé, non appliqué)

Chaque lot préserve les mécaniques, les dialogues réussis et l'identité de VAYN.
Les parcours d'audit deviendront des tests de non-régression.

| Lot | Priorité | Contenu | Nature | Ampleur |
|---|---|---|---|---|
| **A** | 1 | D-01, D-02, D-03, D-04, D-05, D-06, D-11 : l'état du monde respecte ce que le joueur a fait | Code (App, conseil, épilogue) + contenu | ~10 petites modifications localisées |
| **B** | 1 | D-07, D-19 : le fil principal mène au poste et coche les objectifs à la compréhension | Petite fonction du moteur + missions | Une fonction de condition « fait si » et 4 objectifs |
| **C** | 2 | D-08, D-09, D-10, D-12, D-13, D-14, D-15, D-16, D-17, D-18, D-20 : contradictions de texte, fuites, promesses | Surtout du texte, plus une entrée de carnet | ~30 phrases |
| **D** | 3 | D-21 à D-27, D-29, D-30 : finitions | Contenu | Au cas par cas |

Ordre conseillé : A, puis B, puis C, puis D.
Après chaque lot :
- relancer les 25 tests et les 26 parcours ;
- refaire une partie courte dans le navigateur.

Les décisions demandées en section 7 (2, 3, 4, 5) concernent surtout les lots C et D.
