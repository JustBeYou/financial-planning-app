"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ConfirmDeleteDialog } from "~/components/ui/confirm-delete-dialog";
import { type Column, DataTable } from "~/components/ui/data-table";
import { EntryForm, type FormField } from "~/components/ui/entry-form";
import { StatCard } from "~/components/ui/stat-card";
import {
	calculateDateFromMonths,
	formatCurrency,
	formatDate,
	formatPercentage,
	generateNewId,
	getTodayISODate,
} from "~/lib/utils";

// Initial mock data
const initialDeposits = [
	{
		id: 1,
		bankName: "First Bank",
		amount: 50000,
		currency: "RON",
		startDate: "2023-10-01",
		interest: 5.25,
		lengthMonths: 12,
		maturityDate: "2024-10-01",
	},
	{
		id: 2,
		bankName: "Credit Union",
		amount: 25000,
		currency: "RON",
		startDate: "2023-11-15",
		interest: 4.75,
		lengthMonths: 6,
		maturityDate: "2024-05-15",
	},
	{
		id: 3,
		bankName: "National Bank",
		amount: 100000,
		currency: "RON",
		startDate: "2023-09-10",
		interest: 6.0,
		lengthMonths: 24,
		maturityDate: "2025-09-10",
	},
	{
		id: 4,
		bankName: "City Bank",
		amount: 30000,
		currency: "RON",
		startDate: "2023-12-01",
		interest: 5.5,
		lengthMonths: 18,
		maturityDate: "2025-06-01",
	},
];

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
	const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);
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
		const maturityDate = calculateDateFromMonths(
			formData.startDate,
			formData.lengthMonths,
		);

		const newDeposit = {
			id: generateNewId(deposits),
			...formData,
			maturityDate,
		};

		setDeposits((prev) => [...prev, newDeposit]);
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

		const maturityDate = calculateDateFromMonths(
			formData.startDate,
			formData.lengthMonths,
		);

		setDeposits((prev) =>
			prev.map((deposit) =>
				deposit.id === currentDeposit.id
					? { ...deposit, ...formData, maturityDate }
					: deposit,
			),
		);
		setIsEditDialogOpen(false);
	};

	// Delete deposit
	const handleDelete = (deposit: Deposit) => {
		setCurrentDeposit(deposit);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!currentDeposit) return;

		setDeposits((prev) =>
			prev.filter((deposit) => deposit.id !== currentDeposit.id),
		);
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
