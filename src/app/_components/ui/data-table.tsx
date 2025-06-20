import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Button } from "~/app/_components/ui/button";

export interface Column<T> {
	header: string;
	accessorKey: keyof T | ((row: T) => ReactNode);
	className?: string;
	sortable?: boolean;
	sortValue?: (row: T) => number | string;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	keyField: keyof T;
	onEdit?: (item: T) => void;
	onDelete?: (item: T) => void;
	emptyMessage?: string;
	defaultSortColumn?: string;
	defaultSortDirection?: "asc" | "desc";
	expandable?: boolean;
	expandedRows?: Set<number | string>;
	onToggleExpand?: (itemKey: number | string) => void;
	renderExpandedContent?: (item: T) => ReactNode;
	customActions?: (item: T) => ReactNode;
}

export function DataTable<T>({
	columns,
	data,
	keyField,
	onEdit,
	onDelete,
	emptyMessage = "No data available",
	defaultSortColumn,
	defaultSortDirection = "desc",
	expandable = false,
	expandedRows,
	onToggleExpand,
	renderExpandedContent,
	customActions,
}: DataTableProps<T>) {
	const [sortColumn, setSortColumn] = useState<string | undefined>(
		defaultSortColumn,
	);
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">(
		defaultSortDirection,
	);

	const showActions = onEdit || onDelete || customActions;
	const columnsCount = showActions ? columns.length + 1 : columns.length;

	const handleSort = (column: Column<T>) => {
		if (!column.sortable) return;

		if (sortColumn === column.header) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(column.header);
			setSortDirection("desc");
		}
	};

	const sortedData = [...data].sort((a, b) => {
		if (!sortColumn) return 0;

		const column = columns.find((col) => col.header === sortColumn);
		if (!column?.sortValue) return 0;

		const aValue = column.sortValue(a);
		const bValue = column.sortValue(b);

		if (typeof aValue === "string" && typeof bValue === "string") {
			return sortDirection === "asc"
				? aValue.localeCompare(bValue)
				: bValue.localeCompare(aValue);
		}

		return sortDirection === "asc"
			? (aValue as number) - (bValue as number)
			: (bValue as number) - (aValue as number);
	});

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

	const isExpanded = (item: T): boolean => {
		if (!expandable || !expandedRows) return false;
		return expandedRows.has(item[keyField] as number | string);
	};

	return (
		<div className="space-y-3">
			{/* Headers */}
			<div
				className={"grid font-medium text-text-gray"}
				style={{
					gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
				}}
			>
				{columns.map((column) => (
					<button
						key={String(column.header)}
						type="button"
						className={`flex items-center gap-1 text-left ${
							column.sortable ? "cursor-pointer select-none" : ""
						} ${column.className ?? ""}`}
						onClick={() => handleSort(column)}
						disabled={!column.sortable}
					>
						{column.header}
						{column.sortable && sortColumn === column.header && (
							<span className="inline-flex">
								{sortDirection === "asc" ? (
									<ChevronUp className="h-4 w-4" />
								) : (
									<ChevronDown className="h-4 w-4" />
								)}
							</span>
						)}
					</button>
				))}
				{showActions && <span className="text-right">Actions</span>}
			</div>

			{/* Entries */}
			{sortedData.length === 0 ? (
				<div className="py-4 text-center text-text-gray">{emptyMessage}</div>
			) : (
				sortedData.map((item) => {
					const itemKey = item[keyField] as number | string;
					const expanded = isExpanded(item);

					return (
						<div key={String(itemKey)}>
							{/* Main row */}
							<div
								className="grid border-secondary-slate/30 border-b py-2"
								style={{
									gridTemplateColumns: `repeat(${columnsCount}, minmax(0, 1fr))`,
								}}
							>
								{columns.map((column) => (
									<span
										key={String(column.header)}
										className={column.className}
									>
										{renderCellValue(item, column)}
									</span>
								))}

								{showActions && (
									<span className="flex justify-end gap-2">
										{customActions?.(item)}
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
												className="h-8 w-8 text-accent-coral hover:text-accent-coral/80"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</span>
								)}
							</div>

							{/* Expanded content */}
							{expandable && expanded && renderExpandedContent && (
								<div className="mb-3">{renderExpandedContent(item)}</div>
							)}
						</div>
					);
				})
			)}
		</div>
	);
}
