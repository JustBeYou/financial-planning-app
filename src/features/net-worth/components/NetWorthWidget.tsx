"use client";

import { Card } from "~/components/ui/card";

// Mock data - this will be replaced with real data later
const mockNetWorthData = {
    total: 250000,
    categories: [
        { name: "Cash & Deposits", value: 50000, color: "#4CAF50" },
        { name: "Investments", value: 150000, color: "#2196F3" },
        { name: "Real Estate", value: 300000, color: "#FF9800" },
        { name: "Debt", value: -250000, color: "#F44336" },
    ],
};

export function NetWorthWidget() {
    const totalNetWorth = mockNetWorthData.categories.reduce(
        (sum, category) => sum + category.value,
        0
    );

    return (
        <Card className="col-span-full p-6">
            <h2 className="mb-4 text-2xl font-bold">Net Worth Overview</h2>

            {/* Total Net Worth */}
            <div className="mb-6">
                <p className="text-sm text-gray-400">Total Net Worth</p>
                <p className="text-3xl font-bold">
                    ${totalNetWorth.toLocaleString()}
                </p>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Breakdown by Category</h3>
                <div className="space-y-3">
                    {mockNetWorthData.categories.map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
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