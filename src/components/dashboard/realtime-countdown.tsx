import React, { useState, useEffect } from "react";
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
    const [timeLeft, setTimeLeft] = useState(() =>
        calculateRemainingTime(oldestTimestampMs, windowSeconds)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            const rem = calculateRemainingTime(oldestTimestampMs, windowSeconds);
            setTimeLeft(rem);
            if (rem <= 0) {
                clearInterval(interval);
                if (onExpire) onExpire();
            }
        }, 200);

        return () => clearInterval(interval);
    }, [oldestTimestampMs, windowSeconds, onExpire]);

    const seconds = (timeLeft / 1000).toFixed(1);

    if (timeLeft <= 0) {
        return (
            <Badge variant="outline" className="bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 animate-pulse gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-ping" />
                Expiring...
            </Badge>
        );
    }

    return (
        <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50 font-mono">
            <Clock className="w-3 h-3 mr-1 animate-spin" style={{ animationDuration: "3s" }} />
            {seconds}s
        </Badge>
    );
}
