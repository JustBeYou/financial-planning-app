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
	// Fetch initial real estate data from the API
	const { data: initialRealEstate, isLoading: isLoadingRealEstate } =
		api.realEstate.getData.useQuery();

	const [properties, setProperties] = useState<Property[]>([]);
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

	// Update local state when data is loaded from the API
	useEffect(() => {
		if (initialRealEstate) {
			setProperties(initialRealEstate);
		}
	}, [initialRealEstate]);

	// If data is loading, show a loading state
	if (isLoadingRealEstate) {
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
		const newProperty = {
			id: generateNewId(properties),
			...formData,
		};

		setProperties((prev) => [...prev, newProperty]);
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

		setProperties((prev) =>
			prev.map((property) =>
				property.id === currentProperty.id
					? { ...property, ...formData }
					: property,
			),
		);
		setIsEditDialogOpen(false);
	};

	// Delete property
	const handleDelete = (property: Property) => {
		setCurrentProperty(property);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = () => {
		if (!currentProperty) return;

		setProperties((prev) => prev.filter((p) => p.id !== currentProperty.id));
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
