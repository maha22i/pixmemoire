export type AIDetailLevel = "concis" | "standard" | "detaille";

export type AIGenerationStatus =
  | "pending"
  | "success"
  | "error"
  | "validated"
  | "rejected";

export type AIQueueStatus = "pending" | "processing" | "done" | "failed";

export type VerificationStatus =
  | "unverified"
  | "in_review"
  | "verified"
  | "flagged";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface AIGenerationParams {
  personalityName: string;
  category: string;
  era: "pre_independence" | "post_independence" | "contemporary";
  detailLevel: AIDetailLevel;
  additionalContext?: string;
  includeSources: boolean;
  includeTimeline: boolean;
  includeRelated: boolean;
}

export interface AITimelineEntry {
  event_date: string;
  title: string;
  description: string;
}

export interface AISourceEntry {
  title: string;
  url?: string;
  type: "livre" | "article" | "interview" | "archive" | "site_web";
  author?: string;
  date?: string;
}

export interface AIGeneratedData {
  full_name: string;
  display_name: string;
  title: string;
  birth_date: string | null;
  death_date: string | null;
  birth_place: string;
  origin_region: string;
  gender: "M" | "F";
  era: "pre_independence" | "post_independence" | "contemporary";
  is_alive: boolean;
  famous_quote: string | null;
  short_bio: string;
  full_bio: string;
  achievements: string;
  timeline: AITimelineEntry[];
  sources: AISourceEntry[];
  related_personalities: string[];
  categories_suggested: string[];
  seo: {
    meta_title: string;
    meta_description: string;
  };
}

export interface AIGenerationResponse {
  error: string | null;
  confidence_level: ConfidenceLevel;
  warnings: string[];
  data: AIGeneratedData;
}

export interface AIGeneration {
  id: string;
  admin_id: string;
  personality_id: string | null;
  prompt_input: AIGenerationParams;
  raw_output: AIGenerationResponse | null;
  status: AIGenerationStatus;
  model_used: string | null;
  tokens_used: number | null;
  cost_estimate: number | null;
  generation_time: number | null;
  error_message: string | null;
  validated_at: string | null;
  validated_by: string | null;
  created_at: string;
  admin?: { full_name: string; email: string };
}

export interface AIQueueItem {
  id: string;
  batch_id: string;
  admin_id: string;
  personality_name: string;
  category_slug: string | null;
  era: string;
  additional_notes: string | null;
  status: AIQueueStatus;
  result_id: string | null;
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface AISettings {
  id: string;
  default_model: string;
  monthly_budget_usd: number;
  per_user_budget_usd: number;
  daily_limit_per_user: number;
  hourly_limit_per_user: number;
  is_enabled: boolean;
  system_prompt_override: string | null;
  updated_at: string;
  updated_by: string | null;
}

export interface AIGenerationMetrics {
  tokens_used: number;
  cost_usd: number;
  generation_time_ms: number;
}

export interface BatchEntry {
  name: string;
  category: string;
  era: string;
  notes?: string;
}

export interface AIMonthlyStats {
  totalGenerations: number;
  totalCost: number;
  validationRate: number;
  tokensUsed: number;
}
