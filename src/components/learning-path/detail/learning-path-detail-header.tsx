import Link from "next/link";
import {ArrowLeft, GraduationCap, Pencil, Rocket} from "lucide-react";
import {Button} from "@/components/ui/button";

interface LearningPathDetailHeaderProps {
    learningPath: {
        name: string;
        description: string;
        isPublished: boolean;
    };
    onEdit: () => void;
    onTogglePublish: () => void;
    isTogglePublishPending?: boolean;
}

export function LearningPathDetailHeader({
                                             learningPath,
                                             onEdit,
                                             onTogglePublish,
                                             isTogglePublishPending = false,
                                         }: LearningPathDetailHeaderProps) {
    return (
        <div
            className="relative overflow-hidden rounded-2xl border border-chart-1/20 bg-gradient-to-br from-chart-1/8 via-chart-2/5 to-transparent">
            {/* Decorative background layers */}
            <div className="absolute inset-0 noise-overlay"/>
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,oklch(0.55_0.22_272/0.12)_0%,transparent_60%)] animate-gradient-shift pointer-events-none"/>
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_100%_100%,oklch(0.5_0.2_350/0.08)_0%,transparent_50%)] animate-gradient-shift pointer-events-none"
                style={{animationDelay: '2s'}}/>
            <div className="absolute inset-0 dot-pattern opacity-40 pointer-events-none"/>

            {/* Floating decorative orbs */}
            <div
                className="absolute top-3 right-16 size-16 rounded-full bg-chart-1/10 blur-2xl animate-float pointer-events-none"/>
            <div
                className="absolute bottom-2 right-32 size-10 rounded-full bg-chart-5/10 blur-xl animate-float pointer-events-none"
                style={{animationDelay: '1.5s'}}/>

            <div
                className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        nativeButton={false}
                        render={<Link href="/dashboard/learning-paths"/>}
                        className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-chart-1/10 transition-colors"
                    >
                        <ArrowLeft className="size-5"/>
                    </Button>

                    <div className="flex items-center gap-3.5">
                        <div
                            className="shrink-0 flex items-center justify-center size-12 rounded-2xl border border-chart-1/30 shadow-sm shadow-chart-1/10 animate-glow-pulse">
                            <GraduationCap className="size-5.5 text-chart-1"/>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-xl font-heading font-bold tracking-tight truncate max-w-md text-gradient-primary">
                                {learningPath.name}
                            </h1>
                            <p className="text-sm text-muted-foreground truncate max-w-md mt-0.5">
                                {learningPath.description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onTogglePublish}
                        disabled={isTogglePublishPending}
                        className="gap-1.5 border-chart-4/40 text-chart-4 hover:bg-chart-4/10 hover:border-chart-4/60 font-medium transition-all"
                    >
                        <Rocket className="size-4"/>
                        {learningPath.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                        size="sm"
                        onClick={onEdit}
                        className="gap-1.5 bg-gradient-to-r from-chart-1 to-chart-2 hover:from-chart-1/90 hover:to-chart-2/90 text-white shadow-md shadow-chart-1/20 font-medium transition-all"
                    >
                        <Pencil className="size-4"/>
                        Edit
                    </Button>
                </div>
            </div>
        </div>
    );
}
