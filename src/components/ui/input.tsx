import * as React from "react";
import { cn } from "~/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, ...props }, ref) => {
		// Handle number inputs to avoid 0 prefix issues
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			if (type === "number") {
				// Remove leading zeros for number inputs
				if (e.target.value.startsWith("0") && e.target.value.length > 1 && !e.target.value.startsWith("0.")) {
					e.target.value = e.target.value.replace(/^0+/, "");
				}
			}
			// Call the original onChange if it exists
			if (props.onChange) {
				props.onChange(e);
			}
		};

		return (
			<input
				type={type}
				className={cn(
					"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				onChange={handleChange}
				ref={ref}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

export { Input };
