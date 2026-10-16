# Audit de jouabilité — Chapitre I « Signal faible »

**Référence auditée : `b493e4fb7b035220a717152d9931459f9544a052`** (`b493e4f`)
**Chantier de correction : A1 + A2 + A3 — reference de correction appliquée au-dessus de `b493e4f`**

Rapport strictement diagnostique d'abord (phase lecture seule, aucun fichier modifié), puis
chantier de correction minimal, validé par typecheck, suite complète de tests, tests d'audit
croisé et builds.

---

## 1. Méthode et limites

- Moteur piloté par le harnais `audit-narratif/outils/harness.ts`, qui rejoue les flux réels de
  `App` (conseil, sommeil, expédition, retour, assemblée) et `DialogueRunner`. **Un test moteur
  n'est pas une validation visuelle à l'écran** : ce qui est mesuré et ce qui est lu dans le code
  sont distingués à chaque anomalie.
- Parcours joueur explicite, guidedé par le texte des objectifs :
  `traces (07:24) → poutre/cric → armoire K3 (08:02) → meute → Théo (08:32-08:47) → retour (11:05)`.
- Les blobs Git de `src/content/quests.ts`, `src/engine/game.ts`, `src/content/story.ts`,
  `src/ui/panels.ts`, `src/content/train_objects.ts` et `src/content/dialogues/council.ts` ont été
  comparés entre l'arbre local audité et l'arbre distant de `b493e4f` : **identiques**. L'audit
  porte donc bien sur cette référence.
- Scan anti-spoiler : **0 occurrence** de résolution de C‑9/RTC, du statut des quarante, du secret
  de VAYN‑1 ou de Sorel‑Arnaud dans les textes joués. « Sorel‑Arnaud » n'apparaît que dans la
  signature canonique du mur du J101. La présence de « VAYN‑2 » et le message « ne vous arrêtez
  pas à Clairval » sont conservés. **Aucune réécriture narrative.**
- Couverture de dialogues mesurée : 16 états représentatifs, 19 dialogues, 196 nœuds / 203 choix,
  **86 nœuds et 89 choix atteints**. Ce chiffre **ne prouve pas** l'existence de contenu mort :
  `dbg-explore` atteint `castel.premier / hub / nuit / nuit2 / cle` par le routage réel de
  `DialogueRunner` ; la limite est l'heuristique de parcours du balayeur, pas le contenu. Aucune
  conclusion de contenu mort n'est tirée de ce chiffre.

### Correction d'une affirmation antérieure

Les quatre parcours d'agent générique de la phase diagnostique **n'exerçaient aucune action à
l'extérieur** : l'agent sortait à 06:30 puis rentrait aussitôt, son heuristique de score ne
créditant rien dans la zone outdoor. Le parcours extérieur a donc été rejoué explicitement avant
tout verdict. Le constat « les quatre personnages terminent le chapitre » reste vrai, mais il
n'est établi que **avec** l'expédition.

---

## 2. Verdict

**Le Chapitre I est terminable avec les quatre personnages**, parcours extérieur inclus
(Trouvé, ramené, épilogue cohérent). Aucune impasse bloquante, aucun objectif obligatoire
inatteignable, aucun secret divulgué, aucune fin incohérente avec les décisions.

Cinq anomalies ont été trouvées, toutes dans la **couche d'état et d'affichage des objectifs**,
aucune dans la simulation. Trois sont corrigées ici ; deux sont signalées sans être traitées.

---

## 3. Défauts confirmés et corrections

### A1 — Un objectif invisible peut s'achever tout seul · **moyenne · CORRIGÉ**

**Cause racine** — `Game.objectiveDone()` (`src/engine/game.ts`) ignorait le champ `if` de
l'objectif et n'évaluait que sa condition `doneIf` ; `renderQuests` (`src/ui/panels.ts:153`)
affiche tout objectif `done`, y compris ceux dont la visibilité est fausse.

`src/content/quests.ts` :
```
{ id: 'panne',        …, if: 'o:q_main.machines',                        doneIf: 'e:f_panne | … | obj:filtration=repare' }
{ id: 'expedition',   …, if: 'ev:expedition_depart',                     doneIf: 'obj:filtration=repare' }
{ id: 'theo_dehors',  …, if: 'ev:expedition_depart & zone:exterior',     doneIf: 'met:theo | e:c_traces_theo' }
```

