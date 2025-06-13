import { Edit, X } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import type { Investment } from "../types";

interface InvestmentListProps {
	investments: Investment[];
	onRemoveInvestment: (id: string) => void;
	onEditInvestment: (investment: Investment) => void;
}

export function InvestmentList({
	investments,
	onRemoveInvestment,
	onEditInvestment,
}: InvestmentListProps) {
	if (investments.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			{investments.map((investment) => (
				<div
					key={investment.id}
					className="flex items-center justify-between rounded-md bg-secondary-slate/30 p-3"
				>
					<div className="flex-1">
						<div className="font-semibold">{investment.name}</div>
						<div className="text-sm text-text-gray">
							Initial: {investment.initialAmount.toLocaleString()} RON |
							Monthly: {investment.monthlyContribution.toLocaleString()} RON |
							Rate: {investment.yearlyInterestRate}%
						</div>
					</div>
					<div className="flex gap-1">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onEditInvestment(investment)}
							className="text-primary-teal"
						>
							<Edit className="h-4 w-4" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => onRemoveInvestment(investment.id)}
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
