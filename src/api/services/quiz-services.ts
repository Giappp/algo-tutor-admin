import {get, post, put, del, getPage} from "@/api/core/http";
import {QuizQuestion, CreateQuestionRequest} from "@/types/learning-path";
import {PaginatedResponse} from "@/api/core/http";

export const quizService = {
    listByLesson: (lessonId: number): Promise<PaginatedResponse<QuizQuestion>> =>
        getPage<QuizQuestion>(`/api/v1/questions/lessons/${lessonId}`),

    create: (lessonId: number, data: CreateQuestionRequest) =>
        post<QuizQuestion>(`/api/v1/questions/lessons/${lessonId}`, data),

    update: (questionId: number, data: CreateQuestionRequest) =>
        put<QuizQuestion>(`/api/v1/questions/${questionId}`, data),

    delete: (questionId: number) =>
        del<void>(`/api/v1/questions/${questionId}`),
};
