import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { debtEntries } from "~/server/db/schema";

// Input schemas for validation
const debtCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string().default("RON"),
	interestRate: z.number().min(0, "Interest rate must be non-negative"),
	lengthMonths: z.number().positive("Length must be positive"),
});

const debtUpdateSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string(),
	interestRate: z.number().min(0, "Interest rate must be non-negative"),
	lengthMonths: z.number().positive("Length must be positive"),
});

const debtDeleteSchema = z.object({
	id: z.number(),
});

export const debtRouter = createTRPCRouter({
	/**
	 * Get debt data
	 */
	getData: protectedProcedure.query(async ({ ctx }) => {
		const entries = await db
			.select()
			.from(debtEntries)
			.where(eq(debtEntries.userId, ctx.session.user.id));

		return entries.map((entry) => ({
			...entry,
			// Convert numeric values back to actual decimal values
			amount: entry.amount,
			interestRate: entry.interestRate,
		}));
	}),

	/**
	 * Create a new debt
	 */
	create: protectedProcedure
		.input(debtCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await db
				.insert(debtEntries)
				.values({
					userId: ctx.session.user.id,
					name: input.name,
					amount: input.amount,
					currency: input.currency,
					interestRate: input.interestRate,
					lengthMonths: input.lengthMonths,
				})
				.returning();

			const newEntry = result[0];
			if (!newEntry) {
				throw new Error("Failed to create debt entry");
			}

			return {
				...newEntry,
				// Convert numeric values back to actual decimal values
				amount: newEntry.amount,
				interestRate: newEntry.interestRate,
			};
		}),

	/**
	 * Update an existing debt
	 */
	update: protectedProcedure
		.input(debtUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the entry belongs to the user
			const entryExists = await db
				.select({ id: debtEntries.id })
				.from(debtEntries)
				.where(
					and(
						eq(debtEntries.id, input.id),
						eq(debtEntries.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryExists.length) {
				throw new Error("Debt entry not found or not owned by user");
			}

			const result = await db
				.update(debtEntries)
				.set({
					name: input.name,
					amount: input.amount,
					currency: input.currency,
					interestRate: input.interestRate,
					lengthMonths: input.lengthMonths,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(debtEntries.id, input.id),
						eq(debtEntries.userId, ctx.session.user.id),
					),
				)
				.returning();

			const updatedEntry = result[0];
			if (!updatedEntry) {
				throw new Error("Debt entry not found");
			}

			return {
				...updatedEntry,
				// Convert numeric values back to actual decimal values
				amount: updatedEntry.amount,
				interestRate: updatedEntry.interestRate,
			};
		}),

	/**
	 * Delete a debt
	 */
	delete: protectedProcedure
		.input(debtDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			const entryToDelete = await db
				.select()
				.from(debtEntries)
				.where(
					and(
						eq(debtEntries.id, input.id),
						eq(debtEntries.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryToDelete.length) {
				throw new Error("Debt entry not found or not owned by user");
			}

			await db
				.delete(debtEntries)
				.where(
					and(
						eq(debtEntries.id, input.id),
						eq(debtEntries.userId, ctx.session.user.id),
					),
				);

			const deletedEntry = entryToDelete[0];
			if (!deletedEntry) {
				throw new Error("Debt entry not found");
			}

			return {
				...deletedEntry,
				// Convert numeric values back to actual decimal values
				amount: deletedEntry.amount,
				interestRate: deletedEntry.interestRate,
			};
		}),
});
