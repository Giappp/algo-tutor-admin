"use client";

import {useState} from "react";
import {useParams, useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowLeftIcon, ArrowRightIcon, BookOpenIcon, CheckIcon, CodeIcon, FileQuestionIcon} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {TheoryForm} from "@/components/learning-path/theory-form";
import {CodingLessonForm} from "@/components/learning-path/coding-lesson-form";
import {QuizForm} from "@/components/quiz/quiz-form";
import {useCreateLesson} from "@/hooks/use-lessons";
import {useUnsavedChanges} from "@/hooks/use-unsaved-changes";
import {LessonType} from "@/types/learning-path";
import {CodingLessonDTO, LessonRequestDTO, QuizLessonDTO, TheoryLessonDTO} from "@/types/learning-path/schema";
import {cn} from "@/lib/utils";

const LESSON_TYPES = [
    {type: "THEORY" as const, icon: BookOpenIcon},
    {type: "QUIZ" as const, icon: FileQuestionIcon},
    {type: "CODING" as const, icon: CodeIcon},
];

export default function CreateLessonPage() {
    const tLessonForm = useTranslations("lessonForm");
    const t = useTranslations("learningPaths");
    const params = useParams();
    const router = useRouter();
    const learningPathId = Number(params.id);
    const topicId = Number(params.topicId);
    const createLessonMutation = useCreateLesson(topicId);
    const [selectedType, setSelectedType] = useState<LessonType | null>(null);
    const [hasStartedEditing, setHasStartedEditing] = useState(false);

    useUnsavedChanges(hasStartedEditing && !createLessonMutation.isPending);

    const handleSubmit = async (data: CodingLessonDTO | TheoryLessonDTO | QuizLessonDTO) => {
        const result = await createLessonMutation.mutateAsync(data as LessonRequestDTO);
        router.push(`/learning-paths/${learningPathId}/lessons/${result.id}`);
    };

    return (
        <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 pb-10">
            <header className="flex items-start gap-3 border-b border-border/60 pb-6">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href={`/learning-paths/${learningPathId}`}/>}
                    className="mt-1"
                >
                    <ArrowLeftIcon className="size-4"/>
                </Button>
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t("createNewLesson")}</h1>
                    <p className="mt-1 max-w-xl text-base text-muted-foreground">{t("chooseLessonType")}</p>
                </div>
            </header>

            <div className="grid items-start gap-8 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <aside className="lg:sticky lg:top-20">
                    <div className="mb-3 flex items-center justify-between px-1">
                        <p className="text-sm font-semibold text-foreground">{t("chooseLessonType")}</p>
                        <span className="font-mono text-xs text-muted-foreground">01 / 02</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1" role="tablist" aria-label="Lesson type">
                        {LESSON_TYPES.map((item) => {
                            const Icon = item.icon;
                            const isActive = selectedType === item.type;
                            const labelKey = item.type === "THEORY" ? "theory" : item.type === "QUIZ" ? "quiz" : "coding";

                            return (
                                <button
                                    key={item.type}
                                    type="button"
                                    role="tab"
                                    aria-selected={isActive}
                                    onClick={() => {
                                        setSelectedType(item.type);
                                        setHasStartedEditing(true);
                                    }}
                                    className={cn(
                                        "group relative flex min-h-24 items-start gap-3 rounded-xl border px-4 py-4 text-left transition-all duration-200 active:scale-[0.99]",
                                        isActive
                                            ? "border-primary/35 bg-primary/[0.055] shadow-[0_10px_28px_-24px_var(--color-primary)]"
                                            : "border-border/70 bg-card/40 hover:border-foreground/15 hover:bg-card",
                                    )}
                                >
                                    <div className={cn(
                                        "flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors",
                                        isActive && "border-primary/25 text-primary",
                                    )}>
                                        <Icon className="size-4"/>
                                    </div>
                                    <div className="min-w-0 pr-4">
                                        <span className="block text-base font-semibold">{t(labelKey)}</span>
                                        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{t(`${labelKey}Desc`)}</span>
                                    </div>
                                    <div className={cn(
                                        "absolute right-3 top-3 flex size-5 items-center justify-center rounded-full border text-muted-foreground/40 transition-colors",
                                        isActive && "border-primary bg-primary text-primary-foreground",
                                    )}>
                                        {isActive
                                            ? <CheckIcon className="size-3"/>
                                            : <ArrowRightIcon className="size-3 opacity-0 transition-opacity group-hover:opacity-100"/>
                                        }
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <main className="min-w-0">
                    {!selectedType && (
                        <div className="flex min-h-[32rem] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/[0.12] px-6 text-center">
                            <div className="mb-4 flex size-12 items-center justify-center rounded-xl border bg-background text-muted-foreground shadow-sm">
                                <ArrowRightIcon className="size-5"/>
                            </div>
                            <p className="max-w-sm text-base font-medium text-foreground">{t("selectLessonType")}</p>
                        </div>
                    )}

                    {selectedType === "THEORY" && (
                        <EditorSurface>
                            <TheoryForm
                                onSubmit={handleSubmit}
                                isPending={createLessonMutation.isPending}
                                submitLabel={tLessonForm("actions.createLesson")}
                            />
                        </EditorSurface>
                    )}

                    {selectedType === "QUIZ" && (
                        <EditorSurface>
                            <QuizForm
                                onSubmit={handleSubmit}
                                isPending={createLessonMutation.isPending}
                                submitLabel={tLessonForm("actions.createLesson")}
                            />
                        </EditorSurface>
                    )}

                    {selectedType === "CODING" && (
                        <EditorSurface>
                            <CodingLessonForm
                                onSubmit={handleSubmit}
                                isPending={createLessonMutation.isPending}
                                submitLabel={tLessonForm("actions.createLesson")}
                            />
                        </EditorSurface>
                    )}
                </main>
            </div>
        </div>
    );
}

function EditorSurface({children}: {children: React.ReactNode}) {
    return (
        <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-[0_18px_50px_-42px_rgba(0,0,0,0.45)] sm:p-6">
            {children}
        </div>
    );
}
