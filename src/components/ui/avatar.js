import { cn } from "@/lib/utils";

function initials(name = "User") {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function Avatar({ name, className }) {
    return (
        <div
            className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-gradient-to-br from-sky-100 to-indigo-100 text-[11px] font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:from-sky-500/20 dark:to-indigo-500/20 dark:text-slate-100",
                className,
            )}
            title={name}
            aria-label={name}
        >
            {initials(name)}
        </div>
    );
}
