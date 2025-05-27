export type Investment = {
	id: string;
	name: string;
	initialAmount: number;
	monthlyContribution: number;
	yearlyInterestRate: number;
};

export type Loan = {
	id: string;
	name: string;
	loanAmount: number;
	interestRate: number;
	periodMonths: number;
	extraMonthlyPayment: number;
};

export type SimulationResult = {
	month: number;
	totalInvestmentValue: number;
	totalLoanBalance: number;
	netWorth: number;
	investments: Record<string, number>;
	loans: Record<string, number>;
};

export type ErrorDialogState = {
	isOpen: boolean;
	title: string;
	description: string;
};

export type FinancialSummary = {
	loanPayments: number;
	investmentContributions: number;
	totalMonthlyExpenses: number;
	remainingIncome: number;
};
