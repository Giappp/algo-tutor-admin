import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toAppError } from "@/api/api-error";
import { clearAuthenticated } from "@/store/authStore";

export const api = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000,
    headers: { Accept: "application/json" },
    withCredentials: true,
    // xsrfCookieName: "XSRF-TOKEN",
    // xsrfHeaderName: "X-CSRF-TOKEN",
});

export const authApi = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 10000,
    headers: { Accept: "application/json" },
    withCredentials: true,
});

const retriedRequests = new WeakSet<object>();
let isRefreshing = false;

interface QueueItem {
    resolve: (value: void | PromiseLike<void>) => void;
    reject: (reason: Error | AxiosError) => void;
}
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | AxiosError | null) => {
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
        // 1. Kiểm tra điều kiện lỗi 401
        if (!axios.isAxiosError(error) || !error.config || error.response?.status !== 401) {
            return Promise.reject(toAppError(error));
        }

        // 2. Kiểm tra xem request này đã được retry trước đó chưa (Chống Infinite Loop)
        if (retriedRequests.has(error.config)) {
            return Promise.reject(toAppError(error));
        }

        // 3. Nếu đang có một request refresh chạy rồi, đẩy các request khác vào Queue
        if (isRefreshing) {
            return new Promise<void>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then(() => api(error.config!)) // Gọi lại request ban đầu khi queue được resolve
                .catch((err: Error | AxiosError) => Promise.reject(toAppError(err)));
        }

        // 4. Bắt đầu quá trình Refresh Token
        retriedRequests.add(error.config);
        isRefreshing = true;

        try {
            await authApi.post('/api/auth/refresh');

            processQueue(null);

            return api(error.config);

        } catch (refreshError) {
            const err = refreshError instanceof Error || axios.isAxiosError(refreshError)
                ? refreshError
                : new Error(String(refreshError));

            processQueue(err);

            try {
                await authApi.post('/api/auth/logout');
            } finally {
                clearAuthenticated();
            }

            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }

            return Promise.reject(toAppError(err));
        } finally {
            // Đặt lại trạng thái khi hoàn tất (dù thành công hay thất bại)
            isRefreshing = false;
        }
    }
);

type Cfg = AxiosRequestConfig & { signal?: AbortSignal };

export const get = async <T>(url: string, config?: Cfg) => (await api.get<T>(url, config)).data;

export const post = async <T, B = unknown>(url: string, body?: B, config?: Cfg) =>
    (await api.post<T>(url, body, config)).data;

export const put = async <T, B = unknown>(url: string, body?: B, config?: Cfg) =>
    (await api.put<T>(url, body, config)).data;

export const del = async <T>(url: string, config?: Cfg) => (await api.delete<T>(url, config)).data;