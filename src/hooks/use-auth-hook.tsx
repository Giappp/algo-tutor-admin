"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/api/core/http";
import {AppError} from "@/api/core/api-error";
import {clearAuthenticated, isAdminUser, setAuthenticated, UserPayload} from "@/store/authStore";
import { LoginCredentials } from "@/types/auth/auth";
import { SignInSchema } from "@/types/auth/schema";
import { useRouter } from "next/navigation";

export function useAuth() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const body = SignInSchema.parse(credentials);
            await post("/api/v1/iam/signin", body);
            const userInfo = await get<UserPayload>("/api/v1/iam/me");

            if (!isAdminUser(userInfo)) {
                try {
                    await post("/api/v1/iam/logout");
                } finally {
                    throw new AppError("Chỉ tài khoản ADMIN mới được phép truy cập.", 403);
                }
            }

            return userInfo;
        },
        onSuccess: (userInfo) => {
            setAuthenticated(userInfo);
            router.replace("/");
        },
        onError: () => {
            clearAuthenticated();
            queryClient.clear();
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
        login: loginMutation.mutateAsync,
        loginError: loginMutation.error,
        isLoggingIn: loginMutation.isPending,
        logout: logoutMutation.mutate,
        isLoggingOut: logoutMutation.isPending,
    };
}
