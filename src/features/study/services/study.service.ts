// src/features/study/services/study.service.ts
import { apiClient } from '../../../lib/axios';
import type { StudyMaterial, StudyPlan, CreateMaterialPayload, CreatePlanPayload, AddTaskPayload } from '../types';

export const studyService = {
  // --- Study Materials ---
  getMaterials: async (): Promise<{ data: StudyMaterial[] }> => {
    const response = await apiClient.get('/study/materials');
    return response.data;
  },

  createMaterial: async (data: CreateMaterialPayload): Promise<{ data: StudyMaterial }> => {
    const response = await apiClient.post('/study/materials', data);
    return response.data;
  },

  updateMaterial: async (id: string, data: Partial<CreateMaterialPayload>): Promise<{ data: StudyMaterial }> => {
    const response = await apiClient.put(`/study/materials/${id}`, data);
    return response.data;
  },

  deleteMaterial: async (id: string): Promise<void> => {
    await apiClient.delete(`/study/materials/${id}`);
  },

  // --- Study Plans ---
  getPlans: async (): Promise<{ data: StudyPlan[] }> => {
    const response = await apiClient.get('/study/plans');
    return response.data;
  },

  createPlan: async (data: CreatePlanPayload): Promise<{ data: StudyPlan }> => {
    const response = await apiClient.post('/study/plans', data);
    return response.data;
  },

  updatePlan: async (id: string, data: Partial<CreatePlanPayload>): Promise<{ data: StudyPlan }> => {
    const response = await apiClient.put(`/study/plans/${id}`, data);
    return response.data;
  },

  deletePlan: async (id: string): Promise<void> => {
    await apiClient.delete(`/study/plans/${id}`);
  },

  // --- Study Plan Tasks ---
  addTask: async (planId: string, data: AddTaskPayload): Promise<any> => {
    const response = await apiClient.post(`/study/plans/${planId}/tasks`, data);
    return response.data;
  },

  updateTask: async (taskId: string, data: Partial<AddTaskPayload>): Promise<any> => {
    const response = await apiClient.put(`/study/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/study/tasks/${taskId}`);
  }
};