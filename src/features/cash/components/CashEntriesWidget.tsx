"use client";

import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ConfirmDeleteDialog } from "~/components/ui/confirm-delete-dialog";
import { type Column, DataTable } from "~/components/ui/data-table";
import { EntryForm, type FormField } from "~/components/ui/entry-form";
import { StatCard } from "~/components/ui/stat-card";
import { formatCurrency, formatDate, getTodayISODate } from "~/lib/utils";
import { api } from "~/trpc/react";

type CashEntry = {
	id: number;
	accountName: string;
	amount: number;
	currency: string;
	date: string;
};

export function CashEntriesWidget() {
	// tRPC hooks
	const utils = api.useUtils();
	const { data: entries, isLoading: isLoadingEntries } =
		api.cash.getData.useQuery();
	const createEntry = api.cash.create.useMutation({
		onSuccess: () => {
			void utils.cash.getData.invalidate();
		},
	});
	const updateEntry = api.cash.update.useMutation({
		onSuccess: () => {
			void utils.cash.getData.invalidate();
		},
	});
	const deleteEntry = api.cash.delete.useMutation({
		onSuccess: () => {
			void utils.cash.getData.invalidate();
		},
	});

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [currentEntry, setCurrentEntry] = useState<CashEntry | null>(null);
	const [formData, setFormData] = useState<Omit<CashEntry, "id">>({
		accountName: "",
		amount: 0,
		currency: "RON",
		date: getTodayISODate(),
	});

	// If data is loading, show a loading state
	if (isLoadingEntries || !entries) {
		return (
			<Card className="col-span-full p-6">
				<h2 className="font-bold text-2xl">Cash Entries</h2>
				<p>Loading...</p>
			</Card>
		);
	}

	const totalCash = entries.reduce((sum, entry) => sum + entry.amount, 0);

	// Form handlers
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "amount" ? Number.parseFloat(value) || 0 : value,
		}));
	};

	// Add new entry
	const handleAdd = () => {
		setFormData({
			accountName: "",
			amount: 0,
			currency: "RON",
			date: getTodayISODate(),
		});
		setIsAddDialogOpen(true);
	};

	const handleAddSubmit = () => {
		createEntry.mutate(formData);
		setIsAddDialogOpen(false);
	};

	// Edit entry
	const handleEdit = (entry: CashEntry) => {
		setCurrentEntry(entry);
		setFormData({
			accountName: entry.accountName,
			amount: entry.amount,
			currency: entry.currency,
			date: entry.date,
		});
		setIsEditDialogOpen(true);
	};

	const handleEditSubmit = () => {
		if (!currentEntry) return;

		updateEntry.mutate({
			id: currentEntry.id,
			...formData,
		});
		setIsEditDialogOpen(false);
	};

	// Delete entry
	const handleDelete = (entry: CashEntry) => {
		setCurrentEntry(entry);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!currentEntry) return;

		deleteEntry.mutate({ id: currentEntry.id });
		setIsDeleteDialogOpen(false);
	};

	// Form fields configuration
	const formFields: FormField[] = [
		{ id: "accountName", name: "accountName", label: "Account", type: "text" },
		{ id: "amount", name: "amount", label: "Amount", type: "number" },
		{
			id: "currency",
			name: "currency",
			label: "Currency",
			type: "text",
			disabled: true,
		},
		{ id: "date", name: "date", label: "Date", type: "date" },
	];

	// Table columns configuration
	const columns: Column<CashEntry>[] = [
		{ header: "Account", accessorKey: "accountName" },
		{
			header: "Amount",
			accessorKey: (entry) => (
				<span className="font-medium">{entry.amount.toLocaleString()}</span>
			),
		},
		{ header: "Currency", accessorKey: "currency" },
		{ header: "Date", accessorKey: (entry) => formatDate(entry.date) },
	];

	return (
		<Card className="col-span-full p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-bold text-2xl">Cash Entries</h2>
				<Button
					onClick={handleAdd}
					size="sm"
					className="flex items-center gap-1"
				>
					<PlusCircle className="h-4 w-4" />
					<span>Add</span>
				</Button>
			</div>

			{/* Total Cash */}
			<div className="mb-6">
				<StatCard label="Total Cash" value={totalCash} suffix=" RON" />
			</div>

			{/* Cash Entries List */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">All Cash Accounts</h3>
				<DataTable
					columns={columns}
					data={entries}
					keyField="id"
					onEdit={handleEdit}
					onDelete={handleDelete}
					emptyMessage="No cash entries. Click 'Add' to create one."
				/>
			</div>

			{/* Add/Edit Forms using EntryForm */}
			<EntryForm
				title="Add Cash Entry"
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleAddSubmit}
				submitLabel="Add Entry"
			/>

			<EntryForm
				title="Edit Cash Entry"
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleEditSubmit}
				submitLabel="Save Changes"
			/>

			{/* Delete Confirmation */}
			{currentEntry && (
				<ConfirmDeleteDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeleteConfirm}
					title="Delete Cash Entry"
					description="Are you sure you want to delete this cash entry?"
					itemName={currentEntry.accountName}
				/>
			)}
		</Card>
	);
}
