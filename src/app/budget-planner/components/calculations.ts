import type { AllocationItem, BudgetAllocation, IncomeSource } from "./types";

/**
 * Calculate the total monthly income after tax
 */
export function calculateTotalMonthlyIncome(
	incomeSources: IncomeSource[],
): number {
	return incomeSources.reduce((total, source) => {
		const amount = source.amount * (1 - source.taxPercentage / 100);
		return total + (source.type === "monthly" ? amount : amount / 12);
	}, 0);
}

/**
 * Calculate the total yearly income after tax
 */
export function calculateTotalYearlyIncome(
	incomeSources: IncomeSource[],
): number {
	return incomeSources.reduce((total, source) => {
		const amount = source.amount * (1 - source.taxPercentage / 100);
		return total + (source.type === "yearly" ? amount : amount * 12);
	}, 0);
}

/**
 * Calculate total monthly budget from all allocations
 */
export function calculateTotalMonthlyBudget(
	budgetAllocations: BudgetAllocation[],
	totalMonthlyIncome: number,
	totalYearlyIncome: number,
): number {
	return budgetAllocations.reduce((total, allocation) => {
		// For absolute values
		if (allocation.valueType === "absolute") {
			// For monthly allocations, add the full amount
			if (allocation.type === "monthly") {
				return total + allocation.value;
			}
			// For yearly allocations, convert to monthly (divide by 12)
			return total + allocation.value / 12;
		}
		// For percentage values
		// For monthly allocations, calculate percentage of monthly income
		if (allocation.type === "monthly") {
			return total + (totalMonthlyIncome * allocation.value) / 100;
		}
		// For yearly allocations, calculate percentage of yearly income and convert to monthly
		return total + (totalYearlyIncome * allocation.value) / 100 / 12;
	}, 0);
}

/**
 * Calculate total yearly budget from all allocations
 */
export function calculateTotalYearlyBudget(
	budgetAllocations: BudgetAllocation[],
	totalMonthlyIncome: number,
	totalYearlyIncome: number,
): number {
	return budgetAllocations.reduce((total, allocation) => {
		// For absolute values
		if (allocation.valueType === "absolute") {
			// For yearly allocations, add the full amount
			if (allocation.type === "yearly") {
				return total + allocation.value;
			}
			// For monthly allocations, convert to yearly (multiply by 12)
			return total + allocation.value * 12;
		}
		// For percentage values
		// For yearly allocations, calculate percentage of yearly income
		if (allocation.type === "yearly") {
			return total + (totalYearlyIncome * allocation.value) / 100;
		}
		// For monthly allocations, calculate percentage of monthly income and convert to yearly
		return total + ((totalMonthlyIncome * allocation.value) / 100) * 12;
	}, 0);
}

/**
 * Calculate monthly allocations for visualization
 */
export function calculateMonthlyAllocations(
	budgetAllocations: BudgetAllocation[],
	totalMonthlyIncome: number,
	totalYearlyIncome: number,
): AllocationItem[] {
	return budgetAllocations.map((allocation) => {
		let amount: number;

		// Calculate the effective monthly amount
		if (allocation.valueType === "absolute") {
			amount =
				allocation.type === "monthly"
					? allocation.value
					: allocation.value / 12;
		} else {
			amount =
				allocation.type === "monthly"
					? (totalMonthlyIncome * allocation.value) / 100
					: (totalYearlyIncome * allocation.value) / 100 / 12;
		}

		// Calculate percentage of monthly income
		const percentage =
			totalMonthlyIncome > 0 ? (amount / totalMonthlyIncome) * 100 : 0;

		return {
			id: allocation.id.toString(),
			name: allocation.name,
			amount,
			percentage,
		};
	});
}

/**
 * Calculate yearly allocations for visualization
 */
export function calculateYearlyAllocations(
	budgetAllocations: BudgetAllocation[],
	totalMonthlyIncome: number,
	totalYearlyIncome: number,
): AllocationItem[] {
	return budgetAllocations.map((allocation) => {
		let amount: number;

		// Calculate the effective yearly amount
		if (allocation.valueType === "absolute") {
			amount =
				allocation.type === "yearly" ? allocation.value : allocation.value * 12;
		} else {
			amount =
				allocation.type === "yearly"
					? (totalYearlyIncome * allocation.value) / 100
					: ((totalMonthlyIncome * allocation.value) / 100) * 12;
		}

		// Calculate percentage of yearly income
		const percentage =
			totalYearlyIncome > 0 ? (amount / totalYearlyIncome) * 100 : 0;

		return {
			id: allocation.id.toString(),
			name: allocation.name,
			amount,
			percentage,
		};
	});
}
