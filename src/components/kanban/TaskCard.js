"use client";

import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

const priorityVariant = {
    low: "blue",
    medium: "amber",
    high: "red",
};

const statusVariant = {
    todo: "slate",
    in_progress: "blue",
    done: "green",
};

function formatDaysRemaining(dueDate, status) {
    if (status === "done") {
        return { label: "Completed", tone: "success" };
    }

    if (!dueDate) {
        return { label: "No due date", tone: "neutral" };
    }

    const due = new Date(dueDate);
    if (Number.isNaN(due.getTime())) {
        return { label: "No due date", tone: "neutral" };
    }
    
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const remainingDays = Math.ceil((due - now) / msPerDay);

    if (remainingDays === 0) {
        return { label: "Due today", tone: "warning" };
    }

    if (remainingDays > 0) {
        return {
            label: `${remainingDays} day${remainingDays === 1 ? "" : "s"} left`,
            tone: "info",
        };
    }

    const overdueDays = Math.abs(remainingDays);
    return {
        label: `Overdue by ${overdueDays} day${overdueDays === 1 ? "" : "s"}`,
        tone: "danger",
    };
}

export default function TaskCard({
    task,
    listeners,
    attributes,
    isDragging,
    canDelete,
    onDelete,
    onToggleChecklistItem,
    onUpdateChecklist,
}) {
    const [isEditingChecklist, setIsEditingChecklist] = useState(false);
    const checklistItems = useMemo(() => {
        if (Array.isArray(task.checklist) && task.checklist.length) {
            return task.checklist;
        }

        if (task.checkboxLabel || task.checkbox) {
            return [
                {
                    id: "legacy-checkbox",
                    text: task.checkboxLabel || "Task checkbox",
                    completed: Boolean(task.checkbox),
                },
            ];
        }

        return [];
    }, [task.checklist, task.checkboxLabel, task.checkbox]);

    const [draftChecklist, setDraftChecklist] = useState(() =>
        checklistItems.map((item) => ({
            id: item.id,
            text: item.text,
            completed: Boolean(item.completed),
        })),
    );

    const completedChecklistCount = checklistItems.filter(
        (item) => item.completed,
    ).length;
    const checklistProgressPercent =
        checklistItems.length > 0
            ? Math.round(
                  (completedChecklistCount / checklistItems.length) * 100,
              )
            : Boolean(task.checkbox)
              ? 100
              : 0;
    const isTaskComplete =
        checklistItems.length > 0
            ? completedChecklistCount === checklistItems.length
            : Boolean(task.checkbox);

    // Auto-delete task when all checklist items are completed
    useEffect(() => {
        if (isTaskComplete && typeof onDelete === "function") {
            // Small delay to allow user to see the completion
            const timeoutId = setTimeout(() => {
                onDelete(task);
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [isTaskComplete, onDelete, task]);

    const deadlineState = formatDaysRemaining(task.dueDate, task.status);

    const updateDraftItem = (itemId, updates) => {
        setDraftChecklist((current) =>
            current.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item,
            ),
        );
    };

    const addDraftItem = () => {
        setDraftChecklist((current) => [
            ...current,
            {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                text: "",
                completed: false,
            },
        ]);
    };

    const removeDraftItem = (itemId) => {
        setDraftChecklist((current) => {
            const next = current.filter((item) => item.id !== itemId);
            return next.length > 0
                ? next
                : [
                      {
                          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                          text: "",
                          completed: false,
                      },
                  ];
        });
    };

    const saveChecklist = () => {
        const nextChecklist = draftChecklist
            .map((item) => ({
                id: item.id,
                text: item.text.trim(),
                completed: Boolean(item.completed),
            }))
            .filter((item) => item.text);

        if (typeof onUpdateChecklist === "function") {
            onUpdateChecklist(task, nextChecklist);
        }

        setIsEditingChecklist(false);
    };

    const deadlineToneClasses = {
        success: "text-emerald-600 dark:text-emerald-400",
        warning: "text-amber-600 dark:text-amber-400",
        info: "text-indigo-600 dark:text-indigo-400",
        danger: "text-red-600 dark:text-red-400",
        neutral: "text-slate-500",
    };

    return (
        <div
            {...listeners}
            {...attributes}
            className={`relative rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm transition ${isDragging ? "opacity-40" : "hover:-translate-y-px"}`}
        >
            <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm">
                    <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-semibold text-slate-700"
                        style={{
                            background: `conic-gradient(#10b981 ${checklistProgressPercent}%, #e2e8f0 ${checklistProgressPercent}% 100%)`,
                        }}
                    >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white">
                            {checklistProgressPercent}%
                        </div>
                    </div>
                    <div className="leading-tight">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            task
                        </p>
                        <p className="text-[10px] font-medium text-slate-700">
                            {completedChecklistCount}/
                            {checklistItems.length || 1}
                        </p>
                    </div>
                </div>
                {/* <Badge variant={isTaskComplete ? "green" : "amber"}>
                    {isTaskComplete ? "Complete" : "Incomplete"}
                </Badge> */}
            </div>

            <div className="mb-3 flex items-start justify-between gap-2 pr-24">
                <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900">
                    {task.title}
                </h4>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant[task.status] || "slate"}>
                    {task.status.replace("_", " ")}
                </Badge>
                <Badge variant={priorityVariant[task.priority] || "slate"}>
                    {task.priority}
                </Badge>
            </div>

            {task.description ? (
                <p className="mb-3 line-clamp-2 text-xs leading-5 text-slate-600">
                    {task.description}
                </p>
            ) : null}

            {checklistItems.length > 0 ? (
                <div className="mb-3 space-y-2 rounded-lg bg-slate-50 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Checklist
                        </p>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] text-slate-600"
                            onClick={(event) => {
                                event.stopPropagation();
                                if (!isEditingChecklist) {
                                    setDraftChecklist(
                                        checklistItems.map((item) => ({
                                            id: item.id,
                                            text: item.text,
                                            completed: Boolean(item.completed),
                                        })),
                                    );
                                }
                                setIsEditingChecklist((current) => !current);
                            }}
                        >
                            {isEditingChecklist ? "Done" : "Edit"}
                        </Button>
                    </div>

                    {isEditingChecklist ? (
                        <div className="space-y-2">
                            {draftChecklist.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-2 rounded-md border border-slate-200 bg-white px-2 py-2"
                                >
                                    <input
                                        type="checkbox"
                                        checked={Boolean(item.completed)}
                                        onPointerDown={(event) =>
                                            event.stopPropagation()
                                        }
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        onChange={(event) =>
                                            updateDraftItem(item.id, {
                                                completed: event.target.checked,
                                            })
                                        }
                                        className="mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-500"
                                    />
                                    <Input
                                        value={item.text}
                                        onPointerDown={(event) =>
                                            event.stopPropagation()
                                        }
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        onChange={(event) =>
                                            updateDraftItem(item.id, {
                                                text: event.target.value,
                                            })
                                        }
                                        placeholder="Checklist item"
                                        className="h-8 flex-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-[10px] text-slate-500"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            removeDraftItem(item.id);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}

                            <div className="flex items-center justify-between gap-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-[10px] text-slate-600"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        addDraftItem();
                                    }}
                                >
                                    Add item
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-[10px] text-emerald-700"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        saveChecklist();
                                    }}
                                >
                                    Save checklist
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {checklistItems.map((item) => (
                                <label
                                    key={item.id}
                                    className="flex items-start gap-2 text-xs text-slate-700"
                                >
                                    <input
                                        type="checkbox"
                                        checked={Boolean(item.completed)}
                                        onPointerDown={(event) =>
                                            event.stopPropagation()
                                        }
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        onChange={() => {
                                            if (
                                                typeof onToggleChecklistItem ===
                                                "function"
                                            ) {
                                                onToggleChecklistItem(
                                                    task,
                                                    item.id,
                                                );
                                            }
                                        }}
                                        className="mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-500"
                                    />
                                    <span
                                        className={`flex-1 ${item.completed ? "text-slate-400 line-through" : "font-medium text-slate-700"}`}
                                    >
                                        {item.text}
                                    </span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}

            <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                <div className="flex items-center gap-2">
                    <Avatar
                        name={task.assignedTo?.name || "Unassigned"}
                        className="h-7 w-7 text-[10px]"
                    />
                    <span className="text-xs text-slate-500">
                        {task.assignedTo?.name || "Unassigned"}
                    </span>
                </div>
                <div className="text-right">
                    <p className="text-xs font-medium text-slate-500">
                        {formatDate(task.dueDate)}
                    </p>
                    <p
                        className={`text-[11px] font-semibold ${deadlineToneClasses[deadlineState.tone]}`}
                    >
                        {deadlineState.tone === "danger" ? "! " : ""}
                        {deadlineState.label}
                    </p>
                </div>
            </div>

            {canDelete && typeof onDelete === "function" ? (
                <div className="mt-3 flex justify-end">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                        onClick={(event) => {
                            event.stopPropagation();
                            onDelete(task);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
