"use client";

import { signOut } from "next-auth/react";
import type { Session } from "next-auth";

interface DashboardProps {
    session: Session;
}

export function Dashboard({ session }: DashboardProps) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
                    <span className="text-[hsl(280,100%,70%)]">Financial Planning</span> Dashboard
                </h1>

                <div className="flex flex-col items-center gap-6">
                    <div className="rounded-xl bg-white/10 p-8 text-center backdrop-blur-sm">
                        <h2 className="text-3xl font-bold mb-4">
                            Hello, {session.user?.name}! 👋
                        </h2>
                        <p className="text-lg text-white/80">
                            Welcome to your dashboard. More features coming soon!
                        </p>
                        {session.user?.email && (
                            <p className="mt-2 text-white/60">
                                Logged in as: {session.user.email}
                            </p>
                        )}
                    </div>

                    <button
                        onClick={() => signOut()}
                        className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
                    >
                        Sign Out
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
                    <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4">
                        <h3 className="text-2xl font-bold">🚀 Coming Soon</h3>
                        <div className="text-lg">
                            Financial planning features will be added here. Stay tuned for budgeting, expense tracking, and more!
                        </div>
                    </div>
                    <div className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4">
                        <h3 className="text-2xl font-bold">📊 Dashboard</h3>
                        <div className="text-lg">
                            Your personalized financial dashboard will show key metrics and insights about your finances.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 