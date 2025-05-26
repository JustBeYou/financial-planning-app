import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the investments widget
const mockInvestments = [
	{
		id: 1,
		name: "Stock Portfolio",
		value: 75000,
		currency: "RON",
		date: "2023-11-30",
		estimatedYearlyInterest: 8.5,
	},
	{
		id: 2,
		name: "Index Fund",
		value: 120000,
		currency: "RON",
		date: "2023-11-28",
		estimatedYearlyInterest: 7.2,
	},
	{
		id: 3,
		name: "Corporate Bonds",
		value: 50000,
		currency: "RON",
		date: "2023-10-15",
		estimatedYearlyInterest: 5.8,
	},
	{
		id: 4,
		name: "Real Estate Fund",
		value: 200000,
		currency: "RON",
		date: "2023-09-01",
		estimatedYearlyInterest: 6.5,
	},
	{
		id: 5,
		name: "Cryptocurrency",
		value: 30000,
		currency: "RON",
		date: "2023-11-15",
		estimatedYearlyInterest: 12.0,
	},
];

export const investmentsRouter = createTRPCRouter({
	/**
	 * Get investments data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockInvestments;
	}),
});
