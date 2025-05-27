import { PlusCircle } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import { Card } from "~/app/_components/ui/card";
import { type Column, DataTable } from "~/app/_components/ui/data-table";
import type { IncomeSource } from "./types";

interface IncomeSourceTableProps {
	incomeSources: IncomeSource[];
	onAdd: () => void;
	onEdit: (source: IncomeSource) => void;
	onDelete: (source: IncomeSource) => void;
}

export function IncomeSourceTable({
	incomeSources,
	onAdd,
	onEdit,
	onDelete,
}: IncomeSourceTableProps) {
	// Table columns configuration for income sources
	const columns: Column<IncomeSource>[] = [
		{ header: "Name", accessorKey: "name" },
		{
			header: "Amount",
			accessorKey: (income) => (
				<span className="font-medium">
					{income.amount.toLocaleString()} {income.currency}
				</span>
			),
		},
		{ header: "Type", accessorKey: "type" },
		{
			header: "Tax %",
			accessorKey: (income) => `${income.taxPercentage}%`,
		},
		{
			header: "Net Amount Monthly",
			accessorKey: (income) => {
				// Calculate net amount after tax
				const netAmount = income.amount * (1 - income.taxPercentage / 100);

				// Convert to monthly value if it's a yearly income
				const monthlyNetAmount =
					income.type === "monthly" ? netAmount : netAmount / 12;

				return `${Math.round(monthlyNetAmount).toLocaleString()} ${income.currency}`;
			},
		},
	];

	return (
		<Card className="p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-bold text-2xl">Income Sources</h2>
				<Button onClick={onAdd} size="sm" className="flex items-center gap-1">
					<PlusCircle className="h-4 w-4" />
					<span>Add</span>
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={incomeSources}
				keyField="id"
				onEdit={onEdit}
				onDelete={onDelete}
				emptyMessage="No income sources. Click 'Add' to create one."
			/>
		</Card>
	);
}
