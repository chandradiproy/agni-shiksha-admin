// src/features/moderation/types/index.ts

export interface ModerationUser {
  id: string;
  full_name: string | null;
  email: string | null;
}

export interface Doubt {
  id: string;
  title: string;
  description?: string; // Replaced 'content' based on backend search clause
  content?: string;     // Kept for backward compatibility if present
  subject?: string;     // Added based on backend search clause
  is_flagged: boolean;
  is_resolved: boolean; // Added based on new controller logic
  created_at: string;
  user: ModerationUser;
  _count: {
    answers: number;
  };
}

export interface ModerationResponse {
  data: Doubt[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}