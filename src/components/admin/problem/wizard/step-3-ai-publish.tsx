"use client";

import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { step3Schema, type Step3Data } from "@/schemas/problem-wizard.schema";
import { useProblemDraftStore } from "@/store/problem-wizard.store";
import { put, post } from "@/api/http";
import { toAppError } from "@/api/api-error";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldDescription,
} from "@/components/ui/field";

import {
    ChevronLeftIcon,
    SaveIcon,
    RocketIcon,
    Loader2Icon,
    AlertCircleIcon,
    SparklesIcon,
} from "lucide-react";

// ── Component ──────────────────────────────────────────────────
export function Step3AiPublish({ onBack }: { onBack: () => void }) {
    const router = useRouter();
    const { problemId, setStep3, reset } = useProblemDraftStore();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<Step3Data>({
        resolver: zodResolver(step3Schema),
        defaultValues: {
            aiContext: "",
        },
    });

    // ── Mutations ──────────────────────────────────────────────
    const saveAiContext = useMutation({
        mutationFn: async (aiContext: string) => {
            return put(`/api/v1/problems/${problemId}/ai-context`, { aiContext });
        },
    });

    const publishProblem = useMutation({
        mutationFn: async () => {
            return post(`/api/v1/problems/${problemId}/publish`);
        },
    });

    const isPending = saveAiContext.isPending || publishProblem.isPending;

    // ── Save as Draft ──────────────────────────────────────────
    const handleSaveDraft = useCallback(
        async (data: Step3Data) => {
            try {
                setServerError(null);
                await saveAiContext.mutateAsync(data.aiContext);
                setStep3(data);
                toast.success("Problem saved as draft!", {
                    description: "You can continue editing it later.",
                });
                reset();
                router.push("/dashboard/problems");
            } catch (error) {
                const appError = toAppError(error);
                setServerError(appError.message);
            }
        },
        [saveAiContext, setStep3, reset, router]
    );

    // ── Publish ────────────────────────────────────────────────
    const handlePublish = useCallback(
        async (data: Step3Data) => {
            try {
                setServerError(null);
                await saveAiContext.mutateAsync(data.aiContext);
                await publishProblem.mutateAsync();
                setStep3(data);
                toast.success("Problem published!", {
                    description: "The problem is now live and visible to students.",
                });
                reset();
                router.push("/dashboard/problems");
            } catch (error) {
                const appError = toAppError(error);
                setServerError(appError.message);
            }
        },
        [saveAiContext, publishProblem, setStep3, reset, router]
    );

    return (
        <div className="space-y-8">
            {/* Server Error */}
            {serverError && (
                <div
                    className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300"
                    role="alert"
                >
                    <AlertCircleIcon className="size-4 shrink-0" />
                    <p>{serverError}</p>
                </div>
            )}

            {/* ── AI Context Section ── */}
            <section>
                <div className="flex items-center gap-2 mb-1">
                    <SparklesIcon className="size-5 text-primary" />
                    <h3 className="text-lg font-semibold">AI Mentor Context</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                    Provide instructions for the AI mentor. This helps the AI guide
                    students toward the right approach without spoiling the solution.
                </p>

                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="aiContext">
                            Prompt Instructions
                        </FieldLabel>
                        <FieldDescription>
                            Describe the key algorithmic concepts, common pitfalls, and
                            hints the AI should reference. Avoid including the actual solution
                            code.
                        </FieldDescription>
                        <Textarea
                            id="aiContext"
                            rows={12}
                            placeholder={`Example:
- This problem requires the use of a hash map for O(n) time complexity.
- Students often try brute-force O(n²) first — guide them toward thinking about "what complement do I need?"
- Key hint: "For each number, check if (target - number) exists in your seen values."
- Don't reveal the two-pass vs one-pass optimization upfront.`}
                            className="min-h-[240px] font-mono text-sm"
                            disabled={isPending}
                            {...register("aiContext")}
                        />
                    </Field>
                </FieldGroup>
            </section>

            {/* ── Actions ── */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={isPending}
                >
                    <ChevronLeftIcon />
                    Back
                </Button>

                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleSubmit(handleSaveDraft)}
                        disabled={isPending}
                    >
                        {saveAiContext.isPending && !publishProblem.isPending ? (
                            <>
                                <Loader2Icon className="animate-spin" />
                                Saving…
                            </>
                        ) : (
                            <>
                                <SaveIcon />
                                Save as Draft
                            </>
                        )}
                    </Button>

                    <Button
                        type="button"
                        onClick={handleSubmit(handlePublish)}
                        disabled={isPending}
                    >
                        {publishProblem.isPending ? (
                            <>
                                <Loader2Icon className="animate-spin" />
                                Publishing…
                            </>
                        ) : (
                            <>
                                <RocketIcon />
                                Publish
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
