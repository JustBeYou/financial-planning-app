import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the investments widget
let mockInvestments = [
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

// Helper function to generate a new ID
const generateNewId = () => {
	const maxId = mockInvestments.reduce(
		(max, investment) => (investment.id > max ? investment.id : max),
		0,
	);
	return maxId + 1;
};

// Input schemas for validation
const investmentCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string().default("RON"),
	date: z.string().min(1, "Date is required"),
	estimatedYearlyInterest: z.number().min(0, "Interest rate must be non-negative"),
});

const investmentUpdateSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string(),
	date: z.string().min(1, "Date is required"),
	estimatedYearlyInterest: z.number().min(0, "Interest rate must be non-negative"),
});

const investmentDeleteSchema = z.object({
	id: z.number(),
});

export const investmentsRouter = createTRPCRouter({
	/**
	 * Get investments data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockInvestments;
	}),

	/**
	 * Create a new investment
	 */
	create: publicProcedure
		.input(investmentCreateSchema)
		.mutation(({ input }) => {
			const newInvestment = {
				id: generateNewId(),
				...input,
			};
			mockInvestments.push(newInvestment);
			return newInvestment;
		}),

	/**
	 * Update an existing investment
	 */
	update: publicProcedure
		.input(investmentUpdateSchema)
		.mutation(({ input }) => {
			const index = mockInvestments.findIndex((investment) => investment.id === input.id);
			if (index === -1) {
				throw new Error("Investment not found");
			}
			mockInvestments[index] = input;
			return input;
		}),

	/**
	 * Delete an investment
	 */
	delete: publicProcedure
		.input(investmentDeleteSchema)
		.mutation(({ input }) => {
			const index = mockInvestments.findIndex((investment) => investment.id === input.id);
			if (index === -1) {
				throw new Error("Investment not found");
			}
			const deleted = mockInvestments[index];
			mockInvestments = mockInvestments.filter((investment) => investment.id !== input.id);
			return deleted;
		}),
});
