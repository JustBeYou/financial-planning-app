"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { AppLayout } from "../_components/AppLayout";
import { LoginForm } from "../_components/login-form";
import { BudgetAllocationForm } from "./components/BudgetAllocationForm";
import { BudgetAllocationTable } from "./components/BudgetAllocationTable";
import { BudgetOverviewCard } from "./components/BudgetOverviewCard";
import { IncomeSourceForm } from "./components/IncomeSourceForm";
import { IncomeSourceTable } from "./components/IncomeSourceTable";
import {
	calculateMonthlyAllocations,
	calculateTotalMonthlyBudget,
	calculateTotalMonthlyIncome,
	calculateTotalYearlyBudget,
	calculateTotalYearlyIncome,
	calculateYearlyAllocations,
} from "./components/calculations";
import type {
	BudgetAllocation,
	BudgetAllocationType,
	BudgetValueType,
	IncomeSource,
	IncomeType,
} from "./components/types";

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

	// Calculate totals
	const totalMonthlyIncome = calculateTotalMonthlyIncome(incomeSources);
	const totalYearlyIncome = calculateTotalYearlyIncome(incomeSources);
	const totalMonthlyBudget = calculateTotalMonthlyBudget(
		budgetAllocations,
		totalMonthlyIncome,
		totalYearlyIncome,
	);
	const totalYearlyBudget = calculateTotalYearlyBudget(
		budgetAllocations,
		totalMonthlyIncome,
		totalYearlyIncome,
	);

	// Calculate remaining income
	const remainingMonthlyIncome = totalMonthlyIncome - totalMonthlyBudget;
	const remainingYearlyIncome = totalYearlyIncome - totalYearlyBudget;

	// Calculate allocations for visualization
	const monthlyAllocations = calculateMonthlyAllocations(
		budgetAllocations,
		totalMonthlyIncome,
		totalYearlyIncome,
	);
	const yearlyAllocations = calculateYearlyAllocations(
		budgetAllocations,
		totalMonthlyIncome,
		totalYearlyIncome,
	);

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

	const handleIncomeInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setCurrentIncomeSource({
			...currentIncomeSource,
			[name]:
				name === "amount" || name === "taxPercentage" ? Number(value) : value,
		});
	};

	const handleIncomeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
			{/* Budget Overview Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Monthly Budget Overview Card */}
				<BudgetOverviewCard
					title="Monthly Budget Overview"
					totalIncome={totalMonthlyIncome}
					allocations={monthlyAllocations}
					remainingIncome={remainingMonthlyIncome}
					currency="RON"
				/>

				{/* Yearly Budget Overview Card */}
				<BudgetOverviewCard
					title="Yearly Budget Overview"
					totalIncome={totalYearlyIncome}
					allocations={yearlyAllocations}
					remainingIncome={remainingYearlyIncome}
					currency="RON"
				/>
			</div>

			{/* Income Sources Table */}
			<IncomeSourceTable
				incomeSources={incomeSources}
				onAdd={handleAddIncome}
				onEdit={handleEditIncome}
				onDelete={handleDeleteIncome}
			/>

			{/* Budget Allocations Table */}
			<BudgetAllocationTable
				budgetAllocations={budgetAllocations}
				totalMonthlyIncome={totalMonthlyIncome}
				totalYearlyIncome={totalYearlyIncome}
				onAdd={handleAddBudget}
				onEdit={handleEditBudget}
				onDelete={handleDeleteBudget}
			/>

			{/* Income Source Form */}
			<IncomeSourceForm
				isEditing={isEditingIncome}
				isOpen={isAddingIncome || isEditingIncome}
				currentSource={currentIncomeSource}
				onOpenChange={(open) => {
					if (!open) {
						setIsAddingIncome(false);
						setIsEditingIncome(false);
					}
				}}
				onInputChange={handleIncomeInputChange}
				onTypeChange={handleIncomeTypeChange}
				onSubmit={handleSaveIncome}
			/>

			{/* Budget Allocation Form */}
			<BudgetAllocationForm
				isEditing={isEditingBudget}
				isOpen={isAddingBudget || isEditingBudget}
				currentAllocation={currentBudgetAllocation}
				onOpenChange={(open) => {
					if (!open) {
						setIsAddingBudget(false);
						setIsEditingBudget(false);
					}
				}}
				onInputChange={handleBudgetInputChange}
				onTypeChange={handleBudgetTypeChange}
				onValueTypeChange={handleValueTypeChange}
				onSubmit={handleSaveBudget}
			/>
		</div>
	);

	return <AppLayout session={session}>{BudgetPlannerContent}</AppLayout>;
}
