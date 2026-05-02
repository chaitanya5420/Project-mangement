"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function RegisterForm() {
    const router = useRouter();
    const setAuth = useAuthStore((state) => state.setAuth);
    const [form, setForm] = useState({ name: "", email: "", password: "" });

    const mutation = useMutation({
        mutationFn: authService.register,
        onSuccess: (data) => {
            setAuth(data);
            router.push("/dashboard");
        },
    });

    const onSubmit = (event) => {
        event.preventDefault();
        mutation.mutate(form);
    };

    return (
        <Card className="mx-auto mt-20 w-full max-w-md rounded-3xl border border-slate-200/50 bg-white/60 p-8 shadow-2xl backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/60">
            <div className="mb-8 text-center">
                <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create account</CardTitle>
                <CardDescription className="mt-2 text-slate-500 dark:text-slate-400">
                    Start collaborating with your team
                </CardDescription>
            </div>
            <form className="space-y-4" onSubmit={onSubmit}>
                <Input
                    placeholder="Name"
                    value={form.name}
                    className="rounded-xl border-slate-200/60 bg-white/80 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                    onChange={(event) =>
                        setForm((prev) => ({
                            ...prev,
                            name: event.target.value,
                        }))
                    }
                    required
                />
                <Input
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    className="rounded-xl border-slate-200/60 bg-white/80 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                    onChange={(event) =>
                        setForm((prev) => ({
                            ...prev,
                            email: event.target.value,
                        }))
                    }
                    required
                />
                <Input
                    type="password"
                    placeholder="Password"
                    value={form.password}
                    className="rounded-xl border-slate-200/60 bg-white/80 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500/20 dark:border-slate-700/60 dark:bg-slate-900/80"
                    onChange={(event) =>
                        setForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                        }))
                    }
                    required
                />
                <Button
                    className="w-full rounded-xl py-6 text-base font-semibold shadow-md transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/20 active:translate-y-0"
                    type="submit"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? "Creating..." : "Create account"}
                </Button>
                {mutation.error ? (
                    <p className="text-sm text-red-600">
                        {mutation.error?.response?.data?.message ||
                            "Registration failed"}
                    </p>
                ) : null}
            </form>
        </Card>
    );
}
