import {
	index,
	integer,
	pgTable,
	timestamp,
	varchar,
} from "drizzle-orm/pg-core";

/**
 * The benchmark data model:
 *
 * - tenant
 * - user (tenant has many users, user has one tenant)
 * - subscription (tenant has many subscriptions, subscription has one tenant)
 * - invoice (subscription has many invoices, invoice has one subscription, tenant has many invoices through subscription)
 * - document (user has many documents, document has one user)
 * - comment (document has many comments, comment has one document)
 */

export const tenantsTable = pgTable("tenants", {
	id: varchar({ length: 255 }).primaryKey(),
	name: varchar({ length: 255 }).notNull(),
});

export const usersTable = pgTable(
	"users",
	{
		id: varchar({ length: 255 }).primaryKey(),
		username: varchar({ length: 255 }).notNull(),
		tenant_id: varchar({ length: 255 }).notNull(),
	},
	(table) => [index("users_tenant_id_idx").on(table.tenant_id)],
);

export const subscriptionsTable = pgTable(
	"subscriptions",
	{
		id: varchar({ length: 255 }).primaryKey(),
		tenant_id: varchar({ length: 255 }).notNull(),
		status: varchar({ enum: ["active", "canceled", "failed"] }).notNull(),
		started_at: timestamp({ mode: "string" }).notNull(),
	},
	(table) => [index("subscriptions_tenant_id_idx").on(table.tenant_id)],
);

export const invoicesTable = pgTable(
	"invoices",
	{
		id: varchar({ length: 255 }).primaryKey(),
		total: integer().notNull(),
		created_at: timestamp({ mode: "string" }).notNull(),
		subscription_id: varchar({ length: 255 }).notNull(),
	},
	(table) => [index("invoices_subscription_id_idx").on(table.subscription_id)],
);

export const documentsTable = pgTable(
	"documents",
	{
		id: varchar({ length: 255 }).primaryKey(),
		title: varchar({ length: 255 }).notNull(),
		content: varchar({ length: 10_000 }).notNull(),
		status: varchar({ enum: ["draft", "published", "archived"] }).notNull(),
		created_at: timestamp({ mode: "string" }).notNull(),
		created_by: varchar({ length: 255 }).notNull(), // references users.id
		updated_at: timestamp({ mode: "string" }).$onUpdate(() =>
			new Date().toISOString(),
		),
		visibility: varchar({ enum: ["public", "private"] }).notNull(),
	},
	(table) => [index("documents_created_by_idx").on(table.created_by)],
);

export const commentsTable = pgTable(
	"comments",
	{
		id: varchar({ length: 255 }).primaryKey(),
		document_id: varchar({ length: 255 }).notNull(),
		created_by: varchar({ length: 255 }).notNull(), // references users.id
		content: varchar({ length: 2000 }).notNull(),
		created_at: timestamp({ mode: "string" }).notNull(),
		updated_at: timestamp({ mode: "string" }).$onUpdate(() =>
			new Date().toISOString(),
		),
	},
	(table) => [
		index("comments_document_id_idx").on(table.document_id),
		index("comments_created_by_idx").on(table.created_by),
	],
);
