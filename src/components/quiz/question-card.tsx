import {Button, Input} from "@base-ui/react";
import React, {useCallback, useMemo} from 'react'
import {Badge} from "@/components/ui/badge";
import {QuestionType} from "@/types/learning-path";
import {FormField} from "@/components/learning-path/form-field";

// ---------------------------------------------------------------------------
// Question Card — isolated, memoized, owns its own state for fast updates
// ---------------------------------------------------------------------------
interface QuestionCardProps {
    question: QuestionInput;
    index: number;
    isPending?: boolean;
    onChange: (updated: QuestionInput) => void;
    onRemove: () => void;
}

interface QuestionInput {
    question: string;
    type: QuestionType;
    points: number;
    explanation: string;
    choices: ChoiceInput[];
}

interface ChoiceInput {
    text: string;
    isCorrect: boolean;
    explanation: string;
}

const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string; description: string }[] = [
    {value: "MULTIPLE_CHOICE", label: "Multiple Choice", description: "Multiple correct answers"},
    {value: "SINGLE_CHOICE", label: "Single Choice", description: "One correct answer"},
    {value: "TRUE_FALSE", label: "True / False", description: "True or false question"},
];

const QuestionCard = React.memo(function QuestionCard({
                                                          question,
                                                          index,
                                                          isPending,
                                                          onChange,
                                                          onRemove,
                                                      }: QuestionCardProps) {
    const setCorrectChoice = useCallback((choiceIndex: number) => {
        if (question.type === "MULTIPLE_CHOICE") {
            const updated = {
                ...question,
                choices: question.choices.map((c, i) =>
                    i === choiceIndex ? {...c, isCorrect: !c.isCorrect} : c
                ),
            };
            onChange(updated);
            return;
        }
        const updated = {
            ...question,
            choices: question.choices.map((c, i) => ({...c, isCorrect: i === choiceIndex})),
        };
        onChange(updated);
    }, [question, onChange]);

    const handleTypeChange = useCallback((newType: QuestionType) => {
        if (newType === question.type) return;
        const shouldResetCorrect =
            newType === "TRUE_FALSE" || newType === "SINGLE_CHOICE";
        const updated: QuestionInput = shouldResetCorrect
            ? {
                ...question,
                type: newType,
                choices: question.choices.map((c, i) => ({
                    ...c,
                    isCorrect: i === 0,
                })),
            }
            : {...question, type: newType};
        onChange(updated);
    }, [question, onChange]);

    const updateChoice = useCallback((ci: number, field: keyof ChoiceInput, value: string | boolean) => {
        const updated: QuestionInput = {
            ...question,
            choices: question.choices.map((c, i) =>
                i === ci ? {...c, [field]: value} : c
            ),
        };
        onChange(updated);
    }, [question, onChange]);

    const addChoice = useCallback(() => {
        const updated: QuestionInput = {
            ...question,
            choices: [
                ...question.choices,
                {text: "", isCorrect: false, explanation: ""},
            ],
        };
        onChange(updated);
    }, [question, onChange]);

    const removeChoice = useCallback((ci: number) => {
        if (question.choices.length <= 2) return;
        const updated: QuestionInput = {
            ...question,
            choices: question.choices.filter((_, i) => i !== ci),
        };
        onChange(updated);
    }, [question, onChange]);

    const description = useMemo(() => {
        if (question.type === "MULTIPLE_CHOICE") return "Check all correct answers";
        if (question.type === "SINGLE_CHOICE") return "Select the one correct answer";
        return "Mark the correct statement";
    }, [question.type]);

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            {/* Question Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-amber-500/5 border-b">
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex items-center justify-center size-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black">
                        {index + 1}
                    </span>
                    <span className="text-sm font-semibold">Question {index + 1}</span>
                    <Badge variant="secondary" className="text-xs">{question.points} pts</Badge>
                </div>
                <Button
                    onClick={onRemove}
                    className="text-muted-foreground/50 hover:text-destructive"
                >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path
                            d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </Button>
            </div>

            <div className="p-4 flex flex-col gap-4">
                {/* Question text */}
                <FormField label="Question Text" className="text-xs" required>
                    <textarea
                        placeholder="What is the time complexity of accessing an element in an array by index?"
                        className="w-full min-h-16 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring/50"
                        value={question.question}
                        onChange={(e) => onChange({...question, question: e.target.value})}
                        disabled={isPending}
                    />
                </FormField>

                {/* Question type + points row */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <FormField label="Question Type" className="text-xs">
                        <select
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50 h-9"
                            value={question.type}
                            onChange={(e) => handleTypeChange(e.target.value as QuestionType)}
                            disabled={isPending}
                        >
                            {QUESTION_TYPE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </FormField>
                    <FormField label="Points" className="text-xs">
                        <Input
                            type="number"
                            min={1}
                            max={100}
                            value={question.points}
                            onChange={(e) => onChange({...question, points: Number(e.target.value)})}
                            disabled={isPending}
                        />
                    </FormField>
                </div>

                {/* Choices */}
                <FormField label="Choices" className="text-xs" description={description}>
                    <div className="flex flex-col gap-2">
                        {question.choices.map((choice, ci) => (
                            <div key={ci} className="group flex items-start gap-2">
                                <input
                                    type={question.type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                                    name={`question-${index}-choice`}
                                    checked={choice.isCorrect}
                                    onChange={() => setCorrectChoice(ci)}
                                    className="shrink-0 mt-2 w-4 h-4 rounded-full border-2 border-muted-foreground/40 accent-emerald-500 cursor-pointer transition-all hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-ring/50"
                                />
                                <div className="flex-1 flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder={`Choice ${ci + 1}`}
                                        className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                                        value={choice.text}
                                        onChange={(e) => updateChoice(ci, "text", e.target.value)}
                                        disabled={isPending}
                                    />
                                    {question.choices.length > 2 && (
                                        <Button
                                            onClick={() => removeChoice(ci)}
                                            className="shrink-0 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                 stroke="currentColor" strokeWidth="2">
                                                <path d="M18 6L6 18M6 6l12 12"/>
                                            </svg>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <Button onClick={addChoice}
                                className="self-start mt-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2" className="mr-1">
                                <path d="M12 5v14M5 12h14"/>
                            </svg>
                            Add Choice
                        </Button>
                    </div>
                </FormField>

                {/* Explanation */}
                <FormField label="Explanation (shown after answering)" className="text-xs"
                           description="Optional explanation for the correct answer">
                    <Input
                        placeholder="Array elements can be accessed directly using their index in O(1) time."
                        value={question.explanation}
                        onChange={(e) => onChange({...question, explanation: e.target.value})}
                        disabled={isPending}
                    />
                </FormField>
            </div>
        </div>
    );
});
export default QuestionCard
