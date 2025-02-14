import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { usersTable } from "~/db/schema.ts";
import { db } from "~/utils/db.ts";

export const removeUser = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data: { userId } }) => {
		console.info(`removeUser() ${userId}...`);

		await db.delete(usersTable).where(eq(usersTable.id, userId));
	});
