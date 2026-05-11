"use client";

import {AlertCircleIcon, CheckCircleIcon, CircleIcon, RocketIcon, SaveIcon,} from "lucide-react";
import {cn} from "@/lib/utils";
import {StepLayout} from "./step-layout";
import {LearningPathPreviewCard} from "@/components/learning-path/preview-card";
import {Button} from "@/components/ui/button";
import {Separator} from "@/components/ui/separator";
import {useLearningPathForm} from "@/components/learning-path/create-steps/form-context";

interface ChecklistItem {
    label: string;
    isValid: boolean;
}

export function ReviewStep({
                               onSubmit,
                               onPublish,
                               isPending,
                               topicCount,
                               lessonCount,
                           }: {
    onSubmit: () => Promise<void>;
    onPublish: () => Promise<void>;
    isPending: boolean;
    topicCount: number;
    lessonCount: number;
}) {
    const {getValues} = useLearningPathForm();
    const values = getValues();

    const checklist: ChecklistItem[] = [
        {label: "Path name is set", isValid: !!values.name?.trim()},
        {label: "Description is written", isValid: !!values.description?.trim()},
        {label: "Learning goal is defined", isValid: !!values.goal?.trim()},
        {label: "At least one topic added", isValid: topicCount > 0},
        {label: "At least one lesson added", isValid: lessonCount > 0},
    ];

    const validCount = checklist.filter((item) => item.isValid).length;
    const allValid = validCount === checklist.length;

    return (
        <StepLayout
            stepNumber={3}
            title="Review & Publish"
            subtitle="Double-check your learning path before making it live."
            helpText="Review all the details below. You can go back to any step to make changes. When ready, publish to make it available to learners or save as a draft to continue later."
            onNext={allValid ? onPublish : onSubmit}
            nextLabel={allValid ? "Publish" : "Save Draft"}
            isLastStep
        >
            <div className="flex flex-col gap-6">
                {/* Preview card */}
                <div>
                    <div className="mb-3 flex items-center gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
                        <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent rounded-full"/>
                    </div>
                    <LearningPathPreviewCard
                        name={values.name || "Untitled Learning Path"}
                        description={values.description}
                        level={values.level}
                        thumbnailUrl={values.thumbnailUrl || undefined}
                        lessonCount={lessonCount}
                        topicCount={topicCount}
                    />
                </div>

                {/* Checklist */}
                <div>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">Completion Checklist</h3>
                        <span className="text-xs text-muted-foreground">
                            {validCount} of {checklist.length} complete
                        </span>
                    </div>
                    <div className="rounded-xl border bg-card">
                        {checklist.map((item, index) => (
                            <div key={index}>
                                <div className="flex items-center gap-3 px-4 py-3">
                                    {item.isValid ? (
                                        <CheckCircleIcon className="size-4 shrink-0 text-emerald-500"/>
                                    ) : (
                                        <CircleIcon className="size-4 shrink-0 text-muted-foreground/40"/>
                                    )}
                                    <span className={cn(
                                        "text-sm",
                                        item.isValid ? "text-foreground" : "text-muted-foreground"
                                    )}>
                                        {item.label}
                                    </span>
                                    {!item.isValid && (
                                        <span className="ml-auto text-xs text-amber-600 dark:text-amber-400">
                                            Missing
                                        </span>
                                    )}
                                </div>
                                {index < checklist.length - 1 && (
                                    <Separator className="mx-4"/>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info callout */}
                {!allValid && (
                    <div
                        className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
                        <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"/>
                        <div>
                            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                                Not ready to publish
                            </p>
                            <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-300">
                                Complete all items above. You can still save as a draft and continue building later.
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
                    <h3 className="text-sm font-medium">Next Action</h3>
                    <div className="flex flex-col gap-2">
                        <Button
                            variant="default"
                            onClick={onPublish}
                            disabled={isPending || !allValid}
                            className="gap-2 bg-gradient-to-r from-chart-1 to-chart-2 hover:opacity-90"
                        >
                            <RocketIcon data-icon="inline-start" className="size-4"/>
                            {isPending ? "Publishing..." : "Publish Learning Path"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onSubmit}
                            disabled={isPending}
                            className="gap-2"
                        >
                            <SaveIcon data-icon="inline-start" className="size-4"/>
                            {isPending ? "Saving..." : "Save as Draft"}
                        </Button>
                    </div>
                </div>
            </div>
        </StepLayout>
    );
}
