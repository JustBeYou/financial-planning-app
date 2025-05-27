"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TabMenu() {
	const pathname = usePathname();

	const tabs = [
		{ name: "Overview", path: "/overview-dashboard" },
		{ name: "Budget Planner", path: "/budget-planner" },
		{ name: "Scenario simulator", path: "/scenario-simulator" },
	];

	return (
		<div className="mb-8 flex gap-4 border-secondary-slate border-b">
			{tabs.map((tab) => {
				const isActive =
					(tab.path === "/" && pathname === "/") ||
					(tab.path !== "/" && pathname.startsWith(tab.path));

				return (
					<Link
						key={tab.path}
						href={tab.path}
						className={`px-4 py-2 font-medium transition-colors ${
							isActive
								? "border-primary-teal border-b-2 text-primary-teal"
								: "text-text-white hover:text-primary-teal"
						}`}
					>
						{tab.name}
					</Link>
				);
			})}
		</div>
	);
}
