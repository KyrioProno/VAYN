# VAYN — Chapitre I : carte de cohérence narrative

Cette carte décrit **ce qui est réellement implémenté** dans le contenu du jeu, pas une intention.
Pour chaque point qui pose problème, un renvoi `⚠ D-nn` pointe vers [`DIAGNOSTIC.md`](DIAGNOSTIC.md).

- Sources : `src/content/**` (dialogues, objets, carnet, missions, événements, motions, épilogue) et les séquences de `src/app/App.ts`.
- Parcours exécutés : [`PARCOURS_EXECUTES.md`](PARCOURS_EXECUTES.md) (26 parties jouées dans le moteur, sans rendu).
- Références croisées générées : [`REFERENCES_CROISEES.md`](REFERENCES_CROISEES.md).

## Légende

Statut d'une information :

| Code | Sens |
|---|---|
| **FAIT** | Établi dans le jeu : constat matériel, ou entrée « Fait établi » du carnet. |
| **SU** | Connu, au début, de certains personnages seulement. |
| **TÉM** | Témoignage non vérifié. Il peut être faux, incomplet ou mensonger. |
| **HYP** | Hypothèse que le joueur peut retenir dans le carnet. |
| **SECRET** | Vérité volontairement gardée pour plus tard (chapitre II). |

Nécessité d'un indice :

| Code | Sens |
|---|---|
| **INDISPENSABLE** | Sans lui, une révélation principale reste incompréhensible. |
| **UTILE** | Confirme, ou donne une autre perspective. |
| **FACULTATIF** | Détail, couleur, piste secondaire. |

---

## 1. La vérité du chapitre, en une page

Jour 147 après la catastrophe, le train autonome VAYN s'arrête en gare de Saint-Aubin à 23 h 52.

**La panne.** Elle a deux causes qui se cumulent.
- Théo Lagarde, agent de maintenance, a retiré le relais K3 de la filtration pour réparer le poste radio. Il pensait que la pompe de secours prendrait le relais.
- Or cette pompe n'avait plus de moteur depuis trois semaines.
  - La cheffe mécanicienne Vasseur l'avait démonté pour sauver les bacs hydroponiques.
  - Quinze jours plus tard, elle a maquillé le carnet d'entretien (« révisée, opérationnelle »).
  - Malo Kerbrat, le Mécanicien jouable, a contresigné sans vérifier.

**La disparition.**
- Théo réparait la radio pour Mara, une clandestine qu'il nourrissait en secret depuis neuf jours. Il voulait qu'elle puisse entendre Clairval.
- Clairval est un barrage où vivraient quarante survivants.
- Le chef de la sécurité, Castel, avait entendu ces appels trois soirs de suite. Il avait caché le journal d'écoute (« NE PAS DIFFUSER — H.C. ») et coupé le poste, par peur d'un exode dans la brume.
- À 00 h 20, Castel surprend Théo à la sortie de la salle radio et le menace de la cellule et d'une accusation de sabotage.
- Théo panique. À 00 h 30, il saute par la porte de la soute pour aller chercher un autre K3 au dépôt de la gare.
- Une poutre cède sur sa jambe. Il est recueilli par Anselme, l'aiguilleur, au poste d'aiguillage.

**Les réserves.**
- L'intendant Marchetti fait sortir la nuit de l'eau commune vers le garde-manger du Salon. Il l'inscrit au nom d'une « cabine 0 » qui n'existe pas.
- En échange, Madame de Villiers lui fournit des antibiotiques tirés de ses malles. Marchetti les dépose à l'infirmerie sans dire d'où ils viennent : un vol qui soigne.

**Mara.**
- Elle est la fille de la docteure Hélène Sorel, qui la croit morte dans l'effondrement de Lyon.
- Chacune possède une moitié de médaillon : « M… » et « …ARA ».

**La découverte finale.**
- En route, la radio (ou le pupitre de la cabine) capte un message : « ici VAYN-2… ne vous arrêtez pas à Clairval ».
- Un autre VAYN existe. Il est passé un mois plus tôt sur la même ligne.

Restent volontairement ouverts :
- ce qu'est devenu Clairval (l'émission tourne en boucle depuis le Jour 96) ;
- qui est le VAYN-2 ;
- qui a glissé son horaire dans le journal de bord ;
- qui est l'homme en gris de l'embarquement.

---

## 2. Chronologie

