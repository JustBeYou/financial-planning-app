"use client";

import { Card } from "~/components/ui/card";

// Mock data - this will be replaced with real data later
const mockCashEntries = [
    { id: 1, accountName: "Savings Account", amount: 15000, currency: "RON", date: "2023-11-15" },
    { id: 2, accountName: "Checking Account", amount: 3500, currency: "RON", date: "2023-11-20" },
    { id: 3, accountName: "Emergency Fund", amount: 25000, currency: "RON", date: "2023-10-05" },
    { id: 4, accountName: "Vacation Fund", amount: 7500, currency: "RON", date: "2023-11-01" },
    { id: 5, accountName: "Cash at Home", amount: 1200, currency: "RON", date: "2023-11-25" },
];

export function CashEntriesWidget() {
    const totalCash = mockCashEntries.reduce(
        (sum, entry) => sum + entry.amount,
        0
    );

    return (
        <Card className="col-span-full p-6">
            <h2 className="mb-4 text-2xl font-bold">Cash Entries</h2>

            {/* Total Cash */}
            <div className="mb-6">
                <p className="text-sm text-gray-400">Total Cash</p>
                <p className="text-3xl font-bold">
                    {totalCash.toLocaleString()} RON
                </p>
            </div>

            {/* Cash Entries List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">All Cash Accounts</h3>
                <div className="space-y-3">
                    {/* Headers */}
                    <div className="grid grid-cols-4 font-medium text-gray-500">
                        <span>Account</span>
                        <span>Amount</span>
                        <span>Currency</span>
                        <span>Date</span>
                    </div>

                    {/* Entries */}
                    {mockCashEntries.map((entry) => (
                        <div key={entry.id} className="grid grid-cols-4 border-b border-gray-100 py-2">
                            <span>{entry.accountName}</span>
                            <span className="font-medium">
                                {entry.amount.toLocaleString()}
                            </span>
                            <span>{entry.currency}</span>
                            <span>{new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
} 