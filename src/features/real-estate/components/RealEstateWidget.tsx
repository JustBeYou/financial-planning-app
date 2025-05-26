"use client";

import { Card } from "~/components/ui/card";

// Mock data - this will be replaced with real data later
const mockRealEstate = [
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

export function RealEstateWidget() {
    const totalValue = mockRealEstate.reduce(
        (sum, property) => sum + property.value,
        0
    );

    return (
        <Card className="col-span-full p-6">
            <h2 className="mb-4 text-2xl font-bold">Real Estate Assets</h2>

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
                    <div className="grid grid-cols-4 font-medium text-gray-500">
                        <span>Property</span>
                        <span>Value</span>
                        <span>Currency</span>
                        <span>Last Appraised</span>
                    </div>

                    {/* Entries */}
                    {mockRealEstate.map((property) => (
                        <div key={property.id} className="grid grid-cols-4 border-b border-gray-100 py-2">
                            <span>{property.name}</span>
                            <span className="font-medium">
                                {property.value.toLocaleString()}
                            </span>
                            <span>{property.currency}</span>
                            <span>{new Date(property.date).toLocaleDateString()}</span>
                        </div>
                    ))}
                </div>
            </div>
        </Card>
    );
} 