"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";
import { AppLayout } from "../_components/AppLayout";
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

	// Edit states
	const [editingInvestment, setEditingInvestment] = useState<Investment | null>(
		null,
	);
	const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

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
		lumpSumPayment: 0,
		lumpSumType: "amount",
	});

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
		redirect("/overview-dashboard");
	}

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

	const handleEditInvestment = (investment: Investment) => {
		setEditingInvestment(investment);
		setNewInvestment({
			name: investment.name,
			initialAmount: investment.initialAmount,
			monthlyContribution: investment.monthlyContribution,
			yearlyInterestRate: investment.yearlyInterestRate,
		});
	};

	const handleUpdateInvestment = () => {
		if (!editingInvestment) return;
		if (!validateInvestment(newInvestment, showErrorDialog)) return;

		const updatedInvestment: Investment = {
			...newInvestment,
			id: editingInvestment.id,
		};

		setInvestments(
			investments.map((inv) =>
				inv.id === editingInvestment.id ? updatedInvestment : inv,
			),
		);
		setEditingInvestment(null);
		setNewInvestment({
			name: "",
			initialAmount: 0,
			monthlyContribution: 0,
			yearlyInterestRate: 0,
		});
	};

	const handleCancelEditInvestment = () => {
		setEditingInvestment(null);
		setNewInvestment({
			name: "",
			initialAmount: 0,
			monthlyContribution: 0,
			yearlyInterestRate: 0,
		});
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
			lumpSumPayment: 0,
			lumpSumType: "amount",
		});
	};

	const handleRemoveLoan = (id: string) => {
		setLoans(loans.filter((loan) => loan.id !== id));
	};

	const handleEditLoan = (loan: Loan) => {
		setEditingLoan(loan);
		setNewLoan({
			name: loan.name,
			loanAmount: loan.loanAmount,
			interestRate: loan.interestRate,
			periodMonths: loan.periodMonths,
			extraMonthlyPayment: loan.extraMonthlyPayment,
			lumpSumPayment: loan.lumpSumPayment,
			lumpSumType: loan.lumpSumType,
		});
	};

	const handleUpdateLoan = () => {
		if (!editingLoan) return;
		if (!validateLoan(newLoan, showErrorDialog)) return;

		const updatedLoan: Loan = {
			...newLoan,
			id: editingLoan.id,
		};

		setLoans(
			loans.map((loan) => (loan.id === editingLoan.id ? updatedLoan : loan)),
		);
		setEditingLoan(null);
		setNewLoan({
			name: "",
			loanAmount: 0,
			interestRate: 0,
			periodMonths: 0,
			extraMonthlyPayment: 0,
			lumpSumPayment: 0,
			lumpSumType: "amount",
		});
	};

	const handleCancelEditLoan = () => {
		setEditingLoan(null);
		setNewLoan({
			name: "",
			loanAmount: 0,
			interestRate: 0,
			periodMonths: 0,
			extraMonthlyPayment: 0,
			lumpSumPayment: 0,
			lumpSumType: "amount",
		});
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
						onEditInvestment={handleEditInvestment}
					/>

					{/* Loans */}
					<LoansSection
						loans={loans}
						newLoan={newLoan}
						onLoanChange={setNewLoan}
						onAddLoan={handleAddLoan}
						onRemoveLoan={handleRemoveLoan}
						onEditLoan={handleEditLoan}
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
