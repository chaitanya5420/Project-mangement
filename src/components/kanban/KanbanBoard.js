"use client";

import { useMemo, useRef, useState } from "react";
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
    canDeleteTask,
    onDelete,
    onToggleCheckbox,
    onUpdateChecklist,
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
                listeners={listeners}
                attributes={attributes}
                isDragging={isDragging}
                canDelete={canDeleteTask(task)}
                onDelete={onDelete}
                onToggleChecklistItem={onToggleCheckbox}
                onUpdateChecklist={onUpdateChecklist}
            />
        </div>
    );
}

function KanbanColumn({
    id,
    label,
    tasks,
    canDeleteTask,
    onDelete,
    onToggleCheckbox,
    onUpdateChecklist,
}) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="panel min-h-105 rounded-2xl p-3">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                    {label}
                </h3>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
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
                            canDeleteTask={canDeleteTask}
                            onDelete={onDelete}
                            onToggleCheckbox={onToggleCheckbox}
                            onUpdateChecklist={onUpdateChecklist}
                        />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

function buildTaskMap(items) {
    return TASK_STATUS.reduce((accumulator, column) => {
        accumulator[column.value] = items
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
    canDeleteTask = () => false,
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

    const handleDelete = (task) => {
        if (!canDeleteTask(task)) {
            return;
        }

        const confirmed = window.confirm(
            `Delete task "${task.title}"?`,
        );

        if (!confirmed) {
            return;
        }

        deleteMutation.mutate(task._id);
    };

    const handleToggleCheckbox = (task) => {
        mutation.mutate({
            taskId: task._id,
            updates: {
                checkbox: !Boolean(task.checkbox),
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

        mutation.mutate({
            taskId: task._id,
            updates: {
                checklist: nextChecklist,
                checkbox:
                    nextChecklist.length > 0 &&
                    nextChecklist.every((item) => item.completed),
                checkboxLabel: nextChecklist[0]?.text || "",
            },
        });
    };

    const handleUpdateChecklist = (task, nextChecklist) => {
        mutation.mutate({
            taskId: task._id,
            updates: {
                checklist: nextChecklist,
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
                        canDeleteTask={canDeleteTask}
                        onDelete={handleDelete}
                        onToggleCheckbox={handleToggleChecklistItem}
                        onUpdateChecklist={handleUpdateChecklist}
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
