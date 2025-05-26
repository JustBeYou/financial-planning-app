import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the real estate widget
let mockRealEstate = [
	{
		id: 1,
		name: "Primary Residence",
		value: 450000,
		currency: "RON",
		date: "2023-10-15",
	},
	{
		id: 2,
		name: "Rental Apartment",
		value: 320000,
		currency: "RON",
		date: "2023-11-01",
	},
	{
		id: 3,
		name: "Vacation Property",
		value: 280000,
		currency: "RON",
		date: "2023-09-20",
	},
	{
		id: 4,
		name: "Land Investment",
		value: 150000,
		currency: "RON",
		date: "2023-08-05",
	},
];

// Helper function to generate a new ID
const generateNewId = () => {
	const maxId = mockRealEstate.reduce(
		(max, property) => (property.id > max ? property.id : max),
		0,
	);
	return maxId + 1;
};

// Input schemas for validation
const propertyCreateSchema = z.object({
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string().default("RON"),
	date: z.string().min(1, "Date is required"),
});

const propertyUpdateSchema = z.object({
	id: z.number(),
	name: z.string().min(1, "Name is required"),
	value: z.number().positive("Value must be positive"),
	currency: z.string(),
	date: z.string().min(1, "Date is required"),
});

const propertyDeleteSchema = z.object({
	id: z.number(),
});

export const realEstateRouter = createTRPCRouter({
	/**
	 * Get real estate data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockRealEstate;
	}),

	/**
	 * Create a new property
	 */
	create: publicProcedure.input(propertyCreateSchema).mutation(({ input }) => {
		const newProperty = {
			id: generateNewId(),
			...input,
		};
		mockRealEstate.push(newProperty);
		return newProperty;
	}),

	/**
	 * Update an existing property
	 */
	update: publicProcedure.input(propertyUpdateSchema).mutation(({ input }) => {
		const index = mockRealEstate.findIndex(
			(property) => property.id === input.id,
		);
		if (index === -1) {
			throw new Error("Property not found");
		}
		mockRealEstate[index] = input;
		return input;
	}),

	/**
	 * Delete a property
	 */
	delete: publicProcedure.input(propertyDeleteSchema).mutation(({ input }) => {
		const index = mockRealEstate.findIndex(
			(property) => property.id === input.id,
		);
		if (index === -1) {
			throw new Error("Property not found");
		}
		const deleted = mockRealEstate[index];
		mockRealEstate = mockRealEstate.filter(
			(property) => property.id !== input.id,
		);
		return deleted;
	}),
});
