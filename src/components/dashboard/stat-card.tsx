import React from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: string;
    icon: React.ComponentType<{ className?: string }>;
    accentClass?: string;
    gradientFrom?: string;
}

export function StatCard({
    title,
    value,
    description,
    trend,
    icon: Icon,
    accentClass = "bg-primary/10 text-primary border-primary/20",
    gradientFrom = "from-primary to-primary/30"
}: StatCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border bg-card p-5 card-lift shadow-sm hover:shadow-md transition-all duration-300">
            {/* Ambient glows and noise overlay */}
            <div className="absolute inset-0 noise-overlay opacity-[0.015] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-transparent pointer-events-none" />
            <div className={`absolute left-0 top-3 bottom-3 w-1 rounded-full bg-gradient-to-b ${gradientFrom}`} />
            
            <div className="relative flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
                    <span className="text-3xl font-heading font-bold text-foreground tracking-tight mt-1 tabular-nums">{value}</span>
                    
                    {(description || trend) && (
                        <span className="text-[11px] text-muted-foreground/80 mt-1 flex items-center gap-1 flex-wrap">
                            {trend && (
                                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">
                                    {trend}
                                </span>
                            )}
                            {description && <span>{description}</span>}
                        </span>
                    )}
                </div>
                <div className={`shrink-0 flex items-center justify-center size-12 rounded-xl border transition-all duration-300 shadow-sm ${accentClass}`}>
                    <Icon className="size-5" />
                </div>
            </div>
        </div>
    );
}
