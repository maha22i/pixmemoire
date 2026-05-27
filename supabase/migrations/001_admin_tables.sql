-- ============================================================
-- Migration COMPLÈTE : PixMémoire
-- Crée TOUTES les tables (publiques + admin), fonctions,
-- politiques RLS, index et bucket Storage.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- 1. TABLES PUBLIQUES (le site public en dépend)
-- ════════════════════════════════════════════════════════════

-- ── personalities ──

CREATE TABLE IF NOT EXISTS public.personalities (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  full_name       text NOT NULL,
  display_name    text NOT NULL,
  title           text NOT NULL,
  birth_date      date,
  death_date      date,
  birth_place     text DEFAULT '',
  origin_region   text NOT NULL CHECK (origin_region IN (
    'djibouti-ville','tadjourah','dikhil','ali-sabieh','obock','arta'
  )),
  gender          text NOT NULL CHECK (gender IN ('M','F')),
  era             text NOT NULL CHECK (era IN (
    'pre_independence','post_independence','contemporary'
  )),
  is_alive        boolean DEFAULT true,
  short_bio       text DEFAULT '',
  full_bio        text DEFAULT '',
  achievements    text DEFAULT '',
  famous_quote    text,
  main_photo_url  text DEFAULT '',
  gallery_urls    text[] DEFAULT '{}',
  video_urls      jsonb DEFAULT '[]',
  sources         jsonb DEFAULT '[]',
  featured        boolean DEFAULT false,
  views_count     integer DEFAULT 0,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('published','draft')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- ── categories ──

CREATE TABLE IF NOT EXISTS public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text DEFAULT '',
  icon        text DEFAULT '',
  color       text DEFAULT '#F5A623',
  "order"     integer DEFAULT 0
);

-- ── personality_categories (table de jonction) ──

CREATE TABLE IF NOT EXISTS public.personality_categories (
  personality_id  uuid NOT NULL REFERENCES public.personalities(id) ON DELETE CASCADE,
  category_id     uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (personality_id, category_id)
);

-- ── timeline_events ──

CREATE TABLE IF NOT EXISTS public.timeline_events (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_id  uuid NOT NULL REFERENCES public.personalities(id) ON DELETE CASCADE,
  event_date      text NOT NULL,
  title           text NOT NULL,
  description     text DEFAULT '',
  "order"         integer DEFAULT 0
);

-- ── related_personalities ──

CREATE TABLE IF NOT EXISTS public.related_personalities (
  personality_id  uuid NOT NULL REFERENCES public.personalities(id) ON DELETE CASCADE,
  related_id      uuid NOT NULL REFERENCES public.personalities(id) ON DELETE CASCADE,
  relation_type   text NOT NULL CHECK (relation_type IN (
    'contemporain','collaborateur','famille','mentor','successeur'
  )),
  PRIMARY KEY (personality_id, related_id)
);

-- ── suggestions ──

CREATE TABLE IF NOT EXISTS public.suggestions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text NOT NULL CHECK (type IN ('new_personality','correction')),
  personality_id  uuid REFERENCES public.personalities(id) ON DELETE SET NULL,
  submitter_name  text NOT NULL,
  submitter_email text NOT NULL,
  message         text NOT NULL,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','reviewed','accepted','rejected'
  )),
  created_at      timestamptz DEFAULT now()
);

-- ── page_views ──

CREATE TABLE IF NOT EXISTS public.page_views (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  personality_id  uuid NOT NULL REFERENCES public.personalities(id) ON DELETE CASCADE,
  viewed_at       timestamptz DEFAULT now(),
  user_agent      text DEFAULT '',
  referrer        text DEFAULT ''
);


-- ════════════════════════════════════════════════════════════
-- 2. TABLES ADMIN
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.admin_users (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text UNIQUE NOT NULL,
  full_name   text NOT NULL,
  role        text NOT NULL CHECK (role IN ('super_admin', 'editor', 'contributor')),
  avatar_url  text,
  is_active   boolean DEFAULT true,
  last_login  timestamptz,
  created_at  timestamptz DEFAULT now(),
  created_by  uuid REFERENCES public.admin_users(id)
);

COMMENT ON TABLE public.admin_users IS 'Utilisateurs administrateurs de PixMémoire';

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid NOT NULL REFERENCES public.admin_users(id),
  action      text NOT NULL CHECK (action IN ('create', 'update', 'delete', 'publish', 'login')),
  entity_type text NOT NULL CHECK (entity_type IN ('personality', 'category', 'user', 'suggestion', 'media')),
  entity_id   uuid,
  details     jsonb DEFAULT '{}',
  ip_address  text,
  created_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.activity_logs IS 'Journal d''audit des actions administrateurs';

