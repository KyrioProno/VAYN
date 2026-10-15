# Corrections N1 → N7 — rapport final

Branche : `arena/3701bb39-vayn` · Date : 2026-10-15 · Périmètre : contenu narratif, tests, outils d'audit.
Aucun fichier de moteur (`src/engine`), d'interface (`src/ui`) ni d'application (`src/app`) n'a été modifié.
Aucune réécriture d'histoire, aucun personnage, aucun choix et aucune ambiance retirés.

---

## 1. Fichiers modifiés (12)

| Fichier | Correction |
|---|---|
| `src/content/story.ts` | N1 (typo `castel_couverte`, effets de `rev_theo`, ligne d'épilogue), N4 (fin de Mara morte), N5 (4 lignes de promesses non tenues), N2b (variante d'épilogue « la porte, elle, est restée fermée » + garde de `rev_mere`), N6 (branche morte `theo_mort` supprimée) |
| `src/content/motions.ts` | N3 (`m_mere.fx` réduit à `set:mere_revelee_conseil` ; les effets de réunion passent dans l'option `accueil`), N2 (`set:mara_cellule` ajouté à l'option `cellule`) |
| `src/content/quests.ts` | N2/N2b (objectif `q_mara.reunion` masqué si `mara_cellule` ou `mara_expulsee`), N6 (`cq_theo_mort` supprimé) |
| `src/content/npcs.ts` | N6 (`!f:theo_mort` retiré de l'emploi du temps de Théo — drapeau jamais posé) |
| `src/content/train_objects.ts` | N6 (`f:vasseur_aide` retiré des deux conditions du relais K3 — drapeau posé nulle part), antenne (nouvelle action « Régler l’antenne de toit » sur le poste radio) |
| `src/content/upgrades.ts` | Antenne : l’effet annoncé est décrit exactement, plus de promesse vide |
| `src/content/dialogues/council.ts` | N2/N2b (3 gardes : entrée « La fille, dans la cellule… », choix « C'est la fille de la docteure Sorel », choix « Votre fille est vivante »), N4 (routage de Sorel vers `deuil` seulement si `dead:mara & f:mere_reunie`) |
| `src/content/dialogues/people.ts` | N7 (variants `soigne` sur les drapeaux posés par le nœud : `soin_trousse` / `soin_antibio`) |
| `tests/consequences.test.ts` | 3 assertions fragiles reprises + 21 tests de régression N1→N7 + 6 tests d’antenne + garde-fou lexical anti-drapeau-orphan |
| `audit-narratif/outils/parcours.audit.test.ts` | 2 nouveaux parcours joués (C13, C14), assertions associées, honesty-check sur le libellé de C3 |
| `audit-narratif/outils/harness.ts` | Journal du conseil : mention de l'égalité et de son arbitrage (« égalité tranchée par la position du joueur » / « repli ») |
| `tsconfig.json` | `"types": ["vite/client", "node"]` — nécessaire aux imports `node:` du test lexical ; aucun code applicatif touché |

---

## 2. Correction par point

### N1 — la promesse faite à Castel (« ça restera entre nous »)

- **Défaut** : le drapeau posé par la promesse s'appelait `castel_couverte` (féminin) alors que le dialogue, la ligne d'épilogue et la révélation lisaient `castel_couvert`. La promesse n'était donc jamais reconnue. En prime, `rev_theo` appliquait `trust:castel-1` même quand le joueur avait demandé au conseil d'entendre la vérité.
- **Corrigé** : drapeau canon `castel_couvert` (3 occurrences corrigées). `rev_theo.fx` :
  - `if:f:castel_couvert?trust:castel-3;conseq:cq_castel_trahie` — trahison punie **uniquement** si la promesse a été faite ;
  - `if:!f:castel_couvert & !f:castel_a_reveler?trust:castel-1` — petite perte de confiance seulement si le joueur n'avait rien promis **et** n'avait pas promis le contraire ;
  - l'épilogue « …et ce que Castel vous avait juré » n'apparaît plus sans promesse.
- **Preuve** : 3 tests dédiés (`tests/consequences.test.ts`, bloc `N1`), dont « n'avoir rien promis : ni conséquence de trahison, ni grande perte de confiance ».

### N2 / N2b — plus aucune scène de réunion après un verdict qui la contredit

- **Défaut** : le verdict « cellule » ne posait **aucun** drapeau, et **aucun** des trois passages n'était protégé par le verdict :
  - « La fille, dans la cellule… » (entrée de Castel) : condition `f:mara_capturee & !f:mara_libre` — vraie aussi **après une expulsion** (l'expulsion pose `mara_expulsee` + `hide:mara`, pas `mara_libre`) ;
  - « C'est la fille de la docteure Sorel » (nœud `cellule2`) : condition `e:f_mere & !dead:mara` — aucune ;
  - « Votre fille est vivante. Elle est à bord. » (Sorel) : condition `e:f_mere & !f:mere_reunie` — aucune.
  Conséquence réelle : après une expulsion, le joueur pouvait encore dire à Castel que la fille est celle de Sorel et **la faire remonter à bord** (`mara_libre`, `loc:mara=`, `mere_reunie`) ; après une incarcération, il pouvait encore réunir la mère et la fille. L'objectif `q_mara.reunion` restait affiché dans les deux cas, et la révélation d'assemblée `rev_mere` restait possible après une incarcération.
- **Corrigé** : `cellule.fx` pose `set:mara_cellule`. Gardes `!f:mara_cellule & !f:mara_expulsee` (et `!dead:mara` côté Sorel) sur les trois choix ; objectif `reunion` conditionné ; `rev_mere` passe à `e:f_mere & !f:mere_reunie & !f:mara_cellule & !f:mara_expulsee & !dead:mara`. Aucune conséquence `cq_mere_reunie` ne peut donc être créée après ces verdicts.
- **Preuve** : 3 tests (`bloc N2 / N2b`) + parcours **C13** (verdict cellule) et **C14** (verdict expulsion) joués de bout en bout (§ 4).
- **Trou trouvé en cours de route (corrigé)** : c'est le parcours C13 qui a révélé que `rev_mere` restait disponible à l'assemblée après une incarcération ; le garde-fou a été étendu à l'assemblée, pas seulement aux dialogues.

### N3 — `m_mere` ne conclut rien avant le verdict

- **Défaut** : l'argument du conseil `m_mere` portait `set:mere_reunie`, `conseq:cq_mere_reunie`, `obj:q_mara.reunion`, `trust:sorel+3`, `trust:mara+3`, `qdone:q_mara`. Comme `useArg` applique les effets immédiatement, **dire** « c'est la fille de Sorel » suffisait à déclencher toute la suite : la réunion, même si le conseil votait l'expulsion ou l'incarcération. (Test D-04 : c'est ce faux positif qui rendait le test « fragile ».)
- **Corrigé** : `m_mere.fx = ['set:mere_revelee_conseil']`. Tout le reste est porté par l'option `accueil`, sous `if:f:mere_revelee_conseil`. La conclusion est donc le résultat réel du vote.
- **Preuve** : 4 tests (`bloc N3`) : l'argument seul ne change rien à l'état de Mara ; verdicts `expulsion` et `cellule` ⇒ aucune réunion ; verdict `accueil` ⇒ réunion et `cq_mere_reunie`. Parcours C12 (réunion), C13 (cellule), C14 (expulsion).

### N4 — le deuil de Sorel suppose la rencontre

- **Défaut** : `start` de Sorel routait vers `deuil` dès `dead:mara`, et l'épilogue disait « Sorel, à l'infirmerie, a recommencé à préparer le dîner pour deux » même sans réunion — une affirmation « elle me l'avait dit à l'infirmerie » sans aucune scène correspondante.
- **Corrigé** : `start: [{ if:'dead:mara & f:mere_reunie', go:'deuil' }, { if:'f:mere_reunie', go:'reunie' }, { go:'hub' }]` ; épilogue : variante « … La docteure Sorel n'a jamais su qui elle était. Elle a repris son service, sans rien dire. » sans `mere_reunie`.
- **Preuve** : 2 tests (`bloc N4`).

### N5 — les promesses faites au conseil ont une suite

Drapeaux examined **avant** toute suppression ; chacun a reçu une ligne d'épilogue, conditionnée à la non-réalisation :

| Drapeau | Où il est posé | Ligne d'épilogue ajoutée (si non réalisé) |
|---|---|---|
| `castel_a_reveler` | Castel, « le conseil entendrait la vérité » | « Vous aviez promis à Castel que le conseil entendrait la vérité sur cette nuit… » (`& !theo_public`) |
| `radio_a_reveler` | Castel, radio | « …Deux cents personnes ignorent encore qu'un barrage de survivants tient sous la brume… » (`& !radio_revelee`) |
| `vasseur_aide` → `vasseur_a_reveler` | Vasseur, « Le conseil doit savoir » ( pompe) | « Vous aviez promis au conseil de dire la vérité sur la pompe de secours… » (`& !vasseur_revelee & !malo_avoue`) |
| `marchetti_menace` | Castel, à Marchetti | « Vous avez dit à Marchetti que le conseil en entendrait parler ce soir… » (`& !marchetti_destitue`) |

Aucun drapeau n'a été supprimé. Preuve : 1 test de table couvrant les 4 cas.

### N6 — contenus morts

- `cq_theo_mort` (conséquence « Théo n'a pas survécu ») : supprimé — aucun code ne le posait ; les deux fins réelles de Théo (`cq_theo_sauve`, `cq_theo_laisse`) sont intactes.
- `!f:theo_mort` dans l'emploi du temps de Théo : supprimé — drapeau jamais posé.
- Branche d'épilogue `else if (f('theo_mort'))` (« Théo n'est jamais revenu… ») : supprimée — inatteignable.
- `f:vasseur_aide` : le drapeau **n'est posé nulle part** (vérifié : plus aucune occurrence dans `src/`, `tests/`, `audit-narratif/outils/`). Les deux conditions du relais K3 qui le lisaient ont été purgées ; l'aide de Vasseur reste possible par le dialogue (`k3`/`k3_2`), qui est la voie prévue.
- **`up_antenne` (« Antenne de toit »)** — ce point était resté ouvert à la fin du premier chantier (le drapeau `set:antenne` n’était lu nulle part : l’amélioration ne coûtait qu’une promesse sans effet). Il est traité dans la section 7 ci-dessous.

### N7 — « de votre mieux » vs antibiotiques

- **Défaut** : le texte « Vous faites de votre mieux avec ce que vous avez » était choisi quand le joueur n'avait **ni trousse ni antibiotiques**, mais aussi quand il n'avait que des antibiotiques — et, plus grave, le variant « Vous videz la trousse de secours » (condition `has:bandage_comp`) ne pouvait **jamais** être affiché : `DialogueRunner.enter` applique `n.fx` **avant** de calculer le texte, donc la compresse était déjà prise.
- **Corrigé** : variants conditionnés par des drapeaux posés par le fx du nœud — `f:soin_trousse` (« Vous videz la trousse de secours… ») et `f:soin_antibio` (« Vous n'avez pas de trousse : vous vous enservez avec les antibiotiques et une compresse. ») ; le fx pose `set:soin_antibio` quand il utilise les antibiotiques. Le texte générique reste le troisième cas.
- L'ordre d'évaluation du moteur n'a **pas** été modifié (le faire aurait des effets de bord sur les dialogues multi-blocs).
- **Preuve** : test dédié « N7 : sans trousse mais avec antibiotiques, le texte dit ce qui a été utilisé ».

---

## 3. Tests ajoutés ou repris

`tests/consequences.test.ts` : **44 tests** (23 existants + 21 ajoutés).

- **Les 3 assertions fragiles demandées, reprises** :
  1. *T1* (`currentObjective`) : le test comparait l'objectif courant à une chaîne en dur → il compare désormais aux textes de `CONTENT.quests.q_main.objectives[0]` et `[2]`, la source de vérité.
  2. *T2* (`r_quota_injuste`) : le test jouait un mauvais argument ; il utilise maintenant `r_quota_injuste` avec le personnage `passager`, et vérifie que l'argument est actif avant la mort de Vasseur puis absent après.
  3. *T3* (faux positif D-13) : le test posait `castel_couverte`, le drapeau **mal orthographié** — il ne testait donc pas la promesse du tout. Il pose `set:castel_couvert`, et D-04 a été réécrit pour prouver que l'argument seul ne vaut pas réunion (la réunion ne vient que de `applyResult(..., 'accueil')`).
- **Garde-fou permanent** : « aucun drapeau lu sans être posé » — analyse lexicale de tous les fichiers `f:x` et de tous les effets `set:`/`once:`/`give:`/`entry:`, avec une liste d'exceptions documentée (cinq drapeaux posés par `App.ts`, plus `vote_expedition`/`vote_rationnement` posés par le moteur du conseil). Contre-épreuve faite : un `f:drapeau_fantome_de_verification` temporaire dans `src/__verif_garde_fou.ts` fait échouer le test avec le message `drapeau_fantome_de_verification (__verif_garde_fou.ts:1)` ; le fichier temporaire a été supprimé.

---

## 4. Résultats exacts des validations

| Commande | Résultat |
|---|---|
| `npm run typecheck` | **0 erreur** |
| `npm test` | **75 / 75** (4 fichiers : consequences 50, engine 17, content 3, playthrough 5) |
| `npx vitest run --config audit-narratif/outils/vitest.config.ts` | **2 / 2** — 30 parcours joués de bout en bout |
| `npm run build` | **OK**, `✓ built in 5.65s` |

`audit-narratif/PARCOURS_EXECUTES.md` et les 30 journaux (`audit-narratif/journaux/*.txt`) ont été régénérés par le harnais.

### Les 4 scénarios exigés, et où ils sont réellement joués

| Scénario | Parcours | Verdict réel au conseil | Preuve dans le journal |
|---|---|---|---|
| **Réunion** | `C12-mere-revelee-au-conseil`, `C1-revelation-au-conseil` | `clandestin: accueil` après `m_mere` + `m_mere_marchetti` + `m_theo` | `mere_reunie=true`, `cq_mere_reunie` dans les conséquences |
| **Emprisonnement** | `C2`, `C3-cellule-puis-expedition`, `C4b`, `C5`, `C6`, `C7`, `C9`, `C10`, `C11`, **`C13`** | `clandestin: cellule` | Mara en `ad_cellule`, `cq_mara_cellule`, aucune `cq_mere_reunie` |
| **Expulsion** | **`C14-revelation-puis-expulsion`** | `clandestin: expulsion` (Castel + Marchetti) | `mara_expulsee=true`, `npcSpot('mara') = null`, `cq_mara_expulsee`, épilogue « débarquée à Saint-Aubin » |
| **Mort** | `C8-mara-meurt` (Mara), `C9-vasseur-meurt` (Vasseur) | Mara morte en expédition, sans réunion → pas de scène de deuil | épilogue « n'a jamais su qui elle était » |

### Les choix contradictoires au conseil

- **C13 — « j'ai révélé la filiation, le conseil a incarcéré »** (`m_mere` utilisé, position du joueur `cellule`, votes `castel=cellule, vasseur=cellule, marchetti=expulsion, sorel=accueil`). Après le verdict, le journal enregistre :
  `✗ choix « La fille, dans la cellule » absent dans castel.hub` et `✗ choix « Votre fille est vivante » absent dans sorel.hub`, `mere_reunie=undefined`, `conséquences = cq_mara_capturee, cq_rationnement_quota, cq_mara_cellule`, épilogue « Mara attend dans sa cellule… la porte, elle, est restée fermée ».
- **C14 — « j'ai révélé la filiation, le conseil a expulsé »** (`m_mere` utilisé, position `expulsion`, votes `castel=expulsion, vasseur=cellule, marchetti=expulsion, sorel=accueil`). Après le verdict : mêmes deux choix absents, `point de Mara=null`, `conséquences = … cq_mara_expulsee`, aucune ligne « Sorel et Mara ne se quittent plus ».

Les deux chemins ont été **joués**, pas seulement raisonnés : `vote_clandestin` vaut `cellule` pour C13 et `expulsion` pour C14 dans `PARCOURS_EXECUTES.md`.

### Correction d'honnêteté du rapport

Le parcours `C3` s'appelait `C3-mara-expulsee` alors que son verdict réel est `cellule` (politique d'abstention). Le libellé mentait sur ce qui était testé ; il est devenu `C3-cellule-puis-expedition`, et une assertion vérifie désormais le verdict réellement obtenu.

---

## 5. Ce qui n'a **pas** été fait / vérifié

- **Le « choix contradictoire » au sens de l'accessibilité des scènes est vérifié au niveau journal** (choix absent dans le journal) et au niveau unitaire (le dialogue lève une erreur si on force le choix). Je n'ai pas joué manuellement le jeu dans un navigateur : toute la validation est faite dans le moteur réel via le harnais d'audit et les tests.
- **Aucun parcours n'a été joué avec une version qui casse volontairement le contenu** : la contre-épreuve du garde-fou est la seule expérience « négative » menée, et elle est documentée ci-dessus.
- **L’antenne a désormais un effet réel** (section 7) : aucune intrigue inventée, aucun indice rendu inaccessible — mais **aucun message radio supplémentaire n’a été écrit**, voir la section 7 pour pourquoi la bible l’interdit et ce qu’il faudrait décider pour en ajouter un.
- Les 30 parcours rejoués à chaque exécution de l'audit ne couvrent pas les 4 personnages × tous les embranchements ; la grille de compréhension (`PARCOURS_EXECUTES.md`) le documente explicitement (colonnes « indices », « préparée », etc. — « non » signifie « jamais obtenu dans ce parcours », pas « impossible »).
- Le moteur du conseil n'a pas été retouché : `memberScores`, `resolveVote` et `applyResult` sont exactement ceux de la version vérifiée.

---

## 6. Comment reproduire

```bash
npm ci
npm run typecheck
npm test                                    # 75 tests
npx vitest run --config audit-narratif/outils/vitest.config.ts   # 30 parcours + xref
npm run build
```

---

## 7. Antenne de toit : l’effet annoncé, et pourquoi pas de message supplémentaire

**Constat initial** : `up_antenne` posait `set:antenne`, drapeau que rien ne lisait. Le joueur payait une pièce et 40 minutes pour une promesse sans effet.

**Systèmes radio existants (examinés avant de choisir)** :

| Où | Objet | Ce qu’il délivre |
|---|---|---|
| Train, salle radio | `train_objects.ts` → `radio` | `Examiner le poste` → indice `c_relais_radio` ; `Écouter 4,7 MHz` (≥ 21 h, 20 min) → indice `c_voix_clairval` + `f:clairval_entendu` ; `Écouter` le jour → trois variantes de texte, aucun effet ; `Retirer le K3` → `k3_retire_radio` + `radio_muette` (poste muet) |
| Saint-Aubin, poste d’aiguillage | `exterior.ts` → `recepteur` | `Écouter` (10 min) → indice `c_emission_clairval` (boucle enregistrée du Jour 96) |
| Rappel d’horaire | `events.ts` → `soir_radio` (J1 21 h) | un simple toast |
| Final | `story.ts` → `twistText` | le message du VAYN-2, en salle radio si le poste fonctionne, sinon au pupitre |

**Effet implémenté** — nouvelle action sur le poste du train : `f:antenne & !f:k3_retire_radio & day>=2 & clock<21:00`, 10 minutes, mêmes effets que l’écoute de 21 h (`entry:c_voix_clairval`, `set:clairval_entendu`). L’action n’existe pas avant 21 h (l’écoute normale est déjà disponible), et pas après non plus (elle ne double pas l’écoute de 21 h). La description de l’amélioration est réécrite pour dire exactement cela.

Pourquoi cette condition-là :

- `!f:k3_retire_radio` est le test de « le poste fonctionne » déjà utilisé par l’écoute de 21 h et par la condition d’achat de l’amélioration ;
- `day>=2` : l’émission ne commence qu’à 21 h (Mara : « chaque soir, à partir de 21 h, on réémet en boucle »), donc l’antenne n’a rien à accrocher avant la première émission ; l’indice du carnet dit « en boucle depuis 21 h », l’entendre à 9 h le jour même serait faux.

**Tests ajoutés (6, dans `tests/consequences.test.ts`, bloc « N6 (suite) ») :**

1. achetée → l’action existe en dehors de 21 h, donne l’indice, coûte 10 minutes et consomme la pièce ;
2. sans antenne et avant 21 h → l’action n’existe pas, l’écoute de jour ne donne rien ;
3. sans antenne, à 21 h → l’écoute fonctionne comme avant (aucun indice essentiel n’est réservé à l’achat) ;
4. avant la première émission → rien à accrocher ;
5. poste non opérationnel (`k3_retire_radio`) → l’effet disparaît, et l’amélioration n’est même plus proposable ;
6. à 21 h → c’est l’écoute du poste qui parle (20 minutes), l’antenne ne double rien.

**Pourquoi aucun message supplémentaire n’a été écrit** : la bible l’interdit (§ 0.2 : « une proposition qui exigerait un objet absent du jeu est une mauvaise proposition » ; § 1.3 et § 400/418 : « le mur est une transcription, pas une voix nouvelle » — la boucle de Clairval *est* le message du chapitre). Ajouter une seconde voix sur 4,7 MHz serait inventer une intrigue, et les seuls autres messages radio existants (la boucle du Jour 96 d’Anselme, le J3 « Paris ne répond plus », Sorel-Arnaud) sont soit déjà portés par un autre objet, soit postérieurs au chapitre, soit hors sujet. **Si vous voulez un vrai message supplémentaire, c’est une décision d’écriture** : dites-moi lequel et je le rédige (le récepteur d’Anselme est déjà en place, mais l’antenne du train ne peut pas le déclencher).
