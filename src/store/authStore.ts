import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserInfo = {
    userId: number | null;
    email: string;
    username: string;
    isAuthenticated: boolean;
}

type UserAction = {
    setAuthenticated: (state: UserInfo) => void;
    clearAuthenticated: () => void;
}

const initialState: UserInfo = {
    userId: null,
    email: "",
    username: "",
    isAuthenticated: false,
};

export const userAuthStore = create<UserInfo & UserAction>()(
    persist(
        (set) => ({
            ...initialState,
            setAuthenticated: (state: UserInfo) => set({ ...initialState, ...state, isAuthenticated: true }),
            clearAuthenticated: () => set(initialState),
        }),
        {
            name: "auth-store",
            partialize: (state) => ({
                userId: state.userId,
                email: state.email,
                username: state.username,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export const setAuthenticated = (state: UserInfo) => {
    userAuthStore.setState({ ...state, isAuthenticated: true });
}
export const clearAuthenticated = () => {
    userAuthStore.getState().clearAuthenticated();
}