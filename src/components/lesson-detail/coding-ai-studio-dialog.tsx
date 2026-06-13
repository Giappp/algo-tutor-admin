"use client";

import {useState} from "react";
import {useTranslations} from "next-intl";
import {AlertCircle, Check, Code2, FileCode2, FileText, Loader2, RefreshCw, Sparkles} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";
import {MarkdownDisplay} from "@/components/ui/markdown-display";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Skeleton} from "@/components/ui/skeleton";
import {Textarea} from "@/components/ui/textarea";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {
    useCodingAiSources,
    useGenerateCodingEditorial,
    useGenerateCodingProblem,
    useGenerateStarterCode,
} from "@/hooks/use-admin-ai-coding";
import {cn} from "@/lib/utils";
import type {AiProvider} from "@/types/admin-ai-lesson";
import type {CodingAiAsset, CodingEditorialDraft, CodingProblemDraft, StarterCodeDraft} from "@/types/admin-ai-coding";
import type {Difficulty, ProgrammingLanguage} from "@/types/learning-path";

type CodingDraft =
    | {asset: "PROBLEM"; content: CodingProblemDraft}
    | {asset: "EDITORIAL"; content: CodingEditorialDraft}
    | {asset: "STARTER_CODE"; content: StarterCodeDraft};

interface CodingAiStudioDialogProps {
    lessonId: number;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApplyProblem: (draft: CodingProblemDraft) => void;
    onApplyStarterCode: (draft: StarterCodeDraft) => void;
    onApplyEditorial: (draft: CodingEditorialDraft) => Promise<void>;
}

const ASSETS: Array<{value: CodingAiAsset; icon: typeof FileText}> = [
    {value: "PROBLEM", icon: FileText},
    {value: "EDITORIAL", icon: FileCode2},
    {value: "STARTER_CODE", icon: Code2},
];
const PROVIDERS: Array<AiProvider | "DEFAULT"> = ["DEFAULT", "GEMINI", "OPENAI", "CLAUDE"];
const LANGUAGES: ProgrammingLanguage[] = ["JAVA", "PYTHON", "CPP"];

