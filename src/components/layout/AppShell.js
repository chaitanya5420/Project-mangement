"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { projectService } from "@/services/projectService";
import ThemeToggle from "@/components/layout/ThemeToggle";

const navItems = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/projects", label: "Projects" },
];

export default function AppShell({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = useAuthStore((state) => state.user);
    const clearAuth = useAuthStore((state) => state.clearAuth);

    const { data } = useQuery({
        queryKey: ["projects"],
        queryFn: projectService.list,
    });

    const projects = data?.projects || [];

    const onLogout = () => {
        clearAuth();
        router.push("/login");
    };

    return (
        <div className="min-h-screen">
            <div className="mx-auto grid min-h-screen w-full max-w-[1440px] grid-cols-1 lg:grid-cols-[260px_1fr] lg:gap-4 lg:p-4">
                {isSidebarOpen ? (
                    <button
                        className="fixed inset-0 z-20 bg-slate-900/30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        aria-label="Close sidebar"
                    />
                ) : null}

                <aside
                    className={cn(
                        "panel fixed left-3 top-3 z-30 h-[calc(100vh-1.5rem)] w-[260px] rounded-3xl p-4 transition-transform lg:sticky lg:top-4 lg:translate-x-0",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-[115%]",
                    )}
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-white">
                                TaskFlow
                            </h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Team task workspace
                            </p>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                            Live
                        </span>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsSidebarOpen(false)}
                                className={cn(
                                    "block rounded-xl px-3 py-2 text-sm font-medium transition",
                                    pathname.startsWith(item.href)
                                        ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50",
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-6 border-t border-slate-200 pt-4">
                        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                            Projects
                        </p>
                        <div className="max-h-[55vh] space-y-1 overflow-auto pr-1">
                            {projects.slice(0, 8).map((project) => (
                                <Link
                                    key={project._id}
                                    href={`/projects/${project._id}`}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                        "block rounded-xl px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-50",
                                        pathname.includes(project._id)
                                            ? "bg-indigo-50 text-slate-900 dark:bg-indigo-500/15 dark:text-slate-50"
                                            : "",
                                    )}
                                >
                                    <span className="line-clamp-1">
                                        {project.name}
                                    </span>
                                </Link>
                            ))}
                            {!projects.length ? (
                                <p className="px-3 py-2 text-xs text-slate-400">
                                    No projects yet.
                                </p>
                            ) : null}
                        </div>
                    </div>
                </aside>

                <div className="flex min-h-screen flex-col lg:min-h-0">
                    <header className="panel sticky top-0 z-10 mx-3 mt-3 flex h-16 items-center justify-between rounded-3xl px-4 lg:mx-0 lg:mt-0">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                className="lg:hidden"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                Menu
                            </Button>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Welcome back
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <div className="hidden text-right sm:block">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {user?.email}
                                </p>
                            </div>
                            <Avatar name={user?.name} className="h-9 w-9" />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onLogout}
                            >
                                Logout
                            </Button>
                        </div>
                    </header>

                    <main className="flex-1 px-3 pb-3 pt-4 lg:px-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
