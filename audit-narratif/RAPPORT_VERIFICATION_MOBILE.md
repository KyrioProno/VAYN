# Vérification visuelle réelle — format mobile

Date : 2026-10-15 · branche `arena/3701bb39-vayn` · base : `59c55f5`

Ce rapport décrit ce qui a été **vu à l'écran** dans un navigateur, au format téléphone
(844 × 390 px, densité 1,5), et non ce que les tests automatisés affirment.
Trois parties : **tests moteur**, **tests visuels**, **reste à vérifier manuellement**.

---

## 1. Tests moteur (automatisés) — ne prouvent rien de visuel

| Validation | Commande | Résultat |
|---|---|---|
| Typage | `npm run typecheck` | 0 erreur |
| Tests du jeu | `npm test` | **121 / 121** (6 fichiers) |
| Audit narratif | `npx vitest run --config audit-narratif/outils/vitest.config.ts` | **2 / 2** |
| Build | `npm run build` | ✓ 8,90 s |
| Build Pages | `npm run build:pages` | ✓ 9,46 s |

15 tests nouveaux dans `tests/ui-mobile.test.ts` (libellés de jauges, effet borné, ligne de
rangement, zones défilantes, messages, onglets). Ils sont **majoritairement des garde-fous de
lecture de code** : une chaîne d'interface peut disparaître du HTML sans qu'un test moteur ne
s'en aperçoive. Ils complètent les mesures d'écran, ils ne les remplacent pas.

---

## 2. Tests visuels (parcours réels, captures)

Méthode : Chromium en profil téléphone, partie réelle (titre → mode → personnage → jeu),
clics et déplacements exécutés dans la page, mesures prises sur le DOM après affichage.

### Point 1 — Lampe torche : conforme, inchangé

| Parcours | Ce qui s'affiche |
|---|---|
| Lampe dans le Sac, allumée | « Lampe allumée — elle éclaire le dépôt. », bouton « Éteindre la lampe », **aucun bouton Jeter** |
| Après extinction | « Lampe éteinte — elle n'éclaire rien. », bouton « Allumer la lampe » |
| Le dépôt à l'écran | Version allumée et version éteinte **nettement différentes** (voile clair / presque noir) |
| Interagir dans le noir | Dialogue bloquant : « Il fait trop noir pour … » |
| Les 4 personnages | Lampe présente, allumée au départ, non jetable, aucun blocage |

*Captures : `22-depot-lampe-allumee.png`, `23-depot-lampe-eteinte.png`, `24a/24b`.*

### Point 2 — Nourriture et eau : un défaut corrigé

| Objet | Avant | Après correctif |
|---|---|---|
| Ration (satiété 70 %, hydratation 78 %) | « À utiliser : +30 satiété · +4 hydratation » | inchangé (annoncé = réel) |
| **Gourde (hydratation 78 %)** | « À utiliser : **+35 hydratation** » alors que +22 entrent dans la jauge | « À utiliser : **+22 hydratation (réservoir plein)** » |

Le gain annoncé est désormais le gain **réel** : borné par la place qui reste, avec la mention
« réservoir plein » quand la jauge est au maximum. Aucun taux de survie n'est modifié.

### Point 3 — Jauges : lisibilité corrigée, conséquences déjà expliquées

**Avant** : quatre icônes et quatre barres, **aucun libellé**. Les noms n'existaient que dans
l'attribut `title`, inatteignable au doigt. L'infobulle, elle, était mal formée :
« Hydratation  — 78 %.  ce que… » (double espace, tiret orphelin).

**Après** (`30-jauges-labels.png`, `60-final-jauges.png`) :

```
Santé 100  ▓▓▓▓▓▓░░░░     Hydratation 78 ▓▓▓▓▓▓▓░░░
Satiété 70 ▓▓▓▓▓▓▓░░░     Repos 72      ▓▓▓▓▓▓▓▓░░
```

Le nom est écrit dans la page, la valeur change de couleur (ambre sous 35 %, rouge sous 15 %),
l'infobulle est reformée : « Hydratation : 78 %. ce que vous buvez. Descend avec le temps… ».
Largeur totale du bloc 313 px pour 844 px d'écran : rien ne déborde.

Les conséquences des seuils étaient **déjà** expliquées à l'écran, au bon moment — inchangé :

- « Vous avez soif. La jauge d'hydratation descend avec le temps passé : une gourde, un repas ou la fontaine. »
- « Hydratation critique : sous 15 %, votre santé commence à baisser. »
- « La faim revient. La jauge de satiété descend elle aussi avec le temps. »
- « La fatigue tombe sur vous. Sous 25 %, vous marchez plus lentement — dormez, ou reposez-vous. »

### Point 4 — Monnaie : l'achat Vic a été fait pour de vrai

Écarté du diagnostic faute de temps, l'achat a été rejoué entièrement.

| Étape | Mesure |
|---|---|
| Jetons au départ (Contrôleur) | **8** |
| « Acheter… » | « Jetons : 8. Pied-de-biche — 8 · Bandage — 4 · Jerrican vide — 3 · Ration — 5 » |
| Choix « Jerrican vide — 3 jetons » | **8 → 5 jetons**, `jerrican×1` dans le Sac |
| Messages | « -3 jetons » et « Jerrican vide ajouté au sac » |
| Filtrage par solvabilité | Plus de 5 jetons : le pied-de-biche (8) disparaît de la liste |
| Autre achat testé | Pied-de-biche : **8 → 0** |

