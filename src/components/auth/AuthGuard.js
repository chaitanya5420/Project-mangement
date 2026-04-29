"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function AuthGuard({ children }) {
    const router = useRouter();
    const token = useAuthStore((state) => state.token);
    const hydrated = useAuthStore((state) => state.hydrated);

    useEffect(() => {
        if (hydrated && !token) {
            router.replace("/login");
        }
    }, [hydrated, token, router]);

    if (!hydrated || !token) {
        return <div className="p-6 text-sm text-slate-600">Loading...</div>;
    }

    return children;
}
