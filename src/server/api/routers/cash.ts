import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the cash entries widget
const mockCashEntries = [
	{
		id: 1,
		accountName: "Savings Account",
		amount: 15000,
		currency: "RON",
		date: "2023-11-15",
	},
	{
		id: 2,
		accountName: "Checking Account",
		amount: 3500,
		currency: "RON",
		date: "2023-11-20",
	},
	{
		id: 3,
		accountName: "Emergency Fund",
		amount: 25000,
		currency: "RON",
		date: "2023-10-05",
	},
	{
		id: 4,
		accountName: "Vacation Fund",
		amount: 7500,
		currency: "RON",
		date: "2023-11-01",
	},
	{
		id: 5,
		accountName: "Cash at Home",
		amount: 1200,
		currency: "RON",
		date: "2023-11-25",
	},
];

export const cashRouter = createTRPCRouter({
	/**
	 * Get cash entries data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockCashEntries;
	}),
});
