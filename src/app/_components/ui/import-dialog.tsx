"use client";

import { AlertCircle, Info, Upload } from "lucide-react";
import { useState } from "react";
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

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Import Financial Data</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{error && (
						<div className="flex items-center gap-2 rounded-md bg-red-500/20 p-3 text-sm text-white">
							<AlertCircle className="h-4 w-4" />
							{error}
						</div>
					)}

					<div className="flex items-center gap-2 rounded-md bg-secondary-slate/50 p-3 text-sm text-white">
						<Info className="h-4 w-4 text-accent-aqua" />
						<span>
							ID fields are handled automatically. Imported data will be
							associated with your user account.
						</span>
					</div>

					<div className="flex flex-col gap-4">
						<label className="flex flex-col gap-2">
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
							<div className="rounded-md bg-secondary-slate p-4">
								<h3 className="mb-2 font-medium">Data to import:</h3>
								<ul className="space-y-1 text-sm">
									{Object.entries(importStats).map(([category, count]) => (
										<li key={category} className="flex justify-between">
											<span className="capitalize">{category}:</span>
											<span>{count} entries</span>
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				</div>

				<div className="flex justify-end gap-3">
					<button
						onClick={onClose}
						className="rounded-md bg-secondary-slate px-4 py-2 font-medium text-sm text-white transition hover:bg-secondary-slate/80"
					>
						Cancel
					</button>
					<button
						onClick={handleImport}
						disabled={!file || isLoading}
						className="flex items-center gap-2 rounded-md bg-primary-teal px-4 py-2 font-medium text-sm text-white transition hover:bg-accent-aqua hover:text-bg-charcoal disabled:cursor-not-allowed disabled:opacity-50"
					>
						<Upload className="h-4 w-4" />
						{isLoading ? "Importing..." : "Import Data"}
					</button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
