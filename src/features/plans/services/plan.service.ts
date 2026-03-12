// src/features/plans/services/plan.service.ts
import { apiClient } from '../../../lib/axios';
import type { Plan, CreatePlanPayload } from '../types';

export const planService = {
  getPlans: async (): Promise<{ data: Plan[] }> => {
    const response = await apiClient.get('/plans');
    return response.data;
  },

  createPlan: async (data: CreatePlanPayload): Promise<{ data: Plan }> => {
    const response = await apiClient.post('/plans', data);
    return response.data;
  },

  updatePlan: async (id: string, data: Partial<CreatePlanPayload>): Promise<{ data: Plan }> => {
    const response = await apiClient.put(`/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await apiClient.delete(`/plans/${id}`);
  }
};