"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { CashEntriesWidget } from "~/features/cash/components/CashEntriesWidget";
import { DebtWidget } from "~/features/debt/components/DebtWidget";
import { DepositsWidget } from "~/features/deposits/components/DepositsWidget";
import { InvestmentsWidget } from "~/features/investments/components/InvestmentsWidget";
import { NetWorthWidget } from "~/features/net-worth/components/NetWorthWidget";
import { RealEstateWidget } from "~/features/real-estate/components/RealEstateWidget";

interface DashboardProps {
	session: Session;
}

export function Dashboard({ session }: DashboardProps) {
	return (
		<div className="min-h-screen bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<h1 className="font-bold text-3xl">
						<span className="text-[hsl(280,100%,70%)]">Financial Planning</span>{" "}
						Dashboard
					</h1>
					<button
						type="button"
						onClick={() => signOut()}
						className="rounded-full bg-white/10 px-6 py-2 font-semibold transition hover:bg-white/20"
					>
						Sign Out
					</button>
				</div>

				{/* Widgets Grid */}
				<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
					<NetWorthWidget />
					<CashEntriesWidget />
					<DepositsWidget />
					<InvestmentsWidget />
					<RealEstateWidget />
					<DebtWidget />
				</div>
			</div>
		</div>
	);
}
