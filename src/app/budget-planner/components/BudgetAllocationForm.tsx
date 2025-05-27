import { EntryForm, type FormField } from "~/app/_components/ui/entry-form";
import { Select } from "~/app/_components/ui/select";
import type {
	BudgetAllocation,
	BudgetAllocationType,
	BudgetValueType,
} from "./types";

interface BudgetAllocationFormProps {
	isEditing: boolean;
	isOpen: boolean;
	currentAllocation: BudgetAllocation;
	onOpenChange: (open: boolean) => void;
	onInputChange: (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => void;
	onTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	onValueTypeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
	onSubmit: () => void;
}

export function BudgetAllocationForm({
	isEditing,
	isOpen,
	currentAllocation,
	onOpenChange,
	onInputChange,
	onTypeChange,
	onValueTypeChange,
	onSubmit,
}: BudgetAllocationFormProps) {
	// Form fields configuration
	const budgetFormFields: FormField[] = [
		{ id: "name-field", name: "name", label: "Name", type: "text" },
		{ id: "value-field", name: "value", label: "Value", type: "number" },
		{
			id: "currency-field",
			name: "currency",
			label: "Currency",
			type: "text",
			disabled: true,
		},
	];

	const typeOptions = [
		{ value: "monthly", label: "Monthly" },
		{ value: "yearly", label: "Yearly" },
	];

	const valueTypeOptions = [
		{ value: "absolute", label: "Absolute Value" },
		{ value: "percent", label: "Percentage" },
	];

	return (
		<EntryForm
			title={isEditing ? "Edit Budget Allocation" : "Add Budget Allocation"}
			open={isOpen}
			onOpenChange={onOpenChange}
			formFields={budgetFormFields}
			formData={{
				name: currentAllocation.name,
				value: currentAllocation.value,
				currency: currentAllocation.currency,
			}}
			onInputChange={onInputChange}
			onSubmit={onSubmit}
			submitLabel={isEditing ? "Update" : "Add"}
		>
			<div className="mb-4 grid grid-cols-4 items-center gap-4">
				<label htmlFor="budget-type-field" className="text-right">
					Type
				</label>
				<Select
					id="budget-type-field"
					name="type"
					value={currentAllocation.type}
					onChange={onTypeChange}
					className="col-span-3"
					options={typeOptions}
				/>
			</div>
			<div className="grid grid-cols-4 items-center gap-4">
				<label htmlFor="value-type-field" className="text-right">
					Value Type
				</label>
				<Select
					id="value-type-field"
					name="valueType"
					value={currentAllocation.valueType}
					onChange={onValueTypeChange}
					className="col-span-3"
					options={valueTypeOptions}
				/>
			</div>
		</EntryForm>
	);
}
