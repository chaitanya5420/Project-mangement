"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { taskService } from "@/services/taskService";
import { TASK_PRIORITY, TASK_STATUS } from "@/lib/constants";

const createChecklistItem = (overrides = {}) => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text: "",
    completed: false,
    ...overrides,
});

const normalizeChecklistItems = (items) =>
    items
        .map((item) => ({
            id: item.id,
            text: item.text.trim(),
            completed: Boolean(item.completed),
        }))
        .filter((item) => item.text);

export default function TaskFormModal({ open, onClose, projectId, members, canAssign = false }) {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        startDate: "",
        dueDate: "",
        assignedTo: "",
        checklistItems: [createChecklistItem()],
    });

    const resetForm = () => {
        setForm({
            title: "",
            description: "",
            status: "todo",
            priority: "medium",
            startDate: "",
            dueDate: "",
            assignedTo: "",
            checklistItems: [createChecklistItem()],
        });
    };

    const mutation = useMutation({
        mutationFn: (payload) => taskService.create(projectId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            onClose();
            resetForm();
        },
    });

    const onSubmit = (event) => {
        event.preventDefault();

        const checklist = normalizeChecklistItems(form.checklistItems);

        mutation.mutate({
            title: form.title,
            description: form.description,
            status: form.status,
            priority: form.priority,
            assignedTo: form.assignedTo || null,
            startDate: form.startDate || null,
            dueDate: form.dueDate || null,
            checklist: checklist,
            checkbox:
                checklist.length > 0 &&
                checklist.every((item) => item.completed),
            checkboxLabel: checklist[0]?.text || "",
        });
    };

    const formatDateForInput = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    // const fillSample = () => {
    //     const today = new Date();
    //     const inThree = new Date(today);
    //     inThree.setDate(today.getDate() + 3);

    //     setForm((prev) => ({
    //         ...prev,
    //         title: "Sample: Design landing page",
    //         description:
    //             "Create a modern landing page for the project with hero, features, and CTA.",
    //         status: "todo",
    //         priority: "high",
    //         dueDate: formatDateForInput(inThree),
    //         assignedTo:
    //             members && members.length > 0 ? members[0].user._id : "",
    //         checklistItems: [
    //             createChecklistItem({ text: "Review project checklist" }),
    //             createChecklistItem({ text: "Confirm hero copy" }),
    //         ],
    //     }));
    // };

    const updateChecklistItem = (itemId, updates) => {
        setForm((prev) => ({
            ...prev,
            checklistItems: prev.checklistItems.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item,
            ),
        }));
    };

    const addChecklistItem = () => {
        setForm((prev) => ({
            ...prev,
            checklistItems: [...prev.checklistItems, createChecklistItem()],
        }));
    };

    const removeChecklistItem = (itemId) => {
        setForm((prev) => {
            const nextItems = prev.checklistItems.filter(
                (item) => item.id !== itemId,
            );

            return {
                ...prev,
                checklistItems:
                    nextItems.length > 0 ? nextItems : [createChecklistItem()],
            };
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Create task">
            <form className="space-y-3" onSubmit={onSubmit}>
                <Input
                    placeholder="Title"
                    value={form.title}
                    className="rounded-xl border-slate-200/60 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                    onChange={(event) =>
                        setForm((prev) => ({
                            ...prev,
                            title: event.target.value,
                        }))
                    }
                    required
                />
                <Textarea
                    placeholder="Description"
                    value={form.description}
                    className="min-h-24 rounded-xl border-slate-200/60 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                    onChange={(event) =>
                        setForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                        }))
                    }
                />
                <div className="space-y-3 rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 shadow-sm backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/30">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                Checklist
                            </p>
                            <p className="text-xs text-slate-500">
                                Add more checkbox items and mark them complete.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-slate-600"
                            onClick={addChecklistItem}
                        >
                            Add item
                        </Button>
                    </div>

                    <div className="space-y-2">
                        {form.checklistItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 rounded-xl border border-slate-200/60 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-700/60 dark:bg-slate-800/80"
                            >
                                <input
                                    type="checkbox"
                                    checked={Boolean(item.completed)}
                                    onChange={(event) =>
                                        updateChecklistItem(item.id, {
                                            completed: event.target.checked,
                                        })
                                    }
                                    className="mt-2 h-4 w-4 rounded border-slate-300 accent-emerald-600 focus:ring-emerald-500"
                                />
                                <Input
                                    placeholder={`Checklist item ${index + 1}`}
                                    value={item.text}
                                    onChange={(event) =>
                                        updateChecklistItem(item.id, {
                                            text: event.target.value,
                                        })
                                    }
                                    className="flex-1 rounded-lg border-slate-200/60 bg-transparent text-sm focus:border-indigo-500 focus:ring-0 dark:border-slate-700/60"
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="mt-0.5 text-slate-500"
                                    onClick={() => removeChecklistItem(item.id)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Select
                        value={form.status}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                status: event.target.value,
                            }))
                        }
                        className="rounded-xl border-slate-200/60 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                    >
                        {TASK_STATUS.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </Select>
                    <Select
                        value={form.priority}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                priority: event.target.value,
                            }))
                        }
                        className="rounded-xl border-slate-200/60 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                    >
                        {TASK_PRIORITY.map((priority) => (
                            <option key={priority.value} value={priority.value}>
                                {priority.label}
                            </option>
                        ))}
                    </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Start Date</label>
                        <Input
                            type="date"
                            value={form.startDate}
                            className="rounded-xl border-slate-200/60 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    startDate: event.target.value,
                                }))
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Due Date</label>
                        <Input
                            type="date"
                            value={form.dueDate}
                            className="rounded-xl border-slate-200/60 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    dueDate: event.target.value,
                                }))
                            }
                        />
                    </div>
                </div>
                {canAssign && (
                <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Assign To</label>
                    <Select
                        value={form.assignedTo}
                        onChange={(event) =>
                            setForm((prev) => ({
                                ...prev,
                                assignedTo: event.target.value,
                            }))
                        }
                        className="rounded-xl border-slate-200/60 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                    >
                        <option value="">Unassigned</option>
                        {members.map((member) => (
                            <option key={member.user._id} value={member.user._id}>
                                {member.user.name}
                            </option>
                        ))}
                    </Select>
                </div>
                )}
                <div className="mt-4 flex justify-end gap-2 pt-2">
                    {/* <Button
                        type="button"
                        className="w-full"
                        onClick={fillSample}
                        disabled={mutation.isPending}
                    >
                        Fill sample
                    </Button> */}
                    <Button
                        className="w-full rounded-xl py-5 shadow-md transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/20 active:translate-y-0"
                        type="submit"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? "Creating..." : "Create task"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
