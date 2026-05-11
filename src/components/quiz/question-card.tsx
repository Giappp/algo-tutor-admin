import React, {useCallback, useMemo, useState} from 'react';
import {Control, Controller, useFieldArray, UseFormGetValues, UseFormSetValue, useWatch} from "react-hook-form";
import {cn} from "@/lib/utils";
import {Badge} from "@/components/ui/badge";
import {QuestionInput, QuizLessonDTO} from "@/types/learning-path/schema";
import {FormField} from "@/components/learning-path/form-field";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {ChevronDownIcon, ChevronUpIcon} from "lucide-react";

interface QuestionCardProps {
    index: number;
    isPending?: boolean;
    onRemove: () => void;
    control: Control<QuizLessonDTO>;
    setValue: UseFormSetValue<QuizLessonDTO>;
    getValues: UseFormGetValues<QuizLessonDTO>;
}

const QUESTION_TYPE_OPTIONS = [
    {value: "MULTIPLE_CHOICE", label: "Multiple Choice", description: "Check all correct answers"},
    {value: "SINGLE_CHOICE", label: "Single Choice", description: "Select the one correct answer"},
    {value: "TRUE_FALSE", label: "True / False", description: "Mark the correct statement"},
];

export default React.memo(function QuestionCard({
                                                    index,
                                                    isPending,
                                                    onRemove,
                                                    control,
                                                    setValue,
                                                    getValues
                                                }: QuestionCardProps) {
    const [explanationOpen, setExplanationOpen] = useState(false);

    // ONLY watch the basic fields that dictate UI layout
    const watchedType = useWatch({control, name: `questions.${index}.type` as const}) as QuestionInput["type"];
    const watchedPoints = useWatch({control, name: `questions.${index}.points` as const}) as number | undefined;

    const isTrueFalse = watchedType === "TRUE_FALSE";
    const typeDescription = useMemo(() => QUESTION_TYPE_OPTIONS.find(o => o.value === watchedType)?.description ?? "", [watchedType]);

    // Use Field Array for choices to prevent text-typing re-renders
    const {fields: choiceFields, append: appendChoice, remove: removeChoiceField} = useFieldArray({
        control,
        name: `questions.${index}.choices` as const
    });

    const handleTypeChange = useCallback((newType: string) => {
        if (newType === watchedType) return;
        if (newType === "TRUE_FALSE") {
            setValue(`questions.${index}.type` as const, "TRUE_FALSE");
            setValue(`questions.${index}.choices` as const, [
                {text: "True", isCorrect: false, explanation: ""},
                {text: "False", isCorrect: false, explanation: ""},
            ]);
            return;
        }
        setValue(`questions.${index}.type` as const, newType as QuestionInput["type"]);
    }, [watchedType, setValue, index]);

    const adjustPoints = useCallback((delta: number) => {
        const next = Math.max(1, Math.min(100, (watchedPoints ?? 10) + delta));
        setValue(`questions.${index}.points` as const, next);
    }, [watchedPoints, setValue, index]);

    const setCorrectChoice = useCallback((choiceIndex: number) => {
        // Use getValues instead of useWatch to prevent reactivity loops
        const currentChoices = getValues(`questions.${index}.choices` as const) || [];

        if (watchedType === "MULTIPLE_CHOICE") {
            setValue(
                `questions.${index}.choices` as const,
                currentChoices.map((ch, i) => i === choiceIndex ? {...ch, isCorrect: !ch.isCorrect} : ch)
            );
        } else {
            setValue(
                `questions.${index}.choices` as const,
                currentChoices.map((ch, i) => ({...ch, isCorrect: i === choiceIndex}))
            );
        }
    }, [watchedType, index, setValue, getValues]);

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-amber-500/5 border-b">
                <div className="flex items-center gap-2">
                    <span
                        className="inline-flex items-center justify-center size-6 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black">
                        {index + 1}
                    </span>
                    <span className="text-sm font-semibold">Question {index + 1}</span>
                </div>
                <Button onClick={onRemove} variant="destructive" className="hover:text-destructive">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path
                            d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </Button>
            </div>

            <div className="p-5 flex flex-col gap-5">
                <Controller
                    name={`questions.${index}.question` as const}
                    control={control}
                    rules={{required: "Question text is required"}}
                    render={({field}) => (
                        <FormField label="Question Text" className="text-xs" required>
                            <textarea
                                placeholder="What is the time complexity..."
                                className="w-full min-h-12 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
                                disabled={isPending}
                                {...field}
                            />
                        </FormField>
                    )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                    <Controller
                        name={`questions.${index}.type` as const}
                        control={control}
                        render={({field}) => (
                            <FormField label="Question Type" className="text-xs" description={typeDescription}>
                                <Select value={field.value} onValueChange={(v) => handleTypeChange(v as string)}
                                        disabled={isPending}>
                                    <SelectTrigger className="h-9"><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        {QUESTION_TYPE_OPTIONS.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormField>
                        )}
                    />
                    <FormField label="Points" className="text-xs">
                        <div
                            className="flex items-center gap-0 h-9 rounded-lg border border-input bg-background overflow-hidden">
                            <button type="button" onClick={() => adjustPoints(-1)}
                                    className="px-3 h-full text-muted-foreground hover:bg-muted"
                                    disabled={isPending || (watchedPoints ?? 10) <= 1}>−
                            </button>
                            <div
                                className="flex-1 flex items-center justify-center text-sm font-semibold border-x border-input min-w-[3rem]">{watchedPoints ?? 10}</div>
                            <button type="button" onClick={() => adjustPoints(1)}
                                    className="px-3 h-full text-muted-foreground hover:bg-muted"
                                    disabled={isPending || (watchedPoints ?? 10) >= 100}>+
                            </button>
                        </div>
                    </FormField>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-semibold text-foreground">Choices</span>
                            <span className="text-xs text-muted-foreground ml-2">{typeDescription}</span>
                        </div>
                        {!isTrueFalse && (
                            <Button onClick={() => appendChoice({text: "", isCorrect: false, explanation: ""})}
                                    size="sm"
                                    className="h-6 px-2 text-xs bg-amber-500 hover:bg-amber-600 text-white shadow-sm gap-1">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                     strokeWidth="2.5" className="mr-1">
                                    <path d="M12 5v14M5 12h14"/>
                                </svg>
                                Add
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {choiceFields.map((field, ci) => (
                            <ChoiceItem
                                key={field.id}
                                control={control}
                                questionIndex={index}
                                ci={ci}
                                isTrueFalse={isTrueFalse}
                                isPending={isPending}
                                setCorrectChoice={setCorrectChoice}
                                removeChoiceField={() => removeChoiceField(ci)}
                                totalChoices={choiceFields.length}
                                defaultText={field.text}
                            />
                        ))}
                    </div>
                </div>

                <div className="border-t border-dashed pt-4">
                    <button type="button" onClick={() => setExplanationOpen(o => !o)}
                            className="flex items-center gap-2 text-xs font-semibold text-foreground hover:text-amber-600 transition-colors">
                        {explanationOpen ? <ChevronUpIcon className="size-3.5 text-muted-foreground"/> :
                            <ChevronDownIcon className="size-3.5 text-muted-foreground"/>}
                        Explanation <ExplanationBadge control={control} index={index}/>
                    </button>
                    {explanationOpen && (
                        <div className="mt-2">
                            <Controller
                                name={`questions.${index}.explanation` as const}
                                control={control}
                                render={({field}) => (
                                    <textarea placeholder="Explain why the correct answer is correct..."
                                              className="w-full min-h-12 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50"
                                              disabled={isPending} {...field} />
                                )}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
});


function ChoiceItem({
                        control,
                        ci,
                        questionIndex,
                        isTrueFalse,
                        isPending,
                        setCorrectChoice,
                        removeChoiceField,
                        totalChoices,
                        defaultText,
                    }: {
    control: Control<QuizLessonDTO>;
    ci: number;
    questionIndex: number;
    isTrueFalse: boolean;
    isPending?: boolean;
    setCorrectChoice: (ci: number) => void;
    removeChoiceField: (e: React.MouseEvent) => void;
    totalChoices: number;
    defaultText: string;
}) {
    const isCorrect = useWatch({control, name: `questions.${questionIndex}.choices.${ci}.isCorrect` as const});

    if (isTrueFalse) {
        return (
            <div className="flex items-center gap-3">
                <button type="button" onClick={() => setCorrectChoice(ci)}
                        className={cn("shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center", isCorrect ? "bg-emerald-500 border-emerald-500" : "border-muted-foreground/40")}>
                    {isCorrect && <span className="w-1.5 h-1.5 rounded-full bg-white"/>}
                </button>
                <span
                    className={cn("flex-1 rounded-lg border px-3 py-2 text-sm font-medium", isCorrect ? "bg-emerald-500/8 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" : "bg-muted/30 border-transparent")}>
                    {defaultText}
                </span>
                {isCorrect && <span
                    className="shrink-0 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Correct</span>}
            </div>
        );
    }

    return (
        <div className="group flex items-start gap-2">
            <button type="button" onClick={() => setCorrectChoice(ci)}
                    className={cn("shrink-0 mt-2 w-4 h-4 rounded-full border-2 border-muted-foreground/40 accent-emerald-500 cursor-pointer transition-all focus:outline-none", isCorrect ? "bg-emerald-500 border-emerald-500" : "bg-transparent")}
                    disabled={isPending}>
                {isCorrect && <span className="block w-1.5 h-1.5 rounded-full bg-white mx-auto mt-0.5"/>}
            </button>
            <div className="flex-1 flex items-center gap-2">
                <Controller
                    name={`questions.${questionIndex}.choices.${ci}.text` as const}
                    control={control}
                    rules={{required: "Choice text is required"}}
                    render={({field}) => (
                        <input type="text" placeholder={`Choice ${ci + 1}`}
                               className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/50"
                               disabled={isPending} {...field} />
                    )}
                />
                {totalChoices > 2 && (
                    <Button onClick={removeChoiceField} size="icon-xs" variant="ghost"
                            className="shrink-0 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12"/>
                        </svg>
                    </Button>
                )}
            </div>
        </div>
    );
}

// Isolates explanation text watch to avoid lag
function ExplanationBadge({control, index}: { control: Control<QuizLessonDTO>; index: number }) {
    const explanation = useWatch({control, name: `questions.${index}.explanation`});
    if (!explanation) return null;
    return <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 ml-1">set</Badge>;
}