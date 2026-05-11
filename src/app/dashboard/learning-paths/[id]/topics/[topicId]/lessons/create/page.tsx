"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {
    ArrowLeftIcon,
    BookOpenIcon,
    CheckCircle2,
    ChevronRightIcon,
    CodeIcon,
    FileQuestionIcon,
    GraduationCapIcon,
    PenLineIcon,
    TerminalIcon,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {TheoryForm} from "@/components/learning-path/theory-form";
import {CodingLessonForm} from "@/components/learning-path/coding-lesson-form";
import {useCreateLesson} from "@/hooks/use-lessons";
import {CreateLessonRequest, LessonType} from "@/types/learning-path";
import {CreateCodingLessonDTO, CreateQuizLessonDTO, CreateTheoryLessonDTO} from "@/types/learning-path/schema";
import {QuizForm} from "@/components/quiz/quiz-form";

type CreationPhase = "type-selection" | "form-creation";

const LESSON_TYPES = [
    {
        type: "THEORY" as const,
        label: "Theory",
        description: "Text-based lessons with rich content",
        icon: BookOpenIcon,
        color: "blue",
        bgColor: "bg-blue-500/10",
        borderColor: "border-blue-500/30",
        iconColor: "text-blue-500",
        hoverBg: "hover:bg-blue-500/10",
        features: [
            {icon: PenLineIcon, text: "Rich text editor with live preview"},
            {icon: CheckCircle2, text: "Structured content with headings & lists"},
            {icon: CheckCircle2, text: "Markdown & LaTeX support"},
        ],
    },
    {
        type: "QUIZ" as const,
        label: "Quiz",
        description: "Knowledge checks with multiple choice questions",
        icon: GraduationCapIcon,
        color: "amber",
        bgColor: "bg-amber-500/10",
        borderColor: "border-amber-500/30",
        iconColor: "text-amber-500",
        hoverBg: "hover:bg-amber-500/10",
        features: [
            {icon: FileQuestionIcon, text: "Single, multiple choice & true/false"},
            {icon: CheckCircle2, text: "Configurable passing score & time limit"},
            {icon: CheckCircle2, text: "Add questions after creation"},
        ],
    },
    {
        type: "CODING" as const,
        label: "Coding",
        description: "Programming challenges with test cases and solutions",
        icon: CodeIcon,
        color: "emerald",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        iconColor: "text-emerald-500",
        hoverBg: "hover:bg-emerald-500/10",
        features: [
            {icon: TerminalIcon, text: "Test cases with verification"},
            {icon: CheckCircle2, text: "Author solution with Monaco editor"},
            {icon: CheckCircle2, text: "Starter code for Java, C++, Python"},
        ],
    },
];

export default function CreateLessonPage() {
    const params = useParams();
    const router = useRouter();
    const learningPathId = Number(params.id);
    const topicId = Number(params.topicId);

    const createLessonMutation = useCreateLesson(topicId);

    const [phase, setPhase] = useState<CreationPhase>("type-selection");
    const [selectedType, setSelectedType] = useState<LessonType | null>(null);

    const handleTypeSelect = (type: LessonType) => {
        setSelectedType(type);
        setPhase("form-creation");
    };

    const handleBackToSelection = () => {
        setPhase("type-selection");
        setSelectedType(null);
    };

    const handleSubmit = async (data: CreateCodingLessonDTO | CreateTheoryLessonDTO | CreateQuizLessonDTO) => {
        const result = await createLessonMutation.mutateAsync(data as CreateLessonRequest);
        router.push(
            `/dashboard/learning-paths/${learningPathId}/lessons/${result.id}`
        );
    };

    // Phase 1: Type Selection
    if (phase === "type-selection") {
        return (
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8">
                    <div
                        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.15),transparent_50%)]"/>
                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                nativeButton={true}
                                variant="ghost"
                                size="icon-sm"
                                className="shrink-0"
                                render={<Link href={`/dashboard/learning-paths/${learningPathId}`}/>}
                            >
                                <ArrowLeftIcon data-icon="inline-start"/>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                    Create Lesson
                                </h1>
                                <p className="text-muted-foreground">
                                    Choose the type of lesson you want to create.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Type Selection Cards */}
                <div className="grid gap-4 sm:grid-cols-3">
                    {LESSON_TYPES.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.type}
                                type="button"
                                onClick={() => handleTypeSelect(item.type)}
                                className={`
                                    group relative flex flex-col rounded-2xl border-2 
                                    ${item.borderColor} ${item.bgColor} ${item.hoverBg}
                                    p-6 text-left transition-all duration-200
                                    hover:scale-[1.02] hover:shadow-lg
                                    active:scale-[0.98]
                                `}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`
                                        flex items-center justify-center size-12 rounded-xl
                                        bg-background/80 shadow-sm
                                        transition-transform duration-200 group-hover:scale-110
                                    `}>
                                        <Icon className={`size-6 ${item.iconColor}`}/>
                                    </div>
                                    <ChevronRightIcon className={`
                                        size-5 text-muted-foreground
                                        opacity-0 transition-opacity duration-200
                                        group-hover:opacity-100
                                    `}/>
                                </div>

                                <div className="mb-4">
                                    <span className="text-lg font-bold text-foreground mb-1">
                                        {item.label}
                                    </span>
                                    <p className="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="space-y-2 mt-auto">
                                    {item.features.map((feature, idx) => {
                                        const FeatureIcon = feature.icon;
                                        return (
                                            <div key={idx}
                                                 className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <FeatureIcon className={`size-3.5 ${item.iconColor} shrink-0`}/>
                                                <span>{feature.text}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Phase 2: Form Creation
    const selectedItem = LESSON_TYPES.find((t) => t.type === selectedType);
    if (!selectedItem) {
        setPhase("type-selection");
        return null;
    }
    const SelectedIcon = selectedItem!.icon;

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent p-6 sm:p-8">
                <div
                    className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(120,119,198,0.15),transparent_50%)]"/>
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            className="shrink-0"
                            onClick={handleBackToSelection}
                        >
                            <ArrowLeftIcon data-icon="inline-start"/>
                        </Button>
                        <div
                            className={`flex items-center justify-center size-10 rounded-xl ${selectedItem!.bgColor} shadow-sm`}>
                            <SelectedIcon className={`size-5 ${selectedItem!.iconColor}`}/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                Create {selectedItem!.label} Lesson
                            </h1>
                            <p className="text-muted-foreground text-sm">
                                {selectedItem!.type === "THEORY" && "Write and format your lesson content"}
                                {selectedItem!.type === "QUIZ" && "Set up quiz settings, then add questions"}
                                {selectedItem!.type === "CODING" && "Build your coding challenge step by step"}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleBackToSelection}>
                        Change Type
                    </Button>
                </div>
            </div>

            {/* Form */}
            <Card>
                <CardContent className="p-6">
                    {selectedType === "CODING" ? (
                        <CodingLessonForm
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel="Create Lesson"
                        />
                    ) : selectedType === "THEORY" ? (
                        <TheoryForm
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel="Create Lesson"
                        />
                    ) : (
                        <QuizForm
                            onSubmit={handleSubmit}
                            isPending={createLessonMutation.isPending}
                            submitLabel="Create Lesson"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
