"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { AppLayout } from "../_components/AppLayout";
import { LoginForm } from "../_components/login-form";
import {
	ErrorDialog,
	InvestmentsSection,
	LoansSection,
	SimulationResults,
	SimulationSettings,
} from "./components";
import type {
	ErrorDialogState,
	Investment,
	Loan,
	SimulationResult,
} from "./types";
import {
	calculateFinancialSummary,
	runFinancialSimulation,
	validateInvestment,
	validateLoan,
} from "./utils";

export default function ScenarioSimulator() {
	const { data: session, status } = useSession();
	const [investments, setInvestments] = useState<Investment[]>([]);
	const [loans, setLoans] = useState<Loan[]>([]);
	const [monthlyDisposableIncome, setMonthlyDisposableIncome] =
		useState<number>(0);
	const [simulationPeriodMonths, setSimulationPeriodMonths] =
		useState<number>(60); // 5 years default
	const [simulationResults, setSimulationResults] = useState<
		SimulationResult[]
	>([]);
	const [errorDialog, setErrorDialog] = useState<ErrorDialogState>({
		isOpen: false,
		title: "",
		description: "",
	});

	// Form states
	const [newInvestment, setNewInvestment] = useState<Omit<Investment, "id">>({
		name: "",
		initialAmount: 0,
		monthlyContribution: 0,
		yearlyInterestRate: 0,
	});

	const [newLoan, setNewLoan] = useState<Omit<Loan, "id">>({
		name: "",
		loanAmount: 0,
		interestRate: 0,
		periodMonths: 0,
		extraMonthlyPayment: 0,
	});

	// Show error dialog
	const showErrorDialog = (title: string, description: string) => {
		setErrorDialog({
			isOpen: true,
			title,
			description,
		});
	};

	// Close error dialog
	const closeErrorDialog = () => {
		setErrorDialog({
			...errorDialog,
			isOpen: false,
		});
	};

	// Handlers for investments
	const handleAddInvestment = () => {
		if (!validateInvestment(newInvestment, showErrorDialog)) return;

		const investment: Investment = {
			...newInvestment,
			id: `inv-${Date.now()}`,
		};

		setInvestments([...investments, investment]);
		setNewInvestment({
			name: "",
			initialAmount: 0,
			monthlyContribution: 0,
			yearlyInterestRate: 0,
		});
	};

	const handleRemoveInvestment = (id: string) => {
		setInvestments(investments.filter((inv) => inv.id !== id));
	};

	// Handlers for loans
	const handleAddLoan = () => {
		if (!validateLoan(newLoan, showErrorDialog)) return;

		const loan: Loan = {
			...newLoan,
			id: `loan-${Date.now()}`,
		};

		setLoans([...loans, loan]);
		setNewLoan({
			name: "",
			loanAmount: 0,
			interestRate: 0,
			periodMonths: 0,
			extraMonthlyPayment: 0,
		});
	};

	const handleRemoveLoan = (id: string) => {
		setLoans(loans.filter((loan) => loan.id !== id));
	};

	// Calculate financial summary
	const financialSummary = calculateFinancialSummary(
		loans,
		investments,
		monthlyDisposableIncome,
	);

	// Run simulation
	const handleRunSimulation = () => {
		const results = runFinancialSimulation(
			investments,
			loans,
			simulationPeriodMonths,
			monthlyDisposableIncome,
		);

		if (results === null) {
			showErrorDialog(
				"Simulation Error",
				"Monthly expenses exceed your disposable income. Please adjust your inputs.",
			);
			return;
		}

		setSimulationResults(results);
	};

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

	return (
		<AppLayout session={session}>
			<div className="flex flex-col gap-6">
				{/* Error Dialog */}
				<ErrorDialog
					errorDialog={errorDialog}
					closeErrorDialog={closeErrorDialog}
				/>

				{/* Simulation Settings */}
				<SimulationSettings
					monthlyDisposableIncome={monthlyDisposableIncome}
					simulationPeriodMonths={simulationPeriodMonths}
					financialSummary={financialSummary}
					onDisposableIncomeChange={setMonthlyDisposableIncome}
					onSimulationPeriodChange={setSimulationPeriodMonths}
					onRunSimulation={handleRunSimulation}
				/>

				{/* Input Form Section */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{/* Investments */}
					<InvestmentsSection
						investments={investments}
						newInvestment={newInvestment}
						onInvestmentChange={setNewInvestment}
						onAddInvestment={handleAddInvestment}
						onRemoveInvestment={handleRemoveInvestment}
					/>

					{/* Loans */}
					<LoansSection
						loans={loans}
						newLoan={newLoan}
						onLoanChange={setNewLoan}
						onAddLoan={handleAddLoan}
						onRemoveLoan={handleRemoveLoan}
					/>
				</div>

				{/* Simulation Results */}
				<SimulationResults
					simulationResults={simulationResults}
					investments={investments}
					loans={loans}
				/>
			</div>
		</AppLayout>
	);
}
