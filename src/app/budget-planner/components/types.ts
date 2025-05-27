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

export interface AllocationItem {
	id: string;
	name: string;
	amount: number;
	percentage: number;
}

// Colors for budget allocation visualization
export const ALLOCATION_COLORS = [
	"bg-blue-500",
	"bg-purple-500",
	"bg-pink-500",
	"bg-indigo-500",
	"bg-cyan-500",
	"bg-teal-500",
	"bg-orange-500",
	"bg-amber-500",
];

export const REMAINING_COLOR = "bg-green-500";
