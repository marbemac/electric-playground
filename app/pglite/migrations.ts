import type { PGliteWorker } from "@electric-sql/pglite/worker";

// @ts-expect-error
import migration from "../db/migrations/0000_empty_lady_deathstrike.sql" with {
	type: "text",
};

/**
 * Copied from app/db/migrations/0000_empty_lady_deathstrike.sql
 */
export const migrate = async (pg: PGliteWorker) => {
	await pg.exec(migration);
};
