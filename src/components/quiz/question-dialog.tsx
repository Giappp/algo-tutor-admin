import {QuizQuestion} from "@/types/learning-path";
import {CreateQuestionDTO} from "@/types/learning-path/schema";
import {Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "../ui/dialog";
import {Button} from "@/components/ui/button";
import {QuestionForm} from "@/components/quiz/question-form";

interface QuestionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    question: QuizQuestion | null;
    onSubmit: (data: CreateQuestionDTO) => Promise<void>;
    isPending: boolean;
}

function toCreateQuestion(q: QuizQuestion): CreateQuestionDTO {
    return {
        question: q.question,
        type: q.type,
        points: q.points,
        explanation: q.explanation,
        choices: q.choices,
    };
}

function QuestionDialog({open, onOpenChange, question, onSubmit, isPending}: QuestionDialogProps) {
    const handleOpenChange = (open: boolean) => {
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {question ? "Edit Question" : "Add Question"}
                    </DialogTitle>
                    <DialogDescription>
                        Create a question with multiple choice answers.
                    </DialogDescription>
                </DialogHeader>

                {open && (
                    <QuestionForm
                        key={question?.id ?? "new"}
                        defaultValues={question ? toCreateQuestion(question) : undefined}
                        onSubmit={onSubmit}
                        isPending={isPending}
                        onCancel={() => onOpenChange(false)}
                    />
                )}

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : question ? "Save Changes" : "Add Question"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default QuestionDialog;