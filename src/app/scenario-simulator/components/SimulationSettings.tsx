import { Button } from "~/app/_components/ui/button";
import { Card } from "~/app/_components/ui/card";
import { CurrencyInput } from "~/app/_components/ui/currency-input";
import { Input } from "~/app/_components/ui/input";
import type { FinancialSummary as FinancialSummaryType } from "../types";
import { FinancialSummary } from "./FinancialSummary";

interface SimulationSettingsProps {
	monthlyDisposableIncome: number;
	simulationPeriodMonths: number;
	financialSummary: FinancialSummaryType;
	onDisposableIncomeChange: (value: number) => void;
	onSimulationPeriodChange: (value: number) => void;
	onRunSimulation: () => void;
}

export function SimulationSettings({
	monthlyDisposableIncome,
	simulationPeriodMonths,
	financialSummary,
	onDisposableIncomeChange,
	onSimulationPeriodChange,
	onRunSimulation,
}: SimulationSettingsProps) {
	return (
		<Card className="p-6">
			<h2 className="mb-4 font-bold text-xl">Simulation Settings</h2>

			<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						className="mb-1 block text-sm"
						htmlFor="monthlyDisposableIncome"
					>
						Monthly Disposable Income
					</label>
					<CurrencyInput
						id="monthlyDisposableIncome"
						value={monthlyDisposableIncome}
						onChange={onDisposableIncomeChange}
						placeholder="0"
						showCurrency
					/>
				</div>
				<div>
					<label
						className="mb-1 block text-sm"
						htmlFor="simulationPeriodMonths"
					>
						Simulation Period (months)
					</label>
					<Input
						id="simulationPeriodMonths"
						type="number"
						value={simulationPeriodMonths}
						onChange={(e) => onSimulationPeriodChange(Number(e.target.value))}
						placeholder="60"
					/>
				</div>
			</div>

			<FinancialSummary financialSummary={financialSummary} />

			<Button
				onClick={onRunSimulation}
				className="mt-4 w-full"
				disabled={financialSummary.remainingIncome < 0}
			>
				Run Simulation
			</Button>
			{financialSummary.remainingIncome < 0 && (
				<div className="mt-2 text-accent-coral text-sm">
					Monthly expenses exceed disposable income. Please adjust your inputs.
				</div>
			)}
		</Card>
	);
}
