-- データベーススキーマを最新のREQUIREMENTS.mdに合わせて更新

-- 既存のテーブルをドロップ（開発環境のため）
DROP TABLE IF EXISTS seminar_participants CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS seminars CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS writers CASCADE;

-- enum型を削除
DROP TYPE IF EXISTS article_format CASCADE;
DROP TYPE IF EXISTS verification_status CASCADE;
DROP TYPE IF EXISTS article_status CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;

-- UUID拡張を有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE article_format AS ENUM ('text', 'video', 'audio');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due');

-- ライター情報テーブル
CREATE TABLE writers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    university VARCHAR(100) NOT NULL,
    faculty VARCHAR(100),
    grade INTEGER CHECK (grade >= 1 AND grade <= 6),
    bio TEXT,
    avatar_url TEXT,
    verification_status verification_status DEFAULT 'pending',
    verification_document_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 記事テーブル
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    writer_id UUID REFERENCES writers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    format article_format DEFAULT 'text',
    status article_status DEFAULT 'draft',
    is_premium BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    tags TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インタビューセッションテーブル
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    writer_id UUID REFERENCES writers(id) ON DELETE CASCADE,
    title VARCHAR(200),
    conversation_log JSONB NOT NULL,
    ai_summary TEXT,
    generated_article_id UUID REFERENCES articles(id),
    session_duration INTEGER, -- 分単位
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 座談会テーブル
CREATE TABLE seminars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    host_writer_id UUID REFERENCES writers(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_participants INTEGER DEFAULT 20,
    price DECIMAL(8,2) DEFAULT 0,
    meeting_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サブスクリプションテーブル
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(200) UNIQUE,
    status subscription_status DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    plan_price DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 座談会参加者テーブル
CREATE TABLE seminar_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seminar_id UUID REFERENCES seminars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(seminar_id, user_id)
);

-- インデックス作成
CREATE INDEX idx_articles_writer_id ON articles(writer_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_is_premium ON articles(is_premium);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_interviews_writer_id ON interviews(writer_id);
CREATE INDEX idx_seminars_scheduled_at ON seminars(scheduled_at);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Row Level Security (RLS) 設定
ALTER TABLE writers ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_participants ENABLE ROW LEVEL SECURITY;

-- Writers テーブルポリシー
CREATE POLICY "Writers can view all profiles" ON writers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Writers can update own profile" ON writers
    FOR UPDATE TO authenticated USING (auth_id = auth.uid());

CREATE POLICY "Writers can insert own profile" ON writers
    FOR INSERT TO authenticated WITH CHECK (auth_id = auth.uid());

-- Articles テーブルポリシー
CREATE POLICY "Published articles are viewable by everyone" ON articles
    FOR SELECT USING (status = 'published');

CREATE POLICY "Writers can view own articles" ON articles
    FOR SELECT TO authenticated USING (writer_id IN (
        SELECT id FROM writers WHERE auth_id = auth.uid()
    ));

CREATE POLICY "Writers can manage own articles" ON articles
    FOR ALL TO authenticated USING (writer_id IN (
        SELECT id FROM writers WHERE auth_id = auth.uid()
    ));

-- Premium content access control
CREATE POLICY "Premium articles require subscription" ON articles
    FOR SELECT USING (
        status = 'published' AND (
            NOT is_premium OR 
            auth.uid() IN (
                SELECT user_id FROM subscriptions 
                WHERE status = 'active' 
                AND current_period_end > NOW()
            )
        )
    );

-- Interviews テーブルポリシー
CREATE POLICY "Writers can view own interviews" ON interviews
    FOR SELECT TO authenticated USING (writer_id IN (
        SELECT id FROM writers WHERE auth_id = auth.uid()
    ));

CREATE POLICY "Writers can manage own interviews" ON interviews
    FOR ALL TO authenticated USING (writer_id IN (
        SELECT id FROM writers WHERE auth_id = auth.uid()
    ));

-- Seminars テーブルポリシー
CREATE POLICY "Everyone can view active seminars" ON seminars
    FOR SELECT USING (is_active = true);

CREATE POLICY "Writers can manage own seminars" ON seminars
    FOR ALL TO authenticated USING (host_writer_id IN (
        SELECT id FROM writers WHERE auth_id = auth.uid()
    ));

-- Subscriptions テーブルポリシー
CREATE POLICY "Users can view own subscriptions" ON subscriptions
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can manage own subscriptions" ON subscriptions
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- Seminar participants テーブルポリシー
CREATE POLICY "Users can view own participation" ON seminar_participants
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can manage own participation" ON seminar_participants
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- テスト用データの挿入
INSERT INTO writers (auth_id, name, university, faculty, grade, bio) VALUES
    ('00000000-0000-0000-0000-000000000001', '田中太郎', '東京大学', '工学部', 3, '理系学生として親との関係性について語ります'),
    ('00000000-0000-0000-0000-000000000002', '佐藤花子', '慶應義塾大学', '文学部', 2, '文系の視点から家族関係を考察します');

INSERT INTO articles (writer_id, title, content, excerpt, status, is_premium, published_at) VALUES
    ((SELECT id FROM writers WHERE name = '田中太郎'), 
     '理系学生が語る：親との進路相談で大切なこと', 
     '私は工学部の3年生として、これまで親と多くの進路相談を重ねてきました...', 
     '理系学生の視点から親との進路相談について',
     'published', 
     false, 
     NOW()),
    ((SELECT id FROM writers WHERE name = '佐藤花子'), 
     'プレミアム記事：文系学生の就活体験談', 
     '文学部の学生として、就職活動で親からどのようなサポートを受けたかお話しします...', 
     '文系学生の就活における親のサポート',
     'published', 
     true, 
     NOW());