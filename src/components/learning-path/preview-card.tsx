"use client";

import { GraduationCapIcon, BookOpenIcon, LayersIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Level } from "@/types/learning-path";

const LEVEL_VARIANTS = {
  BEGINNER: "secondary" as const,
  INTERMEDIATE: "default" as const,
  ADVANCED: "destructive" as const,
};

const LEVEL_COLORS = {
  BEGINNER: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  INTERMEDIATE: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  ADVANCED: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

interface LearningPathPreviewCardProps {
  name?: string;
  description?: string;
  level?: Level;
  thumbnailUrl?: string;
  lessonCount?: number;
  topicCount?: number;
  isPublished?: boolean;
  className?: string;
}

export function LearningPathPreviewCard({
  name = "Untitled Learning Path",
  description = "",
  level = "BEGINNER",
  thumbnailUrl,
  lessonCount = 0,
  topicCount = 0,
  isPublished = false,
  className,
}: LearningPathPreviewCardProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all duration-200 hover:shadow-md hover:ring-2 hover:ring-primary/10",
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative h-32 w-full overflow-hidden bg-muted">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <GraduationCapIcon className="size-12 text-indigo-500/50" />
          </div>
        )}

        {/* Level badge overlay */}
        <div className="absolute top-2 right-2">
          <Badge variant={LEVEL_VARIANTS[level]} className={cn("shadow-sm", LEVEL_COLORS[level])}>
            {level.charAt(0) + level.slice(1).toLowerCase()}
          </Badge>
        </div>

        {/* Published indicator */}
        {isPublished && (
          <div className="absolute bottom-2 left-2">
            <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Published
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="flex flex-col gap-3 p-4">
        {/* Title */}
        <div className="flex items-start gap-3">
          <Avatar size="sm">
            {thumbnailUrl && <AvatarImage src={thumbnailUrl} alt={name} />}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold leading-tight">
              {name}
            </h3>
            {description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <LayersIcon className="size-3.5" />
            <span>{topicCount} {topicCount === 1 ? "topic" : "topics"}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpenIcon className="size-3.5" />
            <span>{lessonCount} {lessonCount === 1 ? "lesson" : "lessons"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
