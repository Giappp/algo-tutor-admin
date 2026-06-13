"use client";

import {useState} from "react";
import {AlertCircle, BookOpen, Check, Cpu, FileQuestion, Loader2, Sparkles} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Textarea} from "@/components/ui/textarea";
import {useGenerateLessonContent} from "@/hooks/use-admin-ai-lesson";
import type {
    AiProvider,
    GenerateLessonContentResponse,
    LessonDraft,
} from "@/types/admin-ai-lesson";
import type {LessonType} from "@/types/learning-path";

interface AiLessonDraftDialogProps {
    lessonId: number;
    lessonType: LessonType;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (draft: LessonDraft) => void;
}

const PROVIDERS: {value: AiProvider | "DEFAULT"; label: string}[] = [
    {value: "DEFAULT", label: "Default"},
    {value: "GEMINI", label: "Gemini"},
    {value: "OPENAI", label: "OpenAI"},
    {value: "CLAUDE", label: "Claude"},
];

function DraftSummary({generated}: {generated: GenerateLessonContentResponse}) {
    const t = useTranslations("lessonForm.ai");
    const draft = generated.content;
    const contentStats = draft.type === "THEORY"
        ? t("theoryStats", {characters: draft.content.length})
        : draft.type === "CODING"
            ? t("codingStats", {
                constraints: draft.constraints?.length ?? 0,
                examples: draft.examples?.length ?? 0,
                hints: draft.hints?.length ?? 0,
            })
            : t("quizStats", {questions: draft.questions?.length ?? 0});

    const TypeIcon = draft.type === "THEORY" ? BookOpen : draft.type === "CODING" ? Cpu : FileQuestion;

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-border/60 bg-muted/25 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                        <TypeIcon className="size-4" aria-hidden="true"/>
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold">{draft.title}</p>
                            <Badge variant="outline">{draft.type}</Badge>
                            <Badge variant="outline">{draft.difficulty}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{contentStats}</p>
                    </div>
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-[11px] font-semibold text-muted-foreground">{t("contextUsed")}</p>
                    <p className="mt-1 text-sm font-medium">{generated.context.learningPathName}</p>
                    <p className="text-xs text-muted-foreground">{generated.context.topicName}</p>
                </div>
                <div className="rounded-lg border border-border/60 p-3">
                    <p className="text-[11px] font-semibold text-muted-foreground">{t("tokenUsage")}</p>
                    <p className="mt-1 font-mono text-sm font-medium tabular-nums">
                        {(generated.inputTokens ?? 0).toLocaleString()} in / {(generated.outputTokens ?? 0).toLocaleString()} out
                    </p>
                    <p className="text-xs text-muted-foreground">{t("providerMayOmitTokens")}</p>
                </div>
            </div>

            {generated.context.siblingLessons.length > 0 && (
                <div>
                    <p className="mb-2 text-[11px] font-semibold text-muted-foreground">{t("siblingLessons")}</p>
                    <div className="flex flex-wrap gap-1.5">
                        {generated.context.siblingLessons.map((lesson) => (
                            <Badge key={lesson} variant="secondary">{lesson}</Badge>
                        ))}
                    </div>
                </div>
            )}

            {draft.type === "QUIZ" && (draft.questions?.length ?? 0) > 0 && (
                <div className="rounded-lg border border-amber-500/25 bg-amber-500/5 p-3 text-xs text-muted-foreground">
                    {t("quizQuestionNotice")}
                </div>
            )}
        </div>
    );
}

export function AiLessonDraftDialog({
    lessonId,
    lessonType,
    open,
    onOpenChange,
    onApply,
}: AiLessonDraftDialogProps) {
    const t = useTranslations("lessonForm.ai");
    const [provider, setProvider] = useState<AiProvider | "DEFAULT">("DEFAULT");
    const [prompt, setPrompt] = useState("");
    const [generated, setGenerated] = useState<GenerateLessonContentResponse | null>(null);
    const generateMutation = useGenerateLessonContent(lessonId, lessonType);
    const promptLength = prompt.length;

    const handleGenerate = async () => {
        try {
            const result = await generateMutation.mutateAsync({
                prompt: prompt.trim(),
                provider: provider === "DEFAULT" ? null : provider,
            });
            setGenerated(result);
        } catch {
            // Mutation state renders the backend error inline while preserving the prompt.
        }
    };

    const handleApply = () => {
        if (!generated) return;
        onApply(generated.content);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => {
            if (!generateMutation.isPending) onOpenChange(nextOpen);
        }}>
            <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden rounded-2xl p-0">
                <DialogHeader className="border-b border-border/60 px-6 py-5">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="size-4 text-primary" aria-hidden="true"/>
                        {t("title")}
                    </DialogTitle>
                    <DialogDescription>{t("description")}</DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {generated ? (
                        <DraftSummary generated={generated}/>
                    ) : (
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="ai-lesson-provider">{t("provider")}</Label>
                                <Select value={provider} onValueChange={(value) => setProvider(value as AiProvider | "DEFAULT")}>
                                    <SelectTrigger id="ai-lesson-provider" className="w-full">
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROVIDERS.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <Label htmlFor="ai-lesson-prompt">{t("prompt")}</Label>
                                    <span className="font-mono text-[11px] text-muted-foreground">{promptLength.toLocaleString()} / 5,000</span>
                                </div>
                                <Textarea
                                    id="ai-lesson-prompt"
                                    value={prompt}
                                    onChange={(event) => setPrompt(event.target.value)}
                                    maxLength={5000}
                                    rows={7}
                                    disabled={generateMutation.isPending}
                                    placeholder={t("promptPlaceholder")}
                                    className="resize-y"
                                />
                                <p className="text-xs leading-relaxed text-muted-foreground">{t("promptHint")}</p>
                            </div>

                            {generateMutation.error && (
                                <div role="alert" className="flex gap-2 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
                                    <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true"/>
                                    <span>{generateMutation.error.message}</span>
                                </div>
                            )}

                            {generateMutation.isPending && (
                                <div aria-live="polite" className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
                                    <Loader2 className="size-4 animate-spin text-primary" aria-hidden="true"/>
                                    <div>
                                        <p className="text-sm font-medium">{t("generating")}</p>
                                        <p className="text-xs text-muted-foreground">{t("generatingHint")}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-border/60 px-6 py-4">
                    {generated ? (
                        <>
                            <Button variant="outline" onClick={() => {
                                generateMutation.reset();
                                setGenerated(null);
                            }}>
                                {t("generateAgain")}
                            </Button>
                            <Button onClick={handleApply}>
                                <Check className="size-4"/>
                                {t("applyDraft")}
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="ai"
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || generateMutation.isPending}
                        >
                            {generateMutation.isPending ? <Loader2 className="size-4 animate-spin"/> : <Sparkles className="size-4"/>}
                            {t("generate")}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
