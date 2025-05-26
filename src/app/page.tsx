"use client";

import { useSession } from "next-auth/react";
import { Dashboard } from "./_components/dashboard";
import { LoginForm } from "./_components/login-form";

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
	return <Dashboard session={session} />;
}
