# Audit « survie & économie » — lampe, eau, jauges, monnaie, réserves

Date : 2026-10-15 · branche `arena/3701bb39-vayn` (base `98260a8`)
Périmètre : les six questions posées (lampe, nourriture/eau, jauges, monnaie, réserves, présentation).
Hors périmètre : histoire, énigmes Clairval/VAYN-2, mécaniques d'expédition, équilibre des dégâts.

**Aucune validation n'a été faite dans un navigateur.** Tout ce qui est ci-dessous a été vérifié
par le moteur (tests), par lecture du code d'interface, ou par compilation. La section 7 liste
précisément ce qui reste à regarder à l'écran.

---

## 1. Diagnostic : ce qui n'allait pas

| # | Constat (mesuré, avant correction) | Gravité |
|---|---|---|
| 1 | **La lampe n'avait aucun interrupteur.** L'objet `lampe` n'avait pas de champ `use` : impossible de l'éteindre, et l'obscurité du dépôt était pilotée par la seule *possession* (`!g.itemQty('lampe')`). | bloquant pour l'UX |
| 2 | **Le Majordome partait sans lampe.** Seule la section sombre du jeu est `depot` ; les `parts` n'existent que là (`etabli_depot` +1, `caisses_depot` +2), et la mission K3 s'y déroule. Sans lampe, il ne pouvait donc **ni** faire la mission, **ni** trouver les pièces, **ni** boire au château d'eau, **ni** améliorer le train. | softlock de parcours |
| 3 | **Libellés inversés** dans le HUD : la jauge qui se vide s'appelait « Faim » et celle qui se vide en dormant « Fatigue » — l'inverse de ce qu'elles mesurent. | confusion permanente |
| 4 | **`up_dortoirs_calfeutres` était inerte** : le moteur rendait 14 points de repos par heure de sommeil quelle que soit l'amélioration. Promesse non honorée. | promesse |
| 5 | **`vic_rancune` n'avait aucun effet** : Vic annonce « Mes prix viennent de doubler », mais tous les prix restaient inchangés. | promesse |
| 6 | **Aucune explication des jauges** : la soif, la faim et la fatigue tombaient en silence ; les dégâts sous seuil n'étaient jamais nommés. | punition incompréhensible |
| 7 | **Personnel / collectif indistincts** : le panneau Train annonçait la nightly, rien sur ce qui puisait dedans ni sur ce qui ne puisait pas. | lisibilité |
| 8 | **L'étal du Passeur n'était pas signalé** : seul magasin du jeu, invisible tant qu'on ne l'a pas trouvé. | découvrabilité de la monnaie |
| 9 | **Jeter sa lampe = fin de partie pour le mécanicien.** Seule source de jetons du jeu = la vente au Passeur ; le mécanicien part à 5 jetons et n'a rien à vendre, or la lampe coûte 9. | blocage économique |

Mesures de référence relevées avant toute correction (moteur, `controleur`, 07:00 J1 → 23:45 :
hydratation 78 → 28, satiété 70 → 37, repos 72 → 32 ; après une nuit : hydratation 19, repos 100 ;
J2 15:00 : hydratation 0, satiété 12, santé 74). **Ces taux n'ont pas été rééquilibrés** : la
survie reste aussi dure — ce qui a changé, c'est que le joueur sait maintenant *pourquoi*.

---

## 2. Corrections apportées

### 2.1 La lampe : un état, pas une simple possession

- `src/content/items.ts` — la lampe a enfin une action `use` :
  libellé conditionnel (**Allumer** / **Éteindre la lampe**), effet unique `toggle:lampe_on`,
  texte conditionnel lu **après** l'effet (« La manivelle accroche… » / « Vous coupez le faisceau… »).
  Description complétée : « éteinte, elle n'éclaire rien ».
- `src/engine/game.ts` — nouveau verbe d'effet `toggle:<flag>` (bascule atomique), et
  `lampeAllumee()` = *j'ai la lampe **et** elle est allumée*.
- `src/engine/state.ts` — `lampe_on: true` au départ **si et seulement si** le personnage démarre
  avec une lampe : le comportement observé avant est conservé.
