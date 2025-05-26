"use client";

import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ConfirmDeleteDialog } from "~/components/ui/confirm-delete-dialog";
import { type Column, DataTable } from "~/components/ui/data-table";
import { EntryForm, type FormField } from "~/components/ui/entry-form";
import { StatCard } from "~/components/ui/stat-card";
import {
	formatCurrency,
	formatDate,
	formatPercentage,
	getTodayISODate,
} from "~/lib/utils";
import { api } from "~/trpc/react";

type Debt = {
	id: number;
	name: string;
	amount: number;
	currency: string;
	interestRate: number;
	lengthMonths: number;
};

export function DebtWidget() {
	// tRPC hooks
	const utils = api.useUtils();
	const { data: debts, isLoading: isLoadingDebts } =
		api.debt.getData.useQuery();
	const createDebt = api.debt.create.useMutation({
		onSuccess: () => {
			// Invalidate the getData query to refetch the data
			void utils.debt.getData.invalidate();
		},
	});
	const updateDebt = api.debt.update.useMutation({
		onSuccess: () => {
			void utils.debt.getData.invalidate();
		},
	});
	const deleteDebt = api.debt.delete.useMutation({
		onSuccess: () => {
			void utils.debt.getData.invalidate();
		},
	});

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [currentDebt, setCurrentDebt] = useState<Debt | null>(null);
	const [formData, setFormData] = useState<Omit<Debt, "id">>({
		name: "",
		amount: 0,
		currency: "RON",
		interestRate: 0,
		lengthMonths: 0,
	});

	// If data is loading, show a loading state
	if (isLoadingDebts || !debts) {
		return (
			<Card className="col-span-full p-6">
				<h2 className="font-bold text-2xl">Debt Overview</h2>
				<p>Loading...</p>
			</Card>
		);
	}

	const totalDebt = debts.reduce((sum, debt) => sum + debt.amount, 0);

	// Calculate weighted average interest rate
	const weightedInterestSum = debts.reduce(
		(sum, debt) => sum + debt.amount * debt.interestRate,
		0,
	);
	const averageInterestRate =
		totalDebt > 0 ? weightedInterestSum / totalDebt : 0;

	// Calculate estimated yearly interest payment
	const yearlyInterestPayment = totalDebt * (averageInterestRate / 100);

	// Form handlers
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				name === "amount" || name === "interestRate" || name === "lengthMonths"
					? Number.parseFloat(value) || 0
					: value,
		}));
	};

	// Add new debt
	const handleAdd = () => {
		setFormData({
			name: "",
			amount: 0,
			currency: "RON",
			interestRate: 0,
			lengthMonths: 0,
		});
		setIsAddDialogOpen(true);
	};

	const handleAddSubmit = () => {
		createDebt.mutate(formData);
		setIsAddDialogOpen(false);
	};

	// Edit debt
	const handleEdit = (debt: Debt) => {
		setCurrentDebt(debt);
		setFormData({
			name: debt.name,
			amount: debt.amount,
			currency: debt.currency,
			interestRate: debt.interestRate,
			lengthMonths: debt.lengthMonths,
		});
		setIsEditDialogOpen(true);
	};

	const handleEditSubmit = () => {
		if (!currentDebt) return;

		updateDebt.mutate({
			id: currentDebt.id,
			...formData,
		});
		setIsEditDialogOpen(false);
	};

	// Delete debt
	const handleDelete = (debt: Debt) => {
		setCurrentDebt(debt);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!currentDebt) return;

		deleteDebt.mutate({ id: currentDebt.id });
		setIsDeleteDialogOpen(false);
	};

	// Form fields configuration
	const formFields: FormField[] = [
		{ id: "name", name: "name", label: "Debt Name", type: "text" },
		{ id: "amount", name: "amount", label: "Amount", type: "number" },
		{
			id: "currency",
			name: "currency",
			label: "Currency",
			type: "text",
			disabled: true,
		},
		{
			id: "interestRate",
			name: "interestRate",
			label: "Interest Rate (%)",
			type: "number",
		},
		{
			id: "lengthMonths",
			name: "lengthMonths",
			label: "Term (months)",
			type: "number",
		},
	];

	// Table columns configuration
	const columns: Column<Debt>[] = [
		{ header: "Debt", accessorKey: "name" },
		{
			header: "Amount",
			accessorKey: (debt) => (
				<span className="font-medium text-accent-coral">
					{debt.amount.toLocaleString()}
				</span>
			),
		},
		{ header: "Currency", accessorKey: "currency" },
		{
			header: "Interest Rate",
			accessorKey: (debt) => formatPercentage(debt.interestRate),
		},
		{
			header: "Term",
			accessorKey: (debt) => `${debt.lengthMonths} months`,
		},
	];

	return (
		<Card className="col-span-full p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-bold text-2xl">Debt Overview</h2>
				<Button
					onClick={handleAdd}
					size="sm"
					className="flex items-center gap-1"
				>
					<PlusCircle className="h-4 w-4" />
					<span>Add</span>
				</Button>
			</div>

			{/* Summary Section */}
			<div className="mb-6 grid grid-cols-3 gap-4">
				<StatCard
					label="Total Debt"
					value={totalDebt}
					suffix=" RON"
					className="text-accent-coral"
				/>
				<StatCard
					label="Avg. Interest Rate"
					value={formatPercentage(averageInterestRate)}
				/>
				<StatCard
					label="Est. Yearly Interest"
					value={Math.round(yearlyInterestPayment)}
					suffix=" RON"
					className="text-accent-coral"
				/>
			</div>

			{/* Debts List */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">All Debts</h3>
				<DataTable
					columns={columns}
					data={debts}
					keyField="id"
					onEdit={handleEdit}
					onDelete={handleDelete}
					emptyMessage="No debts. Click 'Add' to create one."
				/>
			</div>

			{/* Add/Edit Forms using EntryForm */}
			<EntryForm
				title="Add Debt"
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleAddSubmit}
				submitLabel="Add Debt"
			/>

			<EntryForm
				title="Edit Debt"
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleEditSubmit}
				submitLabel="Save Changes"
			/>

			{/* Delete Confirmation */}
			{currentDebt && (
				<ConfirmDeleteDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeleteConfirm}
					title="Delete Debt"
					description="Are you sure you want to delete this debt?"
					itemName={currentDebt.name}
				/>
			)}
		</Card>
	);
}
