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
} from "~/server/db/schema";

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

			// Budget allocations
			ctx.db.query.budgetAllocations.findMany({
				where: eq(budgetAllocations.userId, userId),
			}),
		]);

		// Return all data in a structured format
		return {
			cash: cashData,
			investments: investmentsData,
			realEstate: realEstateData,
			debt: debtData,
			deposits: depositData,
			income: incomeData,
			budget: budgetData,
			exportDate: new Date().toISOString(),
		};
	}),
});
