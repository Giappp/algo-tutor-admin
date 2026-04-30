"use client";

import {useRef, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {
    ArrowLeftIcon,
    BookOpenIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    CodeIcon,
    GraduationCapIcon,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {LessonForm} from "@/components/learning-path/lesson-form";
import {StepIndicator} from "@/components/learning-path/step-indicator";
import {useCreateLesson} from "@/hooks/use-lessons";
import {CreateLessonRequest, LessonType} from "@/types/learning-path";
// Steps for CODING lessons
const CODING_STEPS = [
    {id: "basic", label: "Basic Info", description: "Title & description"},
    {id: "setup", label: "Problem Setup", description: "Limits & constraints"},
    {id: "starter", label: "Starter Code", description: "Code templates"},
    {id: "examples", label: "Examples", description: "Test cases & hints"},
];

// Steps for QUIZ lessons
const QUIZ_STEPS = [
    {id: "basic", label: "Basic Info", description: "Title & content"},
    {id: "settings", label: "Quiz Settings", description: "Time & passing score"},
];

// Steps for THEORY lessons
const THEORY_STEPS = [
    {id: "content", label: "Content", description: "Write your lesson"},
];

const LESSON_TYPE_ICONS: Record<LessonType, React.ReactNode> = {
    THEORY: <BookOpenIcon className="size-5" />,
    QUIZ: <GraduationCapIcon className="size-5" />,
    CODING: <CodeIcon className="size-5" />,
};

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
    THEORY: "Theory",
    QUIZ: "Quiz",
    CODING: "Coding",
};

const LESSON_TYPE_COLORS: Record<LessonType, string> = {
    THEORY: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    QUIZ: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    CODING: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
};

function getStepsForType(type: LessonType) {
    switch (type) {
        case "CODING":
            return CODING_STEPS;
        case "QUIZ":
            return QUIZ_STEPS;
        default:
            return THEORY_STEPS;
    }
}

export default function CreateLessonPage() {
    const params = useParams();
    const router = useRouter();
    const learningPathId = Number(params.id);
    const topicId = Number(params.topicId);

    const createLessonMutation = useCreateLesson(topicId);

    const [currentStep, setCurrentStep] = useState(0);
    const [lessonType, setLessonType] = useState<LessonType>("THEORY");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formRef = useRef<any>(null);

    const steps = getStepsForType(lessonType);
    const totalSteps = steps.length;

    const handleSubmit = async () => {
        if (!formRef.current) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (formRef.current as any)();
    };

    const handleLessonTypeChange = (type: LessonType) => {
        setLessonType(type);
        setCurrentStep(0);
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Hero Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.15),transparent_50%)]" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0"
                            render={<Link href={`/dashboard/learning-paths/${learningPathId}`} />}
                        >
                            <ArrowLeftIcon data-icon="inline-start" />
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center size-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20">
                                {LESSON_TYPE_ICONS[lessonType]}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    Add Lesson
                                </h1>
                                <p className="text-muted-foreground">
                                    Fill in the lesson details below.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        render={<Link href={`/dashboard/learning-paths/${learningPathId}`} />}
                    >
                        Cancel
                    </Button>
                </div>
            </div>

            {/* Step Indicator */}
            <StepIndicator
                steps={steps}
                currentStep={currentStep}
                onStepClick={(index) => {
                    if (index <= currentStep) {
                        setCurrentStep(index);
                    }
                }}
            />

            {/* Main Content: Form + Sidebar */}
            <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
                {/* Form */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>{steps[currentStep]?.label}</CardTitle>
                                <span className="text-sm text-muted-foreground">
                                    Step {currentStep + 1} of {totalSteps}
                                </span>
                            </div>
                            {steps[currentStep]?.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                    {steps[currentStep].description}
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            <LessonForm
                                onSubmit={async (data) => {
                                    const result = await createLessonMutation.mutateAsync(
                                        data as unknown as CreateLessonRequest
                                    );
                                    router.push(
                                        `/dashboard/learning-paths/${learningPathId}/lessons/${result.id}`
                                    );
                                }}
                                isPending={createLessonMutation.isPending}
                                submitLabel="Create Lesson"
                                currentStep={currentStep}
                                onStepChange={setCurrentStep}
                                externalStepControl
                                formRef={formRef}
                                defaultValues={{type: lessonType}}
                            />
                        </CardContent>
                    </Card>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between gap-3 mt-4">
                        <div>
                            {currentStep > 0 ? (
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep((p) => p - 1)}
                                >
                                    <ChevronLeftIcon data-icon="inline-start" />
                                    Previous
                                </Button>
                            ) : (
                                <div />
                            )}
                        </div>
                        <div className="flex gap-3">
                            {currentStep < totalSteps - 1 ? (
                                <Button onClick={() => setCurrentStep((p) => p + 1)}>
                                    Next
                                    <ChevronRightIcon data-icon="inline-end" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={createLessonMutation.isPending}
                                >
                                    {createLessonMutation.isPending
                                        ? "Creating..."
                                        : "Create Lesson"}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Lesson Type Selector + Tips */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Lesson Type Selector */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Lesson Type</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {(["THEORY", "QUIZ", "CODING"] as LessonType[]).map((type) => {
                                const Icon = LESSON_TYPE_ICONS[type];
                                const isSelected = lessonType === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleLessonTypeChange(type)}
                                        className={`
                                            w-full flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all
                                            ${
                                                isSelected
                                                    ? `border-primary ${LESSON_TYPE_COLORS[type]} bg-muted/50`
                                                    : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                                            }
                                        `}
                                    >
                                        <div
                                            className={`
                                                flex items-center justify-center size-9 rounded-lg shrink-0
                                                ${
                                                    isSelected
                                                        ? LESSON_TYPE_COLORS[type]
                                                        : "bg-muted text-muted-foreground"
                                                }
                                            `}
                                        >
                                            {Icon}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-semibold text-sm">
                                                {LESSON_TYPE_LABELS[type]}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {type === "THEORY" && "Text-based lessons"}
                                                {type === "QUIZ" && "Knowledge checks"}
                                                {type === "CODING" && "Programming challenges"}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Tips Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">
                                {lessonType === "THEORY" && "Theory Lesson Tips"}
                                {lessonType === "QUIZ" && "Quiz Lesson Tips"}
                                {lessonType === "CODING" && "Coding Lesson Tips"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            {lessonType === "THEORY" && (
                                <>
                                    <p>
                                        Use Markdown to format your content with headings, lists, and code
                                        blocks.
                                    </p>
                                    <p>
                                        Keep lessons focused on a single concept for better retention.
                                    </p>
                                </>
                            )}
                            {lessonType === "QUIZ" && (
                                <>
                                    <p>Set a reasonable passing score (70% is recommended).</p>
                                    <p>
                                        Include explanations for correct answers to aid learning.
                                    </p>
                                    <p>You can add questions after creating the lesson.</p>
                                </>
                            )}
                            {lessonType === "CODING" && (
                                <>
                                    <p>
                                        After creating, you will be redirected to add test cases and
                                        editorials.
                                    </p>
                                    <p>
                                        Starter code is optional — learners can start from scratch.
                                    </p>
                                    <p>
                                        Hidden test cases are used for grading without revealing the
                                        inputs.
                                    </p>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
