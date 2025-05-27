import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Loan } from "../types";
import { calculateMonthlyPayment } from "../utils/calculations";

interface LoanListProps {
	loans: Loan[];
	onRemoveLoan: (id: string) => void;
}

export function LoanList({ loans, onRemoveLoan }: LoanListProps) {
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
					<div>
						<div className="font-semibold">{loan.name}</div>
						<div className="text-sm text-text-gray">
							Amount: {loan.loanAmount.toLocaleString()} RON | Rate:{" "}
							{loan.interestRate}% | Period: {loan.periodMonths} months
						</div>
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
					<Button
						variant="ghost"
						size="icon"
						onClick={() => onRemoveLoan(loan.id)}
						className="text-accent-coral"
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			))}
		</div>
	);
}
