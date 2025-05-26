import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

// Mock data for the real estate widget
const mockRealEstate = [
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

export const realEstateRouter = createTRPCRouter({
	/**
	 * Get real estate data
	 */
	getData: publicProcedure.query(() => {
		// For now, return the mock data
		// This will be replaced with actual database queries later
		return mockRealEstate;
	}),
});
