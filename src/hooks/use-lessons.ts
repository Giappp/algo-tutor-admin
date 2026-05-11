"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {CreateLessonRequest,} from "@/types/learning-path";
import {lessonService} from "@/api/services/lesson-services";
import {UpdateLessonDTO} from "@/types/learning-path/schema";

export const QUERY_KEYS = {
    lessons: (topicId: number, publishedOnly?: boolean) =>
        ["lessons", topicId, publishedOnly] as const,
    lesson: (id: number) => ["lesson", id] as const,
    lessonBySlug: (slug: string) => ["lesson-slug", slug] as const,
};

export function useLessonsByTopic(topicId: number, publishedOnly = false) {
    return useQuery({
        queryKey: QUERY_KEYS.lessons(topicId, publishedOnly),
        queryFn: async () => {
            return await lessonService.listByTopic(topicId, publishedOnly);
        },
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
        mutationFn: (data: CreateLessonRequest) =>
            lessonService.create(topicId, data),
        onSuccess: () => {
            toast.success("Lesson created successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.lessons(topicId)});
            // Also invalidate the parent learning path so the topic lesson count updates
            queryClient.invalidateQueries({queryKey: ["learning-path", "topics"]});
        },
    });
}

export function useUpdateLesson(lessonId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateLessonDTO) =>
            lessonService.update(lessonId, data),
        onSuccess: () => {
            toast.success("Lesson updated successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.lesson(lessonId)});
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
