"use client";

import { PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { type Column, DataTable } from "~/components/ui/data-table";
import { EntryForm, type FormField } from "~/components/ui/entry-form";
import { StatCard } from "~/components/ui/stat-card";
import { AppLayout } from "../_components/AppLayout";
import { LoginForm } from "../_components/login-form";

type IncomeType = "monthly" | "yearly";
type BudgetAllocationType = "monthly" | "yearly";
type BudgetValueType = "percent" | "absolute";

interface IncomeSource {
	id: string;
	name: string;
	amount: number;
	currency: string;
	type: IncomeType;
	taxPercentage: number;
}

interface BudgetAllocation {
	id: string;
	name: string;
	type: BudgetAllocationType;
	valueType: BudgetValueType;
	value: number;
	currency: string;
}

// Colors for budget allocation visualization
const ALLOCATION_COLORS = [
	"bg-blue-500",
	"bg-purple-500",
	"bg-pink-500",
	"bg-indigo-500",
	"bg-cyan-500",
	"bg-teal-500",
	"bg-orange-500",
	"bg-amber-500",
];

const REMAINING_COLOR = "bg-green-500";

export default function BudgetPlannerPage() {
	const { data: session, status } = useSession();
	const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
	const [budgetAllocations, setBudgetAllocations] = useState<
		BudgetAllocation[]
	>([]);
	const [isAddingIncome, setIsAddingIncome] = useState(false);
	const [isEditingIncome, setIsEditingIncome] = useState(false);
	const [isAddingBudget, setIsAddingBudget] = useState(false);
	const [isEditingBudget, setIsEditingBudget] = useState(false);
	const [currentIncomeSource, setCurrentIncomeSource] = useState<IncomeSource>({
		id: "",
		name: "",
		amount: 0,
		currency: "RON",
		type: "monthly",
		taxPercentage: 0,
	});
	const [currentBudgetAllocation, setCurrentBudgetAllocation] =
		useState<BudgetAllocation>({
			id: "",
			name: "",
			type: "monthly",
			valueType: "absolute",
			value: 0,
			currency: "RON",
		});

	// Form fields configuration
	const incomeFormFields: FormField[] = [
		{ id: "name-field", name: "name", label: "Name", type: "text" },
		{ id: "amount-field", name: "amount", label: "Amount", type: "number" },
		{
			id: "currency-field",
			name: "currency",
			label: "Currency",
			type: "text",
			disabled: true,
		},
		{ id: "tax-field", name: "taxPercentage", label: "Tax %", type: "number" },
	];

	const budgetFormFields: FormField[] = [
		{ id: "name-field", name: "name", label: "Name", type: "text" },
		{ id: "value-field", name: "value", label: "Value", type: "number" },
		{
			id: "currency-field",
			name: "currency",
			label: "Currency",
			type: "text",
			disabled: true,
		},
	];

	// Calculate totals
	const totalMonthlyIncome = incomeSources.reduce((total, source) => {
		const amount = source.amount * (1 - source.taxPercentage / 100);
		return total + (source.type === "monthly" ? amount : amount / 12);
	}, 0);

	const totalYearlyIncome = incomeSources.reduce((total, source) => {
		const amount = source.amount * (1 - source.taxPercentage / 100);
		return total + (source.type === "yearly" ? amount : amount * 12);
	}, 0);

	// Calculate total budget allocations
	const totalMonthlyBudget = budgetAllocations.reduce((total, allocation) => {
		if (allocation.type === "monthly") {
			if (allocation.valueType === "absolute") {
				return total + allocation.value;
			} else {
				// Percentage of monthly income
				return total + (totalMonthlyIncome * allocation.value) / 100;
			}
		} else {
			// Yearly allocation converted to monthly
			if (allocation.valueType === "absolute") {
				return total + allocation.value / 12;
			} else {
				// Percentage of yearly income converted to monthly
				return total + (totalYearlyIncome * allocation.value) / 100 / 12;
			}
		}
	}, 0);

	const totalYearlyBudget = budgetAllocations.reduce((total, allocation) => {
		if (allocation.type === "yearly") {
			if (allocation.valueType === "absolute") {
				return total + allocation.value;
			} else {
				// Percentage of yearly income
				return total + (totalYearlyIncome * allocation.value) / 100;
			}
		} else {
			// Monthly allocation converted to yearly
			if (allocation.valueType === "absolute") {
				return total + allocation.value * 12;
			} else {
				// Percentage of monthly income converted to yearly
				return total + ((totalMonthlyIncome * allocation.value) / 100) * 12;
			}
		}
	}, 0);

	// Calculate remaining income
	const remainingMonthlyIncome = totalMonthlyIncome - totalMonthlyBudget;
	const remainingYearlyIncome = totalYearlyIncome - totalYearlyBudget;

	// Calculate monthly allocations for visualization
	const monthlyAllocations = budgetAllocations.map((allocation) => {
		let effectiveAmount;
		if (allocation.type === "monthly") {
			if (allocation.valueType === "absolute") {
				effectiveAmount = allocation.value;
			} else {
				effectiveAmount = (totalMonthlyIncome * allocation.value) / 100;
			}
		} else {
			// Yearly to monthly
			if (allocation.valueType === "absolute") {
				effectiveAmount = allocation.value / 12;
			} else {
				effectiveAmount = (totalYearlyIncome * allocation.value) / 100 / 12;
			}
		}
		return {
			id: allocation.id,
			name: allocation.name,
			amount: effectiveAmount,
			percentage: totalMonthlyIncome > 0 ? (effectiveAmount / totalMonthlyIncome) * 100 : 0,
		};
	});

	// Calculate yearly allocations for visualization
	const yearlyAllocations = budgetAllocations.map((allocation) => {
		let effectiveAmount;
		if (allocation.type === "yearly") {
			if (allocation.valueType === "absolute") {
				effectiveAmount = allocation.value;
			} else {
				effectiveAmount = (totalYearlyIncome * allocation.value) / 100;
			}
		} else {
			// Monthly to yearly
			if (allocation.valueType === "absolute") {
				effectiveAmount = allocation.value * 12;
			} else {
				effectiveAmount = (totalMonthlyIncome * allocation.value) / 100 * 12;
			}
		}
		return {
			id: allocation.id,
			name: allocation.name,
			amount: effectiveAmount,
			percentage: totalYearlyIncome > 0 ? (effectiveAmount / totalYearlyIncome) * 100 : 0,
		};
	});

	// Sort allocations from largest to smallest
	const sortedMonthlyAllocations = [...monthlyAllocations].sort((a, b) => b.amount - a.amount);
	const sortedYearlyAllocations = [...yearlyAllocations].sort((a, b) => b.amount - a.amount);

	// Add remaining income to visualizations
	const monthlyWithRemaining = [...sortedMonthlyAllocations];
	if (remainingMonthlyIncome > 0) {
		monthlyWithRemaining.push({
			id: "remaining",
			name: "Remaining Income",
			amount: remainingMonthlyIncome,
			percentage: totalMonthlyIncome > 0 ? (remainingMonthlyIncome / totalMonthlyIncome) * 100 : 0,
		});
	}

	const yearlyWithRemaining = [...sortedYearlyAllocations];
	if (remainingYearlyIncome > 0) {
		yearlyWithRemaining.push({
			id: "remaining",
			name: "Remaining Income",
			amount: remainingYearlyIncome,
			percentage: totalYearlyIncome > 0 ? (remainingYearlyIncome / totalYearlyIncome) * 100 : 0,
		});
	}

	// Event handlers for income sources
	const handleAddIncome = () => {
		setCurrentIncomeSource({
			id: "",
			name: "",
			amount: 0,
			currency: "RON",
			type: "monthly",
			taxPercentage: 0,
		});
		setIsAddingIncome(true);
	};

	const handleEditIncome = (income: IncomeSource) => {
		setCurrentIncomeSource(income);
		setIsEditingIncome(true);
	};

	const handleDeleteIncome = (income: IncomeSource) => {
		setIncomeSources(incomeSources.filter((source) => source.id !== income.id));
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setCurrentIncomeSource({
			...currentIncomeSource,
			[name]:
				name === "amount" || name === "taxPercentage" ? Number(value) : value,
		});
	};

	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentIncomeSource({
			...currentIncomeSource,
			type: e.target.value as IncomeType,
		});
	};

	const handleSaveIncome = () => {
		if (isEditingIncome) {
			setIncomeSources(
				incomeSources.map((source) =>
					source.id === currentIncomeSource.id ? currentIncomeSource : source,
				),
			);
			setIsEditingIncome(false);
		} else {
			const newIncomeSource = {
				...currentIncomeSource,
				id: crypto.randomUUID(),
			};
			setIncomeSources([...incomeSources, newIncomeSource]);
			setIsAddingIncome(false);
		}
	};

	// Event handlers for budget allocations
	const handleAddBudget = () => {
		setCurrentBudgetAllocation({
			id: "",
			name: "",
			type: "monthly",
			valueType: "absolute",
			value: 0,
			currency: "RON",
		});
		setIsAddingBudget(true);
	};

	const handleEditBudget = (budget: BudgetAllocation) => {
		setCurrentBudgetAllocation(budget);
		setIsEditingBudget(true);
	};

	const handleDeleteBudget = (budget: BudgetAllocation) => {
		setBudgetAllocations(
			budgetAllocations.filter((allocation) => allocation.id !== budget.id),
		);
	};

	const handleBudgetInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setCurrentBudgetAllocation({
			...currentBudgetAllocation,
			[name]: name === "value" ? Number(value) : value,
		});
	};

	const handleBudgetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentBudgetAllocation({
			...currentBudgetAllocation,
			type: e.target.value as BudgetAllocationType,
		});
	};

	const handleValueTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentBudgetAllocation({
			...currentBudgetAllocation,
			valueType: e.target.value as BudgetValueType,
		});
	};

	const handleSaveBudget = () => {
		if (isEditingBudget) {
			setBudgetAllocations(
				budgetAllocations.map((allocation) =>
					allocation.id === currentBudgetAllocation.id
						? currentBudgetAllocation
						: allocation,
				),
			);
			setIsEditingBudget(false);
		} else {
			const newBudgetAllocation = {
				...currentBudgetAllocation,
				id: crypto.randomUUID(),
			};
			setBudgetAllocations([...budgetAllocations, newBudgetAllocation]);
			setIsAddingBudget(false);
		}
	};

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
			header: "Net Amount",
			accessorKey: (income) => {
				const netAmount = income.amount * (1 - income.taxPercentage / 100);
				return `${netAmount.toLocaleString()} ${income.currency}`;
			},
		},
	];

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
				let effectiveAmount;
				if (budget.valueType === "absolute") {
					// Convert yearly to monthly if needed
					effectiveAmount = budget.type === "monthly"
						? budget.value
						: budget.value / 12;
				} else {
					// Percentage - always calculate as monthly
					effectiveAmount = budget.type === "monthly"
						? (totalMonthlyIncome * budget.value) / 100
						: (totalYearlyIncome * budget.value) / 100 / 12;
				}
				return `${Math.round(effectiveAmount).toLocaleString()} ${budget.currency}`;
			},
		},
	];

	// Show loading state while checking session
	if (status === "loading") {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
				<div className="text-2xl">Loading...</div>
			</div>
		);
	}

	// Show login form if not authenticated
	if (!session?.user) {
		return <LoginForm />;
	}

	// Render budget planner content
	const BudgetPlannerContent = (
		<div className="space-y-6">
			{/* Income Summary Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<div className="p-6">
						<StatCard
							label="Total Monthly Income (After Tax)"
							value={Math.round(totalMonthlyIncome)}
							suffix=" RON"
							className="text-accent-lime"
						/>
					</div>
				</Card>
				<Card>
					<div className="p-6">
						<StatCard
							label="Total Yearly Income (After Tax)"
							value={Math.round(totalYearlyIncome)}
							suffix=" RON"
							className="text-accent-lime"
						/>
					</div>
				</Card>
			</div>

			{/* Remaining Income Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<div className="p-6">
						<StatCard
							label="Remaining Monthly Income"
							value={Math.round(remainingMonthlyIncome)}
							suffix=" RON"
							className={
								remainingMonthlyIncome >= 0
									? "text-accent-lime"
									: "text-red-500"
							}
						/>
					</div>
				</Card>
				<Card>
					<div className="p-6">
						<StatCard
							label="Remaining Yearly Income"
							value={Math.round(remainingYearlyIncome)}
							suffix=" RON"
							className={
								remainingYearlyIncome >= 0 ? "text-accent-lime" : "text-red-500"
							}
						/>
					</div>
				</Card>
			</div>

			{/* Budget Overview Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Monthly Budget Overview Card */}
				<Card className="p-6">
					<h2 className="mb-4 text-2xl font-bold">Monthly Budget Overview</h2>

					{totalMonthlyIncome > 0 ? (
						<>
							{/* Visual representation */}
							<div className="mb-4 flex h-8 w-full overflow-hidden rounded-lg">
								{monthlyWithRemaining.map((item, index) => (
									<div
										key={item.id}
										className={`${item.id === "remaining" ? REMAINING_COLOR : ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}`}
										style={{ width: `${item.percentage}%` }}
										title={`${item.name}: ${Math.round(item.percentage)}%`}
									/>
								))}
							</div>

							{/* Legend and details */}
							<div className="space-y-2">
								{monthlyWithRemaining.map((item, index) => (
									<div key={item.id} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div
												className={`h-4 w-4 rounded-sm ${item.id === "remaining" ? REMAINING_COLOR : ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}`}
											/>
											<span>{item.name}</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="text-sm text-muted-foreground">{Math.round(item.percentage)}%</span>
											<span className="font-medium">{Math.round(item.amount).toLocaleString()} RON</span>
										</div>
									</div>
								))}
							</div>
						</>
					) : (
						<div className="text-center text-muted-foreground">
							Add income sources to see budget overview
						</div>
					)}
				</Card>

				{/* Yearly Budget Overview Card */}
				<Card className="p-6">
					<h2 className="mb-4 text-2xl font-bold">Yearly Budget Overview</h2>

					{totalYearlyIncome > 0 ? (
						<>
							{/* Visual representation */}
							<div className="mb-4 flex h-8 w-full overflow-hidden rounded-lg">
								{yearlyWithRemaining.map((item, index) => (
									<div
										key={item.id}
										className={`${item.id === "remaining" ? REMAINING_COLOR : ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}`}
										style={{ width: `${item.percentage}%` }}
										title={`${item.name}: ${Math.round(item.percentage)}%`}
									/>
								))}
							</div>

							{/* Legend and details */}
							<div className="space-y-2">
								{yearlyWithRemaining.map((item, index) => (
									<div key={item.id} className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<div
												className={`h-4 w-4 rounded-sm ${item.id === "remaining" ? REMAINING_COLOR : ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}`}
											/>
											<span>{item.name}</span>
										</div>
										<div className="flex items-center gap-3">
											<span className="text-sm text-muted-foreground">{Math.round(item.percentage)}%</span>
											<span className="font-medium">{Math.round(item.amount).toLocaleString()} RON</span>
										</div>
									</div>
								))}
							</div>
						</>
					) : (
						<div className="text-center text-muted-foreground">
							Add income sources to see budget overview
						</div>
					)}
				</Card>
			</div>

			{/* Income Sources Card */}
			<Card className="p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-bold text-2xl">Income Sources</h2>
					<Button
						onClick={handleAddIncome}
						size="sm"
						className="flex items-center gap-1"
					>
						<PlusCircle className="h-4 w-4" />
						<span>Add</span>
					</Button>
				</div>

				<DataTable
					columns={columns}
					data={incomeSources}
					keyField="id"
					onEdit={handleEditIncome}
					onDelete={handleDeleteIncome}
					emptyMessage="No income sources. Click 'Add' to create one."
				/>
			</Card>

			{/* Budget Allocations Card */}
			<Card className="p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-bold text-2xl">Budget Allocations</h2>
					<Button
						onClick={handleAddBudget}
						size="sm"
						className="flex items-center gap-1"
					>
						<PlusCircle className="h-4 w-4" />
						<span>Add</span>
					</Button>
				</div>

				<DataTable
					columns={budgetColumns}
					data={budgetAllocations}
					keyField="id"
					onEdit={handleEditBudget}
					onDelete={handleDeleteBudget}
					emptyMessage="No budget allocations. Click 'Add' to create one."
				/>
			</Card>

			{/* Add/Edit Income Form */}
			<EntryForm
				title={isEditingIncome ? "Edit Income Source" : "Add Income Source"}
				open={isAddingIncome || isEditingIncome}
				onOpenChange={(open) => {
					if (!open) {
						setIsAddingIncome(false);
						setIsEditingIncome(false);
					}
				}}
				formFields={incomeFormFields}
				formData={{
					name: currentIncomeSource.name,
					amount: currentIncomeSource.amount,
					currency: currentIncomeSource.currency,
					taxPercentage: currentIncomeSource.taxPercentage,
				}}
				onInputChange={handleInputChange}
				onSubmit={handleSaveIncome}
				submitLabel={isEditingIncome ? "Update" : "Add"}
			>
				<div className="grid grid-cols-4 items-center gap-4">
					<label htmlFor="type-field" className="text-right">
						Type
					</label>
					<select
						id="type-field"
						name="type"
						value={currentIncomeSource.type}
						onChange={handleTypeChange}
						className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
					>
						<option value="monthly">Monthly</option>
						<option value="yearly">Yearly</option>
					</select>
				</div>
			</EntryForm>

			{/* Add/Edit Budget Allocation Form */}
			<EntryForm
				title={
					isEditingBudget ? "Edit Budget Allocation" : "Add Budget Allocation"
				}
				open={isAddingBudget || isEditingBudget}
				onOpenChange={(open) => {
					if (!open) {
						setIsAddingBudget(false);
						setIsEditingBudget(false);
					}
				}}
				formFields={budgetFormFields}
				formData={{
					name: currentBudgetAllocation.name,
					value: currentBudgetAllocation.value,
					currency: currentBudgetAllocation.currency,
				}}
				onInputChange={handleBudgetInputChange}
				onSubmit={handleSaveBudget}
				submitLabel={isEditingBudget ? "Update" : "Add"}
			>
				<div className="mb-4 grid grid-cols-4 items-center gap-4">
					<label htmlFor="budget-type-field" className="text-right">
						Type
					</label>
					<select
						id="budget-type-field"
						name="type"
						value={currentBudgetAllocation.type}
						onChange={handleBudgetTypeChange}
						className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
					>
						<option value="monthly">Monthly</option>
						<option value="yearly">Yearly</option>
					</select>
				</div>
				<div className="grid grid-cols-4 items-center gap-4">
					<label htmlFor="value-type-field" className="text-right">
						Value Type
					</label>
					<select
						id="value-type-field"
						name="valueType"
						value={currentBudgetAllocation.valueType}
						onChange={handleValueTypeChange}
						className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
					>
						<option value="absolute">Absolute Value</option>
						<option value="percent">Percentage</option>
					</select>
				</div>
			</EntryForm>
		</div>
	);

	return <AppLayout session={session}>{BudgetPlannerContent}</AppLayout>;
}
