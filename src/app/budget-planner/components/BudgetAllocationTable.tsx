import { PlusCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { type Column, DataTable } from "~/components/ui/data-table";
import type { BudgetAllocation } from "./types";

interface BudgetAllocationTableProps {
	budgetAllocations: BudgetAllocation[];
	totalMonthlyIncome: number;
	totalYearlyIncome: number;
	onAdd: () => void;
	onEdit: (allocation: BudgetAllocation) => void;
	onDelete: (allocation: BudgetAllocation) => void;
}

export function BudgetAllocationTable({
	budgetAllocations,
	totalMonthlyIncome,
	totalYearlyIncome,
	onAdd,
	onEdit,
	onDelete,
}: BudgetAllocationTableProps) {
	// Table columns configuration for budget allocations
	const budgetColumns: Column<BudgetAllocation>[] = [
		{ header: "Name", accessorKey: "name" },
		{
			header: "Value",
			accessorKey: (budget) => (
				<span className="font-medium">
					{budget.valueType === "percent"
						? `${budget.value}%`
						: `${budget.value.toLocaleString()} ${budget.currency}`}
				</span>
			),
		},
		{ header: "Type", accessorKey: "type" },
		{
			header: "Value Type",
			accessorKey: "valueType",
		},
		{
			header: "Effective Amount (Monthly)",
			accessorKey: (budget) => {
				let effectiveAmount: number;
				if (budget.valueType === "absolute") {
					// Convert yearly to monthly if needed
					effectiveAmount =
						budget.type === "monthly" ? budget.value : budget.value / 12;
				} else {
					// Percentage - always calculate as monthly
					effectiveAmount =
						budget.type === "monthly"
							? (totalMonthlyIncome * budget.value) / 100
							: (totalYearlyIncome * budget.value) / 100 / 12;
				}
				return `${Math.round(effectiveAmount).toLocaleString()} ${budget.currency}`;
			},
		},
	];

	return (
		<Card className="p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-bold text-2xl">Budget Allocations</h2>
				<Button onClick={onAdd} size="sm" className="flex items-center gap-1">
					<PlusCircle className="h-4 w-4" />
					<span>Add</span>
				</Button>
			</div>

			<DataTable
				columns={budgetColumns}
				data={budgetAllocations}
				keyField="id"
				onEdit={onEdit}
				onDelete={onDelete}
				emptyMessage="No budget allocations. Click 'Add' to create one."
			/>
		</Card>
	);
}
