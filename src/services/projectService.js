import { api } from "@/services/api";

export const projectService = {
    list: async () => {
        const { data } = await api.get("/projects");
        return data;
    },
    create: async (payload) => {
        const { data } = await api.post("/projects", payload);
        return data;
    },
    get: async (projectId) => {
        const { data } = await api.get(`/projects/${projectId}`);
        return data;
    },
    addMember: async (projectId, payload) => {
        const { data } = await api.post(
            `/projects/${projectId}/members`,
            payload,
        );
        return data;
    },
    removeMember: async (projectId, memberId) => {
        const { data } = await api.delete(
            `/projects/${projectId}/members/${memberId}`,
        );
        return data;
    },
};
