-- =============================================================================
-- CLIPFORGE: INITIAL SCHEMA
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'name'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── PROJECTS ────────────────────────────────────────────────────────────────
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" 
  ON projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" 
  ON projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  USING (auth.uid() = user_id);

-- ─── VIDEO SOURCES ───────────────────────────────────────────────────────────
CREATE TABLE video_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'upload' or 'youtube'
  original_url TEXT,
  storage_path TEXT,
  filename TEXT,
  mime_type TEXT,
  file_size_mb NUMERIC,
  duration NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE video_sources ENABLE ROW LEVEL SECURITY;

-- Note: We join on projects to verify ownership
CREATE POLICY "Users can view own video sources" 
  ON video_sources FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = video_sources.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own video sources" 
  ON video_sources FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = video_sources.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own video sources" 
  ON video_sources FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = video_sources.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own video sources" 
  ON video_sources FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = video_sources.project_id AND projects.user_id = auth.uid()
  ));

-- ─── STORAGE BUCKET POLICIES (Conceptual, applied to storage.objects) ────────
-- The 'videos' bucket should be created in the Supabase Dashboard.
-- RLS policies for storage:
-- SELECT: (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1])
-- INSERT: (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1])
-- DELETE: (bucket_id = 'videos' AND auth.uid()::text = (storage.foldername(name))[1])
-- ─── INDEXES ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_video_sources_project_id ON video_sources(project_id);

-- ─── UPDATE TRIGGERS ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_video_sources_updated_at
    BEFORE UPDATE ON video_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();