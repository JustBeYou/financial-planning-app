"use client";

import { Card } from "~/components/ui/card";

// Mock data - this will be replaced with real data later
const mockDeposits = [
    {
        id: 1,
        bankName: "First Bank",
        amount: 50000,
        currency: "RON",
        startDate: "2023-10-01",
        interest: 5.25,
        lengthMonths: 12,
        maturityDate: "2024-10-01"
    },
    {
        id: 2,
        bankName: "Credit Union",
        amount: 25000,
        currency: "RON",
        startDate: "2023-11-15",
        interest: 4.75,
        lengthMonths: 6,
        maturityDate: "2024-05-15"
    },
    {
        id: 3,
        bankName: "National Bank",
        amount: 100000,
        currency: "RON",
        startDate: "2023-09-10",
        interest: 6.00,
        lengthMonths: 24,
        maturityDate: "2025-09-10"
    },
    {
        id: 4,
        bankName: "City Bank",
        amount: 30000,
        currency: "RON",
        startDate: "2023-12-01",
        interest: 5.50,
        lengthMonths: 18,
        maturityDate: "2025-06-01"
    },
];

export function DepositsWidget() {
    const totalDeposits = mockDeposits.reduce(
        (sum, deposit) => sum + deposit.amount,
        0
    );

    // Calculate estimated interest at maturity for all deposits
    const totalEstimatedInterest = mockDeposits.reduce((sum, deposit) => {
        const yearlyInterest = deposit.amount * (deposit.interest / 100);
        const monthlyInterest = yearlyInterest / 12;
        return sum + (monthlyInterest * deposit.lengthMonths);
    }, 0);

    return (
        <Card className="col-span-full p-6">
            <h2 className="mb-4 text-2xl font-bold">Term Deposits</h2>

            {/* Total Deposits and Interest */}
            <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-400">Total Principal</p>
                    <p className="text-3xl font-bold">
                        {totalDeposits.toLocaleString()} RON
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Est. Interest at Maturity</p>
                    <p className="text-3xl font-bold">
                        {Math.round(totalEstimatedInterest).toLocaleString()} RON
                    </p>
                </div>
            </div>

            {/* Deposits List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">All Deposits</h3>
                <div className="space-y-3">
                    {/* Headers */}
                    <div className="grid grid-cols-7 text-sm font-medium text-gray-500">
                        <span>Bank</span>
                        <span>Amount</span>
                        <span>Currency</span>
                        <span>Start Date</span>
                        <span>Interest (%)</span>
                        <span>Length</span>
                        <span>Maturity Date</span>
                    </div>

                    {/* Entries */}
                    {mockDeposits.map((deposit) => (
                        <div key={deposit.id} className="grid grid-cols-7 border-b border-gray-100 py-2 text-sm">
                            <span>{deposit.bankName}</span>
                            <span className="font-medium">
                                {deposit.amount.toLocaleString()}
                            </span>
                            <span>{deposit.currency}</span>
                            <span>{new Date(deposit.startDate).toLocaleDateString()}</span>
                            <span>{deposit.interest.toFixed(2)}%</span>
                            <span>{deposit.lengthMonths} months</span>
                            <span>{new Date(deposit.maturityDate).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
} 