### 2.1 Avant le chapitre (ce que le joueur peut reconstituer)

| Quand | Événement | Qui le sait au début | Comment le joueur l'apprend | Statut |
|---|---|---|---|---|
| ~4 ans avant | Mara, 12 ans, est séparée de sa mère. Elle vit chez son père à Lyon. | Sorel, Mara | Sorel (`photo`) et Mara (`pourquoi`) | TÉM, puis FAIT avec `f_mere` |
| Départ de Lyon-Perrache | 212 passagers ; malles et argenterie pour le Salon ; un « homme en gris » sans bagage. | — | Cinématique d'introduction | SECRET (homme en gris) ; ⚠ D-09 (« en tête / en queue ») |
| Jour 1 (3ᵉ soir) | Les communications s'éteignent ; Lyon s'effondre. | Tous | Introduction ; Sorel (`photo`) | FAIT |
| Jour 96 | Dernier message « frais » de Clairval. Ensuite, la même voix tourne en boucle. | Anselme | Récepteur du poste (`c_emission_clairval`) ; argument `d_boucle` | SECRET : Clairval vit-il encore ? |
| Jour 101 | Mot au mur de la gare : « Clairval tient… Quarante personnes… Signé : J. Sorel-Arnaud ». | — | Hall de la gare (`c_mur_messages`), mais la signature n'entre pas dans le carnet | ⚠ D-29 |
| ~Jour 117 (« il y a un mois ») | Un VAYN identique passe vers le sud sans s'arrêter. Son horaire, avec un mois d'avance, est glissé dans le journal de bord. | Anselme | `t_anselme` ; cabine de conduite (`c_cabine_horaire`) | SECRET |
| Il y a 3 semaines | Vasseur prend le moteur de la pompe de secours pour les bacs hydroponiques (bon n° 112). | Vasseur | `c_pompe_secours`, `c_bon_sortie`, plaque du moteur aux dortoirs, `t_vasseur_pompe` | SU |
| Il y a 15 jours | Faux « révisée, opérationnelle », signé Vasseur et contresigné Kerbrat. | Vasseur, Malo | `c_carnet_entretien` | SU |
| En continu | Eau du train contre antibiotiques de Madame ; sorties « cabine 0 ». | Marchetti, Madame | Registre, compteur, garde-manger, brouillon, aveux | SU ; ⚠ D-08 (le rythme ne concorde pas) |
| Il y a ~10 jours | Mara monte à bord et se cache dans la soute. | Mara | « Ça fait dix jours… » | ⚠ D-10 (où, comment, et comment elle sait que sa mère est à bord) |
| Il y a 9 jours | Théo trouve Mara et la nourrit avec une deuxième portion « pour le chat de la soute ». | Théo, Mara ; Rosa sans comprendre ; Noé | `t_rosa_portions`, `c_carnet_theo`, `t_mara_theo`, `c_cache` | SU |
| Il y a ~8 à 11 jours | Castel entend Clairval trois soirs, tamponne le journal et coupe le poste (dernière entrée officielle « RAS » : il y a 8 jours). | Castel | `c_registre_radio` (tiroir), aveu de Castel, carte avec Clairval barré | SU |
| Il y a 4 jours | Note de Madame : « Le garçon de la maintenance pose trop de questions sur le garde-manger. À régler. » | Madame | Secrétaire du Salon | Fausse piste volontaire |
| Il y a 3 jours | Théo demande un K3 à Vic, qui n'en a pas. | Vic | `t_vic_k3` | TÉM ; ⚠ D-18 |

### 2.2 La nuit du Jour 146 au Jour 147

