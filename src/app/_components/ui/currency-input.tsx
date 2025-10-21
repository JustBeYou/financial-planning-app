import * as React from "react";
import { cn } from "~/lib/utils";

export interface CurrencyInputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"onChange" | "value"
	> {
	value: number;
	onChange: (value: number) => void;
	currency?: string;
	showCurrency?: boolean;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
	(
		{
			className,
			value,
			onChange,
			currency = "RON",
			showCurrency = false,
			...props
		},
		ref,
	) => {
		const [displayValue, setDisplayValue] = React.useState<string>("");
		const [isFocused, setIsFocused] = React.useState(false);

	       // Format number with separators for display
	       const formatNumber = React.useCallback((num: number): string => {
		       return num.toLocaleString("ro-RO");
	       }, []);

		// Parse formatted string back to number
		const parseNumber = (str: string): number => {
			if (!str || str.trim() === "") return 0;
			// Remove all non-digit characters except decimal separator
			const cleaned = str.replace(/[^\d.,]/g, "");
			// Handle Romanian locale (comma as decimal separator)
			const normalized = cleaned.replace(",", ".");
			const parsed = Number.parseFloat(normalized);
			return Number.isNaN(parsed) ? 0 : parsed;
		};

	       // Update display value when prop value changes
	       React.useEffect(() => {
		       if (!isFocused) {
			       setDisplayValue(formatNumber(value));
		       } else {
			       setDisplayValue(value === 0 ? "" : value.toString());
		       }
	       }, [value, isFocused, formatNumber]);

		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const inputValue = e.target.value;
			setDisplayValue(inputValue);

			const numericValue = parseNumber(inputValue);
			onChange(numericValue);
		};

		const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(true);
			// Show raw number when focused for easier editing
			if (value === 0) {
				setDisplayValue("");
			} else {
				setDisplayValue(value.toString());
			}
			props.onFocus?.(e);
		};

		const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
			setIsFocused(false);
			// Format the number when focus is lost
			setDisplayValue(formatNumber(value));
			props.onBlur?.(e);
		};

		return (
			<div className="relative">
				<input
					type="text"
					className={cn(
						"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
						showCurrency && "pr-12",
						className,
					)}
					value={displayValue}
					onChange={handleChange}
					onFocus={handleFocus}
					onBlur={handleBlur}
					ref={ref}
					{...props}
				/>
				{showCurrency && (
					<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
						<span className="text-muted-foreground text-sm">{currency}</span>
					</div>
				)}
			</div>
		);
	},
);
CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
