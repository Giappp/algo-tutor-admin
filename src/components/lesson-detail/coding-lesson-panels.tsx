"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CodeIcon, FileCode, SettingsIcon } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CodingContentForm } from "@/components/learning-path/coding-content-form";
import { TestCasesTab } from "@/components/learning-path/test-cases-tab";
import { EditorialsTab } from "@/components/learning-path/editorials-tab";
import { DangerZoneCard } from "@/components/lesson-detail/danger-zone-card";
import { DeleteLessonDialog } from "@/components/lesson-detail/delete-lesson-dialog";
import { TabButton } from "@/components/lesson-detail/tab-button";
import { Lesson } from "@/types/learning-path";
import { useDeleteLesson, useUpdateLesson } from "@/hooks/use-lessons";
import { useRouter } from "next/navigation";

interface CodingLessonPanelsProps {
    lesson: Lesson;
    lessonId: number;
    learningPathId: number;
    updateMutation: ReturnType<typeof useUpdateLesson>;
}

export function CodingLessonPanels({ lesson, lessonId, learningPathId, updateMutation }: CodingLessonPanelsProps) {
    const t = useTranslations("learningPaths");
    const tCommon = useTranslations("common");
    const router = useRouter();
    const deleteMutation = useDeleteLesson();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [rightTab, setRightTab] = useState<"test-cases" | "editorials" | "settings">("test-cases");

    const handleDelete = () => {
        deleteMutation.mutate(lessonId, {
            onSuccess: () => router.push(`/learning-paths/${learningPathId}`),
        });
    };

    return (
        <div className="relative w-full rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />

            <ResizablePanelGroup
                orientation="horizontal"
                className="min-h-[calc(100vh-230px)] items-stretch"
            >
                {/* Left Panel: Content Form */}
                <ResizablePanel defaultSize={50} minSize={35} maxSize={65} className="flex flex-col">
                    <div className="h-full overflow-y-auto p-5 scrollbar-thin relative flex-1">
                        <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
                        <CodingContentForm
                            defaultValues={{
                                type: "CODING",
                                title: lesson.title,
                                displayOrder: lesson.displayOrder,
                                statement: lesson.statement ?? "",
                                difficulty: lesson.difficulty,
                                baseTimeLimitMs: lesson.baseTimeLimitMs ?? 2000,
                                baseMemoryLimitMb: lesson.baseMemoryLimitMb ?? 256,
                                constraints: lesson.constraints ?? [],
                                hints: lesson.hints ?? [],
                                examples: lesson.examples ?? [],
                                starterCode: lesson.starterCode ?? {},
                            }}
                            onSubmit={async (data) => {
                                await updateMutation.mutateAsync({ data, id: lessonId });
                            }}
                            isPending={updateMutation.isPending}
                            enableAutosave
                        />
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle className="bg-border/30 w-1.5 hover:bg-primary/20 transition-colors" />

                {/* Right Panel: Test Cases / Editorials / Settings */}
                <ResizablePanel defaultSize={50} minSize={35} maxSize={65} className="flex flex-col border-l border-border/10 bg-muted/5">
                    <div className="h-full flex flex-col relative flex-1">
                        <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
                        {/* Right panel tabs */}
                        <div className="flex items-center gap-1.5 px-4 py-2 border-b border-border/30 bg-muted/20">
                            <TabButton
                                active={rightTab === "test-cases"}
                                onClick={() => setRightTab("test-cases")}
                                badge={lesson.testCases?.length}
                                className="text-xs font-bold transition-all h-8 px-3 rounded-lg"
                            >
                                <CodeIcon className="size-3.5" />
                                {t("testCasesTab")}
                            </TabButton>
                            <TabButton
                                active={rightTab === "editorials"}
                                onClick={() => setRightTab("editorials")}
                                className="text-xs font-bold transition-all h-8 px-3 rounded-lg"
                            >
                                <FileCode className="size-3.5" />
                                {t("editorialsTab")}
                            </TabButton>
                            <TabButton
                                active={rightTab === "settings"}
                                onClick={() => setRightTab("settings")}
                                className="text-xs font-bold transition-all h-8 px-3 rounded-lg"
                            >
                                <SettingsIcon className="size-3.5" />
                                {t("settingsTab")}
                            </TabButton>
                        </div>

                        {/* Right panel content */}
                        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
                            {rightTab === "test-cases" && (
                                <TestCasesTab lessonId={lessonId} />
                            )}
                            {rightTab === "editorials" && (
                                <EditorialsTab lessonId={lessonId} />
                            )}
                            {rightTab === "settings" && (
                                <div className="p-1">
                                    <DangerZoneCard
                                        onDelete={() => setIsDeleteOpen(true)}
                                        title={t("settingsTab")}
                                        actionLabel={t("deleteLessonSub")}
                                        description={t("deleteLessonDescShort")}
                                        buttonText={tCommon("delete")}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>

            <DeleteLessonDialog
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                lessonTitle={lesson.title}
                onConfirm={handleDelete}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}
