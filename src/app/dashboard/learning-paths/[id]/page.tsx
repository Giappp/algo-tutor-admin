"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {
    ArrowLeftIcon,
    BookOpenIcon,
    CodeIcon,
    GraduationCapIcon,
    LockIcon,
    PencilIcon,
    PlusIcon,
    RocketIcon,
    SettingsIcon,
    Trash2Icon,
    UnlockIcon,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger,} from "@/components/ui/tabs";
import {LearningPathForm} from "@/components/learning-path/learning-path-form";
import {TopicForm} from "@/components/learning-path/topic-form";
import {
    useDeleteLearningPath,
    useLearningPath,
    useTogglePublishLearningPath,
    useUpdateLearningPath,
} from "@/hooks/use-learning-paths";
import {useCreateTopic, useDeleteTopic, useUpdateTopic,} from "@/hooks/use-topics";
import {useDeleteLesson, useLessonsByTopic, useTogglePublishLesson,} from "@/hooks/use-lessons";
import {CreateLearningPath} from "@/types/learning-path/schema";
import {
    CreateTopicRequest,
    Lesson,
    LessonType,
    Topic,
    UpdateLearningPathRequest,
    UpdateTopicRequest
} from "@/types/learning-path";

const LESSON_TYPE_ICONS: Record<LessonType, React.ReactNode> = {
    THEORY: <BookOpenIcon className="size-4"/>,
    QUIZ: <GraduationCapIcon className="size-4"/>,
    CODING: <CodeIcon className="size-4"/>,
};

const LESSON_TYPE_COLORS: Record<LessonType, string> = {
    THEORY: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    QUIZ: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    CODING: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
};

