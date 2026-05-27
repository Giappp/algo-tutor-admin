"use client";

import {useFieldArray, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Check, Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel} from "@/components/ui/field";
import {CreateQuestionSchema, QuestionRequestDTO} from "@/types/learning-path/schema";
import {QuestionType} from "@/types/learning-path";
import {cn} from "@/lib/utils";

interface QuestionFormProps {
    defaultValues?: QuestionRequestDTO;
    onSubmit: (data: QuestionRequestDTO) => Promise<void>;
}

export function QuestionForm({
                                 defaultValues,
                                 onSubmit,
                             }: QuestionFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: {errors},
    } = useForm<QuestionRequestDTO>({
        resolver: zodResolver(CreateQuestionSchema),
        defaultValues: {
            question: "",
            type: "SINGLE_CHOICE",
            points: 1,
            explanation: "",
            choices: [
                {text: "", isCorrect: false, explanation: ""},
                {text: "", isCorrect: false, explanation: ""},
            ],
            ...defaultValues,
        },
    });

    const {fields, append, remove} = useFieldArray({
        control,
        name: "choices",
    });

    const watchedType = useWatch({
        name: "type",
        control,
    });

    const watchedChoices = useWatch({
        name: "choices",
        control,
    });

    const handleCorrectChange = (index: number) => {
        const updated = watchedChoices.map((c, i) => ({
            ...c,
            isCorrect: watchedType === "MULTIPLE_CHOICE" ? (i === index ? !c.isCorrect : c.isCorrect) : i === index,
        }));
        setValue("choices", updated, {shouldValidate: true});
    };

    const handleTypeChange = (newType: QuestionType) => {
        const updated = watchedChoices.map((c) => ({
            ...c,
            isCorrect: false,
        }));
        setValue("choices", updated);
        setValue("type", newType, {shouldValidate: true});
    };

    return (
        <form id="question-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <FieldGroup className="gap-5">
                {/* Row 1: Question Text & Explanation Side-by-Side (Compact grid) */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="question" className="text-sm font-semibold">Question Text</FieldLabel>
                        <FieldContent>
                            <Textarea
                                id="question"
                                placeholder="Enter your question details..."
                                className="min-h-[110px] text-sm resize-none rounded-lg"
                                aria-invalid={!!errors.question}
                                {...register("question")}
                            />
                            {errors.question && (
                                <FieldError className="text-sm">{errors.question.message}</FieldError>
                            )}
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="explanation" className="text-sm font-semibold flex items-center justify-between">
                            <span>Explanation</span>
                            <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
                        </FieldLabel>
                        <FieldContent>
                            <Textarea
                                id="explanation"
                                placeholder="Explain why the correct answer is correct..."
                                className="min-h-[110px] text-sm resize-none rounded-lg"
                                {...register("explanation")}
                            />
                            <FieldDescription className="text-sm text-muted-foreground mt-1">
                                Shown after answering.
                            </FieldDescription>
                        </FieldContent>
                    </Field>
                </div>

                {/* Row 2: Question Type (Segmented control, NOT overly rounded Select) & Points */}
                <div className="grid gap-4 sm:grid-cols-3 items-end">
                    <div className="sm:col-span-2 flex flex-col gap-2">
                        <span className="text-sm font-semibold text-foreground">Question Type</span>
                        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/80 gap-1">
                            <button
                                type="button"
                                onClick={() => handleTypeChange("SINGLE_CHOICE")}
                                className={cn(
                                    "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-150",
                                    watchedType === "SINGLE_CHOICE"
                                        ? "bg-background text-foreground shadow-sm font-semibold border border-border/40"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                )}
                            >
                                Single Choice
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTypeChange("MULTIPLE_CHOICE")}
                                className={cn(
                                    "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all duration-150",
                                    watchedType === "MULTIPLE_CHOICE"
                                        ? "bg-background text-foreground shadow-sm font-semibold border border-border/40"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                )}
                            >
                                Multiple Choice
                            </button>
                        </div>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="points" className="text-sm font-semibold">Points</FieldLabel>
                        <FieldContent>
                            <Input
                                id="points"
                                type="number"
                                min={1}
                                className="text-sm h-10 rounded-lg"
                                aria-invalid={!!errors.points}
                                {...register("points", {valueAsNumber: true})}
                            />
                            {errors.points && (
                                <FieldError className="text-sm">{errors.points.message}</FieldError>
                            )}
                        </FieldContent>
                    </Field>
                </div>

                {/* Section 3: Answer Choices (Compact side-by-side horizontal cards) */}
                <Field>
                    <FieldLabel className="text-sm font-semibold flex items-center justify-between border-t pt-4">
                        <span>Answer Choices</span>
                        <span className="text-sm text-muted-foreground font-normal">
                            {watchedType === "MULTIPLE_CHOICE" ? "Check all correct answers" : "Select the single correct answer"}
                        </span>
                    </FieldLabel>
                    <FieldContent className="gap-3">
                        {fields.map((field, index) => {
                            const isSelected = watchedChoices?.[index]?.isCorrect ?? false;
                            return (
                                <div
                                    key={field.id}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg border p-3 transition-all duration-150",
                                        isSelected
                                            ? "bg-emerald-500/5 border-emerald-500/35 shadow-sm"
                                            : "bg-card border-border hover:bg-muted/10 hover:border-muted-foreground/15"
                                    )}
                                >
                                    {/* Selection button */}
                                    <button
                                        type="button"
                                        onClick={() => handleCorrectChange(index)}
                                        className={cn(
                                            "shrink-0 size-5.5 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring/50",
                                            isSelected
                                                ? "bg-emerald-500 border-emerald-500 text-white"
                                                : "border-muted-foreground/30 hover:border-muted-foreground/50 bg-background"
                                        )}
                                    >
                                        {isSelected && <Check className="size-3.5 stroke-[3.5]"/>}
                                    </button>

                                    {/* Text inputs side-by-side for ultra-compact vertical size */}
                                    <div className="flex-1 flex gap-3 items-center min-w-0">
                                        <div className="flex-1 min-w-0">
                                            <Input
                                                placeholder={`Choice ${index + 1}`}
                                                className="text-sm h-9 rounded-lg"
                                                {...register(`choices.${index}.text` as const)}
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <Input
                                                placeholder="Choice explanation (optional)"
                                                className="text-sm h-9 rounded-lg bg-muted/20 border-dashed"
                                                {...register(`choices.${index}.explanation` as const)}
                                            />
                                        </div>
                                    </div>

                                    {/* Delete Button */}
                                    {fields.length > 2 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => remove(index)}
                                            className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all"
                                        >
                                            <Trash2 className="size-4"/>
                                        </Button>
                                    )}
                                </div>
                            );
                        })}

                        {errors.choices?.root && (
                            <FieldError className="text-sm">{errors.choices.root.message}</FieldError>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({text: "", isCorrect: false})}
                            className="w-full py-4 border-dashed border-2 hover:border-amber-500 hover:text-amber-600 transition-all gap-1.5 text-sm font-semibold rounded-lg"
                        >
                            <Plus className="size-4"/>
                            Add Answer Choice
                        </Button>
                    </FieldContent>
                </Field>
            </FieldGroup>
        </form>
    );
}
