import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {get, put} from "@/api/core/http";
import {PageResponse, ProblemSummaryAdmin} from "@/types/problem";
import {toAppError} from "@/api/core/api-error";

interface ProblemListParams {
    page: number;
    size: number;
}

export function useProblemsList(params: ProblemListParams) {
    return useQuery<PageResponse<ProblemSummaryAdmin>>({
        queryKey: ["admin-problems", params],
        queryFn: () => get<PageResponse<ProblemSummaryAdmin>>(`/api/v1/admin/problems?page=${params.page}&size=${params.size}&sort=createdAt,desc`),
    });
}

export function useArchiveProblem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => put(`/api/v1/admin/problems/${id}/archive`),
        onSuccess: () => {
            toast.success("Problem archived successfully.");
            queryClient.invalidateQueries({queryKey: ["admin-problems"]});
        },
        onError: (err) => {
            const appError = toAppError(err);
            toast.error(appError.message);
        }
    });
}

export function useUnarchiveProblem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => put(`/api/v1/admin/problems/${id}/unarchive`),
        onSuccess: () => {
            toast.success("Problem unarchived successfully. It is now DRAFT.");
            queryClient.invalidateQueries({queryKey: ["admin-problems"]});
        },
        onError: (err) => {
            const appError = toAppError(err);
            toast.error(appError.message);
        }
    });
}
