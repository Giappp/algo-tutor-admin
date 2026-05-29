"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { LearningPathForm } from "@/components/learning-path/learning-path-form";
import { TopicForm } from "@/components/learning-path/topic-form";
import {
    useDeleteLearningPath,
    useLearningPath,
    useTogglePublishLearningPath,
    useUpdateLearningPath,
} from "@/hooks/use-learning-paths";
import { useCreateTopic } from "@/hooks/use-topics";
import { LearningPathRequestDTO } from "@/types/learning-path/schema";
import { CreateTopicRequest } from "@/types/learning-path";
import { Button } from "@/components/ui/button";
import { LearningPathDetailHeader } from "@/components/learning-path/detail/learning-path-detail-header";
import { LearningPathStatsGrid } from "@/components/learning-path/detail/learning-path-stats-grid";
import { LearningPathSettingsTab } from "@/components/learning-path/detail/learning-path-settings-tab";
import { Skeleton } from "@/components/ui/skeleton";

// Unified Workspace sub-components
import { OutlineTreeSidebar } from "@/components/learning-path/detail/outline-tree-sidebar";
import { LessonEditCanvas } from "@/components/learning-path/detail/lesson-edit-canvas";
import { TopicEditCanvas } from "@/components/learning-path/detail/topic-edit-canvas";
import { CreateLessonInline } from "@/components/learning-path/detail/create-lesson-inline";

interface ActiveItem {
    type: "path" | "topic" | "lesson" | "create-lesson";
    id?: number;
    topicId?: number;
}

