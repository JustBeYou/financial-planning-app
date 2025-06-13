import { PlusCircle } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { Card } from "~/app/_components/ui/card";
import { type Column, DataTable } from "~/app/_components/ui/data-table";
import { ALLOCATION_COLORS } from "./types";
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
		{
			header: "Name",
			accessorKey: (row: BudgetAllocation) => {
				const index = budgetAllocations.findIndex((item) => item.id === row.id);
				return (
					<div className="flex items-center gap-2">
						<div
							className={`h-4 w-4 rounded-sm ${ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}`}
						/>
						<span>{row.name}</span>
					</div>
				);
			},
			sortable: true,
			sortValue: (row) => row.name,
		},
		{
			header: "Value",
			accessorKey: (budget) => (
				<span className="font-medium">
					{budget.valueType === "percent"
						? `${budget.value}%`
						: `${budget.value.toLocaleString()} ${budget.currency}`}
				</span>
			),
			sortable: true,
			sortValue: (row) => row.value,
		},
		{
			header: "Type",
			accessorKey: "type",
			sortable: true,
			sortValue: (row) => row.type,
		},
		{
			header: "Value Type",
			accessorKey: "valueType",
			sortable: true,
			sortValue: (row) => row.valueType,
		},
		{
			header: "Effective Amount Monthly",
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
			sortable: true,
			sortValue: (budget) => {
				let effectiveAmount: number;
				if (budget.valueType === "absolute") {
					effectiveAmount =
						budget.type === "monthly" ? budget.value : budget.value / 12;
				} else {
					effectiveAmount =
						budget.type === "monthly"
							? (totalMonthlyIncome * budget.value) / 100
							: (totalYearlyIncome * budget.value) / 100 / 12;
				}
				return effectiveAmount;
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
				defaultSortColumn="Effective Amount Monthly"
				defaultSortDirection="desc"
			/>
		</Card>
	);
}
