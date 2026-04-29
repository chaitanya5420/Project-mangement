"use client";

import { create } from "zustand";

const initialUser = null;
const initialToken = null;

export const useAuthStore = create((set) => ({
    user: initialUser,
    token: initialToken,
    hydrated: false,
    setAuth: ({ user, token }) => {
        localStorage.setItem("tm_user", JSON.stringify(user));
        localStorage.setItem("tm_token", token);
        set({ user, token });
    },
    clearAuth: () => {
        localStorage.removeItem("tm_user");
        localStorage.removeItem("tm_token");
        set({ user: initialUser, token: initialToken });
    },
    hydrateAuth: () => {
        const rawUser = localStorage.getItem("tm_user");
        const token = localStorage.getItem("tm_token");

        if (rawUser && token) {
            set({ user: JSON.parse(rawUser), token, hydrated: true });
            return;
        }

        set({ hydrated: true });
    },
}));
