import axios, {AxiosError} from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 10000,
    headers: {
        Accept: "application/json",
    },
    withCredentials: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-CSRF-TOKEN",
});

export const authApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_SERVER_URL,
    timeout: 10000,
    headers: {
        Accept: "application/json",
    },
    withCredentials: true,
})

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401) {
            
        }
    }
)
