"use client";

import { useQuery } from "@tanstack/react-query";
import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { projectService } from "@/services/projectService";
import ProjectCreateCard from "@/components/projects/ProjectCreateCard";
import ProjectCard from "@/components/projects/ProjectCard";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function ProjectsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["projects"],
        queryFn: projectService.list,
    });

    return (
        <AuthGuard>
            <AppShell>
                <div className="space-y-6">
                    <Card className="rounded-3xl border border-slate-200/50 bg-white/60 p-6 shadow-sm backdrop-blur-md md:p-8 dark:border-slate-800/50 dark:bg-slate-900/60">
                        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                            <div>
                                <span className="inline-flex rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                                    Projects hub
                                </span>
                                <CardTitle className="mt-4 text-3xl tracking-tight md:text-4xl">
                                    Organize work by project, not by chaos.
                                </CardTitle>
                                <CardDescription className="mt-3 max-w-2xl text-base leading-7 text-slate-500 dark:text-slate-400">
                                    Keep every team space structured, visible,
                                    and easy to collaborate on.
                                </CardDescription>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-2xl border border-slate-200/50 bg-white/80 p-5 text-slate-900 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-white">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                        Active
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold">
                                        {data?.projects?.length || 0}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-indigo-600/90 p-5 text-white shadow-sm backdrop-blur-sm dark:bg-indigo-500/90">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                                        Members
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold">
                                        {data?.projects?.reduce(
                                            (sum, project) =>
                                                sum + project.members.length,
                                            0,
                                        ) || 0}
                                    </p>
                                </div>
                                <div className="rounded-2xl bg-emerald-500/90 p-5 text-white shadow-sm backdrop-blur-sm dark:bg-emerald-600/90">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                                        Ready
                                    </p>
                                    <p className="mt-2 text-2xl font-semibold">
                                        24/7
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
                        <ProjectCreateCard />

                        <div>
                            <div className="mb-4 flex items-end justify-between gap-3">
                                <div>
                                    <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
                                        Your projects
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Pick a workspace to jump back into the
                                        board.
                                    </p>
                                </div>
                            </div>

                            {isLoading ? (
                                <p className="text-sm text-slate-600">
                                    Loading projects...
                                </p>
                            ) : null}

                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                                {(data?.projects || []).map((project) => (
                                    <ProjectCard
                                        key={project._id}
                                        project={project}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </AppShell>
        </AuthGuard>
    );
}
