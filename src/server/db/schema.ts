import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTableCreator,
	text,
} from "drizzle-orm/sqlite-core";

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
	investments: many(investments),
	realEstateEntries: many(realEstateEntries),
	debtEntries: many(debtEntries),
	depositEntries: many(depositEntries),
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

/**
 * Investments table for storing investment portfolio data
 */
export const investments = createTable("investment", (d) => ({
	id: d.integer("id").primaryKey({ autoIncrement: true }),
	userId: d
		.text("user_id")
		.notNull()
		.references(() => users.id),
	name: d.text("name").notNull(),
	value: d.integer("value").notNull(),
	currency: d.text("currency").notNull().default("RON"),
	date: d.text("date").notNull(),
	estimatedYearlyInterest: d.integer("estimated_yearly_interest").notNull(),
	createdAt: d
		.integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
	updatedAt: d
		.integer("updated_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
}));

export const investmentsRelations = relations(investments, ({ one }) => ({
	user: one(users, { fields: [investments.userId], references: [users.id] }),
}));

/**
 * Real Estate entries table for storing property data
 */
export const realEstateEntries = createTable("real_estate_entry", (d) => ({
	id: d.integer("id").primaryKey({ autoIncrement: true }),
	userId: d
		.text("user_id")
		.notNull()
		.references(() => users.id),
	name: d.text("name").notNull(),
	value: d.integer("value").notNull(),
	currency: d.text("currency").notNull().default("RON"),
	date: d.text("date").notNull(),
	createdAt: d
		.integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
	updatedAt: d
		.integer("updated_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
}));

export const realEstateEntriesRelations = relations(
	realEstateEntries,
	({ one }) => ({
		user: one(users, {
			fields: [realEstateEntries.userId],
			references: [users.id],
		}),
	}),
);

/**
 * Debt entries table for storing debt/loan data
 */
export const debtEntries = createTable("debt_entry", (d) => ({
	id: d.integer("id").primaryKey({ autoIncrement: true }),
	userId: d
		.text("user_id")
		.notNull()
		.references(() => users.id),
	name: d.text("name").notNull(),
	amount: d.integer("amount").notNull(),
	currency: d.text("currency").notNull().default("RON"),
	interestRate: d.integer("interest_rate").notNull(),
	lengthMonths: d.integer("length_months").notNull(),
	createdAt: d
		.integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
	updatedAt: d
		.integer("updated_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
}));

export const debtEntriesRelations = relations(debtEntries, ({ one }) => ({
	user: one(users, { fields: [debtEntries.userId], references: [users.id] }),
}));

/**
 * Deposit entries table for storing bank deposit data
 */
export const depositEntries = createTable("deposit_entry", (d) => ({
	id: d.integer("id").primaryKey({ autoIncrement: true }),
	userId: d
		.text("user_id")
		.notNull()
		.references(() => users.id),
	bankName: d.text("bank_name").notNull(),
	amount: d.integer("amount").notNull(),
	currency: d.text("currency").notNull().default("RON"),
	startDate: d.text("start_date").notNull(),
	interest: d.integer("interest").notNull(),
	lengthMonths: d.integer("length_months").notNull(),
	maturityDate: d.text("maturity_date").notNull(),
	createdAt: d
		.integer("created_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
	updatedAt: d
		.integer("updated_at", { mode: "timestamp" })
		.default(sql`(unixepoch())`),
}));

export const depositEntriesRelations = relations(depositEntries, ({ one }) => ({
	user: one(users, { fields: [depositEntries.userId], references: [users.id] }),
}));

export const incomeSources = createTable(
	"income_sources",
	(d) => ({
		id: d.integer("id").primaryKey({ autoIncrement: true }),
		userId: d
			.text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: d.text("name").notNull(),
		amount: d.integer("amount").notNull(),
		currency: d.text("currency").notNull().default("RON"),
		type: d.text("type").notNull().default("monthly"),
		taxPercentage: d.integer("tax_percentage").notNull().default(0),
		createdAt: d
			.integer("created_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`),
		updatedAt: d
			.integer("updated_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`),
	}),
	(table) => ({
		userIdIdx: index("income_source_user_id_idx").on(table.userId),
	}),
);

export const budgetAllocations = createTable(
	"budget_allocations",
	(d) => ({
		id: d.integer("id").primaryKey({ autoIncrement: true }),
		userId: d
			.text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		name: d.text("name").notNull(),
		value: d.integer("value").notNull(),
		currency: d.text("currency").notNull().default("RON"),
		type: d.text("type").notNull().default("monthly"),
		valueType: d.text("value_type").notNull().default("absolute"),
		createdAt: d
			.integer("created_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`),
		updatedAt: d
			.integer("updated_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`),
	}),
	(table) => ({
		userIdIdx: index("budget_allocation_user_id_idx").on(table.userId),
	}),
);

// Relations for income sources
export const incomeSourcesRelations = relations(incomeSources, ({ one }) => ({
	user: one(users, { fields: [incomeSources.userId], references: [users.id] }),
}));

/**
 * Spendings table for tracking expenses against budget allocations
 */
export const spendings = createTable(
	"spendings",
	(d) => ({
		id: d.integer("id").primaryKey({ autoIncrement: true }),
		allocationId: d
			.integer("allocation_id")
			.notNull()
			.references(() => budgetAllocations.id, { onDelete: "cascade" }),
		name: d.text("name").notNull(),
		amount: d.integer("amount").notNull(), // Store as integer (cents) to avoid floating point issues
		currency: d.text("currency").notNull().default("RON"),
		date: d.text("date").notNull(), // Store as text in ISO format
		description: d.text("description"),
		category: d.text("category"),
		createdAt: d
			.integer("created_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`),
		updatedAt: d
			.integer("updated_at", { mode: "timestamp" })
			.default(sql`(unixepoch())`),
	}),
	(table) => ({
		allocationIdIdx: index("spending_allocation_id_idx").on(table.allocationId),
	}),
);

// Relations for budget allocations
export const budgetAllocationsRelations = relations(
	budgetAllocations,
	({ one, many }) => ({
		user: one(users, {
			fields: [budgetAllocations.userId],
			references: [users.id],
		}),
		spendings: many(spendings),
	}),
);

// Relations for spendings
export const spendingsRelations = relations(spendings, ({ one }) => ({
	allocation: one(budgetAllocations, {
		fields: [spendings.allocationId],
		references: [budgetAllocations.id],
	}),
}));
