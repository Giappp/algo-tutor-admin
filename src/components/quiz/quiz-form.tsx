"use client";

import type React from "react";
import {
    QuizSettingsForm,
    type QuizSettingsFormHandle,
} from "@/components/quiz/quiz-settings-form";
import type {QuizLessonDTO} from "@/types/learning-path/schema";

export type QuizFormHandle = QuizSettingsFormHandle;

interface QuizFormProps {
    defaultValues?: Partial<QuizLessonDTO>;
    onSubmit: (data: QuizLessonDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    editMode?: boolean;
    formRef?: React.RefObject<QuizFormHandle | null>;
}

export function QuizForm(props: QuizFormProps) {
    return <QuizSettingsForm {...props} enableAutosave={false}/>;
}
