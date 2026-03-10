// src/features/moderation/services/moderation.service.ts
import { apiClient } from '../../../lib/axios';
import type { ModerationResponse, Doubt } from '../types';

export const moderationService = {
  getDoubts: async (page: number, limit: number, filter: string, search: string): Promise<ModerationResponse> => {
    const params: any = { page, limit, filter };
    if (search) {
      params.search = search;
    }
    const response = await apiClient.get('/moderation/doubts', { params });
    return response.data;
  },

  updateDoubtStatus: async (id: string, data: { is_resolved?: boolean; is_flagged?: boolean }): Promise<{ message: string, doubt: Doubt }> => {
    const response = await apiClient.put(`/moderation/doubts/${id}/status`, data);
    return response.data;
  },

  deleteDoubt: async (id: string): Promise<void> => {
    await apiClient.delete(`/moderation/doubts/${id}`);
  },

  deleteAnswer: async (id: string): Promise<void> => {
    await apiClient.delete(`/moderation/answers/${id}`);
  }
};