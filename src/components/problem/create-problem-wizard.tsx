"use client";

import {useCallback} from "react";
import {useProblemDraftStore} from "@/store/problem-wizard.store";
import {Step1Basic} from "@/components/problem/wizard/step-1-basic";
import {Step2TestsCode} from "@/components/problem/wizard/step-2-tests-code";
import {Step3AiPublish} from "@/components/problem/wizard/step-3-ai-publish";
import {cn} from "@/lib/utils";

import {CheckIcon, FileTextIcon, FlaskConicalIcon, SparklesIcon} from "lucide-react";

// ── Step definitions ───────────────────────────────────────────
const STEPS = [
    {number: 1, label: "Basic Information", icon: FileTextIcon},
    {number: 2, label: "Test Cases & Solutions", icon: FlaskConicalIcon},
    {number: 3, label: "AI Context & Publish", icon: SparklesIcon},
] as const;

function WizardStepper({currentStep}: Readonly<{ currentStep: number }>) {
    return (
        <nav aria-label="Progress" className="mb-8">
            <ol className="flex items-center w-full">
                {STEPS.map((step, index) => {
                    const isCompleted = currentStep > step.number;
                    const isCurrent = currentStep === step.number;
                    const StepIcon = step.icon;

                    return (
                        <li
                            key={step.number}
                            className={cn(
                                "flex items-center",
                                index < STEPS.length - 1 && "flex-1"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                {/* Step circle */}
                                <div
                                    className={cn(
                                        "flex items-center justify-center size-10 rounded-full border-2 transition-all duration-300",
                                        isCompleted &&
                                        "border-primary bg-primary text-primary-foreground",
                                        isCurrent &&
                                        "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                                        !isCompleted &&
                                        !isCurrent &&
                                        "border-muted-foreground/30 text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckIcon className="size-5" data-icon="inline-center" />
                                    ) : (
                                        <StepIcon className="size-4.5" data-icon="inline-center" />
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-sm font-medium hidden sm:block transition-colors",
                                        isCurrent && "text-foreground",
                                        isCompleted && "text-primary",
                                        !isCompleted &&
                                        !isCurrent &&
                                        "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {/* Connector line */}
                            {index < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        "flex-1 h-0.5 mx-4 rounded-full transition-colors duration-300",
                                        isCompleted ? "bg-primary" : "bg-muted-foreground/20"
                                    )}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

// ── Main Wizard ────────────────────────────────────────────────
export function CreateProblemWizard() {
    const {currentStep, setCurrentStep} = useProblemDraftStore();

    const goToNext = useCallback(() => {
        setCurrentStep(Math.min(currentStep + 1, 3));
    }, [currentStep, setCurrentStep]);

    const goToBack = useCallback(() => {
        setCurrentStep(Math.max(currentStep - 1, 1));
    }, [currentStep, setCurrentStep]);

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Create New Problem</h1>
                <p className="text-muted-foreground mt-1">
                    Follow the steps below to create a new algorithm problem.
                </p>
            </div>

            {/* Stepper */}
            <WizardStepper currentStep={currentStep}/>

            {/* Step Content */}
            <div className="bg-card rounded-2xl border p-6 shadow-sm">
                {currentStep === 1 && <Step1Basic onNext={goToNext}/>}
                {currentStep === 2 && (
                    <Step2TestsCode onNext={goToNext} onBack={goToBack}/>
                )}
                {currentStep === 3 && <Step3AiPublish onBack={goToBack}/>}
            </div>
        </div>
    );
}
