import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
	budgetAllocations,
	cashEntries,
	debtEntries,
	depositEntries,
	incomeSources,
	investments,
	realEstateEntries,
	spendings,
} from "~/server/db/schema";

// Define the import data schema
const importDataSchema = z.object({
	cash: z
		.array(
			z.object({
				accountName: z.string(),
				amount: z.number(),
				currency: z.string(),
				date: z.string(),
			}),
		)
		.optional(),
	investments: z
		.array(
			z.object({
				name: z.string(),
				value: z.number(),
				currency: z.string(),
				date: z.string(),
				estimatedYearlyInterest: z.number(),
			}),
		)
		.optional(),
	realEstate: z
		.array(
			z.object({
				name: z.string(),
				value: z.number(),
				currency: z.string(),
				date: z.string(),
			}),
		)
		.optional(),
	debt: z
		.array(
			z.object({
				name: z.string(),
				amount: z.number(),
				currency: z.string(),
				interestRate: z.number(),
				lengthMonths: z.number(),
			}),
		)
		.optional(),
	deposits: z
		.array(
			z.object({
				bankName: z.string(),
				amount: z.number(),
				currency: z.string(),
				startDate: z.string(),
				interest: z.number(),
				lengthMonths: z.number(),
				maturityDate: z.string(),
			}),
		)
		.optional(),
	income: z
		.array(
			z.object({
				name: z.string(),
				amount: z.number(),
				currency: z.string(),
				type: z.string(),
				taxPercentage: z.number(),
			}),
		)
		.optional(),
	budget: z
		.array(
			z.object({
				name: z.string(),
				value: z.number(),
				currency: z.string(),
				type: z.string(),
				valueType: z.string(),
				spendings: z
					.array(
						z.object({
							name: z.string(),
							amount: z.number(),
							currency: z.string(),
							date: z.string(),
							description: z.string().nullable().optional(),
							category: z.string().nullable().optional(),
						}),
					)
					.optional(),
			}),
		)
		.optional(),
});

// Define a type for database items with ID fields
interface WithIdFields {
	id: string | number;
	userId: string;
	[key: string]: unknown;
}

// Helper function to remove id and userId fields
const removeInternalFields = <T extends Record<string, unknown>>(
	items: T[],
): Partial<T>[] => {
	return items.map((item) => {
		// Use type assertion with unknown as intermediate step
		const itemWithId = item as unknown as {
			id: unknown;
			userId: unknown;
			[key: string]: unknown;
		};
		const { id, userId, ...rest } = itemWithId;
		return rest as Partial<T>;
	});
};

