import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "./ui/dialog"
import { Button } from "./ui/button"

interface AlertDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description: string;
    cancelText?: string;
    confirmText?: string;
    onConfirm?: () => void;
    variant?: 'default' | 'destructive';
}

export function AlertDialog({
    open,
    onClose,
    title,
    description,
    cancelText = "Cancel",
    confirmText = "OK",
    onConfirm,
    variant = 'default'
}: AlertDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    onConfirm?.();
                    onClose();
                }}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button type="button" variant="outline" onClick={onClose}>
                            {cancelText}
                        </Button>
                        <Button 
                            type="submit"
                            variant={variant === 'destructive' ? 'destructive' : 'default'}
                        >
                            {confirmText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
