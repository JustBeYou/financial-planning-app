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
	formatCurrency,
	formatDate,
	generateNewId,
	getTodayISODate,
} from "~/lib/utils";
import { api } from "~/trpc/react";

type Property = {
	id: number;
	name: string;
	value: number;
	currency: string;
	date: string;
};

export function RealEstateWidget() {
	// tRPC hooks
	const utils = api.useUtils();
	const { data: properties, isLoading: isLoadingProperties } =
		api.realEstate.getData.useQuery();
	const createProperty = api.realEstate.create.useMutation({
		onSuccess: () => {
			void utils.realEstate.getData.invalidate();
			void utils.netWorth.getData.invalidate();
		},
	});
	const updateProperty = api.realEstate.update.useMutation({
		onSuccess: () => {
			void utils.realEstate.getData.invalidate();
			void utils.netWorth.getData.invalidate();
		},
	});
	const deleteProperty = api.realEstate.delete.useMutation({
		onSuccess: () => {
			void utils.realEstate.getData.invalidate();
			void utils.netWorth.getData.invalidate();
		},
	});

	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
	const [formData, setFormData] = useState<Omit<Property, "id">>({
		name: "",
		value: 0,
		currency: "RON",
		date: getTodayISODate(),
	});

	// If data is loading, show a loading state
	if (isLoadingProperties || !properties) {
		return (
			<Card className="col-span-full p-6">
				<h2 className="font-bold text-2xl">Real Estate Assets</h2>
				<p>Loading...</p>
			</Card>
		);
	}

	const totalValue = properties.reduce(
		(sum, property) => sum + property.value,
		0,
	);

	// Form handlers
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: name === "value" ? Number.parseFloat(value) || 0 : value,
		}));
	};

	// Add new property
	const handleAdd = () => {
		setFormData({
			name: "",
			value: 0,
			currency: "RON",
			date: getTodayISODate(),
		});
		setIsAddDialogOpen(true);
	};

	const handleAddSubmit = () => {
		createProperty.mutate(formData);
		setIsAddDialogOpen(false);
	};

	// Edit property
	const handleEdit = (property: Property) => {
		setCurrentProperty(property);
		setFormData({
			name: property.name,
			value: property.value,
			currency: property.currency,
			date: property.date,
		});
		setIsEditDialogOpen(true);
	};

	const handleEditSubmit = () => {
		if (!currentProperty) return;

		updateProperty.mutate({
			id: currentProperty.id,
			...formData,
		});
		setIsEditDialogOpen(false);
	};

	// Delete property
	const handleDelete = (property: Property) => {
		setCurrentProperty(property);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!currentProperty) return;

		deleteProperty.mutate({ id: currentProperty.id });
		setIsDeleteDialogOpen(false);
	};

	// Form fields configuration
	const formFields: FormField[] = [
		{ id: "name", name: "name", label: "Property Name", type: "text" },
		{ id: "value", name: "value", label: "Value", type: "number" },
		{
			id: "currency",
			name: "currency",
			label: "Currency",
			type: "text",
			disabled: true,
		},
		{ id: "date", name: "date", label: "Appraisal Date", type: "date" },
	];

	// Table columns configuration
	const columns: Column<Property>[] = [
		{ header: "Property", accessorKey: "name" },
		{
			header: "Value",
			accessorKey: (property) => (
				<span className="font-medium">{property.value.toLocaleString()}</span>
			),
		},
		{ header: "Currency", accessorKey: "currency" },
		{
			header: "Last Appraised",
			accessorKey: (property) => formatDate(property.date),
		},
	];

	return (
		<Card className="col-span-full p-6">
			<div className="mb-4 flex items-center justify-between">
				<h2 className="font-bold text-2xl">Real Estate Assets</h2>
				<Button
					onClick={handleAdd}
					size="sm"
					className="flex items-center gap-1"
				>
					<PlusCircle className="h-4 w-4" />
					<span>Add</span>
				</Button>
			</div>

			{/* Total Value */}
			<div className="mb-6">
				<StatCard
					label="Total Real Estate Value"
					value={totalValue}
					suffix=" RON"
				/>
			</div>

			{/* Properties List */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">All Properties</h3>
				<DataTable
					columns={columns}
					data={properties}
					keyField="id"
					onEdit={handleEdit}
					onDelete={handleDelete}
					emptyMessage="No properties. Click 'Add' to create one."
				/>
			</div>

			{/* Add/Edit Forms using EntryForm */}
			<EntryForm
				title="Add Real Estate Property"
				open={isAddDialogOpen}
				onOpenChange={setIsAddDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleAddSubmit}
				submitLabel="Add Property"
			/>

			<EntryForm
				title="Edit Real Estate Property"
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				formFields={formFields}
				formData={formData}
				onInputChange={handleInputChange}
				onSubmit={handleEditSubmit}
				submitLabel="Save Changes"
			/>

			{/* Delete Confirmation */}
			{currentProperty && (
				<ConfirmDeleteDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
					onConfirm={handleDeleteConfirm}
					title="Delete Property"
					description="Are you sure you want to delete this property?"
					itemName={currentProperty.name}
				/>
			)}
		</Card>
	);
}
