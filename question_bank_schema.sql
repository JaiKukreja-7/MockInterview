-- ============================================================
-- QUESTION BANK SCHEMA
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. company_questions — the main question bank
CREATE TABLE IF NOT EXISTS company_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company TEXT NOT NULL,
  company_logo_url TEXT,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  category TEXT NOT NULL CHECK (category IN ('DSA', 'System Design', 'HR', 'Frontend', 'Backend')),
  topic TEXT NOT NULL,
  question_text TEXT NOT NULL,
  expected_answer TEXT NOT NULL,
  hints JSONB NOT NULL DEFAULT '[]'::jsonb,
  frequency TEXT NOT NULL CHECK (frequency IN ('Very Common', 'Common', 'Rare')),
  last_seen TEXT DEFAULT 'Jan 2025',
  upvotes INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. user_question_attempts — tracks practice attempts
CREATE TABLE IF NOT EXISTS user_question_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  question_id UUID REFERENCES company_questions(id) NOT NULL,
  user_answer TEXT,
  ai_score INTEGER DEFAULT 0,
  ai_feedback JSONB,
  hints_used INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. user_bookmarks
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  question_id UUID REFERENCES company_questions(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 4. question_upvotes
CREATE TABLE IF NOT EXISTS question_upvotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  question_id UUID REFERENCES company_questions(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- company_questions: publicly readable, no user writes
ALTER TABLE company_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read company questions" ON company_questions FOR SELECT USING (true);

-- user_question_attempts: users own their rows
ALTER TABLE user_question_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own attempts" ON user_question_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own attempts" ON user_question_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON user_question_attempts FOR UPDATE USING (auth.uid() = user_id);

-- user_bookmarks: users own their rows
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON user_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bookmarks" ON user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own bookmarks" ON user_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- question_upvotes: users own their rows
ALTER TABLE question_upvotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own upvotes" ON question_upvotes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own upvotes" ON question_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own upvotes" ON question_upvotes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_cq_company ON company_questions (company);
CREATE INDEX IF NOT EXISTS idx_cq_difficulty ON company_questions (difficulty);
CREATE INDEX IF NOT EXISTS idx_cq_category ON company_questions (category);
CREATE INDEX IF NOT EXISTS idx_cq_topic ON company_questions (topic);
CREATE INDEX IF NOT EXISTS idx_uqa_user ON user_question_attempts (user_id);
CREATE INDEX IF NOT EXISTS idx_uqa_question ON user_question_attempts (question_id);
CREATE INDEX IF NOT EXISTS idx_ub_user ON user_bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_qu_user ON question_upvotes (user_id);
