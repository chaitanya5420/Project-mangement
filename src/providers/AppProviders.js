"use client";

import QueryProvider from "@/providers/QueryProvider";
import AuthHydrator from "@/providers/AuthHydrator";

export default function AppProviders({ children }) {
    return (
        <QueryProvider>
            <AuthHydrator />
            {children}
        </QueryProvider>
    );
}
