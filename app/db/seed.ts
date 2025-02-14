import { drizzle } from "drizzle-orm/postgres-js";

import dayjs from "dayjs";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { SingleStoreDriverDatabase } from "drizzle-orm/singlestore";
import * as R from "remeda";

import type { PgliteDatabase } from "drizzle-orm/pglite";
import {
	invoicesTable,
	subscriptionsTable,
	tenantsTable,
	usersTable,
} from "./schema.ts";

import { env } from "~/env.ts";

const sizes = {
	max: {
		tenants: 20_000,
		usersPerTenant: [1, 300] as const, // [min, max]
		maxInvoicePerSubscription: 400, // we create 1 invoice per day
	},
	default: {
		tenants: 5000,
		usersPerTenant: [1, 100] as const,
		maxInvoicePerSubscription: 200,
	},
	min: {
		tenants: 10,
		usersPerTenant: [1, 10] as const,
		maxInvoicePerSubscription: 5,
	},
};

export const ingestRawEvents = async (
	db: PostgresJsDatabase | PgliteDatabase | SingleStoreDriverDatabase,
) => {
	// run the seed command with --min to seed with minimal data
	let sizeKey: keyof typeof sizes;
	switch (process.argv[2] || "default") {
		case "--min":
			sizeKey = "min";
			break;
		case "--max":
			sizeKey = "max";
			break;
		default:
			sizeKey = "default";
	}

	const size = sizes[sizeKey];
	const TENANTS_COUNT = size.tenants;
	const USERS_PER_TENANT_COUNT = size.usersPerTenant;
	const MAX_INVOICES_PER_SUBSCRIPTION = size.maxInvoicePerSubscription;

	const records = {
		tenants: [] as (typeof tenantsTable.$inferInsert)[],
		users: [] as (typeof usersTable.$inferInsert)[],
		subscriptions: [] as (typeof subscriptionsTable.$inferInsert)[],
		invoices: [] as (typeof invoicesTable.$inferInsert)[],
	};

	for (let t = 0; t < TENANTS_COUNT; t++) {
		const tenantId = `t${t}`;

		records.tenants.push({
			id: tenantId,
			name: `Tenant ${t}`,
		});

		const usersCount = R.randomInteger(
			USERS_PER_TENANT_COUNT[0],
			USERS_PER_TENANT_COUNT[1],
		);

		for (let u = 0; u < usersCount; u++) {
			const userId = `u${t}-${u}`;

			records.users.push({
				id: userId,
				username: `User ${u}`,
				tenant_id: tenantId,
			});
		}

		const subscriptionId = `s${t}`;
		const subscriptionDaysAgo = R.randomInteger(
			0,
			MAX_INVOICES_PER_SUBSCRIPTION,
		);
		const subscriptionStartedAt = dayjs().subtract(subscriptionDaysAgo, "day");

		records.subscriptions.push({
			id: subscriptionId,
			tenant_id: tenantId,
			started_at: subscriptionStartedAt.format("YYYY-MM-DD HH:mm:ss.SSS"),
			status: (() => {
				const rand = Math.random() * 100;
				if (rand < 90) return "active";
				if (rand < 98) return "canceled";
				return "failed";
			})(),
		});

		for (let i = 0; i < subscriptionDaysAgo; i++) {
			const invoiceId = `i${t}-${i}`;

			records.invoices.push({
				id: invoiceId,
				total: R.randomInteger(10, 1000),
				created_at: dayjs()
					.subtract(i, "day")
					.format("YYYY-MM-DD HH:mm:ss.SSS"),
				subscription_id: subscriptionId,
			});
		}
	}

	console.log(
		`Inserting events for ${records.tenants.length} tenants, ${records.users.length} users, ${records.subscriptions.length} subscriptions, ${records.invoices.length} invoices\n`,
	);

	const tenants = R.chunk(records.tenants, 5_000);
	for (const i in tenants) {
		const chunk = tenants[i]!;
		console.log(`Inserting tenant chunk ${Number(i) + 1}/${tenants.length}`);
		// @ts-expect-error ignore
		await db.insert(tenantsTable).values(chunk);
	}

	const users = R.chunk(records.users, 5_000);
	for (const i in users) {
		const chunk = users[i]!;
		console.log(`Inserting user chunk ${Number(i) + 1}/${users.length}`);
		// @ts-expect-error ignore
		await db.insert(usersTable).values(chunk);
	}

	const subscriptions = R.chunk(records.subscriptions, 5_000);
	for (const i in subscriptions) {
		const chunk = subscriptions[i]!;
		console.log(
			`Inserting subscription chunk ${Number(i) + 1}/${subscriptions.length}`,
		);
		// @ts-expect-error ignore
		await db.insert(subscriptionsTable).values(chunk);
	}

	const invoices = R.chunk(records.invoices, 5_000);
	for (const i in invoices) {
		const chunk = invoices[i]!;
		console.log(`Inserting invoice chunk ${Number(i) + 1}/${invoices.length}`);
		// @ts-expect-error ignore
		await db.insert(invoicesTable).values(chunk);
	}
};

const db = drizzle(env.PG_URL);

await ingestRawEvents(db);

process.exit();
