import { cn } from "@/lib/utils";

export function Card({ className, ...props }) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-950/70",
                className,
            )}
            {...props}
        />
    );
}

export function CardTitle({ className, ...props }) {
    return (
        <h3
            className={cn(
                "text-lg font-semibold text-slate-900 dark:text-slate-50",
                className,
            )}
            {...props}
        />
    );
}

export function CardDescription({ className, ...props }) {
    return (
        <p
            className={cn(
                "text-sm text-slate-600 dark:text-slate-400",
                className,
            )}
            {...props}
        />
    );
}
