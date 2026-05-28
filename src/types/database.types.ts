export type Region =
  | "djibouti-ville"
  | "tadjourah"
  | "dikhil"
  | "ali-sabieh"
  | "obock"
  | "arta";

export type Era = "pre_independence" | "post_independence" | "contemporary";

export type Gender = "M" | "F";

export type PersonalityStatus = "published" | "draft";

export type SuggestionType = "new_personality" | "correction";

export type SuggestionStatus = "pending" | "reviewed" | "accepted" | "rejected";

export type RelationType =
  | "contemporain"
  | "collaborateur"
  | "famille"
  | "mentor"
  | "successeur";

export interface VideoEntry {
  title: string;
  youtube_id: string;
  description?: string;
}

export interface SourceEntry {
  title: string;
  url?: string;
  type: "livre" | "article" | "documentaire" | "archive" | "web";
}

export interface Personality {
  id: string;
  slug: string;
  full_name: string;
  display_name: string;
  title: string;
  birth_date: string | null;
  death_date: string | null;
  birth_place: string;
  origin_region: Region;
  gender: Gender;
  era: Era;
  is_alive: boolean;
  short_bio: string;
  full_bio: string;
  achievements: string;
  famous_quote: string | null;
  main_photo_url: string;
  gallery_urls: string[];
  video_urls: VideoEntry[];
  sources: SourceEntry[];
  featured: boolean;
  featured_order: number;
  views_count: number;
  status: PersonalityStatus;
  ai_generated?: boolean;
  ai_generation_id?: string | null;
  needs_human_review?: boolean;
  verification_status?: "unverified" | "in_review" | "verified" | "flagged";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
}

export interface Subcategory {
  id: string;
  category_id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  featured: boolean;
}

export interface SubcategoryWithCategory extends Subcategory {
  category: Category;
}

export interface PersonalityCategory {
  personality_id: string;
  category_id: string;
}

export interface PersonalitySubcategory {
  personality_id: string;
  subcategory_id: string;
  order: number;
}

export interface PersonalitySubcategoryLink {
  subcategory_id: string;
  order: number;
}

export interface TimelineEvent {
  id: string;
  personality_id: string;
  event_date: string;
  title: string;
  description: string;
  order: number;
}

export interface RelatedPersonality {
  personality_id: string;
  related_id: string;
  relation_type: RelationType;
}

export interface Suggestion {
  id: string;
  type: SuggestionType;
  personality_id: string | null;
  submitter_name: string;
  submitter_email: string;
  message: string;
  status: SuggestionStatus;
  created_at: string;
}

export interface PageView {
  id: string;
  personality_id: string;
  viewed_at: string;
  user_agent: string;
  referrer: string;
}

export interface PersonalityWithCategories extends Personality {
  categories: Category[];
  subcategories?: Subcategory[];
}

export interface FilterState {
  categories: string[];
  era: string;
  status: string;
  regions: string[];
  gender: string;
  sortBy: string;
}

export interface PersonalityWithDetails extends PersonalityWithCategories {
  timeline_events: TimelineEvent[];
  related_personalities: (RelatedPersonality & {
    personality: Personality;
  })[];
}
