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
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-transparent shadow-[0_1px_3px_rgba(0,0,0,0.01)] active:scale-[0.99] cursor-pointer select-none",
                active
                    ? "bg-background text-foreground shadow-sm border-border/50"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                className
            )}
        >
            {children}
            {badge !== undefined && badge > 0 && (
                <span className="inline-flex items-center justify-center size-5 rounded-md bg-muted text-[10px] font-extrabold border border-border/40 text-foreground shrink-0 shadow-inner">
                    {badge}
                </span>
            )}
        </button>
    );
}