**Parcours déclencheur (Contrôleur)** — tableau d'alarmes puis installation du K3 au conseil
(`objst:filtration=repare`). À J1 18:00, `if = false`, `doneIf = true` : le panneau Missions
affiche « Expédition : trouver un relais K3 et revenir avant 12:00. » **barré**, alors que
l'expédition n'a lieu que le J2 06:30.

**Parcours déclencheur (Mécanicien)** — `CHARS.mecanicien.rel.theo = { met: true }`
(`src/content/chars.ts:104`) et `q_main.theo.doneIf = 'met:theo'` : à J1 07:05, « Retrouver la
trace de Théo Lagarde. » est déjà barré. Le joueur n'a jamais vu l'objectif.

**Aggravation mesurée** — `currentObjective()` ne renvoie que le premier objectif incomplet. Tant
que `q_main.expedition` était faussement `done`, il était exclu du HUD **et** du panneau Missions :
**le seul rappel « revenir avant 12:00 » disparaissait pour les trois personnages qui réparent la
filtration**. Or rester dehors après 12:00 déclenche `App.missedTrainFlow()`
(`src/app/App.ts:981-997`) → sans signal rouge, sans draisine et sans le sursis de Vasseur,
`g.die('Abandonné à Saint-Aubin')`. La mort est un état d'échec voulu ; c'est l'absence
d'orientation qui était le défaut.

**Corrections appliquées**

1. `src/engine/game.ts` — un objectif invisible ne peut plus s'achever tout seul :
   ```ts
   return !!od?.doneIf && (!od.if || this.check(od.if)) && this.check(od.doneIf);
   ```
2. `src/content/quests.ts` — suppression du `doneIf` de `q_main.expedition`. Sans cette suppression,
   la garde de visibilité aurait seulement déplacé le défaut : l'objectif se serait coché à
   l'instant de sortir du train. La complétion explicite existe déjà et est unique :
   `App.returnToTrain()` (`src/app/App.ts:950`) — qui couvre la portière, le retour tardif, la
   draisine et le sursis de Vasseur.
3. `src/content/quests.ts` — `q_main.theo_dehors.doneIf` passe à
   `'e:c_traces_theo | (met:theo & !char:mecanicien)'`. Sans l'exclusion du Mécanicien,
   l'objectif se serait coché à l'instant de sortir, puisque `met:theo` est vrai dès le départ.

**Comportement après correction (mesuré)**

| Moment | `theo_dehors` | `expedition` |
|---|---|---|
| J2 06:30, arrivée à Saint-Aubin | à faire | à faire |
| J2 08:04, traces examinées | accompli | à faire |
| J2 10:54, retour à bord | masqué (hors expédition) | accompli |

Et pour le Mécanicien, la ligne du HUD à 06:30 est désormais :
**« Expédition : trouver un relais K3 et revenir avant 12:00. »**

---

### A2 — Une mission personnelle s'active chez un autre personnage · **moyenne · CORRIGÉ**

**Cause racine** — le garde-fou `personal` n'existait que dans `completeObjective()`
(`src/engine/game.ts:675`). Ni `startQuest()` ni `completeQuest()` ni `failQuest()` ne l'appliquent,
alors que ces trois méthodes **créent** l'entrée de mission.

`src/content/train_objects.ts:257-259` — action **volontairement ouverte à tous** (variante de
texte `{if:'char:passager'} … {if:'true'} …`) :
```
A('Donner les antibiotiques', { if: 'has:antibio & !f:lou_soignee', fx: [ …, 'obj:qp_passager.soigner', 'qdone:qp_passager', …] })
```

**Parcours déclencheur (Mécanicien)** — trouver des antibiotiques, aller au lit de Lou, donner.

**Résultat mesuré avant correction** : `qp_passager = { status: 'done', obj: {} }`, zéro
objectif coché, et une carte **« Personnel — La liste d'attente »** marquée terminée dans le
panneau Missions, avec « Donner les antibiotiques à Lou. » barré.

**Correction appliquée** — `src/engine/game.ts` : extraction du garde en méthode privée
`foreignPersonal()`, appliquée à `startQuest`, `completeQuest` et `failQuest` (et réutilisée par
`completeObjective`). Aucun site de production n'appelle `startQuest('qp_*')` pour un mauvais
personnage : les parcours légitimes sont inchangés.

