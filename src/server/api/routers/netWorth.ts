import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the net worth widget
const mockNetWorthData = {
	total: 250000,
	categories: [
		{ name: "Cash & Deposits", value: 50000, color: "#4CAF50" },
		{ name: "Investments", value: 150000, color: "#2196F3" },
		{ name: "Real Estate", value: 300000, color: "#FF9800" },
		{ name: "Debt", value: -250000, color: "#F44336" },
	],
};

export const netWorthRouter = createTRPCRouter({
	/**
	 * Get net worth data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockNetWorthData;
	}),
});
