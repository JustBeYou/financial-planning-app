"use client";

import { Download, Upload } from "lucide-react";
import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { api } from "~/trpc/react";
import { TabMenu } from "./TabMenu";
import { ImportDialog } from "./ui/import-dialog";

interface AppLayoutProps {
	session: Session;
	children: React.ReactNode;
}

export function AppLayout({ session, children }: AppLayoutProps) {
	const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
	const exportUserData = api.export.getUserData.useQuery(undefined, {
		enabled: false,
	});

	// Add utility to refresh app data after import
	const utils = api.useUtils();

	const handleExportData = async () => {
		try {
			// Fetch user data
			await exportUserData.refetch();

			if (exportUserData.data) {
				// Convert data to JSON string
				const jsonData = JSON.stringify(exportUserData.data, null, 2);

				// Create blob and download link
				const blob = new Blob([jsonData], { type: "application/json" });
				const url = URL.createObjectURL(blob);

				// Create temporary download link
				const link = document.createElement("a");
				link.href = url;
				link.download = `financial-data-export-${new Date().toISOString().split("T")[0]}.json`;
				document.body.appendChild(link);
				link.click();

				// Clean up
				document.body.removeChild(link);
				URL.revokeObjectURL(url);
			}
		} catch (error) {
			console.error("Error exporting data:", error);
			alert("Failed to export data. Please try again.");
		}
	};

	const handleImportSuccess = () => {
		// Invalidate all queries to refresh data
		utils.invalidate();
		alert("Data imported successfully!");
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-primary-navy to-bg-charcoal text-text-white">
			<div className="container mx-auto px-4 py-8">
				{/* Header */}
				<div className="mb-8 flex items-center justify-between">
					<h1 className="font-bold text-3xl">
						<span className="text-primary-teal">Financial Planning</span>{" "}
						Dashboard
					</h1>
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={() => setIsImportDialogOpen(true)}
							className="flex items-center gap-2 rounded-full bg-secondary-slate px-6 py-2 font-semibold transition hover:bg-primary-teal"
						>
							<Upload className="h-4 w-4" />
							Import Data
						</button>
						<button
							type="button"
							onClick={handleExportData}
							className="flex items-center gap-2 rounded-full bg-secondary-slate px-6 py-2 font-semibold transition hover:bg-primary-teal"
							disabled={exportUserData.isFetching}
						>
							<Download className="h-4 w-4" />
							{exportUserData.isFetching ? "Exporting..." : "Export Data"}
						</button>
						<button
							type="button"
							onClick={() => signOut()}
							className="rounded-full bg-secondary-slate px-6 py-2 font-semibold transition hover:bg-primary-teal"
						>
							Sign Out
						</button>
					</div>
				</div>

				{/* Import Dialog */}
				<ImportDialog
					isOpen={isImportDialogOpen}
					onClose={() => setIsImportDialogOpen(false)}
					onSuccess={handleImportSuccess}
				/>

				{/* Tab Menu */}
				<TabMenu />

				{/* Page Content */}
				{children}
			</div>
		</div>
	);
}
