"use client";

import {useMemo, useState} from "react";
import {useTranslations} from "next-intl";
import {
    AlertCircle,
    BookOpen,
    Check,
    ChevronLeft,
    FileText,
    Loader2,
    PlusCircle,
    RefreshCw,
    Search,
    Sparkles,
} from "lucide-react";
import {toast} from "sonner";

import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Checkbox} from "@/components/ui/checkbox";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Field, FieldDescription, FieldGroup, FieldLabel} from "@/components/ui/field";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Skeleton} from "@/components/ui/skeleton";
import {Switch} from "@/components/ui/switch";
import {Textarea} from "@/components/ui/textarea";
import {ToggleGroup, ToggleGroupItem} from "@/components/ui/toggle-group";
import {useAiQuestionSources, useGenerateQuestionsFromSources} from "@/hooks/use-admin-ai-question";
import {cn} from "@/lib/utils";
import type {AiProvider} from "@/types/admin-ai-lesson";
import type {AiQuestionSource} from "@/types/admin-ai-question";
import type {Difficulty, QuestionType} from "@/types/learning-path";
import type {QuestionRequestDTO} from "@/types/learning-path/schema";

interface AIQuestionGeneratorDialogProps {
    open: boolean;
    lessonId: number;
    onOpenChange: (open: boolean) => void;
    onAddQuestions: (questions: QuestionRequestDTO[]) => Promise<void>;
    isPending: boolean;
}

type SupportedQuestionType = Extract<QuestionType, "SINGLE_CHOICE" | "MULTIPLE_CHOICE">;
type GeneratedQuestion = QuestionRequestDTO & {selected: boolean};

const PROVIDERS: Array<{value: AiProvider | "DEFAULT"; label: string}> = [
    {value: "DEFAULT", label: "Default"},
    {value: "GEMINI", label: "Gemini"},
    {value: "OPENAI", label: "OpenAI"},
    {value: "CLAUDE", label: "Claude"},
];

