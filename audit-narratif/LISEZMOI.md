# Audit narratif du chapitre I

Aucun fichier du jeu n'a été modifié par cet audit.

| Fichier | Contenu |
|---|---|
| [`DIAGNOSTIC.md`](DIAGNOSTIC.md) | Résumé de l'histoire, évaluation, bugs narratifs (D-01 à D-30), progression, informations manquantes, plan de correction par priorité |
| [`CARTE_NARRATIVE.md`](CARTE_NARRATIVE.md) | Carte de cohérence : vérité cachée, chronologie, causes et conséquences, personnages, secrets, indices par révélation, missions, choix, différences par personnage, mystères volontaires |
| [`PARCOURS_EXECUTES.md`](PARCOURS_EXECUTES.md) | Rapport généré des 26 parcours joués dans le moteur (sans rendu) |
| [`REFERENCES_CROISEES.md`](REFERENCES_CROISEES.md) | Rapport généré : drapeaux, sources des entrées du carnet, objectifs, conséquences |
| `journaux/` | Journal pas à pas de chaque parcours |
| `outils/` | Banc d'essai (`harness.ts`), parcours, références croisées, configuration Vitest |

Pour régénérer les rapports, depuis la racine du dépôt :

```bash
npx vitest run --config audit-narratif/outils/vitest.config.ts
```

Les tests du jeu (`npm test`) ne lancent pas ces outils.

Les parcours passent par le vrai moteur et le vrai contenu, mais sans interface.
Les séquences de l'application (conseil, expédition, départ, assemblée…) y sont recopiées depuis `src/app/App.ts`.
Voir les limites dans `DIAGNOSTIC.md`, section 0.
