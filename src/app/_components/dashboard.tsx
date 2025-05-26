"use client";

import type { Session } from "next-auth";
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
