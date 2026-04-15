import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {post, put} from "@/api/core/http";
import {ProblemDetailAdmin} from "@/types/problem";
import {BasicInfo} from "@/schemas/problem-wizard.schema";
import {getProblemDetail} from "@/api/services/problem-services";


export function useProblemDetail(problemId: number) {
    return useQuery<ProblemDetailAdmin>({
        queryKey: ["admin-problem", problemId],
        queryFn: () => getProblemDetail(problemId),
    });
}

export function usePublishProblem(problemId: number) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => put(`/api/v1/admin/problems/${problemId}/publish`),
        onSuccess: async () => {
            toast.success("Problem published successfully!");
            await queryClient.invalidateQueries({queryKey: ["admin-problem", problemId]});
            await queryClient.invalidateQueries({queryKey: ["admin-problems"]});
        }
    });
}


export function useCreateProblem() {
    return useMutation({
        mutationFn: async (data: BasicInfo) => post<{ id: number }>("/api/v1/admin/problems", data),
    });
}

export function useUpdateProblemBasic(problemId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => put(`/api/v1/admin/problems/${problemId}`, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["admin-problem", problemId]});
            toast.success("Problem updated", {description: "Basic information saved successfully."});
        }
    });
}

export function useUpsertTestCases(problemId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => post(`/api/v1/admin/problems/${problemId}/testcases`, data),
        onSuccess: async () => {
            // Invalidate to refresh problem detail
            await queryClient.invalidateQueries({queryKey: ["admin-problem", problemId]});
        }
    });
}

export function useUpsertModelSolution(problemId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: {
            code: string;
            language: string
        }) => post(`/api/v1/admin/problems/${problemId}/model-solution`, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["admin-problem", problemId]});
        }
    });
}

export function useUpsertAiContext(problemId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: any) => put(`/api/v1/admin/problems/${problemId}/ai-context`, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["admin-problem", problemId]});
        }
    });
}
