import { cn } from "@/lib/utils";

export function Modal({ open, title, onClose, children }) {
    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div
                className={cn(
                    "w-full max-w-lg rounded-lg bg-white p-5 shadow-xl",
                )}
            >
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button
                        className="text-slate-500 hover:text-slate-900"
                        onClick={onClose}
                    >
                        x
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}
