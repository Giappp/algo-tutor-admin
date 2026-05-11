"use client";

import {useState} from "react";
import {
    BookOpenIcon,
    BrainCircuitIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    CodeIcon,
    GripVerticalIcon,
    LayersIcon,
    PlusIcon,
    TrashIcon,
} from "lucide-react";
import {cn} from "@/lib/utils";
import {StepLayout} from "./step-layout";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Badge} from "@/components/ui/badge";

interface TopicItem {
    id: string;
    name: string;
    description: string;
    lessons: LessonItem[];
    isExpanded: boolean;
}

interface LessonItem {
    id: string;
    type: "THEORY" | "QUIZ" | "CODING";
    title: string;
}

const LESSON_TYPES = [
    {
        type: "THEORY" as const,
        label: "Theory",
        description: "Rich text content",
        icon: BookOpenIcon,
        color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    },
    {
        type: "QUIZ" as const,
        label: "Quiz",
        description: "Questions & answers",
        icon: BrainCircuitIcon,
        color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    },
    {
        type: "CODING" as const,
        label: "Coding",
        description: "Programming challenge",
        icon: CodeIcon,
        color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    },
];

function getLessonTypeMeta(type: LessonItem["type"]) {
    return LESSON_TYPES.find((t) => t.type === type) ?? LESSON_TYPES[0];
}

function EmptyTopicsState() {
    return (
        <div
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center">
            <div
                className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/40">
                <LayersIcon className="size-7 text-emerald-500 dark:text-emerald-400"/>
            </div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">No topics yet</h3>
            <p className="mb-6 max-w-xs text-xs text-muted-foreground">
                Break your learning path into topics to keep content organized and easy to follow.
            </p>
            <Button size="sm">
                <PlusIcon data-icon="inline-start" className="size-4"/>
                Add First Topic
            </Button>
        </div>
    );
}

