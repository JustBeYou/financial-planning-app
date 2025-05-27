import { AlertCircle } from "lucide-react";
import { Button } from "~/app/_components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/app/_components/ui/dialog";
import type { ErrorDialogState } from "../../scenario-simulator/types";

interface ErrorDialogProps {
	errorDialog: ErrorDialogState;
	closeErrorDialog: () => void;
}

export function ErrorDialog({
	errorDialog,
	closeErrorDialog,
}: ErrorDialogProps) {
	return (
		<Dialog open={errorDialog.isOpen} onOpenChange={closeErrorDialog}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-accent-coral" />
						{errorDialog.title}
					</DialogTitle>
					<DialogDescription>{errorDialog.description}</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button onClick={closeErrorDialog}>OK</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
