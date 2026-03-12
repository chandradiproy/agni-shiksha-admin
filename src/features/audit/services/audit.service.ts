// src/features/audit/services/audit.service.ts
import { apiClient } from '../../../lib/axios';
import type { AuditLog } from '../types';

export const auditService = {
  getLogs: async (page = 1, limit = 10): Promise<{ data: AuditLog[], pagination: any }> => {
    const response = await apiClient.get('/audit', { params: { page, limit } });
    return response.data;
  }
};