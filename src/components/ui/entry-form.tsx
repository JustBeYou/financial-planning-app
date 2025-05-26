import type { ReactNode } from "react";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";

export type FormField = {
	id: string;
	name: string;
	label: string;
	type: "text" | "number" | "date";
	disabled?: boolean;
	placeholder?: string;
};

interface EntryFormProps {
	title: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	formFields: FormField[];
	formData: Record<string, string | number>;
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onSubmit: () => void;
	submitLabel: string;
	children?: ReactNode;
}

export function EntryForm({
	title,
	open,
	onOpenChange,
	formFields,
	formData,
	onInputChange,
	onSubmit,
	submitLabel,
	children,
}: EntryFormProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					{formFields.map((field) => (
						<div key={field.id} className="grid grid-cols-4 items-center gap-4">
							<label htmlFor={field.id} className="text-right">
								{field.label}
							</label>
							<Input
								id={field.id}
								name={field.name}
								type={field.type}
								value={formData[field.name]}
								onChange={onInputChange}
								disabled={field.disabled}
								placeholder={field.placeholder}
								className="col-span-3"
							/>
						</div>
					))}
					{children}
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button onClick={onSubmit}>{submitLabel}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