**Effet secondaire gratuité** : trois sites `qdone:qp_majordome` sans garde
(`council.ts:217`, `story.ts:214`, `train_objects.ts:508`) deviennent sûrs par construction. Ils
étaient **inatteignables** en l'état : la lettre cachetée n'existe que pour le Majordome
(`chars.ts:75`) et seul le Majordome peut la déplier à la vapeur (`people.ts:273`,
`if: 'char:majordome & has:lettre_madame'`).

---

### A3 — Objectif de quête principale laissé non coché · **moyenne · CORRIGÉ**

`src/content/story.ts:200` (`rev_mere`) appliquait `qdone:q_mara` **sans** `obj:q_mara.reunion`,
alors que les cinq autres voies de réunion le font : `people.ts:52`, `people.ts:54`,
`council.ts:84`, `council.ts:260`, `motions.ts:67`.

**Parcours déclencheur (propre)** — Passager ; Mara **non capturée** à la fouille de 16:00 et
**cachée dans les dortoirs** ; au conseil, l'assemblée va jusqu'à `rev_mere`
(`if: e:f_mere & !f:mara_cellule & !f:mara_expulsee & !dead:mara` → vrai, parsing du `!` vérifié).

**Résultat mesuré avant correction** : `q_mara.status = 'done'` alors que `reunion` reste non
coché — et **visible** (`if: 'e:f_mere & !f:mara_cellule & !f:mara_expulsee'`). Le joueur arrive à
l'assemblée de 15:00 avec une mission « terminée » qui affiche encore une case à faire.

**Correction appliquée** — ajout de `obj:q_mara.reunion` dans la liste d'effets de `rev_mere`,
alignement strict sur les cinq autres sites. Aucun texte, aucun rythme, aucun enchaînement touché.

---

### A4 — Aucun retour visible à la complétion d'un objectif · **faible · NON TRAITÉ (à arbitrer)**

`completeObjective()` émet `emit('quest', q)` mais ne déclenche aucun toast, contrairement à
`startQuest()` (« Nouvelle mission : … »), `completeQuest()` (« Mission terminée : … ») et
`failQuest()` (« Mission compromise : … »). Le HUD (`src/ui/hud.ts:90-92`) n'affiche qu'une ligne,
l'objectif courant, sans historique.

**Conséquence mesurée** : sur le parcours extérieur, la ligne du HUD reste « Comprendre l'arrêt du
train… » pendant 4 h 30 de jeu actif sans jamais signaler que « Retrouver la trace de Théo
Lagarde » vient d'être validé à 07:24.

**Correction suggérée** : ne déclencher le toast que sur le premier objectif réellement coché d'une
quête visible, et seulement si `check(od.if)` — soit au maximum un toast par quête, ce qui préserve
le plafond de 3 toasts validé au chantier 3. **Choix de confort de lecture, pas un bug** : c'est
pour cela qu'il n'a pas été appliqué d'office.

### A5 — Conséquence orpheline `cq_lou_cede` · **faible · NON TRAITÉ**

`cq_lou_cede` est la **seule** conséquence de tout le corpus jamais observée par une entrée de
carnet ni portée par une mission (vérifié sur les 21 sites `qdone:` et l'intégralité de
`journal.ts`, `upgrades.ts`, `quests.ts`). Aucun impact sur la terminaison. À traiter dans un
chantier de coquillage ultérieur.

---

## 4. Vérifications conformes

| Point | Preuve |
|---|---|
| **Terminaison des 4 personnages, expédition comprise** | traces 07:24 → K3 08:02 → Théo 08:32-08:47 (récit / soin / « On te ramène au train ») → retour 11:05 → `expedition=true`, `theo=true`, `cq_theo_sauve`, `chapitreDone=true` à J2 15:00 pour les 4. |
| **Alternative du signal rouge** | `signal_rouge` + Théo laissé → Anselme hisse Théo au passage ; fin cohérente. |
| **Atteignabilité des objectifs obligatoires** | `qp_mecanicien.vasseur`, `qp_controleur.cabine`, `qp_majordome.garcon`, `q_ration.decider`, `q_main.reserves` : tous ont au moins une voie `obj:`. `q_main.conseil`, `dormir`, `assemblee` sont pilotés par code (événements), `expedition` et `theo_dehors` par un déclenchement explicite de contexte ou d'événement. |
| **Exclusion des morts / absents / expulsés** | Mara expulsée → `npcSpot=null`, plus aucune ligne « elle est à bord », pas de dialogue Anselme en zone train, pas de siège au conseil. Vasseur morte → même comportement. |
| **Promesses tenues** | Silence promis à Castel et à Mara, « parts égales », « cachet intact » : conséquences et lignes d'épilogue vérifiées (tests N1, N3, D‑13→D‑15). |
| **Indice de `q_main.panne` jouable sans connaissance externe** | L'onglet « Faits établis » expose un bouton **« Relier… »** et un message d'aide explicite ; `pompe de secours → bon de sortie` produit le fait. |
| **Bornes de spoiler** | Aucun mystère résolu avant le canon du Chapitre I. |
| **Continuité** | Aucun dialogue, design, rythme ou canon modifié. |

