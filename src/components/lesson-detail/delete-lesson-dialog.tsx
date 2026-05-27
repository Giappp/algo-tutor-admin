"use client";

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface DeleteLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lessonTitle: string;
    onConfirm: () => void;
    isPending?: boolean;
}

export function DeleteLessonDialog({
    open,
    onOpenChange,
    lessonTitle,
    onConfirm,
    isPending = false,
}: DeleteLessonDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Lesson</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &ldquo;{lessonTitle}&rdquo;? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isPending}
                    >
                        {isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
