"use client";

import { PlusCircle, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { AppLayout } from "../_components/AppLayout";
import { LoginForm } from "../_components/login-form";

// Types for our simulator
type Investment = {
	id: string;
	name: string;
	initialAmount: number;
	monthlyContribution: number;
	yearlyInterestRate: number;
};

type Loan = {
	id: string;
	name: string;
	loanAmount: number;
	interestRate: number;
	periodMonths: number;
	extraMonthlyPayment: number;
};

type SimulationResult = {
	month: number;
	totalInvestmentValue: number;
	totalLoanBalance: number;
	netWorth: number;
	investments: Record<string, number>;
	loans: Record<string, number>;
};

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

	// Handlers for investments
	const handleAddInvestment = () => {
		if (!newInvestment.name) return;

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
		if (!newLoan.name) return;

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

	// Calculate monthly payment for a loan
	const calculateMonthlyPayment = (loan: Loan) => {
		const principal = loan.loanAmount;
		const monthlyRate = loan.interestRate / 100 / 12;
		const payments = loan.periodMonths;

		if (monthlyRate === 0) {
			return principal / payments;
		}

		return (
			(principal * monthlyRate * (1 + monthlyRate) ** payments) /
			((1 + monthlyRate) ** payments - 1)
		);
	};

	// Calculate total monthly expenses and remaining disposable income
	const calculateFinancialSummary = () => {
		const loanPayments = loans.reduce((sum, loan) => {
			const monthlyPayment = calculateMonthlyPayment(loan);
			return sum + monthlyPayment + loan.extraMonthlyPayment;
		}, 0);

		const investmentContributions = investments.reduce(
			(sum, inv) => sum + inv.monthlyContribution,
			0,
		);

		const totalMonthlyExpenses = loanPayments + investmentContributions;
		const remainingIncome = monthlyDisposableIncome - totalMonthlyExpenses;

		return {
			loanPayments,
			investmentContributions,
			totalMonthlyExpenses,
			remainingIncome,
		};
	};

	const financialSummary = calculateFinancialSummary();

	// Calculate expected monthly payment for new loan
	const newLoanMonthlyPayment =
		newLoan.loanAmount &&
		newLoan.periodMonths &&
		newLoan.interestRate !== undefined
			? calculateMonthlyPayment(newLoan)
			: 0;

	// Run simulation
	const runSimulation = () => {
		const results: SimulationResult[] = [];

		// Initial state
		let currentInvestments = investments.map((inv) => ({
			id: inv.id,
			name: inv.name,
			balance: inv.initialAmount,
		}));

		let currentLoans = loans.map((loan) => ({
			id: loan.id,
			name: loan.name,
			balance: loan.loanAmount,
			monthlyPayment: calculateMonthlyPayment(loan),
			extraPayment: loan.extraMonthlyPayment,
		}));

		// Check if monthly expenses exceed disposable income
		const totalMonthlyExpenses =
			currentLoans.reduce(
				(sum, loan) => sum + loan.monthlyPayment + loan.extraPayment,
				0,
			) + investments.reduce((sum, inv) => sum + inv.monthlyContribution, 0);

		if (totalMonthlyExpenses > monthlyDisposableIncome) {
			alert("Warning: Your monthly expenses exceed your disposable income!");
			return;
		}

		// Run simulation month by month
		for (let month = 1; month <= simulationPeriodMonths; month++) {
			// Update investments
			currentInvestments = currentInvestments.map((inv) => {
				const investment = investments.find((i) => i.id === inv.id);
				if (!investment) return inv;

				// Apply monthly contribution
				inv.balance += investment.monthlyContribution;

				// Apply monthly interest (yearly rate / 12)
				const monthlyInterest = investment.yearlyInterestRate / 100 / 12;
				inv.balance *= 1 + monthlyInterest;

				return inv;
			});

			// Update loans
			currentLoans = currentLoans.map((loan) => {
				const loanConfig = loans.find((l) => l.id === loan.id);
				if (!loanConfig) return loan;

				// Calculate interest for this month
				const monthlyInterest =
					loan.balance * (loanConfig.interestRate / 100 / 12);

				// Apply regular payment + extra payment
				const totalPayment = Math.min(
					loan.monthlyPayment + loan.extraPayment,
					loan.balance + monthlyInterest,
				);

				// Update balance
				loan.balance = Math.max(
					0,
					loan.balance + monthlyInterest - totalPayment,
				);

				return loan;
			});

			// Create a result record for this month
			const investmentValues: Record<string, number> = {};
			const loanValues: Record<string, number> = {};

			for (const inv of currentInvestments) {
				investmentValues[inv.name] = inv.balance;
			}

			for (const loan of currentLoans) {
				loanValues[loan.name] = loan.balance;
			}

			const totalInvestmentValue = currentInvestments.reduce(
				(sum, inv) => sum + inv.balance,
				0,
			);
			const totalLoanBalance = currentLoans.reduce(
				(sum, loan) => sum + loan.balance,
				0,
			);

			results.push({
				month,
				totalInvestmentValue,
				totalLoanBalance,
				netWorth: totalInvestmentValue - totalLoanBalance,
				investments: investmentValues,
				loans: loanValues,
			});

			// Stop simulation if all loans are paid off
			if (totalLoanBalance === 0 && month % 12 === 0) {
				break;
			}
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
				<h1 className="font-bold text-3xl text-primary-teal">
					Financial Scenario Simulator
				</h1>

				{/* Simulation Settings - MOVED TO TOP */}
				<Card className="p-6">
					<h2 className="mb-4 font-bold text-xl">Simulation Settings</h2>

					<div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<label
								className="mb-1 block text-sm"
								htmlFor="monthlyDisposableIncome"
							>
								Monthly Disposable Income (RON)
							</label>
							<Input
								id="monthlyDisposableIncome"
								type="number"
								value={monthlyDisposableIncome}
								onChange={(e) =>
									setMonthlyDisposableIncome(Number(e.target.value))
								}
								placeholder="0"
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
								onChange={(e) =>
									setSimulationPeriodMonths(Number(e.target.value))
								}
								placeholder="60"
							/>
						</div>
					</div>

					{/* Financial Summary - ADDED */}
					<div className="rounded-md bg-secondary-slate/30 p-4">
						<h3 className="mb-2 font-semibold">Monthly Summary</h3>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<div className="text-sm text-text-gray">
									Total Loan Payments:
								</div>
								<div className="font-medium text-accent-coral">
									{Math.round(financialSummary.loanPayments).toLocaleString()}{" "}
									RON
								</div>
							</div>
							<div>
								<div className="text-sm text-text-gray">
									Investment Contributions:
								</div>
								<div className="font-medium">
									{Math.round(
										financialSummary.investmentContributions,
									).toLocaleString()}{" "}
									RON
								</div>
							</div>
							<div>
								<div className="text-sm text-text-gray">
									Total Monthly Expenses:
								</div>
								<div className="font-medium">
									{Math.round(
										financialSummary.totalMonthlyExpenses,
									).toLocaleString()}{" "}
									RON
								</div>
							</div>
							<div>
								<div className="text-sm text-text-gray">
									Remaining Disposable Income:
								</div>
								<div
									className={`font-medium ${financialSummary.remainingIncome < 0 ? "text-accent-coral" : "text-accent-lime"}`}
								>
									{Math.round(
										financialSummary.remainingIncome,
									).toLocaleString()}{" "}
									RON
								</div>
							</div>
						</div>
					</div>

					<Button
						onClick={runSimulation}
						className="mt-4 w-full"
						disabled={financialSummary.remainingIncome < 0}
					>
						Run Simulation
					</Button>
					{financialSummary.remainingIncome < 0 && (
						<div className="mt-2 text-accent-coral text-sm">
							Monthly expenses exceed disposable income. Please adjust your
							inputs.
						</div>
					)}
				</Card>

				{/* Input Form Section */}
				<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
					{/* Investments */}
					<Card className="p-6">
						<h2 className="mb-4 font-bold text-xl">Investments</h2>

						<div className="space-y-4">
							{investments.map((investment) => (
								<div
									key={investment.id}
									className="flex items-center justify-between rounded-md bg-secondary-slate/30 p-3"
								>
									<div>
										<div className="font-semibold">{investment.name}</div>
										<div className="text-sm text-text-gray">
											Initial: {investment.initialAmount} RON | Monthly:{" "}
											{investment.monthlyContribution} RON | Rate:{" "}
											{investment.yearlyInterestRate}%
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleRemoveInvestment(investment.id)}
										className="text-accent-coral"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}

							<div className="space-y-2">
								<div className="grid grid-cols-2 gap-2">
									<div>
										<label
											className="mb-1 block text-sm"
											htmlFor="investmentName"
										>
											Name
										</label>
										<Input
											id="investmentName"
											value={newInvestment.name}
											onChange={(e) =>
												setNewInvestment({
													...newInvestment,
													name: e.target.value,
												})
											}
											placeholder="Investment name"
										/>
									</div>
									<div>
										<label
											className="mb-1 block text-sm"
											htmlFor="initialAmount"
										>
											Initial Amount
										</label>
										<Input
											id="initialAmount"
											type="number"
											value={newInvestment.initialAmount}
											onChange={(e) =>
												setNewInvestment({
													...newInvestment,
													initialAmount: Number(e.target.value),
												})
											}
											placeholder="0"
										/>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-2">
									<div>
										<label
											className="mb-1 block text-sm"
											htmlFor="monthlyContribution"
										>
											Monthly Contribution
										</label>
										<Input
											id="monthlyContribution"
											type="number"
											value={newInvestment.monthlyContribution}
											onChange={(e) =>
												setNewInvestment({
													...newInvestment,
													monthlyContribution: Number(e.target.value),
												})
											}
											placeholder="0"
										/>
									</div>
									<div>
										<label
											className="mb-1 block text-sm"
											htmlFor="yearlyInterestRate"
										>
											Yearly Interest (%)
										</label>
										<Input
											id="yearlyInterestRate"
											type="number"
											value={newInvestment.yearlyInterestRate}
											onChange={(e) =>
												setNewInvestment({
													...newInvestment,
													yearlyInterestRate: Number(e.target.value),
												})
											}
											placeholder="0"
										/>
									</div>
								</div>

								<Button
									onClick={handleAddInvestment}
									className="flex w-full items-center justify-center gap-1"
								>
									<PlusCircle className="h-4 w-4" />
									<span>Add Investment</span>
								</Button>
							</div>
						</div>
					</Card>

					{/* Loans */}
					<Card className="p-6">
						<h2 className="mb-4 font-bold text-xl">Loans</h2>

						<div className="space-y-4">
							{loans.map((loan) => (
								<div
									key={loan.id}
									className="flex items-center justify-between rounded-md bg-secondary-slate/30 p-3"
								>
									<div>
										<div className="font-semibold">{loan.name}</div>
										<div className="text-sm text-text-gray">
											Amount: {loan.loanAmount.toLocaleString()} RON | Rate:{" "}
											{loan.interestRate}% | Period: {loan.periodMonths} months
										</div>
										<div className="mt-1 text-sm">
											<span className="font-medium text-accent-coral">
												Monthly Payment:{" "}
												{Math.round(
													calculateMonthlyPayment(loan),
												).toLocaleString()}{" "}
												RON
											</span>
											{loan.extraMonthlyPayment > 0 && (
												<span className="ml-2">
													+ {loan.extraMonthlyPayment.toLocaleString()} RON
													extra
												</span>
											)}
										</div>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={() => handleRemoveLoan(loan.id)}
										className="text-accent-coral"
									>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}

							<div className="space-y-2">
								<div className="grid grid-cols-2 gap-2">
									<div>
										<label className="mb-1 block text-sm" htmlFor="loanName">
											Name
										</label>
										<Input
											id="loanName"
											value={newLoan.name}
											onChange={(e) =>
												setNewLoan({ ...newLoan, name: e.target.value })
											}
											placeholder="Loan name"
										/>
									</div>
									<div>
										<label className="mb-1 block text-sm" htmlFor="loanAmount">
											Loan Amount
										</label>
										<Input
											id="loanAmount"
											type="number"
											value={newLoan.loanAmount}
											onChange={(e) =>
												setNewLoan({
													...newLoan,
													loanAmount: Number(e.target.value),
												})
											}
											placeholder="0"
										/>
									</div>
								</div>

								<div className="grid grid-cols-3 gap-2">
									<div>
										<label
											className="mb-1 block text-sm"
											htmlFor="interestRate"
										>
											Interest Rate (%)
										</label>
										<Input
											id="interestRate"
											type="number"
											value={newLoan.interestRate}
											onChange={(e) =>
												setNewLoan({
													...newLoan,
													interestRate: Number(e.target.value),
												})
											}
											placeholder="0"
										/>
									</div>
									<div>
										<label
											className="mb-1 block text-sm"
											htmlFor="periodMonths"
										>
											Period (months)
										</label>
										<Input
											id="periodMonths"
											type="number"
											value={newLoan.periodMonths}
											onChange={(e) =>
												setNewLoan({
													...newLoan,
													periodMonths: Number(e.target.value),
												})
											}
											placeholder="0"
										/>
									</div>
									<div>
										<label
											className="mb-1 block text-sm"
											htmlFor="extraMonthlyPayment"
										>
											Extra Payment
										</label>
										<Input
											id="extraMonthlyPayment"
											type="number"
											value={newLoan.extraMonthlyPayment}
											onChange={(e) =>
												setNewLoan({
													...newLoan,
													extraMonthlyPayment: Number(e.target.value),
												})
											}
											placeholder="0"
										/>
									</div>
								</div>

								{/* Display expected monthly payment */}
								{newLoanMonthlyPayment > 0 && (
									<div className="rounded bg-secondary-slate/20 p-2">
										<span className="text-sm">
											Expected Monthly Payment:{" "}
											<span className="font-medium text-accent-coral">
												{Math.round(newLoanMonthlyPayment).toLocaleString()} RON
											</span>
										</span>
									</div>
								)}

								<Button
									onClick={handleAddLoan}
									className="flex w-full items-center justify-center gap-1"
								>
									<PlusCircle className="h-4 w-4" />
									<span>Add Loan</span>
								</Button>
							</div>
						</div>
					</Card>
				</div>

				{/* Simulation Results */}
				{simulationResults.length > 0 && (
					<Card className="p-6">
						<h2 className="mb-4 font-bold text-xl">Simulation Results</h2>

						<div className="overflow-x-auto">
							<table className="w-full border-collapse">
								<thead>
									<tr className="border-secondary-slate/30 border-b">
										<th className="px-3 py-2 text-left">Month</th>
										<th className="px-3 py-2 text-left">Total Investments</th>
										<th className="px-3 py-2 text-left">Total Loans</th>
										<th className="px-3 py-2 text-left">Net Worth</th>
									</tr>
								</thead>
								<tbody>
									{simulationResults
										.filter(
											(result) =>
												result.month === 1 ||
												result.month % 12 === 0 ||
												result.month === simulationResults.length,
										)
										.map((result) => (
											<tr
												key={result.month}
												className="border-secondary-slate/30 border-b"
											>
												<td className="px-3 py-2">{result.month}</td>
												<td className="px-3 py-2 font-medium">
													{Math.round(
														result.totalInvestmentValue,
													).toLocaleString()}{" "}
													RON
												</td>
												<td className="px-3 py-2 font-medium text-accent-coral">
													{Math.round(result.totalLoanBalance).toLocaleString()}{" "}
													RON
												</td>
												<td className="px-3 py-2 font-medium text-accent-lime">
													{Math.round(result.netWorth).toLocaleString()} RON
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>

						{/* Detailed Results */}
						<div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
							{/* Investments Details */}
							{investments.length > 0 && (
								<div>
									<h3 className="mb-2 font-semibold">Investment Growth</h3>
									<table className="w-full border-collapse">
										<thead>
											<tr className="border-secondary-slate/30 border-b">
												<th className="px-3 py-2 text-left">Name</th>
												<th className="px-3 py-2 text-left">Initial</th>
												<th className="px-3 py-2 text-left">Final Value</th>
												<th className="px-3 py-2 text-left">Growth</th>
											</tr>
										</thead>
										<tbody>
											{investments.map((investment) => {
												const initialValue = investment.initialAmount;
												const finalValue =
													simulationResults[simulationResults.length - 1]
														?.investments[investment.name] || 0;
												const growth = finalValue - initialValue;
												const growthPercent =
													initialValue > 0 ? (growth / initialValue) * 100 : 0;

												return (
													<tr
														key={investment.id}
														className="border-secondary-slate/30 border-b"
													>
														<td className="px-3 py-2">{investment.name}</td>
														<td className="px-3 py-2">
															{initialValue.toLocaleString()} RON
														</td>
														<td className="px-3 py-2 font-medium">
															{Math.round(finalValue).toLocaleString()} RON
														</td>
														<td className="px-3 py-2 font-medium text-accent-lime">
															{Math.round(growth).toLocaleString()} RON (
															{growthPercent.toFixed(2)}%)
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}

							{/* Loans Details */}
							{loans.length > 0 && (
								<div>
									<h3 className="mb-2 font-semibold">Loan Payoff</h3>
									<table className="w-full border-collapse">
										<thead>
											<tr className="border-secondary-slate/30 border-b">
												<th className="px-3 py-2 text-left">Name</th>
												<th className="px-3 py-2 text-left">Initial</th>
												<th className="px-3 py-2 text-left">Remaining</th>
												<th className="px-3 py-2 text-left">Paid Off</th>
											</tr>
										</thead>
										<tbody>
											{loans.map((loan) => {
												const initialValue = loan.loanAmount;
												const finalValue =
													simulationResults[simulationResults.length - 1]
														?.loans[loan.name] || 0;
												const paidOff = initialValue - finalValue;
												const paidOffPercent = (paidOff / initialValue) * 100;

												return (
													<tr
														key={loan.id}
														className="border-secondary-slate/30 border-b"
													>
														<td className="px-3 py-2">{loan.name}</td>
														<td className="px-3 py-2">
															{initialValue.toLocaleString()} RON
														</td>
														<td className="px-3 py-2 font-medium text-accent-coral">
															{Math.round(finalValue).toLocaleString()} RON
														</td>
														<td className="px-3 py-2 font-medium">
															{Math.round(paidOff).toLocaleString()} RON (
															{paidOffPercent.toFixed(2)}%)
														</td>
													</tr>
												);
											})}
										</tbody>
									</table>
								</div>
							)}
						</div>
					</Card>
				)}
			</div>
		</AppLayout>
	);
}
