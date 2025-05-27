import { PlusCircle } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import type { Loan } from "../types";
import { calculateMonthlyPayment } from "../utils/calculations";

interface LoanFormProps {
	newLoan: Omit<Loan, "id">;
	onLoanChange: (loan: Omit<Loan, "id">) => void;
	onAddLoan: () => void;
}

export function LoanForm({ newLoan, onLoanChange, onAddLoan }: LoanFormProps) {
	// Calculate expected monthly payment for new loan
	const newLoanMonthlyPayment =
		newLoan.loanAmount &&
		newLoan.periodMonths &&
		newLoan.interestRate !== undefined
			? calculateMonthlyPayment(newLoan as Loan)
			: 0;

	return (
		<div className="space-y-2">
			<div className="grid grid-cols-2 gap-2">
				<div>
					<label className="mb-1 block text-sm" htmlFor="loanName">
						Name
					</label>
					<Input
						id="loanName"
						value={newLoan.name}
						onChange={(e) => onLoanChange({ ...newLoan, name: e.target.value })}
						placeholder="Loan name"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm" htmlFor="loanAmount">
						Loan Amount
					</label>
					<Input
						id="loanAmount"
						type="number"
						value={newLoan.loanAmount}
						onChange={(e) =>
							onLoanChange({
								...newLoan,
								loanAmount: Number(e.target.value),
							})
						}
						placeholder="0"
					/>
				</div>
			</div>

			<div className="grid grid-cols-3 gap-2">
				<div>
					<label className="mb-1 block text-sm" htmlFor="interestRate">
						Interest Rate (%)
					</label>
					<Input
						id="interestRate"
						type="number"
						value={newLoan.interestRate}
						onChange={(e) =>
							onLoanChange({
								...newLoan,
								interestRate: Number(e.target.value),
							})
						}
						placeholder="0"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm" htmlFor="periodMonths">
						Period (months)
					</label>
					<Input
						id="periodMonths"
						type="number"
						value={newLoan.periodMonths}
						onChange={(e) =>
							onLoanChange({
								...newLoan,
								periodMonths: Number(e.target.value),
							})
						}
						placeholder="0"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm" htmlFor="extraMonthlyPayment">
						Extra Payment
					</label>
					<Input
						id="extraMonthlyPayment"
						type="number"
						value={newLoan.extraMonthlyPayment}
						onChange={(e) =>
							onLoanChange({
								...newLoan,
								extraMonthlyPayment: Number(e.target.value),
							})
						}
						placeholder="0"
					/>
				</div>
			</div>

			{/* Display expected monthly payment */}
			{newLoanMonthlyPayment > 0 && (
				<div className="rounded bg-secondary-slate/20 p-2">
					<span className="text-sm">
						Expected Monthly Payment:{" "}
						<span className="font-medium text-accent-coral">
							{Math.round(newLoanMonthlyPayment).toLocaleString()} RON
						</span>
					</span>
				</div>
			)}

			<Button
				onClick={onAddLoan}
				className="flex w-full items-center justify-center gap-1"
			>
				<PlusCircle className="h-4 w-4" />
				<span>Add Loan</span>
			</Button>
		</div>
	);
}
