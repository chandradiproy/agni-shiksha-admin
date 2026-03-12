// src/features/plans/types/index.ts

export interface Plan {
  id: string;
  name: string;
  slug: string;
  monthly_price_paise: number;
  annual_price_paise: number;
  features: string[];
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface CreatePlanPayload {
  name: string;
  slug: string;
  monthly_price_paise: number;
  annual_price_paise: number;
  features: string[];
  is_active?: boolean;
  display_order?: number;
}