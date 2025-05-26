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
			<p className="text-gray-400 text-sm">{label}</p>
			<p className="font-bold text-3xl">
				{prefix}
				{typeof value === "number" ? value.toLocaleString() : value}
				{suffix}
			</p>
			{children}
		</div>
	);
}
