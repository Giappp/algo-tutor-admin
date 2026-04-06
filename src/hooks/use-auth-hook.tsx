"use client";

import { useMutation } from "@tanstack/react-query";
import { get, post } from "@/api/http";
import { setAuthenticated, clearAuthenticated } from "@/store/authStore";
import { LoginCredentials } from "@/types/auth/auth";
import { SignInSchema } from "@/types/auth/schema";
import { useRouter } from "next/navigation";

type UserInfoResponse = {
    userId: number;
    email: string;
    userName: string;
};

export function useAuth() {
    const router = useRouter();

    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginCredentials) => {
            const body = SignInSchema.parse(credentials);
            await post("/api/v1/iam/signin", body);
            const userInfo = await get<UserInfoResponse>("/api/v1/iam/me");
            return userInfo;
        },
        onSuccess: (userInfo) => {
            setAuthenticated({
                userId: userInfo.userId,
                email: userInfo.email,
                username: userInfo.userName,
                isAuthenticated: true,
            });
            router.push("/dashboard");
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            await post("/api/v1/iam/logout");
        },
        onSettled: () => {
            router.push("/login");
            clearAuthenticated();
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