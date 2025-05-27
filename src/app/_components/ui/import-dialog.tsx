"use client";

import { AlertCircle, AlertTriangle, Info, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface ImportDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

export function ImportDialog({
	isOpen,
	onClose,
	onSuccess,
}: ImportDialogProps) {
	const [file, setFile] = useState<File | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [importedData, setImportedData] = useState<any>(null);
	const [importStats, setImportStats] = useState<Record<string, number>>({});
	const [showConfirmation, setShowConfirmation] = useState(false);

	// Reset all state when dialog is opened/closed
	useEffect(() => {
		if (!isOpen) {
			// Reset all state variables when dialog is closed
			resetState();
		}
	}, [isOpen]);

	// Function to reset all state
	const resetState = () => {
		setFile(null);
		setError(null);
		setIsLoading(false);
		setImportedData(null);
		setImportStats({});
		setShowConfirmation(false);
	};

	const importMutation = api.export.importUserData.useMutation({
		onSuccess: () => {
			setIsLoading(false);
			onSuccess();
			onClose();
		},
		onError: (error) => {
			setError(`Import failed: ${error.message}`);
			setIsLoading(false);
		},
	});

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			setError(null);
			setShowConfirmation(false);

			// Read file contents
			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const data = JSON.parse(event.target?.result as string);
					setImportedData(data);

					// Calculate stats for preview
					const stats: Record<string, number> = {};
					for (const key in data) {
						if (Array.isArray(data[key])) {
							stats[key] = data[key].length;
						}
					}
					setImportStats(stats);
				} catch (err) {
					setError("Invalid JSON file format");
					setFile(null);
				}
			};
			reader.readAsText(selectedFile);
		}
	};

	const handleConfirmImport = () => {
		setShowConfirmation(true);
	};

	const handleImport = async () => {
		if (!importedData) {
			setError("No valid data to import");
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			// Extract only the data fields (not metadata like exportDate)
			// Note: 'id' and 'userId' fields are automatically filtered out
			const dataToImport = {
				cash: importedData.cash || [],
				investments: importedData.investments || [],
				realEstate: importedData.realEstate || [],
				debt: importedData.debt || [],
				deposits: importedData.deposits || [],
				income: importedData.income || [],
				budget: importedData.budget || [],
			};

			await importMutation.mutateAsync(dataToImport);
		} catch (err) {
			setError("Failed to import data. Please check the file format.");
			setIsLoading(false);
		}
	};

	const handleCloseDialog = () => {
		setShowConfirmation(false);
		onClose();
	};

	// Calculate total entries to import
	const totalEntries = Object.values(importStats).reduce(
		(sum, count) => sum + count,
		0,
	);

	return (
		<Dialog open={isOpen} onOpenChange={handleCloseDialog}>
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{showConfirmation ? "Confirm Import" : "Import Financial Data"}
					</DialogTitle>
				</DialogHeader>

				{showConfirmation ? (
					<div className="flex flex-col gap-4 py-3">
						<div className="rounded-md bg-red-500/20 p-3 text-sm text-white">
							<div className="flex items-center gap-2 font-bold">
								<AlertTriangle className="h-4 w-4" />
								Warning: This will replace all your existing data
							</div>
							<p className="mt-1">
								You are about to import {totalEntries} entries across{" "}
								{Object.keys(importStats).length} categories.
							</p>
						</div>

						<div className="flex justify-end gap-3">
							<button
								onClick={() => setShowConfirmation(false)}
								className="rounded-md bg-secondary-slate px-4 py-2 font-medium text-sm text-white transition hover:bg-secondary-slate/80"
							>
								Cancel
							</button>
							<button
								onClick={handleImport}
								disabled={isLoading}
								className="flex items-center gap-2 rounded-md bg-red-500 px-4 py-2 font-medium text-sm text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isLoading ? "Importing..." : "Yes, Replace All Data"}
							</button>
						</div>
					</div>
				) : (
					<div className="space-y-4 py-3">
						{error && (
							<div className="flex items-center gap-2 rounded-md bg-red-500/20 p-3 text-sm text-white">
								<AlertCircle className="h-4 w-4" />
								{error}
							</div>
						)}

						<div className="flex items-center gap-2 rounded-md bg-amber-500/20 p-3 text-sm text-white">
							<AlertTriangle className="h-4 w-4 text-amber-500" />
							<span>
								<strong>Warning:</strong> Importing data will overwrite all your
								existing data. This action cannot be undone.
							</span>
						</div>

						<div className="flex flex-col gap-3">
							<label className="flex flex-col gap-1">
								<span className="font-medium text-sm">
									Select JSON file to import
								</span>
								<input
									type="file"
									accept=".json"
									onChange={handleFileChange}
									className="rounded-md bg-secondary-slate p-2 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-primary-teal file:px-4 file:py-2 file:font-semibold file:text-sm file:text-white hover:file:bg-accent-aqua hover:file:text-bg-charcoal"
								/>
							</label>

							{importStats && Object.keys(importStats).length > 0 && (
								<div className="rounded-md bg-secondary-slate p-3">
									<div className="flex items-center justify-between">
										<span className="font-medium text-sm">Data to import:</span>
										<span className="text-sm">
											{totalEntries} total entries
										</span>
									</div>
									<div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
										{Object.entries(importStats).map(([category, count]) => (
											<div key={category} className="flex justify-between">
												<span className="capitalize">{category}:</span>
												<span>{count}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</div>

						<div className="flex justify-end gap-3">
							<button
								onClick={handleCloseDialog}
								className="rounded-md bg-secondary-slate px-4 py-2 font-medium text-sm text-white transition hover:bg-secondary-slate/80"
							>
								Cancel
							</button>
							<button
								onClick={handleConfirmImport}
								disabled={!file || isLoading}
								className="flex items-center gap-2 rounded-md bg-primary-teal px-4 py-2 font-medium text-sm text-white transition hover:bg-accent-aqua hover:text-bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
							>
								<Upload className="h-4 w-4" />
								Continue to Import
							</button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