---

## 5. Tests de régression ajoutés

`tests/audit-chapitre1.test.ts` — **11 tests** couvrant A1 (5), A2 (3) et A3 (2), dont :

- « Trouver ce qui a fait tomber la filtration » n'est pas barré avant d'être visible ;
- « Expédition » reste à faire après la réparation de la filtration, visible au départ, coché au
  retour, et **présente dans le HUD** pendant l'expédition ;
- le Mécanicien garde « Retrouver Théo » visible pendant l'expédition ;
- « Retrouver Théo » hors les murs ne se coche que depuis l'expédition, pour tous les personnages ;
- donner les antibiotiques à Lou ne crée pas de mission chez le Mécanicien ;
- `startQuest`, `completeQuest` et `failQuest` respectent la garde `personal`, et la mission du
  personnage concerné reste parfaitement fonctionnelle ;
- `rev_mere` coche bien `q_mara.reunion`, qui est visible au moment de la révélation.

### Trois tests historiques ont dû être mis à jour

`tests/consequences.test.ts` encodait l'ancien contrat, c'est-à-dire le défaut :

| Test | Ancienne assertion | Nouvelle assertion | Motif |
|---|---|---|---|
| « un objectif se coche par sa condition « fait si… » » | `panne` était `done` avant que `machines` soit fait | `panne` reste `false` tant qu'invisible, puis `true` une fois `machines` fait | A1 |
| « les réserves et la trace de Théo… » | `theo_dehors` `done` sans expédition | `false` avant, `true` en expédition | A1 |
| « une mission personnelle se termine (D‑21) » | `qp_controleur` `status: 'active'` chez le Passager | `undefined` : ni l'effet ni `startQuest` ne créent de mission fantôme | A2 |

Aucun de ces trois tests ne perdait de couverture : chacun vérifie toujours la propriété qu'il
voulait vérifier (auto-coche par `doneIf`, autres voies de `theo`/`theo_dehors`, mission
personnelle qui se termine) — dans le contrat corrigé.

---

## 6. Validations du chantier de correction

| Validation | Résultat |
|---|---|
| `npm run typecheck` | **OK** |
| `npx vitest run` (hors audit) | **135 / 135** (124 historiques + 11 nouveaux) |
| `npx vitest run --config audit-narratif/outils/vitest.config.ts` | **2 / 2** |
| `npm run build` | **OK** |
| `npm run build:pages` | **OK** |

---

## 7. Risques latents (non confirmés, volontairement non traités)

1. `obj:qp_controleur.choix` est appliqué sans garde dans `rev_trafic` (`story.ts:189`). Sans effet
   visible grâce au garde de `completeObjective` ; à supprimer par cohérence quand A2 est appliqué.
2. `cq_lou_cede` (A5).
3. Le garde `personal` n'est appliqué qu'aux missions ; `qp_controleur` reste affichable dans le
   panneau Missions si `startQuest` était appelé par erreur — désormais impossible.
---

## 8. Couverture réelle des dialogues (complément d'audit, après correction)

Cette section répond à la seule question utile sur le contenu : **existe-t-il des nœuds ou des
choix que rien dans le jeu ne peut rendre disponibles ?**

### Méthode, corrigée

Le premier balayage (`sweep.ts`, 16 états fabriqués à la main) annonçait 86 nœuds sur 196 atteints.
Ce chiffre **n'était pas trustworthy** : l'outil saturait à la profondeur 9 sur les dialogues à
boucle (192 chemins abandonnés sur le seul `castel`), et il excluait les scripts d'ouverture
(`start_*`, `depart_quai`, `reveil_infirmerie`), soit 20 nœuds hors champ. Une seconde version
« BFS sur l'espace des états » a été écartée : elle explosait (39 561 états) tout en explorant
moins. La méthode retenue est un BFS sur les **chemins de choix**, exact par rejeu déterministe,
alimenté par des **états réels** :

