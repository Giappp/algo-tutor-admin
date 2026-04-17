"use client";

import {useCallback, useMemo, useState} from "react";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import "katex/dist/katex.min.css";
import type {AxiosError} from "axios";

import {type Step2Data, step2Schema} from "@/schemas/problem-wizard.schema";
import {useProblemDraftStore} from "@/store/problem-wizard.store";
import {toAppError} from "@/api/core/api-error";
import {useUpsertTestCases} from "@/hooks/use-problem";

import {Button} from "@/components/ui/button";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Field, FieldError, FieldLabel,} from "@/components/ui/field";
import {Card, CardContent} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Separator} from "@/components/ui/separator";

import {
    AlertCircleIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    EyeIcon,
    EyeOffIcon,
    Loader2Icon,
    PlusIcon,
    Trash2Icon,
} from "lucide-react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-100 rounded-xl border border-input bg-input/10">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground"/>
        </div>
    ),
});

const LANGUAGES = [
    {key: "cpp" as const, label: "C++", monacoLang: "cpp"},
    {key: "python" as const, label: "Python", monacoLang: "python"},
    {key: "java" as const, label: "Java", monacoLang: "java"},
];

export function Step2TestsCode({
                                   onNext,
                                   onBack,
                               }: Readonly<{
    onNext: () => void;
    onBack: () => void;
}>) {
    const {problemId, step2Data, setStep2} = useProblemDraftStore();
    const [serverError, setServerError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        control,
        formState: {errors},
    } = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: step2Data ?? {
            testCases: [{input: "", expectedOutput: "", isSample: false, explanation: ""}],
            authorSolutionLanguage: "CPP",
            authorSolutionCode: "",
        },
    });

    const {fields, append, remove} = useFieldArray({
        control,
        name: "testCases",
    });

    const upsertTestCases = useUpsertTestCases(problemId!);

    const submitTestCases = useMemo(() => ({
        isPending: upsertTestCases.isPending,
        mutateAsync: async (data: Step2Data) => {
            return upsertTestCases.mutateAsync({
                language: data.authorSolutionLanguage,
                authorSolution: data.authorSolutionCode,
                testCases: data.testCases.map((tc, index) => ({
                    ...tc,
                    orderIndex: index
                })),
            });
        },
    }), [upsertTestCases]);

    const isPending = submitTestCases.isPending;

    const onSubmit = useCallback(
        async (data: Step2Data) => {
            try {
                setServerError(null);
                await submitTestCases.mutateAsync(data);
                setStep2(data);
                onNext();
            } catch (error) {
                const appError = toAppError(error);
                let errorMessage = appError.message;

                const axiosError = error as AxiosError<{error_code?: string; details?: Array<{testcaseIndex: number; status: string}>}>;
                const responseData = axiosError.response?.data;
                if (responseData?.error_code === "TESTCASE_VALIDATION_FAILED" && responseData?.details) {
                    const details = responseData.details;
                    errorMessage = `Test cases validation failed: ` + details.map((d) => `Case #${d.testcaseIndex + 1}: ${d.status}`).join(', ');
                }

                setServerError(errorMessage);
            }
        },
        [submitTestCases, setStep2, onNext]
    );

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Server Error */}
            {serverError && (
                <div
                    className="flex items-center gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1 duration-300"
                    role="alert"
                >
                    <AlertCircleIcon className="size-4 shrink-0"/>
                    <p>{serverError}</p>
                </div>
            )}

            {/* ── Test Cases Section ── */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Test Cases</h3>
                        <p className="text-sm text-muted-foreground">
                            Add at least one test case. Sample test cases are visible to
                            students as examples.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            append({input: "", expectedOutput: "", isSample: false, explanation: ""})
                        }
                        disabled={isPending}
                    >
                        <PlusIcon className="size-4"/>
                        Add Test Case
                    </Button>
                </div>

                <div className="space-y-4">
                    {fields.map((field, index) => (
                        <Card key={field.id} className="relative">
                            <CardContent className="pt-6 space-y-4">
                                {/* Header row */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        Test Case #{index + 1}
                                    </span>
                                    <div className="flex items-center gap-3">
                                        {/* Sample toggle */}
                                        <Controller
                                            control={control}
                                            name={`testCases.${index}.isSample`}
                                            render={({field: switchField}) => (
                                                <div className="flex items-center gap-2">
                                                    {switchField.value ? (
                                                        <EyeIcon className="size-3.5 text-muted-foreground"/>
                                                    ) : (
                                                        <EyeOffIcon className="size-3.5 text-muted-foreground"/>
                                                    )}
                                                    <Label className="text-xs text-muted-foreground cursor-pointer">
                                                        Sample Test
                                                    </Label>
                                                    <Switch
                                                        checked={switchField.value}
                                                        onCheckedChange={switchField.onChange}
                                                        disabled={isPending}
                                                        size="sm"
                                                    />
                                                </div>
                                            )}
                                        />
                                        {/* Remove button */}
                                        {fields.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => remove(index)}
                                                disabled={isPending}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2Icon className="size-4"/>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Input */}
                                    <Field>
                                        <FieldLabel className="text-xs">Input</FieldLabel>
                                        <Textarea
                                            rows={4}
                                            placeholder="Enter test input…"
                                            className="font-mono text-xs min-h-20"
                                            disabled={isPending}
                                            aria-invalid={!!errors.testCases?.[index]?.input}
                                            {...register(`testCases.${index}.input`)}
                                        />
                                        {errors.testCases?.[index]?.input && (
                                            <FieldError>
                                                {errors.testCases[index].input.message}
                                            </FieldError>
                                        )}
                                    </Field>

                                    {/* Output */}
                                    <Field>
                                        <FieldLabel className="text-xs">Expected Output</FieldLabel>
                                        <Textarea
                                            rows={4}
                                            placeholder="Enter expected output…"
                                            className="font-mono text-xs min-h-20"
                                            disabled={isPending}
                                            aria-invalid={!!errors.testCases?.[index]?.expectedOutput}
                                            {...register(`testCases.${index}.expectedOutput`)}
                                        />
                                        {errors.testCases?.[index]?.expectedOutput && (
                                            <FieldError>
                                                {errors.testCases[index].expectedOutput.message}
                                            </FieldError>
                                        )}
                                    </Field>
                                </div>

                                {/* Explanation */}
                                <Field>
                                    <FieldLabel className="text-xs">Explanation (Optional)</FieldLabel>
                                    <Textarea
                                        rows={2}
                                        placeholder="Explain the testcase..."
                                        className="text-xs min-h-12"
                                        disabled={isPending}
                                        aria-invalid={!!errors.testCases?.[index]?.explanation}
                                        {...register(`testCases.${index}.explanation`)}
                                    />
                                    {errors.testCases?.[index]?.explanation && (
                                        <FieldError>
                                            {errors.testCases[index].explanation.message}
                                        </FieldError>
                                    )}
                                </Field>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {errors.testCases?.root && (
                    <FieldError className="mt-2">
                        {errors.testCases.root.message}
                    </FieldError>
                )}
            </section>

            <Separator/>

            {/* ── Solutions Section ── */}
            <section>
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Author Solution</h3>
                    <p className="text-sm text-muted-foreground">
                        Provide the primary solution. This is used for verifying test case correctness.
                    </p>
                </div>

                <div className="space-y-4">
                    <Field className="max-w-[200px]">
                        <FieldLabel>Language</FieldLabel>
                        <Controller
                            control={control}
                            name="authorSolutionLanguage"
                            render={({field}) => (
                                <select
                                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={field.value}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    disabled={isPending}
                                >
                                    <option value="CPP">C++</option>
                                    <option value="JAVA">Java</option>
                                    <option value="PYTHON">Python</option>
                                </select>
                            )}
                        />
                    </Field>

                    <Controller
                        control={control}
                        name="authorSolutionCode"
                        render={({field}) => {
                            const selectedLanguage = control._formValues.authorSolutionLanguage;
                            const monacoLang = LANGUAGES.find(l => l.key.toUpperCase() === selectedLanguage)?.monacoLang || "cpp";
                            return (
                                <div className="rounded-xl border border-input overflow-hidden relative">
                                    <MonacoEditor
                                        height="400px"
                                        language={monacoLang}
                                        theme="vs-dark"
                                        value={field.value}
                                        onChange={(val) => field.onChange(val ?? "")}
                                        options={{
                                            minimap: {enabled: false},
                                            fontSize: 14,
                                            lineNumbers: "on",
                                            scrollBeyondLastLine: false,
                                            automaticLayout: true,
                                            tabSize: 4,
                                            wordWrap: "on",
                                            padding: {top: 12},
                                        }}
                                    />
                                </div>
                            );
                        }}
                    />

                    {errors.authorSolutionCode && (
                        <FieldError className="mt-2">
                            {errors.authorSolutionCode.message}
                        </FieldError>
                    )}
                </div>
            </section>

            {/* ── Actions ── */}
            <div className="flex justify-between pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onBack}
                    disabled={isPending}
                >
                    <ChevronLeftIcon/>
                    Back
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? (
                        <>
                            <Loader2Icon className="animate-spin"/>
                            Saving…
                        </>
                    ) : (
                        <>
                            Next: AI Context & Publish
                            <ChevronRightIcon/>
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}
