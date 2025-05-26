import { Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";

export interface Column<T> {
	header: string;
	accessorKey: keyof T | ((row: T) => ReactNode);
	className?: string;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	keyField: keyof T;
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
	emptyMessage?: string;
}

export function DataTable<T>({
	columns,
	data,
	keyField,
	onEdit,
	onDelete,
	emptyMessage = "No data available",
}: DataTableProps<T>) {
	const showActions = onEdit || onDelete;
	const columnsCount = showActions ? columns.length + 1 : columns.length;

	const renderCellValue = (item: T, column: Column<T>): ReactNode => {
		if (typeof column.accessorKey === "function") {
			return column.accessorKey(item);
		}

		const value = item[column.accessorKey];

		// Convert the value to a string for display
		if (value === null || value === undefined) {
			return "";
		}

		if (typeof value === "object") {
			return JSON.stringify(value);
		}

		return String(value);
	};

	return (
		<div className="space-y-3">
			{/* Headers */}
			<div
				className={"grid font-medium text-gray-500"}
				style={{
					gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
				}}
			>
				{columns.map((column) => (
					<span key={String(column.header)} className={column.className}>
						{column.header}
					</span>
				))}
				{showActions && <span>Actions</span>}
			</div>

			{/* Entries */}
			{data.length === 0 ? (
				<div className="py-4 text-center text-gray-400">{emptyMessage}</div>
			) : (
				data.map((item) => (
					<div
						key={String(item[keyField])}
						className="grid border-gray-100 border-b py-2"
						style={{
							gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
						}}
					>
						{columns.map((column) => (
							<span key={String(column.header)} className={column.className}>
								{renderCellValue(item, column)}
							</span>
						))}

						{showActions && (
							<span className="flex gap-2">
								{onEdit && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() => onEdit(item)}
										className="h-8 w-8"
									>
										<Pencil className="h-4 w-4" />
									</Button>
								)}
								{onDelete && (
									<Button
										variant="ghost"
										size="icon"
										onClick={() => onDelete(item)}
										className="h-8 w-8 text-red-500 hover:text-red-700"
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								)}
							</span>
						)}
					</div>
				))
			)}
		</div>
	);
}
