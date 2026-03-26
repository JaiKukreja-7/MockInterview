-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- users table
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  target_role TEXT,
  college TEXT,
  streak_count INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- interviews table
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) NOT NULL,
  type TEXT NOT NULL,
  role TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  total_questions INTEGER NOT NULL,
  total_score INTEGER DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  interview_id UUID REFERENCES interviews(id) NOT NULL,
  question_text TEXT NOT NULL,
  user_answer TEXT,
  ai_feedback JSONB,
  score INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL
);

-- RLS setup
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- users RLS
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- interviews RLS
CREATE POLICY "Users can view their own interviews" ON interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interviews" ON interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interviews" ON interviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interviews" ON interviews FOR DELETE USING (auth.uid() = user_id);

-- questions RLS
CREATE POLICY "Users can view questions for their interviews" ON questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM interviews WHERE id = questions.interview_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert questions for their interviews" ON questions FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM interviews WHERE id = questions.interview_id AND user_id = auth.uid())
);
CREATE POLICY "Users can update questions for their interviews" ON questions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM interviews WHERE id = questions.interview_id AND user_id = auth.uid())
);
