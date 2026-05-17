"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {GraduationCapIcon, SparklesIcon} from "lucide-react";
import Link from "next/link";
import {LearningPathFields} from "@/components/learning-path/learning-path-form";
import {useCreateLearningPath} from "@/hooks/use-learning-paths";
import {CreateLearningPathSchema, LearningPathRequestDTO} from "@/types/learning-path/schema";
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
            router.push(`/dashboard/learning-paths/${result.id}`);
        }
    });

    return (
        <div className="flex items-start justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
                {/* Page Header */}
                <div className="mb-8 text-center">
                    <div
                        className="inline-flex items-center justify-center size-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-xl shadow-emerald-500/25 mb-4">
                        <GraduationCapIcon className="size-7 text-white"/>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Create Learning Path
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                        Define the basics — you can add topics and lessons after creating the path.
                    </p>
                </div>

                {/* Form Card */}
                <div className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
                    {/* Decorative top gradient line */}
                    <div
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"/>

                    <form onSubmit={onSubmit} className="p-8">
                        <LearningPathFields
                            control={control}
                            errors={errors}
                            watch={watch}
                            register={register}
                            setValue={setValue}
                            isPending={createMutation.isPending}
                        />

                        <div className="flex items-center justify-between pt-6 mt-2 border-t">
                            <Link
                                href="/dashboard/learning-paths"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground shadow-sm transition-colors hover:bg-muted/60 hover:text-foreground"
                            >
                                Cancel
                            </Link>
                            <Button
                                type="submit"
                                disabled={createMutation.isPending}
                                className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20"
                            >
                                <SparklesIcon className="size-4"/>
                                {createMutation.isPending ? "Creating..." : "Create Learning Path"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
