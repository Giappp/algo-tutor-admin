"use client";

import { cn } from "@/lib/utils";

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    badge?: number;
    children: React.ReactNode;
    className?: string;
}

export function TabButton({
    active,
    onClick,
    badge,
    children,
    className,
}: TabButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex cursor-pointer select-none items-center gap-1.5 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium transition-all active:scale-[0.99]",
                active
                    ? "border-border/60 bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                className
            )}
        >
            {children}
            {badge !== undefined && badge > 0 && (
                <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-md border border-border/40 bg-muted text-xs font-semibold tabular-nums text-foreground">
                    {badge}
                </span>
            )}
        </button>
    );
}
