"use client";

import {useCallback} from "react";
import {useAutosave} from "@/hooks/use-autosave";
import {useKeyboardSave} from "@/hooks/use-keyboard-save";
import {useUnsavedChanges} from "@/hooks/use-unsaved-changes";

interface UseLessonFormAutosaveOptions<T> {
    data: T;
    isDirty: boolean;
    enabled: boolean;
    onSave: () => Promise<void>;
}

export function useLessonFormAutosave<T>({
    data,
    isDirty,
    enabled,
    onSave,
}: UseLessonFormAutosaveOptions<T>) {
    const handleSave = useCallback(async () => {
        await onSave();
    }, [onSave]);

    const autosave = useAutosave({
        data,
        onSave: handleSave,
        delay: 3000,
        enabled: enabled && isDirty,
    });

    useUnsavedChanges(enabled && isDirty);
    useKeyboardSave(autosave.saveNow, enabled);

    return autosave;
}
