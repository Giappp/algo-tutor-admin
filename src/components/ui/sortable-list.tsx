"use client";

import {ArrowDown, ArrowUp, GripVertical} from "lucide-react";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

interface SortableListItemProps {
    index: number;
    total: number;
    onMoveUp: () => void;
    onMoveDown: () => void;
    children: React.ReactNode;
    className?: string;
    /** Show grip icon (visual indicator for sortability) */
    showGrip?: boolean;
}

/**
 * Wrapper for list items that adds move up/down controls.
 * Use this to make any list reorderable without drag-and-drop.
 */
export function SortableListItem({
    index,
    total,
    onMoveUp,
    onMoveDown,
    children,
    className,
    showGrip = true,
}: SortableListItemProps) {
    const isFirst = index === 0;
    const isLast = index === total - 1;

    return (
        <div className={cn("group flex items-start gap-2", className)}>
            {/* Reorder controls */}
            <div className="shrink-0 flex flex-col items-center gap-0.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {showGrip && (
                    <GripVertical className="size-3.5 text-muted-foreground/40 mb-0.5"/>
                )}
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={onMoveUp}
                    disabled={isFirst}
                    className="size-5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move up"
                >
                    <ArrowUp className="size-3"/>
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={onMoveDown}
                    disabled={isLast}
                    className="size-5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    title="Move down"
                >
                    <ArrowDown className="size-3"/>
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                {children}
            </div>
        </div>
    );
}

/**
 * Utility to swap two items in an array (immutable).
 */
export function swapItems<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
    if (fromIndex < 0 || toIndex < 0 || fromIndex >= arr.length || toIndex >= arr.length) {
        return arr;
    }
    const result = [...arr];
    const temp = result[fromIndex];
    result[fromIndex] = result[toIndex];
    result[toIndex] = temp;
    return result;
}
