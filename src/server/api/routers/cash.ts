import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the cash entries widget
let mockCashEntries = [
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

// Helper function to generate a new ID
const generateNewId = () => {
	const maxId = mockCashEntries.reduce(
		(max, entry) => (entry.id > max ? entry.id : max),
		0,
	);
	return maxId + 1;
};

// Input schemas for validation
const cashEntryCreateSchema = z.object({
	accountName: z.string().min(1, "Account name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string().default("RON"),
	date: z.string().min(1, "Date is required"),
});

const cashEntryUpdateSchema = z.object({
	id: z.number(),
	accountName: z.string().min(1, "Account name is required"),
	amount: z.number().positive("Amount must be positive"),
	currency: z.string(),
	date: z.string().min(1, "Date is required"),
});

const cashEntryDeleteSchema = z.object({
	id: z.number(),
});

export const cashRouter = createTRPCRouter({
	/**
	 * Get cash entries data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockCashEntries;
	}),

	/**
	 * Create a new cash entry
	 */
	create: publicProcedure
		.input(cashEntryCreateSchema)
		.mutation(({ input }) => {
			const newEntry = {
				id: generateNewId(),
				...input,
			};
			mockCashEntries.push(newEntry);
			return newEntry;
		}),

	/**
	 * Update an existing cash entry
	 */
	update: publicProcedure
		.input(cashEntryUpdateSchema)
		.mutation(({ input }) => {
			const index = mockCashEntries.findIndex((entry) => entry.id === input.id);
			if (index === -1) {
				throw new Error("Cash entry not found");
			}
			mockCashEntries[index] = input;
			return input;
		}),

	/**
	 * Delete a cash entry
	 */
	delete: publicProcedure
		.input(cashEntryDeleteSchema)
		.mutation(({ input }) => {
			const index = mockCashEntries.findIndex((entry) => entry.id === input.id);
			if (index === -1) {
				throw new Error("Cash entry not found");
			}
			const deleted = mockCashEntries[index];
			mockCashEntries = mockCashEntries.filter((entry) => entry.id !== input.id);
			return deleted;
		}),
});
