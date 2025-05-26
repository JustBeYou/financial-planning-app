"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

// Initial mock data
const initialDeposits = [
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

type Deposit = {
    id: number;
    bankName: string;
    amount: number;
    currency: string;
    startDate: string;
    interest: number;
    lengthMonths: number;
    maturityDate: string;
};

// Calculate maturity date based on start date and length
const calculateMaturityDate = (startDate: string, lengthMonths: number): string => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + lengthMonths);
    return date.toISOString().split('T')[0];
};

export function DepositsWidget() {
    const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentDeposit, setCurrentDeposit] = useState<Deposit | null>(null);
    const [formData, setFormData] = useState<Omit<Deposit, "id" | "maturityDate">>({
        bankName: "",
        amount: 0,
        currency: "RON",
        startDate: new Date().toISOString().split("T")[0],
        interest: 0,
        lengthMonths: 12,
    });

    // Calculate totals for display
    const totalDeposits = deposits.reduce(
        (sum, deposit) => sum + deposit.amount,
        0
    );

    const totalEstimatedInterest = deposits.reduce((sum, deposit) => {
        const yearlyInterest = deposit.amount * (deposit.interest / 100);
        const monthlyInterest = yearlyInterest / 12;
        return sum + (monthlyInterest * deposit.lengthMonths);
    }, 0);

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedData = {
                ...prev,
                [name]:
                    name === "amount" || name === "interest" || name === "lengthMonths"
                        ? parseFloat(value) || 0
                        : value,
            };
            return updatedData;
        });
    };

    // Add new deposit
    const handleAdd = () => {
        setFormData({
            bankName: "",
            amount: 0,
            currency: "RON",
            startDate: new Date().toISOString().split("T")[0],
            interest: 0,
            lengthMonths: 12,
        });
        setIsAddDialogOpen(true);
    };

    const handleAddSubmit = () => {
        const maturityDate = calculateMaturityDate(
            formData.startDate,
            formData.lengthMonths
        );

        const newId = deposits.length > 0
            ? Math.max(...deposits.map(d => d.id)) + 1
            : 1;

        const newDeposit = {
            id: newId,
            ...formData,
            maturityDate,
        };

        setDeposits((prev) => [...prev, newDeposit]);
        setIsAddDialogOpen(false);
    };

    // Edit deposit
    const handleEdit = (deposit: Deposit) => {
        setCurrentDeposit(deposit);
        const { id, maturityDate, ...formFields } = deposit;
        setFormData(formFields);
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = () => {
        if (!currentDeposit) return;

        const maturityDate = calculateMaturityDate(
            formData.startDate,
            formData.lengthMonths
        );

        setDeposits((prev) =>
            prev.map((deposit) =>
                deposit.id === currentDeposit.id
                    ? { ...deposit, ...formData, maturityDate }
                    : deposit
            )
        );
        setIsEditDialogOpen(false);
    };

    // Delete deposit
    const handleDelete = (deposit: Deposit) => {
        setCurrentDeposit(deposit);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!currentDeposit) return;

        setDeposits((prev) => prev.filter((deposit) => deposit.id !== currentDeposit.id));
        setIsDeleteDialogOpen(false);
    };

    return (
        <Card className="col-span-full p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Term Deposits</h2>
                <Button onClick={handleAdd} size="sm" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add</span>
                </Button>
            </div>

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
                    <div className="grid grid-cols-8 text-sm font-medium text-gray-500">
                        <span>Bank</span>
                        <span>Amount</span>
                        <span>Currency</span>
                        <span>Start Date</span>
                        <span>Interest (%)</span>
                        <span>Length</span>
                        <span>Maturity Date</span>
                        <span>Actions</span>
                    </div>

                    {/* Entries */}
                    {deposits.length === 0 ? (
                        <div className="py-4 text-center text-gray-400">
                            No deposits. Click "Add" to create one.
                        </div>
                    ) : (
                        deposits.map((deposit) => (
                            <div key={deposit.id} className="grid grid-cols-8 border-b border-gray-100 py-2 text-sm">
                                <span>{deposit.bankName}</span>
                                <span className="font-medium">
                                    {deposit.amount.toLocaleString()}
                                </span>
                                <span>{deposit.currency}</span>
                                <span>{new Date(deposit.startDate).toLocaleDateString()}</span>
                                <span>{deposit.interest.toFixed(2)}%</span>
                                <span>{deposit.lengthMonths} months</span>
                                <span>{new Date(deposit.maturityDate).toLocaleDateString()}</span>
                                <span className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(deposit)}
                                        className="h-8 w-8"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(deposit)}
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

            {/* Add Deposit Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Term Deposit</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="bankName" className="text-right">
                                Bank Name
                            </label>
                            <Input
                                id="bankName"
                                name="bankName"
                                value={formData.bankName}
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
                            <label htmlFor="startDate" className="text-right">
                                Start Date
                            </label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="interest" className="text-right">
                                Interest Rate (%)
                            </label>
                            <Input
                                id="interest"
                                name="interest"
                                type="number"
                                step="0.01"
                                value={formData.interest}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="lengthMonths" className="text-right">
                                Length (months)
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right">
                                Maturity Date
                            </label>
                            <div className="col-span-3 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-gray-500">
                                {formData.startDate && formData.lengthMonths
                                    ? new Date(calculateMaturityDate(formData.startDate, formData.lengthMonths)).toLocaleDateString()
                                    : "Set start date and length"}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddSubmit}>Add Deposit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Deposit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Term Deposit</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="bankName" className="text-right">
                                Bank Name
                            </label>
                            <Input
                                id="bankName"
                                name="bankName"
                                value={formData.bankName}
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
                            <label htmlFor="startDate" className="text-right">
                                Start Date
                            </label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="interest" className="text-right">
                                Interest Rate (%)
                            </label>
                            <Input
                                id="interest"
                                name="interest"
                                type="number"
                                step="0.01"
                                value={formData.interest}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="lengthMonths" className="text-right">
                                Length (months)
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
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label className="text-right">
                                Maturity Date
                            </label>
                            <div className="col-span-3 rounded-md border border-input bg-transparent px-3 py-1 text-sm text-gray-500">
                                {formData.startDate && formData.lengthMonths
                                    ? new Date(calculateMaturityDate(formData.startDate, formData.lengthMonths)).toLocaleDateString()
                                    : "Set start date and length"}
                            </div>
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
                            Are you sure you want to delete the deposit at {currentDeposit?.bankName}?
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