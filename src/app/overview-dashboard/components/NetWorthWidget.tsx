"use client";

import { Card } from "~/app/_components/ui/card";
import { api } from "~/trpc/react";

export function NetWorthWidget() {
	// Fetch net worth data from the API
	const { data: netWorthData, isLoading } = api.netWorth.getData.useQuery();

	// If data is loading, show a loading state
	if (isLoading) {
		return (
			<Card className="col-span-full p-6">
				<h2 className="mb-4 font-bold text-2xl">Net Worth Overview</h2>
				<p>Loading...</p>
			</Card>
		);
	}

	// If no data, show error
	if (!netWorthData) {
		return (
			<Card className="col-span-full p-6">
				<h2 className="mb-4 font-bold text-2xl">Net Worth Overview</h2>
				<p>Failed to load net worth data</p>
			</Card>
		);
	}

	// Calculate total net worth
	const totalNetWorth = netWorthData.categories.reduce(
		(sum, category) => sum + category.value,
		0,
	);

	return (
		<Card className="col-span-full p-6">
			<h2 className="mb-4 font-bold text-2xl">Net Worth Overview</h2>

			{/* Total Net Worth */}
			<div className="mb-6">
				<p className="text-sm text-text-gray">Total Net Worth</p>
				<p className="font-bold text-3xl">${totalNetWorth.toLocaleString()}</p>
			</div>

			{/* Category Breakdown */}
			<div className="space-y-4">
				<h3 className="font-semibold text-lg">Breakdown by Category</h3>
				<div className="space-y-3">
					{netWorthData.categories.map((category) => (
						<div
							key={category.name}
							className="flex items-center justify-between"
						>
							<div className="flex items-center gap-2">
								<div
									className="h-3 w-3 rounded-full"
									style={{ backgroundColor: category.color }}
								/>
								<span>{category.name}</span>
							</div>
							<span className="font-medium">
								${category.value.toLocaleString()}
							</span>
						</div>
					))}
				</div>
			</div>
		</Card>
	);
}
