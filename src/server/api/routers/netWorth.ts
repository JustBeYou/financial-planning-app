import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import {
	cashEntries,
	debtEntries,
	depositEntries,
	investments,
	realEstateEntries,
} from "~/server/db/schema";

export const netWorthRouter = createTRPCRouter({
	/**
	 * Get net worth data by aggregating values from all financial categories
	 */
	getData: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		// Get sum of cash entries
		const cashResult = await db
			.select({
				total: sql`sum(${cashEntries.amount})`.mapWith(Number),
			})
			.from(cashEntries)
			.where(eq(cashEntries.userId, userId));
		const cashTotal = cashResult[0]?.total ?? 0;

		// Get sum of investments
		const investmentsResult = await db
			.select({
				total: sql`sum(${investments.value})`.mapWith(Number),
			})
			.from(investments)
			.where(eq(investments.userId, userId));
		const investmentsTotal = investmentsResult[0]?.total ?? 0;

		// Get sum of real estate
		const realEstateResult = await db
			.select({
				total: sql`sum(${realEstateEntries.value})`.mapWith(Number),
			})
			.from(realEstateEntries)
			.where(eq(realEstateEntries.userId, userId));
		const realEstateTotal = realEstateResult[0]?.total ?? 0;

		// Get sum of deposits
		const depositsResult = await db
			.select({
				total: sql`sum(${depositEntries.amount})`.mapWith(Number),
			})
			.from(depositEntries)
			.where(eq(depositEntries.userId, userId));
		const depositsTotal = depositsResult[0]?.total ?? 0;

		// Get sum of debt (negative value for net worth)
		const debtResult = await db
			.select({
				total: sql`sum(${debtEntries.amount})`.mapWith(Number),
			})
			.from(debtEntries)
			.where(eq(debtEntries.userId, userId));
		const debtTotal = debtResult[0]?.total ?? 0;

		// Calculate total net worth
		const totalNetWorth =
			cashTotal +
			investmentsTotal +
			realEstateTotal +
			depositsTotal -
			debtTotal;

		return {
			total: totalNetWorth,
			categories: [
				{
					name: "Cash & Deposits",
					value: cashTotal + depositsTotal,
					color: "#4CAF50",
				},
				{ name: "Investments", value: investmentsTotal, color: "#2196F3" },
				{ name: "Real Estate", value: realEstateTotal, color: "#FF9800" },
				{ name: "Debt", value: debtTotal, color: "#F44336", isNegative: true },
			],
		};
	}),
});
