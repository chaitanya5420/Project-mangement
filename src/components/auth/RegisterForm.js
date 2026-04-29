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
        <Card className="mx-auto mt-20 w-full max-w-md">
            <CardTitle>Create account</CardTitle>
            <CardDescription className="mb-6">
                Start collaborating with your team
            </CardDescription>
            <form className="space-y-4" onSubmit={onSubmit}>
                <Input
                    placeholder="Name"
                    value={form.name}
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
                    onChange={(event) =>
                        setForm((prev) => ({
                            ...prev,
                            password: event.target.value,
                        }))
                    }
                    required
                />
                <Button
                    className="w-full"
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
