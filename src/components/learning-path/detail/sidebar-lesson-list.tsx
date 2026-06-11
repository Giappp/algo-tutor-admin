"use client";

import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SidebarLessonItem } from "./sidebar-lesson-item";
import { lessonService } from "@/api/services/lesson-services";
import { queryKeys } from "@/api/query-keys";
import { Lesson } from "@/types/learning-path";
import { LessonRequestDTO } from "@/types/learning-path/schema";

interface ActiveItem {
    type: "path" | "topic" | "lesson" | "create-lesson";
    id?: number;
    topicId?: number;
}

interface SidebarLessonListProps {
    topicId: number;
    lessons: Lesson[];
    activeItem: ActiveItem;
    setActiveItem: (item: ActiveItem) => void;
}

export function SidebarLessonList({
    topicId,
    lessons,
    activeItem,
    setActiveItem,
}: SidebarLessonListProps) {
    const queryClient = useQueryClient();

    const handleDragEnd = async (result: DropResult) => {
        // Destination is invalid or dropped outside list
        if (!result.destination) return;

        const sourceIndex = result.source.index;
        const destIndex = result.destination.index;

        // No position change
        if (sourceIndex === destIndex) return;

        // 1. Locally compute reordered list
        const reordered = Array.from(lessons);
        const [removed] = reordered.splice(sourceIndex, 1);
        reordered.splice(destIndex, 0, removed);

        // 2. Identify which lessons shifted displayOrder
        const updates: { lesson: Lesson; newOrder: number }[] = [];
        reordered.forEach((lesson, index) => {
            const newOrder = index + 1;
            if (lesson.displayOrder !== newOrder) {
                updates.push({ lesson, newOrder });
            }
        });

        if (updates.length === 0) return;

        // Optimistically update React Query cache for instant visual feedback
        const previousLessons = queryClient.getQueryData(queryKeys.lessons.byTopic(topicId));
        queryClient.setQueryData(queryKeys.lessons.byTopic(topicId), { data: reordered });

        // 3. Persist displayOrder modifications in parallel to the backend
        try {
            await Promise.all(
                updates.map(({ lesson, newOrder }) => {
                    // Re-construct complete LessonRequestDTO as required by PUT
                    const updateData = {
                        type: lesson.type,
                        title: lesson.title,
                        difficulty: lesson.difficulty,
                        displayOrder: newOrder,
                        content: lesson.content,
                        statement: lesson.statement,
                        baseTimeLimitMs: lesson.baseTimeLimitMs,
                        baseMemoryLimitMb: lesson.baseMemoryLimitMb,
                        constraints: lesson.constraints,
                        hints: lesson.hints,
                        examples: lesson.examples,
                        starterCode: lesson.starterCode,
                        passingScore: lesson.passingScore,
                        timeLimitMinutes: lesson.timeLimitMinutes,
                        questions: lesson.questions,
                    };

                    return lessonService.update(lesson.id, updateData as LessonRequestDTO);
                })
            );

            toast.success("Lessons reordered successfully");
        } catch {
            // Revert cache on failure
            if (previousLessons) {
                queryClient.setQueryData(queryKeys.lessons.byTopic(topicId), previousLessons);
            }
            toast.error("Failed to reorder lessons");
        } finally {
            // Refresh to ensure full synchronization
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.byTopic(topicId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.lessons.all });
            queryClient.invalidateQueries({ queryKey: queryKeys.learningPaths.all });
        }
    };

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`droppable-lessons-${topicId}`}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-1 p-0.5 rounded-lg transition-colors ${snapshot.isDraggingOver ? "bg-muted/30 border border-dashed border-border" : "border border-transparent"
                            }`}
                    >
                        {lessons.map((lesson, index) => {
                            const isLessonActive = activeItem.type === "lesson" && activeItem.id === lesson.id;
                            return (
                                <SidebarLessonItem
                                    key={lesson.id}
                                    lesson={lesson}
                                    index={index}
                                    isActive={isLessonActive}
                                    onSelect={() => setActiveItem({ type: "lesson", id: lesson.id })}
                                />
                            );
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}
