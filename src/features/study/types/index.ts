// src/features/study/types/index.ts

export interface StudyMaterial {
  id: string;
  exam_id: string;
  title: string;
  subject: string;
  topic: string;
  material_type: string; // e.g., 'PDF', 'VIDEO_LINK'
  file_url: string;
  is_active: boolean;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
  exam?: { name: string };
}

export interface StudyPlanTask {
  id: string;
  study_plan_id: string;
  day_number: number;
  task_title: string;
  task_description: string | null;
  reference_material_id: string | null;
  created_at: string;
  updated_at: string;
  material?: StudyMaterial | null;
}

export interface StudyPlan {
  id: string;
  exam_id: string;
  title: string;
  duration_days: number;
  created_at: string;
  updated_at: string;
  exam?: { name: string };
  tasks?: StudyPlanTask[];
  _count?: { tasks: number };
}

export interface CreateMaterialPayload {
  exam_id: string;
  title: string;
  subject: string;
  topic: string;
  material_type: string;
  file_url: string;
  is_active: boolean;
  is_premium: boolean;
}

export interface CreatePlanPayload {
  exam_id: string;
  title: string;
  duration_days: number;
}

export interface AddTaskPayload {
  day_number: number;
  task_title: string;
  task_description?: string;
  reference_material_id?: string;
}