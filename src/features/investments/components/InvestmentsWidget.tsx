"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

// Initial mock data
const initialInvestments = [
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

type Investment = {
    id: number;
    name: string;
    value: number;
    currency: string;
    date: string;
    estimatedYearlyInterest: number;
};

export function InvestmentsWidget() {
    const [investments, setInvestments] = useState<Investment[]>(initialInvestments);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentInvestment, setCurrentInvestment] = useState<Investment | null>(null);
    const [formData, setFormData] = useState<Omit<Investment, "id">>({
        name: "",
        value: 0,
        currency: "RON",
        date: new Date().toISOString().split("T")[0],
        estimatedYearlyInterest: 0,
    });

    const totalInvestments = investments.reduce(
        (sum, investment) => sum + investment.value,
        0
    );

    // Calculate weighted average estimated yearly interest
    const weightedInterestSum = investments.reduce(
        (sum, investment) => sum + (investment.value * investment.estimatedYearlyInterest),
        0
    );
    const averageYearlyInterest = totalInvestments > 0
        ? weightedInterestSum / totalInvestments
        : 0;

    // Calculate estimated yearly earnings
    const estimatedYearlyEarnings = totalInvestments * (averageYearlyInterest / 100);

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                name === "value" || name === "estimatedYearlyInterest"
                    ? parseFloat(value) || 0
                    : value,
        }));
    };

    // Add new investment
    const handleAdd = () => {
        setFormData({
            name: "",
            value: 0,
            currency: "RON",
            date: new Date().toISOString().split("T")[0],
            estimatedYearlyInterest: 0,
        });
        setIsAddDialogOpen(true);
    };

    const handleAddSubmit = () => {
        const newId = investments.length > 0
            ? Math.max(...investments.map(inv => inv.id)) + 1
            : 1;

        const newInvestment = {
            id: newId,
            ...formData,
        };

        setInvestments((prev) => [...prev, newInvestment]);
        setIsAddDialogOpen(false);
    };

    // Edit investment
    const handleEdit = (investment: Investment) => {
        setCurrentInvestment(investment);
        setFormData({
            name: investment.name,
            value: investment.value,
            currency: investment.currency,
            date: investment.date,
            estimatedYearlyInterest: investment.estimatedYearlyInterest,
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = () => {
        if (!currentInvestment) return;

        setInvestments((prev) =>
            prev.map((investment) =>
                investment.id === currentInvestment.id
                    ? { ...investment, ...formData }
                    : investment
            )
        );
        setIsEditDialogOpen(false);
    };

    // Delete investment
    const handleDelete = (investment: Investment) => {
        setCurrentInvestment(investment);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!currentInvestment) return;

        setInvestments((prev) => prev.filter((inv) => inv.id !== currentInvestment.id));
        setIsDeleteDialogOpen(false);
    };

    return (
        <Card className="col-span-full p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Investments</h2>
                <Button onClick={handleAdd} size="sm" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add</span>
                </Button>
            </div>

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
                    <div className="grid grid-cols-6 font-medium text-gray-500">
                        <span>Investment</span>
                        <span>Value</span>
                        <span>Currency</span>
                        <span>Last Updated</span>
                        <span>Est. Yearly Return</span>
                        <span>Actions</span>
                    </div>

                    {/* Entries */}
                    {investments.length === 0 ? (
                        <div className="py-4 text-center text-gray-400">
                            No investments. Click "Add" to create one.
                        </div>
                    ) : (
                        investments.map((investment) => (
                            <div key={investment.id} className="grid grid-cols-6 border-b border-gray-100 py-2">
                                <span>{investment.name}</span>
                                <span className="font-medium">
                                    {investment.value.toLocaleString()}
                                </span>
                                <span>{investment.currency}</span>
                                <span>{new Date(investment.date).toLocaleDateString()}</span>
                                <span className="font-medium">
                                    {investment.estimatedYearlyInterest.toFixed(1)}%
                                </span>
                                <span className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(investment)}
                                        className="h-8 w-8"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(investment)}
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

            {/* Add Investment Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Investment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right">
                                Investment Name
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
                            <label htmlFor="value" className="text-right">
                                Value
                            </label>
                            <Input
                                id="value"
                                name="value"
                                type="number"
                                value={formData.value}
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
                            <label htmlFor="date" className="text-right">
                                Date
                            </label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="estimatedYearlyInterest" className="text-right">
                                Est. Yearly Return (%)
                            </label>
                            <Input
                                id="estimatedYearlyInterest"
                                name="estimatedYearlyInterest"
                                type="number"
                                step="0.1"
                                value={formData.estimatedYearlyInterest}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddSubmit}>Add Investment</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Investment Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Investment</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right">
                                Investment Name
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
                            <label htmlFor="value" className="text-right">
                                Value
                            </label>
                            <Input
                                id="value"
                                name="value"
                                type="number"
                                value={formData.value}
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
                            <label htmlFor="date" className="text-right">
                                Date
                            </label>
                            <Input
                                id="date"
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleInputChange}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="estimatedYearlyInterest" className="text-right">
                                Est. Yearly Return (%)
                            </label>
                            <Input
                                id="estimatedYearlyInterest"
                                name="estimatedYearlyInterest"
                                type="number"
                                step="0.1"
                                value={formData.estimatedYearlyInterest}
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
                            Are you sure you want to delete the "{currentInvestment?.name}" investment?
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