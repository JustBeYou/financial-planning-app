import { Card } from "~/components/ui/card";
import { ALLOCATION_COLORS, REMAINING_COLOR } from "./types";
import type { AllocationItem } from "./types";

interface BudgetOverviewCardProps {
	title: string;
	totalIncome: number;
	allocations: AllocationItem[];
	remainingIncome: number;
	currency?: string;
}

export function BudgetOverviewCard({
	title,
	totalIncome,
	allocations,
	remainingIncome,
	currency = "RON",
}: BudgetOverviewCardProps) {
	// Sort allocations from largest to smallest
	const sortedAllocations = [...allocations].sort(
		(a, b) => b.amount - a.amount,
	);

	// Add remaining income to visualizations
	const allocationsWithRemaining = [...sortedAllocations];
	if (remainingIncome > 0) {
		allocationsWithRemaining.push({
			id: "remaining",
			name: "Remaining Income",
			amount: remainingIncome,
			percentage: totalIncome > 0 ? (remainingIncome / totalIncome) * 100 : 0,
		});
	}

	return (
		<Card className="p-6">
			<div className="mb-6 flex items-center justify-between">
				<h2 className="font-bold text-2xl">{title}</h2>
				<div className="text-right">
					<div className="text-muted-foreground text-sm">Total Income</div>
					<div className="font-bold text-accent-lime text-xl">
						{Math.round(totalIncome).toLocaleString()} {currency}
					</div>
				</div>
			</div>

			{totalIncome > 0 ? (
				<>
					{/* Visual representation */}
					<div className="mb-4 flex h-8 w-full overflow-hidden rounded-lg">
						{allocationsWithRemaining.map((item, index) => (
							<div
								key={item.id}
								className={`${item.id === "remaining" ? REMAINING_COLOR : ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}`}
								style={{ width: `${item.percentage}%` }}
								title={`${item.name}: ${Math.round(item.percentage)}%`}
							/>
						))}
					</div>

					{/* Legend and details */}
					<div className="space-y-2">
						{allocationsWithRemaining.map((item, index) => (
							<div key={item.id} className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<div
										className={`h-4 w-4 rounded-sm ${item.id === "remaining" ? REMAINING_COLOR : ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]}`}
									/>
									<span>{item.name}</span>
								</div>
								<div className="flex items-center gap-3">
									<span className="text-muted-foreground text-sm">
										{Math.round(item.percentage)}%
									</span>
									<span className="font-medium">
										{Math.round(item.amount).toLocaleString()} {currency}
									</span>
								</div>
							</div>
						))}
					</div>

					{/* Remaining income summary */}
					{remainingIncome > 0 && (
						<div className="mt-4 flex items-center justify-between border-t pt-3">
							<span className="font-medium">Remaining Income:</span>
							<span
								className={`font-bold ${remainingIncome >= 0 ? "text-accent-lime" : "text-red-500"}`}
							>
								{Math.round(remainingIncome).toLocaleString()} {currency}
							</span>
						</div>
					)}
				</>
			) : (
				<div className="text-center text-muted-foreground">
					Add income sources to see budget overview
				</div>
			)}
		</Card>
	);
}
