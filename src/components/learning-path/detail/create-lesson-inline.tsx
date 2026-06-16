"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { BookOpenIcon, CodeIcon, FileQuestionIcon, PlaySquareIcon, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {cn} from "@/lib/utils";
import { TheoryForm, type TheoryFormHandle } from "@/components/learning-path/theory-form";
import { CodingLessonForm, type CodingLessonFormHandle } from "@/components/learning-path/coding-lesson-form";
import { QuizForm, type QuizFormHandle } from "@/components/quiz/quiz-form";
import {VideoLessonForm, type VideoLessonFormHandle} from "@/components/learning-path/video-lesson-form";
import { useCreateLesson } from "@/hooks/use-lessons";
import { LessonType } from "@/types/learning-path";
import { CodingLessonDTO, LessonRequestDTO, QuizLessonDTO, TheoryLessonDTO, VideoLessonDTO } from "@/types/learning-path/schema";

const LESSON_TYPES = [
    {
        type: "THEORY" as const,
        icon: BookOpenIcon,
    },
    {
        type: "QUIZ" as const,
        icon: FileQuestionIcon,
    },
    {
        type: "CODING" as const,
        icon: CodeIcon,
    },
    {
        type: "VIDEO" as const,
        icon: PlaySquareIcon,
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
    onSuccess,
    onCancel,
}: CreateLessonInlineProps) {
    const t = useTranslations("learningPaths");
    const tAi = useTranslations("lessonForm.ai");
    const tCodingAi = useTranslations("lessonForm.codingAi");
    const createLessonMutation = useCreateLesson(topicId);
    const [selectedType, setSelectedType] = useState<LessonType | null>(null);
    const createWithAiRef = useRef(false);
    const theoryFormRef = useRef<TheoryFormHandle | null>(null);
    const quizFormRef = useRef<QuizFormHandle | null>(null);
    const codingFormRef = useRef<CodingLessonFormHandle | null>(null);
    const videoFormRef = useRef<VideoLessonFormHandle | null>(null);

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
            case "VIDEO":
                return {
                    label: t("video"),
                    description: t("videoDesc"),
                    submitLabel: t("createVideoLesson"),
                };
        }
    };

    const handleSubmit = async (data: CodingLessonDTO | TheoryLessonDTO | QuizLessonDTO | VideoLessonDTO) => {
        const result = await createLessonMutation.mutateAsync(data as LessonRequestDTO);
        if (result && result.id) {
            if (createWithAiRef.current) {
                const key = selectedType === "CODING" ? `open-coding-ai-studio:${result.id}` : `open-ai-draft:${result.id}`;
                sessionStorage.setItem(key, "true");
            }
            onSuccess(result.id);
        }
    };

    const handleCreateWithAi = async () => {
        if (selectedType === "CODING" && codingFormRef.current) {
            createWithAiRef.current = true;
            try {
                await codingFormRef.current.submitForAi();
            } finally {
                createWithAiRef.current = false;
            }
            return;
        }

        const formRef = selectedType === "THEORY"
            ? theoryFormRef.current
            : selectedType === "QUIZ"
                ? quizFormRef.current
                : videoFormRef.current;
        if (!formRef || !(await formRef.trigger())) return;

        createWithAiRef.current = true;
        try {
            await formRef.submit();
        } finally {
            createWithAiRef.current = false;
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                {LESSON_TYPES.map((item) => {
                    const Icon = item.icon;
                    const isActive = selectedType === item.type;
                    const details = getLessonTypeDetails(item.type);
                    return (
                        <button
                            key={item.type}
                            type="button"
                            onClick={() => setSelectedType(item.type)}
                            className={cn(
                                "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors active:translate-y-px",
                                isActive ? "border-primary/40 bg-primary/5" : "border-border/70 bg-background hover:bg-muted/30",
                            )}
                        >
                            <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/40", isActive && "border-primary/30 text-primary")}>
                                <Icon className="size-4" />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                                <span className="block text-xs font-semibold text-foreground">{details.label}</span>
                                <span className="line-clamp-2 text-[10px] leading-snug text-muted-foreground">{details.description}</span>
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
                <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 sm:p-5">
                    {selectedType !== "VIDEO" && <div className="mb-5 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/[0.035] p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold">{selectedType === "CODING" ? tCodingAi("createTitle") : tAi("createTitle")}</p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">{selectedType === "CODING" ? tCodingAi("createDescription") : tAi("createDescription")}</p>
                        </div>
                        <Button type="button" variant="ai" size="sm" disabled={createLessonMutation.isPending} onClick={() => void handleCreateWithAi()}>
                            <Sparkles className="size-4"/>
                            {selectedType === "CODING" ? tCodingAi("createAction") : tAi("createAction")}
                        </Button>
                    </div>}
                    {selectedType === "THEORY" && (
                        <TheoryForm
                            formRef={theoryFormRef}
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel={getLessonTypeDetails("THEORY").submitLabel}
                        />
                    )}

                    {selectedType === "QUIZ" && (
                        <QuizForm
                            formRef={quizFormRef}
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel={getLessonTypeDetails("QUIZ").submitLabel}
                        />
                    )}

                    {selectedType === "CODING" && (
                        <CodingLessonForm
                            formRef={codingFormRef}
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel={getLessonTypeDetails("CODING").submitLabel}
                        />
                    )}

                    {selectedType === "VIDEO" && (
                        <VideoLessonForm
                            formRef={videoFormRef}
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel={getLessonTypeDetails("VIDEO").submitLabel}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
