"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const result = await signIn("credentials", {
				username,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid credentials. Please try again.");
			}
			// No need to manually refresh - useSession in parent will automatically update
		} catch (error) {
			setError("An error occurred. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
			<div className="w-full max-w-md rounded-xl bg-white/10 p-8 backdrop-blur-sm">
				<h1 className="mb-6 text-center font-bold text-3xl">
					Welcome to{" "}
					<span className="text-[hsl(280,100%,70%)]">Financial Planning</span>{" "}
					App
				</h1>

				<form onSubmit={handleSubmit} className="space-y-4">
					{error && (
						<div className="rounded-lg bg-red-500/20 p-3 text-red-200">
							{error}
						</div>
					)}

					<div>
						<label
							htmlFor="username"
							className="mb-2 block font-medium text-sm"
						>
							Username
						</label>
						<input
							id="username"
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
							placeholder="Enter your username"
							required
						/>
					</div>

					<div>
						<label
							htmlFor="password"
							className="mb-2 block font-medium text-sm"
						>
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="w-full rounded-lg bg-white/10 px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[hsl(280,100%,70%)]"
							placeholder="Enter your password"
							required
						/>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full rounded-lg bg-[hsl(280,100%,70%)] px-4 py-3 font-semibold text-white transition hover:bg-[hsl(280,100%,60%)] disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isLoading ? "Signing in..." : "Sign In"}
					</button>
				</form>

				<div className="mt-6 text-center text-sm text-white/60">
					<p>Demo credentials:</p>
					<p>
						<strong>admin</strong> / admin123
					</p>
					<p>
						<strong>test</strong> / test123
					</p>
					<p>
						<strong>demo</strong> / demo123
					</p>
				</div>
			</div>
		</div>
	);
}
