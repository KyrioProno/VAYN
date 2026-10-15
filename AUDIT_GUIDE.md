# AUDIT_GUIDE — VAYN v0.1 (chapitre I « Signal faible »)

Guide destiné à une IA ou à un humain qui doit **auditer le jeu** sans le rejouer à la main.
Aucune modification n'a été apportée au jeu pour produire cet export.

---

## 1. Contenu de l'archive

L'archive contient **tout le projet** de la version jouable actuelle, dans son organisation d'origine.

| Inclus | Rôle |
|---|---|
| `src/` | Code source complet (moteur, contenu, rendu, interface). |
| `tests/` | Tests du jeu (`npm test`). |
| `audit-narratif/` | Audit narratif déjà réalisé (diagnostic, carte, parcours, journaux, outils headless) **+ bible narrative**. |
| `dev/` | Petits scripts de développement. |
| `docs/` | Version compilée publiée sur GitHub Pages (témoin de ce qui est réellement livré). |
| `public/` | Ressources statiques (répertoire présent, contenu minimal). |
| `index.html`, `vite.config.ts`, `tsconfig.json`, `capacitor.config.ts` | Configuration de build etgreed web/mobile. |
| `package.json`, `package-lock.json` | Dépendances et scripts, versions verrouillées. |
| `README.md` | Présentation du projet, **dont la feuille de route (intentions, pas du code)**. |
| `AUDIT_GUIDE.md` | Ce document. |

| **Exclu** | Pourquoi |
|---|---|
| `.git/` | Historique Git (le contenu est intégralement présent sur disque). |
| `node_modules/` | Absent de la machine d'export ; réinstallable via `npm ci` (voir § 2). |
| `telechargement/` | Page HTML de téléchargement créée pendant cette session ; sans rapport avec le jeu. |
| `VAYN-export.zip` | L'archive elle-même. |

Aucun fichier n'a été renommé, déplacé ni réécrit. L'arborescence est celle du dépôt.

---

## 2. Lancer le jeu localement

**Prérequis :** Node.js 22 (testé sur v22.22.3) et npm 10.
Le jeu est en TypeScript strict + Vite 7 + Phaser 3.90, sans étape de compilation manuelle.

```bash
npm ci            # installe exactement les versions de package-lock.json
npm run dev       # serveur Vite sur http://localhost:5173 (écoute sur 0.0.0.0)
```

