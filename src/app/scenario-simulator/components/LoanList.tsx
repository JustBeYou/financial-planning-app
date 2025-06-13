import { Edit, X } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import type { Loan } from "../types";
import { calculateEffectiveLoanAmount, calculateMonthlyPayment } from "../utils/calculations";

interface LoanListProps {
	loans: Loan[];
	onRemoveLoan: (id: string) => void;
	onEditLoan: (loan: Loan) => void;
}

export function LoanList({ loans, onRemoveLoan, onEditLoan }: LoanListProps) {
	if (loans.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			{loans.map((loan) => (
				<div
					key={loan.id}
					className="flex items-center justify-between rounded-md bg-secondary-slate/30 p-3"
				>
					<div className="flex-1">
						<div className="font-semibold">{loan.name}</div>
						<div className="text-sm text-text-gray">
							Amount: {loan.loanAmount.toLocaleString()} RON | Rate:{" "}
							{loan.interestRate}% | Period: {loan.periodMonths} months
						</div>
						{loan.lumpSumPayment > 0 && (
							<div className="text-sm text-text-gray">
								Lump Sum: {loan.lumpSumType === "percentage"
									? `${loan.lumpSumPayment}%`
									: `${loan.lumpSumPayment.toLocaleString()} RON`}
								{" "}(Effective Amount: {calculateEffectiveLoanAmount(loan).toLocaleString()} RON)
							</div>
						)}
						<div className="mt-1 text-sm">
							<span className="font-medium text-accent-coral">
								Monthly Payment:{" "}
								{Math.round(calculateMonthlyPayment(loan)).toLocaleString()} RON
							</span>
							{loan.extraMonthlyPayment > 0 && (
								<span className="ml-2">
									+ {loan.extraMonthlyPayment.toLocaleString()} RON extra
								</span>
							)}
						</div>
					</div>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEditLoan(loan)}
							className="text-primary-teal"
						>
							<Edit className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onRemoveLoan(loan.id)}
							className="text-accent-coral"
						>
							<X className="h-4 w-4" />
						</Button>
					</div>
				</div>
			))}
		</div>
	);
}
