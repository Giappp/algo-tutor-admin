import { LoginCredentials } from "@/types/auth/auth";
import { SignInSchema } from "@/types/auth/schema";
import { authApi, get } from "@/api/http";
import { toAppError } from "@/api/api-error";
import { setAuthenticated, clearAuthenticated } from "@/store/authStore";

type UserInfoResponse = {
    userId: number;
    email: string;
    username: string;
};

export const signIn = async (payload: LoginCredentials) => {
    const body = SignInSchema.parse(payload);
    await authApi.post("/api/v1/iam/signin", body);

    const userInfo = await get<UserInfoResponse>("/api/v1/iam/me");

    setAuthenticated({
        userId: userInfo.userId,
        email: userInfo.email,
        username: userInfo.username,
        isAuthenticated: true,
    });

    return userInfo;
};

export const signOut = async () => {
    try {
        await authApi.post("/api/auth/logout");
    } finally {
        clearAuthenticated();
    }
};