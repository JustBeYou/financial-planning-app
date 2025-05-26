"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { TabMenu } from "./TabMenu";

interface AppLayoutProps {
	session: Session;
	children: React.ReactNode;
}

export function AppLayout({ session, children }: AppLayoutProps) {
	return (
		<div className="min-h-screen bg-gradient-to-b from-primary-navy to-bg-charcoal text-text-white">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<h1 className="font-bold text-3xl">
						<span className="text-primary-teal">Financial Planning</span>{" "}
						Dashboard
					</h1>
					<button
						type="button"
						onClick={() => signOut()}
						className="rounded-full bg-secondary-slate px-6 py-2 font-semibold transition hover:bg-primary-teal"
					>
						Sign Out
					</button>
				</div>

				{/* Tab Menu */}
				<TabMenu />

				{/* Page Content */}
				{children}
			</div>
		</div>
	);
}
