"use client";

import { useState } from "react";
import { BookOpenIcon, CodeIcon, FileQuestionIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TheoryForm } from "@/components/learning-path/theory-form";
import { CodingLessonForm } from "@/components/learning-path/coding-lesson-form";
import { QuizForm } from "@/components/quiz/quiz-form";
import { useCreateLesson } from "@/hooks/use-lessons";
import { LessonType } from "@/types/learning-path";
import { CodingLessonDTO, LessonRequestDTO, QuizLessonDTO, TheoryLessonDTO } from "@/types/learning-path/schema";

const LESSON_TYPES = [
    {
        type: "THEORY" as const,
        label: "Theory",
        description: "Rich text content with Markdown and templates",
        icon: BookOpenIcon,
        iconClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-500/10",
        activeClass: "ring-2 ring-blue-500/50 border-blue-500/50 bg-blue-500/5",
    },
    {
        type: "QUIZ" as const,
        label: "Quiz",
        description: "Multiple choice or true/false questions",
        icon: FileQuestionIcon,
        iconClass: "text-amber-600 dark:text-amber-400",
        bgClass: "bg-amber-500/10",
        activeClass: "ring-2 ring-amber-500/50 border-amber-500/50 bg-amber-500/5",
    },
    {
        type: "CODING" as const,
        label: "Coding",
        description: "Coding problem with starter code & test cases",
        icon: CodeIcon,
        iconClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-500/10",
        activeClass: "ring-2 ring-emerald-500/50 border-emerald-500/50 bg-emerald-500/5",
    },
];

interface CreateLessonInlineProps {
    topicId: number;
    learningPathId: number;
    onSuccess: (newLessonId: number) => void;
    onCancel: () => void;
}

export function CreateLessonInline({
    topicId,
    learningPathId,
    onSuccess,
    onCancel,
}: CreateLessonInlineProps) {
    const createLessonMutation = useCreateLesson(topicId);
    const [selectedType, setSelectedType] = useState<LessonType | null>(null);

    const handleSubmit = async (data: CodingLessonDTO | TheoryLessonDTO | QuizLessonDTO) => {
        const result = await createLessonMutation.mutateAsync(data as LessonRequestDTO);
        if (result && result.id) {
            onSuccess(result.id);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h2 className="text-lg font-bold tracking-tight">Create New Lesson</h2>
                    <p className="text-xs text-muted-foreground">
                        Choose a lesson type to get started
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    className="size-8 rounded-lg"
                >
                    <X className="size-4" />
                </Button>
            </div>

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {LESSON_TYPES.map((item) => {
                    const Icon = item.icon;
                    const isActive = selectedType === item.type;
                    return (
                        <button
                            key={item.type}
                            type="button"
                            onClick={() => setSelectedType(item.type)}
                            className={`
                                flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200 select-none
                                ${isActive
                                    ? item.activeClass
                                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                                }
                            `}
                        >
                            <div className={`flex items-center justify-center size-10 rounded-lg shrink-0 ${item.bgClass}`}>
                                <Icon className={`size-5 ${item.iconClass}`} />
                            </div>
                            <div className="min-w-0">
                                <span className="text-xs font-bold block text-foreground">{item.label}</span>
                                <span className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">{item.description}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Form Canvas */}
            {!selectedType ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-14 gap-2 bg-muted/10">
                    <p className="text-muted-foreground text-xs font-medium">Select a lesson type above to show the editor</p>
                </div>
            ) : (
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    {selectedType === "THEORY" && (
                        <TheoryForm
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel="Create Theory Lesson"
                        />
                    )}

                    {selectedType === "QUIZ" && (
                        <QuizForm
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel="Create Quiz Lesson"
                        />
                    )}

                    {selectedType === "CODING" && (
                        <CodingLessonForm
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel="Create Coding Lesson"
                        />
                    )}
                </div>
            )}
        </div>
    );
}
