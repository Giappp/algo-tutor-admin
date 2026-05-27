"use client";

import {SettingsIcon, Trash2Icon} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface DangerZoneCardProps {
    onDelete: () => void;
}

export function DangerZoneCard({onDelete}: DangerZoneCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <SettingsIcon className="size-5 text-muted-foreground"/>
                    Danger Zone
                </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
                <div>
                    <p className="font-medium">Delete Lesson</p>
                    <p className="text-sm text-muted-foreground">
                        Permanently delete this lesson. This action cannot be undone.
                    </p>
                </div>
                <Button variant="destructive" onClick={onDelete}>
                    <Trash2Icon data-icon="inline-start"/>
                    Delete
                </Button>
            </CardContent>
        </Card>
    );
}
