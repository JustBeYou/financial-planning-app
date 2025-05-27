import type { FinancialSummary as FinancialSummaryType } from "../types";

interface FinancialSummaryProps {
	financialSummary: FinancialSummaryType;
}

export function FinancialSummary({ financialSummary }: FinancialSummaryProps) {
	return (
		<div className="rounded-md bg-secondary-slate/30 p-4">
			<h3 className="mb-2 font-semibold">Monthly Summary</h3>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<div className="text-sm text-text-gray">Total Loan Payments:</div>
					<div className="font-medium text-accent-coral">
						{Math.round(financialSummary.loanPayments).toLocaleString()} RON
					</div>
				</div>
				<div>
					<div className="text-sm text-text-gray">
						Investment Contributions:
					</div>
					<div className="font-medium">
						{Math.round(
							financialSummary.investmentContributions,
						).toLocaleString()}{" "}
						RON
					</div>
				</div>
				<div>
					<div className="text-sm text-text-gray">Total Monthly Expenses:</div>
					<div className="font-medium">
						{Math.round(financialSummary.totalMonthlyExpenses).toLocaleString()}{" "}
						RON
					</div>
				</div>
				<div>
					<div className="text-sm text-text-gray">
						Remaining Disposable Income:
					</div>
					<div
						className={`font-medium ${financialSummary.remainingIncome < 0 ? "text-accent-coral" : "text-accent-lime"}`}
					>
						{Math.round(financialSummary.remainingIncome).toLocaleString()} RON
					</div>
				</div>
			</div>
		</div>
	);
}