export const exportRouter = createTRPCRouter({
	getUserData: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Fetch all user data in parallel
		const [
			cashData,
			investmentsData,
			realEstateData,
			debtData,
			depositData,
			incomeData,
			budgetData,
		] = await Promise.all([
			// Cash entries
			ctx.db.query.cashEntries.findMany({
				where: eq(cashEntries.userId, userId),
			}),

			// Investments
			ctx.db.query.investments.findMany({
				where: eq(investments.userId, userId),
			}),

			// Real estate
			ctx.db.query.realEstateEntries.findMany({
				where: eq(realEstateEntries.userId, userId),
			}),

			// Debt
			ctx.db.query.debtEntries.findMany({
				where: eq(debtEntries.userId, userId),
			}),

			// Deposits
			ctx.db.query.depositEntries.findMany({
				where: eq(depositEntries.userId, userId),
			}),

			// Income sources
			ctx.db.query.incomeSources.findMany({
				where: eq(incomeSources.userId, userId),
			}),

			// Budget allocations with spendings
			ctx.db.query.budgetAllocations.findMany({
				where: eq(budgetAllocations.userId, userId),
				with: {
					spendings: true,
				},
			}),
		]);

		// Process budget data to include spendings and remove internal fields
		const processedBudgetData = budgetData.map((allocation) => ({
			name: allocation.name,
			value: allocation.value,
			currency: allocation.currency,
			type: allocation.type,
			valueType: allocation.valueType,
			spendings:
				allocation.spendings?.map((spending) => ({
					name: spending.name,
					amount: spending.amount,
					currency: spending.currency,
					date: spending.date,
					description: spending.description,
					category: spending.category,
				})) || [],
		}));

		// Return all data in a structured format with internal fields removed
		return {
			cash: removeInternalFields(cashData),
			investments: removeInternalFields(investmentsData),
			realEstate: removeInternalFields(realEstateData),
			debt: removeInternalFields(debtData),
			deposits: removeInternalFields(depositData),
			income: removeInternalFields(incomeData),
			budget: processedBudgetData,
			exportDate: new Date().toISOString(),
		};
	}),

	importUserData: protectedProcedure
		.input(importDataSchema)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;
			const db = ctx.db;

			// Use a transaction to ensure data consistency
			return await db.transaction(async (tx) => {
				// First, delete all existing user data
				// Note: spendings will be deleted automatically due to cascade delete when budget allocations are deleted
				await Promise.all([
					tx.delete(cashEntries).where(eq(cashEntries.userId, userId)),
					tx.delete(investments).where(eq(investments.userId, userId)),
					tx
						.delete(realEstateEntries)
						.where(eq(realEstateEntries.userId, userId)),
					tx.delete(debtEntries).where(eq(debtEntries.userId, userId)),
					tx.delete(depositEntries).where(eq(depositEntries.userId, userId)),
					tx.delete(incomeSources).where(eq(incomeSources.userId, userId)),
					tx
						.delete(budgetAllocations)
						.where(eq(budgetAllocations.userId, userId)),
				]);

				// Then import the new data
				// Import cash entries
				if (input.cash && input.cash.length > 0) {
					for (const entry of input.cash) {
						await tx.insert(cashEntries).values({
							userId,
							accountName: entry.accountName,
							amount: entry.amount,
							currency: entry.currency,
							date: entry.date,
						});
					}
				}

				// Import investments
				if (input.investments && input.investments.length > 0) {
					for (const entry of input.investments) {
						await tx.insert(investments).values({
							userId,
							name: entry.name,
							value: entry.value,
							currency: entry.currency,
							date: entry.date,
							estimatedYearlyInterest: entry.estimatedYearlyInterest,
						});
					}
				}

				// Import real estate
				if (input.realEstate && input.realEstate.length > 0) {
					for (const entry of input.realEstate) {
						await tx.insert(realEstateEntries).values({
							userId,
							name: entry.name,
							value: entry.value,
							currency: entry.currency,
							date: entry.date,
						});
					}
				}

				// Import debt
				if (input.debt && input.debt.length > 0) {
					for (const entry of input.debt) {
						await tx.insert(debtEntries).values({
							userId,
							name: entry.name,
							amount: entry.amount,
							currency: entry.currency,
							interestRate: entry.interestRate,
							lengthMonths: entry.lengthMonths,
						});
					}
				}

				// Import deposits
				if (input.deposits && input.deposits.length > 0) {
					for (const entry of input.deposits) {
						await tx.insert(depositEntries).values({
							userId,
							bankName: entry.bankName,
							amount: entry.amount,
							currency: entry.currency,
							startDate: entry.startDate,
							interest: entry.interest,
							lengthMonths: entry.lengthMonths,
							maturityDate: entry.maturityDate,
						});
					}
				}

				// Import income sources
				if (input.income && input.income.length > 0) {
					for (const entry of input.income) {
						await tx.insert(incomeSources).values({
							userId,
							name: entry.name,
							amount: entry.amount,
							currency: entry.currency,
							type: entry.type,
							taxPercentage: entry.taxPercentage,
						});
					}
				}

				// Import budget allocations with their spendings
				if (input.budget && input.budget.length > 0) {
					for (const entry of input.budget) {
						const result = await tx
							.insert(budgetAllocations)
							.values({
								userId,
								name: entry.name,
								value: entry.value,
								currency: entry.currency,
								type: entry.type,
								valueType: entry.valueType,
							})
							.returning({ id: budgetAllocations.id });

						// Import spendings for this budget allocation
						if (result[0] && entry.spendings && entry.spendings.length > 0) {
							const allocationId = result[0].id;
							for (const spending of entry.spendings) {
								await tx.insert(spendings).values({
									allocationId,
									name: spending.name,
									amount: spending.amount,
									currency: spending.currency,
									date: spending.date,
									description: spending.description,
									category: spending.category,
								});
							}
						}
					}
				}

				return {
					success: true,
					message: "Data imported successfully",
					importDate: new Date().toISOString(),
				};
			});
		}),
});