export default function LearningPathDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Number(params.id);

    const { data: lp, isLoading } = useLearningPath(id);

    const updateMutation = useUpdateLearningPath(id);
    const deleteMutation = useDeleteLearningPath();
    const togglePublishMutation = useTogglePublishLearningPath();
    const createTopicMutation = useCreateTopic(id);

    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isAddTopicOpen, setIsAddTopicOpen] = useState(false);

    // Active item workspace state
    const [activeItem, setActiveItemState] = useState<ActiveItem>({ type: "path" });

    // Sync active state to URL query parameters
    const setActiveItem = (item: ActiveItem) => {
        setActiveItemState(item);
        const searchParams = new URLSearchParams();
        searchParams.set("type", item.type);
        if (item.id !== undefined) searchParams.set("id", String(item.id));
        if (item.topicId !== undefined) searchParams.set("topicId", String(item.topicId));
        router.replace(`/dashboard/learning-paths/${id}?${searchParams.toString()}`, { scroll: false });
    };

    // On mount, read initial state from search query parameters
    useEffect(() => {
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const type = (searchParams.get("type") as any) || "path";
            const itemId = searchParams.get("id") ? Number(searchParams.get("id")) : undefined;
            const topicId = searchParams.get("topicId") ? Number(searchParams.get("topicId")) : undefined;

            if (["path", "topic", "lesson", "create-lesson"].includes(type)) {
                setActiveItemState({ type, id: itemId, topicId });
            }
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-5 p-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-md" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-64" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
                <Skeleton className="h-12 w-full rounded-lg" />
                <div className="grid grid-cols-12 gap-6 mt-4">
                    <Skeleton className="col-span-4 h-[500px] rounded-xl" />
                    <Skeleton className="col-span-8 h-[500px] rounded-xl" />
                </div>
            </div>
        );
    }

    if (!lp) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 p-6">
                <GraduationCap className="size-12 text-muted-foreground/30" />
                <p className="text-muted-foreground">Learning path not found.</p>
                <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/learning-paths" />}>
                    Back to Learning Paths
                </Button>
            </div>
        );
    }

    const handleUpdate = async (data: LearningPathRequestDTO) => {
        await updateMutation.mutateAsync(data);
        setIsEditOpen(false);
    };

    const handleDelete = () => {
        deleteMutation.mutate(id, {
            onSuccess: () => router.push("/dashboard/learning-paths"),
        });
    };

    return (
        <div className="flex flex-col gap-6 p-6 min-h-[calc(100vh-80px)]">
            {/* Workspace Title & Quick Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <GraduationCap className="size-6 text-primary" />
                        Unified Course Builder Workspace
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Manage learning paths, topics, and lessons dynamically in one seamless window
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveItem({ type: "path" })}
                        className={cn(
                            "text-xs h-8.5",
                            activeItem.type === "path" && "border-primary bg-primary/5 text-primary"
                        )}
                    >
                        <Settings className="size-3.5 mr-1.5" />
                        Path Settings
                    </Button>
                </div>
            </div>

            {/* Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Outline Tree Sidebar */}
                <div className="lg:col-span-4 xl:col-span-3 rounded-xl border bg-card shadow-sm overflow-hidden flex flex-col max-h-[calc(100vh-190px)] min-h-[550px]">
                    <OutlineTreeSidebar
                        topics={lp.topics ?? []}
                        pathId={id}
                        pathName={lp.name}
                        isPremium={lp.isPremium}
                        level={lp.level}
                        activeItem={activeItem}
                        setActiveItem={setActiveItem}
                        onAddTopic={() => setIsAddTopicOpen(true)}
                    />
                </div>

                {/* Right Column: Editor Canvas */}
                <div className="lg:col-span-8 xl:col-span-9 rounded-xl border bg-card shadow-sm p-6 overflow-y-auto max-h-[calc(100vh-190px)] min-h-[550px] flex flex-col">
                    {activeItem.type === "path" && (
                        <div className="space-y-6 flex-1">
                            {/* Learning Path Detail Header */}
                            <LearningPathDetailHeader
                                learningPath={{
                                    name: lp.name,
                                    description: lp.description,
                                    isPublished: lp.isPublished,
                                }}
                                onEdit={() => setIsEditOpen(true)}
                                onTogglePublish={() => togglePublishMutation.mutate(id)}
                                isTogglePublishPending={togglePublishMutation.isPending}
                            />

                            {/* Learning Path Stats */}
                            <LearningPathStatsGrid
                                topicCount={lp.topicCount}
                                totalLessonCount={lp.totalLessonCount}
                                publishedLessonCount={lp.publishedLessonCount}
                                enrollmentCount={lp.enrollmentCount}
                            />

                            {/* General Settings block */}
                            <div className="rounded-xl border bg-background/50 p-5 shadow-sm">
                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">Path Danger Zone</h3>
                                <LearningPathSettingsTab
                                    learningPathName={lp.name}
                                    onDelete={() => setIsDeleteOpen(true)}
                                    isDeletePending={deleteMutation.isPending}
                                />
                            </div>
                        </div>
                    )}

                    {activeItem.type === "topic" && activeItem.id && (
                        <div className="flex-1">
                            <TopicEditCanvas
                                topicId={activeItem.id}
                                learningPathId={id}
                                onReset={() => setActiveItem({ type: "path" })}
                            />
                        </div>
                    )}

                    {activeItem.type === "lesson" && activeItem.id && (
                        <div className="flex-1">
                            <LessonEditCanvas
                                lessonId={activeItem.id}
                                learningPathId={id}
                                onReset={() => setActiveItem({ type: "path" })}
                            />
                        </div>
                    )}

                    {activeItem.type === "create-lesson" && activeItem.topicId && (
                        <div className="flex-1">
                            <CreateLessonInline
                                topicId={activeItem.topicId}
                                learningPathId={id}
                                onSuccess={(newLessonId) => {
                                    setActiveItem({ type: "lesson", id: newLessonId });
                                }}
                                onCancel={() => setActiveItem({ type: "path" })}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Learning Path Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Learning Path</DialogTitle>
                        <DialogDescription>
                            Update the details for &ldquo;{lp.name}&rdquo;.
                        </DialogDescription>
                    </DialogHeader>
                    <LearningPathForm
                        defaultValues={{
                            name: lp.name,
                            description: lp.description,
                            goal: lp.goal,
                            thumbnailUrl: lp.thumbnailUrl,
                            level: lp.level,
                            isPremium: lp.isPremium,
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

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Learning Path</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &ldquo;{lp.name}&rdquo;? This action
                            cannot be undone and will remove all topics and lessons.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                            Cancel
                        </Button>
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
