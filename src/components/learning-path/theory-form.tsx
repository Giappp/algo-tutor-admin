"use client";

import type React from "react";
import {
    TheoryContentForm,
    type TheoryContentFormHandle,
} from "@/components/learning-path/theory-content-form";
import type {TheoryLessonDTO} from "@/types/learning-path/schema";

export type TheoryFormHandle = TheoryContentFormHandle;

interface TheoryFormProps {
    defaultValues?: Partial<TheoryLessonDTO>;
    onSubmit: (data: TheoryLessonDTO) => Promise<void>;
    isPending?: boolean;
    submitLabel?: string;
    formRef?: React.RefObject<TheoryFormHandle | null>;
    lessonId?: number;
}

export function TheoryForm(props: TheoryFormProps) {
    return <TheoryContentForm {...props} enableAutosave={false}/>;
}
