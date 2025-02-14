import { drizzle } from "drizzle-orm/postgres-js";

import { env } from "~/env.ts";

export const db = drizzle(env.PG_URL);
