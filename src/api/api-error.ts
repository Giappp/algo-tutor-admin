import axios from "axios";

export class AppError extends Error {
    constructor(
        message: string,
        public readonly status?: number
    ) {
        super(message);
        this.name = "AppError";
    }
}

export const toAppError = (error: unknown): AppError => {
    if (error instanceof AppError) {
        return error;
    }

    if (axios.isAxiosError(error)) {
        const message =
            typeof error.response?.data === "object" &&
            error.response?.data !== null &&
            "message" in error.response.data &&
            typeof error.response.data.message === "string"
                ? error.response.data.message
                : error.message;

        return new AppError(message || "An unexpected error occurred.", error.response?.status);
    }

    if (error instanceof Error) {
        return new AppError(error.message);
    }

    return new AppError("An unexpected error occurred.");
};