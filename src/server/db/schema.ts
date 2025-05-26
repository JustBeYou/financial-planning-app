import { relations, sql } from "drizzle-orm";
import { integer, sqliteTableCreator, text } from "drizzle-orm/sqlite-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator(
	(name) => `financial-planning-app_${name}`,
);

export const users = createTable("user", (d) => ({
	id: d
		.text({ length: 255 })
		.notNull()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: d.text({ length: 255 }),
	email: d.text({ length: 255 }).notNull(),
	emailVerified: d.integer({ mode: "timestamp" }).default(sql`(unixepoch())`),
	image: d.text({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
	cashEntries: many(cashEntries),
}));

/**
 * Cash entries table for storing financial cash accounts data
 */
export const cashEntries = createTable("cash_entry", (d) => ({
	id: d.integer("id").primaryKey({ autoIncrement: true }),
	userId: d
		.text("user_id")
		.notNull()
		.references(() => users.id),
	accountName: d.text("account_name").notNull(),
	amount: d.integer("amount").notNull(), // Store as integer (cents) to avoid floating point issues
	currency: d.text("currency").notNull().default("RON"),
	date: d.text("date").notNull(), // Store as text in ISO format
	createdAt: d
		.integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
	updatedAt: d
		.integer("updated_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
}));

export const cashEntriesRelations = relations(cashEntries, ({ one }) => ({
	user: one(users, { fields: [cashEntries.userId], references: [users.id] }),
}));
