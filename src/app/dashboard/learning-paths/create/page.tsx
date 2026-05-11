"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {GraduationCapIcon} from "lucide-react";
import Link from "next/link";
import {LearningPathFields} from "@/components/learning-path/learning-path-form";
import {useCreateLearningPath} from "@/hooks/use-learning-paths";
import {CreateLearningPathDTO, CreateLearningPathSchema} from "@/types/learning-path/schema";
import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";

export default function CreateLearningPathPage() {
    const router = useRouter();
    const createMutation = useCreateLearningPath();

    const {
        control,
        handleSubmit,
        watch,
        register,
        setValue,
        formState: {errors},
    } = useForm<CreateLearningPathDTO>({
        resolver: zodResolver(CreateLearningPathSchema),
        defaultValues: {
            name: "",
            description: "",
            goal: "",
            thumbnailUrl: "",
            level: "BEGINNER",
        },
    });

    const onSubmit = handleSubmit(async (data) => {
        const result = await createMutation.mutateAsync(data);
        if (result?.id) {
            router.push(`/dashboard/learning-paths/${result.id}`);
        }
    });

    return (
        <div className="flex flex-col gap-6 max-w-2xl">
            {/* Header */}
            <div
                className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-transparent p-5 dark:from-emerald-950/40 dark:via-teal-950/20">
                <div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,oklch(0.6_0.15_145/0.12)_0%,transparent_60%)] animate-gradient-shift pointer-events-none"/>
                <div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,oklch(0.55_0.1_160/0.08)_0%,transparent_50%)] animate-gradient-shift pointer-events-none"
                    style={{animationDelay: "2s"}}
                />
                <div className="absolute inset-0 dot-pattern opacity-30 pointer-events-none"/>

                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex items-center justify-center size-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                            <GraduationCapIcon className="size-5 text-white"/>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-foreground text-gradient-emerald">
                                Create Learning Path
                            </h1>
                            <p className="text-xs text-muted-foreground hidden sm:block">
                                Fill in basic information, then add topics and lessons on the next page.
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/dashboard/learning-paths"
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted/50"
                    >
                        Cancel
                    </Link>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={onSubmit} className="rounded-2xl border bg-card p-6">
                <LearningPathFields
                    control={control}
                    errors={errors}
                    watch={watch}
                    register={register}
                    setValue={setValue}
                    isPending={createMutation.isPending}
                />

                <div className="flex justify-end gap-3 pt-4 mt-2 border-t">
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Creating..." : "Create Learning Path"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
