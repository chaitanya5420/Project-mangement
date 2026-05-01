"use client";

import { useQuery } from "@tanstack/react-query";
import AuthGuard from "@/components/auth/AuthGuard";
import AppShell from "@/components/layout/AppShell";
import { Card, CardTitle } from "@/components/ui/card";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import DeadlineAlerts from "@/components/alerts/DeadlineAlerts";
import { dashboardService } from "@/services/dashboardService";
import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export default function DashboardPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["dashboard"],
        queryFn: dashboardService.get,
    });

    return (
        <AuthGuard>
            <AppShell>
                {isLoading ? (
                    <p className="text-sm text-slate-600">
                        Loading dashboard...
                    </p>
                ) : (
                    <div className="space-y-6">
                        <Card className="panel overflow-hidden rounded-3xl p-0">
                            <div className="grid gap-0 lg:grid-cols-[1.35fr_0.65fr]">
                                <div className="relative overflow-hidden p-6 md:p-8">
                                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 via-transparent to-sky-500/10" />
                                    <div className="relative space-y-4">
                                        <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                                            Overview
                                        </span>
                                        <CardTitle className="max-w-2xl text-3xl tracking-tight md:text-4xl">
                                            Workload overview, delivery health,
                                            and team progress in one place.
                                        </CardTitle>
                                        <p className="max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            Track how work moves through the
                                            board, understand what’s due soon,
                                            and spot risk early.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 border-t border-slate-200 p-6 md:grid-cols-3 lg:grid-cols-1 lg:border-l lg:border-t-0 dark:border-slate-800">
                                    <div className="rounded-2xl bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-white">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                            Projects
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold tracking-tight">
                                            {data?.projectsCount || 0}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-indigo-600 p-4 text-white dark:bg-indigo-500">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                                            Open tasks
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold tracking-tight">
                                            {(data?.tasksByStatus || []).reduce(
                                                (sum, item) => sum + item.count,
                                                0,
                                            )}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-emerald-500 p-4 text-white">
                                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/60">
                                            Due soon
                                        </p>
                                        <p className="mt-2 text-3xl font-semibold tracking-tight">
                                            {data?.dueSoonTasks?.length || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <DeadlineAlerts tasks={data?.dueSoonTasks || []} />

                        <section className="grid gap-4 md:grid-cols-3">
                            {(data?.tasksByStatus || []).map((item) => (
                                <Card
                                    key={item.status}
                                    className="panel rounded-2xl p-5"
                                >
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                        {item.status.replace("_", " ")}
                                    </p>
                                    <p className="mt-3 text-3xl font-bold tracking-tight">
                                        {item.count}
                                    </p>
                                </Card>
                            ))}
                        </section>

                        <DashboardCharts
                            statusData={data?.tasksByStatus || []}
                            priorityData={data?.tasksByPriority || []}
                            dueSoonTasks={data?.dueSoonTasks || []}
                        />

                        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                            <Card className="panel rounded-2xl p-5">
                                <div className="mb-4 flex items-center justify-between">
                                    <CardTitle>Due Soon</CardTitle>
                                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                        next 7 days
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    {(data?.dueSoonTasks || []).map((task) => (
                                        <div
                                            key={task._id}
                                            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-950/60"
                                        >
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-slate-50">
                                                    {task.title}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {task.project?.name}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Avatar
                                                    name={
                                                        task.assignedTo?.name ||
                                                        "Unassigned"
                                                    }
                                                    className="h-8 w-8"
                                                />
                                                <p className="text-sm font-medium text-slate-500 dark:text-slate-300">
                                                    {formatDate(task.dueDate)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {!data?.dueSoonTasks?.length ? (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            No upcoming deadlines.
                                        </p>
                                    ) : null}
                                </div>
                            </Card>

                            <Card className="panel rounded-2xl p-5">
                                <CardTitle className="mb-4">
                                    Quick status
                                </CardTitle>
                                <div className="space-y-4">
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                            Focus area
                                        </p>
                                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">
                                            Keep in-progress work moving.
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/70">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                            Collaboration
                                        </p>
                                        <p className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">
                                            Assign tasks and watch live updates.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}
            </AppShell>
        </AuthGuard>
    );
}
