import "~/styles/globals.css";

import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	title: "Financial Planning App",
	description: "An app for helping me planning my finances",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body className="bg-bg-charcoal text-text-white">
				<SessionProvider>
					<TRPCReactProvider>{children}</TRPCReactProvider>
				</SessionProvider>
			</body>
		</html>
	);
}
