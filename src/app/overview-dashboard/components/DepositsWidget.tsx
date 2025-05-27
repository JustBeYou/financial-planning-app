"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/app/_components/ui/button";
import { Card } from "~/app/_components/ui/card";
import { ConfirmDeleteDialog } from "~/app/_components/ui/confirm-delete-dialog";
import { type Column, DataTable } from "~/app/_components/ui/data-table";
import { EntryForm, type FormField } from "~/app/_components/ui/entry-form";
import { StatCard } from "~/app/_components/ui/stat-card";
import {
	calculateDateFromMonths,
	formatCurrency,
	formatDate,
	formatPercentage,
	getTodayISODate,
} from "~/lib/utils";
import { api } from "~/trpc/react";

type Deposit = {
	id: number;
	bankName: string;
	amount: number;
	currency: string;
	startDate: string;
	interest: number;
	lengthMonths: number;
	maturityDate: string;
};

export function DepositsWidget() {
	// tRPC hooks
	const utils = api.useUtils();
	const { data: deposits, isLoading: isLoadingDeposits } =
		api.deposits.getData.useQuery();
	const createDeposit = api.deposits.create.useMutation({
		onSuccess: () => {
			void utils.deposits.getData.invalidate();
		},
	});
	const updateDeposit = api.deposits.update.useMutation({
		onSuccess: () => {
			void utils.deposits.getData.invalidate();
		},
	});
	const deleteDeposit = api.deposits.delete.useMutation({
		onSuccess: () => {
			void utils.deposits.getData.invalidate();
		},
	});

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [currentDeposit, setCurrentDeposit] = useState<Deposit | null>(null);
	const [formData, setFormData] = useState<
		Omit<Deposit, "id" | "maturityDate">
	>({
		bankName: "",
		amount: 0,
		currency: "RON",
		startDate: getTodayISODate(),
		interest: 0,
		lengthMonths: 12,
	});

	// If data is loading, show a loading state
	if (isLoadingDeposits || !deposits) {
		return (
			<Card className="col-span-full p-6">
				<h2 className="font-bold text-2xl">Term Deposits</h2>
				<p>Loading...</p>
			</Card>
		);
	}

	// Calculate totals for display
	const totalDeposits = deposits.reduce(
		(sum, deposit) => sum + deposit.amount,
		0,
	);

	const totalEstimatedInterest = deposits.reduce((sum, deposit) => {
		const yearlyInterest = deposit.amount * (deposit.interest / 100);
		const monthlyInterest = yearlyInterest / 12;
		return sum + monthlyInterest * deposit.lengthMonths;
	}, 0);

	// Form handlers
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => {
			const updatedData = {
				...prev,
				[name]:
					name === "amount" || name === "interest" || name === "lengthMonths"
						? Number.parseFloat(value) || 0
						: value,
			};
			return updatedData;
		});
	};

	// Add new deposit
	const handleAdd = () => {
		setFormData({
			bankName: "",
			amount: 0,
			currency: "RON",
			startDate: getTodayISODate(),
			interest: 0,
			lengthMonths: 12,
		});
		setIsAddDialogOpen(true);
	};

	const handleAddSubmit = () => {
		createDeposit.mutate(formData);
		setIsAddDialogOpen(false);
	};

	// Edit deposit
	const handleEdit = (deposit: Deposit) => {
		setCurrentDeposit(deposit);
		const { id, maturityDate, ...formFields } = deposit;
		setFormData(formFields);
		setIsEditDialogOpen(true);
	};

	const handleEditSubmit = () => {
		if (!currentDeposit) return;

		updateDeposit.mutate({
			id: currentDeposit.id,
			...formData,
		});
		setIsEditDialogOpen(false);
	};

	// Delete deposit
	const handleDelete = (deposit: Deposit) => {
		setCurrentDeposit(deposit);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!currentDeposit) return;

		deleteDeposit.mutate({ id: currentDeposit.id });
		setIsDeleteDialogOpen(false);
	};

	// Form fields configuration
	const formFields: FormField[] = [
		{ id: "bankName", name: "bankName", label: "Bank Name", type: "text" },
		{ id: "amount", name: "amount", label: "Amount", type: "number" },
		{
			id: "currency",
			name: "currency",
			label: "Currency",
			type: "text",
			disabled: true,
		},
		{ id: "startDate", name: "startDate", label: "Start Date", type: "date" },
		{ id: "interest", name: "interest", label: "Interest (%)", type: "number" },
		{
			id: "lengthMonths",
			name: "lengthMonths",
			label: "Length (months)",
			type: "number",
		},
	];

	// Table columns configuration
	const columns: Column<Deposit>[] = [
		{ header: "Bank", accessorKey: "bankName" },
		{
			header: "Amount",
			accessorKey: (deposit) => (
				<span className="font-medium">{deposit.amount.toLocaleString()}</span>
			),
		},
		{ header: "Currency", accessorKey: "currency" },
		{
			header: "Start Date",
			accessorKey: (deposit) => formatDate(deposit.startDate),
		},
		{
			header: "Interest (%)",
			accessorKey: (deposit) => formatPercentage(deposit.interest),
		},
		{
			header: "Length",
			accessorKey: (deposit) => `${deposit.lengthMonths} months`,
		},
		{
			header: "Maturity Date",
			accessorKey: (deposit) => formatDate(deposit.maturityDate),
		},
	];

	return (
		<Card className="col-span-full p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-bold text-2xl">Term Deposits</h2>
				<Button
					onClick={handleAdd}
					size="sm"
					className="flex items-center gap-1"
				>
					<PlusCircle className="h-4 w-4" />
					<span>Add</span>
				</Button>
			</div>

			{/* Total Deposits and Interest */}
			<div className="mb-6 grid grid-cols-2 gap-4">
				<StatCard label="Total Principal" value={totalDeposits} suffix=" RON" />
				<StatCard
					label="Est. Interest at Maturity"
					value={Math.round(totalEstimatedInterest)}
					suffix=" RON"
					className="text-accent-lime"
				/>
			</div>

			{/* Deposits List */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">All Deposits</h3>
				<DataTable
					columns={columns}
					data={deposits}
					keyField="id"
					onEdit={handleEdit}
					onDelete={handleDelete}
					emptyMessage="No deposits. Click 'Add' to create one."
				/>
			</div>

			{/* Add/Edit Forms using EntryForm */}
			<EntryForm
				title="Add Deposit"
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleAddSubmit}
				submitLabel="Add Deposit"
			/>

			<EntryForm
				title="Edit Deposit"
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleEditSubmit}
				submitLabel="Save Changes"
			/>

			{/* Delete Confirmation */}
			{currentDeposit && (
				<ConfirmDeleteDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeleteConfirm}
					title="Delete Deposit"
					description="Are you sure you want to delete this deposit?"
					itemName={currentDeposit.bankName}
				/>
			)}
		</Card>
	);
}
