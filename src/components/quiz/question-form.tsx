"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Check, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

import {
    CreateQuestionSchema,
    QuestionRequestDTO,
} from "@/types/learning-path/schema";
import { QuestionType } from "@/types/learning-path";
import { cn } from "@/lib/utils";

interface QuestionFormProps {
    defaultValues?: QuestionRequestDTO;
    onSubmit: (data: QuestionRequestDTO) => Promise<void>;
}

export function QuestionForm({
    defaultValues,
    onSubmit,
}: QuestionFormProps) {
    const t = useTranslations("lessonForm.questions.form");
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<QuestionRequestDTO>({
        resolver: zodResolver(CreateQuestionSchema),
        defaultValues: {
            question: "",
            type: "SINGLE_CHOICE",
            points: 1,
            explanation: "",
            choices: [
                { text: "", isCorrect: false, explanation: "" },
                { text: "", isCorrect: false, explanation: "" },
            ],
            ...defaultValues,
        },
    });

    const { fields, append, remove } = useFieldArray({
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
        const updated = watchedChoices.map((choice, currentIndex) => ({
            ...choice,
            isCorrect:
                watchedType === "MULTIPLE_CHOICE"
                    ? currentIndex === index
                        ? !choice.isCorrect
                        : choice.isCorrect
                    : currentIndex === index,
        }));

        setValue("choices", updated, { shouldValidate: true });
    };

    const handleTypeChange = (newType: QuestionType) => {
        const updated = watchedChoices.map((choice) => ({
            ...choice,
            isCorrect: false,
        }));

        setValue("choices", updated, { shouldValidate: true });
        setValue("type", newType, { shouldValidate: true });
    };

    return (
        <form
            id="question-form"
            onSubmit={handleSubmit(onSubmit)}
            className="mx-auto w-full px-4"
        >
            <FieldGroup className="gap-5">
                <section className="rounded-xl bg-card ring-1 ring-border/70">
                    <div className="border-b border-border/70 px-4 py-4 sm:px-5">
                        <h3 className="text-base font-semibold text-foreground">
                            {t("contentTitle")}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {t("contentDescription")}
                        </p>
                    </div>

                    <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2">
                        <Field data-invalid={Boolean(errors.question)}>
                            <FieldLabel
                                htmlFor="question"
                                className="text-sm font-semibold text-foreground"
                            >
                                {t("questionLabel")}
                            </FieldLabel>

                            <FieldContent>
                                <Textarea
                                    id="question"
                                    placeholder={t("questionPlaceholder")}
                                    className="min-h-[132px] resize-none text-base leading-7"
                                    aria-invalid={!!errors.question}
                                    {...register("question")}
                                />

                                {errors.question && (
                                    <FieldError className="text-sm">
                                        {errors.question.message}
                                    </FieldError>
                                )}
                            </FieldContent>
                        </Field>

                        <Field>
                            <FieldLabel
                                htmlFor="explanation"
                                className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground"
                            >
                                <span>{t("explanationLabel")}</span>
                                <span className="text-xs font-medium text-muted-foreground">{t("optional")}</span>
                            </FieldLabel>

                            <FieldContent>
                                <Textarea
                                    id="explanation"
                                    placeholder={t("explanationPlaceholder")}
                                    className="min-h-[132px] resize-none text-base leading-7"
                                    {...register("explanation")}
                                />

                                <FieldDescription className="text-sm leading-6 text-muted-foreground">
                                    {t("explanationHint")}
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    </div>
                </section>

                <section className="rounded-2xl bg-card p-4 ring-1 ring-border/70 sm:p-5">
                    <div className="grid gap-5 md:grid-cols-[1fr_160px] md:items-end">
                        <div className="flex flex-col gap-2">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {t("typeLabel")}
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    {t("typeDescription")}
                                </p>
                            </div>

                            <div className="grid gap-2 rounded-md border border-border bg-background p-1 shadow-[0_1px_2px_rgba(15,23,42,0.03)] sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => handleTypeChange("SINGLE_CHOICE")}
                                    className={cn(
                                        "rounded-sm px-4 py-2.5 text-sm font-semibold transition-all",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        watchedType === "SINGLE_CHOICE"
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    )}
                                >
                                    {t("singleChoice")}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleTypeChange("MULTIPLE_CHOICE")}
                                    className={cn(
                                        "rounded-sm px-4 py-2.5 text-sm font-semibold transition-all",
                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        watchedType === "MULTIPLE_CHOICE"
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    )}
                                >
                                    {t("multipleChoice")}
                                </button>
                            </div>
                        </div>

                        <Field data-invalid={Boolean(errors.points)}>
                            <FieldLabel
                                htmlFor="points"
                                className="text-sm font-semibold text-foreground"
                            >
                                {t("pointsLabel")}
                            </FieldLabel>

                            <FieldContent>
                                <Input
                                    id="points"
                                    type="number"
                                    min={1}
                                    className="h-11 text-base font-medium"
                                    aria-invalid={!!errors.points}
                                    {...register("points", { valueAsNumber: true })}
                                />

                                {errors.points && (
                                    <FieldError className="text-sm">
                                        {errors.points.message}
                                    </FieldError>
                                )}
                            </FieldContent>
                        </Field>
                    </div>
                </section>

                <section className="rounded-2xl bg-card ring-1 ring-border/70">
                    <div className="flex flex-col gap-2 border-b border-border/70 px-4 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-5">
                        <div>
                            <h3 className="text-base font-semibold text-foreground">
                                {t("answersTitle")}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {watchedType === "MULTIPLE_CHOICE"
                                    ? t("multipleChoiceHint")
                                    : t("singleChoiceHint")}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                                {t("choiceCount", {count: fields.length})}
                            </span>
                        </div>
                    </div>

                    <Field>
                        <FieldContent className="gap-0">
                            <div className="divide-y">
                                {fields.map((field, index) => {
                                    const isSelected =
                                        watchedChoices?.[index]?.isCorrect ?? false;

                                    return (
                                        <div
                                            key={field.id}
                                            className={cn(
                                                "p-4 transition-colors sm:p-5",
                                                isSelected
                                                    ? "bg-primary/[0.06]"
                                                    : "bg-background"
                                            )}
                                        >
                                            <div className="grid gap-4 md:grid-cols-[40px_1fr_auto] md:items-start">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCorrectChange(index)}
                                                    aria-label={t("markCorrect", {number: index + 1})}
                                                    className={cn(
                                                        "flex size-9 items-center justify-center rounded-full border transition-all",
                                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                        isSelected
                                                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                                            : "border-muted-foreground/30 bg-background hover:border-foreground"
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <Check className="size-5 stroke-[3]" />
                                                    )}
                                                </button>

                                                <div className="min-w-0 space-y-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {t("answerNumber", {number: index + 1})}
                                                        </p>

                                                        {isSelected && (
                                                            <span className="rounded-lg bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                                {t("correct")}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-3 xl:grid-cols-2">
                                                        <div className="flex flex-col gap-1.5">
                                                            <label htmlFor={`choice-${index}`} className="text-xs font-medium text-muted-foreground">
                                                                {t("answerContent")}
                                                            </label>

                                                            <Input
                                                                id={`choice-${index}`}
                                                                placeholder={t("answerPlaceholder", {number: index + 1})}
                                                                className="h-11 text-base"
                                                                aria-invalid={Boolean(errors.choices?.[index]?.text)}
                                                                {...register(
                                                                    `choices.${index}.text` as const
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="flex flex-col gap-1.5">
                                                            <label htmlFor={`choice-explanation-${index}`} className="text-xs font-medium text-muted-foreground">
                                                                {t("answerExplanation")}
                                                            </label>

                                                            <Input
                                                                id={`choice-explanation-${index}`}
                                                                placeholder={t("answerExplanationPlaceholder")}
                                                                className="h-11 border-dashed text-base"
                                                                {...register(
                                                                    `choices.${index}.explanation` as const
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {fields.length > 2 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => remove(index)}
                                                        className="justify-self-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive md:justify-self-end"
                                                        aria-label={t("removeAnswer", {number: index + 1})}
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {errors.choices?.root && (
                                <div className="px-5 pt-4">
                                    <FieldError className="text-sm">
                                        {errors.choices.root.message}
                                    </FieldError>
                                </div>
                            )}

                            <div className="border-t border-border/70 bg-muted/20 p-4 sm:p-5">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        append({
                                            text: "",
                                            isCorrect: false,
                                            explanation: "",
                                        })
                                    }
                                    className="h-12 w-full rounded-xl border-2 border-dashed text-sm font-semibold hover:border-primary hover:text-primary"
                                >
                                    <Plus data-icon="inline-start" />
                                    {t("addAnswer")}
                                </Button>
                            </div>
                        </FieldContent>
                    </Field>
                </section>
            </FieldGroup>
        </form>
    );
}