export function AIQuestionGeneratorDialog({
    open,
    lessonId,
    onOpenChange,
    onAddQuestions,
    isPending,
}: AIQuestionGeneratorDialogProps) {
    const t = useTranslations("lessonForm.questions.aiGenerator");
    const [selectedSourceIds, setSelectedSourceIds] = useState<number[]>([]);
    const [search, setSearch] = useState("");
    const [prompt, setPrompt] = useState("");
    const [provider, setProvider] = useState<AiProvider | "DEFAULT">("DEFAULT");
    const [difficulty, setDifficulty] = useState<Difficulty>("MEDIUM");
    const [questionTypes, setQuestionTypes] = useState<SupportedQuestionType[]>(["SINGLE_CHOICE"]);
    const [count, setCount] = useState(5);
    const [choicesPerQuestion, setChoicesPerQuestion] = useState(4);
    const [includeExplanations, setIncludeExplanations] = useState(true);
    const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
    const sourcesQuery = useAiQuestionSources(lessonId, open);
    const generateMutation = useGenerateQuestionsFromSources(lessonId);
    const isReviewing = generatedQuestions.length > 0;
    const selectedQuestionCount = generatedQuestions.filter((question) => question.selected).length;

    const filteredSources = useMemo(() => {
        const term = search.trim().toLocaleLowerCase();
        if (!term) return sourcesQuery.data ?? [];
        return (sourcesQuery.data ?? []).filter((source) =>
            `${source.title} ${source.topicName}`.toLocaleLowerCase().includes(term),
        );
    }, [search, sourcesQuery.data]);

    const selectedSources = (sourcesQuery.data ?? []).filter((source) => selectedSourceIds.includes(source.lessonId));

    const toggleSource = (lessonIdToToggle: number) => {
        setSelectedSourceIds((current) =>
            current.includes(lessonIdToToggle)
                ? current.filter((id) => id !== lessonIdToToggle)
                : [...current, lessonIdToToggle],
        );
    };

    const handleGenerate = async () => {
        if (selectedSourceIds.length === 0) {
            toast.error(t("validation.sourceRequired"));
            return;
        }
        if (questionTypes.length === 0) {
            toast.error(t("validation.typeRequired"));
            return;
        }

        try {
            const response = await generateMutation.mutateAsync({
                sourceLessonIds: selectedSourceIds,
                prompt: prompt.trim(),
                provider: provider === "DEFAULT" ? null : provider,
                difficulty,
                questionTypes,
                count,
                choicesPerQuestion,
                includeExplanations,
            });
            setGeneratedQuestions(response.questions.map((question) => ({...question, selected: true})));
        } catch {
            // The mutation error stays visible so the admin can adjust the request and retry.
        }
    };

    const handleAdd = async () => {
        const questions = generatedQuestions
            .filter((question) => question.selected)
            .map((question) => ({
                question: question.question,
                type: question.type,
                points: question.points,
                orderIndex: question.orderIndex,
                explanation: question.explanation,
                choices: question.choices,
            }));
        if (questions.length === 0) {
            toast.error(t("validation.questionRequired"));
            return;
        }
        await onAddQuestions(questions);
        reset();
        onOpenChange(false);
    };

    const reset = () => {
        setGeneratedQuestions([]);
        generateMutation.reset();
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => {
            if (!generateMutation.isPending && !isPending) onOpenChange(nextOpen);
        }}>
            <DialogContent className="flex max-h-[94dvh] w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:w-[calc(100vw-2rem)] sm:max-w-6xl">
                <DialogHeader className="border-b border-border/70 bg-muted/20 px-5 py-4 pr-14 text-left sm:px-6 sm:py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <Sparkles />
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">{t("title")}</DialogTitle>
                            <DialogDescription className="mt-1 max-w-3xl leading-relaxed">{t("description")}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto bg-muted/10 p-3 sm:p-5">
                    {isReviewing ? (
                        <QuestionReview
                            questions={generatedQuestions}
                            onToggle={(index) => setGeneratedQuestions((current) =>
                                current.map((question, currentIndex) =>
                                    currentIndex === index ? {...question, selected: !question.selected} : question,
                                ),
                            )}
                        />
                    ) : (
                        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(340px,0.9fr)]">
                            <SourceSelector
                                sources={filteredSources}
                                selectedSourceIds={selectedSourceIds}
                                search={search}
                                onSearchChange={setSearch}
                                onToggle={toggleSource}
                                isLoading={sourcesQuery.isLoading}
                                error={sourcesQuery.error}
                                onRetry={() => sourcesQuery.refetch()}
                            />
                            <GenerationBrief
                                selectedSources={selectedSources}
                                prompt={prompt}
                                onPromptChange={setPrompt}
                                provider={provider}
                                onProviderChange={setProvider}
                                difficulty={difficulty}
                                onDifficultyChange={setDifficulty}
                                questionTypes={questionTypes}
                                onQuestionTypesChange={setQuestionTypes}
                                count={count}
                                onCountChange={setCount}
                                choicesPerQuestion={choicesPerQuestion}
                                onChoicesPerQuestionChange={setChoicesPerQuestion}
                                includeExplanations={includeExplanations}
                                onIncludeExplanationsChange={setIncludeExplanations}
                                error={generateMutation.error}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col-reverse items-stretch justify-between gap-2 border-t border-border/70 bg-background px-4 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
                    {isReviewing ? (
                        <>
                            <Button variant="outline" onClick={reset} disabled={isPending}>
                                <ChevronLeft data-icon="inline-start" />
                                {t("actions.backToBrief")}
                            </Button>
                            <Button onClick={handleAdd} disabled={isPending || selectedQuestionCount === 0}>
                                {isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <PlusCircle data-icon="inline-start" />}
                                {isPending ? t("actions.adding") : t("actions.addSelected", {count: selectedQuestionCount})}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>{t("actions.cancel")}</Button>
                            <Button variant="ai" onClick={handleGenerate} disabled={generateMutation.isPending || selectedSourceIds.length === 0}>
                                {generateMutation.isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : <Sparkles data-icon="inline-start" />}
                                {generateMutation.isPending ? t("actions.generating") : t("actions.generate", {count})}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SourceSelector({
    sources,
    selectedSourceIds,
    search,
    onSearchChange,
    onToggle,
    isLoading,
    error,
    onRetry,
}: {
    sources: AiQuestionSource[];
    selectedSourceIds: number[];
    search: string;
    onSearchChange: (value: string) => void;
    onToggle: (lessonId: number) => void;
    isLoading: boolean;
    error: Error | null;
    onRetry: () => void;
}) {
    const t = useTranslations("lessonForm.questions.aiGenerator");

    return (
        <Card className="min-h-[520px] gap-0 py-0">
            <CardHeader className="border-b border-border/70 py-4">
                <CardTitle className="flex items-center gap-2"><BookOpen />{t("sources.title")}</CardTitle>
                <CardDescription>{t("sources.description")}</CardDescription>
                <div className="relative mt-2">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder={t("sources.search")} className="pl-9" />
                </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-3 sm:p-4">
                {isLoading && [1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-24" />)}
                {error && (
                    <div role="alert" className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
                        <AlertCircle className="text-destructive" />
                        <div>
                            <p className="text-sm font-semibold">{t("sources.errorTitle")}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{error.message}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={onRetry}><RefreshCw data-icon="inline-start" />{t("sources.retry")}</Button>
                    </div>
                )}
                {!isLoading && !error && sources.length === 0 && (
                    <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-center">
                        <FileText className="text-muted-foreground" />
                        <p className="text-sm font-semibold">{t("sources.emptyTitle")}</p>
                        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">{t("sources.emptyDescription")}</p>
                    </div>
                )}
                {sources.map((source) => {
                    const selected = selectedSourceIds.includes(source.lessonId);
                    return (
                        <label
                            key={source.lessonId}
                            className={cn(
                                "flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 text-left ring-1 transition-all",
                                selected ? "bg-primary/6 ring-primary/25" : "bg-background ring-border/60 hover:ring-primary/20",
                            )}
                        >
                            <Checkbox checked={selected} onCheckedChange={() => onToggle(source.lessonId)} aria-label={t("sources.select", {title: source.title})} className="mt-0.5" />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                    <p className="text-sm font-semibold">{source.title}</p>
                                    {!source.isPublished && <Badge variant="outline">{t("sources.draft")}</Badge>}
                                </div>
                                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{source.contentPreview}</p>
                                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                    <span>{source.topicName}</span>
                                    <span>·</span>
                                    <span>{t("sources.characters", {count: source.contentCharacterCount})}</span>
                                    {source.estimatedMinutes && <><span>·</span><span>{t("sources.minutes", {count: source.estimatedMinutes})}</span></>}
                                </div>
                            </div>
                        </label>
                    );
                })}
            </CardContent>
        </Card>
    );
}

function GenerationBrief({
    selectedSources, prompt, onPromptChange, provider, onProviderChange, difficulty, onDifficultyChange,
    questionTypes, onQuestionTypesChange, count, onCountChange, choicesPerQuestion, onChoicesPerQuestionChange,
    includeExplanations, onIncludeExplanationsChange, error,
}: {
    selectedSources: AiQuestionSource[];
    prompt: string;
    onPromptChange: (value: string) => void;
    provider: AiProvider | "DEFAULT";
    onProviderChange: (value: AiProvider | "DEFAULT") => void;
    difficulty: Difficulty;
    onDifficultyChange: (value: Difficulty) => void;
    questionTypes: SupportedQuestionType[];
    onQuestionTypesChange: (value: SupportedQuestionType[]) => void;
    count: number;
    onCountChange: (value: number) => void;
    choicesPerQuestion: number;
    onChoicesPerQuestionChange: (value: number) => void;
    includeExplanations: boolean;
    onIncludeExplanationsChange: (value: boolean) => void;
    error: Error | null;
}) {
    const t = useTranslations("lessonForm.questions.aiGenerator");
    return (
        <Card className="gap-0 py-0">
            <CardHeader className="border-b border-border/70 py-4">
                <CardTitle className="flex items-center gap-2"><Sparkles />{t("brief.title")}</CardTitle>
                <CardDescription>{t("brief.description")}</CardDescription>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {selectedSources.length === 0
                        ? <span className="text-xs text-muted-foreground">{t("brief.noSources")}</span>
                        : selectedSources.map((source) => <Badge key={source.lessonId} variant="secondary">{source.title}</Badge>)}
                </div>
            </CardHeader>
            <CardContent className="p-4">
                <FieldGroup className="gap-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel>{t("brief.provider")}</FieldLabel>
                            <Select value={provider} onValueChange={(value) => onProviderChange(value as AiProvider | "DEFAULT")}>
                                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectGroup>{PROVIDERS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel>{t("brief.difficulty")}</FieldLabel>
                            <ToggleGroup value={[difficulty]} onValueChange={(value) => value[0] && onDifficultyChange(value[0] as Difficulty)} variant="outline" className="w-full">
                                {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((item) => <ToggleGroupItem key={item} value={item} className="flex-1">{t(`difficulty.${item}`)}</ToggleGroupItem>)}
                            </ToggleGroup>
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel>{t("brief.questionTypes")}</FieldLabel>
                        <ToggleGroup value={questionTypes} onValueChange={(value) => onQuestionTypesChange(value as SupportedQuestionType[])} variant="outline" className="w-full">
                            <ToggleGroupItem value="SINGLE_CHOICE" className="flex-1">{t("types.SINGLE_CHOICE")}</ToggleGroupItem>
                            <ToggleGroupItem value="MULTIPLE_CHOICE" className="flex-1">{t("types.MULTIPLE_CHOICE")}</ToggleGroupItem>
                        </ToggleGroup>
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel>{t("brief.count")}</FieldLabel>
                            <ToggleGroup value={[String(count)]} onValueChange={(value) => value[0] && onCountChange(Number(value[0]))} variant="outline" className="w-full">
                                {[3, 5, 8, 10].map((item) => <ToggleGroupItem key={item} value={String(item)} className="flex-1">{item}</ToggleGroupItem>)}
                            </ToggleGroup>
                        </Field>
                        <Field>
                            <FieldLabel>{t("brief.choices")}</FieldLabel>
                            <ToggleGroup value={[String(choicesPerQuestion)]} onValueChange={(value) => value[0] && onChoicesPerQuestionChange(Number(value[0]))} variant="outline" className="w-full">
                                {[2, 3, 4, 5].map((item) => <ToggleGroupItem key={item} value={String(item)} className="flex-1">{item}</ToggleGroupItem>)}
                            </ToggleGroup>
                        </Field>
                    </div>
                    <Field>
                        <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/40 p-3">
                            <div>
                                <FieldLabel>{t("brief.explanations")}</FieldLabel>
                                <FieldDescription>{t("brief.explanationsDescription")}</FieldDescription>
                            </div>
                            <Switch checked={includeExplanations} onCheckedChange={onIncludeExplanationsChange} />
                        </div>
                    </Field>
                    <Field>
                        <div className="flex items-center justify-between gap-3">
                            <FieldLabel htmlFor="ai-question-prompt">{t("brief.prompt")}</FieldLabel>
                            <span className="font-mono text-[11px] text-muted-foreground">{prompt.length.toLocaleString()} / 2,000</span>
                        </div>
                        <Textarea id="ai-question-prompt" value={prompt} onChange={(event) => onPromptChange(event.target.value)} maxLength={2000} rows={6} placeholder={t("brief.promptPlaceholder")} />
                        <FieldDescription>{t("brief.promptHint")}</FieldDescription>
                    </Field>
                    {error && (
                        <div role="alert" className="flex gap-2 rounded-xl bg-destructive/5 p-3 text-sm text-destructive ring-1 ring-destructive/20">
                            <AlertCircle className="mt-0.5 shrink-0" />
                            <span>{error.message}</span>
                        </div>
                    )}
                </FieldGroup>
            </CardContent>
        </Card>
    );
}

function QuestionReview({questions, onToggle}: {questions: GeneratedQuestion[]; onToggle: (index: number) => void}) {
    const t = useTranslations("lessonForm.questions.aiGenerator");
    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-3">
            <div className="mb-1 flex flex-col gap-1">
                <h3 className="font-heading text-lg font-semibold">{t("review.title")}</h3>
                <p className="text-sm text-muted-foreground">{t("review.description", {count: questions.length})}</p>
            </div>
            {questions.map((question, index) => (
                <Card key={index} size="sm" className={cn("transition-opacity", !question.selected && "opacity-55")}>
                    <CardHeader className="grid-cols-[auto_1fr]">
                        <Checkbox checked={question.selected} onCheckedChange={() => onToggle(index)} aria-label={t("review.select", {number: index + 1})} className="mt-1" />
                        <div>
                            <CardTitle className="text-sm leading-relaxed">{question.question}</CardTitle>
                            <CardDescription className="mt-2 flex flex-wrap gap-1.5">
                                <Badge variant="secondary">{t(`types.${question.type}`)}</Badge>
                                <Badge variant="outline">{t("review.points", {count: question.points ?? 1})}</Badge>
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-2 sm:grid-cols-2">
                        {question.choices.map((choice, choiceIndex) => (
                            <div key={choiceIndex} className={cn("flex items-start gap-2 rounded-lg p-2.5 text-xs ring-1", choice.isCorrect ? "bg-primary/6 ring-primary/20" : "bg-muted/30 ring-border/50")}>
                                <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full", choice.isCorrect ? "bg-primary text-primary-foreground" : "bg-background ring-1 ring-border")}>{choice.isCorrect && <Check />}</span>
                                <span>{choice.text}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
