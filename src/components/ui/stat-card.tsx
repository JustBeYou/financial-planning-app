import type { ReactNode } from "react";

interface StatCardProps {
    label: string;
    value: string | number;
    suffix?: string;
    prefix?: string;
    className?: string;
    children?: ReactNode;
}

export function StatCard({
    label,
    value,
    suffix,
    prefix,
    className = "",
    children,
}: StatCardProps) {
    return (
        <div className={className}>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-3xl font-bold">
                {prefix}
                {typeof value === "number" ? value.toLocaleString() : value}
                {suffix}
            </p>
            {children}
        </div>
    );
} 