"use client";

import { Card } from "~/components/ui/card";

// Mock data - this will be replaced with real data later
const mockInvestments = [
    {
        id: 1,
        name: "Stock Portfolio",
        value: 75000,
        currency: "RON",
        date: "2023-11-30",
        estimatedYearlyInterest: 8.5
    },
    {
        id: 2,
        name: "Index Fund",
        value: 120000,
        currency: "RON",
        date: "2023-11-28",
        estimatedYearlyInterest: 7.2
    },
    {
        id: 3,
        name: "Corporate Bonds",
        value: 50000,
        currency: "RON",
        date: "2023-10-15",
        estimatedYearlyInterest: 5.8
    },
    {
        id: 4,
        name: "Real Estate Fund",
        value: 200000,
        currency: "RON",
        date: "2023-09-01",
        estimatedYearlyInterest: 6.5
    },
    {
        id: 5,
        name: "Cryptocurrency",
        value: 30000,
        currency: "RON",
        date: "2023-11-15",
        estimatedYearlyInterest: 12.0
    }
];

export function InvestmentsWidget() {
    const totalInvestments = mockInvestments.reduce(
        (sum, investment) => sum + investment.value,
        0
    );

    // Calculate weighted average estimated yearly interest
    const weightedInterestSum = mockInvestments.reduce(
        (sum, investment) => sum + (investment.value * investment.estimatedYearlyInterest),
        0
    );
    const averageYearlyInterest = weightedInterestSum / totalInvestments;

    // Calculate estimated yearly earnings
    const estimatedYearlyEarnings = totalInvestments * (averageYearlyInterest / 100);

    return (
        <Card className="col-span-full p-6">
            <h2 className="mb-4 text-2xl font-bold">Investments</h2>

            {/* Summary Section */}
            <div className="mb-6 grid grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-gray-400">Total Investments</p>
                    <p className="text-3xl font-bold">
                        {totalInvestments.toLocaleString()} RON
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Avg. Est. Yearly Return</p>
                    <p className="text-3xl font-bold">
                        {averageYearlyInterest.toFixed(2)}%
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Est. Yearly Earnings</p>
                    <p className="text-3xl font-bold">
                        {Math.round(estimatedYearlyEarnings).toLocaleString()} RON
                    </p>
                </div>
            </div>

            {/* Investments List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">All Investments</h3>
                <div className="space-y-3">
                    {/* Headers */}
                    <div className="grid grid-cols-5 font-medium text-gray-500">
                        <span>Investment</span>
                        <span>Value</span>
                        <span>Currency</span>
                        <span>Last Updated</span>
                        <span>Est. Yearly Return</span>
                    </div>

                    {/* Entries */}
                    {mockInvestments.map((investment) => (
                        <div key={investment.id} className="grid grid-cols-5 border-b border-gray-100 py-2">
                            <span>{investment.name}</span>
                            <span className="font-medium">
                                {investment.value.toLocaleString()}
                            </span>
                            <span>{investment.currency}</span>
                            <span>{new Date(investment.date).toLocaleDateString()}</span>
                            <span className="font-medium">
                                {investment.estimatedYearlyInterest.toFixed(1)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
} 