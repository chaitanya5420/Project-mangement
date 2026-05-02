"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
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
    members = [],
    listeners,
    attributes,
    isDragging,
    canDelete,
    canEditChecklist,
    canAssignTask,
    onDelete,
    onToggleChecklistItem,
    onUpdateChecklist,
    onUpdateTask,
    onArchive,
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
            assignedTo: item.assignedTo || null,
        })),
    );

    // Sync draft checklist when server data changes (fixes stale edit bug)
    useEffect(() => {
        if (!isEditingChecklist) {
            setDraftChecklist(
                checklistItems.map((item) => ({
                    id: item.id,
                    text: item.text,
                    completed: Boolean(item.completed),
                    assignedTo: item.assignedTo || null,
                })),
            );
        }
    }, [checklistItems, isEditingChecklist]);

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
                assignedTo: null,
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
                          assignedTo: null,
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
                assignedTo: item.assignedTo || null,
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
            className={`group relative flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white/80 p-4 text-left shadow-sm backdrop-blur-md transition-all duration-300 ease-in-out dark:border-slate-700/60 dark:bg-slate-900/80 ${
                isDragging
                    ? "rotate-2 scale-105 cursor-grabbing opacity-90 shadow-xl ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950"
                    : "cursor-grab hover:-translate-y-1 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600"
            }`}
        >
            <div className="absolute right-3 top-3 z-10 flex flex-col items-end gap-1">
                <div className="flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/60 px-2 py-1 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60">
                    <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-semibold text-slate-700 dark:text-slate-200"
                        style={{
                            background: `conic-gradient(#10b981 ${checklistProgressPercent}%, transparent ${checklistProgressPercent}% 100%)`,
                        }}
                    >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white dark:bg-slate-800">
                            {checklistProgressPercent}%
                        </div>
                    </div>
                    <div className="leading-tight">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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

            <div className="flex items-start justify-between gap-2 pr-24">
                <h4 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
                    {task.title}
                </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant[task.status] || "slate"}>
                    {task.status.replace("_", " ")}
                </Badge>
                <Badge variant={priorityVariant[task.priority] || "slate"}>
                    {task.priority}
                </Badge>
                {task.assignedTo?.name && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                        <Avatar name={task.assignedTo.name} className="h-4 w-4 text-[7px]" />
                        {task.assignedTo.name}
                    </span>
                )}
            </div>

            {task.description ? (
                <p className="line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                    {task.description}
                </p>
            ) : null}

            {checklistItems.length > 0 ? (
                <div className="space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/50 px-3 py-3 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Checklist
                        </p>
                        {canEditChecklist && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 rounded-lg px-2 text-[10px] text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    if (!isEditingChecklist) {
                                        setDraftChecklist(
                                            checklistItems.map((item) => ({
                                                id: item.id,
                                                text: item.text,
                                                completed: Boolean(item.completed),
                                                assignedTo: item.assignedTo || null,
                                            })),
                                        );
                                    }
                                    setIsEditingChecklist((current) => !current);
                                }}
                            >
                                {isEditingChecklist ? "Done" : "Edit"}
                            </Button>
                        )}
                    </div>

                    {isEditingChecklist ? (
                        <div className="space-y-2">
                            {draftChecklist.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80"
                                    >
                                        <div className="flex items-start gap-2">
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
                                                className="h-8 flex-1 rounded-lg border-slate-200/60 bg-transparent text-xs focus:border-indigo-500 focus:ring-0 dark:border-slate-700/60"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 rounded-lg px-2 text-[10px] text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    removeDraftItem(item.id);
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-2 pl-6">
                                            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Assign:</span>
                                            <select
                                                value={item.assignedTo || ""}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateDraftItem(item.id, {
                                                        assignedTo: e.target.value || null,
                                                    });
                                                }}
                                                onPointerDown={(e) => e.stopPropagation()}
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-6 flex-1 rounded-lg border border-slate-200/60 bg-white/80 px-2 text-[10px] text-slate-600 outline-none transition-colors hover:border-indigo-500 hover:ring-1 focus:border-indigo-500 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300"
                                            >
                                                <option value="">Unassigned</option>
                                                {members.map((member) => (
                                                    <option key={member.user._id || member.user} value={member.user._id || member.user}>
                                                        {member.user.name || "Member"}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                            ))}

                            <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-2 dark:border-slate-700/60">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 rounded-lg px-2 text-[10px] text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        addDraftItem();
                                    }}
                                >
                                    Add item
                                </Button>

                                {canAssignTask && (
                                    <select
                                        value={task.assignedTo?._id || task.assignedTo || ""}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            if (typeof onUpdateTask === "function") {
                                                onUpdateTask(task._id, { assignedTo: e.target.value || null });
                                            }
                                        }}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                        className="h-7 w-32 rounded-lg border border-slate-200/60 bg-white/80 px-2 text-[10px] text-slate-600 outline-none transition-colors hover:bg-slate-50 focus:border-indigo-500 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700"
                                    >
                                        <option value="">Unassigned</option>
                                        {members.map((member) => (
                                            <option key={member.user._id || member.user} value={member.user._id || member.user}>
                                                {member.user.name || "Member"}
                                            </option>
                                        ))}
                                    </select>
                                )}

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 rounded-lg bg-emerald-50 px-3 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20"
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
                                    className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-0.5 text-xs text-slate-700 transition-colors hover:bg-white/60 dark:text-slate-300 dark:hover:bg-slate-800/60"
                                >
                                    <input
                                        type="checkbox"
                                        checked={Boolean(item.completed)}
                                        disabled={!canEditChecklist}
                                        onPointerDown={(event) =>
                                            event.stopPropagation()
                                        }
                                        onClick={(event) =>
                                            event.stopPropagation()
                                        }
                                        onChange={() => {
                                            if (
                                                canEditChecklist &&
                                                typeof onToggleChecklistItem ===
                                                "function"
                                            ) {
                                                onToggleChecklistItem(
                                                    task,
                                                    item.id,
                                                );
                                            }
                                        }}
                                        className={`mt-1 h-4 w-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-500 ${!canEditChecklist ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                                    />
                                    <span
                                        className={`flex-1 transition-colors ${item.completed ? "text-slate-400 line-through dark:text-slate-500" : "font-medium text-slate-700 dark:text-slate-200"}`}
                                    >
                                        {item.text}
                                    </span>
                                    {item.assignedTo && (() => {
                                        const assignedMember = members.find(
                                            (m) => String(m.user._id || m.user) === String(item.assignedTo)
                                        );
                                        const name = assignedMember?.user?.name;
                                        return name ? (
                                            <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-semibold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                                <Avatar name={name} className="h-4 w-4 text-[7px]" />
                                                {name}
                                            </span>
                                        ) : null;
                                    })()}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}

            <div className="mt-1 flex items-center justify-between gap-2 border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                    <Avatar
                        name={task.assignedTo?.name || "Unassigned"}
                        className="h-8 w-8 text-[10px] ring-2 ring-white shadow-sm dark:ring-slate-800"
                    />
                    <div className="leading-tight">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                            {task.assignedTo?.name || "Unassigned"}
                        </p>
                        {task.assignedTo?.email && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                {task.assignedTo.email}
                            </p>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    {task.startDate && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            Started {formatDate(task.startDate)}
                        </p>
                    )}
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
                <div className="mt-3 flex justify-end gap-2 border-t border-slate-100/60 pt-2 dark:border-slate-700/60">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-500/10"
                        onClick={(event) => {
                            event.stopPropagation();
                            if (typeof onArchive === "function") {
                                onArchive(task);
                            }
                        }}
                    >
                        Archive
                    </Button>
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
                        Delete Forever
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
