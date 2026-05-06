import React from "react";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";

interface SectionCardProps {
    number: string;
    title: string;
    color: "indigo" | "amber" | "rose" | "cyan" | "violet" | "emerald";
    badge?: number;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
    indigo: {bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/20"},
    amber: {bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20"},
    rose: {bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20"},
    cyan: {bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/20"},
    violet: {bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/20"},
    emerald: {bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20"},
};

const SectionCard = React.memo(function SectionCard({
                                                        number,
                                                        title,
                                                        color,
                                                        badge,
                                                        isOpen,
                                                        onToggle,
                                                        children
                                                    }: SectionCardProps) {
    const cfg = COLOR_MAP[color];
    return (
        <div className={cn("border rounded-2xl overflow-hidden transition-all duration-200",
            isOpen ? "bg-muted/20 border-muted-foreground/10 shadow-sm" : "bg-card hover:bg-muted/30 hover:border-muted-foreground/15")}>
            <button type="button" onClick={onToggle}
                    className="w-full flex items-center gap-3.5 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
                <div
                    className={cn("shrink-0 flex items-center justify-center size-8 rounded-lg font-black text-sm tracking-tight", cfg.bg, cfg.text)}>
                    {number}
                </div>
                <span className="flex-1 font-semibold text-sm">{title}</span>
                {badge !== undefined && <Badge variant="secondary" className="shrink-0 tabular-nums">{badge}</Badge>}
                <span className={cn("shrink-0 transition-transform duration-200", isOpen && "rotate-180")}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </span>
            </button>
            {isOpen && (
                <div className="px-5 pb-6">
                    <div
                        className={cn("h-px bg-gradient-to-r from-transparent", cfg.bg.replace("/10", "/20"), "to-transparent mb-6 -mt-1")}/>
                    {children}
                </div>
            )}
        </div>
    );
});
export default SectionCard;