CREATE TABLE IF NOT EXISTS public.media_library (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename      text NOT NULL,
  original_name text NOT NULL,
  file_url      text NOT NULL,
  file_size     integer NOT NULL,
  mime_type     text NOT NULL,
  width         integer,
  height        integer,
  alt_text      text DEFAULT '',
  uploaded_by   uuid REFERENCES public.admin_users(id),
  folder        text DEFAULT 'general' CHECK (folder IN ('portraits', 'gallery', 'documents', 'general')),
  tags          text[] DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

COMMENT ON TABLE public.media_library IS 'Bibliothèque de médias uploadés';


-- ════════════════════════════════════════════════════════════
-- 3. FONCTIONS UTILITAIRES
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid() AND is_active = true AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_editor_or_above()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
      AND is_active = true
      AND role IN ('super_admin', 'editor')
  );
$$;


-- ════════════════════════════════════════════════════════════
-- 4. ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════

-- ── personalities ──

ALTER TABLE public.personalities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "personalities_public_read"
  ON public.personalities FOR SELECT
  TO anon, authenticated
  USING (status = 'published' OR is_admin());

CREATE POLICY "personalities_admin_insert"
  ON public.personalities FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "personalities_admin_update"
  ON public.personalities FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "personalities_admin_delete"
  ON public.personalities FOR DELETE
  TO authenticated
  USING (is_editor_or_above());

-- ── categories ──

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "categories_public_read"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "categories_admin_insert"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (is_editor_or_above());

CREATE POLICY "categories_admin_update"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (is_editor_or_above());

CREATE POLICY "categories_admin_delete"
  ON public.categories FOR DELETE
  TO authenticated
  USING (is_editor_or_above());

-- ── personality_categories ──

ALTER TABLE public.personality_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pc_public_read"
  ON public.personality_categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "pc_admin_write"
  ON public.personality_categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "pc_admin_delete"
  ON public.personality_categories FOR DELETE
  TO authenticated
  USING (is_admin());

-- ── timeline_events ──

ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_public_read"
  ON public.timeline_events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "timeline_admin_write"
  ON public.timeline_events FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "timeline_admin_update"
  ON public.timeline_events FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "timeline_admin_delete"
  ON public.timeline_events FOR DELETE
  TO authenticated
  USING (is_admin());

-- ── related_personalities ──

ALTER TABLE public.related_personalities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "related_public_read"
  ON public.related_personalities FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "related_admin_write"
  ON public.related_personalities FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "related_admin_delete"
  ON public.related_personalities FOR DELETE
  TO authenticated
  USING (is_admin());

-- ── suggestions ──

ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "suggestions_public_insert"
  ON public.suggestions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "suggestions_admin_read"
  ON public.suggestions FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "suggestions_admin_update"
  ON public.suggestions FOR UPDATE
  TO authenticated
  USING (is_admin());

CREATE POLICY "suggestions_admin_delete"
  ON public.suggestions FOR DELETE
  TO authenticated
  USING (is_editor_or_above());

-- ── page_views ──

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_views_public_insert"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "page_views_admin_read"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (is_admin());

-- ── admin_users ──

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_users_select"
  ON public.admin_users FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "admin_users_insert"
  ON public.admin_users FOR INSERT
  TO authenticated
  WITH CHECK (is_super_admin());

CREATE POLICY "admin_users_update"
  ON public.admin_users FOR UPDATE
  TO authenticated
  USING (is_super_admin());

CREATE POLICY "admin_users_delete"
  ON public.admin_users FOR DELETE
  TO authenticated
  USING (is_super_admin());

-- ── activity_logs ──

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_logs_select"
  ON public.activity_logs FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "activity_logs_insert"
  ON public.activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

-- ── media_library ──

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "media_library_select"
  ON public.media_library FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "media_library_insert"
  ON public.media_library FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "media_library_update"
  ON public.media_library FOR UPDATE
  TO authenticated
  USING (is_editor_or_above());

CREATE POLICY "media_library_delete"
  ON public.media_library FOR DELETE
  TO authenticated
  USING (is_editor_or_above());


-- ════════════════════════════════════════════════════════════
-- 5. INDEX
-- ════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_personalities_slug ON public.personalities(slug);
CREATE INDEX IF NOT EXISTS idx_personalities_status ON public.personalities(status);
CREATE INDEX IF NOT EXISTS idx_personalities_featured ON public.personalities(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_timeline_personality ON public.timeline_events(personality_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON public.suggestions(status);
CREATE INDEX IF NOT EXISTS idx_page_views_personality ON public.page_views(personality_id);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON public.page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_date ON public.activity_logs(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON public.media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON public.media_library(uploaded_by);


-- ════════════════════════════════════════════════════════════
-- 6. BUCKET STORAGE
-- ════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'media');

CREATE POLICY "media_admin_upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media' AND is_admin());

CREATE POLICY "media_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'media' AND is_admin());
