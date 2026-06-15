import {create} from "zustand";
import {persist} from "zustand/middleware";

export type UserInfo = {
    userId: number | null;
    email: string;
    username: string;
    role: string;
    avatar?: string;
    isAuthenticated: boolean;
};

// Create a specific type for the login payload to omit the boolean flag
export type UserPayload = Omit<UserInfo, "isAuthenticated">;

export const ADMIN_ROLE = "ADMIN";

export const isAdminUser = (user: Pick<UserInfo, "role">) => user.role.toUpperCase() === ADMIN_ROLE;

type UserAction = {
    setAuthenticated: (user: UserPayload) => void;
    clearAuthenticated: () => void;
};

const initialState: UserInfo = {
    userId: null,
    email: "",
    username: "",
    role: "",
    avatar: "",
    isAuthenticated: false,
};

export const useAuthStore = create<UserInfo & UserAction>()(
    persist(
        (set) => ({
            ...initialState,
            // Simplified the state merge
            setAuthenticated: (user) => set({...user, isAuthenticated: true}),
            // Simplified the state reset
            clearAuthenticated: () => set(initialState),
        }),
        {
            name: "auth-store",
            partialize: (state) => ({
                userId: state.userId,
                email: state.email,
                username: state.username,
                role: state.role,
                avatar: state.avatar,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// External helper actions (consistent routing through getState)
export const setAuthenticated = (user: UserPayload) => {
    useAuthStore.getState().setAuthenticated(user);
};

export const clearAuthenticated = () => {
    useAuthStore.getState().clearAuthenticated();
};
