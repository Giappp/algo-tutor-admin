import {del, get, post, put} from "@/api/core/http";
import {CreateQuestionDTO} from "@/types/learning-path/schema";
import {QuizQuestion} from "@/types/learning-path";

export const quizService = {
    listByLesson: (lessonId: number): Promise<QuizQuestion[]> =>
        get<QuizQuestion[]>(`/api/v1/questions/lessons/${lessonId}`),

    create: (lessonId: number, data: CreateQuestionDTO) =>
        post<QuizQuestion>(`/api/v1/questions/lessons/${lessonId}`, data),

    update: (questionId: number, data: CreateQuestionDTO) =>
        put<QuizQuestion>(`/api/v1/questions/${questionId}`, data),

    delete: (questionId: number) =>
        del<void>(`/api/v1/questions/${questionId}`),
};
