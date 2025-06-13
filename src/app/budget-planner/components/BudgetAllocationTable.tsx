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
import { ALLOCATION_COLORS } from "./types";
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
	const [expandedAllocations, setExpandedAllocations] = useState<Set<number>>(
		new Set(),
	);
	const [sortColumn, setSortColumn] = useState<string>("Monthly Amount");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

	const toggleExpanded = (allocationId: number) => {
		const newExpanded = new Set(expandedAllocations);
		if (newExpanded.has(allocationId)) {
			newExpanded.delete(allocationId);
		} else {
			newExpanded.add(allocationId);
		}
		setExpandedAllocations(newExpanded);
	};

	const handleSort = (columnName: string) => {
		if (sortColumn === columnName) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(columnName);
			setSortDirection("desc");
		}
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

	const calculateSpendingTotals = (allocationId: number) => {
		const spendings = mockSpendings[allocationId] || [];
		const totalSpent = spendings.reduce(
			(sum, spending) => sum + spending.amount,
			0,
		);
		return { spendings, totalSpent };
	};

	const sortedAllocations = [...budgetAllocations].sort((a, b) => {
		let aValue: number | string;
		let bValue: number | string;

		switch (sortColumn) {
			case "Name":
				aValue = a.name;
				bValue = b.name;
				break;
			case "Value":
				aValue = a.value;
				bValue = b.value;
				break;
			case "Type":
				aValue = a.type;
				bValue = b.type;
				break;
			default:
				aValue = calculateEffectiveMonthlyAmount(a);
				bValue = calculateEffectiveMonthlyAmount(b);
				break;
		}

		if (typeof aValue === "string" && typeof bValue === "string") {
			return sortDirection === "asc"
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue);
		}

		return sortDirection === "asc"
			? (aValue as number) - (bValue as number)
			: (bValue as number) - (aValue as number);
	});

	const getSortIcon = (columnName: string) => {
		if (sortColumn !== columnName) return null;
		return sortDirection === "asc" ? (
			<ChevronUp className="h-4 w-4" />
		) : (
			<ChevronDown className="h-4 w-4" />
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

			<div className="space-y-3">
				{/* Headers */}
				<div className="grid grid-cols-6 font-medium text-text-gray">
					<button
						type="button"
						className="flex cursor-pointer select-none items-center gap-1 text-left"
						onClick={() => handleSort("Name")}
					>
						Name
						{getSortIcon("Name")}
					</button>
					<button
						type="button"
						className="flex cursor-pointer select-none items-center gap-1 text-left"
						onClick={() => handleSort("Value")}
					>
						Value
						{getSortIcon("Value")}
					</button>
					<button
						type="button"
						className="flex cursor-pointer select-none items-center gap-1 text-left"
						onClick={() => handleSort("Type")}
					>
						Type
						{getSortIcon("Type")}
					</button>
					<button
						type="button"
						className="flex cursor-pointer select-none items-center gap-1 text-left"
						onClick={() => handleSort("Monthly Amount")}
					>
						Monthly Amount
						{getSortIcon("Monthly Amount")}
					</button>
					<span>Spending Status</span>
					<span className="text-right">Actions</span>
				</div>

				{/* Entries */}
				{sortedAllocations.length === 0 ? (
					<div className="py-4 text-center text-text-gray">
						No budget allocations. Click 'Add' to create one.
					</div>
				) : (
					sortedAllocations.map((allocation, index) => {
						const effectiveAmount = calculateEffectiveMonthlyAmount(allocation);
						const { spendings, totalSpent } = calculateSpendingTotals(
							allocation.id,
						);
						const remainingAmount = effectiveAmount - totalSpent;
						const isExpanded = expandedAllocations.has(allocation.id);
						const spentPercentage =
							effectiveAmount > 0 ? (totalSpent / effectiveAmount) * 100 : 0;

						return (
							<div key={allocation.id}>
								{/* Main allocation row */}
								<div className="grid grid-cols-6 items-center border-secondary-slate/30 border-b py-2">
									{/* Name column with expand button */}
									<div className="flex items-center gap-2">
										<Button
											variant="ghost"
											size="sm"
											onClick={() => toggleExpanded(allocation.id)}
											className="h-6 w-6 p-0"
										>
											{isExpanded ? (
												<ChevronDown className="h-4 w-4" />
											) : (
												<ChevronRight className="h-4 w-4" />
											)}
										</Button>
										<div
											className={`h-4 w-4 rounded-sm ${ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}`}
										/>
										<span>{allocation.name}</span>
									</div>

									{/* Value */}
									<span className="font-medium">
										{allocation.valueType === "percent"
											? `${allocation.value}%`
											: `${allocation.value.toLocaleString()} ${allocation.currency}`}
									</span>

									{/* Type */}
									<span>{allocation.type}</span>

									{/* Monthly Amount */}
									<span className="font-medium">
										{Math.round(effectiveAmount).toLocaleString()}{" "}
										{allocation.currency}
									</span>

									{/* Spending Status */}
									<div className="text-sm">
										{totalSpent > 0 ? (
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-medium text-accent-coral">
														{totalSpent.toLocaleString()} {allocation.currency}
													</span>
													<span className="rounded bg-accent-coral/20 px-2 py-1 text-accent-coral text-xs">
														{spentPercentage.toFixed(1)}%
													</span>
												</div>
												<div className="flex items-center gap-2">
													<span
														className={
															remainingAmount >= 0
																? "text-accent-lime"
																: "text-accent-coral"
														}
													>
														{remainingAmount.toLocaleString()}{" "}
														{allocation.currency}
													</span>
													<span
														className={`rounded px-2 py-1 text-xs ${
															remainingAmount >= 0
																? "bg-accent-lime/20 text-accent-lime"
																: "bg-accent-coral/20 text-accent-coral"
														}`}
													>
														{(100 - spentPercentage).toFixed(1)}%
													</span>
												</div>
											</div>
										) : (
											<span className="text-text-gray">No spendings</span>
										)}
									</div>

									{/* Actions */}
									<div className="flex justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onAddSpending(allocation.id)}
											className="flex items-center gap-1"
										>
											<PlusCircle className="h-4 w-4" />
											<span>Add</span>
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onEdit(allocation)}
										>
											<Edit2 className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => onDelete(allocation)}
											className="text-accent-coral hover:text-accent-coral/80"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>

								{/* Expanded spending details - directly below the row */}
								{isExpanded && (
									<div className="mb-3 ml-8 rounded-r-lg border-l-4 border-l-primary-teal bg-secondary-slate/20">
										<div className="p-4">
											<h4 className="mb-3 font-medium text-text-white">
												Spendings for {allocation.name}
											</h4>
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
																		{spending.amount.toLocaleString()}{" "}
																		{spending.currency}
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
								)}
							</div>
						);
					})
				)}
			</div>
		</Card>
	);
}
