"use client";

import React, {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";

import {toast} from "sonner";

import {ProblemDetailAdmin} from "@/types/problem";
import {toAppError} from "@/api/core/api-error";
import {useUpsertAiContext} from "@/hooks/use-problem";
import {Step3Data, step3Schema} from "@/schemas/problem-wizard.schema";

import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";

import {AlertCircleIcon, Loader2Icon, SaveIcon, SparklesIcon} from "lucide-react";

export function AiContextTab({problem}: { problem: ProblemDetailAdmin }) {
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: {errors, isDirty},
    } = useForm<Step3Data>({
        resolver: zodResolver(step3Schema),
        defaultValues: {
            algorithmicConcept: problem.aiContext?.algorithmicConcept || "",
            predefinedHints: problem.aiContext?.predefinedHints || "",
            edgeCasesToRemind: problem.aiContext?.edgeCasesToRemind || "",
        },
    });

    const updateAiContextHook = useUpsertAiContext(problem.id);

    const updateAiContext = {
        isPending: updateAiContextHook.isPending,
        mutate: (data: Step3Data) => {
            updateAiContextHook.mutate(data, {
                onSuccess: () => {
                    toast.success("AI Mentor context updated successfully.");
                    setServerError(null);
                },
                onError: (err) => {
                    const appError = toAppError(err);
                    setServerError(appError.message);
                }
            });
        }
    };

    const onSubmit = (data: Step3Data) => {
        updateAiContext.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <SparklesIcon className="size-5 text-primary"/>
                        <h2 className="text-lg font-semibold">AI Mentor Context</h2>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Provide instructions for the AI mentor. This helps the AI guide students toward the right
                        approach without spoiling the solution.
                    </p>
                </div>
                <Button type="submit" disabled={!isDirty || updateAiContext.isPending}>
                    {updateAiContext.isPending ? (
                        <Loader2Icon className="w-4 h-4 mr-2 animate-spin"/>
                    ) : (
                        <SaveIcon className="w-4 h-4 mr-2"/>
                    )}
                    Save Context
                </Button>
            </div>

            <FieldGroup className="gap-6 max-w-3xl">
                {serverError && (
                    <div
                        className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                        role="alert">
                        <AlertCircleIcon className="size-4 shrink-0"/>
                        <p>{serverError}</p>
                    </div>
                )}

                <Field>
                    <FieldLabel htmlFor="algorithmicConcept">Algorithmic Concept</FieldLabel>
                    <FieldDescription>What is the core algorithm or data structure expected?</FieldDescription>
                    <Textarea
                        id="algorithmicConcept"
                        rows={4}
                        className="font-mono text-sm"
                        disabled={updateAiContext.isPending}
                        aria-invalid={!!errors.algorithmicConcept}
                        {...register("algorithmicConcept")}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="predefinedHints">Predefined Hints</FieldLabel>
                    <FieldDescription>Hints the AI mentor can give when the student is stuck.</FieldDescription>
                    <Textarea
                        id="predefinedHints"
                        rows={4}
                        className="font-mono text-sm"
                        disabled={updateAiContext.isPending}
                        aria-invalid={!!errors.predefinedHints}
                        {...register("predefinedHints")}
                    />
                </Field>

                <Field>
                    <FieldLabel htmlFor="edgeCasesToRemind">Edge Cases</FieldLabel>
                    <FieldDescription>Important constraints or potential pitfalls to remind students
                        about.</FieldDescription>
                    <Textarea
                        id="edgeCasesToRemind"
                        rows={4}
                        className="font-mono text-sm"
                        disabled={updateAiContext.isPending}
                        aria-invalid={!!errors.edgeCasesToRemind}
                        {...register("edgeCasesToRemind")}
                    />
                </Field>
            </FieldGroup>
        </form>
    );
}
