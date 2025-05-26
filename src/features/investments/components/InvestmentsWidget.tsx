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
	generateNewId,
	getTodayISODate,
} from "~/lib/utils";
import { api } from "~/trpc/react";

type Investment = {
	id: number;
	name: string;
	value: number;
	currency: string;
	date: string;
	estimatedYearlyInterest: number;
};

export function InvestmentsWidget() {
	// Fetch initial investments data from the API
	const { data: initialInvestments, isLoading: isLoadingInvestments } =
		api.investments.getData.useQuery();

	const [investments, setInvestments] = useState<Investment[]>([]);
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [currentInvestment, setCurrentInvestment] = useState<Investment | null>(
		null,
	);
	const [formData, setFormData] = useState<Omit<Investment, "id">>({
		name: "",
		value: 0,
		currency: "RON",
		date: getTodayISODate(),
		estimatedYearlyInterest: 0,
	});

	// Update local state when data is loaded from the API
	useEffect(() => {
		if (initialInvestments) {
			setInvestments(initialInvestments);
		}
	}, [initialInvestments]);

	// If data is loading, show a loading state
	if (isLoadingInvestments) {
		return (
			<Card className="col-span-full p-6">
				<h2 className="font-bold text-2xl">Investments</h2>
				<p>Loading...</p>
			</Card>
		);
	}

	const totalInvestments = investments.reduce(
		(sum, investment) => sum + investment.value,
		0,
	);

	// Calculate weighted average estimated yearly interest
	const weightedInterestSum = investments.reduce(
		(sum, investment) =>
			sum + investment.value * investment.estimatedYearlyInterest,
		0,
	);
	const averageYearlyInterest =
		totalInvestments > 0 ? weightedInterestSum / totalInvestments : 0;

	// Calculate estimated yearly earnings
	const estimatedYearlyEarnings =
		totalInvestments * (averageYearlyInterest / 100);

	// Form handlers
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				name === "value" || name === "estimatedYearlyInterest"
					? Number.parseFloat(value) || 0
					: value,
		}));
	};

	// Add new investment
	const handleAdd = () => {
		setFormData({
			name: "",
			value: 0,
			currency: "RON",
			date: getTodayISODate(),
			estimatedYearlyInterest: 0,
		});
		setIsAddDialogOpen(true);
	};

	const handleAddSubmit = () => {
		const newInvestment = {
			id: generateNewId(investments),
			...formData,
		};

		setInvestments((prev) => [...prev, newInvestment]);
		setIsAddDialogOpen(false);
	};

	// Edit investment
	const handleEdit = (investment: Investment) => {
		setCurrentInvestment(investment);
		setFormData({
			name: investment.name,
			value: investment.value,
			currency: investment.currency,
			date: investment.date,
			estimatedYearlyInterest: investment.estimatedYearlyInterest,
		});
		setIsEditDialogOpen(true);
	};

	const handleEditSubmit = () => {
		if (!currentInvestment) return;

		setInvestments((prev) =>
			prev.map((investment) =>
				investment.id === currentInvestment.id
					? { ...investment, ...formData }
					: investment,
			),
		);
		setIsEditDialogOpen(false);
	};

	// Delete investment
	const handleDelete = (investment: Investment) => {
		setCurrentInvestment(investment);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!currentInvestment) return;

		setInvestments((prev) =>
			prev.filter((inv) => inv.id !== currentInvestment.id),
		);
		setIsDeleteDialogOpen(false);
	};

	// Form fields configuration
	const formFields: FormField[] = [
		{ id: "name", name: "name", label: "Investment Name", type: "text" },
		{ id: "value", name: "value", label: "Value", type: "number" },
		{
			id: "currency",
			name: "currency",
			label: "Currency",
			type: "text",
			disabled: true,
		},
		{ id: "date", name: "date", label: "Date", type: "date" },
		{
			id: "estimatedYearlyInterest",
			name: "estimatedYearlyInterest",
			label: "Est. Yearly Return (%)",
			type: "number",
		},
	];

	// Table columns configuration
	const columns: Column<Investment>[] = [
		{ header: "Investment", accessorKey: "name" },
		{
			header: "Value",
			accessorKey: (investment) => (
				<span className="font-medium">{investment.value.toLocaleString()}</span>
			),
		},
		{ header: "Currency", accessorKey: "currency" },
		{
			header: "Last Updated",
			accessorKey: (investment) => formatDate(investment.date),
		},
		{
			header: "Est. Yearly Return",
			accessorKey: (investment) =>
				formatPercentage(investment.estimatedYearlyInterest),
		},
	];

	return (
		<Card className="col-span-full p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-bold text-2xl">Investments</h2>
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
					label="Total Investments"
					value={totalInvestments}
					suffix=" RON"
				/>
				<StatCard
					label="Avg. Est. Yearly Return"
					value={formatPercentage(averageYearlyInterest)}
				/>
				<StatCard
					label="Est. Yearly Earnings"
					value={Math.round(estimatedYearlyEarnings)}
					suffix=" RON"
				/>
			</div>

			{/* Investments List */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">All Investments</h3>
				<DataTable
					columns={columns}
					data={investments}
					keyField="id"
					onEdit={handleEdit}
					onDelete={handleDelete}
					emptyMessage="No investments. Click 'Add' to create one."
				/>
			</div>

			{/* Add/Edit Forms using EntryForm */}
			<EntryForm
				title="Add Investment"
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleAddSubmit}
				submitLabel="Add Investment"
			/>

			<EntryForm
				title="Edit Investment"
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleEditSubmit}
				submitLabel="Save Changes"
			/>

			{/* Delete Confirmation */}
			{currentInvestment && (
				<ConfirmDeleteDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeleteConfirm}
					title="Delete Investment"
					description="Are you sure you want to delete this investment?"
					itemName={currentInvestment.name}
				/>
			)}
		</Card>
	);
}
