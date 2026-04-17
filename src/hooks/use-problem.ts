import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {post, put} from "@/api/core/http";
import {ProblemDetailAdmin} from "@/types/problem";
import {BasicInfo, ProgrammingLanguage} from "@/schemas/problem-wizard.schema";
import {getProblemDetail} from "@/api/services/problem-services";

interface TestCasePayload {
    input: string;
    expectedOutput: string;
    isSample: boolean;
    explanation?: string;
    orderIndex: number;
}

interface UpdateTestCasesPayload {
    language: ProgrammingLanguage;
    authorSolution: string;
    testCases: TestCasePayload[];
}

interface UpdateBasicPayload {
    title: string;
    slug: string;
    statement: string;
    difficulty: string;
    tags: Array<{ id: number; name: string }>;
}

interface UpdateAiContextPayload {
    algorithmicConcept: string;
    predefinedHints: string;
    edgeCasesToRemind: string;
}


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
            await Promise.all([
                queryClient.invalidateQueries({queryKey: ["admin-problem", problemId]}),
                queryClient.invalidateQueries({queryKey: ["admin-problems"]}),
            ]);
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
        mutationFn: async (data: UpdateBasicPayload) => put(`/api/v1/admin/problems/${problemId}`, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["admin-problem", problemId]});
            toast.success("Problem updated", {description: "Basic information saved successfully."});
        }
    });
}

export function useUpsertTestCases(problemId: number) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: UpdateTestCasesPayload) => post(`/api/v1/admin/problems/${problemId}/testcases`, data),
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
        mutationFn: async (data: UpdateAiContextPayload) => put(`/api/v1/admin/problems/${problemId}/ai-context`, data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: ["admin-problem", problemId]});
        }
    });
}
