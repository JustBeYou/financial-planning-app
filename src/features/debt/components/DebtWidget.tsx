"use client";

import { Card } from "~/components/ui/card";

// Mock data - this will be replaced with real data later
const mockDebts = [
    {
        id: 1,
        name: "Mortgage",
        amount: 320000,
        currency: "RON",
        interestRate: 4.25,
        lengthMonths: 240 // 20 years
    },
    {
        id: 2,
        name: "Car Loan",
        amount: 45000,
        currency: "RON",
        interestRate: 5.75,
        lengthMonths: 60 // 5 years
    },
    {
        id: 3,
        name: "Student Loan",
        amount: 25000,
        currency: "RON",
        interestRate: 3.8,
        lengthMonths: 120 // 10 years
    },
    {
        id: 4,
        name: "Personal Loan",
        amount: 12000,
        currency: "RON",
        interestRate: 8.5,
        lengthMonths: 36 // 3 years
    },
    {
        id: 5,
        name: "Credit Card",
        amount: 7500,
        currency: "RON",
        interestRate: 18.9,
        lengthMonths: 12 // 1 year
    }
];

export function DebtWidget() {
    const totalDebt = mockDebts.reduce(
        (sum, debt) => sum + debt.amount,
        0
    );

    // Calculate weighted average interest rate
    const weightedInterestSum = mockDebts.reduce(
        (sum, debt) => sum + (debt.amount * debt.interestRate),
        0
    );
    const averageInterestRate = weightedInterestSum / totalDebt;

    // Calculate estimated yearly interest payment
    const yearlyInterestPayment = totalDebt * (averageInterestRate / 100);

    return (
        <Card className="col-span-full p-6">
            <h2 className="mb-4 text-2xl font-bold">Debt Overview</h2>

            {/* Summary Section */}
            <div className="mb-6 grid grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-gray-400">Total Debt</p>
                    <p className="text-3xl font-bold text-red-500">
                        {totalDebt.toLocaleString()} RON
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Avg. Interest Rate</p>
                    <p className="text-3xl font-bold">
                        {averageInterestRate.toFixed(2)}%
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Est. Yearly Interest</p>
                    <p className="text-3xl font-bold text-red-500">
                        {Math.round(yearlyInterestPayment).toLocaleString()} RON
                    </p>
                </div>
            </div>

            {/* Debts List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">All Debts</h3>
                <div className="space-y-3">
                    {/* Headers */}
                    <div className="grid grid-cols-5 font-medium text-gray-500">
                        <span>Debt</span>
                        <span>Amount</span>
                        <span>Currency</span>
                        <span>Interest Rate</span>
                        <span>Term</span>
                    </div>

                    {/* Entries */}
                    {mockDebts.map((debt) => (
                        <div key={debt.id} className="grid grid-cols-5 border-b border-gray-100 py-2">
                            <span>{debt.name}</span>
                            <span className="font-medium text-red-500">
                                {debt.amount.toLocaleString()}
                            </span>
                            <span>{debt.currency}</span>
                            <span>{debt.interestRate.toFixed(2)}%</span>
                            <span>{debt.lengthMonths} months</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
} 