import {del, get, post, put} from "@/api/core/http";
import {CreateQuestionRequest, QuizQuestion} from "@/types/learning-path";

export const quizService = {
    listByLesson: (lessonId: number): Promise<QuizQuestion> =>
        get<QuizQuestion>(`/api/v1/questions/lessons/${lessonId}`),

    create: (lessonId: number, data: CreateQuestionRequest) =>
        post<QuizQuestion>(`/api/v1/questions/lessons/${lessonId}`, data),

    update: (questionId: number, data: CreateQuestionRequest) =>
        put<QuizQuestion>(`/api/v1/questions/${questionId}`, data),

    delete: (questionId: number) =>
        del<void>(`/api/v1/questions/${questionId}`),
};
