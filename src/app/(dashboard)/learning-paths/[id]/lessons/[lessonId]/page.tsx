"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LessonHeader } from "@/components/learning-path/lesson-header";
import { LessonPageSkeleton } from "@/components/learning-path/lesson-skeleton";
import { CodingLessonPanels, QuizLessonDetail, TheoryLessonDetail } from "@/components/lesson-detail";
import { useLesson, useTogglePublishLesson, useUpdateLesson } from "@/hooks/use-lessons";
import { LessonRequestDTO } from "@/types/learning-path/schema";

export default function LessonDetailPage() {
    const params = useParams();
    const learningPathId = Number(params.id);
    const lessonId = Number(params.lessonId);

    const { data: lesson, isLoading } = useLesson(lessonId);
    const updateMutation = useUpdateLesson();
    const togglePublishMutation = useTogglePublishLesson();

    if (isLoading) {
        return <LessonPageSkeleton />;
    }

    if (!lesson) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
                <p className="text-muted-foreground">Lesson not found.</p>
                <Button variant="outline" render={<Link href={`/learning-paths/${learningPathId}`} />}>
                    <ArrowLeftIcon data-icon="inline-start" />
                    Back
                </Button>
            </div>
        );
    }

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
        <div className="flex flex-col gap-6">
            <LessonHeader
                lesson={lesson}
                learningPathId={learningPathId}
                onTogglePublish={() => togglePublishMutation.mutate(lessonId)}
                onTitleChange={handleTitleChange}
                isEditPending={togglePublishMutation.isPending || updateMutation.isPending}
            />

            {lesson.type === "CODING" && (
                <CodingLessonPanels
                    lesson={lesson}
                    lessonId={lessonId}
                    learningPathId={learningPathId}
                    updateMutation={updateMutation}
                />
            )}

            {lesson.type === "THEORY" && (
                <TheoryLessonDetail
                    lesson={lesson}
                    lessonId={lessonId}
                    learningPathId={learningPathId}
                    updateMutation={updateMutation}
                />
            )}

            {lesson.type === "QUIZ" && (
                <QuizLessonDetail
                    lesson={lesson}
                    lessonId={lessonId}
                    learningPathId={learningPathId}
                    updateMutation={updateMutation}
                />
            )}
        </div>
    );
}