function TopicCard({
                       topic,
                       index,
                       onUpdate,
                       onDelete,
                       onToggleExpand,
                   }: {
    topic: TopicItem;
    index: number;
    onUpdate: (id: string, updates: Partial<TopicItem>) => void;
    onDelete: (id: string) => void;
    onToggleExpand: (id: string) => void;
}) {
    const totalLessons = topic.lessons.length;

    return (
        <div className="group relative overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-sm">
            {/* Left accent */}
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500"/>

            <div className="pl-4">
                {/* Topic Header */}
                <div className="flex items-center gap-3 px-4 py-4">
                    <div className="cursor-grab opacity-0 transition-opacity group-hover:opacity-100">
                        <GripVerticalIcon className="size-4 text-muted-foreground"/>
                    </div>

                    <div
                        className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs font-bold">
                        {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                        <Input
                            value={topic.name}
                            onChange={(e) => onUpdate(topic.id, {name: e.target.value})}
                            placeholder="Topic name (e.g. Arrays & Lists)"
                            className="h-7 border-transparent bg-transparent px-0 text-sm font-medium shadow-none focus-visible:border-input focus-visible:bg-background hover:bg-background hover:shadow-sm"
                        />
                    </div>

                    <Badge variant="secondary" className="shrink-0 text-xs">
                        {totalLessons} {totalLessons === 1 ? "lesson" : "lessons"}
                    </Badge>

                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onToggleExpand(topic.id)}
                        className="shrink-0"
                    >
                        {topic.isExpanded ? (
                            <ChevronDownIcon className="size-4"/>
                        ) : (
                            <ChevronRightIcon className="size-4"/>
                        )}
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => onDelete(topic.id)}
                        className="shrink-0 text-destructive/60 hover:text-destructive"
                    >
                        <TrashIcon className="size-4"/>
                    </Button>
                </div>

                {/* Expanded Content */}
                {topic.isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3">
                        {/* Topic description */}
                        <Input
                            value={topic.description}
                            onChange={(e) => onUpdate(topic.id, {description: e.target.value})}
                            placeholder="Brief description of this topic (optional)"
                            className="mb-4 h-8 text-xs"
                        />

                        {/* Lessons */}
                        <div className="space-y-2">
                            {topic.lessons.map((lesson) => {
                                const meta = getLessonTypeMeta(lesson.type);
                                return (
                                    <div
                                        key={lesson.id}
                                        className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2"
                                    >
                                        <GripVerticalIcon
                                            className="size-3.5 shrink-0 cursor-grab text-muted-foreground/50"/>
                                        <div className={cn("shrink-0 rounded-md border p-1", meta.color)}>
                                            <meta.icon className="size-3"/>
                                        </div>
                                        <Input
                                            value={lesson.title}
                                            onChange={(e) => {
                                                const updated = topic.lessons.map((l) =>
                                                    l.id === lesson.id ? {...l, title: e.target.value} : l
                                                );
                                                onUpdate(topic.id, {lessons: updated});
                                            }}
                                            placeholder={`${meta.label} lesson title`}
                                            className="h-7 flex-1 border-transparent bg-transparent px-0 text-xs shadow-none focus-visible:border-input focus-visible:bg-background hover:bg-background hover:shadow-sm"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon-xs"
                                            onClick={() => {
                                                const updated = topic.lessons.filter((l) => l.id !== lesson.id);
                                                onUpdate(topic.id, {lessons: updated});
                                            }}
                                            className="shrink-0 text-muted-foreground/50 hover:text-destructive"
                                        >
                                            <TrashIcon className="size-3"/>
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add lesson buttons */}
                        <div className="mt-3 flex gap-2">
                            {LESSON_TYPES.map((lt) => (
                                <Button
                                    key={lt.type}
                                    variant="outline"
                                    size="xs"
                                    onClick={() => {
                                        const newLesson: LessonItem = {
                                            id: crypto.randomUUID(),
                                            type: lt.type,
                                            title: "",
                                        };
                                        onUpdate(topic.id, {
                                            lessons: [...topic.lessons, newLesson],
                                        });
                                    }}
                                    className="gap-1.5 text-xs"
                                >
                                    <lt.icon className="size-3"/>
                                    {lt.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

interface TopicsStepProps {
    onNext: () => void;
    onBack: () => void;
}

export function TopicsStep({onNext, onBack}: TopicsStepProps) {
    const [topics, setTopics] = useState<TopicItem[]>([]);

    const addTopic = () => {
        setTopics((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                name: "",
                description: "",
                lessons: [],
                isExpanded: true,
            },
        ]);
    };

    const updateTopic = (id: string, updates: Partial<TopicItem>) => {
        setTopics((prev) =>
            prev.map((t) => (t.id === id ? {...t, ...updates} : t))
        );
    };

    const deleteTopic = (id: string) => {
        setTopics((prev) => prev.filter((t) => t.id !== id));
    };

    const toggleExpand = (id: string) => {
        setTopics((prev) =>
            prev.map((t) => (t.id === id ? {...t, isExpanded: !t.isExpanded} : t))
        );
    };

    const totalLessons = topics.reduce((sum, t) => sum + t.lessons.length, 0);

    return (
        <StepLayout
            stepNumber={2}
            title="Topics & Lessons"
            subtitle="Structure your learning path into topics, each containing one or more lessons."
            helpText="Organize your content into topics that make logical sense for the subject. Each topic can hold Theory lessons, Quizzes, and Coding challenges. You can always reorder topics and lessons later."
            onNext={onNext}
            onBack={onBack}
        >
            <div className="flex flex-col gap-6">
                {/* Summary bar */}
                <div className="flex items-center gap-4 rounded-xl border bg-card px-4 py-3">
                    <div className="flex items-center gap-2">
                        <LayersIcon className="size-4 text-emerald-600 dark:text-emerald-400"/>
                        <span className="text-sm font-medium">{topics.length}</span>
                        <span className="text-xs text-muted-foreground">
                            {topics.length === 1 ? "topic" : "topics"}
                        </span>
                    </div>
                    <div className="h-4 w-px bg-border"/>
                    <div className="flex items-center gap-2">
                        <BookOpenIcon className="size-4 text-chart-2"/>
                        <span className="text-sm font-medium">{totalLessons}</span>
                        <span className="text-xs text-muted-foreground">
                            {totalLessons === 1 ? "lesson" : "lessons"}
                        </span>
                    </div>
                    <div className="ml-auto">
                        <Button size="sm" onClick={addTopic}>
                            <PlusIcon data-icon="inline-start" className="size-4"/>
                            Add Topic
                        </Button>
                    </div>
                </div>

                {/* Topics list or empty state */}
                {topics.length === 0 ? (
                    <EmptyTopicsState/>
                ) : (
                    <div className="space-y-3 stagger-children">
                        {topics.map((topic, index) => (
                            <TopicCard
                                key={topic.id}
                                topic={topic}
                                index={index}
                                onUpdate={updateTopic}
                                onDelete={deleteTopic}
                                onToggleExpand={toggleExpand}
                            />
                        ))}
                    </div>
                )}

                {/* Add more button */}
                {topics.length > 0 && (
                    <Button variant="outline" size="sm" onClick={addTopic} className="self-start">
                        <PlusIcon data-icon="inline-start" className="size-4"/>
                        Add Another Topic
                    </Button>
                )}
            </div>
        </StepLayout>
    );
}
