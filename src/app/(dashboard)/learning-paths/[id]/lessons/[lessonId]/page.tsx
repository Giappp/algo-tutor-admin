"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonHeader } from "@/components/learning-path/lesson-header";
import { LessonPageSkeleton } from "@/components/learning-path/lesson-skeleton";
import { CodingLessonPanels, QuizLessonDetail, TheoryLessonDetail } from "@/components/lesson-detail";
import { useLesson, useTogglePublishLesson, useUpdateLesson } from "@/hooks/use-lessons";
import { LessonRequestDTO } from "@/types/learning-path/schema";
import { AiLessonDraftDialog } from "@/components/lesson-detail/ai-lesson-draft-dialog";
import { mergeLessonDraft } from "@/lib/admin-ai-lesson";
import type { LessonDraft, QuizQuestionDraft } from "@/types/admin-ai-lesson";
import { useTranslations } from "next-intl";

export default function LessonDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const tAi = useTranslations("lessonForm.ai");
    const learningPathId = Number(params.id);
    const lessonId = Number(params.lessonId);

    const { data: lesson, isLoading } = useLesson(lessonId);
    const updateMutation = useUpdateLesson();
    const togglePublishMutation = useTogglePublishLesson();
    const aiDestination = searchParams.get("openAi");
    const [isAiOpen, setIsAiOpen] = useState(() => aiDestination === "lesson-draft" || aiDestination === "true");
    const [isCodingAiOpen] = useState(() => aiDestination === "coding-studio");
    const [draft, setDraft] = useState<LessonDraft | null>(null);
    const [draftRevision, setDraftRevision] = useState(0);

    if (isLoading) {
        return <LessonPageSkeleton />;
    }

    if (!lesson) {
        return (
            <div className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center gap-4 py-16 text-center">
                <p className="text-muted-foreground">Lesson not found.</p>
                <Button variant="outline" render={<Link href={`/learning-paths/${learningPathId}`} />}>
                    <ArrowLeftIcon data-icon="inline-start" />
                    Back
                </Button>
            </div>
        );
    }

    const editorLesson = draft ? mergeLessonDraft(lesson, draft) : lesson;
    const quizDraftQuestions: QuizQuestionDraft[] = draft?.type === "QUIZ" ? draft.questions ?? [] : [];

    // Inline title save — constructs minimal update payload
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
                : {
                    type: "QUIZ" as const,
                    title: newTitle,
                    difficulty: lesson.difficulty,
                    passingScore: lesson.passingScore,
                    timeLimitMinutes: lesson.timeLimitMinutes,
                    questions: lesson.questions,
                };

        updateMutation.mutate({ id: lessonId, data: baseData as LessonRequestDTO });
    };

    return (
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-5">
            <LessonHeader
                lesson={lesson}
                learningPathId={learningPathId}
                onTogglePublish={() => togglePublishMutation.mutate(lessonId)}
                onTitleChange={handleTitleChange}
                isEditPending={togglePublishMutation.isPending || updateMutation.isPending}
                action={lesson.type !== "CODING" ? (
                    <Button variant="ai" size="sm" onClick={() => setIsAiOpen(true)}>
                        <Sparkles className="size-4"/>
                        {tAi("trigger")}
                    </Button>
                ) : undefined}
            />

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

            {editorLesson.type === "THEORY" && (
                <TheoryLessonDetail
                    key={`theory-${draftRevision}`}
                    lesson={editorLesson}
                    lessonId={lessonId}
                    learningPathId={learningPathId}
                    updateMutation={updateMutation}
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

            {lesson.type !== "CODING" && (
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
