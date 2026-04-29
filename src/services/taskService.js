import { api } from "@/services/api";

export const taskService = {
    listByProject: async (projectId) => {
        const { data } = await api.get(`/tasks/project/${projectId}`);
        return data;
    },
    create: async (projectId, payload) => {
        const { data } = await api.post(`/tasks/project/${projectId}`, payload);
        return data;
    },
    update: async (taskId, payload) => {
        const { data } = await api.patch(`/tasks/${taskId}`, payload);
        return data;
    },
    remove: async (taskId) => {
        const { data } = await api.delete(`/tasks/${taskId}`);
        return data;
    },
};
