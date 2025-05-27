import { Card } from "~/app/_components/ui/card";
import type { Investment } from "../types";
import { InvestmentForm } from "./InvestmentForm";
import { InvestmentList } from "./InvestmentList";

interface InvestmentsSectionProps {
	investments: Investment[];
	newInvestment: Omit<Investment, "id">;
	onInvestmentChange: (investment: Omit<Investment, "id">) => void;
	onAddInvestment: () => void;
	onRemoveInvestment: (id: string) => void;
}

export function InvestmentsSection({
	investments,
	newInvestment,
	onInvestmentChange,
	onAddInvestment,
	onRemoveInvestment,
}: InvestmentsSectionProps) {
	return (
		<Card className="p-6">
			<h2 className="mb-4 font-bold text-xl">Investments</h2>

			<div className="space-y-4">
				<InvestmentList
					investments={investments}
					onRemoveInvestment={onRemoveInvestment}
				/>

				<InvestmentForm
					newInvestment={newInvestment}
					onInvestmentChange={onInvestmentChange}
					onAddInvestment={onAddInvestment}
				/>
			</div>
		</Card>
	);
}
