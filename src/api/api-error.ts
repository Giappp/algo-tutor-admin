import axios from "axios";

export class AppError extends Error {
    constructor(
        message: string,
        public readonly status?: number,
        public readonly validationErrors?: Record<string, string | string[]> | null
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
        const data = error.response?.data;
        // Ưu tiên lấy 'code' từ body response của backend, nếu không có thì lấy HTTP status
        const status = data?.code || error.response?.status;

        // Kiểm tra xem backend có trả về đúng format ErrorResponse không
        if (typeof data === "object" && data !== null && "errors" in data) {
            const backendErrors = data.errors;

            // Trường hợp 1: errors là một chuỗi (Lỗi chung chung như "Sai mật khẩu", "Không tìm thấy user")
            if (typeof backendErrors === "string") {
                return new AppError(backendErrors, status);
            }

            // Trường hợp 2: errors là một Object (Lỗi validation form từ Spring Boot)
            // Ví dụ backend trả: { errors: { email: "Trống", username: "Đã tồn tại" } }
            if (typeof backendErrors === "object" && backendErrors !== null) {
                // Lấy thông báo đầu tiên trong object để làm message chính (hoặc gộp lại tùy ý bạn)
                const firstErrorMessage = Object.values(backendErrors)[0] as string;
                const mainMessage = firstErrorMessage || "Dữ liệu đầu vào không hợp lệ.";

                return new AppError(mainMessage, status, backendErrors);
            }
        }

        // Fallback nếu có lỗi mạng hoặc backend sập không trả về đúng format
        return new AppError(error.message || "Đã xảy ra lỗi không xác định.", status);
    }

    if (error instanceof Error) {
        return new AppError(error.message);
    }

    return new AppError("Đã xảy ra lỗi không xác định.");
};