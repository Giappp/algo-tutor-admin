"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {CreateLearningPathRequest, UpdateLearningPathRequest,} from "@/types/learning-path";
import {LearningPathListParams, learningPathService,} from "@/api/services/learning-path-services";

export const QUERY_KEYS = {
    learningPaths: (params?: LearningPathListParams) =>
        ["learning-paths", params] as const,
    learningPath: (id: number) => ["learning-path", id] as const,
};

export function useLearningPaths(params?: LearningPathListParams) {
    return useQuery({
        queryKey: QUERY_KEYS.learningPaths(params),
        queryFn: () => learningPathService.list(params),
    });
}

export function useLearningPath(id: number) {
    return useQuery({
        queryKey: QUERY_KEYS.learningPath(id),
        queryFn: () => learningPathService.getById(id),
        enabled: !!id,
    });
}

export function useCreateLearningPath() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateLearningPathRequest) =>
            learningPathService.create(data),
        onSuccess: (result) => {
            toast.success("Learning path created successfully");
            queryClient.invalidateQueries({queryKey: ["learning-paths"]});
            router.push(`/dashboard/learning-paths/${result.id}`);
        },
    });
}

export function useUpdateLearningPath(id: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateLearningPathRequest) =>
            learningPathService.update(id, data),
        onSuccess: () => {
            toast.success("Learning path updated successfully");
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.learningPath(id)});
            queryClient.invalidateQueries({queryKey: ["learning-paths"]});
        },
    });
}

export function useDeleteLearningPath() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => learningPathService.delete(id),
        onSuccess: () => {
            toast.success("Learning path deleted successfully");
            queryClient.invalidateQueries({queryKey: ["learning-paths"]});
        },
    });
}

export function useTogglePublishLearningPath() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => learningPathService.togglePublish(id),
        onSuccess: () => {
            toast.success("Publish status updated");
            queryClient.invalidateQueries({queryKey: ["learning-paths"]});
        },
    });
}
