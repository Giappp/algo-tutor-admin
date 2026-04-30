"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {CreateTopicRequest, UpdateTopicRequest,} from "@/types/learning-path";
import {topicService} from "@/api/services/topic-services";

export const QUERY_KEYS = {
    topics: (pathId: number) => ["topics", pathId] as const,
    topic: (id: number) => ["topic", id] as const,
};

export function useTopicsByLearningPath(pathId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.topics(pathId),
        queryFn: () => topicService.listByLearningPath(pathId),
        enabled: !!pathId,
    });
}

export function useTopic(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.topic(id),
        queryFn: () => topicService.getById(id),
        enabled: !!id,
    });
}

export function useCreateTopic(pathId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateTopicRequest) =>
            topicService.create(pathId, data),
        onSuccess: () => {
            toast.success("Topic created successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.topics(pathId)});
            queryClient.invalidateQueries({queryKey: ["learning-path"]});
        },
    });
}

export function useUpdateTopic(topicId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateTopicRequest) =>
            topicService.update(topicId, data),
        onSuccess: () => {
            toast.success("Topic updated successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.topic(topicId)});
        },
    });
}

export function useDeleteTopic() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (topicId: number) => topicService.delete(topicId),
        onSuccess: () => {
            toast.success("Topic deleted successfully");
            queryClient.invalidateQueries({queryKey: ["topics"]});
        },
    });
}
