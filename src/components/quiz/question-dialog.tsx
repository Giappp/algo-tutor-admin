"use client";

import {useTranslations} from "next-intl";
import {FilePenLine, Loader2, Plus} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {QuestionForm} from "@/components/quiz/question-form";
import {QuizQuestion} from "@/types/learning-path";
import {QuestionRequestDTO} from "@/types/learning-path/schema";

interface QuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuizQuestion | null;
    onSubmit: (data: QuestionRequestDTO) => Promise<void>;
    isPending: boolean;
}

function toCreateQuestion(question: QuizQuestion): QuestionRequestDTO {
    return {
        question: question.question,
        type: question.type,
        orderIndex: question.orderIndex,
        points: question.points,
        explanation: question.explanation,
        choices: question.choices,
    };
}

function QuestionDialog({open, onOpenChange, question, onSubmit, isPending}: QuestionDialogProps) {
    const t = useTranslations("lessonForm.questions.dialog");
    const isEditMode = Boolean(question);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[92dvh] w-[calc(100vw-1rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0 sm:w-[calc(100vw-2rem)] sm:max-w-5xl">
                <DialogHeader className="border-b border-border/70 bg-muted/20 px-5 py-4 pr-14 text-left sm:px-6 sm:py-5">
                    <div className="flex items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            {isEditMode ? <FilePenLine /> : <Plus />}
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold tracking-tight sm:text-xl">
                                {isEditMode ? t("editTitle") : t("createTitle")}
                            </DialogTitle>
                            <DialogDescription className="mt-1 max-w-2xl leading-relaxed">
                                {isEditMode ? t("editDescription") : t("createDescription")}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto bg-muted/10 px-3 py-4 sm:px-6 sm:py-5">
                    {open && (
                        <QuestionForm
                            key={question?.id ?? "new"}
                            defaultValues={question ? toCreateQuestion(question) : undefined}
                            onSubmit={onSubmit}
                        />
                    )}
                </div>

                <DialogFooter className="flex-col-reverse gap-2 border-t border-border/70 bg-background/95 px-4 py-3 sm:flex-row sm:justify-end sm:px-6 sm:py-4">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                        {t("cancel")}
                    </Button>
                    <Button type="submit" form="question-form" disabled={isPending}>
                        {isPending ? <Loader2 data-icon="inline-start" className="animate-spin" /> : isEditMode ? <FilePenLine data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
                        {isPending ? t("saving") : isEditMode ? t("saveChanges") : t("addQuestion")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default QuestionDialog;
