"use client";

import {UseFormRegister} from "react-hook-form";
import {useTranslations} from "next-intl";
import {Plus, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {FormField} from "@/components/learning-path/form-field";
import {CodingLessonDTO} from "@/types/learning-path/schema";

interface ConstraintsSectionProps {
    register: UseFormRegister<CodingLessonDTO>;
    constraints: string[];
    errors: {
        baseTimeLimitMs?: { message?: string };
        baseMemoryLimitMb?: { message?: string };
        constraints?: { message?: string };
    };
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, value: string) => void;
    isPending?: boolean;
}

export function ConstraintsSection({
    register,
    constraints,
    errors,
    onAdd,
    onRemove,
    onUpdate,
    isPending,
}: ConstraintsSectionProps) {
    const t = useTranslations("lessonForm");

    return (
        <div className="flex flex-col gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label={t("coding.timeLimit")}
                    error={errors.baseTimeLimitMs?.message}
                    description={t("coding.timeLimitDescription")}
                >
                    <div className="relative">
                        <Input
                            id="baseTimeLimitMs"
                            type="number"
                            min={1}
                            max={300000}
                            className="pr-14"
                            {...register("baseTimeLimitMs", {valueAsNumber: true})}
                            disabled={isPending}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                            ms
                        </span>
                    </div>
                </FormField>
                <FormField
                    label={t("coding.memoryLimit")}
                    error={errors.baseMemoryLimitMb?.message}
                    description={t("coding.memoryLimitDescription")}
                >
                    <div className="relative">
                        <Input
                            id="baseMemoryLimitMb"
                            type="number"
                            min={1}
                            max={1024}
                            className="pr-14"
                            {...register("baseMemoryLimitMb", {valueAsNumber: true})}
                            disabled={isPending}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                            MB
                        </span>
                    </div>
                </FormField>
            </div>

            <FormField
                label={t("coding.constraints")}
                error={errors.constraints?.message as string | undefined}
                description={t("coding.constraintsDescription")}
            >
                <div className="flex flex-col gap-2">
                    {constraints.length === 0 && (
                        <p className="text-sm text-muted-foreground italic py-1">
                            {t("coding.noConstraints")}
                        </p>
                    )}
                    {constraints.map((field, i) => (
                        <div key={i} className="group flex items-center gap-2">
                            <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <Input
                                    placeholder={t("coding.constraintPlaceholder")}
                                    className="pl-8 font-mono text-sm"
                                    value={field}
                                    onChange={(e) => onUpdate(i, e.target.value)}
                                    disabled={isPending}
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => onRemove(i)}
                                className="shrink-0 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3.5 h-3.5"/>
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onAdd}
                        className="self-start mt-1"
                    >
                        <Plus className="w-3.5 h-3.5 mr-1.5"/>
                        {t("coding.addConstraint")}
                    </Button>
                </div>
            </FormField>
        </div>
    );
}
