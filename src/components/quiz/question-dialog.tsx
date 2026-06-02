import { Loader2 } from "lucide-react";

import { QuizQuestion } from "@/types/learning-path";
import { QuestionRequestDTO } from "@/types/learning-path/schema";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";

import { Button } from "@/components/ui/button";
import { QuestionForm } from "@/components/quiz/question-form";

interface QuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuizQuestion | null;
    onSubmit: (data: QuestionRequestDTO) => Promise<void>;
    isPending: boolean;
}

function toCreateQuestion(q: QuizQuestion): QuestionRequestDTO {
    return {
        question: q.question,
        type: q.type,
        points: q.points,
        explanation: q.explanation,
        choices: q.choices,
    };
}

function QuestionDialog({
    open,
    onOpenChange,
    question,
    onSubmit,
    isPending,
}: QuestionDialogProps) {
    const isEditMode = Boolean(question);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="
                    flex max-h-[88vh] w-[calc(100vw-32px)] max-w-4xl
                    flex-col gap-0 overflow-hidden rounded-2xl p-0
                "
            >
                <DialogHeader className="border-b px-6 py-5 text-left">
                    <DialogTitle className="text-xl font-semibold tracking-tight text-foreground">
                        {isEditMode ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
                    </DialogTitle>

                    <DialogDescription className="mt-1 text-sm leading-6 text-muted-foreground">
                        Thiết lập nội dung câu hỏi, loại câu hỏi, điểm số và danh sách đáp án.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                    {open && (
                        <QuestionForm
                            key={question?.id ?? "new"}
                            defaultValues={question ? toCreateQuestion(question) : undefined}
                            onSubmit={onSubmit}
                        />
                    )}
                </div>

                <DialogFooter className="flex-row justify-end gap-3 border-t bg-background px-6 py-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isPending}
                        className="h-10 min-w-24 rounded-xl px-5 text-sm font-semibold"
                    >
                        Hủy
                    </Button>

                    <Button
                        type="submit"
                        form="question-form"
                        disabled={isPending}
                        className="
                            h-10 min-w-32 rounded-xl bg-amber-500 px-5
                            text-sm font-semibold text-white shadow-sm
                            hover:bg-amber-600
                        "
                    >
                        {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}

                        {isPending
                            ? "Đang lưu..."
                            : isEditMode
                              ? "Lưu thay đổi"
                              : "Thêm câu hỏi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default QuestionDialog;