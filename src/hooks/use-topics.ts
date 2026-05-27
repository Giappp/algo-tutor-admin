"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {queryKeys} from "@/api/query-keys";
import {topicService} from "@/api/services/topic-services";
import {TopicRequestDTO} from "@/types/learning-path/schema";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useTopicsByLearningPath(pathId: number) {
    return useQuery({
        queryKey: queryKeys.topics.byLearningPath(pathId),
        queryFn: () => topicService.listByLearningPath(pathId),
        enabled: !!pathId,
    });
}

export function useTopic(id: number) {
    return useQuery({
        queryKey: queryKeys.topics.detail(id),
        queryFn: () => topicService.getById(id),
        enabled: !!id,
    });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateTopic(pathId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TopicRequestDTO) =>
            topicService.create(pathId, data),
        onSuccess: () => {
            toast.success("Topic created successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.topics.byLearningPath(pathId)});
            queryClient.invalidateQueries({queryKey: queryKeys.learningPaths.detail(pathId)});
        },
    });
}

export function useUpdateTopic(topicId: number, pathId?: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: TopicRequestDTO) =>
            topicService.update(topicId, data),
        onSuccess: () => {
            toast.success("Topic updated successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.topics.detail(topicId)});
            if (pathId) {
                queryClient.invalidateQueries({queryKey: queryKeys.topics.byLearningPath(pathId)});
                queryClient.invalidateQueries({queryKey: queryKeys.learningPaths.detail(pathId)});
            }
        },
    });
}

export function useDeleteTopic(pathId?: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (topicId: number) => topicService.delete(topicId),
        onSuccess: () => {
            toast.success("Topic deleted successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.topics.all});
            if (pathId) {
                queryClient.invalidateQueries({queryKey: queryKeys.learningPaths.detail(pathId)});
            }
        },
    });
}
