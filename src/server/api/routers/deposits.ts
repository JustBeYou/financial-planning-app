import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the deposits widget
let mockDeposits = [
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

// Helper function to calculate maturity date
const calculateMaturityDate = (startDate: string, lengthMonths: number): string => {
	const date = new Date(startDate);
	date.setMonth(date.getMonth() + lengthMonths);
	return date.toISOString().split("T")[0];
};

// Helper function to generate a new ID
const generateNewId = () => {
	const maxId = mockDeposits.reduce(
		(max, deposit) => (deposit.id > max ? deposit.id : max),
		0,
	);
	return maxId + 1;
};

// Input schemas for validation
const depositCreateSchema = z.object({
	bankName: z.string().min(1, "Bank name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string().default("RON"),
	startDate: z.string().min(1, "Start date is required"),
	interest: z.number().min(0, "Interest rate must be non-negative"),
	lengthMonths: z.number().positive("Length must be positive"),
});

const depositUpdateSchema = z.object({
	id: z.number(),
	bankName: z.string().min(1, "Bank name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string(),
	startDate: z.string().min(1, "Start date is required"),
	interest: z.number().min(0, "Interest rate must be non-negative"),
	lengthMonths: z.number().positive("Length must be positive"),
});

const depositDeleteSchema = z.object({
	id: z.number(),
});

export const depositsRouter = createTRPCRouter({
	/**
	 * Get deposits data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockDeposits;
	}),

	/**
	 * Create a new deposit
	 */
	create: publicProcedure
		.input(depositCreateSchema)
		.mutation(({ input }) => {
			const maturityDate = calculateMaturityDate(
				input.startDate,
				input.lengthMonths,
			);

			const newDeposit = {
				id: generateNewId(),
				...input,
				maturityDate,
			};

			mockDeposits.push(newDeposit);
			return newDeposit;
		}),

	/**
	 * Update an existing deposit
	 */
	update: publicProcedure
		.input(depositUpdateSchema)
		.mutation(({ input }) => {
			const index = mockDeposits.findIndex((deposit) => deposit.id === input.id);
			if (index === -1) {
				throw new Error("Deposit not found");
			}

			const maturityDate = calculateMaturityDate(
				input.startDate,
				input.lengthMonths,
			);

			const updatedDeposit = {
				...input,
				maturityDate,
			};

			mockDeposits[index] = updatedDeposit;
			return updatedDeposit;
		}),

	/**
	 * Delete a deposit
	 */
	delete: publicProcedure
		.input(depositDeleteSchema)
		.mutation(({ input }) => {
			const index = mockDeposits.findIndex((deposit) => deposit.id === input.id);
			if (index === -1) {
				throw new Error("Deposit not found");
			}
			const deleted = mockDeposits[index];
			mockDeposits = mockDeposits.filter((deposit) => deposit.id !== input.id);
			return deleted;
		}),
});
