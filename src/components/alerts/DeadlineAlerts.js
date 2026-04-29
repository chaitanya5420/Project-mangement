"use client";

import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow, parseISO, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";

function safeParse(date) {
    try {
        return typeof date === "string" ? parseISO(date) : date;
    } catch (error) {
        return null;
    }
}

function formatDeadline(date) {
    const parsed = safeParse(date);

    if (!parsed) return "No due date";

    return parsed.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export default function DeadlineAlerts({ tasks = [] }) {
    const [visible, setVisible] = useState(true);
    const notifiedRef = useRef({});
    const [toasts, setToasts] = useState([]);

    // initialize notifiedRef from localStorage on mount (no state updates)
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem("deadline_notified");
            if (stored) {
                notifiedRef.current = JSON.parse(stored);
            }
        } catch (error) {
            notifiedRef.current = {};
        }
    }, []);

    useEffect(() => {
        if (!toasts.length) return undefined;

        const timer = window.setTimeout(() => {
            setToasts((current) => current.slice(1));
        }, 4000);

        return () => window.clearTimeout(timer);
    }, [toasts]);

    useEffect(() => {
        if (!tasks.length) return;

        const now = new Date();
        const overdue = tasks.filter((task) => {
            const dueDate = safeParse(task.dueDate);
            return dueDate ? isBefore(dueDate, now) : false;
        });

        const dueSoon = tasks.filter((task) => {
            const dueDate = safeParse(task.dueDate);
            if (!dueDate) return false;

            const ms = dueDate.getTime() - now.getTime();
            return ms > 0 && ms <= 1000 * 60 * 60 * 24 * 7;
        });

        const fresh = [...overdue, ...dueSoon].filter(
            (task) => !notifiedRef.current[task._id],
        );

        if (!fresh.length) return;

        if (
            typeof Notification !== "undefined" &&
            Notification.permission === "default"
        ) {
            Notification.requestPermission();
        }

        const nextNotified = { ...notifiedRef.current };
        const nextToasts = [];

        fresh.forEach((task) => {
            const dueLabel = formatDeadline(task.dueDate);
            const when = safeParse(task.dueDate);
            const projectName = task.project?.name || "Project";
            const body = when
                ? `${projectName} • Due on ${dueLabel} (${formatDistanceToNow(
                      when,
                      {
                          addSuffix: true,
                      },
                  )})`
                : `${projectName} • ${dueLabel}`;

            nextNotified[task._id] = true;
            nextToasts.push({
                id: `${task._id}-${Date.now()}`,
                title: task.title || "Task deadline",
                body,
            });

            if (
                typeof Notification !== "undefined" &&
                Notification.permission === "granted"
            ) {
                new Notification(task.title || "Task deadline", { body });
            }
        });

        try {
            window.localStorage.setItem(
                "deadline_notified",
                JSON.stringify(nextNotified),
            );
            notifiedRef.current = nextNotified;
        } catch (error) {
            // ignore storage failures
        }

        setToasts((current) => [...nextToasts, ...current].slice(0, 3));
    }, [tasks]);

    const now = new Date();
    const overdue = tasks.filter((task) => {
        const dueDate = safeParse(task.dueDate);
        return dueDate ? isBefore(dueDate, now) : false;
    });
    const dueSoon = tasks.filter((task) => {
        const dueDate = safeParse(task.dueDate);
        if (!dueDate) return false;

        const ms = dueDate.getTime() - now.getTime();
        return ms > 0 && ms <= 1000 * 60 * 60 * 24 * 7;
    });

    if (!tasks.length && !toasts.length) return null;

    return (
        <>
            <div className="fixed right-4 top-4 z-50 space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="w-[320px] rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/95"
                    >
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                            {toast.title}
                        </p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {toast.body}
                        </p>
                    </div>
                ))}
            </div>

            {tasks.length ? (
                <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 dark:border-rose-800 dark:bg-rose-950/30">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-semibold text-rose-700 dark:text-rose-200">
                                {overdue.length
                                    ? `You have ${overdue.length} overdue task${overdue.length > 1 ? "s" : ""}`
                                    : `Upcoming deadlines: ${dueSoon.length}`}
                            </h3>
                            <p className="mt-1 text-sm text-rose-700/80 dark:text-rose-200/80">
                                {overdue.length
                                    ? "Review and reassign to avoid blockers."
                                    : "Tasks due within the next 7 days."}
                            </p>
                        </div>

                        {visible ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVisible(false)}
                            >
                                Dismiss
                            </Button>
                        ) : null}
                    </div>

                    {visible ? (
                        <div className="mt-3 grid gap-2">
                            {overdue.length > 0 && (
                                <div className="space-y-2">
                                    {overdue.slice(0, 3).map((task) => (
                                        <div
                                            key={task._id}
                                            className="flex items-center justify-between rounded-lg bg-white/60 p-2 dark:bg-slate-900/60"
                                        >
                                            <div>
                                                <div className="text-sm font-medium text-rose-700 dark:text-rose-200">
                                                    {task.title}
                                                </div>
                                                <div className="text-xs text-rose-600 dark:text-rose-300">
                                                    {task.project?.name ||
                                                        "Project"}{" "}
                                                    • Due on{" "}
                                                    {formatDeadline(
                                                        task.dueDate,
                                                    )}{" "}
                                                    • Overdue by{" "}
                                                    {formatDistanceToNow(
                                                        safeParse(task.dueDate),
                                                        { addSuffix: true },
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {overdue.length === 0 &&
                                dueSoon.slice(0, 3).map((task) => (
                                    <div
                                        key={task._id}
                                        className="flex items-center justify-between rounded-lg bg-white/60 p-2 dark:bg-slate-900/60"
                                    >
                                        <div>
                                            <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                                                {task.title}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                {task.project?.name ||
                                                    "Project"}{" "}
                                                • Due on{" "}
                                                {formatDeadline(task.dueDate)} •{" "}
                                                {formatDistanceToNow(
                                                    safeParse(task.dueDate),
                                                    { addSuffix: true },
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}