Jetons de départ des 4 personnages : **8 / 4 / 12 / 5**. Achats = monnaie personnelle,
réserves = collective, avec la note explicite du panneau Train (« …vos gourdes, rations et
médicaments personnels restent dans le Sac : ils ne font pas bouger ces chiffres. »).

*Capture : `46-vic-jjerrican.png`.*

### Point 5 — Inventaire mobile : quatre défauts corrigés

| Défaut constaté | Correctif | Vérification |
|---|---|---|
| Dans le **rangement**, la fiche annonçait « À utiliser : … » alors que le seul bouton est **PRENDRE** | « Dans le rangement : à prendre dans le Sac pour l'utiliser — +12 repos · +6 hydratation. » | `61-final-rangement.png` |
| Le 4ᵉ choix du dialogue était **hors de l'écran** (bas à 412 px pour un écran de 390) | `.dlg` : `max-height: 58vh` → `min(74vh, 420px)`, plus une règle `@media (max-height: 440px)` (choix à 34 px au lieu de 40) | Les 4 choix sont visibles, bas max **373 px** (`62-final-vic.png`) |
| La colonne Train (323 px visibles pour 516 px de contenu) et la liste du Sac **ne montraient aucun signe de défilement** | Marqueur `deroule` : dégradé en bas + ascenseur bleu de 5 px | `defile: true` mesuré sur les deux colonnes |
| Les messages se superposaient à la **colonne de droite** des panneaux | Panneau ouvert : 2 messages au maximum, format compact (250 px, 11,5 px) | `cls = "toasts low compact"` mesuré |

**Bonus, trouvé pendant la vérification** : taper un onglet alors qu'un panneau était ouvert
**refermait le panneau** au lieu de changer d'onglet (`uiBusy()` incluait `hasPanel`).
Sur téléphone, les onglets sont justement la seule navigation entre le Sac, le Train et le
Carnet : il fallait deux tapes pour changer de panneau. Corrigé, puis vérifié enchaînement
**Train → Sac → Train → Carnet** du premier coup (`63-final-onglets.png`).

### Point 6 — Progression : aucun personnage bloqué

Les 4 personnages démarrent avec la lampe allumée et sans bouton « Jeter » ; leurs jetons
(8/4/12/5) et leur poids (1,1 / 1,3 / 1,3 / 2,1 kg) diffèrent sans bloquer le départ. Le
récit d'introduction se déroule jusqu'au Bureau du Contrôle pour les quatre. Aucun des
correctifs ci-dessus ne touche aux taux de survie, à l'histoire, aux mystères Clairval ou à
VAYN-2.

---

## 3. Reste à vérifier manuellement

1. **Messages au-dessus des jauges dans la vue de jeu.** Au démarrage, trois messages
   (« Nouvelle mission… », « Indice : Billet… », « Touchez le sol pour marcher… ») se superposent
   partiellement aux jauges pendant 3 à 4 secondes (`60-final-jauges.png`). **Constaté, non
   corrigé** : tout emplacement en haut masque une partie du HUD, et les mettre en bas les
   ferait passer derrière le dialogue. Arbitrage à faire à l'œil, sur le fond.
2. **Tactile réel.** Les appuis ont été exécutés en JavaScript dans la page : le
   `Input.dispatchMouseEvent` du protocole CDP est inutilisable dans ce harnais (timeouts de
   25 à 120 s) et un pointeur synthétique ne déplace pas le joueur. Le tactile, le
   « pincer pour zoomer » et le glisser pour regarder **n'ont pas été testés au doigt**.
3. **Orientation.** L'écran « tournez l'appareil » (portrait) et le retour paysage n'ont pas
   été testés.
4. **Après correctifs**, seuls les parcours du Contrôleur ont été refaits. Les trois autres
   personnages restent à rejouer à l'œil (lampe, jauges, rangement, onglets).
5. **Dépôt.** La séquence lampe allumée / éteinte n'a pas été rejouée après les correctifs
   (aucun code de la lampe n'a été modifié, mais la vérification visuelle date d'avant).
6. **Hors périmètre** : son, sauvegarde et reprise, pause, fin de chapitre, multi-onglets.

---

## Fichiers modifiés pour ces correctifs

| Fichier | Modification |
|---|---|
| `src/ui/hud.ts` | Nom de jauge écrit dans la page ; infobulle reformée |
| `src/ui/styles.css` | `.gauge .nm`, hauteur du dialogue, règle petit écran, `deroule`, toasts compacts |
| `src/ui/dom.ts` | `marquerDefilement()` |
| `src/ui/panels.ts` | Effet borné (`effetUsage` exporté), ligne honnête du rangement, colonnes marquées |
| `src/ui/dialogue.ts` | Choix marqués comme zone défilante |
| `src/ui/UI.ts` | 2 messages maximum quand un panneau est ouvert |
| `src/app/App.ts` | `openTab` : changer d'onglet au lieu de refermer |
| `tests/ui-mobile.test.ts` | 15 tests de régression (nouveau) |
| `tests/survie.test.ts` | Test des libellés du HUD remis à jour |