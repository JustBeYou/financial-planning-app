import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { budgetAllocations, spendings } from "~/server/db/schema";

// Input schemas for validation
const spendingCreateSchema = z.object({
	allocationId: z.number().int().positive("Allocation ID is required"),
	name: z.string().min(1, "Name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string().default("RON"),
	date: z.string().min(1, "Date is required"),
	description: z.string().optional(),
	category: z.string().optional(),
});

const spendingUpdateSchema = z.object({
	id: z.number().int().positive(),
	allocationId: z.number().int().positive("Allocation ID is required"),
	name: z.string().min(1, "Name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string(),
	date: z.string().min(1, "Date is required"),
	description: z.string().optional(),
	category: z.string().optional(),
});

const spendingDeleteSchema = z.object({
	id: z.number().int().positive(),
});

const getByAllocationSchema = z.object({
	allocationId: z.number().int().positive(),
});

export const spendingRouter = createTRPCRouter({
	/**
	 * Get all spendings for a specific budget allocation
	 */
	getByAllocation: protectedProcedure
		.input(getByAllocationSchema)
		.query(async ({ ctx, input }) => {
			// First verify the allocation belongs to the user
			const allocation = await db
				.select({ id: budgetAllocations.id })
				.from(budgetAllocations)
				.where(
					and(
						eq(budgetAllocations.id, input.allocationId),
						eq(budgetAllocations.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!allocation.length) {
				throw new Error("Budget allocation not found or not owned by user");
			}

			const spendingEntries = await db
				.select()
				.from(spendings)
				.where(eq(spendings.allocationId, input.allocationId));

			return spendingEntries.map((spending) => ({
				id: spending.id,
				allocationId: spending.allocationId,
				name: spending.name,
				amount: spending.amount,
				currency: spending.currency,
				date: spending.date,
				description: spending.description,
				category: spending.category,
				createdAt: spending.createdAt,
				updatedAt: spending.updatedAt,
			}));
		}),

	/**
	 * Get all spendings for all user's budget allocations
	 */
	getAll: protectedProcedure.query(async ({ ctx }) => {
		const spendingEntries = await db
			.select({
				id: spendings.id,
				allocationId: spendings.allocationId,
				name: spendings.name,
				amount: spendings.amount,
				currency: spendings.currency,
				date: spendings.date,
				description: spendings.description,
				category: spendings.category,
				createdAt: spendings.createdAt,
				updatedAt: spendings.updatedAt,
			})
			.from(spendings)
			.innerJoin(
				budgetAllocations,
				eq(spendings.allocationId, budgetAllocations.id),
			)
			.where(eq(budgetAllocations.userId, ctx.session.user.id));

		return spendingEntries;
	}),

	/**
	 * Create a new spending
	 */
	create: protectedProcedure
		.input(spendingCreateSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the allocation belongs to the user
			const allocation = await db
				.select({ id: budgetAllocations.id })
				.from(budgetAllocations)
				.where(
					and(
						eq(budgetAllocations.id, input.allocationId),
						eq(budgetAllocations.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!allocation.length) {
				throw new Error("Budget allocation not found or not owned by user");
			}

			const result = await db
				.insert(spendings)
				.values({
					allocationId: input.allocationId,
					name: input.name,
					amount: input.amount,
					currency: input.currency,
					date: input.date,
					description: input.description,
					category: input.category,
				})
				.returning();

			const newSpending = result[0];
			if (!newSpending) {
				throw new Error("Failed to create spending");
			}

			return {
				id: newSpending.id,
				allocationId: newSpending.allocationId,
				name: newSpending.name,
				amount: newSpending.amount,
				currency: newSpending.currency,
				date: newSpending.date,
				description: newSpending.description,
				category: newSpending.category,
				createdAt: newSpending.createdAt,
				updatedAt: newSpending.updatedAt,
			};
		}),

	/**
	 * Update an existing spending
	 */
	update: protectedProcedure
		.input(spendingUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the spending exists and the allocation belongs to the user
			const existingSpending = await db
				.select({
					id: spendings.id,
					allocationId: spendings.allocationId,
				})
				.from(spendings)
				.innerJoin(
					budgetAllocations,
					eq(spendings.allocationId, budgetAllocations.id),
				)
				.where(
					and(
						eq(spendings.id, input.id),
						eq(budgetAllocations.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!existingSpending.length) {
				throw new Error("Spending not found or not owned by user");
			}

			// Also verify the new allocation belongs to the user
			const newAllocation = await db
				.select({ id: budgetAllocations.id })
				.from(budgetAllocations)
				.where(
					and(
						eq(budgetAllocations.id, input.allocationId),
						eq(budgetAllocations.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!newAllocation.length) {
				throw new Error("New budget allocation not found or not owned by user");
			}

			const result = await db
				.update(spendings)
				.set({
					allocationId: input.allocationId,
					name: input.name,
					amount: input.amount,
					currency: input.currency,
					date: input.date,
					description: input.description,
					category: input.category,
					updatedAt: new Date(),
				})
				.where(eq(spendings.id, input.id))
				.returning();

			const updatedSpending = result[0];
			if (!updatedSpending) {
				throw new Error("Spending not found");
			}

			return {
				id: updatedSpending.id,
				allocationId: updatedSpending.allocationId,
				name: updatedSpending.name,
				amount: updatedSpending.amount,
				currency: updatedSpending.currency,
				date: updatedSpending.date,
				description: updatedSpending.description,
				category: updatedSpending.category,
				createdAt: updatedSpending.createdAt,
				updatedAt: updatedSpending.updatedAt,
			};
		}),

	/**
	 * Delete a spending
	 */
	delete: protectedProcedure
		.input(spendingDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the spending exists and belongs to a user's allocation
			const spendingToDelete = await db
				.select({
					id: spendings.id,
					allocationId: spendings.allocationId,
					name: spendings.name,
					amount: spendings.amount,
					currency: spendings.currency,
					date: spendings.date,
					description: spendings.description,
					category: spendings.category,
				})
				.from(spendings)
				.innerJoin(
					budgetAllocations,
					eq(spendings.allocationId, budgetAllocations.id),
				)
				.where(
					and(
						eq(spendings.id, input.id),
						eq(budgetAllocations.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!spendingToDelete.length) {
				throw new Error("Spending not found or not owned by user");
			}

			await db.delete(spendings).where(eq(spendings.id, input.id));

			const deletedSpending = spendingToDelete[0];
			if (!deletedSpending) {
				throw new Error("Spending not found");
			}

			return {
				id: deletedSpending.id,
				allocationId: deletedSpending.allocationId,
				name: deletedSpending.name,
				amount: deletedSpending.amount,
				currency: deletedSpending.currency,
				date: deletedSpending.date,
				description: deletedSpending.description,
				category: deletedSpending.category,
			};
		}),
});
