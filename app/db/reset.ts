import postgres from "postgres";

import { env } from "~/env.ts";

const sql = postgres(env.PG_URL);

const s = "public";

console.log(
	"NOTE - need to nuke the electric storage dir / container... reseting pg only will result in errors on the client.",
);
console.log("probably easiest to just `yarn docker.nuke` and start over");

const res = await sql<{ drop_statement: string }[]>`
  SELECT 'DROP TABLE IF EXISTS "' || schemaname || '"."' || tablename || '" CASCADE;' AS drop_statement
  FROM pg_tables
  WHERE schemaname = ${s}`;

const dropStatements = res.map((r) => r.drop_statement).join("\n");

await sql.unsafe(dropStatements);

await sql.unsafe("DROP SCHEMA IF EXISTS drizzle CASCADE");

process.exit(0);
