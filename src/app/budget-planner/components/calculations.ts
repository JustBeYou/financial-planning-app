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
 * Calculate the total monthly budget
 */
export function calculateTotalMonthlyBudget(
	budgetAllocations: BudgetAllocation[],
	totalMonthlyIncome: number,
	totalYearlyIncome: number,
): number {
	return budgetAllocations.reduce((total, allocation) => {
		if (allocation.type === "monthly") {
			if (allocation.valueType === "absolute") {
				return total + allocation.value;
			}
			// Percentage of monthly income
			return total + (totalMonthlyIncome * allocation.value) / 100;
		}

		// Yearly allocation converted to monthly
		if (allocation.valueType === "absolute") {
			return total + allocation.value / 12;
		}
		// Percentage of yearly income converted to monthly
		return total + (totalYearlyIncome * allocation.value) / 100 / 12;
	}, 0);
}

/**
 * Calculate the total yearly budget
 */
export function calculateTotalYearlyBudget(
	budgetAllocations: BudgetAllocation[],
	totalMonthlyIncome: number,
	totalYearlyIncome: number,
): number {
	return budgetAllocations.reduce((total, allocation) => {
		if (allocation.type === "yearly") {
			if (allocation.valueType === "absolute") {
				return total + allocation.value;
			}
			// Percentage of yearly income
			return total + (totalYearlyIncome * allocation.value) / 100;
		}

		// Monthly allocation converted to yearly
		if (allocation.valueType === "absolute") {
			return total + allocation.value * 12;
		}
		// Percentage of monthly income converted to yearly
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
		let effectiveAmount: number;
		if (allocation.type === "monthly") {
			if (allocation.valueType === "absolute") {
				effectiveAmount = allocation.value;
			} else {
				effectiveAmount = (totalMonthlyIncome * allocation.value) / 100;
			}
		} else {
			// Yearly to monthly
			if (allocation.valueType === "absolute") {
				effectiveAmount = allocation.value / 12;
			} else {
				effectiveAmount = (totalYearlyIncome * allocation.value) / 100 / 12;
			}
		}
		return {
			id: allocation.id,
			name: allocation.name,
			amount: effectiveAmount,
			percentage:
				totalMonthlyIncome > 0
					? (effectiveAmount / totalMonthlyIncome) * 100
					: 0,
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
		let effectiveAmount: number;
		if (allocation.type === "yearly") {
			if (allocation.valueType === "absolute") {
				effectiveAmount = allocation.value;
			} else {
				effectiveAmount = (totalYearlyIncome * allocation.value) / 100;
			}
		} else {
			// Monthly to yearly
			if (allocation.valueType === "absolute") {
				effectiveAmount = allocation.value * 12;
			} else {
				effectiveAmount = ((totalMonthlyIncome * allocation.value) / 100) * 12;
			}
		}
		return {
			id: allocation.id,
			name: allocation.name,
			amount: effectiveAmount,
			percentage:
				totalYearlyIncome > 0 ? (effectiveAmount / totalYearlyIncome) * 100 : 0,
		};
	});
}
