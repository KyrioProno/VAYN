# Vérification visuelle et tactile — format téléphone

Date : 2026-10-15 · branche `arena/3701bb39-vayn` · base : `41076b9`

Ce rapport rend compte de contrôles faits **dans un vrai Chromium**, sur un viewport de
téléphone (844 × 390 px, densité 1,5, pointeur grossier). Trois parties, volontairement
séparées :

1. **Tests automatisés** — ce que la machine vérifie seul. Ils ne disent rien de l'écran.
2. **Contrôles faits dans le navigateur** — parcours joués, mesures prises sur le DOM, captures.
3. **Contrôles tactiles réels** — événements pointeur émis par le moteur (CDP
   `Input.dispatchTouchEvent`), pas du JavaScript synthétique.

Rien n'est corrigé qui n'ait pas été **observé** d'abord.

---

## 1. Tests automatisés

| Validation | Commande | Résultat |
|---|---|---|
| Typage | `npm run typecheck` | 0 erreur |
| Tests du jeu | `npm test` | **124 / 124** (6 fichiers) |
| Audit narratif | `npx vitest run --config audit-narratif/outils/vitest.config.ts` | **2 / 2** |
| Build | `npm run build` | ✓ |
| Build Pages | `npm run build:pages` | ✓ |

`tests/ui-mobile.test.ts` compte 18 tests. Ce sont des **garde-fous d'interface** : ils vérifient
que les noms de jauges, la position des messages, le plafonnement de la pile, la marque de
défilement et le changement d'onglet restent dans le code. Ils ne remplacent pas une capture
d'écran, et ne prétendent pas la remplacer.

---

## 2. Contrôles faits dans le navigateur

### 2.1 Messages et jauges — défaut corrigé

**Constaté avant.** Les notifications étaient centrées en haut de l'écran, largeur 388 px. Les
jauges occupent le coin haut droit (x 414 → 778, y 8 → 52) : la pile les recouvrait. Sur une
partie neuve, les trois messages de démarrage (« Nouvelle mission… », « Indice : Billet… »,
« Touchez le sol pour marcher… ») restaient 3 à 4 secondes **sur les jauges et sur l'objectif**.
Et, sur une pile de six messages, elle descendait jusqu'au bouton « Attendre » (y 344), donc
par-dessus un bouton de jeu.

**Ce qui a été fait.**

| Élément | Avant | Après |
|---|---|---|
| Position de la pile | `top: 8px`, centrée, 388 px | `top: 80px`, à gauche (x 10), 360 px : sous la bande du HUD, jamais sur les jauges ni l'horloge |
| Bloc du HUD | l'objectif pouvait descendre sur deux lignes | objectif sur **une ligne** avec ellipse (`.hud-obj .tx`) : la bande du HUD s'arrête à y ≈ 72 |
| Dialogue ouvert | les messages tombaient sur le texte lu | repli en haut à gauche, format réduit (280 px, 11,5 px) : les jauges restent lisibles, le dialogue n'est jamais masqué |
| Panneau / écran plein | 4 messages, format large | 2 messages, format compact (250 px) |
| Jeu libre | 4 messages | **3 messages** (au-delà, la pile atteignait le bouton « Attendre ») |
| Onglets pendant un dialogue | visibles, mais **insensibles** (rien ne se passait) | atténués (`opacity: .3`) et désactivés : le contrôle annonce qu'il est inactif |

