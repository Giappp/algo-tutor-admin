import {QuizQuestion} from "@/types/learning-path";
import {QuestionRequestDTO} from "@/types/learning-path/schema";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../ui/dialog";
import {Button} from "@/components/ui/button";
import {QuestionForm} from "@/components/quiz/question-form";

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

function QuestionDialog({open, onOpenChange, question, onSubmit, isPending}: QuestionDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                <DialogHeader className="border-b pb-4 mb-4">
                    <DialogTitle className="text-lg font-bold">
                        {question ? "Edit Question" : "Add Question"}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground mt-1">
                        Create a question with single or multiple choice answers.
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <QuestionForm
                        key={question?.id ?? "new"}
                        defaultValues={question ? toCreateQuestion(question) : undefined}
                        onSubmit={onSubmit}
                    />
                )}

                <DialogFooter className="border-t pt-4 mt-6 flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="text-sm h-10 px-5">
                        Cancel
                    </Button>
                    <Button type="submit" form="question-form" disabled={isPending} className="text-sm h-10 px-5 bg-amber-500 hover:bg-amber-600 text-white shadow-sm">
                        {isPending ? "Saving..." : question ? "Save Changes" : "Add Question"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default QuestionDialog;