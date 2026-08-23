-- ==========================================
-- Supabase Database Schema — CollegeAI
-- Copy & Run this script in your Supabase SQL Editor
-- ==========================================

-- 1. Create public.users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NULL,
    auth_provider TEXT NOT NULL DEFAULT 'email',
    provider_user_id TEXT NULL,
    role TEXT NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_login TIMESTAMPTZ NULL
);

-- 2. Create public.knowledge_items table (Dataset & Questions)
CREATE TABLE IF NOT EXISTS public.knowledge_items (
    id BIGSERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    source TEXT NOT NULL DEFAULT 'College Knowledge Base',
    language TEXT NOT NULL DEFAULT 'en',
    active BOOLEAN NOT NULL DEFAULT true,
    dataset_version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create public.question_variations table
CREATE TABLE IF NOT EXISTS public.question_variations (
    id BIGSERIAL PRIMARY KEY,
    knowledge_item_id BIGINT REFERENCES public.knowledge_items(id) ON DELETE CASCADE,
    variation TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create public.dataset_versions table
CREATE TABLE IF NOT EXISTS public.dataset_versions (
    id BIGSERIAL PRIMARY KEY,
    version_name TEXT NOT NULL,
    filename TEXT NOT NULL,
    uploaded_by TEXT NOT NULL DEFAULT 'admin',
    total_rows INT NOT NULL,
    valid_rows INT NOT NULL,
    invalid_rows INT NOT NULL,
    duplicate_rows INT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    activated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create public.conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT 'New Conversation',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create public.messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT REFERENCES public.conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    answer_type TEXT NOT NULL DEFAULT 'known',
    knowledge_item_id BIGINT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dataset_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 8. Permissive RLS Policies for Anon & Authenticated access
DROP POLICY IF EXISTS "Public access users" ON public.users;
CREATE POLICY "Public access users" ON public.users FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access knowledge_items" ON public.knowledge_items;
CREATE POLICY "Public access knowledge_items" ON public.knowledge_items FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access question_variations" ON public.question_variations;
CREATE POLICY "Public access question_variations" ON public.question_variations FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access dataset_versions" ON public.dataset_versions;
CREATE POLICY "Public access dataset_versions" ON public.dataset_versions FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access conversations" ON public.conversations;
CREATE POLICY "Public access conversations" ON public.conversations FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access messages" ON public.messages;
CREATE POLICY "Public access messages" ON public.messages FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- 9. Automatic Trigger: Sync Supabase Auth (auth.users) -> Supabase Table Editor (public.users)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, name, email, auth_provider, created_at)
  VALUES (
    new.id::text,
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
