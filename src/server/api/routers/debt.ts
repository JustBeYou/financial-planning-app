import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the debt widget
const mockDebts = [
	{
		id: 1,
		name: "Mortgage",
		amount: 320000,
		currency: "RON",
		interestRate: 4.25,
		lengthMonths: 240, // 20 years
	},
	{
		id: 2,
		name: "Car Loan",
		amount: 45000,
		currency: "RON",
		interestRate: 5.75,
		lengthMonths: 60, // 5 years
	},
	{
		id: 3,
		name: "Student Loan",
		amount: 25000,
		currency: "RON",
		interestRate: 3.8,
		lengthMonths: 120, // 10 years
	},
	{
		id: 4,
		name: "Personal Loan",
		amount: 12000,
		currency: "RON",
		interestRate: 8.5,
		lengthMonths: 36, // 3 years
	},
	{
		id: 5,
		name: "Credit Card",
		amount: 7500,
		currency: "RON",
		interestRate: 18.9,
		lengthMonths: 12, // 1 year
	},
];

export const debtRouter = createTRPCRouter({
	/**
	 * Get debt data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockDebts;
	}),
});
