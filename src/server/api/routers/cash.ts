import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { cashEntries } from "~/server/db/schema";

// Input schemas for validation
const cashEntryCreateSchema = z.object({
	accountName: z.string().min(1, "Account name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string().default("RON"),
	date: z.string().min(1, "Date is required"),
});

const cashEntryUpdateSchema = z.object({
	id: z.number(),
	accountName: z.string().min(1, "Account name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string(),
	date: z.string().min(1, "Date is required"),
});

const cashEntryDeleteSchema = z.object({
	id: z.number(),
});

export const cashRouter = createTRPCRouter({
	/**
	 * Get cash entries data
	 */
	getData: protectedProcedure.query(async ({ ctx }) => {
		const entries = await db
			.select()
			.from(cashEntries)
			.where(eq(cashEntries.userId, ctx.session.user.id));

		return entries.map((entry) => ({
			...entry,
			// Convert numeric amount back to actual decimal value
			amount: entry.amount,
		}));
	}),

	/**
	 * Create a new cash entry
	 */
	create: protectedProcedure
		.input(cashEntryCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await db
				.insert(cashEntries)
				.values({
					userId: ctx.session.user.id,
					accountName: input.accountName,
					amount: input.amount,
					currency: input.currency,
					date: input.date,
				})
				.returning();

			const newEntry = result[0];
			if (!newEntry) {
				throw new Error("Failed to create cash entry");
			}

			return {
				...newEntry,
				// Convert numeric amount back to actual decimal value for client
				amount: newEntry.amount,
			};
		}),

	/**
	 * Update an existing cash entry
	 */
	update: protectedProcedure
		.input(cashEntryUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the entry belongs to the user
			const entryExists = await db
				.select({ id: cashEntries.id })
				.from(cashEntries)
				.where(
					and(
						eq(cashEntries.id, input.id),
						eq(cashEntries.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryExists.length) {
				throw new Error("Cash entry not found or not owned by user");
			}

			const result = await db
				.update(cashEntries)
				.set({
					accountName: input.accountName,
					amount: input.amount,
					currency: input.currency,
					date: input.date,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(cashEntries.id, input.id),
						eq(cashEntries.userId, ctx.session.user.id),
					),
				)
				.returning();

			const updatedEntry = result[0];
			if (!updatedEntry) {
				throw new Error("Cash entry not found");
			}

			return {
				...updatedEntry,
				// Convert numeric amount back to actual decimal value for client
				amount: updatedEntry.amount,
			};
		}),

	/**
	 * Delete a cash entry
	 */
	delete: protectedProcedure
		.input(cashEntryDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			const entryToDelete = await db
				.select()
				.from(cashEntries)
				.where(
					and(
						eq(cashEntries.id, input.id),
						eq(cashEntries.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryToDelete.length) {
				throw new Error("Cash entry not found or not owned by user");
			}

			await db
				.delete(cashEntries)
				.where(
					and(
						eq(cashEntries.id, input.id),
						eq(cashEntries.userId, ctx.session.user.id),
					),
				);

			// First item is guaranteed to exist because we checked length above
			const deletedEntry = entryToDelete[0];
			if (!deletedEntry) {
				throw new Error("Cash entry not found");
			}

			return {
				...deletedEntry,
				// Convert numeric amount back to actual decimal value for client
				amount: deletedEntry.amount,
			};
		}),
});
