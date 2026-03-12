// src/features/audit/types/index.ts

export interface AuditLog {
  id: string;
  admin: { name: string; email: string; role: string };
  action: string;
  target_id: string;
  details: Record<string, any>;
  created_at: string;
}