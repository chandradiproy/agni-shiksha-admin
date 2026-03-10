// src/features/dashboard/services/dashboard.service.ts
import { apiClient } from '../../../lib/axios';
import type { DashboardStatsResponse } from '../types';

export const dashboardService = {
  getStats: async (): Promise<DashboardStatsResponse> => {
    const response = await apiClient.get<DashboardStatsResponse>('/dashboard/stats');
    return response.data;
  }
};