"use client";

import {useState} from "react";
import {CodeIcon, FileCode, SettingsIcon} from "lucide-react";
import {ResizableHandle, ResizablePanel, ResizablePanelGroup} from "@/components/ui/resizable";
import {CodingContentForm} from "@/components/learning-path/coding-content-form";
import {TestCasesTab} from "@/components/learning-path/test-cases-tab";
import {EditorialsTab} from "@/components/learning-path/editorials-tab";
import {DangerZoneCard} from "@/components/lesson-detail/danger-zone-card";
import {DeleteLessonDialog} from "@/components/lesson-detail/delete-lesson-dialog";
import {TabButton} from "@/components/lesson-detail/tab-button";
import {Lesson} from "@/types/learning-path";
import {useDeleteLesson, useUpdateLesson} from "@/hooks/use-lessons";
import {useRouter} from "next/navigation";

interface CodingLessonPanelsProps {
    lesson: Lesson;
    lessonId: number;
    learningPathId: number;
    updateMutation: ReturnType<typeof useUpdateLesson>;
}

export function CodingLessonPanels({lesson, lessonId, learningPathId, updateMutation}: CodingLessonPanelsProps) {
    const router = useRouter();
    const deleteMutation = useDeleteLesson();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [rightTab, setRightTab] = useState<"test-cases" | "editorials" | "settings">("test-cases");

    const handleDelete = () => {
        deleteMutation.mutate(lessonId, {
            onSuccess: () => router.push(`/dashboard/learning-paths/${learningPathId}`),
        });
    };

    return (
        <>
            <ResizablePanelGroup
                orientation="horizontal"
                className="min-h-[calc(100vh-220px)] rounded-xl border"
            >
                {/* Left Panel: Content Form */}
                <ResizablePanel defaultSize={50} minSize={35} maxSize={65}>
                    <div className="h-full overflow-y-auto p-6">
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
                                await updateMutation.mutateAsync({data, id: lessonId});
                            }}
                            isPending={updateMutation.isPending}
                            enableAutosave
                        />
                    </div>
                </ResizablePanel>

                <ResizableHandle withHandle/>

                {/* Right Panel: Test Cases / Editorials / Settings */}
                <ResizablePanel defaultSize={50} minSize={35} maxSize={65}>
                    <div className="h-full flex flex-col">
                        {/* Right panel tabs */}
                        <div className="flex items-center gap-1 px-4 pt-4 pb-2 border-b bg-muted/20">
                            <TabButton
                                active={rightTab === "test-cases"}
                                onClick={() => setRightTab("test-cases")}
                                badge={lesson.testCases?.length}
                            >
                                <CodeIcon className="size-3.5"/>
                                Test Cases
                            </TabButton>
                            <TabButton
                                active={rightTab === "editorials"}
                                onClick={() => setRightTab("editorials")}
                            >
                                <FileCode className="size-3.5"/>
                                Editorials
                            </TabButton>
                            <TabButton
                                active={rightTab === "settings"}
                                onClick={() => setRightTab("settings")}
                            >
                                <SettingsIcon className="size-3.5"/>
                                Settings
                            </TabButton>
                        </div>

                        {/* Right panel content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {rightTab === "test-cases" && (
                                <TestCasesTab lessonId={lessonId}/>
                            )}
                            {rightTab === "editorials" && (
                                <EditorialsTab lessonId={lessonId}/>
                            )}
                            {rightTab === "settings" && (
                                <DangerZoneCard onDelete={() => setIsDeleteOpen(true)}/>
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
        </>
    );
}
