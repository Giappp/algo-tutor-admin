"use client";

import {useEffect, useRef} from "react";

/**
 * Hook that warns users before leaving the page with unsaved changes.
 * Shows a browser confirmation dialog on tab close/refresh.
 */
export function useUnsavedChanges(isDirty: boolean) {
    const isDirtyRef = useRef(isDirty);

    useEffect(() => {
        isDirtyRef.current = isDirty;
    }, [isDirty]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirtyRef.current) {
                e.preventDefault();
                // Modern browsers ignore custom messages but still show a dialog
                e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
                return e.returnValue;
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);
}
