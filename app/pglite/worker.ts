import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite/vector';
import { worker } from '@electric-sql/pglite/worker';

void worker({
  async init(options) {
    return new PGlite({
      dataDir: options.dataDir,
      relaxedDurability: true,
      extensions: {
        vector,
      },
    });
  },
});
