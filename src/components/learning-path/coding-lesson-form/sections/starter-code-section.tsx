"use client";

import {useState} from "react";
import {Control, Controller} from "react-hook-form";
import dynamic from "next/dynamic";
import {Info} from "lucide-react";
import {cn} from "@/lib/utils";
import {CodingLessonDTO} from "@/types/learning-path/schema";
import {LANGUAGE_CONFIG} from "../constants";

const MonacoEditor = dynamic(
    () => import("@monaco-editor/react").then((mod) => mod.default),
    {
        ssr: false,
        loading: () => (
            <div className="h-40 rounded-xl border border-input bg-muted animate-pulse"/>
        ),
    }
);

interface StarterCodeSectionProps {
    control: Control<CodingLessonDTO>;
    isPending?: boolean;
}

export function StarterCodeSection({control, isPending}: StarterCodeSectionProps) {
    const [activeLang, setActiveLang] = useState<string>("java");

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-3.5 h-3.5 shrink-0"/>
                <span>
                    Initial code that students will build upon when starting the challenge.
                </span>
            </div>

            <div className="rounded-xl border border-input overflow-hidden">
                <div className="flex items-center gap-0 border-b border-input bg-muted/40">
                    {Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => setActiveLang(lang)}
                            className={cn(
                                "flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-all border-b-2 -mb-px",
                                activeLang === lang
                                    ? `${config.badgeClass} border-current bg-background/50`
                                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/60"
                            )}
                        >
                            {config.label}
                        </button>
                    ))}
                </div>
                {Object.entries(LANGUAGE_CONFIG).map(([lang, config]) => (
                    <div key={lang} className={cn(activeLang === lang ? "block" : "hidden")}>
                        <Controller
                            name={`starterCode.${lang}` as const}
                            control={control}
                            render={({field}) => (
                                <MonacoEditor
                                    height="280px"
                                    language={config.monacoLanguage}
                                    value={field.value}
                                    onChange={field.onChange}
                                    theme="vs-dark"
                                    options={{
                                        minimap: {enabled: false},
                                        fontSize: 13,
                                        lineNumbers: "on",
                                        scrollBeyondLastLine: false,
                                        automaticLayout: true,
                                        tabSize: 4,
                                        padding: {top: 12, bottom: 12},
                                        wordWrap: "on",
                                        renderLineHighlight: "all",
                                        bracketPairColorization: {enabled: true},
                                        readOnly: isPending,
                                    }}
                                />
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
