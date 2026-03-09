// src/features/auth/services/auth.service.ts
import { apiClient } from '../../../lib/axios';

/**
 * Authentication Service
 * Handles all API calls related to admin authentication.
 */
export const authService = {
  /**
   * Step 1: Request an OTP to be sent to the admin's email.
   * Connects to the requestAdminOtp controller.
   */
  requestOtp: async (email: string) => {
    // Note: Adjust the endpoint path if your adminAuth.routes.ts differs
    const response = await apiClient.post('/auth/request-otp', { email });
    return response.data;
  },

  /**
   * Step 2: Verify OTP and Password to complete login.
   * Connects to the admin login controller.
   */
  login: async (email: string, otp: string, password: string) => {
    const response = await apiClient.post('/auth/login', { 
      email, 
      otp, 
      password 
    });
    return response.data;
  }
};