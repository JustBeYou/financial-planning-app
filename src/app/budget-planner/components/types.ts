export type IncomeType = "monthly" | "yearly";
export type BudgetAllocationType = "monthly" | "yearly";
export type BudgetValueType = "absolute" | "percent";

export interface IncomeSource {
	id: number;
	name: string;
	amount: number;
	currency: string;
	type: IncomeType;
	taxPercentage: number;
}

export interface BudgetAllocation {
	id: number;
	name: string;
	value: number;
	currency: string;
	type: BudgetAllocationType;
	valueType: BudgetValueType;
}

// New spending interface
export interface Spending {
	id: number;
	allocationId: number;
	name: string;
	amount: number;
	currency: string;
	date: string;
	description?: string;
	category?: string;
}

// Extended budget allocation with spending information
export interface BudgetAllocationWithSpendings extends BudgetAllocation {
	spendings: Spending[];
	totalSpent: number;
	remainingAmount: number;
	isRealized: boolean;
}

export interface AllocationItem {
	id: string;
	name: string;
	amount: number;
	percentage: number;
}

// Colors for budget allocation visualization
export const ALLOCATION_COLORS = [
	"bg-red-500",
	"bg-blue-500",
	"bg-green-500",
	"bg-yellow-500",
	"bg-purple-500",
	"bg-orange-500",
	"bg-pink-500",
	"bg-indigo-500",
];

export const REMAINING_COLOR = "bg-green-500";

/**
 * Get a consistent color for a budget allocation based on its ID
 * This ensures the same allocation always gets the same color across components
 */
export function getAllocationColor(allocationId: string | number): string {
	// Convert ID to number and use it as a hash to pick a color
	const id =
		typeof allocationId === "string"
			? Number.parseInt(allocationId, 10)
			: allocationId;
	const colorIndex = id % ALLOCATION_COLORS.length;
	return ALLOCATION_COLORS[colorIndex] ?? "bg-blue-500";
}
