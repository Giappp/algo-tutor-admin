import React from "react";
import {ChevronDown} from "lucide-react";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";

interface SectionCardProps {
    number: string;
    title: string;
    badge?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

export const SectionCard = React.memo(function SectionCard({
    number,
    title,
    badge,
    isOpen,
    onToggle,
    children,
}: SectionCardProps) {
    return (
        <section className="border-t border-border/60 first:border-t-0">
            <button
                type="button"
                onClick={onToggle}
                className={cn(
                    "flex w-full items-center gap-3 px-1 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    isOpen ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
            >
                <span className="w-5 shrink-0 font-mono text-xs text-muted-foreground">
                    {number}
                </span>
                <span className="flex-1 text-base font-semibold">{title}</span>
                {badge !== undefined && (
                    <Badge variant="secondary" className="h-5 shrink-0 rounded-md px-1.5 text-xs tabular-nums">
                        {badge}
                    </Badge>
                )}
                <span className={cn("shrink-0 transition-transform duration-200", isOpen && "rotate-180")}>
                    <ChevronDown className="w-4 h-4"/>
                </span>
            </button>
            {isOpen && (
                <div className="pb-7 pl-8 pr-1">
                    {children}
                </div>
            )}
        </section>
    );
});

export type {SectionCardProps};
