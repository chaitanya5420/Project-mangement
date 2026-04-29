import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }) {
    return (
        <select
            className={cn(
                "h-10 w-full rounded-xl border border-slate-300 bg-white/90 px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-50",
                className,
            )}
            {...props}
        >
            {children}
        </select>
    );
}
