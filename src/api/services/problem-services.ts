import {ProblemDetailAdmin} from "@/types/problem";
import {get} from "@/api/core/http";

export const getProblemDetail = async (problemId: number): Promise<ProblemDetailAdmin> => {
    const response = await get<ProblemDetailAdmin>(`/api/v1/admin/problems/${problemId}`);
    return response as ProblemDetailAdmin;
}