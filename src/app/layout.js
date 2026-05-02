import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppProviders from "@/providers/AppProviders";
import ThemeProvider from "@/providers/ThemeProvider";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "TaskFlow",
    description: "Collaborative task manager",
};

import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }) {
    return (
        <html
            lang="en"
            className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
            suppressHydrationWarning
        >
            <body className="min-h-full flex flex-col">
                <ThemeProvider>
                    <AppProviders>{children}</AppProviders>
                    <Toaster position="top-right" />
                </ThemeProvider>
            </body>
        </html>
    );
}
