import React, { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

function calculateRemainingTime(oldestTimestampMs: number, windowSeconds: number) {
    const expireTime = oldestTimestampMs + windowSeconds * 1000;
    return Math.max(0, expireTime - Date.now());
}

export function RealtimeCountdown({
    oldestTimestampMs,
    windowSeconds,
    onExpire
}: {
    oldestTimestampMs: number;
    windowSeconds: number;
    onExpire?: () => void;
}) {
    const hasExpiredRef = useRef(false);
    const [, forceTick] = useState(0);
    const timeLeft = calculateRemainingTime(oldestTimestampMs, windowSeconds);

    useEffect(() => {
        hasExpiredRef.current = false;

        const interval = setInterval(() => {
            const rem = calculateRemainingTime(oldestTimestampMs, windowSeconds);
            forceTick((tick) => tick + 1);
            if (rem <= 0 && !hasExpiredRef.current) {
                hasExpiredRef.current = true;
                clearInterval(interval);
                onExpire?.();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [oldestTimestampMs, windowSeconds, onExpire]);

    const seconds = Math.ceil(timeLeft / 1000);

    if (timeLeft <= 0) {
        return (
            <Badge variant="outline" className="gap-1 bg-muted text-muted-foreground">
                <span className="size-1.5 rounded-full bg-muted-foreground" />
                Expiring...
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50 font-mono">
            <Clock className="mr-1 size-3" />
            {seconds}s
        </Badge>
    );
}
