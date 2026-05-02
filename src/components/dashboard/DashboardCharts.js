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
    AreaChart,
    Area,
} from "recharts";
import { Card, CardTitle } from "@/components/ui/card";

const STATUS_COLORS = {
    todo: "#6366f1",
    "in progress": "#3b82f6",
    done: "#10b981",
    archived: "#94a3b8",
};

const PRIORITY_COLORS = {
    low: "#06b6d4",
    medium: "#f59e0b",
    high: "#ef4444",
};

const PIE_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

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

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-2xl border border-white/20 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-md">
            {label && (
                <p className="mb-1 text-xs font-medium text-slate-400">
                    {label}
                </p>
            )}
            {payload.map((entry, index) => (
                <p key={index} className="text-sm font-semibold text-white">
                    <span
                        className="mr-2 inline-block h-2 w-2 rounded-full"
                        style={{ backgroundColor: entry.color || entry.fill }}
                    />
                    {entry.value} {entry.value === 1 ? "task" : "tasks"}
                </p>
            ))}
        </div>
    );
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor="middle"
            dominantBaseline="central"
            className="text-[11px] font-semibold"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
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
        <div className="grid gap-6 xl:grid-cols-2">
            {/* Tasks by Status — Donut Chart */}
            <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/60 p-0 shadow-sm backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/60">
                <div className="flex items-center justify-between border-b border-slate-200/50 px-6 py-5 dark:border-slate-800/50">
                    <div>
                        <CardTitle className="text-base">
                            Tasks by status
                        </CardTitle>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Board distribution
                        </p>
                    </div>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                        Live
                    </span>
                </div>
                <div className="px-6 pb-6 pt-4">
                    <div
                        className="h-64"
                        style={{ minWidth: 0, minHeight: 0 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={normalizedStatus}
                                    dataKey="count"
                                    nameKey="label"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    animationDuration={900}
                                    animationBegin={100}
                                    label={PieLabel}
                                    labelLine={false}
                                >
                                    {normalizedStatus.map((entry, index) => (
                                        <Cell
                                            key={entry.label}
                                            fill={
                                                STATUS_COLORS[entry.label] ||
                                                PIE_COLORS[
                                                    index % PIE_COLORS.length
                                                ]
                                            }
                                            stroke="transparent"
                                        />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Custom legend */}
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                        {normalizedStatus.map((entry, index) => (
                            <div
                                key={entry.label}
                                className="flex items-center gap-2"
                            >
                                <div
                                    className="h-3 w-3 rounded-full"
                                    style={{
                                        backgroundColor:
                                            STATUS_COLORS[entry.label] ||
                                            PIE_COLORS[
                                                index % PIE_COLORS.length
                                            ],
                                    }}
                                />
                                <span className="text-xs font-medium capitalize text-slate-600 dark:text-slate-400">
                                    {entry.label}
                                </span>
                                <span className="text-xs font-bold text-slate-900 dark:text-slate-200">
                                    {entry.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Tasks by Priority — Bar Chart */}
            <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/60 p-0 shadow-sm backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/60">
                <div className="flex items-center justify-between border-b border-slate-200/50 px-6 py-5 dark:border-slate-800/50">
                    <div>
                        <CardTitle className="text-base">
                            Tasks by priority
                        </CardTitle>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Urgency breakdown
                        </p>
                    </div>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                        Priority
                    </span>
                </div>
                <div className="px-6 pb-6 pt-4">
                    <div
                        className="h-64"
                        style={{ minWidth: 0, minHeight: 0 }}
                    >
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={normalizedPriority}
                                barCategoryGap="25%"
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="rgba(148, 163, 184, 0.15)"
                                    vertical={false}
                                />
                                <XAxis
                                    dataKey="label"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: "#94a3b8",
                                        fontSize: 12,
                                        fontWeight: 500,
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                                    allowDecimals={false}
                                />
                                <Tooltip
                                    content={<CustomTooltip />}
                                    cursor={{
                                        fill: "rgba(99, 102, 241, 0.06)",
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    radius={[10, 10, 4, 4]}
                                    animationDuration={900}
                                    animationBegin={200}
                                >
                                    {normalizedPriority.map((entry) => (
                                        <Cell
                                            key={entry.label}
                                            fill={
                                                PRIORITY_COLORS[entry.label] ||
                                                "#6366f1"
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </Card>

            {/* Deadlines by Date — Area Chart (full width) */}
            <Card className="overflow-hidden rounded-3xl border border-slate-200/50 bg-white/60 p-0 shadow-sm backdrop-blur-md xl:col-span-2 dark:border-slate-800/50 dark:bg-slate-900/60">
                <div className="flex items-center justify-between border-b border-slate-200/50 px-6 py-5 dark:border-slate-800/50">
                    <div>
                        <CardTitle className="text-base">
                            Deadlines by date
                        </CardTitle>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            Tasks due within the next 7 days
                        </p>
                    </div>
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-teal-600 dark:bg-teal-500/15 dark:text-teal-300">
                        Upcoming
                    </span>
                </div>
                <div className="px-6 pb-6 pt-4">
                    <div
                        className="h-72"
                        style={{ minWidth: 0, minHeight: 0 }}
                    >
                        {deadlineSeries.length ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={deadlineSeries}>
                                    <defs>
                                        <linearGradient
                                            id="deadlineGradient"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor="#14b8a6"
                                                stopOpacity={0.3}
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor="#14b8a6"
                                                stopOpacity={0.02}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        stroke="rgba(148, 163, 184, 0.15)"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#94a3b8",
                                            fontSize: 12,
                                            fontWeight: 500,
                                        }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#94a3b8",
                                            fontSize: 12,
                                        }}
                                        allowDecimals={false}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        labelFormatter={(label, payload) => {
                                            return (
                                                payload?.[0]?.payload
                                                    ?.fullLabel || label
                                            );
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#14b8a6"
                                        strokeWidth={2.5}
                                        fill="url(#deadlineGradient)"
                                        animationDuration={1000}
                                        animationBegin={300}
                                        dot={{
                                            r: 5,
                                            fill: "#14b8a6",
                                            stroke: "#fff",
                                            strokeWidth: 2,
                                        }}
                                        activeDot={{
                                            r: 7,
                                            fill: "#14b8a6",
                                            stroke: "#fff",
                                            strokeWidth: 3,
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200/60 dark:border-slate-700/60">
                                <p className="text-3xl">🎉</p>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    No upcoming deadlines to chart.
                                </p>
                                <p className="text-xs text-slate-400 dark:text-slate-500">
                                    All clear for the next 7 days!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
}
