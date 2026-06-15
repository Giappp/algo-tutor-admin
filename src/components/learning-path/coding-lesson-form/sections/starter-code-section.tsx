"use client";

import {KeyboardEvent, useState} from "react";
import {Control, Controller, useWatch} from "react-hook-form";
import dynamic from "next/dynamic";
import {CheckIcon, CopyIcon, FileCode2Icon, RotateCcwIcon, TerminalSquareIcon} from "lucide-react";
import {toast} from "sonner";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {CodingLessonDTO} from "@/types/learning-path/schema";
import {
    DEFAULT_STARTER_CODE,
    LANGUAGE_CONFIG,
    STARTER_CODE_LANGUAGES,
    StarterCodeLanguage,
} from "../constants";

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="h-[320px] animate-pulse bg-muted/70"/>
        ),
    }
);

interface StarterCodeSectionProps {
    control: Control<CodingLessonDTO>;
    isPending?: boolean;
}

export function StarterCodeSection({control, isPending}: StarterCodeSectionProps) {
    const t = useTranslations("lessonForm");
    const [activeLang, setActiveLang] = useState<StarterCodeLanguage>("java");
    const [copied, setCopied] = useState(false);
    const starterCode = useWatch({control, name: "starterCode"});
    const activeConfig = LANGUAGE_CONFIG[activeLang];
    const activeCode = starterCode?.[activeLang] ?? DEFAULT_STARTER_CODE[activeLang];
    const lineCount = activeCode ? activeCode.split("\n").length : 0;

    const selectLanguageFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        let nextIndex = index;

        if (event.key === "ArrowLeft") nextIndex = index === 0 ? STARTER_CODE_LANGUAGES.length - 1 : index - 1;
        else if (event.key === "ArrowRight") nextIndex = index === STARTER_CODE_LANGUAGES.length - 1 ? 0 : index + 1;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = STARTER_CODE_LANGUAGES.length - 1;
        else return;

        event.preventDefault();
        const nextLanguage = STARTER_CODE_LANGUAGES[nextIndex];
        setActiveLang(nextLanguage);
        document.getElementById(`starter-code-tab-${nextLanguage}`)?.focus();
    };

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(activeCode);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
        } catch {
            toast.error(t("coding.starterCodeCopyFailed"));
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">{t("coding.starterCodeDescription")}</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">{t("coding.starterCodeHint")}</p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <span>{STARTER_CODE_LANGUAGES.length} {t("coding.languages")}</span>
                    <span className="size-1 rounded-full bg-border"/>
                    <span>{t("coding.autosavedWithLesson")}</span>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
                <div className="grid border-b border-border/40 bg-muted/20 sm:grid-cols-3" role="tablist" aria-label={t("coding.sections.starterCode")}>
                    {STARTER_CODE_LANGUAGES.map((lang, index) => {
                        const config = LANGUAGE_CONFIG[lang];
                        const isActive = activeLang === lang;
                        const code = starterCode?.[lang] ?? DEFAULT_STARTER_CODE[lang];
                        return (
                            <button
                                key={lang}
                                id={`starter-code-tab-${lang}`}
                                type="button"
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`starter-code-panel-${lang}`}
                                tabIndex={isActive ? 0 : -1}
                                onClick={() => setActiveLang(lang)}
                                onKeyDown={(event) => selectLanguageFromKeyboard(event, index)}
                                className={cn(
                                    "group relative flex items-center gap-3 border-b border-border/30 px-4 py-3.5 text-left transition-colors last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0",
                                    isActive ? "bg-background" : "hover:bg-muted/35"
                                )}
                            >
                                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl font-mono text-[10px] font-black ring-1 ring-inset ring-current/15", config.badgeBg, config.accentClass)}>
                                    {config.shortLabel}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className={cn("block text-xs font-semibold", isActive ? "text-foreground" : "text-foreground/75")}>
                                        {config.label}
                                    </span>
                                    <span className="mt-0.5 block truncate text-[10px] text-muted-foreground">
                                        {code.split("\n").length} {t("coding.lines")} · {config.runtime}
                                    </span>
                                </span>
                                <span className={cn("absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-primary transition-opacity", isActive ? "opacity-100" : "opacity-0")}/>
                            </button>
                        );
                    })}
                </div>

                <div className="flex flex-wrap items-center gap-3 border-b border-border/40 bg-background px-4 py-2.5">
                    <div className={cn("flex size-7 items-center justify-center rounded-lg", activeConfig.badgeBg, activeConfig.accentClass)}>
                        <FileCode2Icon className="size-3.5"/>
                    </div>
                    <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold">{activeConfig.fileName}</p>
                        <p className="text-[10px] text-muted-foreground">{activeConfig.description}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-1">
                        <span className="mr-2 hidden font-mono text-[10px] text-muted-foreground sm:inline">
                            {lineCount} {t("coding.lines")} · {activeCode.length} {t("coding.characters")}
                        </span>
                        <Button type="button" variant="ghost" size="sm" onClick={copyCode} disabled={isPending} className="h-8 rounded-lg text-xs">
                            {copied ? <CheckIcon data-icon="inline-start" className="text-emerald-500"/> : <CopyIcon data-icon="inline-start"/>}
                            {copied ? t("coding.copied") : t("coding.copy")}
                        </Button>
                    </div>
                </div>

                {STARTER_CODE_LANGUAGES.map((lang) => (
                    <div
                        key={lang}
                        id={`starter-code-panel-${lang}`}
                        role="tabpanel"
                        aria-labelledby={`starter-code-tab-${lang}`}
                        hidden={activeLang !== lang}
                        className={cn(activeLang === lang ? "block" : "hidden")}
                    >
                        <Controller
                            name={`starterCode.${lang}` as const}
                            control={control}
                            render={({field}) => (
                                <>
                                    <MonacoEditor
                                        height="340px"
                                        language={LANGUAGE_CONFIG[lang].monacoLanguage}
                                        value={field.value ?? DEFAULT_STARTER_CODE[lang]}
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
                                    <div className="flex items-center justify-between border-t border-white/10 bg-[#1e1e1e] px-4 py-2 text-[10px] text-zinc-400">
                                        <span className="inline-flex items-center gap-1.5">
                                            <TerminalSquareIcon className="size-3"/>
                                            {LANGUAGE_CONFIG[lang].runtime}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={isPending || field.value === DEFAULT_STARTER_CODE[lang]}
                                            onClick={() => field.onChange(DEFAULT_STARTER_CODE[lang])}
                                            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-white/10 hover:text-zinc-200 disabled:pointer-events-none disabled:opacity-40"
                                        >
                                            <RotateCcwIcon className="size-3"/>
                                            {t("coding.resetTemplate")}
                                        </button>
                                    </div>
                                </>
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
