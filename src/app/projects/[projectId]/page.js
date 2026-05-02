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
import { toast } from "react-hot-toast";

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

        const onTaskChange = (payload) => {
            queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });

            if (payload?.task && payload.task.status === "done") {
                const userId = String(user?._id || user?.id);
                const isCurrentUserAdmin = projectData?.project?.members?.some(
                    (member) => String(member.user?._id || member.user) === userId && member.role === "admin"
                ) || String(projectData?.project?.owner?._id || projectData?.project?.owner) === userId;
                
                // If the user receiving the event is an admin, notify them.
                if (isCurrentUserAdmin) {
                     toast.success(`Task completed: ${payload.task.title}`, {
                         duration: 4000,
                         icon: '🎉',
                     });
                }
            }
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
            String(member.user?._id || member.user) === String(user?._id || user?.id),
    )?.role;
    const canDeleteTasks = currentMemberRole === "admin";
    const isAdminOrOwner = currentMemberRole === "admin" ||
        String(project?.owner?._id || project?.owner) === String(user?._id || user?.id);

    const canDeleteTask = (task) => {
        if (!user || !project) return false;

        const userId = String(user._id || user.id);
        const isAdmin = project.members?.some(
            (member) => String(member.user?._id || member.user) === userId && member.role === "admin"
        );
        const isOwner = String(project.owner?._id || project.owner) === userId;

        const completedChecklistCount = Array.isArray(task.checklist) ? task.checklist.filter(i => i.completed).length : 0;
        const totalChecklist = Array.isArray(task.checklist) ? task.checklist.length : 0;
        
        let isTaskComplete = false;
        if (totalChecklist > 0) {
             isTaskComplete = (completedChecklistCount === totalChecklist) && task.status === "done";
        } else {
             isTaskComplete = task.status === "done" && Boolean(task.checkbox);
        }

        if (isTaskComplete) {
            return isAdmin || isOwner;
        }

        return false;
    };

    const canEditChecklist = (task) => {
        if (!user || !project) return false;

        const userId = String(user._id || user.id);

        const isAdmin = project.members?.some(
            (member) => String(member.user?._id || member.user) === userId && member.role === "admin"
        );
        if (isAdmin) return true;

        if (String(project.owner?._id || project.owner) === userId) return true;

        if (String(task.createdBy?._id || task.createdBy) === userId) return true;

        if (String(task.assignedTo?._id || task.assignedTo) === userId) return true;

        return false;
    };

    const canAssignTask = (task) => {
        if (!user || !project) return false;

        const userId = String(user._id || user.id);

        const isAdmin = project.members?.some(
            (member) => String(member.user?._id || member.user) === userId && member.role === "admin"
        );
        if (isAdmin) return true;

        if (String(project.owner?._id || project.owner) === userId) return true;

        if (String(task.createdBy?._id || task.createdBy) === userId) return true;

        return false;
    };

    return (
        <AuthGuard>
            <AppShell>
                {projectLoading || tasksLoading ? (
                    <p className="text-sm text-slate-600">Loading project...</p>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/60">
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
                            key={projectId}
                            tasks={tasksData?.tasks || []}
                            projectId={projectId}
                            members={project.members || []}
                            canDeleteTask={canDeleteTask}
                            canEditChecklist={canEditChecklist}
                            canAssignTask={canAssignTask}
                        />

                        <TaskFormModal
                            open={showTaskModal}
                            onClose={() => setShowTaskModal(false)}
                            projectId={projectId}
                            members={project.members}
                            canAssign={isAdminOrOwner}
                        />
                    </div>
                )}
            </AppShell>
        </AuthGuard>
    );
}
