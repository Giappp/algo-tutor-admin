"use client";

import {get, post} from "@/api/core/http";
import {
    clearAuthenticated,
    isAdminUser,
    setAuthenticated,
    UserPayload,
} from "@/store/authStore";
import {useQueryClient} from "@tanstack/react-query";
import {Loader2} from "lucide-react";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";

export function AdminAuthGuard({children}: {children: React.ReactNode}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        let isActive = true;

        const verifyAdminAccess = async () => {
            try {
                const userInfo = await get<UserPayload>("/api/v1/iam/me");

                if (!isAdminUser(userInfo)) {
                    try {
                        await post("/api/v1/iam/logout");
                    } finally {
                        clearAuthenticated();
                        queryClient.clear();
                        router.replace("/login");
                    }
                    return;
                }

                setAuthenticated(userInfo);
                if (isActive) {
                    setIsChecking(false);
                }
            } catch {
                clearAuthenticated();
                queryClient.clear();
                router.replace("/login");
            }
        };

        void verifyAdminAccess();

        return () => {
            isActive = false;
        };
    }, [queryClient, router]);

    if (isChecking) {
        return (
            <div className="flex min-h-svh items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground"/>
            </div>
        );
    }

    return children;
}
