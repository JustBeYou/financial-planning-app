import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { budgetAllocations } from "~/server/db/schema";

// Input schemas for validation
const budgetAllocationCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string().default("RON"),
	type: z.enum(["monthly", "yearly"]).default("monthly"),
	valueType: z.enum(["absolute", "percent"]).default("absolute"),
});

const budgetAllocationUpdateSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string(),
	type: z.enum(["monthly", "yearly"]),
	valueType: z.enum(["absolute", "percent"]),
});

const budgetAllocationDeleteSchema = z.object({
	id: z.number(),
});

export const budgetRouter = createTRPCRouter({
	/**
	 * Get budget allocations data
	 */
	getData: protectedProcedure.query(async ({ ctx }) => {
		const allocations = await db
			.select()
			.from(budgetAllocations)
			.where(eq(budgetAllocations.userId, ctx.session.user.id));

		return allocations.map((allocation) => ({
			id: allocation.id,
			name: allocation.name,
			value: allocation.value,
			currency: allocation.currency,
			type: allocation.type as "monthly" | "yearly",
			valueType: allocation.valueType as "absolute" | "percent",
		}));
	}),

	/**
	 * Create a new budget allocation
	 */
	create: protectedProcedure
		.input(budgetAllocationCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await db
				.insert(budgetAllocations)
				.values({
					userId: ctx.session.user.id,
					name: input.name,
					value: input.value,
					currency: input.currency,
					type: input.type,
					valueType: input.valueType,
				})
				.returning();

			const newAllocation = result[0];
			if (!newAllocation) {
				throw new Error("Failed to create budget allocation");
			}

			return {
				id: newAllocation.id,
				name: newAllocation.name,
				value: newAllocation.value,
				currency: newAllocation.currency,
				type: newAllocation.type as "monthly" | "yearly",
				valueType: newAllocation.valueType as "absolute" | "percent",
			};
		}),

	/**
	 * Update an existing budget allocation
	 */
	update: protectedProcedure
		.input(budgetAllocationUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the entry belongs to the user
			const allocationExists = await db
				.select({ id: budgetAllocations.id })
				.from(budgetAllocations)
				.where(
					and(
						eq(budgetAllocations.id, input.id),
						eq(budgetAllocations.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!allocationExists.length) {
				throw new Error("Budget allocation not found or not owned by user");
			}

			const result = await db
				.update(budgetAllocations)
				.set({
					name: input.name,
					value: input.value,
					currency: input.currency,
					type: input.type,
					valueType: input.valueType,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(budgetAllocations.id, input.id),
						eq(budgetAllocations.userId, ctx.session.user.id),
					),
				)
				.returning();

			const updatedAllocation = result[0];
			if (!updatedAllocation) {
				throw new Error("Budget allocation not found");
			}

			return {
				id: updatedAllocation.id,
				name: updatedAllocation.name,
				value: updatedAllocation.value,
				currency: updatedAllocation.currency,
				type: updatedAllocation.type as "monthly" | "yearly",
				valueType: updatedAllocation.valueType as "absolute" | "percent",
			};
		}),

	/**
	 * Delete a budget allocation
	 */
	delete: protectedProcedure
		.input(budgetAllocationDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			const allocationToDelete = await db
				.select()
				.from(budgetAllocations)
				.where(
					and(
						eq(budgetAllocations.id, input.id),
						eq(budgetAllocations.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!allocationToDelete.length) {
				throw new Error("Budget allocation not found or not owned by user");
			}

			await db
				.delete(budgetAllocations)
				.where(
					and(
						eq(budgetAllocations.id, input.id),
						eq(budgetAllocations.userId, ctx.session.user.id),
					),
				);

			const deletedAllocation = allocationToDelete[0];
			if (!deletedAllocation) {
				throw new Error("Budget allocation not found");
			}

			return {
				id: deletedAllocation.id,
				name: deletedAllocation.name,
				value: deletedAllocation.value,
				currency: deletedAllocation.currency,
				type: deletedAllocation.type as "monthly" | "yearly",
				valueType: deletedAllocation.valueType as "absolute" | "percent",
			};
		}),
});
