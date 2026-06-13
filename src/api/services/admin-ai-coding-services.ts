import {get, post} from "@/api/core/http";
import type {AiQuestionSource} from "@/types/admin-ai-question";
import type {
    CodingAiResponse,
    CodingEditorialDraft,
    CodingProblemDraft,
    GenerateCodingEditorialRequest,
    GenerateCodingProblemRequest,
    GenerateStarterCodeRequest,
    StarterCodeDraft,
} from "@/types/admin-ai-coding";

export const adminAiCodingService = {
    listSources: (lessonId: number) =>
        get<AiQuestionSource[]>(`/api/v1/admin/ai/coding-lessons/${lessonId}/sources`),

    generateProblem: (lessonId: number, data: GenerateCodingProblemRequest) =>
        post<CodingAiResponse<CodingProblemDraft>, GenerateCodingProblemRequest>(
            `/api/v1/admin/ai/coding-lessons/${lessonId}/generate-problem`,
            data,
            {timeout: 120_000},
        ),

    generateEditorial: (lessonId: number, data: GenerateCodingEditorialRequest) =>
        post<CodingAiResponse<CodingEditorialDraft>, GenerateCodingEditorialRequest>(
            `/api/v1/admin/ai/coding-lessons/${lessonId}/generate-editorial`,
            data,
            {timeout: 120_000},
        ),

    generateStarterCode: (lessonId: number, data: GenerateStarterCodeRequest) =>
        post<CodingAiResponse<StarterCodeDraft>, GenerateStarterCodeRequest>(
            `/api/v1/admin/ai/coding-lessons/${lessonId}/generate-starter-code`,
            data,
            {timeout: 120_000},
        ),
};
