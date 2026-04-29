"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectService } from "@/services/projectService";

export default function ProjectCreateCard() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: "", description: "" });

    const mutation = useMutation({
        mutationFn: projectService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            setForm({ name: "", description: "" });
        },
    });

    const onSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(form);
    };

    return (
        <Card className="panel rounded-3xl p-5 lg:sticky lg:top-24">
            <div className="mb-5">
                <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                    New workspace
                </span>
                <CardTitle className="mt-3 text-2xl tracking-tight">
                    Create project
                </CardTitle>
                <CardDescription className="mt-2 leading-6 text-slate-500 dark:text-slate-400">
                    Start a new collaboration space for your team.
                </CardDescription>
            </div>

            <form className="space-y-4" onSubmit={onSubmit}>
                <Input
                    placeholder="Project name"
                    value={form.name}
                    onChange={(event) =>
                        setForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                        }))
                    }
                    required
                />
                <Textarea
                    placeholder="Describe the project goal"
                    value={form.description}
                    onChange={(event) =>
                        setForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                        }))
                    }
                />
                <Button
                    className="w-full"
                    type="submit"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Creating..." : "Create project"}
                </Button>
            </form>
        </Card>
    );
}
