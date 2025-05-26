import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the deposits widget
const mockDeposits = [
	{
		id: 1,
		bankName: "First Bank",
		amount: 50000,
		currency: "RON",
		startDate: "2023-10-01",
		interest: 5.25,
		lengthMonths: 12,
		maturityDate: "2024-10-01",
	},
	{
		id: 2,
		bankName: "Credit Union",
		amount: 25000,
		currency: "RON",
		startDate: "2023-11-15",
		interest: 4.75,
		lengthMonths: 6,
		maturityDate: "2024-05-15",
	},
	{
		id: 3,
		bankName: "National Bank",
		amount: 100000,
		currency: "RON",
		startDate: "2023-09-10",
		interest: 6.0,
		lengthMonths: 24,
		maturityDate: "2025-09-10",
	},
	{
		id: 4,
		bankName: "City Bank",
		amount: 30000,
		currency: "RON",
		startDate: "2023-12-01",
		interest: 5.5,
		lengthMonths: 18,
		maturityDate: "2025-06-01",
	},
];

export const depositsRouter = createTRPCRouter({
	/**
	 * Get deposits data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockDeposits;
	}),
});
