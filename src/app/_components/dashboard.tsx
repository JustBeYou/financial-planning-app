"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";
import { NetWorthWidget } from "~/features/net-worth/components/NetWorthWidget";

interface DashboardProps {
    session: Session;
}

export function Dashboard({ session }: DashboardProps) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold">
                        <span className="text-[hsl(280,100%,70%)]">Financial Planning</span> Dashboard
                    </h1>
                    <button
                        onClick={() => signOut()}
                        className="rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20"
                    >
                        Sign Out
                    </button>
                </div>

                {/* Widgets Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    <NetWorthWidget />
                </div>
            </div>
        </div>
    );
} 