| Script | Effet |
|---|---|
| `npm run dev` | Serveur de développement Vite, `--host 0.0.0.0 --port 5173`. |
| `npm test` | Tests du jeu (Vitest) : `tests/content.test.ts`, `tests/engine.test.ts`, `tests/playthrough.test.ts`. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run build` | Vérification des types + build Vite dans `dist/`. |
| `npm run build:pages` | Idem, sortie dans `docs/` (déploiement GitHub Pages). |
| `npm run preview` | Prévisualisation du build, port 4173. |
| `npm run cap:sync` / `cap:android` / `cap:ios` | Synchronisation et ouverture du projet natif Capacitor (iOS / Android). |

Le jeu se joue **en orientation paysage** (le code d'orientation est dans `index.html` et
`src/ui/fullscreen.ts`).

---

## 3. Où sont les scènes, les dialogues et les embranchements

Tout le contenu narratif est dans **`src/content/`**, sous forme de structures de données typées.
Il n'y a **aucune logique de jeu dans ces fichiers** : ils ne décrivent que *ce qui existe*,
les conditions et les effets.

| Fichier | Lignes | Contenu |
|---|---|---|
| `src/content/story.ts` | ~180 | Cinématique d'introduction (`INTRO`), scènes d'ouverture par personnage (`STARTS`), texte de fin de chapitre, **révélations possibles devant l'assemblée** (`REVELATIONS`). |
| `src/content/dialogues/people.ts` | 343 | Dialogues des PNJ (Castel, Vasseur, Marchetti, Sorel, Rosa, Mara, Anselme, Théo, Madame…). Arbres de nœuds, conditions d'entrée, effets. |
| `src/content/dialogues/council.ts` | 261 | Conseil de 17 h, assemblée de 15 h, motions de vote. |
| `src/content/dialogues/util.ts` | 14 | Aides de construction des dialogues (`c`, `n`, `nar`, `s`). |
| `src/content/quests.ts` | 115 | Missions (`QUESTS`), objectifs, conditions d'apparition, fins (`done`/`fail`). |
| `src/content/events.ts` | 46 | Événements horodatés (conseil de 17 h, expédition de l'aube, départ du train, assemblée). |
| `src/content/journal.ts` | 108 | Entrées du carnet : faits, témoignages, indices, déductions, hypothèses. |
| `src/content/motions.ts` | 132 | Motions de vote et Résolutions du conseil / de l'assemblée. |
| `src/content/train_objects.ts` | 635 | Objets du train : ~70 objets avec texte, conditions, effets, dégâts. |
| `src/content/exterior.ts` | 242 | Zone extérieure de la gare de Saint-Aubin : sections, objets, PNJ, messages du mur. |
| `src/content/npcs.ts` | 205 | Apparence, rôle, emploi du temps et position de chaque PNJ. |
| `src/content/train_sections.ts` | — | Géométrie des voitures (pièces, portes, grilles, couloirs) : sert à la fois au rendu et à la navigation. |
| `src/content/upgrades.ts` | 53 | Améliorations (filtration, sterilisateur, pompe…) et leurs effets. |
| `src/content/items.ts` | — | Objets d'inventaire. |
| `src/content/chars.ts` | — | Les quatre personnages jouables : nom, description, méthodes, portrait. |
| `src/content/index.ts` | — | Point d'entrée unique du contenu (`CONTENT`), assemblage de tous les modules. |

**Chaîne d'exécution d'une scène :** `src/app/App.ts` (orchestration : boot, nouvelle partie, sauvegarde,
conseil, nuit, expédition, retour, départ, assemblée, mort, fin) → moteur `src/engine/*` → interface
`src/ui/*` → rendu Phaser `src/world/*`, `src/render/*`.

---

## 4. Comment fonctionnent les variables et les choix

### 4.1 L'état de partie

Défini par `GameState` dans `src/engine/types.ts`, instancié par `src/engine/state.ts` :

`version`, `runId`, `char` (personnage joué), `mode` (`histoire` | `onelife`), `time` (temps de jeu),
`playSeconds`, `zone` (`train` | `exterior`), `pos`, `stats` (health, hydration, satiety, rest),
`res` (food, water, energy, meds, parts), `tokens`, `inv` / `storage` (inventaire),
`flags` (tous les drapeaux), `rel` (relations), `journal`, `conseqs`, `quests`, `doors`, `objects`,
`npcLoc`, `fired` (événements déjà déclenchés), `upgrades`, `expedition`, `checkpointLabel`, `dead`,
`chapterDone`, `deathCause`.

### 4.2 Le mini-langage de conditions

Implémenté dans `src/engine/dsl.ts` (`parseCond`, `evalCond`). Les conditions sont des **chaînes**.
combinaisons : `&` (et), `|` (ou), `!` (non), parenthèses. Comparaisons : `>=`, `<=`, `>`, `<`, `=`, `!=`.

| Préfixe | Signifie | Exemple |
|---|---|---|
| `f:` | drapeau (`flags`) | `f:mara_met` |
| `has:` | objet possédé ou ressource ≥ n | `has:relais_k3`, `has:ration>=2` |
| `char:` | personnage joué | `char:mecanicien` |
| `e:` | entrée de carnet connue | `e:c_socle_vide` |
| `met:` | PNJ rencontré | `met:sorel` |
| `q:` / `o:` | état de mission / objectif accompli | `q:q_theo=done`, `o:q_main.panne` |
| `trust:` `susp:` `debt:` | relation avec un PNJ | `trust:vasseur>=2` |
| `res:` `stat:` `tok` | ressources, statistiques, jetons | `res:water<2`, `stat:health<30` |
| `day` `clock` `t` | temps de jeu | `day>=2`, `clock>=17:00`, `t>=d2@06:00` |
| `up:` | amélioration installée | `up:sterilisateur` |
| `ev:` | événement déclenché | `ev:conseil` |
| `hyp:` `seen:` | hypothèse du carnet, dialogue vu | `hyp:q_theo=h_theo_dehors`, `seen:castel.radio` |
| `obj:` `door:` | état d'objectif, porte | `obj:filtration=repare`, `door:d_soute=open` |
| `zone:` `comp:` `at:` `mode:` | zone, personnage de compagnie, PNJ à un point, mode | `zone:exterior`, `at:castel=ad_securite` |
| `true` / `false` | constantes | `true` |

### 4.3 Les effets

Implémentés par `applyFx()` dans `src/engine/game.ts`. Effets effectivement pris en charge :
`set`, `clr`, `inc`, `give`, `take`, `entry`, `trust`, `susp`, `debt`, `met`, `res`, `stat`, `cstat`,
`time`, `conseq`, `quest`, `obj`, `objst`, `qdone`, `qfail`, `dlg`, `goto`, `if`, `kill`, `end`, `ev`,
`expilog`, `sfx`, `music`, `toast`, `warn`, `tok`, `comp`, `loc`, `lock`, `unlock`, `hide`, `observe`,
`store`, `upgrade`, `checkpoint`.

### 4.4 Validation

`src/engine/validate.ts` vérifie la cohérence du contenu au chargement (identifiants d'objets, de
dialogues, de cibles de quêtes…). Les tests `tests/content.test.ts` s'appuient dessus.

---

## 5. Comment sont enregistrées les conséquences

- **Conséquences nommées** : `src/content/events.ts` déclare des `ConseqDef` (identifiant, texte,
  condition de déclenchement, effets). L'état courant les stocke dans `GameState.conseqs`.
- **Drapeaux** : tout choix est réversible uniquement par son effet ; `fired` empêche le double
  déclenchement d'un événement.
- **Entrées de carnet** : chaque révélation d'indice écrit une entrée (`entry:`) dans
  `GameState.journal`, avec sa source — c'est ce qui permet de tracer *d'où* vient une information.
- **Relations** : `trust`, `susp`, `debt` modifient l'attitude des PNJ et débloquent des branches de
  dialogue ; elles sont lisibles comme conditions.
- **Missions** : `QUESTS` avec objectifs conditionnels (`o:`) ; l'état d'objectif est stocké dans
  `GameState.objects`.
- **Révélations d'assemblée** : `REVELATIONS` (dans `story.ts`) liste ce qui peut être dit devant
  l'assemblée de 15 h ; chacune a une condition `if` et des effets (révélation d'un secret, perte de
  confiance, nouvel objectif…). C'est **le point de contact principal entre l'enquête du joueur et la
  vie du groupe**.

---

## 6. Chapitres et fins

**État réel de la version :** **un seul chapitre est implémenté**, le chapitre I « Signal faible »
(arrivée en gare de Saint-Aubin, jour 147 → 148). Le chapitre II n'existe que comme **feuille de route
dans le `README`** : ce n'est pas du code.

- **Début** : `src/content/story.ts` → `INTRO` (cinématique), `STARTS` (première scène spécifique au
  personnage joué).
- **Fin de chapitre** : `endingScreen()` dans `src/ui/screens.ts`, alimentée par le texte de fin de
  `story.ts` : un **twist** (le message de VAYN-2) puis un **épilogue par personnage**
  (dépendant de l'état : Théo, Mara, le compagnon, la confiance des PNJ), puis les statistiques
  (`statsLines()`).
- **Mort** : `deathScreen()` ; la cause est stockée dans `GameState.deathCause`.
- **Fins personnelles** : il n'existe pas de liste de fins multiples explicite dans le code. La variation
  vient de la **combinaison d'états** au moment de l'écran de fin. C'est un point important pour
  l'audit : la « fin » est calculée, pas sélectionnée dans un arbre.
- **Modes** : `histoire` (avec point de reprise) et `onelife` (sans reprise). En `onelife`, la mort est
  définitive : l'identifiant de partie est inscrit dans une liste de « pierres tombales » avant effacement.

---

## 7. Rejouer des parcours sans tout refaire à la main

### 7.1 La méthode la plus efficace : le banc d'essai headless

Le dépôt contient un **banc d'essai qui rejoue le chapitre I dans le vrai moteur, sans rendu ni
interface**, avec des politiques de jeu scriptées. Il a déjà produit 26 parcours.

```bash
npm ci
npx vitest run --config audit-narratif/outils/vitest.config.ts
```

- `audit-narratif/outils/harness.ts` — moteur d'exécution (`Run`), décisions de politique de jeu,
  journal pas à pas, calcul de compréhension d'un parcours.
- `audit-narratif/outils/parcours.audit.test.ts` — les **26 parcours** : 4 personnages × 2 styles
  (principale, explorateur), plus les scénarios C1 à C10 (Mara en cellule, expulsée, morte ; Théo
  ramené ou perdu ; Vasseur mort ; radio sans Mara ; promesse à Castel ; vol d'antibiotiques…).
  Chaque parcours écrit `audit-narratif/PARCOURS_EXECUTES.md` et un journal dans
  `audit-narratif/journaux/`.
- `audit-narratif/outils/xref.audit.test.ts` — produit `REFERENCES_CROISEES.md` : drapeaux, sources
  d'entrées de carnet, objectifs, conséquences.

**Pour ajouter un parcours** : écrire une fonction `Px(char)` qui renvoie un `Run`, en lui passant une
politique (conseil, expédition, révélations, direction, retour), puis l'ajouter à la boucle
`for (const r of runs)` dans `parcours.audit.test.ts`. C'est la méthode la plus économique pour
vérifier une hypothèse d'audit : on obtient une exécution complète du chapitre sans jouer.

### 7.2 Reprendre une partie à un point précis

- Clés de stockage (navigateur : `localStorage`, natif : Capacitor `Preferences`) :
  `vayn:save`, `vayn:checkpoint`, `vayn:tombstones`, `vayn:settings`, `vayn:history`.
- `src/engine/save.ts` : sauvegarde automatique + point de reprise (mode Histoire), somme de contrôle
  de cohérence, liste de pierres tombales pour le mode One Life.
- `App.ts` expose `saveNow()`, `checkpoint()`, `loadCheckpoint()`. L'état complet est sérialisable : un
  audit peut construire un `GameState`, l'écrire sous `vayn:save`, et charger la partie pour vérifier
  l'écran de fin ou une branche de dialogue.

### 7.3 Limites de ces méthodes

- Le banc d'essai **recopie les séquences applicatives** (conseil, nuit, expédition, retour, départ,
  assemblée) depuis `App.ts` : si `App.ts` change, le banc doit être mis à jour.
- La marche du joueur est **approchée en ligne droite** ; la navigation fine, les collisions et le rendu
  ne sont pas testés.
- Il n'existe **aucun sélecteur de chapitre** dans le jeu : il n'existe pas de « chapter skip » à
  exploiter aujourd'hui.

---

## 8. Audit déjà réalisé (à lire avant de refaire le travail)

| Fichier | Contenu |
|---|---|
| `audit-narratif/LISEZMOI.md` | Point d'entrée. |
| `audit-narratif/DIAGNOSTIC.md` | Bugs narratifs **D-01 à D-30**, plan de correction par priorité, limites de l'audit (section 0). |
| `audit-narratif/CARTE_NARRATIVE.md` | Carte de cohérence : chronologie, secrets, indices, mystères volontaires. |
| `audit-narratif/PARCOURS_EXECUTES.md` | 26 parcours joués. |
| `audit-narratif/REFERENCES_CROISEES.md` | Références croisées générées. |
| `audit-narratif/BIBLE_NARRATIVE_VAYN.md` | **Bible narrative** (voir l'avertissement ci-dessous). |

> ⚠️ **Avertissement important sur `BIBLE_NARRATIVE_VAYN.md`.**
> Ce document est un **plan d'écriture**, pas le contenu du jeu. Il contient des sections explicitement
> étiquetées `[PROPOSITION]`, `[VÉRITÉ SECRÈTE]` et `[À DÉCIDER]` : ce sont des propositions d'auteur
> pour les chapitres II à V, **inexistantes dans la version jouable**. Toute analyse de cohérence doit
> traiter ces propositions comme des hypothèses, jamais comme des faits déjà implémentés. La seule
> source de vérité de ce qui existe est `src/content/`.

---

## 9. Points d'attention pour l'audit

1. **Le contenu est déclaratif** : la plupart des incohérences se trouvent dans les **chaînes de
   conditions** et les **identifiants d'effets**, pas dans la logique TypeScript.
2. **`REVELATIONS`** est le cœur du Chapitre I : vérifier que chaque secret du joueur a bien une
   condition d'apparition atteignable.
3. **Écart connu et documenté** : le registre annonce « aucune cabine 0 » alors que Marchetti exploite
   une « cabine 0 ». Traité comme un mystère à expliquer, pas comme un bug à corriger.
4. **Les identifiants d'audit (`D-01`…`D-30`) sont des défauts de jeu**, jamais des faits d'univers.
5. **La fin est calculée**, pas sélectionnée : il faut tester des combinaisons d'états, pas chercher
   une liste de fins.