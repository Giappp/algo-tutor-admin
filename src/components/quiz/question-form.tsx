"use client";

import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
            className="mx-auto w-full max-w-4xl"
        >
            <FieldGroup className="gap-5">
                <section className="rounded-2xl border bg-card shadow-sm">
                    <div className="border-b px-5 py-4">
                        <h3 className="text-base font-semibold text-foreground">
                            Thông tin câu hỏi
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Nhập nội dung chính và phần giải thích hiển thị sau khi người học trả lời.
                        </p>
                    </div>

                    <div className="grid gap-5 p-5 lg:grid-cols-2">
                        <Field>
                            <FieldLabel
                                htmlFor="question"
                                className="text-sm font-semibold text-foreground"
                            >
                                Nội dung câu hỏi
                            </FieldLabel>

                            <FieldContent>
                                <Textarea
                                    id="question"
                                    placeholder="Ví dụ: Độ phức tạp thời gian của Binary Search là gì?"
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
                                <span>Giải thích chung</span>
                                <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                    Tùy chọn
                                </span>
                            </FieldLabel>

                            <FieldContent>
                                <Textarea
                                    id="explanation"
                                    placeholder="Giải thích vì sao đáp án đúng là chính xác..."
                                    className="min-h-[132px] resize-none text-base leading-7"
                                    {...register("explanation")}
                                />

                                <FieldDescription className="text-sm leading-6 text-muted-foreground">
                                    Nên viết ngắn gọn, tập trung vào bản chất của đáp án đúng.
                                </FieldDescription>
                            </FieldContent>
                        </Field>
                    </div>
                </section>

                <section className="rounded-2xl border bg-card p-5 shadow-sm">
                    <div className="grid gap-5 md:grid-cols-[1fr_160px] md:items-end">
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Loại câu hỏi
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Chọn một đáp án đúng hoặc nhiều đáp án đúng.
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
                                    Một đáp án đúng
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
                                    Nhiều đáp án đúng
                                </button>
                            </div>
                        </div>

                        <Field>
                            <FieldLabel
                                htmlFor="points"
                                className="text-sm font-semibold text-foreground"
                            >
                                Điểm
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

                <section className="rounded-2xl border bg-card shadow-sm">
                    <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold text-foreground">
                                Đáp án
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                {watchedType === "MULTIPLE_CHOICE"
                                    ? "Đánh dấu tất cả đáp án đúng."
                                    : "Đánh dấu một đáp án đúng duy nhất."}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                                {fields.length} lựa chọn
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
                                                "p-5 transition-colors",
                                                isSelected
                                                    ? "bg-emerald-500/[0.07]"
                                                    : "bg-background"
                                            )}
                                        >
                                            <div className="grid gap-4 md:grid-cols-[40px_1fr_auto] md:items-start">
                                                <button
                                                    type="button"
                                                    onClick={() => handleCorrectChange(index)}
                                                    aria-label={`Đánh dấu đáp án ${index + 1} là đáp án đúng`}
                                                    className={cn(
                                                        "flex size-9 items-center justify-center rounded-full border transition-all",
                                                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                                        isSelected
                                                            ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
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
                                                            Đáp án {index + 1}
                                                        </p>

                                                        {isSelected && (
                                                            <span className="rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                                                                Đúng
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-3 xl:grid-cols-2">
                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-muted-foreground">
                                                                Nội dung đáp án
                                                            </label>

                                                            <Input
                                                                placeholder={`Nhập đáp án ${index + 1}`}
                                                                className="h-11 text-base"
                                                                {...register(
                                                                    `choices.${index}.text` as const
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-xs font-medium text-muted-foreground">
                                                                Giải thích riêng
                                                            </label>

                                                            <Input
                                                                placeholder="Giải thích ngắn cho lựa chọn này"
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
                                                        aria-label={`Xóa đáp án ${index + 1}`}
                                                    >
                                                        <Trash2 className="size-4" />
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

                            <div className="border-t bg-muted/20 p-5">
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
                                    <Plus className="mr-2 size-4" />
                                    Thêm đáp án
                                </Button>
                            </div>
                        </FieldContent>
                    </Field>
                </section>
            </FieldGroup>
        </form>
    );
}
