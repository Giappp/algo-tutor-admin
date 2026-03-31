import {create} from "zustand";

type UserInfo = {
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

export const userAuthStore = create<UserInfo & UserAction>((set) => ({
    ...initialState,
    setAuthenticated: (state: UserInfo) => set({...initialState, ...state, isAuthenticated: true}),
    clearAuthenticated: () => set(initialState)
}));

export const setAuthenticated = (state: UserInfo) => {
    userAuthStore.setState({...state, isAuthenticated: true});
}
export const clearAuthenticated = () => {
    userAuthStore.getState().clearAuthenticated();
}