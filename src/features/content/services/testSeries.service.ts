// src/features/content/services/testSeries.service.ts
import { apiClient } from '../../../lib/axios';
import type { TestSeries, CreateTestSeriesPayload } from '../types';

export const testSeriesService = {
  getByExam: async (examId: string): Promise<{ data: TestSeries[] }> => {
    const response = await apiClient.get(`/content/test-series/exam/${examId}`);
    return response.data;
  },

  create: async (data: CreateTestSeriesPayload): Promise<{ testSeries: TestSeries }> => {
    const response = await apiClient.post('/content/test-series', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateTestSeriesPayload>): Promise<{ testSeries: TestSeries }> => {
    const response = await apiClient.put(`/content/test-series/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/content/test-series/${id}`);
  }
};