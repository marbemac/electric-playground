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
		status: varchar({ length: 255 }).notNull(),
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
