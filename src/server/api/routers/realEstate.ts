import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { realEstateEntries } from "~/server/db/schema";

// Input schemas for validation
const propertyCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string().default("RON"),
	date: z.string().min(1, "Date is required"),
});

const propertyUpdateSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string(),
	date: z.string().min(1, "Date is required"),
});

const propertyDeleteSchema = z.object({
	id: z.number(),
});

export const realEstateRouter = createTRPCRouter({
	/**
	 * Get real estate data
	 */
	getData: protectedProcedure.query(async ({ ctx }) => {
		const entries = await db
			.select()
			.from(realEstateEntries)
			.where(eq(realEstateEntries.userId, ctx.session.user.id));

		return entries.map((entry) => ({
			...entry,
			// Convert numeric value back to actual decimal value
			value: entry.value,
		}));
	}),

	/**
	 * Create a new property
	 */
	create: protectedProcedure
		.input(propertyCreateSchema)
		.mutation(async ({ ctx, input }) => {
			const result = await db
				.insert(realEstateEntries)
				.values({
					userId: ctx.session.user.id,
					name: input.name,
					value: input.value,
					currency: input.currency,
					date: input.date,
				})
				.returning();

			const newEntry = result[0];
			if (!newEntry) {
				throw new Error("Failed to create property");
			}

			return {
				...newEntry,
				// Convert numeric value back to actual decimal value
				value: newEntry.value,
			};
		}),

	/**
	 * Update an existing property
	 */
	update: protectedProcedure
		.input(propertyUpdateSchema)
		.mutation(async ({ ctx, input }) => {
			// First verify the entry belongs to the user
			const entryExists = await db
				.select({ id: realEstateEntries.id })
				.from(realEstateEntries)
				.where(
					and(
						eq(realEstateEntries.id, input.id),
						eq(realEstateEntries.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryExists.length) {
				throw new Error("Property not found or not owned by user");
			}

			const result = await db
				.update(realEstateEntries)
				.set({
					name: input.name,
					value: input.value,
					currency: input.currency,
					date: input.date,
					updatedAt: new Date(),
				})
				.where(
					and(
						eq(realEstateEntries.id, input.id),
						eq(realEstateEntries.userId, ctx.session.user.id),
					),
				)
				.returning();

			const updatedEntry = result[0];
			if (!updatedEntry) {
				throw new Error("Property not found");
			}

			return {
				...updatedEntry,
				// Convert numeric value back to actual decimal value
				value: updatedEntry.value,
			};
		}),

	/**
	 * Delete a property
	 */
	delete: protectedProcedure
		.input(propertyDeleteSchema)
		.mutation(async ({ ctx, input }) => {
			const entryToDelete = await db
				.select()
				.from(realEstateEntries)
				.where(
					and(
						eq(realEstateEntries.id, input.id),
						eq(realEstateEntries.userId, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!entryToDelete.length) {
				throw new Error("Property not found or not owned by user");
			}

			await db
				.delete(realEstateEntries)
				.where(
					and(
						eq(realEstateEntries.id, input.id),
						eq(realEstateEntries.userId, ctx.session.user.id),
					),
				);

			const deletedEntry = entryToDelete[0];
			if (!deletedEntry) {
				throw new Error("Property not found");
			}

			return {
				...deletedEntry,
				// Convert numeric value back to actual decimal value
				value: deletedEntry.value,
			};
		}),
});
