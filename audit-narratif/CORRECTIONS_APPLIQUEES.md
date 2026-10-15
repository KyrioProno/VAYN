# Corrections appliquées — audit narratif du Chapitre I

Date : 15 octobre 2026 · Sauvegarde d'avant corrections : `/home/user/VAYN-backup-avant-corrections.tar.gz`
Source des bugs : `audit-narratif/DIAGNOSTIC.md` (D-01 à D-30), `REFERENCES_CROISEES.md`, `PARCOURS_EXECUTES.md`.

Rien n'a été retiré du jeu : aucun personnage, aucune mission, aucun choix, aucun lieu n'a été supprimé.
L'interface n'a pas été touchée (seule la logique d'affichage des objectifs et des libellés a été corrigée).
Le message final « …ici VAYN-2… ne vous arrêtez pas à Clairval. » est **inchangé**, ainsi que tous les mystères volontaires.

---

## 1. Fichiers réellement modifiés

### Moteur
| Fichier | Modification |
|---|---|
| `src/engine/game.ts` | Nouvelle règle `checkCompanionDeath()` (le mort quitte le bord : drapeau, conséquence, `hide:`, plus de compagnon). Nouvelle lecture `objectiveDone()` qui honore les objectifs « faits si… ». `changeStat(k, d, cause?)` accepte la cause de mort. |
| `src/engine/dsl.ts` | Nouvelle condition `dead:<pnj>` (« ce personnage est mort pendant l'expédition »), documentée en tête de fichier. |
| `src/engine/council.ts` | `councilMembers()` exclut le membre mort du conseil : plus de siège, plus de vote, plus d'argument qui le vise, plus de réaction de confiance. |
| `src/engine/types.ts` | Champ `doneIf` sur les objectifs de mission. |
| `src/engine/validate.ts` | La condition `dead:` est validée (contrôle du nom du PNJ). |

### Application et interface (logique uniquement)
| Fichier | Modification |
|---|---|
| `src/app/App.ts` | Mort du compagnon via le moteur ; sauvetage de Théo au retour **même si l'on rentre à l'heure** et que le signal est rouge ; relance du départ pendant le sursis de Vasseur ; plus de menu « le train part sans vous » quand on est déjà à bord ; abandon de Théo au signal (draisine) ; cause de mort propre à la brume. |
| `src/ui/panels.ts` | Le carnet des missions tient compte des objectifs « faits si… ». |
| `src/ui/council.ts` | Les révélations affichent le libellé adapté quand une promesse a été trahie. |
| `src/ui/expedition.ts` | La fiche de Castel n'annonce plus une scène qui n'existe pas. |

### Contenu narratif
| Fichier | Modification |
|---|---|
| `src/content/quests.ts` | Objectifs « faits si… » (comprendre la panne, les réserves, la trace de Théo, l'expédition) ; nouveaux chemins de fin de mission personnelle ; conséquences `cq_castel_trahie`, `cq_mere_trahie`, `cq_lettre_remise_lue`. |
| `src/content/story.ts` | Épilogue : Théo (4 cas), Mara (morte / expulsée / reunie),mort sans accord faux, atelier sans Vasseur, promesses trahies, rationnement au mérite, cachet de la lettre ; révélations à libellés variants ; introduction (géographie). |
| `src/content/dialogues/people.ts` | Mara (première rencontre en cellule, chronologie, origine du mother-hunt, embarquement, sortie de cellule) ; Anselme (Mara expulsée) ; Noé, Vic, Rosa, Agathe ; Théo (récit accessible à bord, soin adapté). |
| `src/content/dialogues/council.ts` | Castel (géographie), cellule + révélation de l'identité de Mara, Sorel (deuil), Marchetti (cadence de l'eau, phrase contradictoire, lettre ouverte), fins de mission personnelle. |
| `src/content/motions.ts` | Argument « c'est la fille de Sorel » : déclenche réellement la réunion, et exige que Mara soit vivante. |
| `src/content/journal.ts` | Cadence du trafic d'eau unifiée ; géographie de la fuite de Théo ; nouvelle entrée « La voix de Clairval ». |
| `src/content/train_objects.ts` | Radio (l'écoute donne la voix, pas le témoignage de Mara), pupitre (date + marqueur), tableau des rations, citerne et registre, cachette de Noé, couchette de Théo, fins de mission. |
| `src/content/exterior.ts` | Les chiens réagissent au vacarme de la gare ; Mara et les chiens (chronologie). |
| `src/content/npcs.ts` | Bastien (« arrêtés cette nuit ») ; répliques ambiantes si Mara ou Vasseur sont mortes. |
| `src/content/events.ts` | Notification de 21 h adaptée à ce que le joueur sait. |

### Tests et outils d'audit
| Fichier | Modification |
|---|---|
| `tests/consequences.test.ts` | **Nouveau** — 23 tests de non-régression (morts, Théo, Mara, objectifs, promesses, cohérence). |
| `tests/content.test.ts` | Adaptation au nouveau type de libellé de révélation. |
| `audit-narratif/outils/harness.ts` | Le banc d'essai recopie désormais la logique **corrigée** de l'App ; `checkCompanion()` délègue au moteur ; le rapport tient compte des objectifs « faits si… ». |
| `audit-narratif/outils/parcours.audit.test.ts` | Deux parcours de plus (C11, C12) et des assertions sur D-01, D-02, D-04. |

---

## 2. Bugs corrigés

| N° | Bug | Correction |
|---|---|---|
| **D-01** | Un compagnon mort réapparaît à bord, parle et vote | `hide:` à la mort ; membre mort retiré du conseil (vote, argument, confiance) ; phrases d'épilogue sans accord faux (« Saint-Aubin a gardé Mara. ») ; réunion mère-fille impossible si Mara est morte ; Sorel a un dialogue de deuil ; répliques ambiantes. **Vérifié par les parcours C8 et C9.** |
| **D-02** | Le signal au rouge est ignoré si l'on rentre à l'heure | Théo monte désormais dans tous les cas (`signal_rouge` + `theo_reste`), avec une phrase adaptée ; la phrase « le signal a regardé passer le train » n'apparaît que si le joueur a réellement laissé Théo au signal. **Vérifié par C11 et P4.** |
| **D-03** | Sursis de Vasseur : le départ n'a jamais lieu | Le retour par la portière relance le départ ; à 12 h 20, si le joueur est à bord, le train part au lieu de proposer une course inutile. **Vérifié par P4-Mécanicien.** |
| **D-04** | L'identité de Mara est révélée sans réunion | L'argument du conseil et celui de la cellule appliquent les mêmes effets que la réunion (conséquence, mission, objectifs, liberté, confiance). **Vérifié par C12.** |
| **D-05** | Mara expulsée : deux destins incompatibles | Réplique d'Anselme au poste, carnet et épilogue alignés (« elle est repartie seule vers la vallée »). |
| **D-06** | « Personne n'a retrouvé Théo » alors qu'on l'a parlé | Branche d'épilogue « vous l'avez vu vivant » ; l'ancien texte n'est réservé qu'au joueur qui n'a jamais rencontré Théo. |
| **D-07** | Les objectifs ne suivent pas la compréhension | Nouvelle règle « fait si… » : la panne, les réserves, la trace de Théo, l'expédition et un nouvel objectif d'expédition (« Retrouver Théo : traces vers le talus ») se cochent dès que le joueur a compris. |
| **D-08** | Le trafic d'eau n'a pas un rythme unique | Un seul rythme partout : **4 jerricans par semaine, en deux sorties de 2 jerricans vers 23 h**. |
| **D-09** | Géographie du train contredite | Castel et le carnet parlent de la fuite « vers l'avant, vers la soute » ; Agathe décrit le trajet vers l'arrière ; l'introduction ne dit plus « en tête / en queue » ; Mara parle de l'infirmerie et non « à trois voitures d'ici ». |
| **D-10** | Mara : chronologie, motif, embarquement | « Neuf jours » partout ; elle n'a pas « monté dans ce train » ; elle raconte comment elle a su pour Hélène et comment elle est montée. |
| **D-11** | La première rencontre en cellule rejoue la cachette | Routage corrigé + variante propre à la cellule (Sorel vient elle-même ouvrir). |
| **D-12** | L'écoute de la radio est attribuée à Mara | Nouvelle entrée « La voix de Clairval » ; textes conditionnés ; notification de 21 h adaptée. |
| **D-13** | Les promesses ne sont pas mémorisées | Trahir la promesse à Castel ou à Mara a maintenant un libellé, une conséquence et une ligne d'épilogue. |
| **D-14** | « Parts égales » après un vote au mérite | Épilogue conditionné par le vote. |
| **D-15** | « Cachet intact » après avoir ouvert la lettre | Drapeau `lettre_lue`, conséquence et texte d'épilogue distincts. |
| **D-16** | Le tableau des rations démarre la mission de Rosa | Retiré : la mission ne démarre que par Rosa, et l'enquête se coche par la cachette de Noé. |
| **D-17** | Mourir dans la brume affiche « Blessures » | La cause est passée avant les dégâts. |
| **D-18** | Petites contradictions de dialogue | Noé, Rosa, Vic, Bastien, et les deux dates (« Jour 148 », « demain 12:00 »). |
| **D-19** | Le récit de Théo est introuvable à bord | Option « Raconte-moi cette nuit-là » au lit d'hôpital. |
| **D-20** | L'émission de 21 h et le K3 à 23 h 40 | « Chaque soir, à partir de 21 h, on réémet en boucle jusqu'au matin. » |
| **D-21** | Les missions personnelles ne se terminent jamais | `qdone:` ajouté à chaque décision finale des quatre missions personnelles. |
| **D-22** | Des objectifs ne se cochent que par une seule voie | Plusieurs objectifs acceptent désormais toutes les voies valables (antibiotiques, mère de Mara, sort de Mara, garçon de Madame, carnet de Vasseur, trafic). |
| **D-23** | Systèmes qui promettent un effet | Le vacarme de la grille alerte désormais les chiens (le drapeau existait, il est enfin lu). |
| **D-24** | La fiche de Castel annonce une scène inexistante | La promesse a été retirée de la fiche. |
| **D-26** | « Soigner sa jambe » vide une trousse même sans trousse | On ne consomme que ce qu'on a réellement (trousse si on en a une, sinon antibiotiques, sinon bandage — jamais les deux). |
| **D-27** | Desses incohérents, Marchetti, Théo et la pompe | Formulations corrigées, y compris « le même dessin » seulement si le joueur a vu l'atelier. |
| **D-30** | Le pupitre est signalé à tous alors qu'il est fermé | Le marqueur n'apparaît que si la porte de la cabine est ouverte. |

---

## 3. Tests exécutés et résultats

```
$ npm test                                        (vitest, tests/)
  Test Files  4 passed (4)
  Tests      48 passed (48)
    tests/content.test.ts        3
    tests/engine.test.ts        17
    tests/playthrough.test.ts    5
    tests/consequences.test.ts  23   ← nouveau

$ npx vitest run --config audit-narratif/outils/vitest.config.ts
  Test Files  2 passed (2)
  Tests       2 passed (2)
    28 parcours joués dans le vrai moteur (P1–P6 × 4 jouables, C1–C12)

$ npm run typecheck        aucune erreur
$ npm run build            ✓ built in 7.31 s
```

Les 26 parcours existants ont été rejoués après chaque lot de corrections ; deux parcours ont été ajoutés
(C11 « signal rouge + retour à l'heure », C12 « identité de Mara révélée au conseil »), et `PARCOURS_EXECUTES.md`
ainsi que les 28 journaux ont été régénérés.

---

## 4. Problèmes restants

- **D-23 (antenne de toit)** : l'amélioration « Antenne de toit » pose toujours un drapeau sans effet mécanique.
  Volontairement non corrigée : il faudrait inventer une mécanique nouvelle, ce qui sort du cadre d'une correction de bugs.
- **D-25** : si le conseil a rendu le K3 à la filtration, le relais du dépôt n'apporte plus rien. L'objectif est au moins
  automatiquement satisfait ; le texte n'a pas été retraité.
- **D-28** : aucune garantie d'un minimum de réponses publiques à l'assemblée quand Théo a été ramené. Non traité (amélioration).
- **D-24 (vrai)** : il n'y a toujours pas de scène Castel–Théo si Théo est ramené. La promesse a été retirée plutôt que
  d'écrire une nouvelle scène.
- `cq_lou_cede` (« laisser les antibiotiques à un autre ») reste une conséquence jamais proposée : le chemin n'existe pas
  dans le jeu, elle a été laissée en place.
- La branche d'épilogue `theo_mort` reste inatteignable (Théo ne peut pas mourir) : conservée par sécurité.
- **D-29** (« J. Sorel-Arnaud ») : conservé tel quel — c'est le père de Mara dans la bible narrative.

## 5. Vérifications qui demandent encore un test dans l'interface

1. **Départ pendant le sursis de Vasseur** : jouer en Mécanicien, prendre le relais à la fin, revenir par la portière
   pendant les vingt minutes, vérifier que le train part vraiment (narration, mouvement, point de reprise).
2. **Sauvetage de Théo au signal rouge** : mettre le signal au rouge, laisser Théo, rentrer à l'heure avant 12 h ;
   vérifier la phrase de narration et l'épilogue (« Théo dort à l'infirmerie »).
3. **Compagnon mort** : partir avec Vasseur ou Mara, la laisser mourir dans la brume, vérifier qu'elle disparaît du
   décor, qu'on ne peut plus lui parler, et qu'elle ne siège plus au conseil de 15 h (cartes, votes).
4. **Réunion Sorel–Mara révélée au conseil** : dire « c'est la fille de Sorel » au conseil, puis parler à Sorel :
   la réunion doit déjà avoir eu lieu.
5. **Première rencontre de Mara en cellule** (ne pas fouiller la soute) : le dialogue doit commencer par la cellule.
6. **Onglet Missions** : vérifier que « Trouver ce qui a fait tomber la filtration » se coche après le récit de Théo,
   et que « Retrouver Théo : traces vers le talus » apparaît pendant l'expédition.
7. **Assemblée** : avec une promesse faite à Castel ou à Mara, vérifier que le libellé de la révélation change.
8. **Lecteur d'épilogue** : relire l'épilogue d'une partie où Vasseur est morte et celle où Mara est morte.