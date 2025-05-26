"use client";

import { useSession } from "next-auth/react";
import { AppLayout } from "../_components/AppLayout";
import { LoginForm } from "../_components/login-form";

export default function ScenarioSimulator() {
	const { data: session, status } = useSession();

	// Show loading state while checking session
	if (status === "loading") {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
				<div className="text-2xl">Loading...</div>
			</div>
		);
	}

	// Show login form if not authenticated
	if (!session?.user) {
		return <LoginForm />;
	}

	// Show scenario simulator content (empty for now)
	return (
		<AppLayout session={session}>
			<div className="flex flex-col items-center justify-center rounded-lg bg-secondary-slate/30 p-12 text-center">
				<h2 className="mb-4 font-bold text-2xl text-primary-teal">
					Scenario Simulator
				</h2>
				<p className="text-lg">This feature is coming soon. Stay tuned!</p>
			</div>
		</AppLayout>
	);
}