function TopicAccordionItem({
                                topic,
                                pathId,
                            }: {
    topic: Topic;
    pathId: number;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const updateTopicMutation = useUpdateTopic(topic.id);
    const deleteTopicMutation = useDeleteTopic();
    const deleteLessonMutation = useDeleteLesson();
    const togglePublishLessonMutation = useTogglePublishLesson();

    const {data: lessonsData} = useLessonsByTopic(topic.id);
    const lessons: Lesson[] = lessonsData || [] as Lesson[];

    return (
        <div className="rounded-xl border bg-card overflow-hidden">
            {/* Topic Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-muted-foreground font-mono text-xs">
                        #{topic.orderIndex}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                        <span className="font-medium text-foreground truncate">
                            {topic.name}
                        </span>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                                {topic.lessonCount} lessons
                            </Badge>
                            {topic.scopeTags && (
                                <span className="text-xs text-muted-foreground truncate">
                                    {topic.scopeTags}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {topic.isLocked ? (
                        <LockIcon className="size-4 text-muted-foreground"/>
                    ) : (
                        <UnlockIcon className="size-4 text-emerald-500"/>
                    )}
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditOpen(true);
                        }}
                    >
                        <PencilIcon data-icon="inline-start"/>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this topic?")) {
                                deleteTopicMutation.mutate(topic.id);
                            }
                        }}
                    >
                        <Trash2Icon data-icon="inline-start"/>
                    </Button>
                </div>
            </div>

            {/* Expanded: Lessons */}
            {isExpanded && (
                <div className="border-t bg-muted/20 p-4 space-y-2">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-muted-foreground">
                            Lessons
                        </h4>
                        <Button
                            variant="outline"
                            size="xs"
                            render={
                                <Link href={`/dashboard/learning-paths/${pathId}/topics/${topic.id}/lessons/create`}/>
                            }
                        >
                            <PlusIcon data-icon="inline-start"/>
                            Add Lesson
                        </Button>
                    </div>

                    {lessons.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No lessons yet.
                        </p>
                    ) : (
                        lessons.map((lesson: Lesson) => (
                            <div
                                key={lesson.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-background border"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                            LESSON_TYPE_COLORS[lesson.type]
                                        }`}
                                    >
                                        {LESSON_TYPE_ICONS[lesson.type]}
                                        {lesson.type.charAt(0) +
                                            lesson.type.slice(1).toLowerCase()}
                                    </span>
                                    <span className="font-medium text-sm truncate">
                                        {lesson.title}
                                    </span>
                                    {lesson.difficulty && (
                                        <Badge variant="outline" className="text-xs">
                                            {lesson.difficulty}
                                        </Badge>
                                    )}
                                    {lesson.isPublished ? (
                                        <Badge
                                            variant="secondary"
                                            className="text-xs text-emerald-600 dark:text-emerald-400"
                                        >
                                            Published
                                        </Badge>
                                    ) : (
                                        <Badge
                                            variant="outline"
                                            className="text-xs text-muted-foreground"
                                        >
                                            Draft
                                        </Badge>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() =>
                                            togglePublishLessonMutation.mutate(lesson.id)
                                        }
                                    >
                                        <RocketIcon data-icon="inline-start"/>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        render={
                                            <Link
                                                href={`/dashboard/learning-paths/${pathId}/lessons/${lesson.id}`}
                                            />
                                        }
                                    >
                                        <PencilIcon data-icon="inline-start"/>
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon-xs"
                                        onClick={() => {
                                            if (confirm("Delete this lesson?")) {
                                                deleteLessonMutation.mutate(lesson.id);
                                            }
                                        }}
                                    >
                                        <Trash2Icon data-icon="inline-start"/>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Edit Topic Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Topic</DialogTitle>
                        <DialogDescription>
                            Update the details for &ldquo;{topic.name}&rdquo;.
                        </DialogDescription>
                    </DialogHeader>
                    <TopicForm
                        defaultValues={{
                            name: topic.name,
                            description: topic.description,
                            scopeTags: topic.scopeTags,
                            isLocked: topic.isLocked,
                        }}
                        onSubmit={async (data) => {
                            await updateTopicMutation.mutateAsync(
                                data as unknown as UpdateTopicRequest
                            );
                            setIsEditOpen(false);
                        }}
                        isPending={updateTopicMutation.isPending}
                        submitLabel="Save Changes"
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function LearningPathDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const {data: lp, isLoading} = useLearningPath(id);

    const updateMutation = useUpdateLearningPath(id);
    const deleteMutation = useDeleteLearningPath();
    const togglePublishMutation = useTogglePublishLearningPath();
    const createTopicMutation = useCreateTopic(id);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="h-20 w-full rounded-xl bg-muted animate-pulse"/>
                <div className="h-96 rounded-xl bg-muted animate-pulse"/>
            </div>
        );
    }

    if (!lp) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
                <p className="text-muted-foreground">
                    Learning path not found.
                </p>
                <Button variant="outline" render={<Link href="/dashboard/learning-paths"/>}>
                    <ArrowLeftIcon data-icon="inline-start"/>
                    Back to Learning Paths
                </Button>
            </div>
        );
    }

    const handleUpdate = async (data: CreateLearningPath) => {
        await updateMutation.mutateAsync(data as unknown as UpdateLearningPathRequest);
        setIsEditOpen(false);
    };

    const handleDelete = () => {
        deleteMutation.mutate(id, {
            onSuccess: () => router.push("/dashboard/learning-paths"),
        });
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon-sm" render={<Link href="/dashboard/learning-paths"/>}>
                        <ArrowLeftIcon data-icon="inline-start"/>
                    </Button>
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                            <GraduationCapIcon className="size-5 text-indigo-600 dark:text-indigo-400"/>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-foreground">
                                {lp.name}
                            </h1>
                            <p className="text-muted-foreground">{lp.description}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => togglePublishMutation.mutate(id)}
                    >
                        <RocketIcon data-icon="inline-start"/>
                        Toggle Publish
                    </Button>
                    <Button onClick={() => setIsEditOpen(true)}>
                        <PencilIcon data-icon="inline-start"/>
                        Edit
                    </Button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <Card>
                    <CardContent className="p-4 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Topics</span>
                        <span className="text-2xl font-bold">{lp.topicCount}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Total Lessons</span>
                        <span className="text-2xl font-bold">{lp.totalLessonCount}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Published</span>
                        <span className="text-2xl font-bold">{lp.publishedLessonCount}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground">Enrollments</span>
                        <span className="text-2xl font-bold">{lp.enrollmentCount}</span>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="topics">
                <TabsList>
                    <TabsTrigger value="topics">
                        <GraduationCapIcon data-icon="inline-start"/>
                        Topics
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <SettingsIcon data-icon="inline-start"/>
                        Settings
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="topics" className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Topics</h3>
                        <Button onClick={() => setIsAddTopicOpen(true)}>
                            <PlusIcon data-icon="inline-start"/>
                            Add Topic
                        </Button>
                    </div>

                    {lp.topics?.length === 0 ? (
                        <div className="border rounded-xl p-12 text-center">
                            <p className="text-muted-foreground mb-4">
                                No topics yet. Add your first topic to start building this learning path.
                            </p>
                            <Button onClick={() => setIsAddTopicOpen(true)}>
                                <PlusIcon data-icon="inline-start"/>
                                Add First Topic
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {lp.topics?.map((topic: Topic) => (
                                <TopicAccordionItem
                                    key={topic.id}
                                    topic={topic}
                                    pathId={id}
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="settings" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Delete Learning Path</p>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete this learning path. This action cannot be undone.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => setIsDeleteOpen(true)}
                            >
                                <Trash2Icon data-icon="inline-start"/>
                                Delete
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Edit Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Learning Path</DialogTitle>
                        <DialogDescription>
                            Update the details for &#34;{lp.name}&#34;.
                        </DialogDescription>
                    </DialogHeader>
                    <LearningPathForm
                        defaultValues={{
                            name: lp.name,
                            description: lp.description,
                            goal: lp.goal,
                            thumbnailUrl: lp.thumbnailUrl,
                            level: lp.level,
                        }}
                        onSubmit={handleUpdate}
                        isPending={updateMutation.isPending}
                        submitLabel="Save Changes"
                    />
                </DialogContent>
            </Dialog>

            {/* Add Topic Dialog */}
            <Dialog open={isAddTopicOpen} onOpenChange={setIsAddTopicOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Topic</DialogTitle>
                        <DialogDescription>
                            Create a new topic in &ldquo;{lp.name}&rdquo;.
                        </DialogDescription>
                    </DialogHeader>
                    <TopicForm
                        onSubmit={async (data) => {
                            await createTopicMutation.mutateAsync(
                                data as unknown as CreateTopicRequest
                            );
                            setIsAddTopicOpen(false);
                        }}
                        isPending={createTopicMutation.isPending}
                        submitLabel="Create Topic"
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Learning Path</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &ldquo;{lp.name}&rdquo;? This action
                            cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
