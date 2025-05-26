import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the debt widget
let mockDebts = [
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

// Input schemas for validation
const debtCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string().default("RON"),
	interestRate: z.number().min(0, "Interest rate must be non-negative"),
	lengthMonths: z.number().positive("Length must be positive"),
});

const debtUpdateSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string(),
	interestRate: z.number().min(0, "Interest rate must be non-negative"),
	lengthMonths: z.number().positive("Length must be positive"),
});

const debtDeleteSchema = z.object({
	id: z.number(),
});

// Helper function to generate a new ID
const generateNewId = () => {
	const maxId = mockDebts.reduce((max, debt) => (debt.id > max ? debt.id : max), 0);
	return maxId + 1;
};

export const debtRouter = createTRPCRouter({
	/**
	 * Get debt data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockDebts;
	}),

	/**
	 * Create a new debt
	 */
	create: publicProcedure
		.input(debtCreateSchema)
		.mutation(({ input }) => {
			const newDebt = {
				id: generateNewId(),
				...input,
			};
			mockDebts.push(newDebt);
			return newDebt;
		}),

	/**
	 * Update an existing debt
	 */
	update: publicProcedure
		.input(debtUpdateSchema)
		.mutation(({ input }) => {
			const index = mockDebts.findIndex((debt) => debt.id === input.id);
			if (index === -1) {
				throw new Error("Debt not found");
			}
			mockDebts[index] = input;
			return input;
		}),

	/**
	 * Delete a debt
	 */
	delete: publicProcedure
		.input(debtDeleteSchema)
		.mutation(({ input }) => {
			const index = mockDebts.findIndex((debt) => debt.id === input.id);
			if (index === -1) {
				throw new Error("Debt not found");
			}
			const deleted = mockDebts[index];
			mockDebts = mockDebts.filter((debt) => debt.id !== input.id);
			return deleted;
		}),
});
