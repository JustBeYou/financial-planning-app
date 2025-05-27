interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
	return <div className={`rounded-xl bg-bg-jet p-6 ${className}`} {...props} />;
}
