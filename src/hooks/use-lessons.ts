"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryKeys} from "@/api/query-keys";
import {lessonService, LessonListParams} from "@/api/services/lesson-services";
import {LessonRequestDTO} from "@/types/learning-path/schema";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useLessonsByTopic(topicId: number, params?: LessonListParams) {
    return useQuery({
        queryKey: queryKeys.lessons.byTopic(topicId, params?.publishedOnly),
        queryFn: () => lessonService.listByTopic(topicId, params),
        enabled: !!topicId,
    });
}

export function useLesson(id: number) {
    return useQuery({
        queryKey: queryKeys.lessons.detail(id),
        queryFn: () => lessonService.getById(id),
        enabled: !!id,
    });
}

export function useLessonBySlug(slug: string) {
    return useQuery({
        queryKey: queryKeys.lessons.bySlug(slug),
        queryFn: () => lessonService.getBySlug(slug),
        enabled: !!slug,
    });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateLesson(topicId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LessonRequestDTO) =>
            lessonService.create(topicId, data),
        onSuccess: () => {
            toast.success("Lesson created successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.lessons.byTopic(topicId)});
            queryClient.invalidateQueries({queryKey: queryKeys.topics.detail(topicId)});
        },
    });
}

export function useUpdateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({id, data}: { id: number; data: LessonRequestDTO }) =>
            lessonService.update(id, data),
        onSuccess: (_, {id}) => {
            toast.success("Lesson updated successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.lessons.detail(id)});
            queryClient.invalidateQueries({queryKey: queryKeys.lessons.all});
        },
    });
}

export function useDeleteLesson(topicId?: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (lessonId: number) => lessonService.delete(lessonId),
        onSuccess: () => {
            toast.success("Lesson deleted successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.lessons.all});
            if (topicId) {
                queryClient.invalidateQueries({queryKey: queryKeys.topics.detail(topicId)});
            }
        },
    });
}

export function useTogglePublishLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (lessonId: number) => lessonService.togglePublish(lessonId),
        onSuccess: (_, lessonId) => {
            toast.success("Lesson publish status updated");
            queryClient.invalidateQueries({queryKey: queryKeys.lessons.detail(lessonId)});
            queryClient.invalidateQueries({queryKey: queryKeys.lessons.all});
        },
    });
}
