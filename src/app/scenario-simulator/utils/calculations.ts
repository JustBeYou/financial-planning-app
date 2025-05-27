import type {
	FinancialSummary,
	Investment,
	Loan,
	SimulationResult,
} from "../types";

// Calculate monthly payment for a loan
export const calculateMonthlyPayment = (loan: Loan | Omit<Loan, "id">) => {
	const principal = loan.loanAmount;
	const monthlyRate = loan.interestRate / 100 / 12;
	const payments = loan.periodMonths;

	if (monthlyRate === 0) {
		return principal / payments;
	}

	return (
		(principal * monthlyRate * (1 + monthlyRate) ** payments) /
		((1 + monthlyRate) ** payments - 1)
	);
};

// Calculate total monthly expenses and remaining disposable income
export const calculateFinancialSummary = (
	loans: Loan[],
	investments: Investment[],
	monthlyDisposableIncome: number,
): FinancialSummary => {
	const loanPayments = loans.reduce((sum, loan) => {
		const monthlyPayment = calculateMonthlyPayment(loan);
		return sum + monthlyPayment + loan.extraMonthlyPayment;
	}, 0);

	const investmentContributions = investments.reduce(
		(sum, inv) => sum + inv.monthlyContribution,
		0,
	);

	const totalMonthlyExpenses = loanPayments + investmentContributions;
	const remainingIncome = monthlyDisposableIncome - totalMonthlyExpenses;

	return {
		loanPayments,
		investmentContributions,
		totalMonthlyExpenses,
		remainingIncome,
	};
};

// Run the financial simulation
export const runFinancialSimulation = (
	investments: Investment[],
	loans: Loan[],
	simulationPeriodMonths: number,
	monthlyDisposableIncome: number,
): SimulationResult[] | null => {
	const results: SimulationResult[] = [];

	// Initial state
	let currentInvestments = investments.map((inv) => ({
		id: inv.id,
		name: inv.name,
		balance: inv.initialAmount,
	}));

	let currentLoans = loans.map((loan) => ({
		id: loan.id,
		name: loan.name,
		balance: loan.loanAmount,
		monthlyPayment: calculateMonthlyPayment(loan),
		extraPayment: loan.extraMonthlyPayment,
	}));

	// Check if monthly expenses exceed disposable income
	const totalMonthlyExpenses =
		currentLoans.reduce(
			(sum, loan) => sum + loan.monthlyPayment + loan.extraPayment,
			0,
		) + investments.reduce((sum, inv) => sum + inv.monthlyContribution, 0);

	if (totalMonthlyExpenses > monthlyDisposableIncome) {
		return null; // Indicates that expenses exceed income
	}

	// Run simulation month by month
	for (let month = 1; month <= simulationPeriodMonths; month++) {
		// Update investments
		currentInvestments = currentInvestments.map((inv) => {
			const investment = investments.find((i) => i.id === inv.id);
			if (!investment) return inv;

			// Apply monthly contribution
			inv.balance += investment.monthlyContribution;

			// Apply monthly interest (yearly rate / 12)
			const monthlyInterest = investment.yearlyInterestRate / 100 / 12;
			inv.balance *= 1 + monthlyInterest;

			return inv;
		});

		// Update loans
		currentLoans = currentLoans.map((loan) => {
			const loanConfig = loans.find((l) => l.id === loan.id);
			if (!loanConfig) return loan;

			// Calculate interest for this month
			const monthlyInterest =
				loan.balance * (loanConfig.interestRate / 100 / 12);

			// Apply regular payment + extra payment
			const totalPayment = Math.min(
				loan.monthlyPayment + loan.extraPayment,
				loan.balance + monthlyInterest,
			);

			// Update balance
			loan.balance = Math.max(0, loan.balance + monthlyInterest - totalPayment);

			return loan;
		});

		// Create a result record for this month
		const investmentValues: Record<string, number> = {};
		const loanValues: Record<string, number> = {};

		for (const inv of currentInvestments) {
			investmentValues[inv.name] = inv.balance;
		}

		for (const loan of currentLoans) {
			loanValues[loan.name] = loan.balance;
		}

		const totalInvestmentValue = currentInvestments.reduce(
			(sum, inv) => sum + inv.balance,
			0,
		);
		const totalLoanBalance = currentLoans.reduce(
			(sum, loan) => sum + loan.balance,
			0,
		);

		results.push({
			month,
			totalInvestmentValue,
			totalLoanBalance,
			netWorth: totalInvestmentValue - totalLoanBalance,
			investments: investmentValues,
			loans: loanValues,
		});

		// Stop simulation if all loans are paid off
		if (totalLoanBalance === 0 && month % 12 === 0) {
			break;
		}
	}

	return results;
};
