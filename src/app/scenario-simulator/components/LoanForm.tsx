import { PlusCircle } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { CurrencyInput } from "~/app/_components/ui/currency-input";
import { Input } from "~/app/_components/ui/input";
import { Select } from "~/app/_components/ui/select";
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
					<CurrencyInput
						id="loanAmount"
						value={newLoan.loanAmount}
						onChange={(value) =>
							onLoanChange({
								...newLoan,
								loanAmount: value,
							})
						}
						placeholder="0"
						showCurrency
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
					<CurrencyInput
						id="extraMonthlyPayment"
						value={newLoan.extraMonthlyPayment}
						onChange={(value) =>
							onLoanChange({
								...newLoan,
								extraMonthlyPayment: value,
							})
						}
						placeholder="0"
						showCurrency
					/>
				</div>
			</div>

			{/* Lump Sum Payment Section */}
			<div className="space-y-2">
				<h4 className="font-medium text-sm">Lump Sum Payment (Optional)</h4>
				<div className="grid grid-cols-2 gap-2">
					<div>
						<label className="mb-1 block text-sm" htmlFor="lumpSumType">
							Payment Type
						</label>
						<Select
							id="lumpSumType"
							value={newLoan.lumpSumType}
							onChange={(e) =>
								onLoanChange({
									...newLoan,
									lumpSumType: e.target.value as "amount" | "percentage",
								})
							}
							options={[
								{ value: "amount", label: "Fixed Amount" },
								{ value: "percentage", label: "Percentage" },
							]}
						/>
					</div>
					<div>
						<label className="mb-1 block text-sm" htmlFor="lumpSumPayment">
							{newLoan.lumpSumType === "percentage"
								? "Percentage (%)"
								: "Amount"}
						</label>
						{newLoan.lumpSumType === "percentage" ? (
							<Input
								id="lumpSumPayment"
								type="number"
								value={newLoan.lumpSumPayment}
								onChange={(e) =>
									onLoanChange({
										...newLoan,
										lumpSumPayment: Number(e.target.value),
									})
								}
								placeholder="0"
								max="100"
							/>
						) : (
							<CurrencyInput
								id="lumpSumPayment"
								value={newLoan.lumpSumPayment}
								onChange={(value) =>
									onLoanChange({
										...newLoan,
										lumpSumPayment: value,
									})
								}
								placeholder="0"
								showCurrency
							/>
						)}
					</div>
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
