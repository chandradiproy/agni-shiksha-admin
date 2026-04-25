// src/features/content/services/category.service.ts
import { apiClient } from '../../../lib/axios';
import type { ExamCategory, CreateCategoryPayload } from '../types';

export const categoryService = {
  getAll: async (): Promise<{ data: ExamCategory[] }> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  create: async (data: CreateCategoryPayload): Promise<{ data: ExamCategory }> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateCategoryPayload>): Promise<{ data: ExamCategory }> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  }
};
