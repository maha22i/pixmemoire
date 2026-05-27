-- ============================================================
-- Script : Création du premier Super Administrateur
-- ============================================================
--
-- ÉTAPES À SUIVRE :
--
-- 1. Allez dans le Dashboard Supabase de votre projet :
--    https://supabase.com/dashboard
--
-- 2. Naviguez vers : Authentication > Users
--
-- 3. Cliquez "Add user" > "Create new user"
--    - Email : mohamed@pixel-nomade.com
--    - Mot de passe : choisissez un mot de passe sécurisé
--    - Cochez "Auto Confirm User"
--
-- 4. Copiez l'UUID généré pour cet utilisateur
--
-- 5. Remplacez [UUID_DE_AUTH_USERS] ci-dessous par cet UUID
--
-- 6. Exécutez ce script dans : SQL Editor du Dashboard Supabase
-- ============================================================

INSERT INTO public.admin_users (id, email, full_name, role, is_active)
VALUES (
  '[UUID_DE_AUTH_USERS]',       -- ⬅️ Remplacer par l'UUID du compte auth.users
  'mohamed@pixel-nomade.com',
  'Mohamed Chehem',
  'super_admin',
  true
);

-- Vérification
SELECT id, email, full_name, role, is_active
FROM public.admin_users
WHERE email = 'mohamed@pixel-nomade.com';
