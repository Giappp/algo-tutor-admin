import {BookOpenIcon, GlobeIcon, LayersIcon, UsersIcon} from "lucide-react";
import {Separator} from "@/components/ui/separator";

interface LearningPathStatsGridProps {
    topicCount: number;
    totalLessonCount: number;
    publishedLessonCount: number;
    enrollmentCount: number;
}

export function LearningPathStatsGrid({
                                          topicCount,
                                          totalLessonCount,
                                          publishedLessonCount,
                                          enrollmentCount,
                                      }: LearningPathStatsGridProps) {
    return (
        <div className="flex items-center gap-5 rounded-lg border bg-muted/30 px-5 py-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
                <LayersIcon className="size-4 text-muted-foreground"/>
                <span className="font-semibold">{topicCount}</span>
                <span className="text-muted-foreground">topics</span>
            </div>
            <Separator orientation="vertical" className="h-5 hidden sm:block"/>
            <div className="flex items-center gap-2 text-sm">
                <BookOpenIcon className="size-4 text-muted-foreground"/>
                <span className="font-semibold">{totalLessonCount}</span>
                <span className="text-muted-foreground">lessons</span>
            </div>
            <Separator orientation="vertical" className="h-5 hidden sm:block"/>
            <div className="flex items-center gap-2 text-sm">
                <GlobeIcon className="size-4 text-emerald-600 dark:text-emerald-400"/>
                <span className="font-semibold">{publishedLessonCount}</span>
                <span className="text-muted-foreground">published</span>
            </div>
            <Separator orientation="vertical" className="h-5 hidden sm:block"/>
            <div className="flex items-center gap-2 text-sm">
                <UsersIcon className="size-4 text-muted-foreground"/>
                <span className="font-semibold">{enrollmentCount}</span>
                <span className="text-muted-foreground">enrolled</span>
            </div>
        </div>
    );
}
