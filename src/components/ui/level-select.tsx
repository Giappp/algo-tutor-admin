"use client";

import {Check, Gauge, GraduationCap, Sprout} from "lucide-react";
import {useTranslations} from "next-intl";
import {cn} from "@/lib/utils";
import {Level} from "@/types/learning-path";

const LEVEL_OPTIONS: {
    value: Level;
    translationKey: "beginner" | "intermediate" | "advanced";
    icon: typeof Sprout;
}[] = [
    {
        value: "BEGINNER",
        translationKey: "beginner",
        icon: Sprout,
    },
    {
        value: "INTERMEDIATE",
        translationKey: "intermediate",
        icon: Gauge,
    },
    {
        value: "ADVANCED",
        translationKey: "advanced",
        icon: GraduationCap,
    },
];

interface LevelSelectProps {
    value: Level;
    onChange: (value: Level) => void;
    disabled?: boolean;
    className?: string;
}

export function LevelSelect({value, onChange, disabled, className}: LevelSelectProps) {
    const t = useTranslations("learningPaths");

    return (
        <div role="radiogroup" aria-label={t("fieldLevel")} className={cn("grid w-full gap-2", className)}>
            {LEVEL_OPTIONS.map((opt) => {
                const selected = value === opt.value;
                const Icon = opt.icon;

                return (
                    <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => !disabled && onChange(opt.value)}
                        disabled={disabled}
                        className={cn(
                            "flex min-h-12 items-center gap-3 rounded-lg border border-border bg-background p-2.5 text-left transition-all",
                            "hover:border-primary/30 hover:bg-primary/[0.025] active:translate-y-px",
                            "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/20",
                            selected && "border-primary/35 bg-primary/[0.055] text-primary",
                            disabled && "cursor-not-allowed opacity-50"
                        )}
                    >
                        <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground", selected && "bg-primary/10 text-primary")}>
                            <Icon className="size-4"/>
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block text-xs font-semibold text-foreground">{t(opt.translationKey)}</span>
                            <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{t(`levelDescription.${opt.translationKey}`)}</span>
                        </span>
                        <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border border-border", selected && "border-primary bg-primary text-primary-foreground")}>
                            {selected && <Check className="size-3"/>}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
