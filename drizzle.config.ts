import type { Config } from "drizzle-kit";

import { env } from "~/env.ts";

export default {
	schema: "./app/db/schema.ts",
	dialect: "postgresql",
	out: "app/db/migrations",
	dbCredentials: {
		url: env.PG_URL,
	},
} satisfies Config;
