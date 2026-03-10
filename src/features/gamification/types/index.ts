// src/features/gamification/types/index.ts

export interface Quest {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  target_action: string;
  target_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  badge_name: string;
  description: string;
  icon_url: string;
  unlock_xp_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestPayload {
  title: string;
  description: string;
  xp_reward: number;
  target_action: string;
  target_count: number;
  is_active?: boolean;
}

export interface CreateBadgePayload {
  badge_name: string;
  description: string;
  icon_url: string;
  unlock_xp_threshold: number;
}