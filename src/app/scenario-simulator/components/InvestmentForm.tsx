import { PlusCircle } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { CurrencyInput } from "~/app/_components/ui/currency-input";
import { Input } from "~/app/_components/ui/input";
import type { Investment } from "../types";

interface InvestmentFormProps {
	newInvestment: Omit<Investment, "id">;
	onInvestmentChange: (investment: Omit<Investment, "id">) => void;
	onAddInvestment: () => void;
	isEditing?: boolean;
	onUpdateInvestment?: () => void;
	onCancelEdit?: () => void;
}

export function InvestmentForm({
	newInvestment,
	onInvestmentChange,
	onAddInvestment,
}: InvestmentFormProps) {
	return (
		<div className="space-y-2">
			<div className="grid grid-cols-2 gap-2">
				<div>
					<label className="mb-1 block text-sm" htmlFor="investmentName">
						Name
					</label>
					<Input
						id="investmentName"
						value={newInvestment.name}
						onChange={(e) =>
							onInvestmentChange({
								...newInvestment,
								name: e.target.value,
							})
						}
						placeholder="Investment name"
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm" htmlFor="initialAmount">
						Initial Amount
					</label>
					<CurrencyInput
						id="initialAmount"
						value={newInvestment.initialAmount}
						onChange={(value) =>
							onInvestmentChange({
								...newInvestment,
								initialAmount: value,
							})
						}
						placeholder="0"
						showCurrency
					/>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-2">
				<div>
					<label className="mb-1 block text-sm" htmlFor="monthlyContribution">
						Monthly Contribution
					</label>
					<CurrencyInput
						id="monthlyContribution"
						value={newInvestment.monthlyContribution}
						onChange={(value) =>
							onInvestmentChange({
								...newInvestment,
								monthlyContribution: value,
							})
						}
						placeholder="0"
						showCurrency
					/>
				</div>
				<div>
					<label className="mb-1 block text-sm" htmlFor="yearlyInterestRate">
						Yearly Interest (%)
					</label>
					<Input
						id="yearlyInterestRate"
						type="number"
						value={newInvestment.yearlyInterestRate}
						onChange={(e) =>
							onInvestmentChange({
								...newInvestment,
								yearlyInterestRate: Number(e.target.value),
							})
						}
						placeholder="0"
					/>
				</div>
			</div>

			<Button
				onClick={onAddInvestment}
				className="flex w-full items-center justify-center gap-1"
			>
				<PlusCircle className="h-4 w-4" />
				<span>Add Investment</span>
			</Button>
		</div>
	);
}
