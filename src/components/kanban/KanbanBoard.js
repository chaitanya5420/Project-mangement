"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    closestCorners,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { KeyboardSensor } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { taskService } from "@/services/taskService";
import { TASK_STATUS } from "@/lib/constants";
import TaskCard from "@/components/kanban/TaskCard";

function SortableTask({
    task,
    members,
    canDeleteTask,
    canEditChecklist,
    canAssignTask,
    onDelete,
    onToggleCheckbox,
    onUpdateChecklist,
    onUpdateTask,
    onArchive,
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task._id });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            <TaskCard
                task={task}
                members={members}
                listeners={listeners}
                attributes={attributes}
                isDragging={isDragging}
                canDelete={canDeleteTask(task)}
                canEditChecklist={canEditChecklist(task)}
                canAssignTask={canAssignTask(task)}
                onDelete={onDelete}
                onToggleChecklistItem={onToggleCheckbox}
                onUpdateChecklist={onUpdateChecklist}
                onUpdateTask={onUpdateTask}
                onArchive={onArchive}
            />
        </div>
    );
}

function KanbanColumn({
    id,
    label,
    tasks,
    members,
    canDeleteTask,
    canEditChecklist,
    canAssignTask,
    onDelete,
    onToggleCheckbox,
    onUpdateChecklist,
    onUpdateTask,
    onArchive,
}) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex min-h-[500px] flex-col rounded-3xl border border-slate-200/50 bg-slate-100/50 p-3 shadow-inner backdrop-blur-sm transition-colors duration-300 dark:border-slate-800/50 dark:bg-slate-800/30">
            <div className="mb-4 flex items-center justify-between px-2">
                <h3 className="text-sm font-bold tracking-tight text-slate-800 dark:text-slate-100">
                    {label}
                </h3>
                <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-white px-2 text-[11px] font-semibold text-slate-600 shadow-sm dark:bg-slate-700 dark:text-slate-300">
                    {tasks.length}
                </span>
            </div>
            <SortableContext
                items={tasks.map((task) => task._id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <SortableTask
                            key={task._id}
                            task={task}
                            members={members}
                            canDeleteTask={canDeleteTask}
                            canEditChecklist={canEditChecklist}
                            canAssignTask={canAssignTask}
                            onDelete={onDelete}
                            onToggleCheckbox={onToggleCheckbox}
                            onUpdateChecklist={onUpdateChecklist}
                            onUpdateTask={onUpdateTask}
                            onArchive={onArchive}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

function buildTaskMap(items) {
    // Filter out archived tasks so they never appear on the board
    const activeTasks = items.filter((task) => task.status !== "archived");

    return TASK_STATUS.reduce((accumulator, column) => {
        accumulator[column.value] = activeTasks
            .filter((task) => task.status === column.value)
            .slice()
            .sort((first, second) => {
                const firstDate = new Date(
                    first.updatedAt || first.createdAt,
                ).getTime();
                const secondDate = new Date(
                    second.updatedAt || second.createdAt,
                ).getTime();
                return secondDate - firstDate;
            });
        return accumulator;
    }, {});
}

export default function KanbanBoard({
    tasks,
    projectId,
    members = [],
    canDeleteTask = () => false,
    canEditChecklist = () => false,
    canAssignTask = () => false,
}) {
    const queryClient = useQueryClient();
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const [taskGroups, setTaskGroups] = useState(() => buildTaskMap(tasks));
    
    useEffect(() => {
        setTaskGroups(buildTaskMap(tasks));
    }, [tasks]);

    const [activeTaskId, setActiveTaskId] = useState(null);
    const dragOriginRef = useRef(null);

    const orderedTasks = useMemo(
        () => TASK_STATUS.flatMap((column) => taskGroups[column.value] || []),
        [taskGroups],
    );

    const activeTask = useMemo(
        () => orderedTasks.find((task) => task._id === activeTaskId) || null,
        [orderedTasks, activeTaskId],
    );

    const mutation = useMutation({
        mutationFn: ({ taskId, updates }) =>
            taskService.update(taskId, updates),
        onSuccess: (data) => {
            const updatedTask = data?.task;
            if (updatedTask) {
                setTaskGroups((current) => {
                    const next = TASK_STATUS.reduce((accumulator, column) => {
                        accumulator[column.value] = (
                            current[column.value] || []
                        ).filter((task) => task._id !== updatedTask._id);
                        return accumulator;
                    }, {});

                    next[updatedTask.status] = [
                        updatedTask,
                        ...(next[updatedTask.status] || []),
                    ];

                    return next;
                });
            }

            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (taskId) => taskService.remove(taskId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });

    const getTaskLocation = (taskId) => {
        for (const column of TASK_STATUS) {
            const index = (taskGroups[column.value] || []).findIndex(
                (task) => task._id === taskId,
            );

            if (index !== -1) {
                return { columnId: column.value, index };
            }
        }

        return null;
    };

    const onDragStart = ({ active }) => {
        setActiveTaskId(active.id);
        dragOriginRef.current = getTaskLocation(active.id);
    };

    const onDragOver = () => {};

    const onDragEnd = ({ active, over }) => {
        if (!over) {
            setActiveTaskId(null);
            dragOriginRef.current = null;
            return;
        }

        const sourceLocation =
            dragOriginRef.current || getTaskLocation(active.id);
        if (!sourceLocation) {
            setActiveTaskId(null);
            dragOriginRef.current = null;
            return;
        }

        const overIsColumn = TASK_STATUS.some(
            (column) => column.value === over.id,
        );
        const overLocation = overIsColumn ? null : getTaskLocation(over.id);
        const targetColumnId = overIsColumn ? over.id : overLocation?.columnId;

        if (!targetColumnId) {
            setActiveTaskId(null);
            dragOriginRef.current = null;
            return;
        }

        if (sourceLocation.columnId !== targetColumnId) {
            mutation.mutate({
                taskId: active.id,
                updates: { status: targetColumnId },
            });
        }

        setActiveTaskId(null);
        dragOriginRef.current = null;
    };

    const handleUpdateTask = (taskId, updates) => {
        mutation.mutate({ taskId, updates });
    };

    const handleDelete = (task) => {
        if (!canDeleteTask(task)) {
            return;
        }

        const confirmed = window.confirm(
            `Permanently delete task "${task.title}" from the database? This cannot be undone.`,
        );

        if (!confirmed) {
            return;
        }

        deleteMutation.mutate(task._id);
    };

    const handleArchive = (task) => {
        if (!canDeleteTask(task)) {
            return;
        }

        const confirmed = window.confirm(
            `Archive task "${task.title}"? It will be removed from the board but kept in the database.`,
        );

        if (!confirmed) {
            return;
        }

        mutation.mutate({
            taskId: task._id,
            updates: { status: "archived" },
        });
    };

    const handleToggleCheckbox = (task) => {
        const nextCheckbox = !Boolean(task.checkbox);
        mutation.mutate({
            taskId: task._id,
            updates: {
                checkbox: nextCheckbox,
                status: nextCheckbox ? "done" : "todo",
            },
        });
    };

    const getTaskChecklist = (task) => {
        if (Array.isArray(task.checklist) && task.checklist.length > 0) {
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
    };

    const handleToggleChecklistItem = (task, itemId) => {
        const checklist = getTaskChecklist(task);
        if (!checklist.length) {
            return;
        }

        const nextChecklist = checklist.map((item) =>
            item.id === itemId
                ? { ...item, completed: !Boolean(item.completed) }
                : item,
        );

        const completedCount = nextChecklist.filter((item) => item.completed).length;
        let nextStatus = task.status;
        if (nextChecklist.length > 0) {
            if (completedCount === 0) {
                nextStatus = "todo";
            } else if (completedCount === nextChecklist.length) {
                nextStatus = "done";
            } else {
                nextStatus = "in_progress";
            }
        }

        mutation.mutate({
            taskId: task._id,
            updates: {
                checklist: nextChecklist,
                status: nextStatus,
                checkbox:
                    nextChecklist.length > 0 &&
                    nextChecklist.every((item) => item.completed),
                checkboxLabel: nextChecklist[0]?.text || "",
            },
        });
    };

    const handleUpdateChecklist = (task, nextChecklist) => {
        const completedCount = nextChecklist.filter((item) => item.completed).length;
        let nextStatus = task.status;
        if (nextChecklist.length > 0) {
            if (completedCount === 0) {
                nextStatus = "todo";
            } else if (completedCount === nextChecklist.length) {
                nextStatus = "done";
            } else {
                nextStatus = "in_progress";
            }
        }

        mutation.mutate({
            taskId: task._id,
            updates: {
                checklist: nextChecklist,
                status: nextStatus,
                checkbox:
                    nextChecklist.length > 0 &&
                    nextChecklist.every((item) => item.completed),
                checkboxLabel: nextChecklist[0]?.text || "",
            },
        });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            onDragCancel={() => setActiveTaskId(null)}
        >
            <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-3">
                {TASK_STATUS.map((column) => (
                    <KanbanColumn
                        key={column.value}
                        id={column.value}
                        label={column.label}
                        tasks={taskGroups[column.value] || []}
                        members={members}
                        canDeleteTask={canDeleteTask}
                        canEditChecklist={canEditChecklist}
                        canAssignTask={canAssignTask}
                        onDelete={handleDelete}
                        onToggleCheckbox={handleToggleChecklistItem}
                        onUpdateChecklist={handleUpdateChecklist}
                        onUpdateTask={handleUpdateTask}
                        onArchive={handleArchive}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeTask ? (
                    <div className="w-[320px] rotate-3 shadow-2xl">
                        <TaskCard task={activeTask} isDragging />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
