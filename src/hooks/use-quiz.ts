"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";
import {QuestionRequestDTO} from "@/types/learning-path/schema";
import {quizService} from "@/api/services/quiz-services";
import {useTranslations} from "next-intl";

export const QUERY_KEYS = {
    questions: (lessonId: number) => ["questions", lessonId] as const,
    question: (id: number) => ["question", id] as const,
};

export function useQuestionsByLesson(lessonId: number) {
    return useQuery({
        queryKey: QUERY_KEYS.questions(lessonId),
        queryFn: () => quizService.listByLesson(lessonId),
        enabled: !!lessonId,
    });
}

export function useCreateQuestion(lessonId: number, options: {silent?: boolean} = {}) {
    const queryClient = useQueryClient();
    const t = useTranslations("lessonForm.questions.toast");
    return useMutation({
        mutationFn: (data: QuestionRequestDTO) =>
            quizService.create(lessonId, data as Parameters<typeof quizService.create>[1]),
        onSuccess: () => {
            if (!options.silent) toast.success(t("created"));
            queryClient.invalidateQueries({queryKey: QUERY_KEYS.questions(lessonId)});
        },
    });
}

export function useUpdateQuestion(questionId: number) {
    const queryClient = useQueryClient();
    const t = useTranslations("lessonForm.questions.toast");
    return useMutation({
        mutationFn: (data: QuestionRequestDTO) =>
            quizService.update(questionId, data as Parameters<typeof quizService.update>[1]),
        onSuccess: () => {
            toast.success(t("updated"));
            queryClient.invalidateQueries({queryKey: ["questions"]});
        },
    });
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient();
    const t = useTranslations("lessonForm.questions.toast");
    return useMutation({
        mutationFn: (questionId: number) => quizService.delete(questionId),
        onSuccess: () => {
            toast.success(t("deleted"));
            queryClient.invalidateQueries({queryKey: ["questions"]});
        },
    });
}
