import { api } from "@/services/api";

export const userService = {
    search: async (query) => {
        const { data } = await api.get(
            `/users/search?q=${encodeURIComponent(query)}`,
        );
        return data;
    },
};
