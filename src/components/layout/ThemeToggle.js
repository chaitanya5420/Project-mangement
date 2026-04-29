"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();

    const isDark = (resolvedTheme || theme) === "dark";

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="gap-2"
            aria-label="Toggle dark theme"
        >
            <span className="text-base">{isDark ? "☾" : "☼"}</span>
            <span className="hidden sm:inline">
                {isDark ? "Dark" : "Light"}
            </span>
        </Button>
    );
}
