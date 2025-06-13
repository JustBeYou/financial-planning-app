import { Card } from "~/app/_components/ui/card";
import type { Loan } from "../types";
import { LoanForm } from "./LoanForm";
import { LoanList } from "./LoanList";

interface LoansSectionProps {
	loans: Loan[];
	newLoan: Omit<Loan, "id">;
	onLoanChange: (loan: Omit<Loan, "id">) => void;
	onAddLoan: () => void;
	onRemoveLoan: (id: string) => void;
	onEditLoan: (loan: Loan) => void;
}

export function LoansSection({
	loans,
	newLoan,
	onLoanChange,
	onAddLoan,
	onRemoveLoan,
	onEditLoan,
}: LoansSectionProps) {
	return (
		<Card className="p-6">
			<h2 className="mb-4 font-bold text-xl">Loans</h2>

			<div className="space-y-4">
				<LoanList
					loans={loans}
					onRemoveLoan={onRemoveLoan}
					onEditLoan={onEditLoan}
				/>

				<LoanForm
					newLoan={newLoan}
					onLoanChange={onLoanChange}
					onAddLoan={onAddLoan}
				/>
			</div>
		</Card>
	);
}
