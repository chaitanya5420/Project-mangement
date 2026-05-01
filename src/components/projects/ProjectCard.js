"use client";

import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export default function ProjectCard({ project }) {
    const memberPreview = project.members?.slice(0, 3) || [];

    return (
        <Link href={`/projects/${project._id}`} className="group block h-full">
            <Card className="panel flex h-full flex-col rounded-3xl p-5 transition duration-200 group-hover:-translate-y-1 group-hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <span className="inline-flex rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                            Active Project
                        </span>
                        <CardTitle className="line-clamp-1 text-xl tracking-tight">
                            {project.name}
                        </CardTitle>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2 text-right text-slate-900 dark:bg-slate-950 dark:text-white">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            Members
                        </p>
                        <p className="text-lg font-semibold leading-none">
                            {project.members.length}
                        </p>
                    </div>
                </div>

                <CardDescription className="mt-4 line-clamp-3 leading-6 text-slate-500 dark:text-slate-400">
                    {project.description || "No project description"}
                </CardDescription>

                <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
                    <div className="flex -space-x-2">
                        {memberPreview.map((member) => (
                            <Avatar
                                key={member.user._id}
                                name={member.user.name}
                                className="h-8 w-8 ring-2 ring-white dark:ring-slate-950"
                            />
                        ))}
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Open board
                    </p>
                </div>
            </Card>
        </Link>
    );
}
