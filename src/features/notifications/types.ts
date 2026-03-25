export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  image_url: string | null;
  deep_link: string | null;
  audience_type: string;
  created_at: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateNotificationPayload {
  title: string;
  body: string;
  type: 'MARKETING' | 'ALERT' | 'SYSTEM' | 'NEWS';
  image_url?: string;
  deep_link?: string;
  audience_type: 'ALL' | 'USERS' | 'EXAM';
  send_push: boolean;
}
