import { createClient } from "./server";
import type {
  Category,
  Personality,
  PersonalityWithCategories,
  Subcategory,
  SubcategoryWithCategory,
  TimelineEvent,
} from "@/types/database.types";

async function supabase() {
  return createClient();
}

function toPersonalityWithCategories(
  row: Personality & { categories?: Category[]; subcategories?: Subcategory[] }
): PersonalityWithCategories {
  return {
    ...row,
    categories: row.categories ?? [],
    subcategories: row.subcategories ?? [],
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

export async function getAllSubcategories(): Promise<Subcategory[]> {
  const db = await supabase();
  const { data, error } = await db
    .from("subcategories")
    .select("*")
    .order("order", { ascending: true });
  if (error) {
    console.error("getAllSubcategories error:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getSubcategoriesByCategory(
  categoryId: string
): Promise<Subcategory[]> {
  const db = await supabase();
  const { data, error } = await db
    .from("subcategories")
    .select("*")
    .eq("category_id", categoryId)
    .order("order", { ascending: true });
  if (error) return [];
  return data ?? [];
}

export async function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string
): Promise<Subcategory | null> {
  const db = await supabase();
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  const { data, error } = await db
    .from("subcategories")
    .select("*")
    .eq("category_id", category.id)
    .eq("slug", subcategorySlug)
    .single();
  if (error) return null;
  return data;
}

export async function getFeaturedSubcategories(
  limit = 6
): Promise<SubcategoryWithCategory[]> {
  const db = await supabase();
  const { data, error } = await db
    .from("subcategories")
    .select("*, category:categories(*)")
    .eq("featured", true)
    .order("order", { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return data.map((row) => ({
    ...row,
    category: row.category as Category,
  }));
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

  return attachCategoriesAndSubcategories(personalities);
}

export async function getFeaturedPersonalities(
  limit = 6
): Promise<PersonalityWithCategories[]> {
  const db = await supabase();
  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .eq("featured", true);

  if (error || !personalities) return [];

  const sorted = [...personalities]
    .sort((a, b) => {
      const orderA = a.featured_order ?? 0;
      const orderB = b.featured_order ?? 0;
      if (orderA !== orderB) return orderA - orderB;
      return a.full_name.localeCompare(b.full_name);
    })
    .slice(0, limit);

  return attachCategoriesAndSubcategories(sorted);
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
  return attachCategoriesAndSubcategories(personalities);
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
    .or(`full_name.ilike.${q},display_name.ilike.${q}`);

  if (error || !personalities) return [];
  return attachCategoriesAndSubcategories(personalities);
}

export async function getPersonalitiesByCategory(
  categorySlug: string
): Promise<PersonalityWithCategories[]> {
  const db = await supabase();

  const category = await getCategoryBySlug(categorySlug);
  if (!category) return [];

  const { data: directLinks } = await db
    .from("personality_categories")
    .select("personality_id")
    .eq("category_id", category.id);

  const subcategories = await getSubcategoriesByCategory(category.id);
  const subIds = subcategories.map((s) => s.id);

  let subPersonalityIds: string[] = [];
  if (subIds.length > 0) {
    const { data: subLinks } = await db
      .from("personality_subcategories")
      .select("personality_id")
      .in("subcategory_id", subIds);
    subPersonalityIds = subLinks?.map((l) => l.personality_id) ?? [];
  }

  const allIds = [
    ...new Set([
      ...(directLinks?.map((l) => l.personality_id) ?? []),
      ...subPersonalityIds,
    ]),
  ];

  if (allIds.length === 0) return [];

  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .in("id", allIds)
    .order("full_name", { ascending: true });

  if (error || !personalities) return [];
  return attachCategoriesAndSubcategories(personalities);
}

export async function getCategoryPageStructure(categorySlug: string) {
  const category = await getCategoryBySlug(categorySlug);
  if (!category) return null;

  const subcategories = await getSubcategoriesByCategory(category.id);
  const db = await supabase();

  const subSections = await Promise.all(
    subcategories.map(async (sub) => ({
      subcategory: sub,
      personalities: await getPersonalitiesBySubcategory(categorySlug, sub.slug),
    }))
  );

  const subPersonalityIds = new Set<string>();
  for (const section of subSections) {
    section.personalities.forEach((p) => subPersonalityIds.add(p.id));
  }

  const { data: directLinks } = await db
    .from("personality_categories")
    .select("personality_id")
    .eq("category_id", category.id);

  const directIds = (directLinks ?? [])
    .map((l) => l.personality_id)
    .filter((id) => !subPersonalityIds.has(id));

  let directPersonalities: PersonalityWithCategories[] = [];
  if (directIds.length > 0) {
    const { data: personalities } = await db
      .from("personalities")
      .select("*")
      .eq("status", "published")
      .in("id", directIds)
      .order("full_name", { ascending: true });
    if (personalities) {
      directPersonalities = await attachCategoriesAndSubcategories(personalities);
    }
  }

  return {
    category,
    subSections,
    directPersonalities,
  };
}

export async function getPersonalitiesBySubcategory(
  categorySlug: string,
  subcategorySlug: string
): Promise<PersonalityWithCategories[]> {
  const db = await supabase();
  const subcategory = await getSubcategoryBySlug(categorySlug, subcategorySlug);
  if (!subcategory) return [];

  const { data: links, error: linkError } = await db
    .from("personality_subcategories")
    .select("personality_id, order")
    .eq("subcategory_id", subcategory.id)
    .order("order", { ascending: true });

  if (linkError || !links || links.length === 0) return [];

  const orderMap = new Map(links.map((l) => [l.personality_id, l.order]));
  const ids = links.map((l) => l.personality_id);

  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .in("id", ids);

  if (error || !personalities) return [];

  const sorted = [...personalities].sort((a, b) => {
    const orderA = orderMap.get(a.id) ?? 0;
    const orderB = orderMap.get(b.id) ?? 0;
    if (orderA !== orderB) return orderA - orderB;
    return a.full_name.localeCompare(b.full_name);
  });

  return attachCategoriesAndSubcategories(sorted);
}

export async function getPersonalitiesForSubcategoryHome(
  subcategoryId: string,
  limit = 4
): Promise<PersonalityWithCategories[]> {
  const db = await supabase();

  const { data: links } = await db
    .from("personality_subcategories")
    .select("personality_id, order")
    .eq("subcategory_id", subcategoryId)
    .order("order", { ascending: true })
    .limit(limit);

  if (!links || links.length === 0) return [];

  const ids = links.map((l) => l.personality_id);
  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .in("id", ids);

  if (error || !personalities) return [];

  const orderMap = new Map(links.map((l) => [l.personality_id, l.order]));
  return attachCategoriesAndSubcategories(
    [...personalities].sort(
      (a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0)
    )
  );
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

export async function getPersonalitySubcategories(
  personalityId: string
): Promise<(Subcategory & { order: number })[]> {
  const db = await supabase();
  const { data: links, error: linkError } = await db
    .from("personality_subcategories")
    .select("subcategory_id, order")
    .eq("personality_id", personalityId)
    .order("order", { ascending: true });

  if (linkError || !links || links.length === 0) return [];

  const subIds = links.map((l) => l.subcategory_id);
  const { data: subcategories, error } = await db
    .from("subcategories")
    .select("*")
    .in("id", subIds);

  if (error || !subcategories) return [];

  const orderMap = new Map(links.map((l) => [l.subcategory_id, l.order]));
  return subcategories
    .map((s) => ({ ...s, order: orderMap.get(s.id) ?? 0 }))
    .sort((a, b) => a.order - b.order);
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

  const { data: mySubLinks } = await db
    .from("personality_subcategories")
    .select("subcategory_id")
    .eq("personality_id", personalityId);

  if (
    (!myCatLinks || myCatLinks.length === 0) &&
    (!mySubLinks || mySubLinks.length === 0)
  ) {
    return [];
  }

  const catIds = myCatLinks?.map((l) => l.category_id) ?? [];
  const subIds = mySubLinks?.map((l) => l.subcategory_id) ?? [];

  const relatedIds = new Set<string>();

  if (catIds.length > 0) {
    const { data: relatedCatLinks } = await db
      .from("personality_categories")
      .select("personality_id")
      .in("category_id", catIds)
      .neq("personality_id", personalityId);
    relatedCatLinks?.forEach((l) => relatedIds.add(l.personality_id));
  }

  if (subIds.length > 0) {
    const { data: relatedSubLinks } = await db
      .from("personality_subcategories")
      .select("personality_id")
      .in("subcategory_id", subIds)
      .neq("personality_id", personalityId);
    relatedSubLinks?.forEach((l) => relatedIds.add(l.personality_id));
  }

  if (relatedIds.size === 0) return [];

  const uniqueIds = [...relatedIds];
  const { data: personalities, error } = await db
    .from("personalities")
    .select("*")
    .eq("status", "published")
    .in("id", uniqueIds)
    .limit(limit);

  if (error || !personalities) return [];
  return attachCategoriesAndSubcategories(personalities);
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

export async function getSubcategoriesForSitemap(): Promise<
  { category_slug: string; slug: string }[]
> {
  const db = await supabase();
  const { data, error } = await db.from("subcategories").select(`
      slug,
      category:categories(slug)
    `);

  if (error || !data) return [];
  return data
    .map((row) => {
      const cat = row.category;
      const categorySlug =
        cat && typeof cat === "object" && "slug" in cat
          ? (cat as { slug: string }).slug
          : null;
      if (!categorySlug) return null;
      return { category_slug: categorySlug, slug: row.slug as string };
    })
    .filter((row): row is { category_slug: string; slug: string } => row !== null);
}

async function attachCategoriesAndSubcategories(
  personalities: Personality[]
): Promise<PersonalityWithCategories[]> {
  if (personalities.length === 0) return [];

  const db = await supabase();
  const ids = personalities.map((p) => p.id);

  const [{ data: catLinks }, { data: subLinks }] = await Promise.all([
    db
      .from("personality_categories")
      .select("personality_id, category_id")
      .in("personality_id", ids),
    db
      .from("personality_subcategories")
      .select("personality_id, subcategory_id")
      .in("personality_id", ids),
  ]);

  const catIds = [...new Set((catLinks ?? []).map((l) => l.category_id))];
  const subIds = [...new Set((subLinks ?? []).map((l) => l.subcategory_id))];

  const [{ data: categories }, { data: subcategories }] = await Promise.all([
    catIds.length > 0
      ? db.from("categories").select("*").in("id", catIds)
      : Promise.resolve({ data: [] as Category[] }),
    subIds.length > 0
      ? db.from("subcategories").select("*").in("id", subIds)
      : Promise.resolve({ data: [] as Subcategory[] }),
  ]);

  const catMap = new Map((categories ?? []).map((c) => [c.id, c]));
  const subMap = new Map((subcategories ?? []).map((s) => [s.id, s]));

  return personalities.map((p) => {
    const pCatIds = (catLinks ?? [])
      .filter((l) => l.personality_id === p.id)
      .map((l) => l.category_id);
    const pSubIds = (subLinks ?? [])
      .filter((l) => l.personality_id === p.id)
      .map((l) => l.subcategory_id);

    const pCats = pCatIds
      .map((cid) => catMap.get(cid))
      .filter((c): c is Category => c !== undefined);
    const pSubs = pSubIds
      .map((sid) => subMap.get(sid))
      .filter((s): s is Subcategory => s !== undefined);

    return toPersonalityWithCategories({
      ...p,
      categories: pCats,
      subcategories: pSubs,
    });
  });
}
