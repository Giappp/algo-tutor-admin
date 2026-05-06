import {Trash2, AlertTriangle} from "lucide-react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
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
        <div className="flex flex-col gap-6 p-6">
            {/* Danger Zone */}
            <Card className="border-destructive/20 bg-gradient-to-r from-destructive/5 to-transparent overflow-hidden relative">
                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-destructive/60 to-transparent" />

                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base font-heading">
                        <AlertTriangle className="size-4 text-destructive" />
                        <span className="text-gradient-destructive">Danger Zone</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-foreground text-sm font-semibold">Delete Learning Path</p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-md">
                            Permanently delete &ldquo;{learningPathName}&rdquo;. This action cannot be undone and will remove all associated topics and lessons.
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isDeletePending}
                        className="gap-1.5 shrink-0 shadow-md"
                    >
                        <Trash2 className="size-4" />
                        {isDeletePending ? "Deleting..." : "Delete"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
