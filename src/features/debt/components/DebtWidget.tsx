"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

// Initial mock data
const initialDebts = [
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

type Debt = {
    id: number;
    name: string;
    amount: number;
    currency: string;
    interestRate: number;
    lengthMonths: number;
};

export function DebtWidget() {
    const [debts, setDebts] = useState<Debt[]>(initialDebts);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentDebt, setCurrentDebt] = useState<Debt | null>(null);
    const [formData, setFormData] = useState<Omit<Debt, "id">>({
        name: "",
        amount: 0,
        currency: "RON",
        interestRate: 0,
        lengthMonths: 0,
    });

    const totalDebt = debts.reduce(
        (sum, debt) => sum + debt.amount,
        0
    );

    // Calculate weighted average interest rate
    const weightedInterestSum = debts.reduce(
        (sum, debt) => sum + (debt.amount * debt.interestRate),
        0
    );
    const averageInterestRate = totalDebt > 0
        ? weightedInterestSum / totalDebt
        : 0;

    // Calculate estimated yearly interest payment
    const yearlyInterestPayment = totalDebt * (averageInterestRate / 100);

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "amount" || name === "interestRate" || name === "lengthMonths"
                    ? parseFloat(value) || 0
                    : value,
        }));
    };

    // Add new debt
    const handleAdd = () => {
        setFormData({
            name: "",
            amount: 0,
            currency: "RON",
            interestRate: 0,
            lengthMonths: 0,
        });
        setIsAddDialogOpen(true);
    };

    const handleAddSubmit = () => {
        const newId = debts.length > 0
            ? Math.max(...debts.map(d => d.id)) + 1
            : 1;

        const newDebt = {
            id: newId,
            ...formData,
        };

        setDebts((prev) => [...prev, newDebt]);
        setIsAddDialogOpen(false);
    };

    // Edit debt
    const handleEdit = (debt: Debt) => {
        setCurrentDebt(debt);
        setFormData({
            name: debt.name,
            amount: debt.amount,
            currency: debt.currency,
            interestRate: debt.interestRate,
            lengthMonths: debt.lengthMonths,
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = () => {
        if (!currentDebt) return;

        setDebts((prev) =>
            prev.map((debt) =>
                debt.id === currentDebt.id
                    ? { ...debt, ...formData }
                    : debt
            )
        );
        setIsEditDialogOpen(false);
    };

    // Delete debt
    const handleDelete = (debt: Debt) => {
        setCurrentDebt(debt);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!currentDebt) return;

        setDebts((prev) => prev.filter((d) => d.id !== currentDebt.id));
        setIsDeleteDialogOpen(false);
    };

    return (
        <Card className="col-span-full p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Debt Overview</h2>
                <Button onClick={handleAdd} size="sm" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add</span>
                </Button>
            </div>

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
                    <div className="grid grid-cols-6 font-medium text-gray-500">
                        <span>Debt</span>
                        <span>Amount</span>
                        <span>Currency</span>
                        <span>Interest Rate</span>
                        <span>Term</span>
                        <span>Actions</span>
                    </div>

                    {/* Entries */}
                    {debts.length === 0 ? (
                        <div className="py-4 text-center text-gray-400">
                            No debts. Click "Add" to create one.
                        </div>
                    ) : (
                        debts.map((debt) => (
                            <div key={debt.id} className="grid grid-cols-6 border-b border-gray-100 py-2">
                                <span>{debt.name}</span>
                                <span className="font-medium text-red-500">
                                    {debt.amount.toLocaleString()}
                                </span>
                                <span>{debt.currency}</span>
                                <span>{debt.interestRate.toFixed(2)}%</span>
                                <span>{debt.lengthMonths} months</span>
                                <span className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(debt)}
                                        className="h-8 w-8"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(debt)}
                                        className="h-8 w-8 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add Debt Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Debt</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right">
                                Debt Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="amount" className="text-right">
                                Amount
                            </label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="currency" className="text-right">
                                Currency
                            </label>
                            <Input
                                id="currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleInputChange}
                                disabled
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="interestRate" className="text-right">
                                Interest Rate (%)
                            </label>
                            <Input
                                id="interestRate"
                                name="interestRate"
                                type="number"
                                step="0.01"
                                value={formData.interestRate}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="lengthMonths" className="text-right">
                                Term (months)
                            </label>
                            <Input
                                id="lengthMonths"
                                name="lengthMonths"
                                type="number"
                                value={formData.lengthMonths}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddSubmit}>Add Debt</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Debt Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Debt</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right">
                                Debt Name
                            </label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="amount" className="text-right">
                                Amount
                            </label>
                            <Input
                                id="amount"
                                name="amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="currency" className="text-right">
                                Currency
                            </label>
                            <Input
                                id="currency"
                                name="currency"
                                value={formData.currency}
                                onChange={handleInputChange}
                                disabled
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="interestRate" className="text-right">
                                Interest Rate (%)
                            </label>
                            <Input
                                id="interestRate"
                                name="interestRate"
                                type="number"
                                step="0.01"
                                value={formData.interestRate}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="lengthMonths" className="text-right">
                                Term (months)
                            </label>
                            <Input
                                id="lengthMonths"
                                name="lengthMonths"
                                type="number"
                                value={formData.lengthMonths}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditSubmit}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p>
                            Are you sure you want to delete the "{currentDebt?.name}" debt?
                            This action cannot be undone.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
} 