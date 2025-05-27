"use client";

import type { Session } from "next-auth";
import { CashEntriesWidget } from "~/app/overview-dashboard/components/CashEntriesWidget";
import { DebtWidget } from "~/app/overview-dashboard/components/DebtWidget";
import { DepositsWidget } from "~/app/overview-dashboard/components/DepositsWidget";
import { InvestmentsWidget } from "~/app/overview-dashboard/components/InvestmentsWidget";
import { NetWorthWidget } from "~/app/overview-dashboard/components/NetWorthWidget";
import { RealEstateWidget } from "~/app/overview-dashboard/components/RealEstateWidget";

interface DashboardProps {
	session: Session;
}

export function Dashboard({ session }: DashboardProps) {
	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
			<NetWorthWidget />
			<CashEntriesWidget />
			<DepositsWidget />
			<InvestmentsWidget />
			<RealEstateWidget />
			<DebtWidget />
		</div>
	);
}
