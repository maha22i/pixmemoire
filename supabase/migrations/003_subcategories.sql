-- ============================================================
-- Migration : Sous-catégories
-- Hiérarchie catégorie → sous-catégorie, liaison personnalités,
-- ordre d'affichage et mise en avant sur l'accueil.
-- ============================================================

-- ── subcategories ──

CREATE TABLE IF NOT EXISTS public.subcategories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  slug        text NOT NULL,
  name        text NOT NULL,
  description text DEFAULT '',
  icon        text DEFAULT '',
  color       text DEFAULT '',
  "order"     integer DEFAULT 0,
  featured    boolean DEFAULT false,
  UNIQUE (category_id, slug)
);

-- ── personality_subcategories (jonction avec ordre) ──

CREATE TABLE IF NOT EXISTS public.personality_subcategories (
  personality_id  uuid NOT NULL REFERENCES public.personalities(id) ON DELETE CASCADE,
  subcategory_id  uuid NOT NULL REFERENCES public.subcategories(id) ON DELETE CASCADE,
  "order"         integer DEFAULT 0,
  PRIMARY KEY (personality_id, subcategory_id)
);

-- Politique UPDATE manquante sur personality_categories

CREATE POLICY "pc_admin_update"
  ON public.personality_categories FOR UPDATE
  TO authenticated
  USING (is_admin());

-- ── subcategories RLS ──

ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subcategories_public_read"
  ON public.subcategories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "subcategories_admin_insert"
  ON public.subcategories FOR INSERT
  TO authenticated
  WITH CHECK (is_editor_or_above());

CREATE POLICY "subcategories_admin_update"
  ON public.subcategories FOR UPDATE
  TO authenticated
  USING (is_editor_or_above());

CREATE POLICY "subcategories_admin_delete"
  ON public.subcategories FOR DELETE
  TO authenticated
  USING (is_editor_or_above());

-- ── personality_subcategories RLS ──

ALTER TABLE public.personality_subcategories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "psc_public_read"
  ON public.personality_subcategories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "psc_admin_insert"
  ON public.personality_subcategories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "psc_admin_update"
  ON public.personality_subcategories FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "psc_admin_delete"
  ON public.personality_subcategories FOR DELETE
  TO authenticated
  USING (is_admin());

-- ── Index ──

CREATE INDEX IF NOT EXISTS idx_subcategories_category ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON public.subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_featured ON public.subcategories(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_psc_subcategory ON public.personality_subcategories(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_psc_personality ON public.personality_subcategories(personality_id);
