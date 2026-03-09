// src/features/users/services/user.service.ts
import { apiClient } from '../../../lib/axios';
import { type UsersResponse } from '../types';

export const userService = {
  getUsers: async (page: number, limit: number, search: string): Promise<UsersResponse> => {
    const response = await apiClient.get<UsersResponse>('/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  banUser: async ({ id, reason }: { id: string; reason?: string }) => {
    const response = await apiClient.put(`/users/${id}/ban`, { ban_reason: reason });
    return response.data;
  },

  forumBanUser: async (id: string) => {
    const response = await apiClient.put(`/users/${id}/forum-ban`);
    return response.data;
  },
};