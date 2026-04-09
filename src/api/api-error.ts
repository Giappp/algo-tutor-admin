import axios from "axios";

export class AppError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
        public readonly validationErrors?: Record<string, string | string[]> | null,
        cause?: unknown // Add a parameter for the original error
    ) {
        // Pass the cause to the parent Error constructor
        super(message, {cause});
        this.name = "AppError";

        // Capture the correct stack trace (cleans up the trace output)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

export const toAppError = (error: unknown): AppError => {
    // If it's already an AppError, return it
    if (error instanceof AppError) {
        return error;
    }

    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        const status = data?.code || error.response?.status;

        if (typeof data === "object" && data !== null && "errors" in data) {
            const backendErrors = data.errors;

            if (typeof backendErrors === "string") {
                // Pass 'error' as the 4th argument (cause)
                return new AppError(backendErrors, status, null, error);
            }

            if (typeof backendErrors === "object" && backendErrors !== null) {
                const firstErrorMessage = Object.values(backendErrors)[0] as string;
                const mainMessage = firstErrorMessage || "Dữ liệu đầu vào không hợp lệ.";
                // Pass 'error' as the 4th argument (cause)
                return new AppError(mainMessage, status, backendErrors, error);
            }
        }

        // Pass 'error' as the 4th argument (cause)
        return new AppError(error.message || "Đã xảy ra lỗi không xác định.", status, null, error);
    }

    if (error instanceof Error) {
        // Pass 'error' as the cause
        return new AppError(error.message, undefined, null, error);
    }

    return new AppError("Đã xảy ra lỗi không xác định.", undefined, null, error);
};