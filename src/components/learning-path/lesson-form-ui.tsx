"use client";

import type {ElementType, ReactNode} from "react";
import {BookOpen, Check, Code2, FileQuestion, Loader2, Save} from "lucide-react";
import {useTranslations} from "next-intl";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {FormField} from "@/components/learning-path/form-field";
import {SaveStatusIndicator} from "@/components/ui/save-status-indicator";
import type {AutosaveStatus} from "@/hooks/use-autosave";
import type {Difficulty, LessonType} from "@/types/learning-path";

const LESSON_META: Record<LessonType, {icon: ElementType; translationKey: "theory" | "quiz" | "coding"}> = {
    THEORY: {icon: BookOpen, translationKey: "theory"},
    QUIZ: {icon: FileQuestion, translationKey: "quiz"},
    CODING: {icon: Code2, translationKey: "coding"},
};

const DIFFICULTIES: {value: Difficulty; translationKey: "easy" | "medium" | "hard"}[] = [
    {value: "EASY", translationKey: "easy"},
    {value: "MEDIUM", translationKey: "medium"},
    {value: "HARD", translationKey: "hard"},
];

interface LessonFormHeaderProps {
    type: LessonType;
    status?: AutosaveStatus;
    isDirty?: boolean;
    lastSavedAt?: Date | null;
    action?: ReactNode;
}

export function LessonFormHeader({
    type,
    status,
    isDirty = false,
    lastSavedAt = null,
    action,
}: LessonFormHeaderProps) {
    const t = useTranslations("lessonForm");
    const meta = LESSON_META[type];
    const Icon = meta.icon;

    return (
        <header className="flex flex-col gap-3 pb-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
                <Icon className="size-4 text-primary"/>
                <div className="min-w-0">
                    <h2 className="text-base font-semibold tracking-tight">{t(`types.${meta.translationKey}.label`)}</h2>
                    <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">{t(`types.${meta.translationKey}.description`)}</p>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
                {status && (
                    <SaveStatusIndicator status={status} isDirty={isDirty} lastSavedAt={lastSavedAt}/>
                )}
                {action}
            </div>
        </header>
    );
}

interface LessonFormSectionProps {
    title: string;
    description?: string;
    aside?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function LessonFormSection({
    title,
    description,
    aside,
    children,
    className,
}: LessonFormSectionProps) {
    return (
        <section className={cn("border-t border-border/60 pt-6", className)}>
            <div className="mb-4">
                <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
                {description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>}
                {aside}
            </div>
            <div className="min-w-0 max-w-5xl space-y-5">{children}</div>
        </section>
    );
}

interface DifficultyFieldProps {
    value?: Difficulty;
    onChange: (value: Difficulty) => void;
    error?: ReactNode;
    disabled?: boolean;
}

export function DifficultyField({value, onChange, error, disabled}: DifficultyFieldProps) {
    const t = useTranslations("lessonForm");

    return (
        <FormField label={t("difficulty.label")} error={error}>
            <div className="inline-flex w-fit rounded-md border border-border bg-background p-1 shadow-[0_1px_2px_rgba(15,23,42,0.03)]" role="radiogroup" aria-label={t("difficulty.label")}>
                {DIFFICULTIES.map((option) => {
                    const selected = value === option.value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            disabled={disabled}
                            onClick={() => onChange(option.value)}
                            className={cn(
                                "flex h-9 items-center gap-1.5 rounded-sm px-3 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50",
                                selected ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                        >
                            {selected && <Check className="size-3"/>}
                            {t(`difficulty.${option.translationKey}`)}
                        </button>
                    );
                })}
            </div>
        </FormField>
    );
}

interface LessonFormActionsProps {
    isPending?: boolean;
    submitLabel: string;
    autosave?: boolean;
}

export function LessonFormActions({isPending, submitLabel, autosave}: LessonFormActionsProps) {
    const t = useTranslations("lessonForm");

    return (
        <footer className="sticky bottom-0 z-30 -mx-3 flex flex-col gap-3 border-t border-border/70 bg-card/95 px-3 py-3 shadow-[0_-12px_30px_-24px_rgba(0,0,0,0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <p className="hidden text-sm text-muted-foreground sm:block">
                {autosave ? <>{t("actions.autosaveHint")} <kbd className="rounded border bg-muted/50 px-1.5 py-0.5 font-mono">Ctrl+S</kbd>.</> : t("actions.createHint")}
            </p>
            <Button type="submit" disabled={isPending} className="ml-auto self-end px-5 shadow-sm">
                {isPending ? <Loader2 className="size-4 animate-spin"/> : <Save className="size-4"/>}
                {isPending ? t("actions.saving") : submitLabel}
            </Button>
        </footer>
    );
}
