// src/features/news/types/index.ts

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string | null;
  source_name: string;
  source_url: string | null;
  image_url: string | null;
  is_custom: boolean;
  is_hidden: boolean;
  is_pinned: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
}

export interface NewsResponse {
  data: Article[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCustomArticlePayload {
  title: string;
  summary?: string;
  content: string;
  source_name?: string;
  image_url?: string;
  is_pinned?: boolean;
}