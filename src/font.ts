import { Sora, Plus_Jakarta_Sans } from "next/font/google";

export const sora = Sora({
    variable: "--font-sora",
    subsets: ["latin", "latin-ext"],
    weight: ["400", "500", "600", "700", "800"],
});

export const plusJakartaSans = Plus_Jakarta_Sans({
    variable: "--font-jakarta",
    subsets: ["latin", "latin-ext"],
    weight: ["400", "500", "600", "700"],
});
