"use client";

import {useLesson, useTogglePublishLesson, useUpdateLesson} from "@/hooks/use-lessons";
import {LessonHeader} from "@/components/learning-path/lesson-header";
import {LessonPageSkeleton} from "@/components/learning-path/lesson-skeleton";
import {CodingLessonPanels, QuizLessonDetail, TheoryLessonDetail, VideoLessonDetail} from "@/components/lesson-detail";
import {LessonRequestDTO} from "@/types/learning-path/schema";
import {Button} from "@/components/ui/button";
import {AlertCircle, ArrowLeft, Sparkles} from "lucide-react";
import {useEffect, useState} from "react";
import {AiLessonDraftDialog} from "@/components/lesson-detail/ai-lesson-draft-dialog";
import {mergeLessonDraft} from "@/lib/admin-ai-lesson";
import type {LessonDraft, QuizQuestionDraft} from "@/types/admin-ai-lesson";
import {useTranslations} from "next-intl";

interface LessonEditCanvasProps {
    lessonId: number;
    learningPathId: number;
    onReset: () => void;
}

export function LessonEditCanvas({
                                     lessonId,
                                     learningPathId,
                                     onReset,
                                 }: LessonEditCanvasProps) {
    const {data: lesson, isLoading, error} = useLesson(lessonId);
    const tAi = useTranslations("lessonForm.ai");
    const tVideo = useTranslations("lessonForm.video");
    const updateMutation = useUpdateLesson();
    const togglePublishMutation = useTogglePublishLesson();
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [isCodingAiOpen, setIsCodingAiOpen] = useState(false);
    const [draft, setDraft] = useState<LessonDraft | null>(null);
    const [draftRevision, setDraftRevision] = useState(0);

    useEffect(() => {
        const shouldOpen = sessionStorage.getItem(`open-ai-draft:${lessonId}`);
        const shouldOpenCodingStudio = sessionStorage.getItem(`open-coding-ai-studio:${lessonId}`);
        if (shouldOpen) {
            sessionStorage.removeItem(`open-ai-draft:${lessonId}`);
            queueMicrotask(() => setIsAiOpen(true));
        }
        if (shouldOpenCodingStudio) {
            sessionStorage.removeItem(`open-coding-ai-studio:${lessonId}`);
            queueMicrotask(() => setIsCodingAiOpen(true));
        }
    }, [lessonId]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <LessonPageSkeleton/>
            </div>
        );
    }

    if (error || !lesson) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="size-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                    <AlertCircle className="size-6"/>
                </div>
                <div>
                    <h3 className="font-bold text-base">Lesson Not Found</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        The selected lesson could not be loaded or has been deleted.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={onReset}>
                    <ArrowLeft className="size-3.5 mr-1.5"/>
                    Back to Learning Path
                </Button>
            </div>
        );
    }

    const editorLesson = draft ? mergeLessonDraft(lesson, draft) : lesson;
    const quizDraftQuestions: QuizQuestionDraft[] = draft?.type === "QUIZ" ? draft.questions ?? [] : [];

    const handleTitleChange = (newTitle: string) => {
        const baseData = lesson.type === "CODING"
            ? {
                type: "CODING" as const,
                title: newTitle,
                difficulty: lesson.difficulty,
                statement: lesson.statement ?? "",
                baseTimeLimitMs: lesson.baseTimeLimitMs,
                baseMemoryLimitMb: lesson.baseMemoryLimitMb,
                constraints: lesson.constraints ?? [],
                hints: lesson.hints ?? [],
                examples: lesson.examples ?? [],
                testCases: lesson.testCases ?? [],
                starterCode: lesson.starterCode,
            }
            : lesson.type === "THEORY"
                ? {
                    type: "THEORY" as const,
                    title: newTitle,
                    difficulty: lesson.difficulty,
                    content: lesson.content,
                    estimatedMinutes: lesson.estimatedMinutes,
                }
                : lesson.type === "QUIZ" ? {
                    type: "QUIZ" as const,
                    title: newTitle,
                    difficulty: lesson.difficulty,
                    passingScore: lesson.passingScore,
                    timeLimitMinutes: lesson.timeLimitMinutes,
                    questions: lesson.questions,
                } : {
                    type: "VIDEO" as const,
                    title: newTitle,
                    difficulty: lesson.difficulty,
                    description: lesson.description ?? undefined,
                };

        updateMutation.mutate({id: lessonId, data: baseData as LessonRequestDTO});
    };

    return (
        <div className="space-y-6">
            {/* Custom Lesson Header that matches local workspace */}
            <LessonHeader
                lesson={lesson}
                learningPathId={learningPathId}
                onTogglePublish={() => togglePublishMutation.mutate(lessonId)}
                onTitleChange={handleTitleChange}
                isEditPending={togglePublishMutation.isPending || updateMutation.isPending}
                publishDisabled={lesson.type === "VIDEO" && !lesson.isPublished && lesson.processingStatus !== "READY"}
                publishDisabledReason={lesson.type === "VIDEO" && !lesson.isPublished && lesson.processingStatus !== "READY" ? tVideo("publishDisabled") : undefined}
                action={lesson.type !== "CODING" && lesson.type !== "VIDEO" ? (
                    <Button variant="ai" size="sm" onClick={() => setIsAiOpen(true)}>
                        <Sparkles className="size-4"/>
                        {tAi("trigger")}
                    </Button>
                ) : undefined}
            />

            {/* Switch dynamically based on lesson type */}
            {editorLesson.type === "THEORY" && (
                <TheoryLessonDetail
                    key={`theory-${draftRevision}`}
                    lesson={editorLesson}
                    lessonId={lessonId}
                    learningPathId={learningPathId}
                    updateMutation={updateMutation}
                />
            )}

            {editorLesson.type === "CODING" && (
                <CodingLessonPanels
                    key={`coding-${draftRevision}`}
                    lesson={editorLesson}
                    lessonId={lessonId}
                    learningPathId={learningPathId}
                    updateMutation={updateMutation}
                    initialAiOpen={isCodingAiOpen}
                />
            )}

            {editorLesson.type === "QUIZ" && (
                <QuizLessonDetail
                    key={`quiz-${draftRevision}`}
                    lesson={editorLesson}
                    lessonId={lessonId}
                    learningPathId={learningPathId}
                    updateMutation={updateMutation}
                    draftQuestions={quizDraftQuestions}
                />
            )}

            {editorLesson.type === "VIDEO" && (
                <VideoLessonDetail
                    lesson={editorLesson}
                    lessonId={lessonId}
                    learningPathId={learningPathId}
                    updateMutation={updateMutation}
                />
            )}

            {lesson.type !== "CODING" && lesson.type !== "VIDEO" && (
                <AiLessonDraftDialog
                    lessonId={lessonId}
                    lessonType={lesson.type}
                    open={isAiOpen}
                    onOpenChange={setIsAiOpen}
                    onApply={(nextDraft) => {
                        setDraft(nextDraft);
                        setDraftRevision((revision) => revision + 1);
                    }}
                />
            )}
        </div>
    );
}
