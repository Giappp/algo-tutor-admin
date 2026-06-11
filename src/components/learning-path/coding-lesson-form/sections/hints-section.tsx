"use client";

import {Plus, X} from "lucide-react";
import {useTranslations} from "next-intl";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

interface HintsSectionProps {
    hints: string[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, value: string) => void;
    isPending?: boolean;
}

export function HintsSection({
    hints,
    onAdd,
    onRemove,
    onUpdate,
    isPending,
}: HintsSectionProps) {
    const t = useTranslations("lessonForm");

    return (
        <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">{t("coding.hintsDescription")}</p>
            {hints.map((field, i) => (
                <div key={i} className="group flex items-center gap-2">
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
                        {i + 1}
                    </span>
                    <div className="flex-1">
                        <Input
                            placeholder={t("coding.hintPlaceholder", {number: i + 1})}
                            value={field}
                            onChange={(e) => onUpdate(i, e.target.value)}
                            disabled={isPending}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onRemove(i)}
                        className="shrink-0 text-muted-foreground/50 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <X className="w-3.5 h-3.5"/>
                    </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAdd}
                className="self-start"
            >
                <Plus className="w-3.5 h-3.5 mr-1.5"/>
                {t("coding.addHint")}
            </Button>
        </div>
    );
}
