import axios, {AxiosError, AxiosRequestConfig} from "axios";
import {toAppError} from "@/api/core/api-error";
import {clearAuthenticated} from "@/store/authStore";
import {ApiResponse, PageResponse} from "@/types/shared";

const baseConfig: AxiosRequestConfig = {
    baseURL: "http://localhost:8080",
    timeout: 10000,
    headers: {Accept: "application/json"},
    withCredentials: true,
    // xsrfCookieName: "XSRF-TOKEN",
    // xsrfHeaderName: "X-CSRF-TOKEN",
};

// 2. Create a "plain" instance for auth operations (NO INTERCEPTORS)
const plainApi = axios.create(baseConfig);

// 3. Create the main instance that will have interceptors attached
export const api = axios.create(baseConfig);

const retriedRequests = new WeakSet<object>();
let isRefreshing = false;

interface QueueItem {
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason: AxiosError | Error) => void;
}

let failedQueue: QueueItem[] = [];

const processQueue = (error: AxiosError | Error | null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        // 1. Check for 401 Unauthorized
        if (!axios.isAxiosError(error) || !error.config || error.response?.status !== 401) {
            return Promise.reject(toAppError(error));
        }

        // 2. Prevent infinite loop on the same request
        if (retriedRequests.has(error.config)) {
            return Promise.reject(toAppError(error));
        }

        // 3. If currently refreshing, queue this request
        if (isRefreshing) {
            return new Promise<void>((resolve, reject) => {
                failedQueue.push({resolve, reject});
            })
                .then(() => api(error.config!))
                .catch((err) => {
                    return Promise.reject(toAppError(err));
                });
        }

        // 4. Start the Refresh Token process
        retriedRequests.add(error.config);
        isRefreshing = true;

        try {
            await plainApi.post('/api/auth/refresh');
            processQueue(null);

            // Re-fire the original request
            return api(error.config);

        } catch (refreshError) {
            const err = axios.isAxiosError(refreshError) || refreshError instanceof Error
                ? refreshError
                : new Error(String(refreshError));

            processQueue(err);

            try {
                await plainApi.post('/api/auth/logout');
            } finally {
                clearAuthenticated();
            }

            if (globalThis.window !== undefined) {
                globalThis.location.href = "/login";
            }

            return Promise.reject(toAppError(err)); // FIX: Return rejected promise
        } finally {
            isRefreshing = false;
        }
    }
);

type Cfg = AxiosRequestConfig & { signal?: AbortSignal };

export const get = async <T>(url: string, config?: Cfg) =>
    (await api.get<ApiResponse<T>>(url, config)).data.data;

export const post = async <T, B = unknown>(url: string, body?: B, config?: Cfg) =>
    (await api.post<ApiResponse<T>>(url, body, config)).data.data;

export const put = async <T, B = unknown>(url: string, body?: B, config?: Cfg) =>
    (await api.put<ApiResponse<T>>(url, body, config)).data.data;

export const del = async <T>(url: string, config?: Cfg) =>
    (await api.delete<ApiResponse<T>>(url, config)).data.data;

export const patch = async <T, B = unknown>(url: string, body?: B, config?: Cfg) =>
    (await api.patch<ApiResponse<T>>(url, body, config)).data.data;

export const getPage = async <T>(url: string, config?: Cfg) => {
    const response = (await api.get<PageResponse<T>>(url, config)).data;
    return {
        ...response,
        hasNext: response.currentPage < response.totalPages - 1,
        hasPrevious: response.currentPage > 0,
    };
};