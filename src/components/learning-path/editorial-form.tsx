"use client";

import {useEffect, useState} from "react";
import dynamic from "next/dynamic";
import {Controller, useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useTranslations} from "next-intl";
import {CheckIcon, CopyIcon, FileCode2Icon, RotateCcwIcon, TerminalSquareIcon} from "lucide-react";
import {toast} from "sonner";
import {Button} from "@/components/ui/button";
import {Field, FieldDescription, FieldError, FieldLabel} from "@/components/ui/field";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";
import {ProgrammingLanguage} from "@/types/learning-path";
import {CreateEditorialSchema, EditorialRequestDTO} from "@/types/learning-path/schema";

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => <Skeleton className="h-[420px] rounded-none"/>,
    }
);

interface EditorialFormProps {
    defaultValues?: Partial<EditorialRequestDTO>;
    onSubmit: (data: EditorialRequestDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    onCancel?: () => void;
}

const LANGUAGE_OPTIONS: Array<{
    value: ProgrammingLanguage;
    label: string;
    shortLabel: string;
    monacoLanguage: string;
    fileName: string;
    runtime: string;
}> = [
    {value: "JAVA", label: "Java", shortLabel: "JV", monacoLanguage: "java", fileName: "Solution.java", runtime: "OpenJDK"},
    {value: "PYTHON", label: "Python", shortLabel: "PY", monacoLanguage: "python", fileName: "solution.py", runtime: "Python 3"},
    {value: "CPP", label: "C++", shortLabel: "C+", monacoLanguage: "cpp", fileName: "solution.cpp", runtime: "GNU C++"},
];

const EMPTY_VALUES: EditorialRequestDTO = {
    language: "JAVA",
    sourceCode: "",
};

export function EditorialForm({
    defaultValues,
    onSubmit,
    isPending = false,
    submitLabel,
    onCancel,
}: EditorialFormProps) {
    const t = useTranslations("codingResources.editorials");
    const [copied, setCopied] = useState(false);
    const defaultLanguage = defaultValues?.language ?? EMPTY_VALUES.language;
    const defaultSourceCode = defaultValues?.sourceCode ?? EMPTY_VALUES.sourceCode;
    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: {errors, isDirty},
    } = useForm<EditorialRequestDTO>({
        resolver: zodResolver(CreateEditorialSchema),
        defaultValues: {language: defaultLanguage, sourceCode: defaultSourceCode},
    });

    useEffect(() => {
        reset({language: defaultLanguage, sourceCode: defaultSourceCode});
    }, [defaultLanguage, defaultSourceCode, reset]);

