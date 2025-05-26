import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { investments } from "~/server/db/schema";

// Input schemas for validation
const investmentCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string().default("RON"),
	date: z.string().min(1, "Date is required"),
	estimatedYearlyInterest: z
		.number()
		.min(0, "Interest rate must be non-negative"),
});

const investmentUpdateSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string(),
	date: z.string().min(1, "Date is required"),
	estimatedYearlyInterest: z
		.number()
		.min(0, "Interest rate must be non-negative"),
});

const investmentDeleteSchema = z.object({
	id: z.number(),
});

export const investmentsRouter = createTRPCRouter({
	/**
	 * Get investments data
	 */
	getData: protectedProcedure.query(async ({ ctx }) => {
		const entries = await db
			.select()
			.from(investments)
			.where(eq(investments.userId, ctx.session.user.id));

		return entries.map((entry) => ({
			...entry,
			// Convert numeric values back to actual decimal values
			value: entry.value,
			estimatedYearlyInterest: entry.estimatedYearlyInterest,
		}));
	}),

	/**
	 * Create a new investment
	 */
	create: protectedProcedure
		.input(investmentCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await db
				.insert(investments)
				.values({
					userId: ctx.session.user.id,
					name: input.name,
					value: input.value,
					currency: input.currency,
					date: input.date,
					estimatedYearlyInterest: input.estimatedYearlyInterest,
				})
				.returning();

			const newEntry = result[0];
			if (!newEntry) {
				throw new Error("Failed to create investment");
			}

			return {
				...newEntry,
				// Convert numeric values back to actual decimal values
				value: newEntry.value,
				estimatedYearlyInterest: newEntry.estimatedYearlyInterest,
			};
		}),

	/**
	 * Update an existing investment
	 */
	update: protectedProcedure
		.input(investmentUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the entry belongs to the user
			const entryExists = await db
				.select({ id: investments.id })
				.from(investments)
				.where(
					and(
						eq(investments.id, input.id),
						eq(investments.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryExists.length) {
				throw new Error("Investment not found or not owned by user");
			}

			const result = await db
				.update(investments)
				.set({
					name: input.name,
					value: input.value,
					currency: input.currency,
					date: input.date,
					estimatedYearlyInterest: input.estimatedYearlyInterest,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(investments.id, input.id),
						eq(investments.userId, ctx.session.user.id),
					),
				)
				.returning();

			const updatedEntry = result[0];
			if (!updatedEntry) {
				throw new Error("Investment not found");
			}

			return {
				...updatedEntry,
				// Convert numeric values back to actual decimal values
				value: updatedEntry.value,
				estimatedYearlyInterest: updatedEntry.estimatedYearlyInterest,
			};
		}),

	/**
	 * Delete an investment
	 */
	delete: protectedProcedure
		.input(investmentDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			const entryToDelete = await db
				.select()
				.from(investments)
				.where(
					and(
						eq(investments.id, input.id),
						eq(investments.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryToDelete.length) {
				throw new Error("Investment not found or not owned by user");
			}

			await db
				.delete(investments)
				.where(
					and(
						eq(investments.id, input.id),
						eq(investments.userId, ctx.session.user.id),
					),
				);

			const deletedEntry = entryToDelete[0];
			if (!deletedEntry) {
				throw new Error("Investment not found");
			}

			return {
				...deletedEntry,
				// Convert numeric values back to actual decimal values
				value: deletedEntry.value,
				estimatedYearlyInterest: deletedEntry.estimatedYearlyInterest,
			};
		}),
});
