// src/features/users/types/index.ts

export interface User {
  id: string;
  phone_number: string | null;
  email: string;
  full_name: string;
  study_language: string;
  prep_level: string;
  daily_study_hours: number;
  is_premium: boolean;
  xp_total: number;
  level: number;
  gems: number;
  current_streak: number;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  is_active: boolean;
  is_banned: boolean;
  forum_banned: boolean; // Updated to match backend payload
  created_at: string;
  _count: {
    test_attempts: number;
    doubts: number;
    doubt_answers: number;
    reports_made: number;
  };
}

export interface UsersResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}