-- インタビューセッション用テーブル
CREATE TABLE interview_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  messages JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS (Row Level Security) 設定
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own interview sessions" ON interview_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview sessions" ON interview_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions" ON interview_sessions
  FOR UPDATE USING (auth.uid() = user_id);