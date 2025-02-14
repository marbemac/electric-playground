import { createServerFn } from "@tanstack/start";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { invoicesTable } from "~/db/schema.ts";
import { db } from "~/utils/db.ts";

export const removeInvoice = createServerFn({ method: "POST" })
	.validator(z.object({ invoiceId: z.string() }))
	.handler(async ({ data: { invoiceId } }) => {
		console.info(`removeInvoice() ${invoiceId}...`);

		await db.delete(invoicesTable).where(eq(invoicesTable.id, invoiceId));
	});

export const changeInvoiceTotal = createServerFn({ method: "POST" })
	.validator(z.object({ invoiceId: z.string(), total: z.number() }))
	.handler(async ({ data: { invoiceId, total } }) => {
		console.info(`changeInvoiceTotal() ${invoiceId} to ${total}...`);

		await db
			.update(invoicesTable)
			.set({ total })
			.where(eq(invoicesTable.id, invoiceId));
	});
