"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
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

function isActiveItemType(value: string | null): value is ActiveItem["type"] {
    return value === "path" || value === "topic" || value === "lesson" || value === "create-lesson";
}

export default function LearningPathDetailPage() {
    const t = useTranslations("learningPaths");
    const tCommon = useTranslations("common");
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
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
    const [activeItem, setActiveItemState] = useState<ActiveItem>(() => {
        const type = searchParams.get("type");

        return {
            type: isActiveItemType(type) ? type : "path",
            id: searchParams.get("id") ? Number(searchParams.get("id")) : undefined,
            topicId: searchParams.get("topicId") ? Number(searchParams.get("topicId")) : undefined,
        };
    });

    // Sync active state to URL query parameters
    const setActiveItem = (item: ActiveItem) => {
        setActiveItemState(item);
        const searchParams = new URLSearchParams();
        searchParams.set("type", item.type);
        if (item.id !== undefined) searchParams.set("id", String(item.id));
        if (item.topicId !== undefined) searchParams.set("topicId", String(item.topicId));
        router.replace(`/learning-paths/${id}?${searchParams.toString()}`, { scroll: false });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6 p-4 xl:p-5 w-full">
                <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-64 rounded-md" />
                        <Skeleton className="h-4 w-96 rounded-md" />
                    </div>
                </div>
                <Skeleton className="h-12 w-full rounded-xl" />
                <div className="grid grid-cols-12 gap-6 mt-4">
                    <Skeleton className="col-span-4 h-[550px] rounded-2xl" />
                    <Skeleton className="col-span-8 h-[550px] rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!lp) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-20 p-6 relative overflow-hidden">
                <div className="absolute inset-0 noise-overlay opacity-[0.012] pointer-events-none" />
                <GraduationCap className="size-14 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">{t("notFound")}</p>
                <Button variant="outline" nativeButton={false} render={<Link href="/learning-paths" />} className="rounded-xl font-bold text-xs mt-2">
                    {t("backToPaths")}
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
            onSuccess: () => router.push("/learning-paths"),
        });
    };

    return (
        <div className="flex min-h-[calc(100dvh-3rem)] w-full flex-col gap-4 p-3 sm:p-4 xl:p-5 stagger-children">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute left-[-10%] top-[-10%] -z-10 size-[500px] rounded-full bg-[radial-gradient(circle,oklch(0.62_0.15_225/0.05)_0%,transparent_70%)] animate-gradient-shift" />

            {/* Workspace Title & Quick Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-xl font-heading font-extrabold tracking-tight text-foreground flex items-center gap-2">
                        <GraduationCap className="size-6 text-primary" />
                        {t("builderWorkspace")}
                    </h1>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t("builderSubtitle")}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveItem({ type: "path" })}
                        className={cn(
                            "text-xs h-9 rounded-xl font-bold transition-all duration-200 shadow-sm border-border/40 bg-card hover:bg-muted/80",
                            activeItem.type === "path" && "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                        )}
                    >
                        <Settings className="size-3.5 mr-1.5" />
                        {t("pathSettings")}
                    </Button>
                </div>
            </div>

            {/* Workspace Layout */}
            <div className="grid flex-1 grid-cols-1 items-start gap-4 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
                {/* Left Column: Outline Tree Sidebar */}
                <div className="relative flex min-h-[550px] flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/60 shadow-sm backdrop-blur-md lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)]">
                    <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
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
                <div className="relative flex min-h-[650px] min-w-0 flex-col overflow-y-auto rounded-2xl border border-border/40 bg-card p-4 shadow-sm sm:p-5 xl:p-6 lg:max-h-[calc(100dvh-2rem)]">
                    <div className="absolute inset-0 noise-overlay opacity-[0.01] pointer-events-none" />
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
                            <div className="rounded-2xl border border-border/40 bg-background/40 p-5 shadow-inner">
                                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">{t("dangerZone")}</h3>
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
                <DialogContent className="rounded-xl border-border/40 max-w-4xl px-12 py-6 max-h-[600px] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="font-heading font-extrabold text-lg">{t("editPathTitle")}</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            {t("editPathDesc", { name: lp.name })}
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
                        submitLabel={tCommon("save")}
                    />
                </DialogContent>
            </Dialog>

            {/* Add Topic Dialog */}
            <Dialog open={isAddTopicOpen} onOpenChange={setIsAddTopicOpen}>
                <DialogContent className="rounded-2xl border-border/40 max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-heading font-extrabold text-lg">{t("addTopicTitle")}</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-1">
                            {t("addTopicDesc", { name: lp.name })}
                        </DialogDescription>
                    </DialogHeader>
                    <TopicForm
                        onSubmit={async (data) => {
                            await createTopicMutation.mutateAsync({
                                ...data
                            });
                            setIsAddTopicOpen(false);
                        }}
                        isPending={createTopicMutation.isPending}
                        submitLabel={tCommon("create")}
                    />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="rounded-2xl border-border/40 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-heading font-extrabold text-lg">{t("deletePathTitle")}</DialogTitle>
                        <DialogDescription className="text-xs leading-relaxed text-muted-foreground mt-1">
                            {t("deletePathDesc", { name: lp.name })}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} className="rounded-xl font-bold text-xs h-9">
                            {tCommon("cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteMutation.isPending}
                            className="rounded-xl font-bold text-xs h-9"
                        >
                            {deleteMutation.isPending ? t("deleting") : tCommon("delete")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
