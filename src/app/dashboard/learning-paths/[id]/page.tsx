"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {GraduationCap, LayoutGrid, Settings} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {LearningPathForm} from "@/components/learning-path/learning-path-form";
import {TopicForm} from "@/components/learning-path/topic-form";
import {
    useDeleteLearningPath,
    useLearningPath,
    useTogglePublishLearningPath,
    useUpdateLearningPath,
} from "@/hooks/use-learning-paths";
import {useCreateTopic} from "@/hooks/use-topics";
import {LearningPathRequestDTO} from "@/types/learning-path/schema";
import {CreateTopicRequest} from "@/types/learning-path";
import {Button} from "@/components/ui/button";
import {LearningPathDetailHeader} from "@/components/learning-path/detail/learning-path-detail-header";
import {LearningPathStatsGrid} from "@/components/learning-path/detail/learning-path-stats-grid";
import {LearningPathTopicsTab} from "@/components/learning-path/detail/learning-path-topics-tab";
import {LearningPathSettingsTab} from "@/components/learning-path/detail/learning-path-settings-tab";
import {Skeleton} from "@/components/ui/skeleton";

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
            <div className="flex flex-col gap-5 p-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-md"/>
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-64"/>
                        <Skeleton className="h-4 w-96"/>
                    </div>
                </div>
                <Skeleton className="h-12 w-full rounded-lg"/>
                <Skeleton className="h-96 w-full rounded-lg"/>
            </div>
        );
    }

    if (!lp) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 p-6">
                <GraduationCap className="size-12 text-muted-foreground/30"/>
                <p className="text-muted-foreground">Learning path not found.</p>
                <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/learning-paths"/>}>
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
        <div className="flex flex-col gap-5 p-6">
            {/* Header */}
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

            {/* Stats */}
            <LearningPathStatsGrid
                topicCount={lp.topicCount}
                totalLessonCount={lp.totalLessonCount}
                publishedLessonCount={lp.publishedLessonCount}
                enrollmentCount={lp.enrollmentCount}
            />

            {/* Tabs */}
            <div className="rounded-lg border bg-card overflow-hidden">
                <Tabs defaultValue="topics" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-muted/30 p-0 h-auto">
                        <TabsTrigger
                            value="topics"
                            className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
                        >
                            <LayoutGrid className="size-4"/>
                            Topics & Lessons
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="flex items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent"
                        >
                            <Settings className="size-4"/>
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="topics" className="mt-0 focus-visible:outline-none">
                        <LearningPathTopicsTab
                            topics={lp.topics ?? []}
                            pathId={id}
                            onAddTopic={() => setIsAddTopicOpen(true)}
                        />
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0 focus-visible:outline-none">
                        <LearningPathSettingsTab
                            learningPathName={lp.name}
                            onDelete={() => setIsDeleteOpen(true)}
                            isDeletePending={deleteMutation.isPending}
                        />
                    </TabsContent>
                </Tabs>
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
