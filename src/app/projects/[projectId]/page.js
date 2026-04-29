"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import KanbanBoard from "@/components/kanban/KanbanBoard";
import TaskFormModal from "@/components/kanban/TaskFormModal";
import ProjectMembers from "@/components/kanban/ProjectMembers";
import { projectService } from "@/services/projectService";
import { taskService } from "@/services/taskService";
import { useSocket } from "@/hooks/useSocket";
import { useAuthStore } from "@/store/authStore";

export default function ProjectPage() {
    const params = useParams();
    const projectId = params.projectId;
    const queryClient = useQueryClient();
    const socket = useSocket(projectId);
    const user = useAuthStore((state) => state.user);
    const [showTaskModal, setShowTaskModal] = useState(false);

    const { data: projectData, isLoading: projectLoading } = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => projectService.get(projectId),
        enabled: Boolean(projectId),
    });

    const { data: tasksData, isLoading: tasksLoading } = useQuery({
        queryKey: ["tasks", projectId],
        queryFn: () => taskService.listByProject(projectId),
        enabled: Boolean(projectId),
    });

    useEffect(() => {
        if (!socket) {
            return undefined;
        }

        const onTaskChange = () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        };

        socket.on("task:created", onTaskChange);
        socket.on("task:updated", onTaskChange);
        socket.on("task:deleted", onTaskChange);
        socket.on("project:member-updated", () =>
            queryClient.invalidateQueries({ queryKey: ["project", projectId] }),
        );

        return () => {
            socket.off("task:created", onTaskChange);
            socket.off("task:updated", onTaskChange);
            socket.off("task:deleted", onTaskChange);
            socket.off("project:member-updated");
        };
    }, [socket, queryClient, projectId]);

    const project = projectData?.project;
    const currentMemberRole = project?.members?.find(
        (member) =>
            String(member.user?._id || member.user) === String(user?._id),
    )?.role;
    const canDeleteTasks = currentMemberRole === "admin";

    return (
        <AuthGuard>
            <AppShell>
                {projectLoading || tasksLoading ? (
                    <p className="text-sm text-slate-600">Loading project...</p>
                ) : (
                    <div className="space-y-6">
                        <div className="panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight">
                                    {project.name}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {project.description ||
                                        "No project description"}
                                </p>
                            </div>
                            <Button onClick={() => setShowTaskModal(true)}>
                                New task
                            </Button>
                        </div>

                        <ProjectMembers project={project} />

                        <KanbanBoard
                            key={
                                tasksData?.tasks
                                    ?.map(
                                        (task) =>
                                            `${task._id}:${task.status}:${task.updatedAt}`,
                                    )
                                    .join("|") || projectId
                            }
                            tasks={tasksData?.tasks || []}
                            projectId={projectId}
                            canDeleteTasks={canDeleteTasks}
                        />

                        <TaskFormModal
                            open={showTaskModal}
                            onClose={() => setShowTaskModal(false)}
                            projectId={projectId}
                            members={project.members}
                        />
                    </div>
                )}
            </AppShell>
        </AuthGuard>
    );
}
