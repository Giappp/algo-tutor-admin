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
    const colorMap: Record<string, { bg: string; text: string; border: string; glow: string }> = {
        primary: {
            bg: "bg-primary/[0.03] dark:bg-primary/[0.06]",
            text: "text-primary",
            border: "border-primary/20",
            glow: "bg-[radial-gradient(circle_at_bottom_right,oklch(var(--primary)/0.08)_0%,transparent_60%)]"
        },
        "chart-1": {
            bg: "bg-chart-1/[0.03] dark:bg-chart-1/[0.06]",
            text: "text-chart-1",
            border: "border-chart-1/20",
            glow: "bg-[radial-gradient(circle_at_bottom_right,oklch(var(--chart-1)/0.08)_0%,transparent_60%)]"
        },
        "chart-2": {
            bg: "bg-chart-2/[0.03] dark:bg-chart-2/[0.06]",
            text: "text-chart-2",
            border: "border-chart-2/20",
            glow: "bg-[radial-gradient(circle_at_bottom_right,oklch(var(--chart-2)/0.08)_0%,transparent_60%)]"
        },
        "chart-3": {
            bg: "bg-chart-3/[0.03] dark:bg-chart-3/[0.06]",
            text: "text-chart-3",
            border: "border-chart-3/20",
            glow: "bg-[radial-gradient(circle_at_bottom_right,oklch(var(--chart-3)/0.08)_0%,transparent_60%)]"
        },
        "chart-4": {
            bg: "bg-chart-4/[0.03] dark:bg-chart-4/[0.06]",
            text: "text-chart-4",
            border: "border-chart-4/20",
            glow: "bg-[radial-gradient(circle_at_bottom_right,oklch(var(--chart-4)/0.08)_0%,transparent_60%)]"
        },
        "chart-5": {
            bg: "bg-chart-5/[0.03] dark:bg-chart-5/[0.06]",
            text: "text-chart-5",
            border: "border-chart-5/20",
            glow: "bg-[radial-gradient(circle_at_bottom_right,oklch(var(--chart-5)/0.08)_0%,transparent_60%)]"
        },
        emerald: {
            bg: "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.06]",
            text: "text-emerald-600 dark:text-emerald-400",
            border: "border-emerald-500/20",
            glow: "bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08)_0%,transparent_60%)]"
        }
    };

    const themes = colorMap[accentColor] || colorMap.primary;

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card via-card to-muted/20 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-border/80">
            {/* Ambient glows and micro-texture */}
            <div className="absolute inset-0 noise-overlay opacity-[0.012] pointer-events-none" />
            <div className={`absolute inset-0 ${themes.glow} pointer-events-none transition-opacity duration-300 group-hover:opacity-100`} />
            
            {/* Corner accent glow indicator */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-foreground/[0.02] to-transparent rounded-bl-full pointer-events-none`} />

            <div className="relative flex items-center justify-between gap-4">
                <div className="flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">{title}</span>
                    <span className="text-3xl font-heading font-extrabold text-foreground tracking-tight tabular-nums mt-0.5 select-all">
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
                
                {/* Modern squircle design icon wrapper */}
                <div className={`shrink-0 flex items-center justify-center size-12 rounded-xl border transition-all duration-300 group-hover:scale-105 shadow-inner ${themes.bg} ${themes.border} ${themes.text}`}>
                    <Icon className="size-5 transition-transform duration-300 group-hover:rotate-6" />
                </div>
            </div>
        </div>
    );
}
