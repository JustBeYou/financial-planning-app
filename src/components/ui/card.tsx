interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
	return (
		<div
			className={`rounded-xl bg-white/10 p-6 backdrop-blur-sm ${className}`}
			{...props}
		/>
	);
}
