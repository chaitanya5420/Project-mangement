import { cn } from "@/lib/utils";

export function Modal({ open, title, onClose, children }) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm transition-all duration-300">
            <div
                className={cn(
                    "w-full max-w-lg overflow-hidden rounded-3xl border border-white/20 bg-white/80 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80",
                )}
            >
                <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h3>
                    <button
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
