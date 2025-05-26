import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { depositEntries } from "~/server/db/schema";

// Helper function to calculate maturity date
const calculateMaturityDate = (
	startDate: string,
	lengthMonths: number,
): string => {
	const date = new Date(startDate);
	date.setMonth(date.getMonth() + lengthMonths);

	// Format as YYYY-MM-DD manually to avoid potential undefined
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
};

// Input schemas for validation
const depositCreateSchema = z.object({
	bankName: z.string().min(1, "Bank name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string().default("RON"),
	startDate: z.string().min(1, "Start date is required"),
	interest: z.number().min(0, "Interest rate must be non-negative"),
	lengthMonths: z.number().positive("Length must be positive"),
});

const depositUpdateSchema = z.object({
	id: z.number(),
	bankName: z.string().min(1, "Bank name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string(),
	startDate: z.string().min(1, "Start date is required"),
	interest: z.number().min(0, "Interest rate must be non-negative"),
	lengthMonths: z.number().positive("Length must be positive"),
});

const depositDeleteSchema = z.object({
	id: z.number(),
});

export const depositsRouter = createTRPCRouter({
	/**
	 * Get deposits data
	 */
	getData: protectedProcedure.query(async ({ ctx }) => {
		const entries = await db
			.select()
			.from(depositEntries)
			.where(eq(depositEntries.userId, ctx.session.user.id));

		return entries.map((entry) => ({
			...entry,
			// Convert numeric values back to actual decimal values
			amount: entry.amount,
			interest: entry.interest,
		}));
	}),

	/**
	 * Create a new deposit
	 */
	create: protectedProcedure
		.input(depositCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const maturityDate = calculateMaturityDate(
				input.startDate,
				input.lengthMonths,
			);

			const result = await db
				.insert(depositEntries)
				.values({
					userId: ctx.session.user.id,
					bankName: input.bankName,
					amount: input.amount,
					currency: input.currency,
					startDate: input.startDate,
					interest: input.interest,
					lengthMonths: input.lengthMonths,
					maturityDate,
				})
				.returning();

			const newEntry = result[0];
			if (!newEntry) {
				throw new Error("Failed to create deposit entry");
			}

			return {
				...newEntry,
				// Convert numeric values back to actual decimal values
				amount: newEntry.amount,
				interest: newEntry.interest,
			};
		}),

	/**
	 * Update an existing deposit
	 */
	update: protectedProcedure
		.input(depositUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the entry belongs to the user
			const entryExists = await db
				.select({ id: depositEntries.id })
				.from(depositEntries)
				.where(
					and(
						eq(depositEntries.id, input.id),
						eq(depositEntries.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryExists.length) {
				throw new Error("Deposit entry not found or not owned by user");
			}

			const maturityDate = calculateMaturityDate(
				input.startDate,
				input.lengthMonths,
			);

			const result = await db
				.update(depositEntries)
				.set({
					bankName: input.bankName,
					amount: input.amount,
					currency: input.currency,
					startDate: input.startDate,
					interest: input.interest,
					lengthMonths: input.lengthMonths,
					maturityDate,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(depositEntries.id, input.id),
						eq(depositEntries.userId, ctx.session.user.id),
					),
				)
				.returning();

			const updatedEntry = result[0];
			if (!updatedEntry) {
				throw new Error("Deposit entry not found");
			}

			return {
				...updatedEntry,
				// Convert numeric values back to actual decimal values
				amount: updatedEntry.amount,
				interest: updatedEntry.interest,
			};
		}),

	/**
	 * Delete a deposit
	 */
	delete: protectedProcedure
		.input(depositDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			const entryToDelete = await db
				.select()
				.from(depositEntries)
				.where(
					and(
						eq(depositEntries.id, input.id),
						eq(depositEntries.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryToDelete.length) {
				throw new Error("Deposit entry not found or not owned by user");
			}

			await db
				.delete(depositEntries)
				.where(
					and(
						eq(depositEntries.id, input.id),
						eq(depositEntries.userId, ctx.session.user.id),
					),
				);

			const deletedEntry = entryToDelete[0];
			if (!deletedEntry) {
				throw new Error("Deposit entry not found");
			}

			return {
				...deletedEntry,
				// Convert numeric values back to actual decimal values
				amount: deletedEntry.amount,
				interest: deletedEntry.interest,
			};
		}),
});
