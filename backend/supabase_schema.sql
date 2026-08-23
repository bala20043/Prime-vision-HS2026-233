-- ==========================================
-- Supabase Database Schema — CollegeAI
-- ==========================================

-- 1. Create public.users table for Supabase Table Editor
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NULL,
    auth_provider TEXT NOT NULL DEFAULT 'email',
    provider_user_id TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login TIMESTAMPTZ NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Allow public read and write" ON public.users;

CREATE POLICY "Allow public read and write" 
ON public.users 
FOR ALL 
TO anon, authenticated, service_role
USING (true)
WITH CHECK (true);

-- 4. Automatic Trigger: Sync Supabase Auth (auth.users) -> Supabase Table Editor (public.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, auth_provider, created_at)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Student User'),
    new.email,
    COALESCE(new.raw_app_meta_data->>'provider', 'email'),
    now()
  )
  ON CONFLICT (email) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
