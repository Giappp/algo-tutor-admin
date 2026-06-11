"use client";

import {cn} from "@/lib/utils";
import {Level} from "@/types/learning-path";

const LEVEL_OPTIONS: {
    value: Level;
    label: string;
    description: string;
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    borderColor: string;
    activeBg: string;
}[] = [
    {
        value: "BEGINNER",
        label: "Beginner",
        description: "New to the topic",
        icon: (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
            </svg>
        ),
        iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        borderColor: "data-[state=on]:border-emerald-500/60",
        activeBg: "data-[state=on]:bg-emerald-50 dark:data-[state=on]:bg-emerald-950/40",
    },
    {
        value: "INTERMEDIATE",
        label: "Intermediate",
        description: "Some experience",
        icon: (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4"/>
                <path d="M12 18v4"/>
                <path d="M4.93 4.93l2.83 2.83"/>
                <path d="M16.24 16.24l2.83 2.83"/>
                <path d="M2 12h4"/>
                <path d="M18 12h4"/>
                <path d="M4.93 19.07l2.83-2.83"/>
                <path d="M16.24 7.76l2.83-2.83"/>
            </svg>
        ),
        iconBg: "bg-amber-100 dark:bg-amber-900/50",
        iconColor: "text-amber-600 dark:text-amber-400",
        borderColor: "data-[state=on]:border-amber-500/60",
        activeBg: "data-[state=on]:bg-amber-50 dark:data-[state=on]:bg-amber-950/40",
    },
    {
        value: "ADVANCED",
        label: "Advanced",
        description: "Expert level",
        icon: (
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
                <polygon
                    points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
        ),
        iconBg: "bg-rose-100 dark:bg-rose-900/50",
        iconColor: "text-rose-600 dark:text-rose-400",
        borderColor: "data-[state=on]:border-rose-500/60",
        activeBg: "data-[state=on]:bg-rose-50 dark:data-[state=on]:bg-rose-950/40",
    },
];

interface LevelSelectProps {
    value: Level;
    onChange: (value: Level) => void;
    disabled?: boolean;
    className?: string;
}

export function LevelSelect({value, onChange, disabled, className}: LevelSelectProps) {
    return (
        <div className={cn("grid w-full grid-cols-3 gap-3", className)}>
            {LEVEL_OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => !disabled && onChange(opt.value)}
                    disabled={disabled}
                    aria-pressed={value === opt.value}
                    aria-label={`${opt.label}: ${opt.description}`}
                    data-state={value === opt.value ? "on" : "off"}
                    className={cn(
                        "relative flex flex-col items-center justify-center gap-2 rounded-lg border py-3.5 px-2 cursor-pointer transition-all duration-200",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        "data-[state=off]:border-border data-[state=off]:bg-background hover:border-foreground/25",
                        opt.borderColor,
                        opt.activeBg,
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                >
                    <div
                        className={cn(
                            "flex size-10 items-center justify-center rounded-md transition-transform duration-200",
                            opt.iconBg,
                            opt.iconColor,
                            value === opt.value && "scale-110"
                        )}
                    >
                        {opt.icon}
                    </div>
                    <div className="text-center">
                        <span className="block text-sm font-semibold">{opt.label}</span>
                        <span className="block text-[10px] text-muted-foreground leading-tight">{opt.description}</span>
                    </div>
                </button>
            ))}
        </div>
    );
}
