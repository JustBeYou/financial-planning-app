import {
	ChevronDown,
	ChevronRight,
	ChevronUp,
	Edit2,
	PlusCircle,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Card } from "~/app/_components/ui/card";
import { type Column, DataTable } from "~/app/_components/ui/data-table";
import { getAllocationColor } from "./types";
import type { BudgetAllocation, Spending } from "./types";

interface BudgetAllocationTableProps {
	budgetAllocations: BudgetAllocation[];
	totalMonthlyIncome: number;
	totalYearlyIncome: number;
	onAdd: () => void;
	onEdit: (allocation: BudgetAllocation) => void;
	onDelete: (allocation: BudgetAllocation) => void;
	onAddSpending: (allocationId: number) => void;
	onEditSpending: (spending: Spending) => void;
	onDeleteSpending: (spending: Spending) => void;
	// Mock data for spendings - will be replaced with real data later
	mockSpendings: { [allocationId: number]: Spending[] };
}

export function BudgetAllocationTable({
	budgetAllocations,
	totalMonthlyIncome,
	totalYearlyIncome,
	onAdd,
	onEdit,
	onDelete,
	onAddSpending,
	onEditSpending,
	onDeleteSpending,
	mockSpendings,
}: BudgetAllocationTableProps) {
	const [expandedAllocations, setExpandedAllocations] = useState<
		Set<string | number>
	>(new Set());

	const toggleExpanded = (allocationId: string | number) => {
		const newExpanded = new Set(expandedAllocations);
		if (newExpanded.has(allocationId)) {
			newExpanded.delete(allocationId);
		} else {
			newExpanded.add(allocationId);
		}
		setExpandedAllocations(newExpanded);
	};

	const calculateEffectiveMonthlyAmount = (
		allocation: BudgetAllocation,
	): number => {
		if (allocation.valueType === "absolute") {
			return allocation.type === "monthly"
				? allocation.value
				: allocation.value / 12;
		}
		return allocation.type === "monthly"
			? (totalMonthlyIncome * allocation.value) / 100
			: (totalYearlyIncome * allocation.value) / 100 / 12;
	};

	const calculateSpendingTotals = (
		allocationId: number,
		allocation: BudgetAllocation,
	) => {
		const spendings = mockSpendings[allocationId] || [];
		const totalSpent = spendings.reduce(
			(sum, spending) => sum + spending.amount,
			0,
		);

		// For yearly allocations, calculate monthly equivalent of spendings
		const monthlySpent =
			allocation.type === "yearly" ? totalSpent / 12 : totalSpent;

		return { spendings, totalSpent, monthlySpent };
	};

	// Table columns configuration for budget allocations
	const budgetColumns: Column<BudgetAllocation>[] = [
		{
			header: "Name",
			accessorKey: (row: BudgetAllocation) => {
				const isExpanded = expandedAllocations.has(row.id);

				return (
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => toggleExpanded(row.id)}
							className="h-6 w-6 p-0"
						>
							{isExpanded ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
						</Button>
						<div
							className={`h-4 w-4 rounded-sm ${getAllocationColor(row.id)}`}
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
			header: "Monthly Amount",
			accessorKey: (budget) => {
				const effectiveAmount = calculateEffectiveMonthlyAmount(budget);
				return (
					<span className="font-medium">
						{Math.round(effectiveAmount).toLocaleString()} {budget.currency}
					</span>
				);
			},
			sortable: true,
			sortValue: (budget) => calculateEffectiveMonthlyAmount(budget),
		},
		{
			header: "Spending Status",
			accessorKey: (budget) => {
				const effectiveAmount = calculateEffectiveMonthlyAmount(budget);
				const { monthlySpent } = calculateSpendingTotals(budget.id, budget);
				const remainingAmount = effectiveAmount - monthlySpent;
				const spentPercentage =
					effectiveAmount > 0 ? (monthlySpent / effectiveAmount) * 100 : 0;

				return (
					<div className="text-sm">
						{monthlySpent > 0 ? (
							<div className="space-y-1">
								<div className="flex items-center gap-2">
									<span className="font-medium text-accent-coral">
										{Math.round(monthlySpent).toLocaleString()}{" "}
										{budget.currency}
									</span>
									<span className="rounded bg-accent-coral/20 px-2 py-1 text-accent-coral text-xs">
										{Math.round(spentPercentage)}%
									</span>
									<span className="text-text-gray">spent</span>
								</div>
								<div className="flex items-center gap-2">
									<span
										className={
											remainingAmount >= 0
												? "text-accent-lime"
												: "text-accent-coral"
										}
									>
										{Math.round(remainingAmount).toLocaleString()}{" "}
										{budget.currency}
									</span>
									<span
										className={`rounded px-2 py-1 text-xs ${
											remainingAmount >= 0
												? "bg-accent-lime/20 text-accent-lime"
												: "bg-accent-coral/20 text-accent-coral"
										}`}
									>
										{Math.round(100 - spentPercentage)}%
									</span>
									<span className="text-text-gray">remaining</span>
								</div>
							</div>
						) : (
							<span className="text-text-gray">No spendings</span>
						)}
					</div>
				);
			},
			sortable: false,
		},
	];

	const renderCustomActions = (allocation: BudgetAllocation) => (
		<Button
			variant="outline"
			size="sm"
			onClick={() => onAddSpending(allocation.id)}
			className="flex items-center gap-1"
		>
			<PlusCircle className="h-4 w-4" />
			<span>Add</span>
		</Button>
	);

	const renderExpandedContent = (allocation: BudgetAllocation) => {
		const { spendings, totalSpent, monthlySpent } = calculateSpendingTotals(
			allocation.id,
			allocation,
		);
		const effectiveMonthlyAmount = calculateEffectiveMonthlyAmount(allocation);
		const effectiveYearlyAmount =
			allocation.type === "monthly"
				? effectiveMonthlyAmount * 12
				: allocation.valueType === "absolute"
					? allocation.value
					: (totalYearlyIncome * allocation.value) / 100;

		const monthlyRemaining = effectiveMonthlyAmount - monthlySpent;
		const yearlyRemaining = effectiveYearlyAmount - totalSpent;
		const monthlySpentPercentage =
			effectiveMonthlyAmount > 0
				? (monthlySpent / effectiveMonthlyAmount) * 100
				: 0;
		const yearlySpentPercentage =
			effectiveYearlyAmount > 0
				? (totalSpent / effectiveYearlyAmount) * 100
				: 0;

		return (
			<div className="mb-3 ml-8 rounded-r-lg border-l-4 border-l-primary-teal bg-secondary-slate/20">
				<div className="p-4">
					<h4 className="mb-3 font-medium text-text-white">
						Detailed Summary for {allocation.name}
					</h4>

					{/* Budget Summary */}
					<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div className="rounded-md bg-bg-jet p-3">
							<h5 className="mb-2 font-medium text-sm text-text-white">
								Monthly Budget
							</h5>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-text-gray">Allocated:</span>
									<span className="text-text-white">
										{Math.round(effectiveMonthlyAmount).toLocaleString()}{" "}
										{allocation.currency}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-gray">Spent:</span>
									<span className="text-accent-coral">
										{Math.round(monthlySpent).toLocaleString()}{" "}
										{allocation.currency}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-gray">Remaining:</span>
									<span
										className={
											monthlyRemaining >= 0
												? "text-accent-lime"
												: "text-accent-coral"
										}
									>
										{Math.round(monthlyRemaining).toLocaleString()}{" "}
										{allocation.currency}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-gray">Usage:</span>
									<span className="text-text-white">
										{Math.round(monthlySpentPercentage)}%
									</span>
								</div>
							</div>
						</div>

						<div className="rounded-md bg-bg-jet p-3">
							<h5 className="mb-2 font-medium text-sm text-text-white">
								{allocation.type === "yearly"
									? "Yearly Budget"
									: "Yearly Projection"}
							</h5>
							<div className="space-y-1 text-sm">
								<div className="flex justify-between">
									<span className="text-text-gray">Allocated:</span>
									<span className="text-text-white">
										{Math.round(effectiveYearlyAmount).toLocaleString()}{" "}
										{allocation.currency}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-gray">Spent:</span>
									<span className="text-accent-coral">
										{Math.round(totalSpent).toLocaleString()}{" "}
										{allocation.currency}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-gray">Remaining:</span>
									<span
										className={
											yearlyRemaining >= 0
												? "text-accent-lime"
												: "text-accent-coral"
										}
									>
										{Math.round(yearlyRemaining).toLocaleString()}{" "}
										{allocation.currency}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-text-gray">Usage:</span>
									<span className="text-text-white">
										{Math.round(yearlySpentPercentage)}%
									</span>
								</div>
							</div>
						</div>
					</div>

					<h5 className="mb-3 font-medium text-text-white">
						Individual Spendings
					</h5>
					{spendings.length === 0 ? (
						<div className="py-4 text-center text-text-gray">
							No spendings tracked for this allocation.
						</div>
					) : (
						<div className="space-y-2">
							{spendings.map((spending) => (
								<div
									key={spending.id}
									className="flex items-center justify-between rounded-md border border-secondary-slate/50 bg-bg-jet p-3"
								>
									<div className="flex-1">
										<div className="flex items-center gap-4">
											<span className="font-medium text-text-white">
												{spending.name}
											</span>
											<span className="font-semibold text-sm text-text-white">
												{spending.amount.toLocaleString()} {spending.currency}
											</span>
											<span className="text-sm text-text-gray">
												{spending.date}
											</span>
											{spending.category && (
												<span className="rounded bg-primary-teal/20 px-2 py-1 text-primary-teal text-xs">
													{spending.category}
												</span>
											)}
										</div>
										{spending.description && (
											<div className="mt-1 text-sm text-text-gray">
												{spending.description}
											</div>
										)}
									</div>
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onEditSpending(spending)}
											className="text-text-gray hover:text-text-white"
										>
											<Edit2 className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onDeleteSpending(spending)}
											className="text-accent-coral hover:text-accent-coral/80"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	};

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
				defaultSortColumn="Monthly Amount"
				defaultSortDirection="desc"
				expandable={true}
				expandedRows={expandedAllocations}
				onToggleExpand={toggleExpanded}
				renderExpandedContent={renderExpandedContent}
				customActions={renderCustomActions}
			/>
		</Card>
	);
}