| Heure | Événement | Preuves accessibles |
|---|---|---|
| 21:00 | Théo écoute 4,7 MHz : rien, Castel a coupé le poste. | Carnet de Théo |
| ~23:00 | Des jerricans quittent la réserve vers l'arrière du train (le Salon est la dernière voiture). | Agathe (`t_agathe_soute`) ; ⚠ D-09 (sa phrase sur les dortoirs) |
| 23:40 | Théo retire le K3 de la filtration ; la filtration s'arrête. | `c_alarmes`, `c_socle_vide` |
| 23:41 | La pompe de secours ne démarre pas : elle n'a plus de moteur. | `c_alarmes` ; texte du Mécanicien : « rien au bout du câble » |
| 23:52 | Arrêt de sécurité en gare de Saint-Aubin. | `c_alarmes`, pupitre |
| ~23:45–00:20 | Le K3 est greffé sur la radio. | `c_relais_radio` ; ⚠ D-20 (pourquoi la nuit, si l'émission est à 21 h ?) |
| 00:20 | Castel surprend Théo à la sortie de la salle radio ; Josefa croise Castel essoufflé, matraque à la main. | `t_castel_aveu`, `t_hotesse_castel` |
| 00:20–00:30 | Théo s'enfuit, prend sac et frontale, note sans doute « Dépôt de Saint-Aubin : armoires K ? ». | `c_couchette_theo`, carnet ; ⚠ D-09 (« vers l'arrière ») |
| 00:30 | Il saute par la porte de la soute et court vers le dépôt. | `t_noe_saut`, loquet graissé et trace de botte |
| Nuit | Au dépôt, la poutre cède ; frontale brisée, sang. Il rampe vers le talus ; Anselme le traîne au poste. | `c_traces_theo`, `t_theo_recit`, Anselme |

### 2.3 Pendant le chapitre : horaires fixes

| Heure | Événement | Condition | Effet |
|---|---|---|---|
| J1 07:00 | Scène d'ouverture propre au personnage | — | Missions de départ |
| 08:00 / 12:00 / 19:00 | Repas au comptoir | — | Faim et soif |
| 10:15 | Conseil : aller voir la voiture des machines | Journal d'alarmes pas lu | Notification |
| 11:00–11:30 | Rosa ouvre la grille de la réserve | Grille fermée | Accès au compteur, au registre, au tiroir |
| 13:00 | Conseil : « les dortoirs ne dorment jamais vraiment » | Aucune piste sur Théo | Notification |
| 15:30 | Annonce d'une fouille de la soute | Mara ni libre ni protégée | Avertissement |
| 16:00 | Fouille de Castel | Mara ni libre, ni cachée ailleurs, ni Castel détourné | **Mara en cellule** ; la clandestine devient connue de tous |
| 16:30 | Rappel du conseil | — | Avertissement |
| 17:00 | **Conseil des quatre** : expédition, rationnement, puis éventuellement clandestine et relais de la radio | Toujours lieu | Votes et conséquences |
| 21:00 | « L'heure de Clairval, d'après Mara » | K3 vu dans la radio | ⚠ D-12 (fuite de connaissance) |
| 23:45 | Sommeil forcé | Pas encore couché | Nuit |
| J2 05:30 | Réveil et préparation de l'expédition | — | Compagnon et matériel |
| 06:30 | Sortie sur le quai | — | Zone extérieure |
| 10:00 | La brume monte (de droite à gauche, en 2 h 30) | Dehors | Dégâts dans la brume |
| 11:00 / 11:30 / 11:50 | Sirènes | — | Avertissements |
| 12:00 | Départ du train | — | À bord : départ ; dehors : rattrapage ou abandon. ⚠ D-02, D-03 |
| 15:00 | **Assemblée** : révélations publiques, puis vote de la route | À bord | Fin, épilogue, découverte du VAYN-2 |

---

## 3. Causes et conséquences

### 3.1 Les trois événements, et ce qui les relie

```
                ┌──────────── CLAIRVAL (appels sur 4,7 MHz) ─────────────┐
                │                                                        │
   Castel entend, cache et coupe la radio           Mara, venue de Clairval, cherche sa mère
                │                                                        │
                └──► Théo veut réparer la radio pour Mara ◄──────────────┘
                              │ (pas de K3 chez Vic)
                              ▼
           23:40 — Théo emprunte le K3 de la filtration
                              │
   Vasseur avait vidé la pompe de secours (bacs) ──► 23:41 — pas de relais
   Malo avait contresigné le faux carnet                  │
                              ▼
           23:52 — ARRÊT DU TRAIN (événement 1 : la panne)
                              │
           00:20 — Castel surprend Théo (il protège son secret)
                              ▼
           00:30 — Théo saute vers le dépôt (événement 2 : la disparition)
                              ▼
           Poutre, jambe blessée, recueilli par Anselme

   En parallèle (événement 3 : les réserves)
   Marchetti : eau commune → garde-manger du Salon (« cabine 0 »)
   Madame : antibiotiques → infirmerie (Sorel ne sait pas)
   Liens : Théo posait des questions sur le garde-manger (note de Madame),
           Noé a vu des jerricans (lettre de Madame), Agathe a vu la livraison de 23 h.
```

