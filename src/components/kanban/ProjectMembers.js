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
        <div className="panel rounded-2xl p-4">
            <h3 className="mb-3 text-base font-semibold">Members</h3>
            <div className="mb-4 flex flex-col gap-2 md:flex-row">
                <Input
                    placeholder="Add member by email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <Select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="max-w-32"
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
                >
                    Add
                </Button>
            </div>
            <div className="space-y-2">
                {project.members.map((member) => (
                    <div
                        key={member.user._id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 p-3"
                    >
                        <div className="flex items-center gap-2">
                            <Avatar
                                name={member.user.name}
                                className="h-8 w-8"
                            />
                            <div>
                                <p className="text-sm font-medium">
                                    {member.user.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {member.user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="slate">{member.role}</Badge>
                            {member.role !== "admin" ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        removeMutation.mutate(member.user._id)
                                    }
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
