"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {get, post} from "@/api/http";
import {clearAuthenticated, setAuthenticated} from "@/store/authStore";
import {LoginCredentials} from "@/types/auth/auth";
import {SignInSchema} from "@/types/auth/schema";
import {useRouter} from "next/navigation";

type UserInfoResponse = {
    userId: number;
    email: string;
    userName: string; // Note: API uses userName, Store uses username
};

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const body = SignInSchema.parse(credentials);
            await post("/api/v1/iam/signin", body);
            return await get<UserInfoResponse>("/api/v1/iam/me");
        },
        onSuccess: (userInfo) => {
            setAuthenticated({
                userId: userInfo.userId,
                email: userInfo.email,
                username: userInfo.userName,
            });
            router.push("/dashboard");
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await post("/api/v1/iam/logout");
        },
        // onSettled runs whether the API call succeeds or fails.
        // This ensures the user is logged out locally even if the server throws an error.
        onSettled: () => {
            // 1. Clear Zustand state first
            clearAuthenticated();

            // 2. Clear React Query cache so sensitive data isn't left in memory
            queryClient.clear();

            // 3. Finally, redirect to login
            router.push("/login");
        },
    });

    return {
        // Switched to mutate for consistency and to avoid unhandled promise rejections
        login: loginMutation.mutate,
        loginError: loginMutation.error,
        isLoggingIn: loginMutation.isPending,
        logout: logoutMutation.mutate,
        isLoggingOut: logoutMutation.isPending,
    };
}