// src/features/content/types/index.ts

export interface Exam {
  id: string;
  name: string;
  slug: string;
  category: string;
  conducting_body: string;
  description: string;
  thumbnail_url: string | null;
  is_active: boolean;
  display_order: number;
  subjects: string[];
  exam_pattern: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ExamResponse {
  data: Exam[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateExamPayload {
  name: string;
  slug: string;
  category: string;
  conducting_body: string;
  description: string;
  thumbnail_url?: string;
  display_order: number;
  is_active: boolean;
  subjects: string[];
  exam_pattern: Record<string, any>;
}

// --- NEW TEST SERIES TYPES ---
export interface TestSeries {
  id: string;
  exam_id: string;
  title: string;
  description?: string | null;
  type: string;
  test_type: string;
  subject?: string | null;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  difficulty: string;
  negative_marking: boolean;
  negative_marks_per_wrong?: number | null;
  is_all_india: boolean;
  is_active: boolean;
  is_scheduled: boolean;
  is_published: boolean;
  scheduled_at?: string | null;
  available_from?: string | null;
  available_until?: string | null;
  max_attempts?: number | null;
  show_solutions: boolean;
  show_solutions_after?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTestSeriesPayload {
  exam_id: string;
  title: string;
  description?: string;
  type: string;
  test_type: string;
  subject?: string;
  total_questions: number;
  duration_minutes: number;
  total_marks: number;
  difficulty: string;
  negative_marking: boolean;
  negative_marks_per_wrong?: number;
  is_published: boolean;
  is_active: boolean;
  // Extensible for future
  available_from?: string;
  available_until?: string;
}