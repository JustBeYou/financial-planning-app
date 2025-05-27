import * as React from "react";
import { cn } from "~/lib/utils";

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options?: Array<{ value: string; label: string }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, options = [], children, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "flex h-9 w-full rounded-md border border-input bg-bg-jet px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    className,
                )}
                ref={ref}
                {...props}
            >
                {options.length > 0
                    ? options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            className="bg-bg-jet text-text-white"
                        >
                            {option.label}
                        </option>
                    ))
                    : children}
            </select>
        );
    },
);
Select.displayName = "Select";

export { Select }; 