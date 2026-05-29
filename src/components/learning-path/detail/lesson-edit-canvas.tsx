"use client";

import {useLesson, useTogglePublishLesson, useUpdateLesson} from "@/hooks/use-lessons";
import {LessonHeader} from "@/components/learning-path/lesson-header";
import {LessonPageSkeleton} from "@/components/learning-path/lesson-skeleton";
import {CodingLessonPanels, QuizLessonDetail, TheoryLessonDetail} from "@/components/lesson-detail";
import {LessonRequestDTO} from "@/types/learning-path/schema";
import {Button} from "@/components/ui/button";
import {AlertCircle, ArrowLeft} from "lucide-react";

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
    const updateMutation = useUpdateLesson();
    const togglePublishMutation = useTogglePublishLesson();

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
            />

            {/* Switch dynamically based on lesson type */}
            {lesson.type === "THEORY" && (
                <TheoryLessonDetail
                    lesson={lesson}
                    lessonId={lessonId}
                    learningPathId={learningPathId}
                    updateMutation={updateMutation}
                />
            )}

            {lesson.type === "CODING" && (
                <CodingLessonPanels
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
