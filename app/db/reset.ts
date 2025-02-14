import postgres from "postgres";

const sql = postgres(process.env.PG_URL!);

const s = "public";

const res = await sql<{ drop_statement: string }[]>`
  SELECT 'DROP TABLE IF EXISTS "' || schemaname || '"."' || tablename || '" CASCADE;' AS drop_statement
  FROM pg_tables
  WHERE schemaname = ${s}`;

const dropStatements = res.map((r) => r.drop_statement).join("\n");

await sql.unsafe(dropStatements);

await sql.unsafe("DROP SCHEMA IF EXISTS drizzle CASCADE");

process.exit(0);
