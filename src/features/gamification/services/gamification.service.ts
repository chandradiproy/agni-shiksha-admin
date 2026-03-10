// src/features/gamification/services/gamification.service.ts
import { apiClient } from '../../../lib/axios';
import type { Quest, Badge, CreateQuestPayload, CreateBadgePayload } from '../types';

export const gamificationService = {
  // --- Quests ---
  getQuests: async (): Promise<{ data: Quest[] }> => {
    const response = await apiClient.get('/gamification/quests');
    return response.data;
  },

  createQuest: async (data: CreateQuestPayload): Promise<{ data: Quest }> => {
    const response = await apiClient.post('/gamification/quests', data);
    return response.data;
  },

  updateQuest: async (id: string, data: Partial<CreateQuestPayload>): Promise<{ data: Quest }> => {
    const response = await apiClient.put(`/gamification/quests/${id}`, data);
    return response.data;
  },

  deleteQuest: async (id: string): Promise<void> => {
    await apiClient.delete(`/gamification/quests/${id}`);
  },

  // --- Badges ---
  getBadges: async (): Promise<{ data: Badge[] }> => {
    const response = await apiClient.get('/gamification/badges');
    return response.data;
  },

  createBadge: async (data: CreateBadgePayload): Promise<{ data: Badge }> => {
    const response = await apiClient.post('/gamification/badges', data);
    return response.data;
  },

  updateBadge: async (id: string, data: Partial<CreateBadgePayload>): Promise<{ data: Badge }> => {
    const response = await apiClient.put(`/gamification/badges/${id}`, data);
    return response.data;
  },

  deleteBadge: async (id: string): Promise<void> => {
    await apiClient.delete(`/gamification/badges/${id}`);
  }
};