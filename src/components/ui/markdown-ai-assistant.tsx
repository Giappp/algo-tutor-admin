"use client";

import {useState} from "react";
import {AlertCircle, ArrowDownToLine, Loader2, Sparkles} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Textarea} from "@/components/ui/textarea";

export interface MarkdownAiRequest {
    prompt: string;
    content: string;
    selection: string;
}

interface MarkdownAiAssistantProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    content: string;
    selection: string;
    onGenerate: (request: MarkdownAiRequest) => Promise<string>;
    onApply: (content: string, replaceDocument: boolean) => void;
}

export function MarkdownAiAssistant({
    open,
    onOpenChange,
    content,
    selection,
    onGenerate,
    onApply,
}: MarkdownAiAssistantProps) {
    const t = useTranslations("lessonForm.markdown.ai");
    const [prompt, setPrompt] = useState("");
    const [result, setResult] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState("");

    const reset = () => {
        setResult("");
        setError("");
    };

    const handleGenerate = async () => {
        setIsPending(true);
        setError("");
        try {
            setResult(await onGenerate({prompt: prompt.trim(), content, selection}));
        } catch (cause) {
            setError(cause instanceof Error ? cause.message : t("failed"));
        } finally {
            setIsPending(false);
        }
    };

    const handleApply = (replaceDocument: boolean) => {
        onApply(result, replaceDocument);
        onOpenChange(false);
        setPrompt("");
        reset();
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => {
            if (!isPending) {
                onOpenChange(nextOpen);
                if (!nextOpen) {
                    setPrompt("");
                    reset();
                }
            }
        }}>
            <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-2xl p-0">
                <DialogHeader className="border-b border-border/60 bg-[radial-gradient(circle_at_top_right,oklch(0.72_0.14_225/0.18),transparent_45%)] px-6 py-5">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Sparkles className="size-4 text-primary"/>
                        {t("title")}
                    </DialogTitle>
                    <DialogDescription>{t(selection ? "selectionDescription" : "description")}</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 px-6 py-5">
                    {!result ? (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="markdown-ai-prompt">{t("prompt")}</Label>
                                <Textarea
                                    id="markdown-ai-prompt"
                                    value={prompt}
                                    onChange={(event) => setPrompt(event.target.value)}
                                    placeholder={t("promptPlaceholder")}
                                    rows={6}
                                    maxLength={1500}
                                    disabled={isPending}
                                    className="resize-y"
                                />
                            </div>
                            {selection && (
                                <div className="max-h-28 overflow-auto rounded-lg border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                                    {selection}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="markdown-ai-result">{t("result")}</Label>
                            <Textarea
                                id="markdown-ai-result"
                                value={result}
                                onChange={(event) => setResult(event.target.value)}
                                rows={12}
                                className="resize-y font-mono text-xs"
                            />
                        </div>
                    )}

                    {error && (
                        <div role="alert" className="flex gap-2 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
                            <AlertCircle className="mt-0.5 size-4 shrink-0"/>
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t border-border/60 px-6 py-4">
                    {result ? (
                        <>
                            <Button variant="outline" onClick={reset}>{t("tryAgain")}</Button>
                            <Button variant="outline" onClick={() => handleApply(false)}>
                                <ArrowDownToLine className="size-4"/>
                                {t(selection ? "replaceSelection" : "insert")}
                            </Button>
                            <Button variant="ai" onClick={() => handleApply(true)}>
                                <Sparkles className="size-4"/>
                                {t("replaceDocument")}
                            </Button>
                        </>
                    ) : (
                        <Button variant="ai" onClick={handleGenerate} disabled={!prompt.trim() || isPending}>
                            {isPending ? <Loader2 className="size-4 animate-spin"/> : <Sparkles className="size-4"/>}
                            {t("generate")}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
