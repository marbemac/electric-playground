import { unique } from "@dpaskhin/unique";
import { faker } from "@faker-js/faker";
import { drizzle } from "drizzle-orm/postgres-js";

import dayjs from "dayjs";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import type { SingleStoreDriverDatabase } from "drizzle-orm/singlestore";
import * as R from "remeda";

import type { PgliteDatabase } from "drizzle-orm/pglite";
import {
	commentsTable,
	documentsTable,
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
		documentsPerUser: [0, 100] as const,
		commentsPerDocument: [0, 100] as const,
	},
	default: {
		tenants: 5000,
		usersPerTenant: [1, 100] as const,
		maxInvoicePerSubscription: 200,
		documentsPerUser: [0, 30] as const,
		commentsPerDocument: [0, 30] as const,
	},
	min: {
		tenants: 10,
		usersPerTenant: [1, 10] as const,
		maxInvoicePerSubscription: 5,
		documentsPerUser: [0, 10] as const,
		commentsPerDocument: [0, 20] as const,
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
	const DOCUMENTS_PER_USER_COUNT = size.documentsPerUser;
	const COMMENTS_PER_DOCUMENT_COUNT = size.commentsPerDocument;

	const records = {
		tenants: [] as (typeof tenantsTable.$inferInsert)[],
		users: [] as (typeof usersTable.$inferInsert)[],
		subscriptions: [] as (typeof subscriptionsTable.$inferInsert)[],
		invoices: [] as (typeof invoicesTable.$inferInsert)[],
		documents: [] as (typeof documentsTable.$inferInsert)[],
		comments: [] as (typeof commentsTable.$inferInsert)[],
	};

	let tenantIds = 0;
	let userIds = 0;
	let documentIds = 0;
	let commentIds = 0;
	let subscriptionIds = 0;
	let invoiceIds = 0;

	const tenantUniqStore = new Set();
	const userUniqStore = new Set();

	for (let t = 0; t < TENANTS_COUNT; t++) {
		const tenantId = `t${tenantIds++}`;

		records.tenants.push({
			id: tenantId,
			name: unique(faker.company.name(), { store: tenantUniqStore }),
		});

		const usersCount = R.randomInteger(
			USERS_PER_TENANT_COUNT[0],
			USERS_PER_TENANT_COUNT[1],
		);

		for (let u = 0; u < usersCount; u++) {
			const userId = `u${userIds++}`;

			records.users.push({
				id: userId,
				username: unique(faker.internet.username(), { store: userUniqStore }),
				tenant_id: tenantId,
			});
		}

		for (const user of records.users) {
			const documentsCount = R.randomInteger(
				DOCUMENTS_PER_USER_COUNT[0],
				DOCUMENTS_PER_USER_COUNT[1],
			);

			for (let i = 0; i < documentsCount; i++) {
				const documentId = `d${documentIds++}`;

				records.documents.push({
					id: documentId,
					title: faker.lorem.sentence({ min: 1, max: 4 }),
					content: faker.lorem.paragraphs(3),
					status: (() => {
						const rand = Math.random() * 100;
						if (rand < 60) return "published";
						if (rand < 90) return "draft";
						return "archived";
					})(),
					created_at: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
					created_by: user.id,
					visibility: (() => {
						const rand = Math.random() * 100;
						if (rand < 60) return "public";
						return "private";
					})(),
				});
			}
		}

		for (const document of records.documents) {
			const commentsCount = R.randomInteger(
				COMMENTS_PER_DOCUMENT_COUNT[0],
				COMMENTS_PER_DOCUMENT_COUNT[1],
			);

			for (let c = 0; c < commentsCount; c++) {
				const commentId = `c${commentIds++}`;

				records.comments.push({
					id: commentId,
					document_id: document.id,
					created_by:
						records.users[Math.floor(Math.random() * records.users.length)].id,
					content: faker.lorem.paragraph(),
					created_at: dayjs().format("YYYY-MM-DD HH:mm:ss.SSS"),
				});
			}
		}

		const subscriptionId = `s${subscriptionIds++}`;
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
			const invoiceId = `i${invoiceIds++}`;

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
		`Inserting events for ${records.tenants.length} tenants, ${records.users.length} users, ${records.subscriptions.length} subscriptions, ${records.invoices.length} invoices, ${records.documents.length} documents, ${records.comments.length} comments\n`,
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

	const documents = R.chunk(records.documents, 5_000);
	for (const i in documents) {
		const chunk = documents[i]!;
		console.log(
			`Inserting document chunk ${Number(i) + 1}/${documents.length}`,
		);
		// @ts-expect-error ignore
		await db.insert(documentsTable).values(chunk);
	}

	const comments = R.chunk(records.comments, 5_000);
	for (const i in comments) {
		const chunk = comments[i]!;
		console.log(`Inserting comment chunk ${Number(i) + 1}/${comments.length}`);
		// @ts-expect-error ignore
		await db.insert(commentsTable).values(chunk);
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
