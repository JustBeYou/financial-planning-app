"use client";

import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { PlusCircle, Pencil, Trash2 } from "lucide-react";

// Initial mock data
const initialRealEstate = [
    {
        id: 1,
        name: "Primary Residence",
        value: 450000,
        currency: "RON",
        date: "2023-10-15"
    },
    {
        id: 2,
        name: "Rental Apartment",
        value: 320000,
        currency: "RON",
        date: "2023-11-01"
    },
    {
        id: 3,
        name: "Vacation Property",
        value: 280000,
        currency: "RON",
        date: "2023-09-20"
    },
    {
        id: 4,
        name: "Land Investment",
        value: 150000,
        currency: "RON",
        date: "2023-08-05"
    }
];

type Property = {
    id: number;
    name: string;
    value: number;
    currency: string;
    date: string;
};

export function RealEstateWidget() {
    const [properties, setProperties] = useState<Property[]>(initialRealEstate);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentProperty, setCurrentProperty] = useState<Property | null>(null);
    const [formData, setFormData] = useState<Omit<Property, "id">>({
        name: "",
        value: 0,
        currency: "RON",
        date: new Date().toISOString().split("T")[0],
    });

    const totalValue = properties.reduce(
        (sum, property) => sum + property.value,
        0
    );

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "value" ? parseFloat(value) || 0 : value,
        }));
    };

    // Add new property
    const handleAdd = () => {
        setFormData({
            name: "",
            value: 0,
            currency: "RON",
            date: new Date().toISOString().split("T")[0],
        });
        setIsAddDialogOpen(true);
    };

    const handleAddSubmit = () => {
        const newId = properties.length > 0
            ? Math.max(...properties.map(p => p.id)) + 1
            : 1;

        const newProperty = {
            id: newId,
            ...formData,
        };

        setProperties((prev) => [...prev, newProperty]);
        setIsAddDialogOpen(false);
    };

    // Edit property
    const handleEdit = (property: Property) => {
        setCurrentProperty(property);
        setFormData({
            name: property.name,
            value: property.value,
            currency: property.currency,
            date: property.date,
        });
        setIsEditDialogOpen(true);
    };

    const handleEditSubmit = () => {
        if (!currentProperty) return;

        setProperties((prev) =>
            prev.map((property) =>
                property.id === currentProperty.id
                    ? { ...property, ...formData }
                    : property
            )
        );
        setIsEditDialogOpen(false);
    };

    // Delete property
    const handleDelete = (property: Property) => {
        setCurrentProperty(property);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = () => {
        if (!currentProperty) return;

        setProperties((prev) => prev.filter((p) => p.id !== currentProperty.id));
        setIsDeleteDialogOpen(false);
    };

    return (
        <Card className="col-span-full p-6">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Real Estate Assets</h2>
                <Button onClick={handleAdd} size="sm" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>Add</span>
                </Button>
            </div>

            {/* Total Value */}
            <div className="mb-6">
                <p className="text-sm text-gray-400">Total Real Estate Value</p>
                <p className="text-3xl font-bold">
                    {totalValue.toLocaleString()} RON
                </p>
            </div>

            {/* Properties List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">All Properties</h3>
                <div className="space-y-3">
                    {/* Headers */}
                    <div className="grid grid-cols-5 font-medium text-gray-500">
                        <span>Property</span>
                        <span>Value</span>
                        <span>Currency</span>
                        <span>Last Appraised</span>
                        <span>Actions</span>
                    </div>

                    {/* Entries */}
                    {properties.length === 0 ? (
                        <div className="py-4 text-center text-gray-400">
                            No properties. Click "Add" to create one.
                        </div>
                    ) : (
                        properties.map((property) => (
                            <div key={property.id} className="grid grid-cols-5 border-b border-gray-100 py-2">
                                <span>{property.name}</span>
                                <span className="font-medium">
                                    {property.value.toLocaleString()}
                                </span>
                                <span>{property.currency}</span>
                                <span>{new Date(property.date).toLocaleDateString()}</span>
                                <span className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleEdit(property)}
                                        className="h-8 w-8"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(property)}
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

            {/* Add Property Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Real Estate Property</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right">
                                Property Name
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
                                Appraisal Date
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
                        <Button onClick={handleAddSubmit}>Add Property</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Property Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Real Estate Property</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right">
                                Property Name
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
                                Appraisal Date
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
                            Are you sure you want to delete the "{currentProperty?.name}" property?
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