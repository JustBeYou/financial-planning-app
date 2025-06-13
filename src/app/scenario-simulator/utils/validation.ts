import type { Investment, Loan } from "../types";

// Validate investment
export const validateInvestment = (
	investment: Omit<Investment, "id">,
	showError: (title: string, description: string) => void,
): boolean => {
	if (!investment.name.trim()) {
		showError(
			"Invalid Investment Name",
			"Please provide a name for your investment.",
		);
		return false;
	}

	if (investment.initialAmount < 0) {
		showError("Invalid Initial Amount", "Initial amount cannot be negative.");
		return false;
	}

	if (investment.monthlyContribution < 0) {
		showError(
			"Invalid Monthly Contribution",
			"Monthly contribution cannot be negative.",
		);
		return false;
	}

	if (investment.yearlyInterestRate < 0) {
		showError("Invalid Interest Rate", "Interest rate cannot be negative.");
		return false;
	}

	return true;
};

// Validate loan
export const validateLoan = (
	loan: Omit<Loan, "id">,
	showError: (title: string, description: string) => void,
): boolean => {
	if (!loan.name.trim()) {
		showError("Invalid Loan Name", "Please provide a name for your loan.");
		return false;
	}

	if (loan.loanAmount <= 0) {
		showError("Invalid Loan Amount", "Loan amount must be greater than zero.");
		return false;
	}

	if (loan.interestRate < 0) {
		showError("Invalid Interest Rate", "Interest rate cannot be negative.");
		return false;
	}

	if (loan.periodMonths <= 0) {
		showError("Invalid Loan Period", "Loan period must be greater than zero.");
		return false;
	}

	if (loan.extraMonthlyPayment < 0) {
		showError("Invalid Extra Payment", "Extra payment cannot be negative.");
		return false;
	}

	if (loan.lumpSumPayment < 0) {
		showError(
			"Invalid Lump Sum Payment",
			"Lump sum payment cannot be negative.",
		);
		return false;
	}

	if (loan.lumpSumType === "percentage" && loan.lumpSumPayment > 100) {
		showError(
			"Invalid Lump Sum Percentage",
			"Lump sum percentage cannot exceed 100%.",
		);
		return false;
	}

	if (loan.lumpSumType === "amount" && loan.lumpSumPayment >= loan.loanAmount) {
		showError(
			"Invalid Lump Sum Amount",
			"Lump sum amount cannot be greater than or equal to the loan amount.",
		);
		return false;
	}

	return true;
};