export function CodingAiStudioDialog({
    lessonId, open, onOpenChange, onApplyProblem, onApplyStarterCode, onApplyEditorial,
}: CodingAiStudioDialogProps) {
    const t = useTranslations("lessonForm.codingAi");
    const [asset, setAsset] = useState<CodingAiAsset>("PROBLEM");
    const [sourceIds, setSourceIds] = useState<number[]>([]);
    const [provider, setProvider] = useState<AiProvider | "DEFAULT">("DEFAULT");
    const [prompt, setPrompt] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
    const [exampleCount, setExampleCount] = useState(2);
    const [hintCount, setHintCount] = useState(3);
    const [editorialLanguage, setEditorialLanguage] = useState<ProgrammingLanguage>("JAVA");
    const [starterLanguages, setStarterLanguages] = useState<ProgrammingLanguage[]>(LANGUAGES);
    const [draft, setDraft] = useState<CodingDraft | null>(null);
    const [applying, setApplying] = useState(false);
    const sources = useCodingAiSources(lessonId, open);
    const problemMutation = useGenerateCodingProblem(lessonId);
    const editorialMutation = useGenerateCodingEditorial(lessonId);
    const starterMutation = useGenerateStarterCode(lessonId);
    const activeMutation = asset === "PROBLEM" ? problemMutation : asset === "EDITORIAL" ? editorialMutation : starterMutation;

    const commonRequest = {sourceLessonIds: sourceIds, provider: provider === "DEFAULT" ? null : provider, prompt: prompt.trim()};

    const generate = async () => {
        if (asset === "PROBLEM") {
            const response = await problemMutation.mutateAsync({...commonRequest, difficulty, exampleCount, hintCount});
            setDraft({asset, content: response.content});
        } else if (asset === "EDITORIAL") {
            const response = await editorialMutation.mutateAsync({...commonRequest, language: editorialLanguage});
            setDraft({asset, content: response.content});
        } else {
            const response = await starterMutation.mutateAsync({...commonRequest, languages: starterLanguages});
            setDraft({asset, content: response.content});
        }
    };

    const apply = async () => {
        if (!draft) return;
        setApplying(true);
        try {
            if (draft.asset === "PROBLEM") onApplyProblem(draft.content);
            if (draft.asset === "STARTER_CODE") onApplyStarterCode(draft.content);
            if (draft.asset === "EDITORIAL") await onApplyEditorial(draft.content);
            setDraft(null);
            onOpenChange(false);
        } finally {
            setApplying(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => !activeMutation.isPending && !applying && onOpenChange(next)}>
            <DialogContent className="flex max-h-[94dvh] w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:w-[calc(100vw-2rem)] sm:max-w-6xl">
                <DialogHeader className="border-b border-border/70 bg-muted/20 px-5 py-4 pr-14 text-left sm:px-6">
                    <DialogTitle className="flex items-center gap-2 text-lg"><Sparkles className="text-primary"/>{t("title")}</DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-5">
                    {draft ? (
                        <DraftReview draft={draft}/>
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-[minmax(280px,.75fr)_minmax(0,1.25fr)]">
                            <Card className="gap-0 py-0">
                                <CardHeader className="border-b border-border/70 py-4">
                                    <CardTitle>{t("sources.title")}</CardTitle>
                                    <CardDescription>{t("sources.description")}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-2 p-3">
                                    {sources.isLoading && [1, 2, 3].map((item) => <Skeleton key={item} className="h-20"/>)}
                                    {sources.isError && <div className="flex flex-col items-center gap-3 p-6 text-center"><AlertCircle className="text-destructive"/><p className="text-sm font-semibold">{t("sources.error")}</p><Button variant="outline" size="sm" onClick={() => sources.refetch()}><RefreshCw data-icon="inline-start"/>{t("sources.retry")}</Button></div>}
                                    {!sources.isLoading && !sources.isError && (sources.data?.length ?? 0) === 0 && <p className="p-6 text-center text-sm text-muted-foreground">{t("sources.empty")}</p>}
                                    {sources.data?.map((source) => {
                                        const checked = sourceIds.includes(source.lessonId);
                                        return (
                                            <label key={source.lessonId} className={cn("flex cursor-pointer gap-3 rounded-xl p-3 ring-1", checked ? "bg-primary/6 ring-primary/25" : "ring-border/60")}>
                                                <Checkbox checked={checked} onCheckedChange={() => setSourceIds((current) => checked ? current.filter((id) => id !== source.lessonId) : [...current, source.lessonId])}/>
                                                <span className="min-w-0"><span className="block text-sm font-semibold">{source.title}</span><span className="mt-1 block text-xs text-muted-foreground">{source.topicName}</span></span>
                                            </label>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            <Card className="gap-0 py-0">
                                <CardHeader className="border-b border-border/70 py-4">
                                    <CardTitle>{t("brief.title")}</CardTitle>
                                    <CardDescription>{t("brief.description")}</CardDescription>
                                </CardHeader>
                                <CardContent className="p-4">
                                    <FieldGroup className="gap-5">
                                        <Field>
                                            <FieldLabel>{t("asset.label")}</FieldLabel>
                                            <div className="grid gap-2 sm:grid-cols-3">
                                                {ASSETS.map(({value, icon: Icon}) => (
                                                    <button key={value} type="button" onClick={() => setAsset(value)} className={cn("rounded-xl p-3 text-left ring-1 transition-colors", asset === value ? "bg-primary/7 ring-primary/30" : "ring-border/60 hover:bg-muted/40")}>
                                                        <Icon className="mb-2 text-primary"/><span className="block text-sm font-semibold">{t(`asset.${value}.label`)}</span><span className="mt-1 block text-xs text-muted-foreground">{t(`asset.${value}.description`)}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </Field>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <Field><FieldLabel>{t("provider")}</FieldLabel><Select value={provider} onValueChange={(value) => setProvider(value as AiProvider | "DEFAULT")}><SelectTrigger className="w-full"><SelectValue/></SelectTrigger><SelectContent><SelectGroup>{PROVIDERS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
                                            {asset === "PROBLEM" && <Field><FieldLabel>{t("difficulty")}</FieldLabel><ToggleGroup value={[difficulty]} onValueChange={(value) => value[0] && setDifficulty(value[0] as Difficulty)} variant="outline" className="w-full">{(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((item) => <ToggleGroupItem key={item} value={item} className="flex-1">{t(`difficultyValue.${item}`)}</ToggleGroupItem>)}</ToggleGroup></Field>}
                                            {asset === "EDITORIAL" && <LanguageField value={[editorialLanguage]} onChange={(values) => values[0] && setEditorialLanguage(values[0])}/>}
                                            {asset === "STARTER_CODE" && <LanguageField value={starterLanguages} onChange={setStarterLanguages}/>}
                                        </div>
                                        {asset === "PROBLEM" && <div className="grid gap-4 sm:grid-cols-2"><NumberField label={t("exampleCount")} value={exampleCount} values={[1, 2, 3, 4]} onChange={setExampleCount}/><NumberField label={t("hintCount")} value={hintCount} values={[0, 1, 2, 3]} onChange={setHintCount}/></div>}
                                        <Field><FieldLabel htmlFor="coding-ai-prompt">{t("prompt")}</FieldLabel><Textarea id="coding-ai-prompt" rows={6} maxLength={3000} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder={t(`asset.${asset}.prompt`)}/><FieldDescription>{t("promptHint")}</FieldDescription></Field>
                                        {activeMutation.error && <div role="alert" className="rounded-xl bg-destructive/5 p-3 text-sm text-destructive ring-1 ring-destructive/20">{activeMutation.error.message}</div>}
                                    </FieldGroup>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col-reverse gap-2 border-t border-border/70 px-4 py-3 sm:flex-row sm:justify-between sm:px-6">
                    {draft ? <><Button variant="outline" onClick={() => setDraft(null)}>{t("actions.back")}</Button><Button onClick={apply} disabled={applying}>{applying && <Loader2 data-icon="inline-start" className="animate-spin"/>}{t("actions.apply")}</Button></> : <><Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button><Button variant="ai" onClick={generate} disabled={activeMutation.isPending || (asset === "STARTER_CODE" && starterLanguages.length === 0)}>{activeMutation.isPending ? <Loader2 data-icon="inline-start" className="animate-spin"/> : <Sparkles data-icon="inline-start"/>}{activeMutation.isPending ? t("actions.generating") : t("actions.generate")}</Button></>}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function LanguageField({value, onChange}: {value: ProgrammingLanguage[]; onChange: (value: ProgrammingLanguage[]) => void}) {
    const t = useTranslations("lessonForm.codingAi");
    return <Field><FieldLabel>{t("languages")}</FieldLabel><ToggleGroup value={value} onValueChange={(next) => onChange(next as ProgrammingLanguage[])} variant="outline" className="w-full">{LANGUAGES.map((item) => <ToggleGroupItem key={item} value={item} className="flex-1">{item}</ToggleGroupItem>)}</ToggleGroup></Field>;
}

function NumberField({label, value, values, onChange}: {label: string; value: number; values: number[]; onChange: (value: number) => void}) {
    return <Field><FieldLabel>{label}</FieldLabel><ToggleGroup value={[String(value)]} onValueChange={(next) => next[0] && onChange(Number(next[0]))} variant="outline" className="w-full">{values.map((item) => <ToggleGroupItem key={item} value={String(item)} className="flex-1">{item}</ToggleGroupItem>)}</ToggleGroup></Field>;
}

function DraftReview({draft}: {draft: CodingDraft}) {
    const t = useTranslations("lessonForm.codingAi");
    if (draft.asset === "PROBLEM") return <div className="mx-auto max-w-4xl"><h3 className="mb-4 text-lg font-semibold">{t("review.problem")}</h3><Card><CardContent><MarkdownDisplay content={draft.content.statement}/><ReviewList title={t("review.constraints")} items={draft.content.constraints}/><ReviewList title={t("review.hints")} items={draft.content.hints}/><div className="mt-5 grid gap-3 sm:grid-cols-2">{draft.content.examples.map((item, index) => <div key={index} className="rounded-xl bg-muted/40 p-3 text-xs ring-1 ring-border/60"><b>{t("review.example", {number: index + 1})}</b><p className="mt-2 whitespace-pre-wrap">{item.input}</p><p className="mt-2 whitespace-pre-wrap text-muted-foreground">{item.output}</p></div>)}</div></CardContent></Card></div>;
    if (draft.asset === "EDITORIAL") return <div className="mx-auto max-w-4xl"><h3 className="mb-4 text-lg font-semibold">{t("review.editorial")}</h3><div className="mb-3 flex gap-2"><Badge>{draft.content.language}</Badge><Badge variant="outline">{draft.content.timeComplexity}</Badge><Badge variant="outline">{draft.content.spaceComplexity}</Badge></div><p className="mb-4 text-sm text-muted-foreground">{draft.content.approachSummary}</p><CodePreview code={draft.content.sourceCode}/></div>;
    return <div className="mx-auto max-w-4xl"><h3 className="mb-4 text-lg font-semibold">{t("review.starter")}</h3><p className="mb-4 text-sm text-muted-foreground">{draft.content.signatureSummary}</p><div className="flex flex-col gap-4">{Object.entries(draft.content.starterCode).map(([language, code]) => <div key={language}><Badge className="mb-2">{language}</Badge><CodePreview code={code}/></div>)}</div></div>;
}

function ReviewList({title, items}: {title: string; items: string[]}) {
    return <div className="mt-5"><h4 className="mb-2 text-sm font-semibold">{title}</h4><ul className="flex flex-col gap-2">{items.map((item, index) => <li key={index} className="flex gap-2 rounded-lg bg-muted/40 p-2.5 text-sm"><Check className="shrink-0 text-primary"/>{item}</li>)}</ul></div>;
}

function CodePreview({code}: {code: string}) {
    return <pre className="max-h-[480px] overflow-auto rounded-xl bg-[#1e1e1e] p-4 font-mono text-xs leading-relaxed text-zinc-100">{code}</pre>;
}
