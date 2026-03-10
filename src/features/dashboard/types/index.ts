// src/features/dashboard/types/index.ts

export interface DashboardMetrics {
  totalStudents: number;
  activeTests: number;
  totalQuestions: number;
  totalAdmins: number;
}

export interface RecentStudent {
  id: string;
  full_name: string | null;
  email: string;
  phone_number: string | null;
  created_at: string;
}

export interface DashboardStatsResponse {
  metrics: DashboardMetrics;
  recentStudents: RecentStudent[];
}