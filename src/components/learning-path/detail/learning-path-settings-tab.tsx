import {AlertTriangle, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";

interface LearningPathSettingsTabProps {
    learningPathName: string;
    onDelete: () => void;
    isDeletePending?: boolean;
}

export function LearningPathSettingsTab({
                                            learningPathName,
                                            onDelete,
                                            isDeletePending = false,
                                        }: LearningPathSettingsTabProps) {
    return (
        <div className="p-5">
            {/* Danger Zone */}
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="size-4 text-red-600 dark:text-red-400"/>
                    <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <p className="text-sm font-medium">Delete this learning path</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Permanently delete &ldquo;{learningPathName}&rdquo; and all its topics and lessons. This cannot be undone.
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDelete}
                        disabled={isDeletePending}
                        className="shrink-0"
                    >
                        <Trash2 data-icon="inline-start" className="size-4"/>
                        {isDeletePending ? "Deleting..." : "Delete"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
