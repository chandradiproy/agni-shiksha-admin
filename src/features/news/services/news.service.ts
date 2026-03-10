// src/features/news/services/news.service.ts
import { apiClient } from '../../../lib/axios';
import type { Article, NewsResponse, CreateCustomArticlePayload } from '../types';

export const newsService = {
  getArticles: async (page: number = 1, limit: number = 20): Promise<NewsResponse> => {
    const response = await apiClient.get<NewsResponse>('/current-affairs', {
      params: { page, limit }
    });
    return response.data;
  },

  triggerSync: async (): Promise<any> => {
    const response = await apiClient.post('/current-affairs/sync');
    return response.data;
  },

  updateStatus: async (id: string, data: { is_hidden?: boolean; is_pinned?: boolean }): Promise<{ data: Article }> => {
    const response = await apiClient.put(`/current-affairs/${id}/status`, data);
    return response.data;
  },

  createCustomArticle: async (data: CreateCustomArticlePayload): Promise<{ data: Article }> => {
    const response = await apiClient.post('/current-affairs/custom', data);
    return response.data;
  },

  deleteArticle: async (id: string): Promise<void> => {
    await apiClient.delete(`/current-affairs/${id}`);
  }
};