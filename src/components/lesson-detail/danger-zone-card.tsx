"use client";

import {SettingsIcon, Trash2Icon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface DangerZoneCardProps {
    onDelete: () => void;
    title?: string;
    actionLabel?: string;
    description?: string;
    buttonText?: string;
}

export function DangerZoneCard({
    onDelete,
    title = "Danger Zone",
    actionLabel = "Delete Lesson",
    description = "Permanently delete this lesson. This action cannot be undone.",
    buttonText = "Delete",
}: DangerZoneCardProps) {
    return (
        <Card className="border-border/40 shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 noise-overlay opacity-[0.005] pointer-events-none" />
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground">
                    <SettingsIcon className="size-4 text-muted-foreground/60"/>
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">{actionLabel}</p>
                    <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                        {description}
                    </p>
                </div>
                <Button variant="destructive" onClick={onDelete} className="h-9 shrink-0 rounded-xl text-sm font-semibold shadow-sm transition-colors">
                    <Trash2Icon className="size-3.5 mr-1.5"/>
                    {buttonText}
                </Button>
            </CardContent>
        </Card>
    );
}
