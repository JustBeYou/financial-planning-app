import { EntryForm, type FormField } from "~/components/ui/entry-form";
import type { IncomeSource, IncomeType } from "./types";

interface IncomeSourceFormProps {
	isEditing: boolean;
	isOpen: boolean;
	currentSource: IncomeSource;
	onOpenChange: (open: boolean) => void;
	onInputChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	onSubmit: () => void;
}

export function IncomeSourceForm({
	isEditing,
	isOpen,
	currentSource,
	onOpenChange,
	onInputChange,
	onTypeChange,
	onSubmit,
}: IncomeSourceFormProps) {
	// Form fields configuration
	const incomeFormFields: FormField[] = [
		{ id: "name-field", name: "name", label: "Name", type: "text" },
		{ id: "amount-field", name: "amount", label: "Amount", type: "number" },
		{
			id: "currency-field",
			name: "currency",
			label: "Currency",
			type: "text",
			disabled: true,
		},
		{ id: "tax-field", name: "taxPercentage", label: "Tax %", type: "number" },
	];

	return (
		<EntryForm
			title={isEditing ? "Edit Income Source" : "Add Income Source"}
			open={isOpen}
			onOpenChange={onOpenChange}
			formFields={incomeFormFields}
			formData={{
				name: currentSource.name,
				amount: currentSource.amount,
				currency: currentSource.currency,
				taxPercentage: currentSource.taxPercentage,
			}}
			onInputChange={onInputChange}
			onSubmit={onSubmit}
			submitLabel={isEditing ? "Update" : "Add"}
		>
			<div className="grid grid-cols-4 items-center gap-4">
				<label htmlFor="type-field" className="text-right">
					Type
				</label>
				<select
					id="type-field"
					name="type"
					value={currentSource.type}
					onChange={onTypeChange}
					className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
				>
					<option value="monthly">Monthly</option>
					<option value="yearly">Yearly</option>
				</select>
			</div>
		</EntryForm>
	);
}
