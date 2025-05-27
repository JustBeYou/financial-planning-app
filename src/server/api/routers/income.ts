import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { incomeSources } from "~/server/db/schema";

// Input schemas for validation
const incomeSourceCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string().default("RON"),
	type: z.enum(["monthly", "yearly"]).default("monthly"),
	taxPercentage: z.number().min(0).max(100).default(0),
});

const incomeSourceUpdateSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string(),
	type: z.enum(["monthly", "yearly"]),
	taxPercentage: z.number().min(0).max(100),
});

const incomeSourceDeleteSchema = z.object({
	id: z.number(),
});

export const incomeRouter = createTRPCRouter({
	/**
	 * Get income sources data
	 */
	getData: protectedProcedure.query(async ({ ctx }) => {
		const sources = await db
			.select()
			.from(incomeSources)
			.where(eq(incomeSources.userId, ctx.session.user.id));

		return sources.map((source) => ({
			id: source.id,
			name: source.name,
			amount: source.amount,
			currency: source.currency,
			type: source.type as "monthly" | "yearly",
			taxPercentage: source.taxPercentage,
		}));
	}),

	/**
	 * Create a new income source
	 */
	create: protectedProcedure
		.input(incomeSourceCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await db
				.insert(incomeSources)
				.values({
					userId: ctx.session.user.id,
					name: input.name,
					amount: input.amount,
					currency: input.currency,
					type: input.type,
					taxPercentage: input.taxPercentage,
				})
				.returning();

			const newSource = result[0];
			if (!newSource) {
				throw new Error("Failed to create income source");
			}

			return {
				id: newSource.id,
				name: newSource.name,
				amount: newSource.amount,
				currency: newSource.currency,
				type: newSource.type as "monthly" | "yearly",
				taxPercentage: newSource.taxPercentage,
			};
		}),

	/**
	 * Update an existing income source
	 */
	update: protectedProcedure
		.input(incomeSourceUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the entry belongs to the user
			const sourceExists = await db
				.select({ id: incomeSources.id })
				.from(incomeSources)
				.where(
					and(
						eq(incomeSources.id, input.id),
						eq(incomeSources.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!sourceExists.length) {
				throw new Error("Income source not found or not owned by user");
			}

			const result = await db
				.update(incomeSources)
				.set({
					name: input.name,
					amount: input.amount,
					currency: input.currency,
					type: input.type,
					taxPercentage: input.taxPercentage,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(incomeSources.id, input.id),
						eq(incomeSources.userId, ctx.session.user.id),
					),
				)
				.returning();

			const updatedSource = result[0];
			if (!updatedSource) {
				throw new Error("Income source not found");
			}

			return {
				id: updatedSource.id,
				name: updatedSource.name,
				amount: updatedSource.amount,
				currency: updatedSource.currency,
				type: updatedSource.type as "monthly" | "yearly",
				taxPercentage: updatedSource.taxPercentage,
			};
		}),

	/**
	 * Delete an income source
	 */
	delete: protectedProcedure
		.input(incomeSourceDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			const sourceToDelete = await db
				.select()
				.from(incomeSources)
				.where(
					and(
						eq(incomeSources.id, input.id),
						eq(incomeSources.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!sourceToDelete.length) {
				throw new Error("Income source not found or not owned by user");
			}

			await db
				.delete(incomeSources)
				.where(
					and(
						eq(incomeSources.id, input.id),
						eq(incomeSources.userId, ctx.session.user.id),
					),
				);

			const deletedSource = sourceToDelete[0];
			if (!deletedSource) {
				throw new Error("Income source not found");
			}

			return {
				id: deletedSource.id,
				name: deletedSource.name,
				amount: deletedSource.amount,
				currency: deletedSource.currency,
				type: deletedSource.type as "monthly" | "yearly",
				taxPercentage: deletedSource.taxPercentage,
			};
		}),
});