- `src/app/App.ts` — le voile d'obscurité et le blocage d'interaction dans `depot` dépendent désormais
  de `g.lampeAllumee()`. Les valeurs visuelles sont **inchangées** (0,45 lampe allumée / 0,86 noir
  total) : seule la condition change. Deux messages distincts : lampe *éteinte* (« ouvrez le Sac
  pour l'allumer ») vs *pas de lampe* (« le Passeur en vend peut-être »).
- `src/content/chars.ts` — le **majordome reçoit une lampe au départ**.
- `src/content/dialogues/people.ts` — Vic **vend une lampe** (9 jetons, 18 jetons si rancune),
  allumée à l'achat (`set:lampe_on`), une seule fois par partie (`vic_lampe`).
- `src/ui/panels.ts` — dans le Sac : ligne d'état (**Lampe allumée — elle éclaire le dépôt.** /
  **Lampe éteinte — elle n'éclaire rien.**) et le bouton **Jeter est retiré pour la lampe**, avec
  la raison affichée. Motif mesuré : c'est le seul objet irremplaçable, et le seul joueur incapable
  de s'en procurer un autre est le mécanicien (5 jetons, aucun objet vendable).

### 2.2 Nourriture et eau

Rien à corriger dans les valeurs : elles sont cohérentes et le joueur les ressent. Les corrections
portent sur la **lisibilité** :

- `src/ui/panels.ts` — nouvelle ligne **« À utiliser : +30 satiété · +4 hydratation »**, lue
  directement dans les `fx` de l'objet (donc jamais désynchronisée du moteur).
- `src/ui/hud.ts` — libellés **Satiété** et **Repos**, plus une aide par jauge (ce que la barre
  pleine signifie, les seuils qui font baisser la santé, le repos < 25 % qui ralentit la marche).

### 2.3 Jauges de survie : les mêmes chiffres, mais expliqués

- `src/engine/game.ts` — `explainStats()` appelé à chaque tick, **une seule fois par seuil** :

  | Seuil | Message |
  |---|---|
  | hydratation < 35 | « Vous avez soif… une gourde, un repas ou la fontaine. » |
  | hydratation < 15 | « Hydratation critique : sous 15 %, votre santé commence à baisser. » |
  | satiété < 35 | « La faim revient… » |
  | satiété < 15 | « Faim critique : sous 15 %, votre santé commence à baisser. » |
  | repos < 25 | « Sous 25 %, vous marchez plus lentement — dormez, ou reposez-vous. » |
  | repos < 8 | « Épuisement critique : sous 8 %, votre santé commence à baisser. » |

- `src/engine/game.ts` — `sleepUntil` : **14 repos/h**, ou **18 repos/h** avec `dortoirs_calfeutres`
  (+30 %, l'amélioration annoncée est enfin réelle).

### 2.4 Monnaie

- `src/content/dialogues/people.ts` — le nœud `acheter` devient un nœud à texte conditionnel
  (« Les prix ont doublé, l'ami. ») et **deux jeux de prix** existent désormais :
  un prix par article, un prix doublé par article, chacun sous la condition qui lui correspond et
  marqué du tag **« Prix doublé »** : jamais les deux à l'écran en même temps.
- `src/content/train_objects.ts` — `etal_vic` devient `important: '!f:vic_trade'` : le seul magasin
  du jeu reste signalé tant qu'on n'y a pas encore traité. `set:vic_trade` est posé à l'entrée des
  nœuds `acheter` et `vendre`.

### 2.5 Réserves du train : collectif / personnel

- `src/ui/panels.ts` — la note du panneau Train est **exacte** : les réserves baissent à minuit, les
  réparations et le matériel d'expédition y puisent, **vos gourdes, rations et médicaments
  personnels ne font pas bouger ces chiffres**.
- Les étiquettes par ligne (`−1/jour`, `−0,8/jour` en rationnement égal, `−0,5/jour` si la filtration
  est réparée, `−4 %/jour` d'énergie) collent déjà à `dailyConsumption()` : elles sont désormais
  verrouillées par test.

---

## 3. Valeurs d'équilibrage retenues (inchangées sauf mention)

**Déclin des jauges** (`DECAY_PER_HOUR`) — inchangé :

| Zone | hydratation | satiété | repos |
|---|---|---|---|
| train | −3 /h | −2 /h | −2,4 /h |
| extérieur | −5 /h | −3 /h | −4 /h |

Dormir : hydratation et satiété ÷ 2, repos immobile puis **+14/h (18/h calfeutré)**.
Dégâts : hydratation < 15 → 1,5 /h · satiété < 15 → 1,2 /h · repos < 8 → 0,5 /h.
À bord, la négligence **endort** (plancher 12 de santé + réveil à l'infirmerie) ; dehors, elle tue.

**Reconstitution** — inchangé : ration +30 satiété / +4 hydratation · gourde +35 hydratation ·
conserve +26 / +6 · café +12 repos / +6 hydratation · repas du comptoir +32 / +22
(+25 / +18 en rationnement égal) · fontaine +20 une fois par service si la filtration est réparée ·
antidouleur +8 santé / −4 repos.

**Jetons** — départ : contrôleur 8 · passager 4 · majordome 12 · mécanicien 5.
Vente (seule source de revenu) : tabac 5 · piles 6 · eau-de-vie 8 · montre 16 · café 5.
Achat (normal → rancune) : masque 14 → 28 · pied-de-biche 8 → 16 · cric 10 → 20 · bandage 4 → 8 ·
jerrican 3 → 6 · antibiotiques 30 → 60 (passager : prix d'ami 20 → 40) · ration 5 → 10 ·
**lampe 9 → 18**.
Améliorations du train : payées en pièces, énergie ou médicaments — **jamais en jetons**.

**Pas de dépense obligatoire.** Vérifié, pas supposé :
- le relais K3, les 3 lots de pièces, l'eau du château d'eau et les améliorations sont accessibles
  avec la **lampe de départ**, sans dépenser un jeton (les 4 personnages en ont une) ;
- les antibiotiques du Passager s'obtiennent **gratuitement** chez Marchetti (nœud `lou_ok`,
  fin de la quête `qp_passager`), avec une dette morale — les 20 jetons de Vic sont une autre voie,
  jamais une obligation ;
- le compte de jetons ne descend jamais sous zéro (le moteur borne), et l'objet le moins cher
  (jerrican, 3 jetons) reste accessible au personnage le plus pauvre (4 jetons).

---

## 4. Fichiers modifiés

| Fichier | Nature de la modification |
|---|---|
| `src/engine/types.ts` | `ItemUse.label` / `.text` acceptent `string \| TextVariant` |
| `src/engine/game.ts` | `lampeAllumee()`, `useItem` résout les variantes, verbe `toggle:`, `sleepUntil` 14/18 h, `explainStats()` |
| `src/engine/state.ts` | `lampe_on` initial si la lampe est dans l'inventaire de départ |
| `src/engine/validate.ts` | le verbe `toggle` est connu de la validation statique |
| `src/content/items.ts` | action allumer/éteindre de la lampe |
| `src/content/chars.ts` | lampe au départ du majordome |
| `src/content/dialogues/people.ts` | prix doublés si rancune, vente de lampe, `vic_trade`, `lampe_on` à l'achat |
| `src/content/train_objects.ts` | `etal_vic` signalé tant qu'on n'a pas traité |
| `src/app/App.ts` | obscurité et blocage d'interaction pilotés par l'état de la lampe + messages distincts |
| `src/ui/hud.ts` | libellés Satiété/Repos + aide par jauge |
| `src/ui/panels.ts` | usage à libellé variant, ligne d'état lampe, « À utiliser : … », lampe non jetable, note exacte des réserves |
| `tests/survie.test.ts` | **nouveau** — 31 tests de régression |

Fichiers **non** touchés : `src/ui/expedition.ts`, `src/content/upgrades.ts`, tout le contenu
narratif, la bible, les mystères.

---

## 5. Tests réellement exécutés

```
npm run typecheck                                   → 0 erreur
npm test                                           → 5 fichiers, 106 tests, 0 échec
npx vitest run --config audit-narratif/outils/…     → 2 fichiers, 2 tests, 0 échec (30 parcours)
npm run build (tsc --noEmit && vite build)           → ✓ 64 modules, 6,12 s
```

`tests/survie.test.ts` (31 tests) verrouille :

- **lampe** : les 4 personnages partent avec une lampe ; allumée au départ ; on peut l'éteindre et
  la rallumer sans la consommer ; le libellé annonce l'état courant ; lampe éteinte ⇒ dépôt noir ;
  garde-fou lexical : `App.ts` utilise bien `g.lampeAllumee()` et non la possession ; le seul
  `dark: true` du jeu est `depot` ; la lampe n'est pas jetable et le mécanicien ne pourrait pas la
  remplacer ;
- **nourriture/eau** : ration +30/+4 et consommée ; gourde +35 hydratation sans toucher à la satiété ;
  repas du comptoir +32/+22 une fois par service, +25 en rationnement égal ; fontaine +20 une fois,
  seulement si la filtration est réparée ;
- **jauges** : −3 / −2 / −2,4 par heure à bord, −5 / −3 / −4 dehors ; sommeil à demi-pente et repos
  +14 h ; **+18 h avec les dortoirs calfeutrés** ; chaque seuil n'est expliqué **qu'une fois** ;
  effondrement (plancher 12) à bord au lieu de la mort ; libellés du HUD ;
- **monnaie** : jetons de départ 8/4/12/5 ; achat au prix plancher pour le plus pauvre ; vente qui
  rapporte ; plancher à zéro ; lampe 9 jetons (8 ne suffisent pas) ; prix d'ami du passager ;
  **prix de la rancune réellement doublé** (ration 5 → 10) ; aucun coût en jetons dans les
  améliorations ;
- **réserves** : inchangées pendant la journée, −1 / −1 / −4 à minuit une seule fois ; −0,8 et −0,5
  avec rationnement égal + filtration réparée ; un repas ne touche pas aux chiffres collectifs ; le
  matériel d'expédition annonce bien `res:food-0.2` / `res:meds-1` et le coût dit « du train » ;
  le jerrican vide l'eau dans la citerne, pas dans le Sac ;
- **étal** : signalé tant qu'on n'a pas traité.

Écarts assumés dans les tests : une action du monde consomme du temps, et les jauges baissent
pendant ce temps — les fourchettes sur le repas du comptoir (+31 à +32 au lieu de +32 exactement)
documentent ce comportement au lieu de le masquer.

---

## 6. Difficulté et choix : ce qui n'a pas été adouci

- Les taux de déclin, les seuils de dégâts, le plancher de 12, la mort dehors : **inchangés**.
- Les améliorations du train (dortoirs calfeutrés, filtration, masque, cric, pied-de-biche) restent
  optionnels et coûteux en pièces/énergie/médicaments.
- La rancune **rend les achats nettement plus chers** (×2) : c'est une punition réelle, appliquée
  cette fois pour de bon.
- Le rationnement égal réduit les repas, pas les gains : la difficulté remonte.
- Aucun raccourci ajouté, aucun secret ouvert, aucune mécanique d'expédition inventée pour la lampe.

---

## 7. Ce qui n'a PAS été vérifié — à regarder à l'écran

**L'interface n'a pas été ouverte dans un navigateur pendant cette session.** Un test moteur qui
passe ne prouve pas qu'un bouton est visible, cliquable ou joliment placé. À vérifier manuellement :

1. **Voile d'obscurité** : entrer dans `depot` lampe allumée (attendu : on distingue, voile 0,45),
   puis éteindre la lampe depuis le Sac (attendu : le voile passe à 0,86, les interactions sont
   bloquées, un toast dit « Votre lampe est éteinte »).
2. **Bouton d'usage de la lampe** dans le Sac : libellé qui bascule Allumer/Éteindre, texte de
   retour, et ligne d'état qui suit bien l'allumage.
3. **Libellés du HUD** : « Satiété » et « Repos » au-dessus des bonnes barres (l'ordre n'a pas
   bougé, les mots si) ; infobulles au survol.
4. **Ligne « À utiliser : … »** dans le détail d'un objet (`ration` → « +30 satiété · +4 hydratation ») ; absence de cette ligne pour un objet sans effet de jauge.
5. **Note des réserves** dans Train → Ressources : texte exact, et les étiquettes par ligne qui
   changent bien avec le rationnement égal et la filtration réparée.
6. **Mise en avant de l'étal** : le point `!` doit apparaître tant qu'on n'a pas dealté, disparaître
   après, et **les deux jeux de prix** (normal / « Prix doublé ») doivent être lisibles sans
   débordement.
7. **Toasts de seuil** : apparaître une seule fois, au bon moment, et ne pas polluer l'écran.
8. **Aucun bouton « Jeter » sur la lampe**, et le message d'explication présent.

Aucune de ces vérifications ne repose sur une image : le code est compilé et les tests passent, mais
le rendu n'a pas été contrôlé.

---

## 8. Écarts assumés / décisions à confirmer

1. **Les repas du comptoir ne puisent pas dans les réserves collectives** (abstraction « jours de
   réserve » : la nightly couvre déjà la ration de l'équipage). C'est un choix d'auteur, pas un oubli ;
   il est désormais écrit dans le panneau Train plutôt que laissé à l'interprétation. **Si vous
   voulez que manger coûte −0,2 nourriture, c'est une ligne à ajouter** — mais cela impacterait les
   30 parcours d'audit.
2. **La lampe n'est plus jetable** (UI). C'est la seule chose que j'ai retirée au joueur ; c'est ce
   qui garantit qu'aucun parcours ne peut se retrouver sans éclairage et sans les jetons pour en
   racheter une. Dites-le si vous préférez l'inverse — dans ce cas, il faudra aussi un filet
   (baisser le prix de la lampe à 5, ou ouvrir une source de jeton non marchande).
3. **La rancune double aussi le prix d'ami du passager** (20 → 40) : cohérent avec « les prix ont
   doublé », mais c'est un choix.
4. Le seuil d'alerte « soif / faim » est à 35 %, le seuil critique à 15 % ; l'affichage du HUD
   utilise les mêmes bornes (orange < 35, rouge < 15).