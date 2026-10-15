// Configuration dédiée aux outils d'audit narratif (séparée des tests du jeu : `npm test` ne les lance pas).
// Lancement depuis la racine du dépôt : npx vitest run --config audit-narratif/outils/vitest.config.ts
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: fileURLToPath(new URL('../../', import.meta.url)),
  test: {
    include: ['audit-narratif/outils/**/*.audit.test.ts'],
    environment: 'node',
  },
});
