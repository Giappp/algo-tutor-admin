"use client";

import {useCallback, useEffect, useRef, useState} from "react";

export type AutosaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutosaveOptions<T> {
    /** Data to watch for changes */
    data: T;
    /** Function to call when saving */
    onSave: (data: T) => Promise<void>;
    /** Debounce delay in milliseconds (default: 3000) */
    delay?: number;
    /** Whether autosave is enabled (default: true) */
    enabled?: boolean;
}

/**
 * Hook that automatically saves data after a debounce period.
 * Tracks dirty state and provides save status feedback.
 */
export function useAutosave<T>({
    data,
    onSave,
    delay = 3000,
    enabled = true,
}: UseAutosaveOptions<T>) {
    const [status, setStatus] = useState<AutosaveStatus>("idle");
    const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
    const [isDirty, setIsDirty] = useState(false);

    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const initialDataRef = useRef<T>(data);
    const latestDataRef = useRef<T>(data);
    const isMountedRef = useRef(true);

    // Track latest data
    useEffect(() => {
        latestDataRef.current = data;
    }, [data]);

    // Detect changes from initial data
    useEffect(() => {
        const hasChanged =
            JSON.stringify(data) !== JSON.stringify(initialDataRef.current);
        setIsDirty(hasChanged);
    }, [data]);

    // Debounced autosave
    useEffect(() => {
        if (!enabled || !isDirty) return;

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(async () => {
            if (!isMountedRef.current) return;

            setStatus("saving");
            try {
                await onSave(latestDataRef.current);
                if (isMountedRef.current) {
                    setStatus("saved");
                    setLastSavedAt(new Date());
                    setIsDirty(false);
                    initialDataRef.current = latestDataRef.current;

                    // Reset status after 3s
                    setTimeout(() => {
                        if (isMountedRef.current) {
                            setStatus("idle");
                        }
                    }, 3000);
                }
            } catch {
                if (isMountedRef.current) {
                    setStatus("error");
                }
            }
        }, delay);

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, [data, enabled, isDirty, delay, onSave]);

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    // Manual save
    const saveNow = useCallback(async () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        setStatus("saving");
        try {
            await onSave(latestDataRef.current);
            setStatus("saved");
            setLastSavedAt(new Date());
            setIsDirty(false);
            initialDataRef.current = latestDataRef.current;

            setTimeout(() => {
                if (isMountedRef.current) {
                    setStatus("idle");
                }
            }, 3000);
        } catch {
            setStatus("error");
        }
    }, [onSave]);

    // Reset initial data (e.g., after fetching fresh data from server)
    const resetInitialData = useCallback((newData: T) => {
        initialDataRef.current = newData;
        setIsDirty(false);
        setStatus("idle");
    }, []);

    return {
        status,
        isDirty,
        lastSavedAt,
        saveNow,
        resetInitialData,
    };
}
