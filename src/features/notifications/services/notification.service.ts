import { apiClient } from '../../../lib/axios';
import type { NotificationsResponse, CreateNotificationPayload, Notification } from '../types';

export const notificationService = {
  getNotifications: async (page: number = 1, limit: number = 20): Promise<NotificationsResponse> => {
    const response = await apiClient.get<NotificationsResponse>('/notifications', {
      params: { page, limit }
    });
    return response.data;
  },

  createNotification: async (data: CreateNotificationPayload): Promise<{ data: Notification, recipient_count: number }> => {
    const response = await apiClient.post('/notifications', data);
    return response.data;
  }
};
