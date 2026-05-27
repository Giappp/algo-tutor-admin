import Link from "next/link";
import {ArrowLeft, GlobeIcon, Pencil, Rocket} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";

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
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 min-w-0">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    nativeButton={false}
                    render={<Link href="/dashboard/learning-paths"/>}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4"/>
                </Button>

                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight truncate">
                            {learningPath.name}
                        </h1>
                        {learningPath.isPublished ? (
                            <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0">
                                <GlobeIcon className="mr-1 size-3"/>
                                Published
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="shrink-0">Draft</Badge>
                        )}
                    </div>
                    {learningPath.description && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {learningPath.description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onTogglePublish}
                    disabled={isTogglePublishPending}
                    className={
                        learningPath.isPublished
                            ? "text-amber-700 border-amber-500/30 hover:bg-amber-500/10 dark:text-amber-400"
                            : "text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/10 dark:text-emerald-400"
                    }
                >
                    <Rocket data-icon="inline-start" className="size-4"/>
                    {learningPath.isPublished ? "Unpublish" : "Publish"}
                </Button>
                <Button size="sm" onClick={onEdit}>
                    <Pencil data-icon="inline-start" className="size-4"/>
                    Edit
                </Button>
            </div>
        </div>
    );
}
