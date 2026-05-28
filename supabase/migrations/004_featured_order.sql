-- Ordre d'affichage des personnalités « À la une » sur l'accueil
ALTER TABLE public.personalities
  ADD COLUMN IF NOT EXISTS featured_order integer DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_personalities_featured_order
  ON public.personalities(featured_order)
  WHERE featured = true;
