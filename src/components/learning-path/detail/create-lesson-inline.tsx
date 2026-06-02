"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
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
        icon: BookOpenIcon,
        iconClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-500/10 border-blue-500/20",
        activeClass: "ring-2 ring-blue-500/30 border-blue-500/40 bg-blue-500/5 dark:bg-blue-500/10 shadow-sm shadow-blue-500/5",
    },
    {
        type: "QUIZ" as const,
        icon: FileQuestionIcon,
        iconClass: "text-amber-600 dark:text-amber-400",
        bgClass: "bg-amber-500/10 border-amber-500/20",
        activeClass: "ring-2 ring-amber-500/30 border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10 shadow-sm shadow-amber-500/5",
    },
    {
        type: "CODING" as const,
        icon: CodeIcon,
        iconClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-500/10 border-emerald-500/20",
        activeClass: "ring-2 ring-emerald-500/30 border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10 shadow-sm shadow-emerald-500/5",
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
    const t = useTranslations("learningPaths");
    const createLessonMutation = useCreateLesson(topicId);
    const [selectedType, setSelectedType] = useState<LessonType | null>(null);

    const getLessonTypeDetails = (type: LessonType) => {
        switch (type) {
            case "THEORY":
                return {
                    label: t("theory"),
                    description: t("theoryDesc"),
                    submitLabel: t("createTheoryLesson"),
                };
            case "QUIZ":
                return {
                    label: t("quiz"),
                    description: t("quizDesc"),
                    submitLabel: t("createQuizLesson"),
                };
            case "CODING":
                return {
                    label: t("coding"),
                    description: t("codingDesc"),
                    submitLabel: t("createCodingLesson"),
                };
        }
    };

    const handleSubmit = async (data: CodingLessonDTO | TheoryLessonDTO | QuizLessonDTO) => {
        const result = await createLessonMutation.mutateAsync(data as LessonRequestDTO);
        if (result && result.id) {
            onSuccess(result.id);
        }
    };

    return (
        <div className="space-y-6 relative">
            <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="space-y-1">
                    <h2 className="text-base font-bold tracking-tight text-foreground">{t("createNewLesson")}</h2>
                    <p className="text-xs text-muted-foreground">
                        {t("chooseLessonType")}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onCancel}
                    className="size-8 rounded-lg hover:bg-muted"
                >
                    <X className="size-4" />
                </Button>
            </div>

            {/* Type Selector Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {LESSON_TYPES.map((item) => {
                    const Icon = item.icon;
                    const isActive = selectedType === item.type;
                    const details = getLessonTypeDetails(item.type);
                    return (
                        <button
                            key={item.type}
                            type="button"
                            onClick={() => setSelectedType(item.type)}
                            className={`
                                flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all duration-300 select-none cursor-pointer active:scale-[0.99]
                                ${isActive
                                    ? item.activeClass
                                    : "border-border/50 bg-background/50 hover:border-border/90 hover:bg-muted/30 shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
                                }
                            `}
                        >
                            <div className={`flex items-center justify-center size-10 rounded-xl shrink-0 border border-transparent ${item.bgClass}`}>
                                <Icon className={`size-5 ${item.iconClass}`} />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                                <span className="text-xs font-bold block text-foreground tracking-tight">{details.label}</span>
                                <span className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">{details.description}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Form Canvas */}
            {!selectedType ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/40 py-16 gap-2 bg-muted/5 relative overflow-hidden">
                    <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
                    <p className="text-muted-foreground text-xs font-bold">{t("selectLessonType")}</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-border/40 bg-card p-5 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
                    {selectedType === "THEORY" && (
                        <TheoryForm
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel={getLessonTypeDetails("THEORY").submitLabel}
                        />
                    )}

                    {selectedType === "QUIZ" && (
                        <QuizForm
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel={getLessonTypeDetails("QUIZ").submitLabel}
                        />
                    )}

                    {selectedType === "CODING" && (
                        <CodingLessonForm
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel={getLessonTypeDetails("CODING").submitLabel}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