- `harvest.ts` sous-classe le harnais et capture l'état complet après chaque action, chaque
  dialogue et chaque événement, sur 8 parcours (4 personnages × 2 jeux de matériel), en suivant
  les objectifs et en parlant à tous les PNJ ;
- **856 états réels capturés**, ramenés à **152 états distincts** (les doublons ne différaient que
  par l'heure ou la position) ;
- balayage de **tous** les dialogues, scripts d'ouverture compris, profondeur 12.

### Résultat

| Mesure | Valeur |
|---|---|
| Dialogues | 19 |
| Nœuds déclarés | 196, dont **6 nœuds de routage** (`{ route: […] }`) jamais visitables directement — exclus du dénominateur |
| Nœuds réellement visitables | **190** |
| Nœuds atteints en jeu réel | **133 (70 %)** |
| Nœuds jamais atteints | **57** |
| Choix affichés en jeu réel | **123 / 203 (61 %)** |
| **Nœuds morts (aucune arête entrante dans tout le corpus)** | **0** |

L'analyse statique des gardes (`gateau.ts`) reconstitue, pour chacun des 57 nœuds jamais atteints,
les arêtes qui y mènent et la condition qui les protège. **Aucun n'est mort** : tous sont
conditionnels, et leurs gardes sont des faits de jeu ordinaires — `e:f_mere` (relier les deux
moitiés du médaillon), `f:ration_coupable`, `f:mare_reunie`, `char:majordome`,
`f:marchetti_destitue`, `f:noe_puni`, `f:vic_rancune`, `f:lettre_revelee`, `e:c_pompe_secours`,
`dead:mara & f:mere_reunie`, `has:relais_k3`, `trust:villiers>=1`, etc.

Extrait de la cartographie des gardes (le fichier complet est produit par `gateau.ts`) :

```
mara.secret        ↳ choix depuis mara.hub (n°5)                « e:f_mere & !f:mere_reunie & !f:mere_tue »
sorel.mere         ↳ choix depuis sorel.hub (n°3)               « e:f_mere & !f:mere_reunie & !f:mara_cellule & !f:mara_expulsee & !dead:mara »
sorel.deuil        ↳ start                                      « dead:mara & f:mere_reunie »
marchetti.destitue ↳ start                                      « f:marchetti_destitue »
rosa.interim       ↳ start                                      « f:marchetti_destitue & !seen:rosa.interim »
villiers.ouvrir    ↳ choix depuis villiers.hub (n°2)            « char:majordome & has:lettre_madame »
vasseur.malo_aveu  ↳ choix depuis vasseur.pompe_aveu2 (n°0)     « char:mecanicien »
castel.cafe        ↳ choix depuis castel.hub (n°4)              « char:majordome & !has:cle_radio & !f:cafe_castel »
```

**Conclusion : aucun contenu mort dans le Chapitre I.** Les 57 nœuds non atteints par ces parcours
sont des contenus conditionnels, tous atteignables par un autre parcours — plusieurs ont d'ailleurs
été atteints explicitement pendant cet audit (Mara cachée puis révélée à l'assemblée, Vasseur
morte, Marchetti destitué, la lettre portée au conseil).

### Vérification anti-spoiler sur le corpus réel

200 000 textes réellement joués (15,9 millions de caractères), collectés après correction :

| Motif | Occurrences |
|---|---|
| `C-9`, `RTC`, « dispersant », « ordre de service » | 0 |
| « les quarante sont morts », « père de Mara », « secret de VAYN‑1 » | 0 |
| `Sorel-Arnaud` | 0 |
| `VAYN‑2` | 0 |
| `Clairval` | 4 853 — le nom apparaît partout (mission « La voix de Clairval », message du récepteur d'aiguillage) |

**Aucune résolution prématurée.** Conformément aux bornes du Chapter I.

### Ce que ce travail ne prouve pas

- Un test moteur n'est pas une validation visuelle à l'écran.
- La récolte d'états suit des parcours guidés par les objectifs ; un parcours humain très différent
  ouvrirait probablement encore quelques branches. Le résultat important n'est pas le pourcentage,
  c'est le **zéro nœud mort**.
