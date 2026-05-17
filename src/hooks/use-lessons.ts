"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {lessonService} from "@/api/services/lesson-services";
import {LessonRequestDTO} from "@/types/learning-path/schema";

export const QUERY_KEYS = {
    lessons: (topicId: number, publishedOnly?: boolean) =>
        ["lessons", topicId, publishedOnly] as const,
    lesson: (id: number) => ["lesson", id] as const,
    lessonBySlug: (slug: string) => ["lesson-slug", slug] as const,
};

export function useLessonsByTopic(topicId: number, publishedOnly = false) {
    return useQuery({
        queryKey: QUERY_KEYS.lessons(topicId, publishedOnly),
        queryFn: () => lessonService.listByTopic(topicId, publishedOnly),
        enabled: !!topicId,
    });
}

export function useLesson(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.lesson(id),
        queryFn: () => lessonService.getById(id),
        enabled: !!id,
    });
}

export function useLessonBySlug(slug: string) {
    return useQuery({
        queryKey: QUERY_KEYS.lessonBySlug(slug),
        queryFn: () => lessonService.getBySlug(slug),
        enabled: !!slug,
    });
}

export function useCreateLesson(topicId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LessonRequestDTO) =>
            lessonService.create(topicId, data),
        onSuccess: () => {
            toast.success("Lesson created successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.lessons(topicId)});
            // Also invalidate the parent learning path so the topic lesson count updates
            queryClient.invalidateQueries({queryKey: ["learning-path", "topics"]});
        },
    });
}

export function useUpdateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, data}: { id: number; data: LessonRequestDTO }) =>
            lessonService.update(id, data),
        onSuccess: (_, variables) => {
            toast.success("Lesson updated successfully");
            // Invalidate the specific lesson
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.lesson(variables.id)});
            // IMPORTANT: Also invalidate the lessons list so list views reflect the update (e.g., title changes)
            queryClient.invalidateQueries({queryKey: ["lessons"]});
        },
    });
}

export function useDeleteLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (lessonId: number) => lessonService.delete(lessonId),
        onSuccess: () => {
            toast.success("Lesson deleted successfully");
            queryClient.invalidateQueries({queryKey: ["lessons"]});
        },
    });
}

export function useTogglePublishLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (lessonId: number) => lessonService.togglePublish(lessonId),
        onSuccess: (_, lessonId) => {
            toast.success("Lesson publish status updated");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.lesson(lessonId)});
            queryClient.invalidateQueries({queryKey: ["lessons"]});
        },
    });
}
