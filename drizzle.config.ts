import type { Config } from "drizzle-kit";

export default {
  schema: "./app/db/schema.ts",
  dialect: "postgresql",
  out: "app/db/migrations",
  dbCredentials: {
    url: process.env.PG_URL!,
  },
} satisfies Config;
