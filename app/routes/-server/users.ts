import { createServerFn } from "@tanstack/start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { userTenantsTable, usersTable } from "~/db/schema.ts";
import { db } from "~/utils/db.ts";

export const removeUser = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string() }))
	.handler(async ({ data: { userId } }) => {
		console.info(`removeUser() ${userId}...`);

		await db.delete(usersTable).where(eq(usersTable.id, userId));
	});

export const removeUserTenant = createServerFn({ method: "POST" })
	.validator(z.object({ userId: z.string(), tenantId: z.string() }))
	.handler(async ({ data: { userId, tenantId } }) => {
		console.info(`removeUserTenant() ${userId} ${tenantId}...`);

		await db
			.delete(userTenantsTable)
			.where(
				and(
					eq(userTenantsTable.user_id, userId),
					eq(userTenantsTable.tenant_id, tenantId),
				),
			);
	});
