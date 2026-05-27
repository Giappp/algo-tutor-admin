"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowLeftIcon, BookOpenIcon, CodeIcon, FileQuestionIcon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {TheoryForm} from "@/components/learning-path/theory-form";
import {CodingLessonForm} from "@/components/learning-path/coding-lesson-form";
import {useCreateLesson} from "@/hooks/use-lessons";
import {useUnsavedChanges} from "@/hooks/use-unsaved-changes";
import {LessonType} from "@/types/learning-path";
import {CodingLessonDTO, LessonRequestDTO, QuizLessonDTO, TheoryLessonDTO} from "@/types/learning-path/schema";
import {QuizForm} from "@/components/quiz/quiz-form";

const LESSON_TYPES = [
    {
        type: "THEORY" as const,
        label: "Theory",
        description: "Rich text content with templates",
        icon: BookOpenIcon,
        iconClass: "text-blue-600 dark:text-blue-400",
        bgClass: "bg-blue-500/10",
        borderClass: "border-blue-500/30",
        activeClass: "ring-2 ring-blue-500/50 border-blue-500/50 bg-blue-500/5",
    },
    {
        type: "QUIZ" as const,
        label: "Quiz",
        description: "Multiple choice questions",
        icon: FileQuestionIcon,
        iconClass: "text-amber-600 dark:text-amber-400",
        bgClass: "bg-amber-500/10",
        borderClass: "border-amber-500/30",
        activeClass: "ring-2 ring-amber-500/50 border-amber-500/50 bg-amber-500/5",
    },
    {
        type: "CODING" as const,
        label: "Coding",
        description: "Problem with test cases & starter code",
        icon: CodeIcon,
        iconClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-500/10",
        borderClass: "border-emerald-500/30",
        activeClass: "ring-2 ring-emerald-500/50 border-emerald-500/50 bg-emerald-500/5",
    },
];

export default function CreateLessonPage() {
    const params = useParams();
    const router = useRouter();
    const learningPathId = Number(params.id);
    const topicId = Number(params.topicId);

    const createLessonMutation = useCreateLesson(topicId);
    const [selectedType, setSelectedType] = useState<LessonType | null>(null);
    const [hasStartedEditing, setHasStartedEditing] = useState(false);

    // Warn user before leaving with unsaved form data
    useUnsavedChanges(hasStartedEditing && !createLessonMutation.isPending);

    const handleSubmit = async (data: CodingLessonDTO | TheoryLessonDTO | QuizLessonDTO) => {
        const result = await createLessonMutation.mutateAsync(data as LessonRequestDTO);
        router.push(`/dashboard/learning-paths/${learningPathId}/lessons/${result.id}`);
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/dashboard/learning-paths/${learningPathId}`}/>}
                >
                    <ArrowLeftIcon className="size-4"/>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Create Lesson</h1>
                    <p className="text-sm text-muted-foreground">
                        Choose a type and fill in the content
                    </p>
                </div>
            </div>

            {/* Type Selector — always visible as tabs */}
            <div className="flex items-center gap-2 flex-wrap">
                {LESSON_TYPES.map((item) => {
                    const Icon = item.icon;
                    const isActive = selectedType === item.type;
                    return (
                        <button
                            key={item.type}
                            type="button"
                            onClick={() => {
                                setSelectedType(item.type);
                                setHasStartedEditing(true);
                            }}
                            className={`
                                flex items-center gap-2.5 rounded-lg border px-4 py-3 text-left transition-all
                                ${isActive
                                ? item.activeClass
                                : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                            }
                            `}
                        >
                            <div className={`flex items-center justify-center size-8 rounded-md ${item.bgClass}`}>
                                <Icon className={`size-4 ${item.iconClass}`}/>
                            </div>
                            <div>
                                <span className="text-sm font-semibold block">{item.label}</span>
                                <span className="text-xs text-muted-foreground">{item.description}</span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Form */}
            {!selectedType && (
                <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-16 gap-2">
                    <p className="text-muted-foreground text-sm">Select a lesson type above to get started</p>
                </div>
            )}

            {selectedType === "THEORY" && (
                <div className="rounded-lg border bg-card p-6">
                    <TheoryForm
                        onSubmit={handleSubmit}
                        isPending={createLessonMutation.isPending}
                        submitLabel="Create Lesson"
                    />
                </div>
            )}

            {selectedType === "QUIZ" && (
                <div className="rounded-lg border bg-card p-6">
                    <QuizForm
                        onSubmit={handleSubmit}
                        isPending={createLessonMutation.isPending}
                        submitLabel="Create Lesson"
                    />
                </div>
            )}

            {selectedType === "CODING" && (
                <div className="rounded-lg border bg-card p-6">
                    <CodingLessonForm
                        onSubmit={handleSubmit}
                        isPending={createLessonMutation.isPending}
                        submitLabel="Create Lesson"
                    />
                </div>
            )}
        </div>
    );
}
