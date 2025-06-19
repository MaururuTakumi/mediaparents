-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Writers table (学生ライターの情報)
CREATE TABLE writers (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  name TEXT NOT NULL,
  university TEXT NOT NULL,
  faculty TEXT NOT NULL,
  grade INT NOT NULL,
  profile_image_url TEXT,
  introduction TEXT,
  tags TEXT[], -- 特徴タグ (例: {"中学受験経験者", "理系"})
  is_certified BOOLEAN DEFAULT FALSE, -- Oyakology認定メンターか
  is_available_for_interview BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Article format enum
CREATE TYPE article_format AS ENUM ('text', 'video', 'audio');

-- Articles table
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  body TEXT, -- `format`が'text'の場合に利用
  media_url TEXT, -- `format`が'video'や'audio'の場合に利用
  format article_format DEFAULT 'text',
  main_image_url TEXT,
  author_id uuid NOT NULL REFERENCES writers(id),
  is_premium BOOLEAN DEFAULT FALSE, -- 有料会員限定か
  status TEXT DEFAULT 'draft', -- 'published' or 'draft'
  tags TEXT[],
  pv_count INT DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seminars table (オンライン座談会)
CREATE TABLE seminars (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  host_writer_id uuid NOT NULL REFERENCES writers(id),
  start_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  price INT NOT NULL, -- 0の場合は無料
  capacity INT NOT NULL,
  zoom_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Interviews table
CREATE TABLE interviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  writer_id uuid NOT NULL REFERENCES writers(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  duration_minutes INT DEFAULT 60,
  price INT DEFAULT 5000,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed'
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  plan_type TEXT NOT NULL, -- 'monthly' or 'annual'
  price INT NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'cancelled', 'expired'
  stripe_subscription_id TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seminar participants table
CREATE TABLE seminar_participants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  seminar_id uuid NOT NULL REFERENCES seminars(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'refunded'
  stripe_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(seminar_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_is_premium ON articles(is_premium);
CREATE INDEX idx_seminars_host_writer_id ON seminars(host_writer_id);
CREATE INDEX idx_seminars_start_at ON seminars(start_at);
CREATE INDEX idx_interviews_writer_id ON interviews(writer_id);
CREATE INDEX idx_interviews_user_id ON interviews(user_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_seminar_participants_seminar_id ON seminar_participants(seminar_id);
CREATE INDEX idx_seminar_participants_user_id ON seminar_participants(user_id);