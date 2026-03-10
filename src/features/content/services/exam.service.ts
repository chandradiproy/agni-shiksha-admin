// src/features/content/services/exam.service.ts
import { apiClient } from '../../../lib/axios';
import type { Exam, ExamResponse, CreateExamPayload } from '../types';

export const examService = {
  getExams: async (page: number, limit: number, search: string): Promise<ExamResponse> => {
    const response = await apiClient.get<ExamResponse>('/content/exams', {
      params: { page, limit, search },
    });
    return response.data;
  },

  createExam: async (data: CreateExamPayload): Promise<{ data: Exam }> => {
    const response = await apiClient.post('/content/exams', data);
    return response.data;
  },

  updateExam: async (id: string, data: Partial<CreateExamPayload>): Promise<{ data: Exam }> => {
    const response = await apiClient.put(`/content/exams/${id}`, data);
    return response.data;
  },

  deleteExam: async (id: string): Promise<void> => {
    await apiClient.delete(`/content/exams/${id}`);
  },
};