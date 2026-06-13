import React from "react";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    trend?: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor?: string; // e.g., 'primary', 'chart-1', etc.
}

export function StatCard({
    title,
    value,
    description,
    trend,
    icon: Icon,
    accentColor = "primary"
}: StatCardProps) {
    // Generate color mapping for tailored themes
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
        primary: {
            bg: "bg-primary/[0.03] dark:bg-primary/[0.06]",
            text: "text-primary",
            border: "border-primary/20"
        },
        "chart-1": {
            bg: "bg-chart-1/[0.03] dark:bg-chart-1/[0.06]",
            text: "text-chart-1",
            border: "border-chart-1/20"
        },
        "chart-2": {
            bg: "bg-chart-2/[0.03] dark:bg-chart-2/[0.06]",
            text: "text-chart-2",
            border: "border-chart-2/20"
        },
        "chart-3": {
            bg: "bg-chart-3/[0.03] dark:bg-chart-3/[0.06]",
            text: "text-chart-3",
            border: "border-chart-3/20"
        },
        "chart-4": {
            bg: "bg-chart-4/[0.03] dark:bg-chart-4/[0.06]",
            text: "text-chart-4",
            border: "border-chart-4/20"
        },
        "chart-5": {
            bg: "bg-chart-5/[0.03] dark:bg-chart-5/[0.06]",
            text: "text-chart-5",
            border: "border-chart-5/20"
        },
        emerald: {
            bg: "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]",
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-500/20"
        }
    };

    const themes = colorMap[accentColor] || colorMap.primary;

    return (
        <article className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 transition-colors duration-200 hover:border-border">
            <div className="relative flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">{title}</span>
                    <span className="mt-0.5 select-all text-3xl font-bold tracking-tight text-foreground tabular-nums">
                        {value}
                    </span>
                    
                    {(description || trend) && (
                        <span className="text-[11px] text-muted-foreground/80 mt-1 flex items-center gap-1.5 flex-wrap">
                            {trend && (
                                <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 dark:bg-emerald-500/20 px-1.5 py-0.5 rounded text-[10px]">
                                    {trend}
                                </span>
                            )}
                            {description && <span className="font-sans leading-relaxed">{description}</span>}
                        </span>
                    )}
                </div>
                
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-lg border ${themes.bg} ${themes.border} ${themes.text}`}>
                    <Icon className="size-5" aria-hidden="true" />
                </div>
            </div>
        </article>
    );
}
