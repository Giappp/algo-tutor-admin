"use client";

import {useEffect} from "react";

/**
 * Hook that listens for Ctrl+S / Cmd+S and triggers a save callback.
 */
export function useKeyboardSave(onSave: () => void, enabled = true) {
    useEffect(() => {
        if (!enabled) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                e.preventDefault();
                onSave();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onSave, enabled]);
}
