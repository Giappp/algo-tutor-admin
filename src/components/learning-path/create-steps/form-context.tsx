"use client";

import {createContext, useContext} from "react";
import {UseFormReturn} from "react-hook-form";
import {CreateLearningPath} from "@/types/learning-path/schema";

export const CreateLearningPathFormContext = createContext<
    UseFormReturn<CreateLearningPath> | null
>(null);

export function useLearningPathForm() {
    const ctx = useContext(CreateLearningPathFormContext);
    if (!ctx) {
        throw new Error("useLearningPathForm must be used within CreateLearningPathFormProvider");
    }
    return ctx;
}
