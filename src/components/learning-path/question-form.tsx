"use client";

import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Plus, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel,} from "@/components/ui/field";
import {CreateQuestion, CreateQuestionSchema,} from "@/types/learning-path/schema";
import {QuestionType} from "@/types/learning-path";

interface QuestionFormProps {
    defaultValues?: Partial<CreateQuestion>;
    onSubmit: (data: CreateQuestion) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
    {value: "SINGLE_CHOICE", label: "Single Choice"},
    {value: "MULTIPLE_CHOICE", label: "Multiple Choice"},
    {value: "TRUE_FALSE", label: "True / False"},
];

export function QuestionForm({
                                 defaultValues,
                                 onSubmit,
                                 isPending,
                                 submitLabel = "Save Question",
                                 onCancel,
                             }: QuestionFormProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: {errors},
    } = useForm<CreateQuestion>({
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

    const watchedType = watch("type");
    const watchedChoices = watch("choices");

    const handleCorrectChange = (index: number) => {
        const updated = watchedChoices.map((c, i) => ({
            ...c,
            isCorrect: watchedType === "MULTIPLE_CHOICE" ? c.isCorrect : i === index,
        }));
        setValue("choices", updated, {shouldValidate: true});
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FieldGroup className="gap-5">
                <Field>
                    <FieldLabel htmlFor="question">Question Text</FieldLabel>
                    <FieldContent>
                        <Textarea
                            id="question"
                            placeholder="Enter your question..."
                            className="min-h-20"
                            aria-invalid={!!errors.question}
                            disabled={isPending}
                            {...register("question")}
                        />
                        {errors.question && (
                            <FieldError>{errors.question.message}</FieldError>
                        )}
                    </FieldContent>
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field>
                        <FieldLabel htmlFor="type">Question Type</FieldLabel>
                        <FieldContent>
                            <Select
                                value={watchedType}
                                onValueChange={(v) =>
                                    setValue("type", v as QuestionType, {shouldValidate: true})
                                }
                                disabled={isPending}
                            >
                                <SelectTrigger aria-label="Select type">
                                    <SelectValue/>
                                </SelectTrigger>
                                <SelectContent>
                                    {QUESTION_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FieldContent>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="points">Points</FieldLabel>
                        <FieldContent>
                            <Input
                                id="points"
                                type="number"
                                min={1}
                                aria-invalid={!!errors.points}
                                disabled={isPending}
                                {...register("points", {valueAsNumber: true})}
                            />
                            {errors.points && (
                                <FieldError>{errors.points.message}</FieldError>
                            )}
                        </FieldContent>
                    </Field>
                </div>

                <Field>
                    <FieldLabel htmlFor="explanation">Explanation</FieldLabel>
                    <FieldContent>
                        <Textarea
                            id="explanation"
                            placeholder="Explain why the correct answer is correct..."
                            className="min-h-16"
                            disabled={isPending}
                            {...register("explanation")}
                        />
                        <FieldDescription>
                            Shown to learners after answering.
                        </FieldDescription>
                    </FieldContent>
                </Field>

                <Field>
                    <FieldLabel>Answer Choices</FieldLabel>
                    <FieldContent className="gap-3">
                        {fields.map((field, index) => (
                            <div
                                key={field.id}
                                className="flex items-start gap-3 rounded-xl border border-border/50 bg-muted/20 p-3"
                            >
                                <div className="flex flex-col gap-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type={watchedType === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                                            checked={watchedChoices[index]?.isCorrect ?? false}
                                            onChange={() =>
                                                handleCorrectChange(index)
                                            }
                                            className="size-4 rounded"
                                            disabled={isPending}
                                        />
                                        <Input
                                            placeholder={`Choice ${index + 1}`}
                                            disabled={isPending}
                                            {...register(`choices.${index}.text` as const)}
                                        />
                                        {fields.length > 2 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => remove(index)}
                                                disabled={isPending}
                                            >
                                                <Trash2 data-icon="inline-start"/>
                                            </Button>
                                        )}
                                    </div>
                                    {errors.choices?.[index]?.text && (
                                        <FieldError>
                                            {errors.choices[index]?.text?.message}
                                        </FieldError>
                                    )}
                                    <Input
                                        placeholder="Explanation (optional)"
                                        disabled={isPending}
                                        {...register(`choices.${index}.explanation` as const)}
                                        className="text-xs"
                                    />
                                </div>
                            </div>
                        ))}

                        {errors.choices?.root && (
                            <FieldError>{errors.choices.root.message}</FieldError>
                        )}

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                append({text: "", isCorrect: false, explanation: ""})
                            }
                            disabled={isPending}
                        >
                            <Plus data-icon="inline-start"/>
                            Add Choice
                        </Button>
                    </FieldContent>
                </Field>
            </FieldGroup>

            <div className="flex justify-end gap-3 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : submitLabel}
                </Button>
            </div>
        </form>
    );
}
