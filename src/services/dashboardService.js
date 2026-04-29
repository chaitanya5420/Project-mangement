import { api } from "@/services/api";

export const dashboardService = {
    get: async () => {
        const { data } = await api.get("/dashboard");
        return data;
    },
};
