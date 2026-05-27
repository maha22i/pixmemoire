-- ============================================================
-- Migration : PixAI Generator
-- Tables pour le générateur IA de personnalités
-- ============================================================

-- ════════════════════════════════════════════════════════════
-- 1. TABLE ai_generations (historique des générations IA)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ai_generations (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        uuid REFERENCES public.admin_users(id),
  personality_id  uuid REFERENCES public.personalities(id) ON DELETE SET NULL,
  prompt_input    jsonb NOT NULL,
  raw_output      jsonb,
  status          text DEFAULT 'pending'
    CHECK (status IN ('pending','success','error','validated','rejected')),
  model_used      text,
  tokens_used     integer,
  cost_estimate   decimal(10,4),
  generation_time integer,
  error_message   text,
  validated_at    timestamptz,
  validated_by    uuid REFERENCES public.admin_users(id),
  created_at      timestamptz DEFAULT now()
);

COMMENT ON TABLE public.ai_generations IS 'Historique des générations IA de fiches personnalités';

-- ════════════════════════════════════════════════════════════
-- 2. TABLE ai_generation_queue (file d''attente batch)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ai_generation_queue (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id          uuid NOT NULL,
  admin_id          uuid REFERENCES public.admin_users(id),
  personality_name  text NOT NULL,
  category_slug     text,
  era               text DEFAULT 'contemporary',
  additional_notes  text,
  status            text DEFAULT 'pending'
    CHECK (status IN ('pending','processing','done','failed')),
  result_id         uuid REFERENCES public.ai_generations(id),
  error_message     text,
  created_at        timestamptz DEFAULT now(),
  processed_at      timestamptz
);

COMMENT ON TABLE public.ai_generation_queue IS 'File d''attente pour les générations en lot';

-- ════════════════════════════════════════════════════════════
-- 3. COLONNES IA sur personalities
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.personalities
  ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_generation_id uuid REFERENCES public.ai_generations(id),
  ADD COLUMN IF NOT EXISTS needs_human_review boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'unverified'
    CHECK (verification_status IN ('unverified','in_review','verified','flagged'));

-- ════════════════════════════════════════════════════════════
-- 4. TABLE ai_settings (paramètres IA par installation)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.ai_settings (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  default_model         text DEFAULT 'claude-sonnet-4-6',
  monthly_budget_usd    decimal(10,2) DEFAULT 100.00,
  per_user_budget_usd   decimal(10,2) DEFAULT 20.00,
  daily_limit_per_user  integer DEFAULT 50,
  hourly_limit_per_user integer DEFAULT 10,
  is_enabled            boolean DEFAULT true,
  system_prompt_override text,
  updated_at            timestamptz DEFAULT now(),
  updated_by            uuid REFERENCES public.admin_users(id)
);

COMMENT ON TABLE public.ai_settings IS 'Paramètres globaux du générateur IA';

INSERT INTO public.ai_settings (default_model) VALUES ('claude-sonnet-4-6')
ON CONFLICT DO NOTHING;

-- ════════════════════════════════════════════════════════════
-- 5. RLS
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_generations_select"
  ON public.ai_generations FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "ai_generations_insert"
  ON public.ai_generations FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "ai_generations_update"
  ON public.ai_generations FOR UPDATE
  TO authenticated
  USING (is_admin());

ALTER TABLE public.ai_generation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_queue_select"
  ON public.ai_generation_queue FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "ai_queue_insert"
  ON public.ai_generation_queue FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "ai_queue_update"
  ON public.ai_generation_queue FOR UPDATE
  TO authenticated
  USING (is_admin());

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_settings_select"
  ON public.ai_settings FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "ai_settings_update"
  ON public.ai_settings FOR UPDATE
  TO authenticated
  USING (is_super_admin());

-- ════════════════════════════════════════════════════════════
-- 6. INDEX
-- ════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_ai_generations_admin
  ON public.ai_generations(admin_id);
CREATE INDEX IF NOT EXISTS idx_ai_generations_status
  ON public.ai_generations(status);
CREATE INDEX IF NOT EXISTS idx_ai_generations_created
  ON public.ai_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_queue_batch
  ON public.ai_generation_queue(batch_id);
CREATE INDEX IF NOT EXISTS idx_ai_queue_status
  ON public.ai_generation_queue(status);
CREATE INDEX IF NOT EXISTS idx_personalities_ai_generated
  ON public.personalities(ai_generated) WHERE ai_generated = true;
