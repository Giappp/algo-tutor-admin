"use client";

import {BookOpenIcon, CodeIcon, HelpCircleIcon} from "lucide-react";
import {cn} from "@/lib/utils";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {Field, FieldLabel} from "@/components/ui/field";
import {LessonType} from "@/types/learning-path";

const LESSON_TYPES = [
    {
        value: "THEORY" as const,
        label: "Theory",
        description: "Text-based lessons",
        icon: BookOpenIcon,
        color: "blue" as const,
    },
    {
        value: "QUIZ" as const,
        label: "Quiz",
        description: "Knowledge checks",
        icon: HelpCircleIcon,
        color: "amber" as const,
    },
    {
        value: "CODING" as const,
        label: "Coding",
        description: "Programming challenges",
        icon: CodeIcon,
        color: "emerald" as const,
    },
];

const COLOR_CLASSES = {
    blue: {
        default: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        selected: "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/40",
        icon: "text-blue-500",
    },
    amber: {
        default: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        selected: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40",
        icon: "text-amber-500",
    },
    emerald: {
        default: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        selected: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40",
        icon: "text-emerald-500",
    },
};

interface LessonTypeSelectorProps {
    value: LessonType;
    onChange: (value: LessonType) => void;
    label?: string;
    disabled?: boolean;
}

export function LessonTypeSelector({
                                       value,
                                       onChange,
                                       label = "Lesson Type",
                                       disabled = false,
                                   }: LessonTypeSelectorProps) {
    return (
        <Field>
            <FieldLabel id="lesson-type-label">{label}</FieldLabel>
            <ToggleGroup
                value={[value]}
                onValueChange={(vals) => {
                    if (vals.length > 0) {
                        onChange(vals[0] as LessonType);
                    }
                }}
                className="grid w-full grid-cols-3 gap-3"
                disabled={disabled}
            >
                {LESSON_TYPES.map((type) => {
                    const isSelected = value === type.value;
                    const Icon = type.icon;
                    const colors = COLOR_CLASSES[type.color];

                    return (
                        <ToggleGroupItem
                            key={type.value}
                            value={type.value}
                            aria-label={`${type.label}: ${type.description}`}
                            aria-labelledby="lesson-type-label"
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                                isSelected
                                    ? colors.selected + " ring-2 ring-offset-2 ring-offset-background"
                                    : colors.default,
                                "hover:scale-[1.02] active:scale-[0.98]",
                                disabled && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <Icon
                                className={cn("size-6 transition-transform", colors.icon)}
                                data-icon="inline-start"
                            />
                            <div className="flex flex-col items-center gap-0.5">
                                <span className="text-sm font-semibold">{type.label}</span>
                                <span className="text-[10px] text-muted-foreground">
                  {type.description}
                </span>
                            </div>
                        </ToggleGroupItem>
                    );
                })}
            </ToggleGroup>
        </Field>
    );
}
