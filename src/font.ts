import {Average_Sans, Spline_Sans_Mono} from "next/font/google";

export const averageSans = Average_Sans({
    variable: "--font-avg-sans",
    weight: ["400"],
    subsets: ["latin", "latin-ext"]
})

export const splineSansMono = Spline_Sans_Mono({
    variable: "--font-spline-mono",
    weight: ["400", "500", "600"],
    subsets: ["latin"],
});