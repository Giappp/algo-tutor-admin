import { create } from "zustand";
import type { Step1Data, Step2Data, Step3Data } from "@/schemas/problem-wizard.schema";

type ProblemDraftState = {
    problemId: number | null;
    currentStep: number;
    step1Data: Step1Data | null;
    step2Data: Step2Data | null;
    step3Data: Step3Data | null;
};

type ProblemDraftActions = {
    setProblemId: (id: number) => void;
    setCurrentStep: (step: number) => void;
    setStep1: (data: Step1Data) => void;
    setStep2: (data: Step2Data) => void;
    setStep3: (data: Step3Data) => void;
    reset: () => void;
};

const initialState: ProblemDraftState = {
    problemId: null,
    currentStep: 1,
    step1Data: null,
    step2Data: null,
    step3Data: null,
};

export const useProblemDraftStore = create<ProblemDraftState & ProblemDraftActions>()(
    (set) => ({
        ...initialState,
        setProblemId: (id) => set({ problemId: id }),
        setCurrentStep: (step) => set({ currentStep: step }),
        setStep1: (data) => set({ step1Data: data }),
        setStep2: (data) => set({ step2Data: data }),
        setStep3: (data) => set({ step3Data: data }),
        reset: () => set(initialState),
    })
);