Théo est le nœud : il relie la clandestine, la radio, la panne et le garde-manger.
Castel relie la radio et la disparition. Clairval relie Mara, la radio et la découverte finale.

### 3.2 Conséquences pendant le chapitre

| Si… | Alors… | Où c'est repris |
|---|---|---|
| Mara n'est ni cachée ailleurs, ni libre, ni Castel détourné à 16:00 | Elle est mise en cellule. | Motion « clandestine » ; PNJ d'ambiance ; épilogue |
| Le joueur ment à Castel (« quelqu'un rôdait vers le Salon ») | Fouille vide, Castel furieux. | Notification |
| Le joueur réunit Mara et Sorel | Mara est libre, à l'infirmerie ; la mission de Mara est terminée. | Motion d'assemblée `d_mere` ; épilogue |
| Audit voté avec preuves (ou trafic révélé à l'assemblée) | Marchetti perd son siège, Rosa assure l'intérim. | Composition du conseil ; dialogues ; épilogue (⚠ D-14) |
| Relais de la radio : choix « filtration » | L'eau revient, la radio se tait. | Fin : le message arrive par le pupitre ; ⚠ D-25 |
| Expédition : Théo ramené | Théo à l'infirmerie. | Épilogue ; motion `d_theo` |
| Théo laissé + signal au rouge | Il devrait être récupéré par le train au poste. | ⚠ D-02 : seulement si le joueur rate le train |
| Compagnon mort | Ligne d'épilogue. | ⚠ D-01 : le personnage réapparaît à bord, et vote |

---

## 4. Personnages : motivations, savoirs, mensonges

| Personnage | Veut | Sait au début | Cache ou ment | Ce qu'il peut apprendre au joueur | Se souvient de nos choix |
|---|---|---|---|---|---|
| **Hugues Castel** (sécurité) | Garder l'ordre, éviter l'exode vers Clairval. | Il a surpris Théo à 00:20 ; il a entendu Clairval ; il a coupé la radio. | Ment : « Je ne l'ai pas vu de la nuit », « hors service depuis des semaines ». | `t_castel_version` (faux), `t_castel_aveu`, aveu sur la radio ; clé de la radio. | Confiance, soupçon ; aveu ✓. Promesse de silence ✗ (⚠ D-13). |
| **Odile Vasseur** (maintenance) | Faire tourner le train, sauver la récolte, protéger Malo et elle-même. | Elle a pris le moteur ; carnet maquillé. | Détourne : « Deux pannes en une nuit, ça ne s'appelle pas de la malchance. » | `t_vasseur_theo`, `t_vasseur_pompe` ; clé du casier ; réparation K3. | Couverture respectée à l'assemblée ✓. |
| **Paolo Marchetti** (approvisionnement) | Garder les antibiotiques, son siège. | Trafic « cabine 0 ». | « Les comptes sont justes. » | `t_marchetti_aveu` ; clé de la réserve ; antibiotiques pour Lou ; identité du « garçon » (Noé). | Couverture et dette respectées ✓. |
| **Dre Hélène Sorel** (bien-être) | Soigner selon la liste ; elle pleure sa fille. | Moitié de médaillon « …ARA » ; croit Mara morte. | Rien. | `c_medaillon_sorel`, `t_sorel_fille`. | Réunion ✓ (sauf ⚠ D-04). |
| **Mara** (clandestine) | Retrouver sa mère ; faire entendre Clairval. | Clairval, Théo, sa mère « Hélène ». | Méfiante, mais ne ment pas. | `t_mara_clairval`, `t_mara_theo`, `t_mara_mere`, médaillon. | Confiance ✓ ; promesse de silence ✗ (⚠ D-13). |
| **Théo Lagarde** | Réparer sa faute ; protéger Mara. | Toute la nuit. | — | `t_theo_recit` (au poste seulement, ⚠ D-19). | — |
| **Rosa Ferrand** (cantine) | Nourrir tout le monde, sans histoires. | Deuxième portion de Théo ; ration qui manque chaque matin. | — | `t_rosa_portions` ; mission « La ration disparue ». | Dénonciation ou couverture ✓. |
| **Noé** (gamin) | Aider « la fille de la soute ». | Il a vu le saut ; il a vu des jerricans ; il nourrit Mara. | Se tait devant les uniformes. | `t_noe_saut` ; aveu des rations. | Puni s'il est dénoncé ✓ (⚠ D-18 sur son intro). |
| **Vic** (passeur) | Commercer. | Demande de K3 par Théo. | — | `t_vic_k3` ; matériel, antibiotiques. | Rancune ✓. |
| **Agathe** (porteuse d'eau) | Survivre sans ennuis. | Livraison de 23 h. | Se tait sauf confiance. | `t_agathe_soute`. | — |
| **Josefa Ilunga** (hôtesse) | Garder sa place. | Castel essoufflé à 00:20. | Se tait sauf confiance. | `t_hotesse_castel`. | — |
| **Constance de Villiers** | Garder son eau, son rang. | Échange avec Marchetti ; Théo trop curieux ; Noé a vu. | Hautaine, ne ment pas sur l'échange. | `t_villiers_theo`, `f_echange_antibio` ; lettre (Majordome). | Lettre révélée → froide ✓. |
| **Anselme** (aiguilleur) | Survivre seul ; des nouvelles du monde. | Théo blessé ; « la petite du barrage » ; le train fantôme ; l'émission en boucle. | — | `t_anselme` ; récepteur ; signal rouge. | Accord ✓. |

Personnages jouables : leur secret de départ.

| Personnage | Secret ou fardeau | Où il se résout |
|---|---|---|
| Le Contrôleur (Aurèle Fontaine) | Un billet « cabine 0 » en poche ; l'horaire VAYN-2 dans son propre journal. | Registre et trafic ; cabine de conduite ; épilogue |
| Le Passager (Sacha Morin) | Lou, sa sœur, quatrième sur la liste des antibiotiques. | Voler, négocier (Marchetti, Vic), pharmacie de la gare |
| Le Majordome (Edmond Lavigne) | La lettre cachetée de Madame. | Remettre, ouvrir, brûler, lire en public. ⚠ D-15 |
| Le Mécanicien (Malo Kerbrat) | Sa signature sous le faux carnet. | Avouer, couvrir, accuser Théo ; aveu public possible |

---

## 5. Secrets : qui sait quoi, et comment ils deviennent publics

| Secret | Connu au début par | Le joueur l'apprend par | Peut devenir public par | S'il reste caché | Statut |
|---|---|---|---|---|---|
| Théo a pris le K3 pour la radio | Théo | Carnet ; K3 dans la radio + socle vide (`f_k3_radio`) ; récit de Théo | Motion « relais de la radio » ; révélation `rev_theo` | La filtration se répare quand même avec le K3 du dépôt | SU → FAIT |
| La pompe de secours était vide, le carnet ment | Vasseur, Malo | Pompe + bon de sortie, ou pompe + carnet (`f_pompe_morte`) ; aveu de Vasseur | `rev_pompe` (autre que le Mécanicien), `rev_aveu` (Mécanicien) | Épilogue du Mécanicien | SU → FAIT |
| Castel a surpris Théo | Castel, Josefa (en partie) | Josefa + Noé (`f_chronologie`) ; aveu de Castel | Indirectement par `rev_theo` | — | SU |
| Castel a caché Clairval | Castel | Tiroir de Castel + K3 de la radio, ou + témoignage de Mara (`f_signal_cache`) ; aveu | `rev_radio` ; arguments `m_clairval`, `k_castel`, `d_radio_castel` | Ligne d'épilogue absente | SU → FAIT |
| L'eau part au Salon | Marchetti, Madame | Registre + compteur ou garde-manger (`f_detournement`) | Audit voté avec preuves ; `rev_trafic` | Épilogue du Contrôleur | SU → FAIT ; ⚠ D-08 |
| L'eau paie des antibiotiques | Marchetti, Madame | Brouillon, aveu, Madame (`f_echange_antibio`) | Avec le trafic | Sorel l'apprend si on lui dit | SU → FAIT |
| Mara est la fille de Sorel | Personne (Mara ne connaît que « Hélène ») | Deux moitiés du médaillon (`f_mere`) | Sorel, Mara, Castel en cellule, conseil, assemblée | Ironie dramatique dans l'épilogue | SECRET → FAIT ; ⚠ D-04 |
| Le « garçon » de la lettre est Noé | Madame, Marchetti | Seulement en remettant la lettre à Marchetti | — | Reste ambigu (Théo ou Noé ?) | Fausse piste volontaire |
| Clairval tourne en boucle depuis le Jour 96 | Anselme | Récepteur du poste | Argument `d_boucle` | Doute sur Clairval | SECRET (chapitre II) |
| Un autre VAYN existe | Anselme ; l'horaire est dans la cabine | `t_anselme`, `c_cabine_horaire` | Argument `d_vayn2` ; message final pour tous | — | SECRET (chapitre II) |
| L'homme en gris, l'auteur du sillon fantôme | Personne | — | — | — | SECRET (chapitre II) |

---

## 6. Indices par révélation : indispensables et facultatifs

Le résultat « P1 » vient des parcours exécutés : joueur qui ne suit que l'histoire principale, avec chacun des quatre personnages.

### R1 — Pourquoi le train s'est arrêté

- **Indispensable** : le socle du K3 vide (`c_socle_vide`) et la pompe de secours vide (`c_pompe_secours`). Les deux sont dans la voiture des machines, mis en évidence pour tous.
- **Pour l'auteur et le mobile** :
  - le carnet de Théo, ou le K3 trouvé dans la radio (→ `f_k3_radio`) ;
  - le bon de sortie, ou le carnet d'entretien (→ `f_pompe_morte`) ;
  - ou, plus simple, le récit de Théo au poste.
- **Accès selon le personnage** :
  - le casier de Théo s'ouvre pour tous (pied-de-biche de l'étagère) ;
  - la radio est accessible au Contrôleur (règlement), au Majordome (café) et au Mécanicien (crochetage) ;
  - le Passager n'y entre qu'avec une confiance de 2 avec Castel, au prix d'un long détour : tiroir de Castel, confrontation, promesse de silence (⚠ remarque D-30).
- **Si on rate les missions facultatives** : on comprend le mécanisme (« le K3 manque et la pompe n'a pas pris le relais ») sans l'auteur ni le mobile.
- **Résultat P1** : auteur et mobile inconnus avec les quatre personnages. ⚠ D-07 : l'objectif « Trouver ce qui a fait tomber la filtration » ne se coche qu'à la réparation.

### R2 — Ce qui est arrivé à Théo

- **Indispensable** : le récit de Théo (`t_theo_recit`), ou au moins `f_chronologie` (Noé + Josefa, ou Noé + aveu de Castel) et les traces du dépôt.
- **Utile** : `c_couchette_theo`, le carnet, `t_vic_k3`, `t_vasseur_theo`.
- **Fausses pistes volontaires** :
  - `t_castel_version` ;
  - la note de Madame (« le garçon de la maintenance… À régler ») ;
  - hypothèses `h_theo_castel`, `h_theo_salon`, `h_theo_fuite`.
- **Si on rate des choses** : les traces du dépôt mènent vers le talus, puis le poste.
- **Résultat P1** : Théo jamais retrouvé, et l'objectif « Retrouver la trace de Théo » coché par les traces. ⚠ D-07.

### R3 — Où part l'eau

- **Indispensable** : `f_detournement`. Il demande le registre de la réserve, plus le compteur ou le garde-manger (ou le billet « cabine 0 » plus le garde-manger).
- **Utile** :
  - `t_agathe_soute`, `c_tableau_rations` ;
  - le brouillon de Marchetti, son aveu, Madame (→ le motif : les antibiotiques).
- **Accès à la réserve** :
  - pour tous, la grille de Rosa entre 11:00 et 11:30 ;
  - la clé (Contrôleur après le tableau, ou dette de Marchetti) ;
  - crochetage (Mécanicien) ou escalade (Passager).
- **Garde-manger** : Majordome, ou Mécanicien quand Josefa n'est pas à la porte.
- **Résultat P1** : rien n'est appris. La piste n'est signalée que si le joueur trouve un premier indice.
- ⚠ D-08 : les chiffres se contredisent. ⚠ D-07 : l'objectif ne se coche que par un audit voté.

### R4 — Qui est la clandestine, et pourquoi elle est là

- **Indispensable** : la rencontrer. Dans la soute avant 16:00, ou en cellule après la fouille, qui se fait sans le joueur.
- Ses trois témoignages, puis le médaillon pour `f_mere`.
- **Utile** : `t_rosa_portions`, cachette de Noé, dessin sous l'oreiller de Théo (→ `f_theo_cachait`).
- **Manque** : comment elle sait que sa mère est à bord, et comment elle est montée (⚠ D-10).
- **Résultat P1** : rencontrée seulement par la fouille ; identité inconnue. L'épilogue suggère le lien (« sans savoir pourquoi cette gamine la fixe ainsi ») : ironie volontaire.

### R5 — Clairval existe-t-il ?

- **Pour** : `t_mara_clairval`, `c_registre_radio`, écoute de la radio à 21:00, mur de la gare (Jour 101).
- **Contre, ou doute** : `c_emission_clairval` (boucle depuis le Jour 96) ; Anselme : « Les vivants, ça change de message. »
- **But** : le doute doit rester. C'est cohérent, et volontaire.
- **Résultat P1** : Clairval n'est connu que par la description du conseil et de l'assemblée. ⚠ D-12 : l'écoute radio est attribuée à Mara.

### R6 — Castel a caché Clairval

- **Indispensable** : `c_registre_radio` (tiroir, quand Castel n'est pas à son poste), puis `f_signal_cache` (avec le K3 de la radio ou le témoignage de Mara).
- **Utile** : carte du réseau (Clairval entouré puis barré) ; cahier officiel.
- Peut devenir public au conseil ou à l'assemblée.

### R7 — Un autre VAYN, et l'avertissement final

- **Préparation** : `t_anselme` (au poste), `c_cabine_horaire` (cabine : Contrôleur ou Mécanicien seulement).
- **Confirmation** : le message final, que tout le monde reçoit.
- **Si rien n'a été préparé** : la découverte arrive brute, mais elle reste compréhensible comme un cliffhanger.
- **Résultat P1** : découverte brute avec les quatre personnages.

---

## 7. Missions et conditions

| Objectif | Visible si | Se coche quand | Remarque |
|---|---|---|---|
| Principal — Comprendre l'arrêt du train | Toujours | Journal d'alarmes lu | ✓ |
| Principal — Trouver ce qui a fait tomber la filtration | Alarmes lues | Filtration réparée (K3 installé, ou motion « filtration ») | ⚠ D-07 : pas à la compréhension (`f_panne`) |
| Principal — Retrouver la trace de Théo | Toujours | Carnet, aveu de Castel, **traces du dépôt**, rencontre | ⚠ D-07 : les traces suffisent, Théo pas retrouvé |
| Principal — Comprendre où part l'eau | Premier indice sur les réserves | **Audit voté avec preuves** | ⚠ D-07 : bloque l'objectif affiché jusqu'à la fin |
| Principal — Conseil, dormir, expédition, assemblée | Selon les événements | Séquences de l'App | ✓ (⚠ D-03 : départ sauté dans un cas) |
| La voix de Clairval (Mara) | Selon les étapes | Rencontre, confiance, médaillon, réunion, protection | ⚠ D-22 : « Retrouver la personne qu'elle cherche » non coché par la déduction |
| La ration disparue | Rosa la propose | Enquête, décision | ⚠ D-16 : lire le tableau des rations démarre et coche l'enquête |
| Personnelles (4) | Selon le personnage | Selon les choix | ⚠ D-21 : jamais « terminées » ; ⚠ D-22 (vol d'antibiotiques) |

---

## 8. Choix et répercussions

| Choix | Où | Effet immédiat | Repris plus tard | Statut |
|---|---|---|---|---|
| Couvrir Castel (« Ça restera entre nous ») | Castel | Confiance +2 | Rien ne bloque `rev_theo` | ⚠ D-13 |
| Garder le secret de la radio | Castel | Confiance +2 | `rev_radio` et `d_radio_castel` retirés | ✓ |
| Couvrir Vasseur | Vasseur | Confiance, dette | `rev_pompe` retiré ; épilogue du Mécanicien | ✓ |
| Couvrir Marchetti | Marchetti | Dette +2 | `rev_trafic` retiré ; épilogue | ✓ |
| Promettre le silence à Mara | Mara | — | `rev_mere` toujours proposé | ⚠ D-13 |
| Doux ou dur avec Mara | Mara | Confiance ±1 | Médaillon, compagne d'expédition, `e_mara_guide` | ✓ |
| Cacher Mara, mentir à Castel | Mara, Castel | Fouille vide | Motion « clandestine » absente | ✓ |
| Dénoncer, couvrir Noé, ou accuser Vic | Rosa | Noé puni, ou Vic rancunier | Dialogues et compagnons | ✓ |
| Lettre : remettre, ouvrir, brûler, lire en public | Madame, Marchetti, poêle, assemblée | Selon le choix | Épilogue | ⚠ D-15 (« cachet intact ») |
| Antibiotiques pour Lou | Pharmacie, Marchetti, Vic, gare | Lou soignée | Épilogue | ✓ (⚠ D-22 objectif) |
| Votes du conseil | Conseil | Selon l'option | Épilogue, PNJ | ⚠ D-14 (rationnement) |
| Compagnon d'expédition | Préparation | Aide ou risque | Épilogue | ⚠ D-01 (mort) |
| Ramener ou laisser Théo, signal au rouge | Poste | — | Retour et épilogue | ⚠ D-02, D-06 |
| Révélations publiques | Assemblée | Confiance, statuts | Épilogue | ✓ (sauf promesses, D-13) |
| Route : sud ou Clairval | Assemblée | — | Découverte finale | ✓ |

---

## 9. Révélations : préparation, confirmation, mystère restant

| Révélation | Préparée par | Confirmée par | Reste mystérieux |
|---|---|---|---|
| Panne | Alarmes, socle vide, pompe vide, insinuation de Vasseur | `f_panne`, récit de Théo, aveu de Vasseur | — |
| Disparition | Avis au panneau, Castel « il a sauté », lit fait au carré | Noé + Josefa, aveu de Castel, traces, récit de Théo | — |
| Trafic d'eau | Tableau des rations, Agathe, plainte « goût de rouille », colonne « livraisons » raturée | `f_detournement`, aveu, Madame | — |
| Mère et fille | Photo de la fillette au lac, demi-médaillons, « Hélène » | `f_mere` | — |
| Radio cachée | Poste « hors service », clé à la ceinture, carte barrée | Journal tamponné, aveu | — |
| Clairval | Mara, journal radio, mur, écoute | — | Vivants ou boucle ? (volontaire) |
| VAYN-2 | Anselme, horaire fantôme | Message final | Qui, pourquoi, quel danger (volontaire) |

---

## 10. Différences selon le personnage

| | Contrôleur | Passager | Majordome | Mécanicien |
|---|---|---|---|---|
| Départ | Bureau du Contrôle, Castel | Dortoirs, Noé | Salon, Josefa puis Madame | Atelier, Vasseur à l'interphone |
| Accès propres | Cabine de conduite, registre des passagers, clé de la radio (règlement), clé de la réserve | Grille de la réserve par le haut, cachette de Mara aux dortoirs, prix d'ami chez Vic | Garde-manger, office, cabine de Madame, café pour la clé de la radio | Crochetage (cabine, radio, casier, réserve, garde-manger, pharmacie), réparation sans outils |
| Témoignages directs | — | Noé, Agathe, Vic | Josefa, Madame | Agathe |
| Plus difficile | Agathe (tabac), dortoirs | Radio (confiance 2 avec Castel), garde-manger | Lampe à prendre à l'aube, Agathe | Madame |
| Fil personnel | « La ligne fantôme » | « La liste d'attente » | « La lettre de Madame » | « Le carnet d'entretien » |

Les 4 parcours « histoire principale » et les 4 parcours « explorateur » vont jusqu'à la fin avec chaque personnage.
Aucun n'est bloqué. Les différences portent sur les accès, pas sur la possibilité de finir.

---

## 11. Mystères volontaires, à ne pas « corriger »

| Mystère | Ce que le chapitre montre | À ne pas révéler maintenant |
|---|---|---|
| Castel se contredit (« il a dû sauter » mais « je ne l'ai pas vu ») | Une faille dans son mensonge, que le joueur peut remarquer | — |
| Vasseur accuse le « sabotage » | Elle détourne l'attention de la pompe | — |
| Deux « garçons » chez Madame (Théo dans la note, Noé dans la lettre) | Fausse piste ; tranchée par Marchetti si la lettre est remise | — |
| Clairval : boucle depuis le Jour 96, mot du Jour 101, Mara au présent | Doute sur la survie de Clairval | Le sort de Clairval |
| Le VAYN-2 et son avertissement | Annoncé par Anselme et l'horaire | Son identité, ce qu'il sait |
| L'horaire VAYN-2 dans le journal du Contrôleur | « Une ligne fantôme » | Qui l'a programmé |
| L'homme en gris | Une seule image dans l'introduction | Tout |
| La brume | Danger venu de la vallée | Sa nature |
| Ironie de l'épilogue (« sans savoir pourquoi cette gamine la fixe ainsi ») | Laisse entrevoir le lien | — |
