// src/features/content/services/question.service.ts
import { apiClient } from '../../../lib/axios';

export const questionService = {
  // Fetch existing questions for a test
  getQuestions: async (testSeriesId: string) => {
    const response = await apiClient.get(`/questions/test-series/${testSeriesId}`);
    return response.data;
  },

  // Upload CSV for Preview
  previewBulk: async (testSeriesId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post(`/questions/test-series/${testSeriesId}/preview-bulk`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Finalize and save the parsed questions
  commitBulk: async (testSeriesId: string, questions: any[]) => {
    const response = await apiClient.post(`/questions/test-series/${testSeriesId}/commit-bulk`, { questions });
    return response.data;
  },

  // Update a single question
  updateQuestion: async (testSeriesId: string, questionId: string, data: any) => {
    const response = await apiClient.put(`/questions/test-series/${testSeriesId}/question/${questionId}`, data);
    return response.data;
  },

  // Delete a single question
  deleteQuestion: async (testSeriesId: string, questionId: string) => {
    const response = await apiClient.delete(`/questions/test-series/${testSeriesId}/question/${questionId}`);
    return response.data;
  }
};