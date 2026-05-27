import { requireAdmin } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import MediaLibrary from "@/components/admin/media/MediaLibrary";

export default async function MediaPage() {
  await requireAdmin();
  const supabase = await createClient();

  let media: Array<{
    id: string;
    filename: string;
    original_name: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    folder: string;
    created_at: string;
    alt_text: string;
  }> = [];

  try {
    const { data } = await supabase
      .from("media_library")
      .select("*")
      .order("created_at", { ascending: false });
    media = data || [];
  } catch {
    // table peut ne pas exister
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Médiathèque</h1>
        <p className="text-sm text-[#6B6B6B] mt-1">
          Gérez tous vos fichiers médias.
        </p>
      </div>

      <MediaLibrary initialMedia={media} />
    </div>
  );
}
