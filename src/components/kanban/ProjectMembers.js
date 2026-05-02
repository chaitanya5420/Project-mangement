"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { projectService } from "@/services/projectService";
import { PROJECT_ROLES } from "@/lib/constants";

export default function ProjectMembers({ project }) {
    const queryClient = useQueryClient();
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");

    const addMutation = useMutation({
        mutationFn: (payload) => projectService.addMember(project._id, payload),
        onSuccess: () => {
            setEmail("");
            queryClient.invalidateQueries({
                queryKey: ["project", project._id],
            });
        },
    });

    const removeMutation = useMutation({
        mutationFn: (memberId) =>
            projectService.removeMember(project._id, memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["project", project._id],
            });
        },
    });

    return (
        <div className="panel rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/60">
            <h3 className="mb-4 text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100">Project Members</h3>
            <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
                <Input
                    placeholder="Add member by email..."
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="flex-1 rounded-xl bg-white/80 dark:bg-slate-950/80"
                />
                <Select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="w-full rounded-xl bg-white/80 md:max-w-40 dark:bg-slate-950/80"
                >
                    {PROJECT_ROLES.map((item) => (
                        <option key={item.value} value={item.value}>
                            {item.label}
                        </option>
                    ))}
                </Select>
                <Button
                    onClick={() => addMutation.mutate({ email, role })}
                    disabled={addMutation.isPending || !email}
                    className="rounded-xl px-6"
                >
                    Add Member
                </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {project.members.map((member) => (
                    <div
                        key={member.user._id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800/80"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <Avatar
                                name={member.user.name}
                                className="h-10 w-10 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {member.user.name}
                                </p>
                                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                    {member.user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                            <Badge variant="slate" className="px-2 py-0.5 text-[10px]">
                                {member.role}
                            </Badge>
                            {member.role !== "admin" ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                        removeMutation.mutate(member.user._id)
                                    }
                                    className="h-6 px-2 text-[10px] text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                >
                                    Remove
                                </Button>
                            ) : null}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
