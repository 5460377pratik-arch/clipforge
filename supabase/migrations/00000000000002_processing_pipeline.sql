-- =============================================================================
-- CLIPFORGE: PROCESSING PIPELINE SCHEMA
-- =============================================================================

-- ─── PROCESSING JOBS ─────────────────────────────────────────────────────────
CREATE TABLE processing_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'analysis', 'rendering'
  status TEXT NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed
  stage TEXT, -- preparing, transcribing, analyzing, generating_clips, rendering
  error_message TEXT,
  result_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own processing jobs" 
  ON processing_jobs FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = processing_jobs.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own processing jobs" 
  ON processing_jobs FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = processing_jobs.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own processing jobs" 
  ON processing_jobs FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = processing_jobs.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own processing jobs" 
  ON processing_jobs FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = processing_jobs.project_id AND projects.user_id = auth.uid()
  ));

-- ─── CLIPS ───────────────────────────────────────────────────────────────────
CREATE TABLE clips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES processing_jobs(id) ON DELETE SET NULL,
  title TEXT,
  storage_path TEXT,
  duration NUMERIC,
  start_time NUMERIC,
  end_time NUMERIC,
  aspect_ratio TEXT DEFAULT '9:16',
  score NUMERIC,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, rendering, ready, failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own clips" 
  ON clips FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = clips.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own clips" 
  ON clips FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = clips.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own clips" 
  ON clips FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = clips.project_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own clips" 
  ON clips FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM projects WHERE projects.id = clips.project_id AND projects.user_id = auth.uid()
  ));

-- ─── CAPTIONS ────────────────────────────────────────────────────────────────
CREATE TABLE captions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  start_time NUMERIC NOT NULL,
  end_time NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE captions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own captions" 
  ON captions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM clips JOIN projects ON clips.project_id = projects.id 
    WHERE clips.id = captions.clip_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own captions" 
  ON captions FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM clips JOIN projects ON clips.project_id = projects.id 
    WHERE clips.id = captions.clip_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own captions" 
  ON captions FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM clips JOIN projects ON clips.project_id = projects.id 
    WHERE clips.id = captions.clip_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own captions" 
  ON captions FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM clips JOIN projects ON clips.project_id = projects.id 
    WHERE clips.id = captions.clip_id AND projects.user_id = auth.uid()
  ));

-- ─── EXPORTS ─────────────────────────────────────────────────────────────────
CREATE TABLE exports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clip_id UUID REFERENCES clips(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT,
  platform TEXT, -- tiktok, shorts, reels
  status TEXT NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE exports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exports" 
  ON exports FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM clips JOIN projects ON clips.project_id = projects.id 
    WHERE clips.id = exports.clip_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own exports" 
  ON exports FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM clips JOIN projects ON clips.project_id = projects.id 
    WHERE clips.id = exports.clip_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own exports" 
  ON exports FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM clips JOIN projects ON clips.project_id = projects.id 
    WHERE clips.id = exports.clip_id AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own exports" 
  ON exports FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM clips JOIN projects ON clips.project_id = projects.id 
    WHERE clips.id = exports.clip_id AND projects.user_id = auth.uid()
  ));

-- ─── INDEXES & TRIGGERS ──────────────────────────────────────────────────────
CREATE INDEX idx_processing_jobs_project_id ON processing_jobs(project_id);
CREATE INDEX idx_clips_project_id ON clips(project_id);
CREATE INDEX idx_clips_job_id ON clips(job_id);
CREATE INDEX idx_captions_clip_id ON captions(clip_id);
CREATE INDEX idx_exports_clip_id ON exports(clip_id);

CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clips_updated_at BEFORE UPDATE ON clips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_captions_updated_at BEFORE UPDATE ON captions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exports_updated_at BEFORE UPDATE ON exports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();