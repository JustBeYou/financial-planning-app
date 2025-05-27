import { Card } from "~/app/_components/ui/card";
import type { Investment, Loan, SimulationResult } from "../types";

interface SimulationResultsProps {
	simulationResults: SimulationResult[];
	investments: Investment[];
	loans: Loan[];
}

export function SimulationResults({
	simulationResults,
	investments,
	loans,
}: SimulationResultsProps) {
	if (simulationResults.length === 0) {
		return null;
	}

	return (
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
										{Math.round(result.totalInvestmentValue).toLocaleString()}{" "}
										RON
									</td>
									<td className="px-3 py-2 font-medium text-accent-coral">
										{Math.round(result.totalLoanBalance).toLocaleString()} RON
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
										simulationResults[simulationResults.length - 1]?.loans[
											loan.name
										] || 0;
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
	);
}
