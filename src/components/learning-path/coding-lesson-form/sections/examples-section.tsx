"use client";

import {FieldArrayWithId, UseFormRegister} from "react-hook-form";
import {useTranslations} from "next-intl";
import {Plus, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {FormField} from "@/components/learning-path/form-field";
import {CodingLessonDTO} from "@/types/learning-path/schema";

interface ExamplesSectionProps {
    register: UseFormRegister<CodingLessonDTO>;
    fields: FieldArrayWithId<CodingLessonDTO, "examples", "id">[];
    onAppend: () => void;
    onRemove: (index: number) => void;
    isPending?: boolean;
}

export function ExamplesSection({
    register,
    fields,
    onAppend,
    onRemove,
    isPending,
}: ExamplesSectionProps) {
    const t = useTranslations("lessonForm");

    return (
        <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">{t("coding.examplesDescription")}</p>
            {fields.map((field, i) => (
                <div key={field.id} className="border-l-2 border-border pl-4">
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold">{t("coding.example", {number: i + 1})}</span>
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => onRemove(i)}
                                className="text-muted-foreground/50 hover:text-destructive"
                            >
                                <X className="w-3.5 h-3.5"/>
                            </Button>
                        )}
                    </div>
                    <div className="flex flex-col gap-3">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <FormField label={t("coding.input")} className="text-sm">
                                <Textarea
                                    placeholder="[2,7,11,15], target=9"
                                    className="min-h-20 resize-y font-mono text-sm"
                                    {...register(`examples.${i}.input` as const)}
                                    disabled={isPending}
                                />
                            </FormField>
                            <FormField label={t("coding.expectedOutput")} className="text-sm">
                                <Textarea
                                    placeholder="[0,1]"
                                    className="min-h-20 resize-y font-mono text-sm"
                                    {...register(`examples.${i}.output` as const)}
                                    disabled={isPending}
                                />
                            </FormField>
                        </div>
                        <FormField label={t("coding.explanationOptional")} className="text-sm">
                            <Input
                                placeholder="Because nums[0] + nums[1] == 9..."
                                {...register(`examples.${i}.explanation` as const)}
                                disabled={isPending}
                            />
                        </FormField>
                    </div>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAppend}
                className="self-start"
            >
                <Plus className="w-3.5 h-3.5 mr-1.5"/>
                {t("coding.addExample")}
            </Button>
        </div>
    );
}
