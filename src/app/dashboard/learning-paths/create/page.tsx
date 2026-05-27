"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {ArrowLeftIcon} from "lucide-react";
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
        <div className="flex flex-col gap-6 p-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href="/dashboard/learning-paths"/>}
                >
                    <ArrowLeftIcon className="size-4"/>
                </Button>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Create Learning Path</h1>
                    <p className="text-sm text-muted-foreground">
                        Define the basics — add topics and lessons after creating.
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="rounded-lg border bg-card">
                <form onSubmit={onSubmit} className="p-6">
                    <LearningPathFields
                        control={control}
                        errors={errors}
                        watch={watch}
                        register={register}
                        setValue={setValue}
                        isPending={createMutation.isPending}
                    />

                    <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            nativeButton={false}
                            render={<Link href="/dashboard/learning-paths"/>}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createMutation.isPending}
                        >
                            {createMutation.isPending ? "Creating..." : "Create Learning Path"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
