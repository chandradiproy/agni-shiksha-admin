// src/features/financial/types/index.ts

export type PaymentStatus = 'created' | 'success' | 'failed';

export interface FinancialSummary {
  total_revenue_inr: number;
  total_successful_payments: number;
  active_subscribers: number;
  expired_subscribers: number;
}

export interface PaymentRecord {
  id: string;
  user: { full_name: string; email: string; phone_number: string };
  plan: { name: string };
  amount_paise: number;
  status: PaymentStatus;
  gateway_order_id: string;
  created_at: string;
}

export interface SubscriptionRecord {
  id: string;
  user: { full_name: string; email: string };
  plan: { name: string };
  status: 'active' | 'expired' | 'cancelled';
  start_date: string;
  end_date: string;
}