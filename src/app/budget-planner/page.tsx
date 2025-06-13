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
import { SpendingForm } from "./components/SpendingForm";
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
	IncomeSource,
	Spending,
} from "./components/types";

export default function BudgetPlannerPage() {
	const { data: session, status } = useSession();
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
			void utils.spending.getAll.invalidate();
		},
	});
	const updateBudgetAllocation = api.budget.update.useMutation({
		onSuccess: () => {
			void utils.budget.getData.invalidate();
			void utils.spending.getAll.invalidate();
		},
	});
	const deleteBudgetAllocation = api.budget.delete.useMutation({
		onSuccess: () => {
			void utils.budget.getData.invalidate();
			void utils.spending.getAll.invalidate();
		},
	});

	// Spendings
	const { data: allSpendings, isLoading: isLoadingSpendings } =
		api.spending.getAll.useQuery();
	const createSpending = api.spending.create.useMutation({
		onSuccess: () => {
			void utils.spending.getAll.invalidate();
		},
	});
	const updateSpending = api.spending.update.useMutation({
		onSuccess: () => {
			void utils.spending.getAll.invalidate();
		},
	});
	const deleteSpending = api.spending.delete.useMutation({
		onSuccess: () => {
			void utils.spending.getAll.invalidate();
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

	// Spending state management
	const [isAddSpendingOpen, setIsAddSpendingOpen] = useState(false);
	const [isEditSpendingOpen, setIsEditSpendingOpen] = useState(false);
	const [isDeleteSpendingOpen, setIsDeleteSpendingOpen] = useState(false);
	const [currentSpending, setCurrentSpending] = useState<Omit<Spending, "id">>({
		allocationId: 0,
		name: "",
		amount: 0,
		currency: "RON",
		date: new Date().toISOString().split("T")[0] || "",
		description: "",
		category: "",
	});
	const [currentSpendingId, setCurrentSpendingId] = useState<number | null>(
		null,
	);

	// Process spending data by allocation
	const spendingsByAllocation = (allSpendings ?? []).reduce(
		(acc, spending) => {
			if (!acc[spending.allocationId]) {
				acc[spending.allocationId] = [];
			}
			// Convert backend spending to frontend type
			const frontendSpending: Spending = {
				id: spending.id,
				allocationId: spending.allocationId,
				name: spending.name,
				amount: spending.amount,
				currency: spending.currency,
				date: spending.date,
				description: spending.description ?? "",
				category: spending.category ?? "",
			};
			acc[spending.allocationId]?.push(frontendSpending);
			return acc;
		},
		{} as { [allocationId: number]: Spending[] },
	);

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

	if (isLoadingIncome || isLoadingBudget || isLoadingSpendings) {
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

	// Spending handlers
	const handleAddSpending = (allocationId: number) => {
		setCurrentSpending({
			allocationId,
			name: "",
			amount: 0,
			currency: "RON",
			date: new Date().toISOString().split("T")[0] || "",
			description: "",
			category: "",
		});
		setIsAddSpendingOpen(true);
	};

	const handleEditSpending = (spending: Spending) => {
		setCurrentSpending({
			allocationId: spending.allocationId,
			name: spending.name,
			amount: spending.amount,
			currency: spending.currency,
			date: spending.date,
			description: spending.description,
			category: spending.category,
		});
		setCurrentSpendingId(spending.id);
		setIsEditSpendingOpen(true);
	};

	const handleDeleteSpending = (spending: Spending) => {
		setCurrentSpending({
			allocationId: spending.allocationId,
			name: spending.name,
			amount: spending.amount,
			currency: spending.currency,
			date: spending.date,
			description: spending.description,
			category: spending.category,
		});
		setCurrentSpendingId(spending.id);
		setIsDeleteSpendingOpen(true);
	};

	const handleSpendingInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setCurrentSpending((prev) => ({
			...prev,
			[name]: name === "amount" ? Number(value) : value,
		}));
	};

	const handleAddSpendingSubmit = () => {
		createSpending.mutate({
			allocationId: currentSpending.allocationId,
			name: currentSpending.name,
			amount: currentSpending.amount,
			currency: currentSpending.currency,
			date: currentSpending.date,
			description: currentSpending.description || undefined,
			category: currentSpending.category || undefined,
		});
		setIsAddSpendingOpen(false);
	};

	const handleEditSpendingSubmit = () => {
		if (currentSpendingId) {
			updateSpending.mutate({
				id: currentSpendingId,
				allocationId: currentSpending.allocationId,
				name: currentSpending.name,
				amount: currentSpending.amount,
				currency: currentSpending.currency,
				date: currentSpending.date,
				description: currentSpending.description || undefined,
				category: currentSpending.category || undefined,
			});
		}
		setIsEditSpendingOpen(false);
	};

	const handleDeleteSpendingConfirm = () => {
		if (currentSpendingId) {
			deleteSpending.mutate({ id: currentSpendingId });
		}
		setIsDeleteSpendingOpen(false);
	};

	return (
		<AppLayout session={session}>
			<div className="container mx-auto space-y-6 p-6">
				<div className="grid gap-6 md:grid-cols-2">
					<BudgetOverviewCard
						title="Monthly Budget Overview"
						totalIncome={totalMonthlyIncome}
						allocations={monthlyAllocations}
						remainingIncome={remainingMonthlyIncome}
						totalSpentIncome={totalMonthlyBudget}
						currency="RON"
					/>

					<BudgetOverviewCard
						title="Yearly Budget Overview"
						totalIncome={totalYearlyIncome}
						allocations={yearlyAllocations}
						remainingIncome={remainingYearlyIncome}
						totalSpentIncome={totalYearlyBudget}
						currency="RON"
					/>
				</div>

				<div className="space-y-6">
					<IncomeSourceTable
						incomeSources={sources}
						onAdd={handleAddIncome}
						onEdit={handleEditIncome}
						onDelete={handleDeleteIncome}
					/>

					<BudgetAllocationTable
						budgetAllocations={allocations}
						totalMonthlyIncome={totalMonthlyIncome}
						totalYearlyIncome={totalYearlyIncome}
						onAdd={handleAddBudget}
						onEdit={handleEditBudget}
						onDelete={handleDeleteBudget}
						onAddSpending={handleAddSpending}
						onEditSpending={handleEditSpending}
						onDeleteSpending={handleDeleteSpending}
						mockSpendings={spendingsByAllocation}
					/>
				</div>
			</div>

			{/* Income Source Forms */}
			<IncomeSourceForm
				isEditing={false}
				isOpen={isAddIncomeOpen}
				currentSource={currentIncomeSource}
				onOpenChange={setIsAddIncomeOpen}
				onInputChange={handleIncomeInputChange}
				onTypeChange={handleIncomeTypeChange}
				onSubmit={handleAddIncomeSubmit}
			/>

			<IncomeSourceForm
				isEditing={true}
				isOpen={isEditIncomeOpen}
				currentSource={currentIncomeSource}
				onOpenChange={setIsEditIncomeOpen}
				onInputChange={handleIncomeInputChange}
				onTypeChange={handleIncomeTypeChange}
				onSubmit={handleEditIncomeSubmit}
			/>

			{/* Budget Allocation Forms */}
			<BudgetAllocationForm
				isEditing={false}
				isOpen={isAddBudgetOpen}
				currentAllocation={currentBudgetAllocation}
				onOpenChange={setIsAddBudgetOpen}
				onInputChange={handleBudgetInputChange}
				onTypeChange={handleBudgetTypeChange}
				onValueTypeChange={handleBudgetValueTypeChange}
				onSubmit={handleAddBudgetSubmit}
			/>

			<BudgetAllocationForm
				isEditing={true}
				isOpen={isEditBudgetOpen}
				currentAllocation={currentBudgetAllocation}
				onOpenChange={setIsEditBudgetOpen}
				onInputChange={handleBudgetInputChange}
				onTypeChange={handleBudgetTypeChange}
				onValueTypeChange={handleBudgetValueTypeChange}
				onSubmit={handleEditBudgetSubmit}
			/>

			{/* Spending Forms */}
			<SpendingForm
				spending={currentSpending}
				onInputChange={handleSpendingInputChange}
				onSubmit={handleAddSpendingSubmit}
				onCancel={() => setIsAddSpendingOpen(false)}
				isEdit={false}
				isOpen={isAddSpendingOpen}
				onOpenChange={setIsAddSpendingOpen}
			/>

			<SpendingForm
				spending={currentSpending}
				onInputChange={handleSpendingInputChange}
				onSubmit={handleEditSpendingSubmit}
				onCancel={() => setIsEditSpendingOpen(false)}
				isEdit={true}
				isOpen={isEditSpendingOpen}
				onOpenChange={setIsEditSpendingOpen}
			/>

			{/* Delete Confirmation Dialogs */}
			<ConfirmDeleteDialog
				open={isDeleteIncomeOpen}
				onOpenChange={setIsDeleteIncomeOpen}
				onConfirm={handleDeleteIncomeConfirm}
				title="Delete Income Source"
				description={`Are you sure you want to delete "${currentIncomeSource.name}"?`}
				itemName={currentIncomeSource.name}
			/>

			<ConfirmDeleteDialog
				open={isDeleteBudgetOpen}
				onOpenChange={setIsDeleteBudgetOpen}
				onConfirm={handleDeleteBudgetConfirm}
				title="Delete Budget Allocation"
				description={`Are you sure you want to delete "${currentBudgetAllocation.name}"?`}
				itemName={currentBudgetAllocation.name}
			/>

			<ConfirmDeleteDialog
				open={isDeleteSpendingOpen}
				onOpenChange={setIsDeleteSpendingOpen}
				onConfirm={handleDeleteSpendingConfirm}
				title="Delete Spending"
				description={`Are you sure you want to delete "${currentSpending.name}"?`}
				itemName={currentSpending.name}
			/>
		</AppLayout>
	);
}
