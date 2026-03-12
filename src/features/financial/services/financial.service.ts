// src/features/financial/services/financial.service.ts
import { apiClient } from '../../../lib/axios';

// Added 'refunded' to the status type
export type PaymentStatus = 'created' | 'success' | 'failed' | 'refunded';

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
  status: 'active' | 'expired' | 'cancelled' | 'revoked';
  start_date: string;
  end_date: string;
}

export const financialService = {
  getSummary: async (): Promise<{ data: FinancialSummary }> => {
    const response = await apiClient.get('/financial/summary');
    return response.data;
  },
  getPayments: async (page = 1, status?: string): Promise<{ data: PaymentRecord[], pagination: any }> => {
    const response = await apiClient.get('/financial/payments', { params: { page, limit: 20, status } });
    return response.data;
  },
  getSubscriptions: async (page = 1): Promise<{ data: SubscriptionRecord[], pagination: any }> => {
    const response = await apiClient.get('/financial/subscriptions', { params: { page, limit: 20 } });
    return response.data;
  },
  
  // Verify payment with gateway
  verifyPayment: async (paymentId: string): Promise<any> => {
    const response = await apiClient.post(`/financial/payments/${paymentId}/verify`);
    return response.data;
  },

  // Revoke active subscription
  revokeSubscription: async (subscriptionId: string, reason: string): Promise<any> => {
    const response = await apiClient.post(`/financial/subscriptions/${subscriptionId}/revoke`, { reason });
    return response.data;
  },

  // NEW: Refund a successful payment and revoke access
  refundPayment: async (paymentId: string, reason: string): Promise<any> => {
    const response = await apiClient.post(`/financial/payments/${paymentId}/refund`, { reason });
    return response.data;
  }
};