"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {GraduationCap, LayoutGrid, Settings,} from "lucide-react";
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
import {CreateLearningPathDTO} from "@/types/learning-path/schema";
import {CreateTopicRequest, UpdateLearningPathRequest} from "@/types/learning-path";
import {Button} from "@/components/ui/button";
import {
    LearningPathDetailHeader,
    LearningPathSettingsTab,
    LearningPathStatsGrid,
    LearningPathTopicsTab,
} from "@/components/learning-path/detail";

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
            <div className="flex flex-col gap-5">
                <div
                    className="h-24 w-full rounded-2xl bg-gradient-to-r from-chart-1/10 via-chart-2/8 to-chart-1/10 animate-pulse"/>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 rounded-2xl bg-chart-1/8 animate-pulse"/>
                    ))}
                </div>
                <div className="h-64 w-full rounded-2xl bg-chart-1/5 animate-pulse"/>
            </div>
        );
    }

    if (!lp) {
        return (
            <div
                className="flex flex-col items-center justify-center gap-4 py-20 rounded-2xl border-2 border-dashed border-chart-1/20 bg-gradient-to-b from-chart-1/5 to-transparent">
                <div
                    className="flex items-center justify-center size-16 rounded-2xl bg-chart-1/10 border border-chart-1/25">
                    <GraduationCap className="size-7 text-chart-1"/>
                </div>
                <p className="text-muted-foreground font-medium">Learning path not found.</p>
                <Button variant="outline" nativeButton={false} render={<Link href="/dashboard/learning-paths"/>}
                        className="border-chart-1/30 text-chart-1 hover:bg-chart-1/10">
                    Back to Learning Paths
                </Button>
            </div>
        );
    }

    const handleUpdate = async (data: CreateLearningPathDTO) => {
        await updateMutation.mutateAsync(data as unknown as UpdateLearningPathRequest);
        setIsEditOpen(false);
    };

    const handleDelete = () => {
        deleteMutation.mutate(id, {
            onSuccess: () => router.push("/dashboard/learning-paths"),
        });
    };

    return (
        <div className="flex flex-col gap-6 stagger-children">
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
            <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
                <div className="p-1.5">
                    <Tabs defaultValue="topics" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 gap-1 p-0 bg-transparent rounded-xl h-auto">
                            <TabsTrigger
                                value="topics"
                                className="flex items-center justify-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-chart-1/15 data-[state=active]:to-chart-2/10 data-[state=active]:text-chart-1 data-[state=active]:shadow-sm rounded-xl py-2.5 font-semibold transition-all"
                            >
                                <LayoutGrid className="size-4"/>
                                <span>Topics</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="settings"
                                className="flex items-center justify-center gap-2 text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-muted data-[state=active]:to-muted/50 data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-xl py-2.5 font-medium transition-all"
                            >
                                <Settings className="size-4"/>
                                <span>Settings</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="topics" className="mt-4 focus-visible:outline-none">
                            <LearningPathTopicsTab
                                topics={lp.topics ?? []}
                                pathId={id}
                                onAddTopic={() => setIsAddTopicOpen(true)}
                            />
                        </TabsContent>

                        <TabsContent value="settings" className="mt-4 focus-visible:outline-none">
                            <LearningPathSettingsTab
                                learningPathName={lp.name}
                                onDelete={() => setIsDeleteOpen(true)}
                                isDeletePending={deleteMutation.isPending}
                            />
                        </TabsContent>
                    </Tabs>
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
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteOpen(false)}
                        >
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
