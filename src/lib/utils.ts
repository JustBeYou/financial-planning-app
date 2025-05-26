import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names, merges Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Generates a new ID based on existing items
 */
export function generateNewId<T extends { id: number }>(items: T[]): number {
	return items.length > 0 ? Math.max(...items.map((item) => item.id)) + 1 : 1;
}

/**
 * Calculate a date in the future based on months from a start date
 */
export function calculateDateFromMonths(
	startDate: string,
	lengthMonths: number,
): string {
	const date = new Date(startDate);
	date.setMonth(date.getMonth() + lengthMonths);
	return date.toISOString().split("T")[0];
}

/**
 * Format a number as currency
 */
export function formatCurrency(
	amount: number,
	currency = "RON",
	locale = "ro-RO",
): string {
	return `${amount.toLocaleString(locale)} ${currency}`;
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number, decimalPlaces = 2): string {
	return `${value.toFixed(decimalPlaces)}%`;
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getTodayISODate(): string {
	return new Date().toISOString().split("T")[0];
}

/**
 * Format a date for display
 */
export function formatDate(date: string, locale = "ro-RO"): string {
	return new Date(date).toLocaleDateString(locale);
}
