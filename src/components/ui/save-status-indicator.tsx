"use client";

import {Check, AlertCircle, Loader2, Circle} from "lucide-react";
import {cn} from "@/lib/utils";
import {AutosaveStatus} from "@/hooks/use-autosave";

interface SaveStatusIndicatorProps {
    status: AutosaveStatus;
    isDirty: boolean;
    lastSavedAt: Date | null;
    className?: string;
}

export function SaveStatusIndicator({
    status,
    isDirty,
    lastSavedAt,
    className,
}: SaveStatusIndicatorProps) {
    const getStatusDisplay = () => {
        switch (status) {
            case "saving":
                return {
                    icon: <Loader2 className="size-3.5 animate-spin" />,
                    text: "Saving...",
                    className: "text-muted-foreground",
                };
            case "saved":
                return {
                    icon: <Check className="size-3.5" />,
                    text: "Saved",
                    className: "text-emerald-600 dark:text-emerald-400",
                };
            case "error":
                return {
                    icon: <AlertCircle className="size-3.5" />,
                    text: "Save failed",
                    className: "text-destructive",
                };
            default:
                if (isDirty) {
                    return {
                        icon: <Circle className="size-2.5 fill-amber-500 text-amber-500" />,
                        text: "Unsaved changes",
                        className: "text-amber-600 dark:text-amber-400",
                    };
                }
                return null;
        }
    };

    const display = getStatusDisplay();

    if (!display && !lastSavedAt) return null;

    return (
        <div className={cn("flex items-center gap-1.5 text-xs", className)}>
            {display && (
                <span className={cn("flex items-center gap-1", display.className)}>
                    {display.icon}
                    <span className="font-medium">{display.text}</span>
                </span>
            )}
            {!display && lastSavedAt && (
                <span className="text-muted-foreground">
                    Last saved {formatRelativeTime(lastSavedAt)}
                </span>
            )}
        </div>
    );
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);

    if (diffSec < 10) return "just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffMin < 60) return `${diffMin}m ago`;
    return date.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
}
