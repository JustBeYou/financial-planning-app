import { EntryForm, type FormField } from "~/app/_components/ui/entry-form";
import { Select } from "~/app/_components/ui/select";
import type { Spending } from "./types";

interface SpendingFormProps {
	spending: Omit<Spending, "id">;
	onInputChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onSubmit: () => void;
	onCancel: () => void;
	isEdit?: boolean;
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
}

export function SpendingForm({
	spending,
	onInputChange,
	onSubmit,
	onCancel,
	isEdit = false,
	isOpen,
	onOpenChange,
}: SpendingFormProps) {
	// Form fields configuration
	const spendingFormFields: FormField[] = [
		{ id: "name-field", name: "name", label: "Name", type: "text" },
		{ id: "amount-field", name: "amount", label: "Amount", type: "number" },
		{ id: "date-field", name: "date", label: "Date", type: "date" },
		{
			id: "category-field",
			name: "category",
			label: "Category (Optional)",
			type: "text",
		},
		{
			id: "description-field",
			name: "description",
			label: "Description (Optional)",
			type: "text",
		},
	];

	const currencyOptions = [
		{ value: "RON", label: "RON" },
		{ value: "EUR", label: "EUR" },
		{ value: "USD", label: "USD" },
	];

	return (
		<EntryForm
			title={isEdit ? "Edit Spending" : "Add New Spending"}
			open={isOpen}
			onOpenChange={onOpenChange}
			formFields={spendingFormFields}
			formData={{
				name: spending.name,
				amount: spending.amount,
				date: spending.date,
				category: spending.category || "",
				description: spending.description || "",
			}}
			onInputChange={onInputChange}
			onSubmit={onSubmit}
			submitLabel={isEdit ? "Update" : "Add"}
		>
			<div className="mb-4 grid grid-cols-4 items-center gap-4">
				<label htmlFor="currency-field" className="text-right">
					Currency
				</label>
				<Select
					id="currency-field"
					name="currency"
					value={spending.currency}
					onChange={onInputChange}
					className="col-span-3"
					options={currencyOptions}
				/>
			</div>
		</EntryForm>
	);
}
