import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
    {
        variants: {
            variant: {
                slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
                blue: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
                green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
                amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                red: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
            },
        },
        defaultVariants: {
            variant: "slate",
        },
    },
);

export function Badge({ className, variant, ...props }) {
    return (
        <span
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    );
}
