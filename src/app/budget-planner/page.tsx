"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { ConfirmDeleteDialog } from "~/app/_components/ui/confirm-delete-dialog";
import { api } from "~/trpc/react";
import { AppLayout } from "../_components/AppLayout";
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
import type { BudgetAllocation, IncomeSource } from "./components/types";

export default function BudgetPlannerPage() {
	const { data: session, status } = useSession();

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
		redirect("/overview-dashboard");
	}

	// tRPC hooks
	const utils = api.useUtils();

	// Income sources
	const { data: incomeSources, isLoading: isLoadingIncome } =
		api.income.getData.useQuery();
	const createIncomeSource = api.income.create.useMutation({
		onSuccess: () => {
			void utils.income.getData.invalidate();
		},
	});
	const updateIncomeSource = api.income.update.useMutation({
		onSuccess: () => {
			void utils.income.getData.invalidate();
		},
	});
	const deleteIncomeSource = api.income.delete.useMutation({
		onSuccess: () => {
			void utils.income.getData.invalidate();
		},
	});

	// Budget allocations
	const { data: budgetAllocations, isLoading: isLoadingBudget } =
		api.budget.getData.useQuery();
	const createBudgetAllocation = api.budget.create.useMutation({
		onSuccess: () => {
			void utils.budget.getData.invalidate();
		},
	});
	const updateBudgetAllocation = api.budget.update.useMutation({
		onSuccess: () => {
			void utils.budget.getData.invalidate();
		},
	});
	const deleteBudgetAllocation = api.budget.delete.useMutation({
		onSuccess: () => {
			void utils.budget.getData.invalidate();
		},
	});

	// UI state
	const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
	const [isEditIncomeOpen, setIsEditIncomeOpen] = useState(false);
	const [isDeleteIncomeOpen, setIsDeleteIncomeOpen] = useState(false);
	const [currentIncomeSource, setCurrentIncomeSource] = useState<IncomeSource>({
		id: 0,
		name: "",
		amount: 0,
		currency: "RON",
		type: "monthly",
		taxPercentage: 0,
	});

	const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
	const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);
	const [isDeleteBudgetOpen, setIsDeleteBudgetOpen] = useState(false);
	const [currentBudgetAllocation, setCurrentBudgetAllocation] =
		useState<BudgetAllocation>({
			id: 0,
			name: "",
			value: 0,
			currency: "RON",
			type: "monthly",
			valueType: "absolute",
		});

	if (isLoadingIncome || isLoadingBudget) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
				<div className="text-2xl">Loading...</div>
			</div>
		);
	}

	// Fallback if data is not available
	const sources = incomeSources ?? [];
	const allocations = budgetAllocations ?? [];

	// Calculate income totals
	const totalMonthlyIncome = calculateTotalMonthlyIncome(sources);
	const totalYearlyIncome = calculateTotalYearlyIncome(sources);
	const annualIncome = totalMonthlyIncome * 12 + totalYearlyIncome;

	// Calculate total budgets
	const totalMonthlyBudget = calculateTotalMonthlyBudget(
		allocations,
		totalMonthlyIncome,
		totalYearlyIncome,
	);

	const totalYearlyBudget = calculateTotalYearlyBudget(
		allocations,
		totalMonthlyIncome,
		totalYearlyIncome,
	);

	// Calculate remaining income
	const remainingMonthlyIncome = totalMonthlyIncome - totalMonthlyBudget;
	const remainingYearlyIncome = totalYearlyIncome - totalYearlyBudget;

	// Calculate allocations for visualization
	const monthlyAllocations = calculateMonthlyAllocations(
		allocations,
		totalMonthlyIncome,
		totalYearlyIncome,
	);

	const yearlyAllocations = calculateYearlyAllocations(
		allocations,
		totalMonthlyIncome,
		totalYearlyIncome,
	);

	// Income source handlers
	const handleAddIncome = () => {
		setCurrentIncomeSource({
			id: 0,
			name: "",
			amount: 0,
			currency: "RON",
			type: "monthly",
			taxPercentage: 0,
		});
		setIsAddIncomeOpen(true);
	};

	const handleEditIncome = (source: IncomeSource) => {
		setCurrentIncomeSource(source);
		setIsEditIncomeOpen(true);
	};

	const handleDeleteIncome = (source: IncomeSource) => {
		setCurrentIncomeSource(source);
		setIsDeleteIncomeOpen(true);
	};

	const handleIncomeInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setCurrentIncomeSource((prev) => ({
			...prev,
			[name]:
				name === "amount" || name === "taxPercentage" ? Number(value) : value,
		}));
	};

	const handleIncomeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentIncomeSource((prev) => ({
			...prev,
			type: e.target.value as "monthly" | "yearly",
		}));
	};

	const handleAddIncomeSubmit = () => {
		createIncomeSource.mutate({
			name: currentIncomeSource.name,
			amount: currentIncomeSource.amount,
			currency: currentIncomeSource.currency,
			type: currentIncomeSource.type,
			taxPercentage: currentIncomeSource.taxPercentage,
		});
		setIsAddIncomeOpen(false);
	};

	const handleEditIncomeSubmit = () => {
		updateIncomeSource.mutate({
			id: currentIncomeSource.id,
			name: currentIncomeSource.name,
			amount: currentIncomeSource.amount,
			currency: currentIncomeSource.currency,
			type: currentIncomeSource.type,
			taxPercentage: currentIncomeSource.taxPercentage,
		});
		setIsEditIncomeOpen(false);
	};

	const handleDeleteIncomeConfirm = () => {
		deleteIncomeSource.mutate({ id: currentIncomeSource.id });
		setIsDeleteIncomeOpen(false);
	};

	// Budget allocation handlers
	const handleAddBudget = () => {
		setCurrentBudgetAllocation({
			id: 0,
			name: "",
			value: 0,
			currency: "RON",
			type: "monthly",
			valueType: "absolute",
		});
		setIsAddBudgetOpen(true);
	};

	const handleEditBudget = (allocation: BudgetAllocation) => {
		setCurrentBudgetAllocation(allocation);
		setIsEditBudgetOpen(true);
	};

	const handleDeleteBudget = (allocation: BudgetAllocation) => {
		setCurrentBudgetAllocation(allocation);
		setIsDeleteBudgetOpen(true);
	};

	const handleBudgetInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setCurrentBudgetAllocation((prev) => ({
			...prev,
			[name]: name === "value" ? Number(value) : value,
		}));
	};

	const handleBudgetTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentBudgetAllocation((prev) => ({
			...prev,
			type: e.target.value as "monthly" | "yearly",
		}));
	};

	const handleBudgetValueTypeChange = (
		e: React.ChangeEvent<HTMLSelectElement>,
	) => {
		setCurrentBudgetAllocation((prev) => ({
			...prev,
			valueType: e.target.value as "absolute" | "percent",
		}));
	};

	const handleAddBudgetSubmit = () => {
		createBudgetAllocation.mutate({
			name: currentBudgetAllocation.name,
			value: currentBudgetAllocation.value,
			currency: currentBudgetAllocation.currency,
			type: currentBudgetAllocation.type,
			valueType: currentBudgetAllocation.valueType,
		});
		setIsAddBudgetOpen(false);
	};

	const handleEditBudgetSubmit = () => {
		updateBudgetAllocation.mutate({
			id: currentBudgetAllocation.id,
			name: currentBudgetAllocation.name,
			value: currentBudgetAllocation.value,
			currency: currentBudgetAllocation.currency,
			type: currentBudgetAllocation.type,
			valueType: currentBudgetAllocation.valueType,
		});
		setIsEditBudgetOpen(false);
	};

	const handleDeleteBudgetConfirm = () => {
		deleteBudgetAllocation.mutate({ id: currentBudgetAllocation.id });
		setIsDeleteBudgetOpen(false);
	};

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
					totalSpentIncome={totalMonthlyBudget}
					currency="RON"
				/>

				{/* Yearly Budget Overview Card */}
				<BudgetOverviewCard
					title="Yearly Budget Overview"
					totalIncome={totalYearlyIncome}
					allocations={yearlyAllocations}
					remainingIncome={remainingYearlyIncome}
					totalSpentIncome={totalYearlyBudget}
					currency="RON"
				/>
			</div>

			{/* Income Sources */}
			<div className="mb-8">
				<IncomeSourceTable
					incomeSources={sources}
					onAdd={handleAddIncome}
					onEdit={handleEditIncome}
					onDelete={handleDeleteIncome}
				/>
			</div>

			{/* Budget Allocations */}
			<div className="mb-8">
				<BudgetAllocationTable
					budgetAllocations={allocations}
					totalMonthlyIncome={totalMonthlyIncome}
					totalYearlyIncome={totalYearlyIncome}
					onAdd={handleAddBudget}
					onEdit={handleEditBudget}
					onDelete={handleDeleteBudget}
				/>
			</div>

			{/* Income Forms */}
			<IncomeSourceForm
				isEditing={isEditIncomeOpen}
				isOpen={isAddIncomeOpen || isEditIncomeOpen}
				currentSource={currentIncomeSource}
				onOpenChange={(open) =>
					isEditIncomeOpen
						? setIsEditIncomeOpen(open)
						: setIsAddIncomeOpen(open)
				}
				onInputChange={handleIncomeInputChange}
				onTypeChange={handleIncomeTypeChange}
				onSubmit={
					isEditIncomeOpen ? handleEditIncomeSubmit : handleAddIncomeSubmit
				}
			/>

			{/* Budget Forms */}
			<BudgetAllocationForm
				isEditing={isEditBudgetOpen}
				isOpen={isAddBudgetOpen || isEditBudgetOpen}
				currentAllocation={currentBudgetAllocation}
				onOpenChange={(open) =>
					isEditBudgetOpen
						? setIsEditBudgetOpen(open)
						: setIsAddBudgetOpen(open)
				}
				onInputChange={handleBudgetInputChange}
				onTypeChange={handleBudgetTypeChange}
				onValueTypeChange={handleBudgetValueTypeChange}
				onSubmit={
					isEditBudgetOpen ? handleEditBudgetSubmit : handleAddBudgetSubmit
				}
			/>

			{/* Delete Confirmation Dialogs */}
			<ConfirmDeleteDialog
				open={isDeleteIncomeOpen}
				onOpenChange={setIsDeleteIncomeOpen}
				onConfirm={handleDeleteIncomeConfirm}
				title="Delete Income Source"
				description="Are you sure you want to delete this income source?"
				itemName={currentIncomeSource.name}
			/>

			<ConfirmDeleteDialog
				open={isDeleteBudgetOpen}
				onOpenChange={setIsDeleteBudgetOpen}
				onConfirm={handleDeleteBudgetConfirm}
				title="Delete Budget Allocation"
				description="Are you sure you want to delete this budget allocation?"
				itemName={currentBudgetAllocation.name}
			/>
		</div>
	);

	return <AppLayout session={session}>{BudgetPlannerContent}</AppLayout>;
}
