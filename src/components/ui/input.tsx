import * as React from "react";
import { cn } from "~/lib/utils";

export interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, onChange, value: propValue, ...props }, ref) => {
		// Create internal state for number inputs to avoid the leading zero issue
		const defaultValue = propValue !== undefined ? String(propValue) : "";
		const [value, setValue] = React.useState<string>(defaultValue);
		const inputRef = React.useRef<HTMLInputElement | null>(null);
		const combinedRef = useCombinedRefs(ref, inputRef);

		// Handle different input types specially
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			// For number inputs, handle clearing the input
			if (type === "number") {
				// Allow clearing the input completely
				if (e.target.value === "") {
					setValue("");
					if (onChange) {
						// Update the event target value to empty string
						e.target.value = "";
						onChange(e);
					}
					return;
				}

				// For non-empty values, store without leading zeros
				const numValue = parseFloat(e.target.value);
				if (!isNaN(numValue)) {
					// Only update if it's a valid number
					setValue(numValue.toString());
					if (onChange) {
						// Set the numerical value
						e.target.value = numValue.toString();
						onChange(e);
					}
				}
			} else {
				// For other input types, just pass through
				setValue(e.target.value);
				if (onChange) {
					onChange(e);
				}
			}
		};

		// When input is focused, clear if it's just "0"
		const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
			if (type === "number" && e.target.value === "0") {
				setValue("");
				e.target.value = "";
			}

			if (props.onFocus) {
				props.onFocus(e);
			}
		};

		// Update internal state if prop value changes
		React.useEffect(() => {
			if (propValue !== undefined) {
				setValue(String(propValue));
			}
		}, [propValue]);

		return (
			<input
				type={type}
				className={cn(
					"flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
					className,
				)}
				value={value}
				onChange={handleChange}
				onFocus={handleFocus}
				ref={combinedRef}
				{...props}
			/>
		);
	},
);
Input.displayName = "Input";

// Helper to combine refs
function useCombinedRefs<T>(
	...refs: Array<React.Ref<T> | React.MutableRefObject<T> | null | undefined>
): React.RefCallback<T> {
	return React.useCallback((element: T) => {
		refs.forEach((ref) => {
			if (!ref) return;

			// Handle callback refs
			if (typeof ref === "function") {
				ref(element);
			}
			// Handle mutable refs
			else if (ref) {
				(ref as React.MutableRefObject<T | null>).current = element;
			}
		});
	}, [refs]);
}

export { Input };
