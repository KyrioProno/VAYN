# Vérification des corrections narratives de VAYN — consigne pour une autre IA

## 1. Contexte

Jeu narratif web (Vite + Phaser + TypeScript), chapitre I « Saint-Aubin », en français.
Dépôt : `https://github.com/KyrioProno/VAYN` (public), branche **`arena/3701bb39-vayn`** (commits `fcf9f8d` et `9fbc918`).

```bash
git clone --depth 1 --branch arena/3701bb39-vayn https://github.com/KyrioProno/VAYN.git vayn
cd vayn && npm ci
```

Un audit narratif complet avait été fait avant correction : `audit-narratif/DIAGNOSTIC.md` (bugs D‑01 à D‑30),
`audit-narratif/REFERENCES_CROISEES.md`, `audit-narratif/PARCOURS_EXECUTES.md`.
Le compte rendu des corrections est `audit-narratif/CORRECTIONS_APPLIQUEES.md`.
Bible narrative (canon, ne pas contredire) : `BIBLE_NARRATIVE_VAYN.md`.

## 2. Ce qui a été corrigé (27 bugs sur 30)

Lot A — l'état du monde respecte ce que le joueur a fait
- D‑01 un compagnon mort réapparaît à bord, parle et vote → `hide:` à la mort, membre mort retiré du conseil, phrases d'épilogue sans accord faux, dialogue de deuil pour Sorel, répliques ambiantes.
- D‑02 le signal au rouge est ignoré si l'on rentre à l'heure → Théo monte dans tous les cas (`signal_rouge` + `theo_reste`), phrase adaptée.
- D‑03 sursis de Vasseur : le départ n'a jamais lieu → le retour par la portière relance le départ ; à 12 h 20, si le joueur est à bord, le train part.
- D‑04 l'identité de Mara révélée sans réunion → l'argument du conseil et celui de la cellule déclenchent les effets de la réunion.
- D‑05 Mara expulsée : deux destins incompatibles → réplique d'Anselme, carnet et épilogue alignés.
- D‑06 « Personne n'a retrouvé Théo » alors qu'on l'a parlé → branche d'épilogue « vous l'avez vu vivant ».
- D‑11 première rencontre de Mara en cellule qui rejouait la cachette → routage corrigé + variante cellule (Sorel ouvre elle-même).

Lot B — objectifs et progression
- D‑07 objectifs qui ne suivent pas la compréhension → nouvelle règle « fait si… » (`doneIf`), nouveaux objectifs, objectif d'expédition « Retrouver Théo ».
- D‑19 récit de Théo inaccessible à bord → option « Raconte-moi cette nuit-là ».
- D‑21 missions personnelles jamais terminées → `qdone:qp_*` sur chaque décision finale.
- D‑22 objectifs accessibles par une seule voie → voies alternatives ajoutées.

Lot C — contradictions de texte
- D‑08 rythme du trafic d'eau unifié (4 jerricans/semaine, deux sorties de 2 vers 23 h) · D‑09 géographie du train · D‑10 chronologie/origine/embarquement de Mara · D‑12 la radio donne une voix, pas le témoignage de Mara · D‑13 promesses mémorisées (Castel, Mara) · D‑14 parts au mérite · D‑15 cachet de la lettre · D‑16 le tableau ne démarre plus la mission de Rosa · D‑17 cause de mort dans la brume · D‑18 contradictions de dialogue et dates · D‑20 émission en boucle dès 21 h.

Lot D — finitions
- D‑23 le vacarme de la grille alerte les chiens · D‑24 promesse retirée de la fiche de Castel · D‑26 le soin ne consomme que ce qu'on a · D‑27 dessins, Marchetti, Théo et la pompe · D‑30 le pupitre n'est signalé que si la porte de la cabine est ouverte.

Non corrigés (assumés) : D‑23 antenne de toit (il faudrait inventer une mécanique), D‑25 (cas rare du K3 inutilisable), D‑28 (amélioration), D‑29 « J. Sorel‑Arnaud » conservé (canon bible), `cq_lou_cede` (conséquence jamais proposée), branche d'épilogue `theo_mort` inatteignable (gardée par sécurité).

## 3. Ce qu'il faut vérifier (dans cet ordre)

1. **Tout compile et tout passe**
```bash
npm run typecheck        # attendu : aucune erreur
npm test                 # attendu : Test Files 4 passed (4) · Tests 48 passed (48)
npx vitest run --config audit-narratif/outils/vitest.config.ts
                         # attendu : Test Files 2 passed (2) · 28 parcours dans le vrai moteur
npm run build            # attendu : built sans erreur
```
2. **Le contenu est cohérent** : `tests/content.test.ts` valide toutes les références (drapeaux, entrées, PNJ, objectifs, conditions, effets). Vérifier qu'aucune condition ou effet utilisé n'est inventé et qu'aucune condition DSL n'est inconnue.
3. **Les tests sont des vrais tests, pas des complaisances** : lire `tests/consequences.test.ts` (23 tests) et vérifier que chacun échouerait si la correction était annulée. Signaler tout test tautologique ou qui ne teste pas ce qu'il prétend.
4. **Aucune régression introduite** : relire `git diff` de `src/engine/game.ts`, `src/engine/council.ts`, `src/engine/dsl.ts`, `src/app/App.ts`, `src/content/quests.ts`, `src/content/story.ts`. Chercher notamment : condition `if:` mal comprise (syntaxe réelle : `if:<cond>?<effet1>;<effet2>` = « si cond, alors les deux » ; pas de else), objectif `doneIf` qui cocherait trop tôt, `dead:` utilisé sur un mauvais PNJ.
5. **Cohérence narrative** : le texte ne doit jamais contredire une décision déjà prise (Mara, Théo, les promesses, les votes du conseil) ; pas d'accord masculin/feminin faux ; pas de chronologie cassée ; chronologie et horaires du train.
6. **Règles absolues du projet** (à vérifier, pas à modifier) : ne pas réécrire l'histoire ; ne rien supprimer ; respecter la bible ; **ne pas révéler prématurément Clairval/VAYN‑2** et conserver le message final « …ici VAYN‑2… ne vous arrêtez pas à Clairval. » ; ne pas toucher à l'interface ni à l'apparence ; ne pas « améliorer » ce qui n'est pas cassé.

## 4. Format de la réponse attendue

- Un tableau : bug D‑xx → corrigé oui/non → preuve (fichier:ligne ou test) → ce qui reste.
- La liste exacte des commandes lancées et leurs résultats réels (copier/coller la sortie, pas « ça marche »).
- Les régressions ou incohérences trouvées, classées par gravité, avec le correctif proposé **sans l'appliquer**.
- Une recommandation finale : ce qu'il faut corriger maintenant, ce qui peut attendre, ce qui doit être vérifié dans l'interface (le jeu a une interface Phaser que les tests ne couvrent pas).

Ne modifie aucun fichier avant d'avoir rendu son rapport ; toute modification doit être justifiée et validée.