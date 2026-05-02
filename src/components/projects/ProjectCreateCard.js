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
        <Card className="rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md lg:sticky lg:top-24 dark:border-slate-800/50 dark:bg-slate-900/60">
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
                    className="rounded-xl border-slate-200/60 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
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
                    className="min-h-24 rounded-xl border-slate-200/60 bg-white/80 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                    onChange={(event) =>
                        setForm((prev) => ({
                            ...prev,
                            description: event.target.value,
                        }))
                    }
                />
                <Button
                    className="w-full rounded-xl py-5 shadow-md transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/20 active:translate-y-0"
                    type="submit"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Creating..." : "Create project"}
                </Button>
            </form>
        </Card>
    );
}
