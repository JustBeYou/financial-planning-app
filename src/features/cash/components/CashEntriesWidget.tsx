"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

// Initial mock data
const initialCashEntries = [
    { id: 1, accountName: "Savings Account", amount: 15000, currency: "RON", date: "2023-11-15" },
    { id: 2, accountName: "Checking Account", amount: 3500, currency: "RON", date: "2023-11-20" },
    { id: 3, accountName: "Emergency Fund", amount: 25000, currency: "RON", date: "2023-10-05" },
    { id: 4, accountName: "Vacation Fund", amount: 7500, currency: "RON", date: "2023-11-01" },
    { id: 5, accountName: "Cash at Home", amount: 1200, currency: "RON", date: "2023-11-25" },
];

type CashEntry = {
    id: number;
    accountName: string;
    amount: number;
    currency: string;
    date: string;
};

export function CashEntriesWidget() {
    const [entries, setEntries] = useState<CashEntry[]>(initialCashEntries);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentEntry, setCurrentEntry] = useState<CashEntry | null>(null);
    const [formData, setFormData] = useState<Omit<CashEntry, "id">>({
        accountName: "",
        amount: 0,
        currency: "RON",
        date: new Date().toISOString().split("T")[0],
    });

    const totalCash = entries.reduce((sum, entry) => sum + entry.amount, 0);

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "amount" ? parseFloat(value) || 0 : value,
        }));
    };

    // Add new entry
    const handleAdd = () => {
        setFormData({
            accountName: "",
            amount: 0,
            currency: "RON",
            date: new Date().toISOString().split("T")[0],
        });
        setIsAddDialogOpen(true);
    };

    const handleAddSubmit = () => {
        const newId = entries.length > 0
            ? Math.max(...entries.map(e => e.id)) + 1
            : 1;

        const newEntry = {
            id: newId,
            ...formData,
        };
        setEntries((prev) => [...prev, newEntry]);
        setIsAddDialogOpen(false);
    };

    // Edit entry
    const handleEdit = (entry: CashEntry) => {
        setCurrentEntry(entry);
        setFormData({
            accountName: entry.accountName,
            amount: entry.amount,
            currency: entry.currency,
            date: entry.date,
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = () => {
        if (!currentEntry) return;

        setEntries((prev) =>
            prev.map((entry) =>
                entry.id === currentEntry.id
                    ? { ...entry, ...formData }
                    : entry
            )
        );
        setIsEditDialogOpen(false);
    };

    // Delete entry
    const handleDelete = (entry: CashEntry) => {
        setCurrentEntry(entry);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!currentEntry) return;

        setEntries((prev) => prev.filter((entry) => entry.id !== currentEntry.id));
        setIsDeleteDialogOpen(false);
    };

    return (
        <Card className="col-span-full p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Cash Entries</h2>
                <Button onClick={handleAdd} size="sm" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add</span>
                </Button>
            </div>

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
                    <div className="grid grid-cols-5 font-medium text-gray-500">
                        <span>Account</span>
                        <span>Amount</span>
                        <span>Currency</span>
                        <span>Date</span>
                        <span>Actions</span>
                    </div>

                    {/* Entries */}
                    {entries.length === 0 ? (
                        <div className="py-4 text-center text-gray-400">
                            No cash entries. Click "Add" to create one.
                        </div>
                    ) : (
                        entries.map((entry) => (
                            <div key={entry.id} className="grid grid-cols-5 border-b border-gray-100 py-2">
                                <span>{entry.accountName}</span>
                                <span className="font-medium">
                                    {entry.amount.toLocaleString()}
                                </span>
                                <span>{entry.currency}</span>
                                <span>{new Date(entry.date).toLocaleDateString()}</span>
                                <span className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(entry)}
                                        className="h-8 w-8"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(entry)}
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

            {/* Add Entry Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Cash Entry</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="accountName" className="text-right">
                                Account
                            </label>
                            <Input
                                id="accountName"
                                name="accountName"
                                value={formData.accountName}
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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddSubmit}>Add Entry</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Entry Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Cash Entry</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="accountName" className="text-right">
                                Account
                            </label>
                            <Input
                                id="accountName"
                                name="accountName"
                                value={formData.accountName}
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
                            Are you sure you want to delete the "{currentEntry?.accountName}" cash entry?
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