**Mesures prises en jeu libre** (3 messages longs, lancés par l'UI du jeu) :
positions y = 80, 153, 192 ; bas de pile = **224 px** ; bouton « Attendre » à y = 344 →
**aucun conflit** avec les jauges (y 8-52), l'horloge, les onglets ni le bouton.

**Mesures pendant un dialogue** : message en x 10-290, y 8-51 ; jauges fully visibles ;
dialogue intact ; seul l'horloge est masqué, le temps qu'il est de toute façon de nouveau
lisible dès la fin du dialogue. C'est un compromis assumé : toute position possible masque
quelque chose, on a choisi l'information la moins utile pendant qu'on lit.

*Captures : `70`, `71`, `92`, `93`, `115`, `116`.*

### 2.2 Les quatre personnages — parcours refaits

Chaque personnage : création de partie, récit jusqu'au bout, lecture des jauges, ouverture du
Sac, extinction de la lampe, passage Carnet → Sac d'un onglet à l'autre, appui sur un objet du
monde. Contrôle automatique des chevauchements à chaque étape.

| Personnage | Jeton | Sac au départ | Lampe | Onglets enchaînés | Objet touché au doigt |
|---|---|---|---|---|---|
| Le Contrôleur | 8 | lampe, passe, billet, ration | allumée, s'éteint | Carnet → Sac ✓ | Bureau du Contrôle → menu à 2 actions ✓ |
| Le Passager | 4 | ration, tabac ×2, lampe | allumée, s'éteint | Carnet → Sac ✓ | aucun objet interactif dans le champ (doroirs) |
| Le Majordome | 12 | clés salon, lettre, ration, café, lampe | allumée, s'éteint | Carnet → Sac ✓ | Poste radio → « Écouter » (réponse : « Du souffle sur toutes les fréquences. Rien, à cette heure-ci. » — condition narrative, pas un blocage) |
| Le Mécanicien | 5 | clé à molette, lampe, ration | allumée, s'éteint | Carnet → Sac ✓ | Établi → « Lire le carnet d'entretien », « Bricoler (Technique) » ✓ |

Jauges affichées dans les quatre cas : `Santé 100 · Hydratation 78 · Satiété 70 · Repos 72`.
Aucun personnage bloqué, aucun chevauchement détecté.

### 2.3 Le dépôt — lampe allumée et éteinte

Départ par `window.vayn.startExpedition()` (« Descendre sur le quai » n'est qu'un refus
textuel, ce n'est pas une porte). Marche de 1 320 px : quai → hall → cour → dépôt.

| Étape | Constat |
|---|---|
| Lampe allumée, marche jusqu'à l'armoire | menu « Ouvrir l'armoire 10 min » |
| Appui réel sur l'action | 07:08 → 07:26, texte de la fouille affiché, **relais K3 ajouté au Sac** |
| Lampe éteinte (via le Sac) | dépôt visiblement noir, capture à l'appui |
| Appui réel sur l'établi dans le noir | « Il fait trop noir pour distinguer quoi que ce soit. Votre lampe est éteinte : ouvrez le Sac… » — **interaction bloquée, pas de menu** |
| Lampe rallumée, nouvel appui | menu « Fouiller 15 min » de nouveau disponible |

*Captures : `95`, `96`, `97`, `98`, `99`, `100`.*

### 2.4 Orientation — portrait et paysage

| Configuration | Résultat |
|---|---|
| Paysage 844 × 390 | jeu visible, rien hors écran |
| **Portrait 390 × 844** | écran « Tournez votre appareil · VAYN se joue à l'horizontale » **couvert**, opaque |
| Retour en paysage | jeu rendu normalement, mise en page rétablie |
| Paysage très bas 844 × 320 | rien ne dépasse |
| Paysage large 1024 × 600 | rien ne dépasse |

*Captures : `101` à `105`.*

### 2.5 Sauvegarde, rechargement, reprise

Onglet neuf (le script de purge du banc d'essai n'y est pas installé, sinon il effacerait la
sauvegarde au rechargement — c'est ce qui avait fait croire à une absence de « Continuer » au
premier essai).

| Étape | Résultat |
|---|---|
| Action de 30 min au doigt sur la chaudière | 07:00 → 07:32, jauges qui bougent |
| Fermeture d'un panneau | sauvegarde automatique écrite : `vayn:save`, 2 385 octets, heure 452 (07:32) |
| **Rechargement de la page** | écran titre : « **CONTINUER** Le Mécanicien · Jour 147 · 07:32 · Histoire » |
| Appui réel sur « Continuer » | partie restaurée à l'identique : 07:32, 5 jetons, même Sac, même lieu, mêmes jauges |
| Menu → « Revenir au dernier point de reprise » | confirmation (« La progression depuis sera perdue ») puis retour au point du début : 07:32 → 07:00, salle des machines → atelier |

Le Menu propose aussi « SAUVEGARDER MAINTENANT ». Rien n'a été créé : tout existait déjà.

*Captures : `110` à `114`.*

---

## 3. Contrôles tactiles réellement effectués

Tous les gestes ci-dessous sont des **événements tactiles émis par le moteur** (CDP
`Input.dispatchTouchEvent`, `maxTouchPoints = 5`, `pointer: coarse`), **pas** des événements
JavaScript synthétiques. À noter : `Input.dispatchMouseEvent` est inutilisable dans ce harnais
(timeouts de 25 à 120 s) — le tactile, lui, fonctionne.

| Geste | Résultat mesuré |
|---|---|
| Appui au sol | le personnage **marche** (x 3 089 → 3 034) |
| Appui sur un objet du monde à sa position écran réelle (Bureau du Contrôle, 394/180) | le joueur s'en approche (x 3 089 → 3 079) et le menu d'actions apparaît |
| Appui sur une action du menu (« Consulter le registre des passagers 10 min ») | l'horloge passe de 07:00 à 07:10 : **l'action s'exécute** |
| Appui sur un onglet (Sac, Train, Carnet, Menu) | le panneau correspondant s'ouvre, et change d'un panneau à l'autre du premier coup |
| Appui sur un sous-onglet (Réparations) | l'onglet s'active et le contenu change |
| Appui sur un objet du dépôt (armoire, établi) | menu d'actions, exécution, blocage dans le noir, retour après rallumage |
| **Pincement à deux doigts** (identifiants de pointeur distincts) | zoom utilisateur 1 → **1,9** (caméra 3 → 5,7) ; pincement inverse → 0,8 (caméra 2,4) : **le zoom fonctionne vraiment** |
| Glissement | la scène se décale (pas de plantage) |

Ce que cela ne prouve pas : la qualité d'un vrai doigt (taille du contact, parasites, vitesse),
ni le multi-touch réel d'un appareil physique — l'appareil émulé est le seul dont je dispose.

*Captures : `73` à `83`, `95` à `100`, `111` à `116`.*

---

## 4. Limites de l'environnement, dites franchement

- **Pas d'appareil physique.** Les événements tactiles sont réels pour le moteur, mais émis par
  l'émulation d'un appareil, pas par un doigt humain.
- **Rendu logiciel** : le banc d'essai bride la fréquence d'images (20 i/s) ; ce n'est pas un
 écran 60 Hz et cela ne dit rien de la fluidité réelle.
- **`requestAnimationFrame` ne se déclenche pas** de façon fiable dans ce harnais : c'est pour
  cela que `marquerDefilement()` remesure aussi au minuteur (sinon les zones défilantes n'étaient
  jamais marquées — défaut trouvé et corrigé en cours de route).
- **Son** : non testé.
- **Angles serrés, très petits écrans (moins de 320 px de haut), et plus étroits encore** : non testés.
- La première tentative de test de sauvegarde a été **invalidée** par le harnais (il purge le
  stockage au rechargement) et refaite sur un onglet neuf ; le résultat indiqué plus haut est le
  bon.

---

## 5. Fichiers modifiés pour ces contrôles

| Fichier | Modification |
|---|---|
| `src/ui/dialogue.ts` | classe racine `dlg-ouverte` (comptée) pendant qu'une boîte de dialogue est à l'écran |
| `src/ui/UI.ts` | messages : 3 en jeu libre, 2 si écran plein ou dialogue ; format compact si écran plein |
| `src/ui/hud.ts` | objectif dans un span à ellipse : une seule ligne, la bande du HUD ne descend plus |
| `src/ui/styles.css` | pile des messages sous la bande du HUD ; repli en dialogue ; onglets atténués pendant un dialogue |
| `tests/ui-mobile.test.ts` | garde-fous correspondants (18 tests) |

Aucun taux de survie, aucune histoire, aucun mystère (Clairval, VAYN-2) n'a été touché.
