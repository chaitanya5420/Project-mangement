import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "bg-indigo-600 text-white shadow-sm hover:-translate-y-px hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400",
                secondary:
                    "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
                outline:
                    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900",
                ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50",
                destructive:
                    "bg-red-600 text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400",
            },
            size: {
                default: "h-10 px-4",
                sm: "h-8 px-3 text-xs",
                lg: "h-11 px-6",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);

export function Button({
    className,
    variant,
    size,
    type = "button",
    ...props
}) {
    return (
        <button
            type={type}
            className={cn(buttonVariants({ variant, size }), className)}
            {...props}
        />
    );
}
