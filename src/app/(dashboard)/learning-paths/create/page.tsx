"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon, CheckCircle2, Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { LearningPathFields } from "@/components/learning-path/learning-path-form";
import { useCreateLearningPath } from "@/hooks/use-learning-paths";
import {
    CreateLearningPathSchema,
    LearningPathRequestDTO,
} from "@/types/learning-path/schema";
import { Button } from "@/components/ui/button";

export default function CreateLearningPathPage() {
    const t = useTranslations("learningPaths");
    const tCommon = useTranslations("common");
    const router = useRouter();
    const createMutation = useCreateLearningPath();

    const {
        control,
        handleSubmit,
        watch,
        register,
        setValue,
        formState: { errors },
    } = useForm<LearningPathRequestDTO>({
        resolver: zodResolver(CreateLearningPathSchema),
        defaultValues: {
            name: "",
            description: "",
            goal: "",
            thumbnailUrl: "",
            level: "BEGINNER",
            isPremium: false,
        },
    });

    const onSubmit = handleSubmit(async (data) => {
        const result = await createMutation.mutateAsync(data);

        if (result?.id) {
            router.push(`/learning-paths/${result.id}`);
        }
    });

    return (
        <div className="w-full">
            <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-5 px-4 py-6 sm:px-6">
                <div className="flex min-w-0 items-start gap-3">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href="/learning-paths" />}
                        className="mt-0.5 size-8 shrink-0 rounded-lg text-muted-foreground hover:bg-primary/8 hover:text-primary"
                        aria-label={tCommon("back")}
                    >
                        <ArrowLeftIcon className="size-4" />
                    </Button>

                    <div className="min-w-0 space-y-1">
                        <h1 className="text-xl font-heading font-bold tracking-tight text-foreground sm:text-2xl">
                            {t("createPathTitle")}
                        </h1>

                        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            {t("createPathSubtitle")}
                        </p>
                    </div>
                </div>

                <form
                    onSubmit={onSubmit}
                    aria-busy={createMutation.isPending}
                    className="flex min-w-0 max-w-full flex-col gap-5"
                >
                    <LearningPathFields
                        control={control}
                        errors={errors}
                        watch={watch}
                        register={register}
                        setValue={setValue}
                        isPending={createMutation.isPending}
                    />

                    <footer className="sticky bottom-3 z-20 flex flex-col gap-3 rounded-xl border border-border/70 bg-card/95 p-3 shadow-[0_18px_50px_-28px_oklch(0.42_0.13_240/0.55)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
                        <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                            <CheckCircle2 className="size-4 text-primary" />
                            <span>{t("createFormHint")}</span>
                        </div>
                        <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                nativeButton={false}
                                render={<Link href="/learning-paths" />}
                                className="h-10 w-full px-4 sm:w-auto"
                            >
                                {tCommon("cancel")}
                            </Button>

                            <Button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="h-10 w-full px-5 sm:w-auto"
                            >
                                {createMutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <Plus className="size-4" />
                                )}
                                {createMutation.isPending ? t("creating") : t("createPathTitle")}
                            </Button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
}
