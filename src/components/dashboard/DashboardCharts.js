"use client";

import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";

const COLORS = ["#0f172a", "#2563eb", "#16a34a", "#d97706", "#dc2626"];

function normalizeList(data, key) {
    return (data || []).map((item) => ({
        label: (item[key] || "unknown").replace("_", " "),
        count: item.count || 0,
    }));
}

function formatDeadlineDate(date) {
    if (!date) return "";

    return new Date(date).toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

function buildDeadlineSeries(tasks) {
    const buckets = new Map();

    (tasks || []).forEach((task) => {
        const dueDate = new Date(task.dueDate);

        if (Number.isNaN(dueDate.getTime())) return;

        const key = `${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDate()}`;
        const label = dueDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
        });

        const current = buckets.get(key) || {
            label,
            fullLabel: formatDeadlineDate(task.dueDate),
            count: 0,
            sortKey: dueDate.getTime(),
        };

        current.count += 1;
        buckets.set(key, current);
    });

    return Array.from(buckets.values()).sort(
        (left, right) => left.sortKey - right.sortKey,
    );
}

export default function DashboardCharts({
    statusData = [],
    priorityData = [],
    dueSoonTasks = [],
}) {
    const normalizedStatus = normalizeList(statusData, "status");
    const normalizedPriority = normalizeList(priorityData, "priority");
    const deadlineSeries = buildDeadlineSeries(dueSoonTasks);

    return (
        <div className="grid gap-4 xl:grid-cols-2">
            <Card
                className="panel animate-fade-up rounded-2xl p-5"
                style={{ animationDelay: "40ms" }}
            >
                <div className="mb-4 flex items-center justify-between text-slate-900 dark:text-slate-500  ">
                    <CardTitle>Tasks by status</CardTitle>
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-900 dark:text-slate-500">
                        board distribution
                    </span>
                </div>
                <div
                    className="h-72 rounded-2xl bg-white/80 p-2 dark:bg-slate-950/60"
                    style={{ minWidth: 0, minHeight: 0 }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            minWidth: 0,
                            minHeight: 0,
                        }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={normalizedStatus}
                                    dataKey="count"
                                    nameKey="label"
                                    innerRadius={55}
                                    outerRadius={95}
                                    paddingAngle={3}
                                    animationDuration={850}
                                >
                                    {normalizedStatus.map((entry, index) => (
                                        <Cell
                                            key={entry.label}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${value} tasks`,
                                        String(name),
                                    ]}
                                    contentStyle={{
                                        background: "rgba(15, 23, 42, 0.95)",
                                        border: "none",
                                        borderRadius: "14px",
                                        color: "white",
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            <Card
                className="panel animate-fade-up rounded-2xl p-5"
                style={{ animationDelay: "120ms" }}
            >
                <div className="mb-4 flex items-center justify-between">
                    <CardTitle>Tasks by priority</CardTitle>
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        urgency mix
                    </span>
                </div>
                <div
                    className="h-72 rounded-2xl bg-white/80 p-2 dark:bg-slate-950/60"
                    style={{ minWidth: 0, minHeight: 0 }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            minWidth: 0,
                            minHeight: 0,
                        }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={normalizedPriority}>
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="#e2e8f0"
                                />
                                <XAxis
                                    dataKey="label"
                                    tick={{ fill: "#64748b" }}
                                />
                                <YAxis tick={{ fill: "#64748b" }} />
                                <Tooltip
                                    formatter={(value, name) => [
                                        `${value} tasks`,
                                        String(name),
                                    ]}
                                    contentStyle={{
                                        background: "rgba(15, 23, 42, 0.95)",
                                        border: "none",
                                        borderRadius: "14px",
                                        color: "white",
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="#1d4ed8"
                                    radius={[6, 6, 0, 0]}
                                    animationDuration={850}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            <Card
                className="panel animate-fade-up rounded-2xl p-5 xl:col-span-2"
                style={{ animationDelay: "200ms" }}
            >
                <div className="mb-4 flex items-center justify-between">
                    <CardTitle>Deadlines by date</CardTitle>
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        next 7 days
                    </span>
                </div>
                <div
                    className="h-80 rounded-2xl bg-white/80 p-2 dark:bg-slate-950/60"
                    style={{ minWidth: 0, minHeight: 0 }}
                >
                    <div
                        style={{
                            width: "100%",
                            height: "100%",
                            minWidth: 0,
                            minHeight: 0,
                        }}
                    >
                        {deadlineSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deadlineSeries}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="#e2e8f0"
                                    />
                                    <XAxis
                                        dataKey="label"
                                        tick={{ fill: "#64748b" }}
                                    />
                                    <YAxis tick={{ fill: "#64748b" }} />
                                    <Tooltip
                                        labelFormatter={(label, payload) => {
                                            return (
                                                payload?.[0]?.payload
                                                    ?.fullLabel || label
                                            );
                                        }}
                                        formatter={(value) => [
                                            `${value} task${value === 1 ? "" : "s"}`,
                                            "Due items",
                                        ]}
                                        contentStyle={{
                                            background:
                                                "rgba(15, 23, 42, 0.95)",
                                            border: "none",
                                            borderRadius: "14px",
                                            color: "white",
                                        }}
                                    />
                                    <Bar
                                        dataKey="count"
                                        fill="#14b8a6"
                                        radius={[6, 6, 0, 0]}
                                        animationDuration={900}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                                No upcoming deadlines to chart.
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
