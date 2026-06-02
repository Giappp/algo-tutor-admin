"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "lucide-react";
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
            <div className="relative mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 stagger-children">
                {/* Ambient Background Radial Blob */}
                <div className="pointer-events-none absolute right-0 top-[-120px] -z-10 size-[320px] translate-x-1/3 rounded-full bg-[radial-gradient(circle,oklch(0.55_0.22_272/0.04)_0%,transparent_70%)] animate-gradient-shift sm:size-[400px]" />

                {/* Header */}
                <div className="flex min-w-0 items-start gap-4 border-b border-border/40 pb-5">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        nativeButton={false}
                        render={<Link href="/learning-paths" />}
                        className="size-8 shrink-0 rounded-lg text-muted-foreground hover:text-foreground"
                        aria-label={tCommon("back")}
                    >
                        <ArrowLeftIcon className="size-4" />
                    </Button>

                    <div className="min-w-0 space-y-1">
                        <h1 className="text-xl font-heading font-extrabold tracking-tight text-foreground">
                            {t("createPathTitle")}
                        </h1>

                        <p className="max-w-prose text-xs leading-relaxed text-muted-foreground">
                            {t("createPathSubtitle")}
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="relative min-w-0 max-w-full overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm">
                    <div className="pointer-events-none absolute inset-0 noise-overlay opacity-[0.005]" />

                    <form
                        onSubmit={onSubmit}
                        className="relative flex min-w-0 max-w-full flex-col p-4 sm:p-6"
                    >
                        <LearningPathFields
                            control={control}
                            errors={errors}
                            watch={watch}
                            register={register}
                            setValue={setValue}
                            isPending={createMutation.isPending}
                        />

                        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border/40 pt-6 sm:flex-row sm:items-center sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                nativeButton={false}
                                render={<Link href="/learning-paths" />}
                                className="h-10 w-full rounded-xl px-4 text-xs font-bold transition-colors sm:w-auto"
                            >
                                {tCommon("cancel")}
                            </Button>

                            <Button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="h-10 w-full rounded-xl px-5 text-xs font-bold shadow-sm sm:w-auto"
                            >
                                {createMutation.isPending
                                    ? t("creating")
                                    : t("createPathTitle")}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}