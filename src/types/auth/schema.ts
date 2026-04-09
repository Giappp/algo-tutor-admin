import z from "zod";

export const SignInSchema = z.object({
    userName: z.string().min(1, "Username is required."),
    password: z.string().min(6, "Password must be at least 6 characters.")
});

export const SignUpSchema = z.object({
    userName: z.string().min(1, "Username is required."),
    email: z.email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters.")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",});