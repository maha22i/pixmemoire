import { createClient } from "./server";
import type {
  Category,
  Personality,
  PersonalityWithCategories,
  TimelineEvent,
} from "@/types/database.types";

async function supabase() {
  return createClient();
}

function toPersonalityWithCategories(
  row: Personality & { categories?: Category[] }
): PersonalityWithCategories {
  return {
    ...row,
    categories: row.categories ?? [],
  };
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await supabase();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .order("order", { ascending: true });
  if (error) {
    console.error("getAllCategories error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  const db = await supabase();
  const { data, error } = await db
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getAllPersonalities(): Promise<
  PersonalityWithCategories[]
> {
  const db = await supabase();
  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .order("full_name", { ascending: true });

  if (error || !personalities) {
    console.error("getAllPersonalities error:", error?.message);
    return [];
  }

  return attachCategories(personalities);
}

export async function getFeaturedPersonalities(): Promise<
  PersonalityWithCategories[]
> {
  const db = await supabase();
  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .eq("featured", true)
    .order("views_count", { ascending: false });

  if (error || !personalities) return [];
  return attachCategories(personalities);
}

export async function getRecentPersonalities(
  limit = 6
): Promise<PersonalityWithCategories[]> {
  const db = await supabase();
  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !personalities) return [];
  return attachCategories(personalities);
}

export async function searchPersonalities(
  query: string
): Promise<PersonalityWithCategories[]> {
  const db = await supabase();
  const q = `%${query}%`;
  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .or(
      `full_name.ilike.${q},display_name.ilike.${q},title.ilike.${q},short_bio.ilike.${q}`
    );

  if (error || !personalities) return [];
  return attachCategories(personalities);
}

export async function getPersonalitiesByCategory(
  categorySlug: string
): Promise<PersonalityWithCategories[]> {
  const db = await supabase();

  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];

  const { data: links, error: linkError } = await db
    .from("personality_categories")
    .select("personality_id")
    .eq("category_id", category.id);

  if (linkError || !links || links.length === 0) return [];

  const ids = links.map((l) => l.personality_id);
  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .in("id", ids)
    .order("full_name", { ascending: true });

  if (error || !personalities) return [];
  return attachCategories(personalities);
}

export async function getPersonalityBySlug(
  slug: string
): Promise<Personality | null> {
  const db = await supabase();
  const { data, error } = await db
    .from("personalities")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) return null;
  return data;
}

export async function getPersonalityCategories(
  personalityId: string
): Promise<Category[]> {
  const db = await supabase();
  const { data: links, error: linkError } = await db
    .from("personality_categories")
    .select("category_id")
    .eq("personality_id", personalityId);

  if (linkError || !links || links.length === 0) return [];

  const catIds = links.map((l) => l.category_id);
  const { data: categories, error } = await db
    .from("categories")
    .select("*")
    .in("id", catIds)
    .order("order", { ascending: true });

  if (error) return [];
  return categories ?? [];
}

export async function getTimelineEvents(
  personalityId: string
): Promise<TimelineEvent[]> {
  const db = await supabase();
  const { data, error } = await db
    .from("timeline_events")
    .select("*")
    .eq("personality_id", personalityId)
    .order("order", { ascending: true });

  if (error) return [];
  return data ?? [];
}

export async function getRelatedPersonalities(
  personalityId: string,
  limit = 4
): Promise<PersonalityWithCategories[]> {
  const db = await supabase();

  const { data: myCatLinks } = await db
    .from("personality_categories")
    .select("category_id")
    .eq("personality_id", personalityId);

  if (!myCatLinks || myCatLinks.length === 0) return [];

  const catIds = myCatLinks.map((l) => l.category_id);

  const { data: relatedLinks } = await db
    .from("personality_categories")
    .select("personality_id")
    .in("category_id", catIds)
    .neq("personality_id", personalityId);

  if (!relatedLinks || relatedLinks.length === 0) return [];

  const uniqueIds = [...new Set(relatedLinks.map((l) => l.personality_id))];
  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .in("id", uniqueIds)
    .limit(limit);

  if (error || !personalities) return [];
  return attachCategories(personalities);
}

export async function getPersonalityCount(): Promise<number> {
  const db = await supabase();
  const { count, error } = await db
    .from("personalities")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");

  if (error) return 0;
  return count ?? 0;
}

export async function getCategoryCount(): Promise<number> {
  const db = await supabase();
  const { count, error } = await db
    .from("categories")
    .select("*", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}

export async function getPublishedPersonalitiesForSitemap(): Promise<
  { slug: string; updated_at: string }[]
> {
  const db = await supabase();
  const { data, error } = await db
    .from("personalities")
    .select("slug, updated_at")
    .eq("status", "published");

  if (error) return [];
  return data ?? [];
}

async function attachCategories(
  personalities: Personality[]
): Promise<PersonalityWithCategories[]> {
  if (personalities.length === 0) return [];

  const db = await supabase();
  const ids = personalities.map((p) => p.id);

  const { data: links } = await db
    .from("personality_categories")
    .select("personality_id, category_id")
    .in("personality_id", ids);

  if (!links || links.length === 0) {
    return personalities.map((p) => toPersonalityWithCategories(p));
  }

  const catIds = [...new Set(links.map((l) => l.category_id))];
  const { data: categories } = await db
    .from("categories")
    .select("*")
    .in("id", catIds);

  const catMap = new Map((categories ?? []).map((c) => [c.id, c]));

  return personalities.map((p) => {
    const pCatIds = links
      .filter((l) => l.personality_id === p.id)
      .map((l) => l.category_id);
    const pCats = pCatIds
      .map((cid) => catMap.get(cid))
      .filter((c): c is Category => c !== undefined);
    return toPersonalityWithCategories({ ...p, categories: pCats });
  });
}
