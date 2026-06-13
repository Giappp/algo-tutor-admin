"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CodeIcon, FileCode, SettingsIcon, Sparkles } from "lucide-react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { CodingLessonForm, type CodingLessonFormHandle } from "@/components/learning-path/coding-lesson-form";
import { TestCasesTab } from "@/components/learning-path/test-cases-tab";
import { EditorialsTab } from "@/components/learning-path/editorials-tab";
import { DangerZoneCard } from "@/components/lesson-detail/danger-zone-card";
import { DeleteLessonDialog } from "@/components/lesson-detail/delete-lesson-dialog";
import { TabButton } from "@/components/lesson-detail/tab-button";
import { Lesson } from "@/types/learning-path";
import { useDeleteLesson, useUpdateLesson } from "@/hooks/use-lessons";
import { useRouter } from "next/navigation";
import {Button} from "@/components/ui/button";
import {CodingAiStudioDialog} from "@/components/lesson-detail/coding-ai-studio-dialog";
import {useCreateEditorial} from "@/hooks/use-editorials";

interface CodingLessonPanelsProps {
    lesson: Lesson;
    lessonId: number;
    learningPathId: number;
    updateMutation: ReturnType<typeof useUpdateLesson>;
    initialAiOpen?: boolean;
}

export function CodingLessonPanels({ lesson, lessonId, learningPathId, updateMutation, initialAiOpen = false }: CodingLessonPanelsProps) {
    const t = useTranslations("learningPaths");
    const tCommon = useTranslations("common");
    const tAi = useTranslations("lessonForm.codingAi");
    const router = useRouter();
    const deleteMutation = useDeleteLesson();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isAiOpen, setIsAiOpen] = useState(initialAiOpen);
    const [rightTab, setRightTab] = useState<"test-cases" | "editorials" | "settings">("test-cases");
    const codingFormRef = useRef<CodingLessonFormHandle | null>(null);
    const createEditorialMutation = useCreateEditorial(lessonId);

    const handleDelete = () => {
        deleteMutation.mutate(lessonId, {
            onSuccess: () => router.push(`/learning-paths/${learningPathId}`),
        });
    };

    return (
        <div className="relative w-full overflow-hidden rounded-2xl border border-border/70 bg-card shadow-[0_18px_50px_-44px_rgba(0,0,0,0.5)]">
            <ResizablePanelGroup
                orientation="horizontal"
                className="min-h-[calc(100vh-245px)] items-stretch"
            >
                {/* Left Panel: Content Form */}
                <ResizablePanel defaultSize={50} minSize={35} maxSize={65} className="flex flex-col">
                    <div className="relative h-full flex-1 overflow-y-auto p-5 scrollbar-thin">
                        <div className="mb-4 flex justify-end">
                            <Button variant="ai" size="sm" onClick={() => setIsAiOpen(true)}>
                                <Sparkles data-icon="inline-start"/>
                                {tAi("trigger")}
                            </Button>
                        </div>
                        <CodingLessonForm
                            formRef={codingFormRef}
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

                <ResizableHandle withHandle className="w-1.5 bg-border/40 transition-colors hover:bg-primary/20" />

                {/* Right Panel: Test Cases / Editorials / Settings */}
                <ResizablePanel defaultSize={50} minSize={35} maxSize={65} className="flex flex-col border-l border-border/20 bg-muted/[0.08]">
                    <div className="relative flex h-full flex-1 flex-col">
                        <div className="flex items-center gap-1 overflow-x-auto border-b border-border/50 bg-muted/20 px-3 py-2.5">
                            <TabButton
                                active={rightTab === "test-cases"}
                                onClick={() => setRightTab("test-cases")}
                                badge={lesson.testCases?.length}
                                className="h-9 rounded-md px-3 text-sm font-medium transition-all"
                            >
                                <CodeIcon className="size-3.5" />
                                {t("testCasesTab")}
                            </TabButton>
                            <TabButton
                                active={rightTab === "editorials"}
                                onClick={() => setRightTab("editorials")}
                                className="h-9 rounded-md px-3 text-sm font-medium transition-all"
                            >
                                <FileCode className="size-3.5" />
                                {t("editorialsTab")}
                            </TabButton>
                            <TabButton
                                active={rightTab === "settings"}
                                onClick={() => setRightTab("settings")}
                                className="h-9 rounded-md px-3 text-sm font-medium transition-all"
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
            <CodingAiStudioDialog
                lessonId={lessonId}
                open={isAiOpen}
                onOpenChange={setIsAiOpen}
                onApplyProblem={(draft) => codingFormRef.current?.applyDraft(draft)}
                onApplyStarterCode={(draft) => codingFormRef.current?.applyDraft({starterCode: draft.starterCode})}
                onApplyEditorial={async (draft) => {
                    await createEditorialMutation.mutateAsync({language: draft.language, sourceCode: draft.sourceCode});
                    setRightTab("editorials");
                }}
            />
        </div>
    );
}
