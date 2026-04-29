"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
    const token = useAuthStore((state) => state.token);
    const hydrated = useAuthStore((state) => state.hydrated);

    if (!hydrated) {
        return <div className="p-6 text-sm text-slate-600">Loading...</div>;
    }

    if (token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <Link
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    href="/dashboard"
                >
                    Go to dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-500">
            <div className="space-x-3">
                <Link
                    className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                    href="/login"
                >
                    Sign in
                </Link>
                <Link
                    className="rounded-md border border-slate-700 bg-green-500 px-4 py-2 text-sm font-medium"
                    href="/register"
                >
                    Create account
                </Link>
            </div>
        </div>
    );
}