    const language = useWatch({control, name: "language"}) ?? "JAVA";
    const sourceCode = useWatch({control, name: "sourceCode"}) ?? "";
    const activeLanguage = LANGUAGE_OPTIONS.find((option) => option.value === language) ?? LANGUAGE_OPTIONS[0];
    const lineCount = sourceCode ? sourceCode.split("\n").length : 0;

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(sourceCode);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            toast.error(t("copyFailed"));
        }
    };

    const resetCode = () => {
        setValue("sourceCode", defaultSourceCode, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex min-h-0 flex-col gap-5">
            <Field data-invalid={!!errors.language}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <FieldLabel>{t("language")}</FieldLabel>
                        <FieldDescription>{t("languageDescription")}</FieldDescription>
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {isDirty ? t("unsavedChanges") : t("ready")}
                    </span>
                </div>

                <Controller
                    name="language"
                    control={control}
                    render={({field}) => (
                        <div className="grid overflow-hidden rounded-xl border border-border/60 bg-muted/15 sm:grid-cols-3" role="radiogroup" aria-label={t("language")}>
                            {LANGUAGE_OPTIONS.map((option) => {
                                const active = field.value === option.value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        role="radio"
                                        aria-checked={active}
                                        disabled={isPending}
                                        onClick={() => field.onChange(option.value)}
                                        className={cn(
                                            "relative flex items-center gap-3 border-b border-border/50 px-3 py-3 text-left transition-colors last:border-b-0 disabled:pointer-events-none disabled:opacity-50 sm:border-b-0 sm:border-r sm:last:border-r-0",
                                            active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:bg-card/65 hover:text-foreground"
                                        )}
                                    >
                                        <span className={cn(
                                            "flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-bold ring-1 ring-inset",
                                            active ? "bg-primary/10 text-primary ring-primary/15" : "bg-muted text-muted-foreground ring-border"
                                        )}>
                                            {option.shortLabel}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-xs font-semibold">{option.label}</span>
                                            <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">{option.runtime}</span>
                                        </span>
                                        <span className={cn("absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary transition-opacity", active ? "opacity-100" : "opacity-0")}/>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                />
                <FieldError errors={[errors.language]}/>
            </Field>

            <Field data-invalid={!!errors.sourceCode}>
                <div>
                    <FieldLabel>{t("sourceCode")}</FieldLabel>
                    <FieldDescription>{t("sourceCodeDescription")}</FieldDescription>
                </div>

                <div className={cn(
                    "overflow-hidden rounded-xl border bg-[#1e1e1e] shadow-sm transition-colors",
                    errors.sourceCode ? "border-destructive/60 ring-2 ring-destructive/10" : "border-border/70"
                )}>
                    <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-card px-3 py-2.5 text-foreground">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary ring-1 ring-primary/10">
                            <FileCode2Icon className="size-4"/>
                        </div>
                        <div className="min-w-0">
                            <p className="font-mono text-xs font-semibold">{activeLanguage.fileName}</p>
                            <p className="text-[10px] text-muted-foreground">{activeLanguage.runtime}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                            <span className="mr-2 hidden font-mono text-[10px] text-muted-foreground sm:inline">
                                {t("lines", {count: lineCount})} · {t("characters", {count: sourceCode.length})}
                            </span>
                            <Button type="button" variant="ghost" size="sm" onClick={copyCode} disabled={!sourceCode || isPending} className="h-8 text-xs">
                                {copied ? <CheckIcon data-icon="inline-start" className="text-emerald-500"/> : <CopyIcon data-icon="inline-start"/>}
                                {copied ? t("copied") : t("copy")}
                            </Button>
                            <Button type="button" variant="ghost" size="icon-sm" onClick={resetCode} disabled={isPending || sourceCode === defaultSourceCode} title={t("resetCode")}>
                                <RotateCcwIcon/>
                            </Button>
                        </div>
                    </div>

                    <Controller
                        name="sourceCode"
                        control={control}
                        render={({field}) => (
                            <MonacoEditor
                                height="420px"
                                language={activeLanguage.monacoLanguage}
                                value={field.value ?? ""}
                                onChange={(value) => field.onChange(value ?? "")}
                                theme="vs-dark"
                                options={{
                                    minimap: {enabled: false},
                                    fontSize: 13,
                                    lineHeight: 21,
                                    lineNumbers: "on",
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                    padding: {top: 14, bottom: 14},
                                    wordWrap: "on",
                                    renderLineHighlight: "all",
                                    bracketPairColorization: {enabled: true},
                                    guides: {bracketPairs: true, indentation: true},
                                    readOnly: isPending,
                                    smoothScrolling: true,
                                }}
                            />
                        )}
                    />

                    <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 font-mono text-[10px] text-zinc-400">
                        <span className="inline-flex items-center gap-1.5"><TerminalSquareIcon className="size-3"/>{activeLanguage.runtime}</span>
                        <span>{activeLanguage.monacoLanguage}</span>
                    </div>
                </div>
                <FieldError errors={[errors.sourceCode]}/>
            </Field>

            <div className="flex flex-col-reverse gap-2 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-end">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
                        {t("cancel")}
                    </Button>
                )}
                <Button type="submit" disabled={isPending || !sourceCode.trim()}>
                    {isPending ? t("saving") : submitLabel ?? t("saveChanges")}
                </Button>
            </div>
        </form>
    );
}
