"use client";

import { PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { type Column, DataTable } from "~/components/ui/data-table";
import { EntryForm, type FormField } from "~/components/ui/entry-form";
import { StatCard } from "~/components/ui/stat-card";
import { AppLayout } from "../_components/AppLayout";
import { LoginForm } from "../_components/login-form";

type IncomeType = "monthly" | "yearly";

interface IncomeSource {
	id: string;
	name: string;
	amount: number;
	currency: string;
	type: IncomeType;
	taxPercentage: number;
}

export default function BudgetPlannerPage() {
	const { data: session, status } = useSession();
	const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
	const [isAddingIncome, setIsAddingIncome] = useState(false);
	const [isEditingIncome, setIsEditingIncome] = useState(false);
	const [currentIncomeSource, setCurrentIncomeSource] = useState<IncomeSource>({
		id: "",
		name: "",
		amount: 0,
		currency: "RON",
		type: "monthly",
		taxPercentage: 0,
	});

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

	// Calculate totals
	const totalMonthlyIncome = incomeSources.reduce((total, source) => {
		const amount = source.amount * (1 - source.taxPercentage / 100);
		return total + (source.type === "monthly" ? amount : amount / 12);
	}, 0);

	const totalYearlyIncome = incomeSources.reduce((total, source) => {
		const amount = source.amount * (1 - source.taxPercentage / 100);
		return total + (source.type === "yearly" ? amount : amount * 12);
	}, 0);

	// Event handlers
	const handleAddIncome = () => {
		setCurrentIncomeSource({
			id: "",
			name: "",
			amount: 0,
			currency: "RON",
			type: "monthly",
			taxPercentage: 0,
		});
		setIsAddingIncome(true);
	};

	const handleEditIncome = (income: IncomeSource) => {
		setCurrentIncomeSource(income);
		setIsEditingIncome(true);
	};

	const handleDeleteIncome = (income: IncomeSource) => {
		setIncomeSources(incomeSources.filter((source) => source.id !== income.id));
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setCurrentIncomeSource({
			...currentIncomeSource,
			[name]:
				name === "amount" || name === "taxPercentage" ? Number(value) : value,
		});
	};

	const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentIncomeSource({
			...currentIncomeSource,
			type: e.target.value as IncomeType,
		});
	};

	const handleSaveIncome = () => {
		if (isEditingIncome) {
			setIncomeSources(
				incomeSources.map((source) =>
					source.id === currentIncomeSource.id ? currentIncomeSource : source,
				),
			);
			setIsEditingIncome(false);
		} else {
			const newIncomeSource = {
				...currentIncomeSource,
				id: crypto.randomUUID(),
			};
			setIncomeSources([...incomeSources, newIncomeSource]);
			setIsAddingIncome(false);
		}
	};

	// Table columns configuration
	const columns: Column<IncomeSource>[] = [
		{ header: "Name", accessorKey: "name" },
		{
			header: "Amount",
			accessorKey: (income) => (
				<span className="font-medium">
					{income.amount.toLocaleString()} {income.currency}
				</span>
			),
		},
		{ header: "Type", accessorKey: "type" },
		{
			header: "Tax %",
			accessorKey: (income) => `${income.taxPercentage}%`,
		},
		{
			header: "Net Amount",
			accessorKey: (income) => {
				const netAmount = income.amount * (1 - income.taxPercentage / 100);
				return `${netAmount.toLocaleString()} ${income.currency}`;
			},
		},
	];

	// Show loading state while checking session
	if (status === "loading") {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
				<div className="text-2xl">Loading...</div>
			</div>
		);
	}

	// Show login form if not authenticated
	if (!session?.user) {
		return <LoginForm />;
	}

	// Render budget planner content
	const BudgetPlannerContent = (
		<div className="space-y-6">
			{/* Income Summary Cards */}
			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				<Card>
					<div className="p-6">
						<StatCard
							label="Total Monthly Income (After Tax)"
							value={Math.round(totalMonthlyIncome)}
							suffix=" RON"
							className="text-accent-lime"
						/>
					</div>
				</Card>
				<Card>
					<div className="p-6">
						<StatCard
							label="Total Yearly Income (After Tax)"
							value={Math.round(totalYearlyIncome)}
							suffix=" RON"
							className="text-accent-lime"
						/>
					</div>
				</Card>
			</div>

			{/* Income Sources Card */}
			<Card className="p-6">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-bold text-2xl">Income Sources</h2>
					<Button
						onClick={handleAddIncome}
						size="sm"
						className="flex items-center gap-1"
					>
						<PlusCircle className="h-4 w-4" />
						<span>Add</span>
					</Button>
				</div>

				<DataTable
					columns={columns}
					data={incomeSources}
					keyField="id"
					onEdit={handleEditIncome}
					onDelete={handleDeleteIncome}
					emptyMessage="No income sources. Click 'Add' to create one."
				/>
			</Card>

			{/* Add/Edit Income Form */}
			<EntryForm
				title={isEditingIncome ? "Edit Income Source" : "Add Income Source"}
				open={isAddingIncome || isEditingIncome}
				onOpenChange={(open) => {
					if (!open) {
						setIsAddingIncome(false);
						setIsEditingIncome(false);
					}
				}}
				formFields={incomeFormFields}
				formData={{
					name: currentIncomeSource.name,
					amount: currentIncomeSource.amount,
					currency: currentIncomeSource.currency,
					taxPercentage: currentIncomeSource.taxPercentage,
				}}
				onInputChange={handleInputChange}
				onSubmit={handleSaveIncome}
				submitLabel={isEditingIncome ? "Update" : "Add"}
			>
				<div className="grid grid-cols-4 items-center gap-4">
					<label htmlFor="type-field" className="text-right">
						Type
					</label>
					<select
						id="type-field"
						name="type"
						value={currentIncomeSource.type}
						onChange={handleTypeChange}
						className="col-span-3 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
					>
						<option value="monthly">Monthly</option>
						<option value="yearly">Yearly</option>
					</select>
				</div>
			</EntryForm>
		</div>
	);

	return <AppLayout session={session}>{BudgetPlannerContent}</AppLayout>;
}
