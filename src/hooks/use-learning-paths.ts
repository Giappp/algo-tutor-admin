"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {queryKeys} from "@/api/query-keys";
import {
    LearningPathListParams,
    learningPathService,
} from "@/api/services/learning-path-services";
import {LearningPathRequestDTO} from "@/types/learning-path/schema";

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useLearningPaths(params?: LearningPathListParams) {
    return useQuery({
        queryKey: queryKeys.learningPaths.list(params),
        queryFn: () => learningPathService.list(params),
    });
}

export function useLearningPath(id: number) {
    return useQuery({
        queryKey: queryKeys.learningPaths.detail(id),
        queryFn: () => learningPathService.getById(id),
        enabled: !!id,
    });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export function useCreateLearningPath() {
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LearningPathRequestDTO) =>
            learningPathService.create(data),
        onSuccess: (result) => {
            toast.success("Learning path created successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.learningPaths.all});
            router.push(`/dashboard/learning-paths/${result.id}`);
        },
    });
}

export function useUpdateLearningPath(id: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: LearningPathRequestDTO) =>
            learningPathService.update(id, data),
        onSuccess: () => {
            toast.success("Learning path updated successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.learningPaths.detail(id)});
            queryClient.invalidateQueries({queryKey: queryKeys.learningPaths.all});
        },
    });
}

export function useDeleteLearningPath() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => learningPathService.delete(id),
        onSuccess: () => {
            toast.success("Learning path deleted successfully");
            queryClient.invalidateQueries({queryKey: queryKeys.learningPaths.all});
        },
    });
}

export function useTogglePublishLearningPath() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => learningPathService.togglePublish(id),
        onSuccess: (_, id) => {
            toast.success("Publish status updated");
            queryClient.invalidateQueries({queryKey: queryKeys.learningPaths.detail(id)});
            queryClient.invalidateQueries({queryKey: queryKeys.learningPaths.all});
        },
    });
}
