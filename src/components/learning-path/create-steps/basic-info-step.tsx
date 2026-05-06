"use client";

import {StepLayout} from "./step-layout";
import {LearningPathFields} from "@/components/learning-path/learning-path-form";
import {useLearningPathForm} from "@/components/learning-path/create-steps/form-context";

interface BasicInfoStepProps {
    onNext: () => void;
    onBack: () => void;
}

export function BasicInfoStep({onNext, onBack}: BasicInfoStepProps) {
    const {control, formState: {errors}, watch, register, setValue} =
        useLearningPathForm();

    return (
        <StepLayout
            stepNumber={1}
            title="Basic Information"
            subtitle="Define the identity and difficulty of your learning path."
            helpText="Start by giving your learning path a clear name and description. Think about what makes this path unique and who your target audience is. The learning goal helps learners understand the tangible skills they will gain."
            onNext={onNext}
            onBack={onBack}
            isFirstStep
            isNextDisabled={false}
        >
            <LearningPathFields
                control={control}
                errors={errors}
                watch={watch}
                register={register}
                setValue={setValue}
            />
        </StepLayout>
    );
}
