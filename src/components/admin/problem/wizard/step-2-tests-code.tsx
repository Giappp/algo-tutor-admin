"use client";

import {useCallback, useState} from "react";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useMutation} from "@tanstack/react-query";
import dynamic from "next/dynamic";
import "katex/dist/katex.min.css";

import {type Step2Data, step2Schema} from "@/schemas/problem-wizard.schema";
import {useProblemDraftStore} from "@/store/problem-wizard.store";
import {post} from "@/api/http";
import {toAppError} from "@/api/api-error";

import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Switch} from "@/components/ui/switch";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
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

// ── Lazy-load Monaco Editor ────────────────────────────────────
const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-100 rounded-xl border border-input bg-input/10">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground"/>
        </div>
    ),
});

// ── Language config ────────────────────────────────────────────
const LANGUAGES = [
    {key: "cpp" as const, label: "C++", monacoLang: "cpp"},
    {key: "python" as const, label: "Python", monacoLang: "python"},
    {key: "java" as const, label: "Java", monacoLang: "java"},
];

// ── Component ──────────────────────────────────────────────────
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
            testCases: [{input: "", output: "", isHidden: false, scoreWeight: 1}],
            solutions: {cpp: "", python: "", java: ""},
        },
    });

    const {fields, append, remove} = useFieldArray({
        control,
        name: "testCases",
    });

    // ── Mutations ──────────────────────────────────────────────
    const submitTestCases = useMutation({
        mutationFn: async (testCases: Step2Data["testCases"]) => {
            return post(`/api/v1/problems/${problemId}/test-cases`, {testCases});
        },
    });

    const submitSolutions = useMutation({
        mutationFn: async (solutions: Step2Data["solutions"]) => {
            return post(`/api/v1/problems/${problemId}/model-solution`, solutions);
        },
    });

    const isPending = submitTestCases.isPending || submitSolutions.isPending;

    const onSubmit = useCallback(
        async (data: Step2Data) => {
            try {
                setServerError(null);
                await Promise.all([
                    submitTestCases.mutateAsync(data.testCases),
                    submitSolutions.mutateAsync(data.solutions),
                ]);
                setStep2(data);
                onNext();
            } catch (error) {
                const appError = toAppError(error);
                setServerError(appError.message);
            }
        },
        [submitTestCases, submitSolutions, setStep2, onNext]
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
                            Add at least one test case. Hidden test cases are not visible to
                            students.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            append({input: "", output: "", isHidden: false, scoreWeight: 1})
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
                                        {/* Hidden toggle */}
                                        <Controller
                                            control={control}
                                            name={`testCases.${index}.isHidden`}
                                            render={({field: switchField}) => (
                                                <div className="flex items-center gap-2">
                                                    {switchField.value ? (
                                                        <EyeOffIcon className="size-3.5 text-muted-foreground"/>
                                                    ) : (
                                                        <EyeIcon className="size-3.5 text-muted-foreground"/>
                                                    )}
                                                    <Label className="text-xs text-muted-foreground cursor-pointer">
                                                        Hidden
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
                                            aria-invalid={!!errors.testCases?.[index]?.output}
                                            {...register(`testCases.${index}.output`)}
                                        />
                                        {errors.testCases?.[index]?.output && (
                                            <FieldError>
                                                {errors.testCases[index].output.message}
                                            </FieldError>
                                        )}
                                    </Field>
                                </div>

                                {/* Score weight */}
                                <Field className="max-w-50">
                                    <FieldLabel className="text-xs">Score Weight</FieldLabel>
                                    <Input
                                        type="number"
                                        min={0}
                                        step={1}
                                        disabled={isPending}
                                        aria-invalid={!!errors.testCases?.[index]?.scoreWeight}
                                        {...register(`testCases.${index}.scoreWeight`, {
                                            valueAsNumber: true,
                                        })}
                                    />
                                    {errors.testCases?.[index]?.scoreWeight && (
                                        <FieldError>
                                            {errors.testCases[index].scoreWeight.message}
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
                    <h3 className="text-lg font-semibold">Model Solutions</h3>
                    <p className="text-sm text-muted-foreground">
                        Provide at least one solution in any language. These are used for
                        verifying test case correctness.
                    </p>
                </div>

                <Tabs defaultValue="cpp">
                    <TabsList>
                        {LANGUAGES.map((lang) => (
                            <TabsTrigger key={lang.key} value={lang.key}>
                                {lang.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {LANGUAGES.map((lang) => (
                        <TabsContent key={lang.key} value={lang.key}>
                            <Controller
                                control={control}
                                name={`solutions.${lang.key}`}
                                render={({field}) => (
                                    <div className="rounded-xl border border-input overflow-hidden">
                                        <MonacoEditor
                                            height="400px"
                                            language={lang.monacoLang}
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
                                )}
                            />
                        </TabsContent>
                    ))}
                </Tabs>

                {errors.solutions && (
                    <FieldError className="mt-2">
                        {typeof errors.solutions === "object" && "message" in errors.solutions
                            ? (errors.solutions as { message: string }).message
                            : "Please provide at least one solution."}
                    </FieldError>
                )}
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
