import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const categorie = searchParams.get("categorie");
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 50));

  const supabase = await createClient();

  let dbQuery = supabase
    .from("personalities")
    .select(
      "full_name, slug, title, short_bio, birth_date, death_date, birth_place, is_alive, era"
    )
    .eq("status", "published")
    .order("full_name", { ascending: true })
    .limit(limit);

  if (query) {
    dbQuery = dbQuery.ilike("full_name", `%${query}%`);
  }

  if (categorie) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorie)
      .single();

    if (cat) {
      const { data: links } = await supabase
        .from("personality_categories")
        .select("personality_id")
        .eq("category_id", cat.id);

      if (links && links.length > 0) {
        dbQuery = dbQuery.in(
          "id",
          links.map((l) => l.personality_id)
        );
      } else {
        return Response.json({
          source: "PixMémoire — pixmemoire.dj",
          description: "Répertoire des personnalités djiboutiennes",
          count: 0,
          personnalites: [],
        });
      }
    }
  }

  const { data } = await dbQuery;

  const personnalites = (data || []).map((p) => ({
    nom: p.full_name,
    slug: p.slug,
    role_principal: p.title,
    biographie_courte: p.short_bio,
    date_naissance: p.birth_date,
    date_deces: p.death_date,
    lieu_naissance: p.birth_place,
    en_vie: p.is_alive,
    url: `https://pixmemoire.dj/personnalites/${p.slug}`,
  }));

  return Response.json({
    source: "PixMémoire — pixmemoire.dj",
    description: "Répertoire des personnalités djiboutiennes",
    count: personnalites.length,
    personnalites,
  });
}
