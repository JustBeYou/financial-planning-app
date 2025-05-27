"use client";

import { useSession } from "next-auth/react";
import { AppLayout } from "../_components/AppLayout";
import { LoginForm } from "../_components/ui/login-form";
import { Dashboard } from "./components/dashboard";

export default function Home() {
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

	// Show dashboard if authenticated
	return (
		<AppLayout session={session}>
			<Dashboard session={session} />
		</AppLayout>
	);
}
