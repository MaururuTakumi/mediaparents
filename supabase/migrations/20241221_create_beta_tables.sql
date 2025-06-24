-- ベータ版リリースに必要なテーブルを作成

-- 1. セミナーテーブル（将来の拡張用）
CREATE TABLE IF NOT EXISTS seminars (
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

-- 2. セミナー参加者テーブル（将来の拡張用）
CREATE TABLE IF NOT EXISTS seminar_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seminar_id UUID REFERENCES seminars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(seminar_id, user_id)
);

-- 3. サブスクリプションテーブル（Stripe管理用）
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(200) UNIQUE,
    stripe_customer_id VARCHAR(200),
    status VARCHAR(50) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    plan_price DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 質問テーブル（有料会員が記事に対して質問できる機能）
CREATE TABLE IF NOT EXISTS article_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT,
    answered_at TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT article_questions_question_check CHECK (char_length(question) >= 10 AND char_length(question) <= 1000)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_seminars_scheduled_at ON seminars(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_seminars_host_writer_id ON seminars(host_writer_id);
CREATE INDEX IF NOT EXISTS idx_seminar_participants_seminar_id ON seminar_participants(seminar_id);
CREATE INDEX IF NOT EXISTS idx_seminar_participants_user_id ON seminar_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_article_questions_article_id ON article_questions(article_id);
CREATE INDEX IF NOT EXISTS idx_article_questions_user_id ON article_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_article_questions_created_at ON article_questions(created_at DESC);

-- RLSポリシーの設定

-- サブスクリプションテーブルのRLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
    USING (auth.jwt() ->> 'role' = 'service_role');

-- 質問テーブルのRLS
ALTER TABLE article_questions ENABLE ROW LEVEL SECURITY;

-- 公開された質問は誰でも見れる
CREATE POLICY "Public questions are viewable by everyone" ON article_questions
    FOR SELECT USING (is_public = true);

-- 質問者と記事作成者は非公開質問も見れる
CREATE POLICY "Question owners and article writers can view private questions" ON article_questions
    FOR SELECT USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT w.auth_id FROM writers w
            JOIN articles a ON a.writer_id = w.id
            WHERE a.id = article_questions.article_id
        )
    );

-- サブスクリプションがアクティブなユーザーのみ質問を投稿できる
CREATE POLICY "Active subscribers can post questions" ON article_questions
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM subscriptions s
            WHERE s.user_id = auth.uid()
            AND s.status = 'active'
            AND s.current_period_end > NOW()
        )
    );

-- 質問者は自分の質問を更新できる
CREATE POLICY "Users can update own questions" ON article_questions
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 質問者は自分の質問を削除できる
CREATE POLICY "Users can delete own questions" ON article_questions
    FOR DELETE USING (auth.uid() = user_id);

-- 記事作成者は質問に回答できる
CREATE POLICY "Article writers can answer questions" ON article_questions
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT w.auth_id FROM writers w
            JOIN articles a ON a.writer_id = w.id
            WHERE a.id = article_questions.article_id
        )
    );

-- セミナーテーブルのRLS
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view active seminars" ON seminars
    FOR SELECT USING (is_active = true);

CREATE POLICY "Writers can manage own seminars" ON seminars
    FOR ALL USING (
        host_writer_id IN (
            SELECT id FROM writers WHERE auth_id = auth.uid()
        )
    );

-- セミナー参加者テーブルのRLS
ALTER TABLE seminar_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own participations" ON seminar_participants
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Seminar hosts can view participants" ON seminar_participants
    FOR SELECT USING (
        seminar_id IN (
            SELECT s.id FROM seminars s
            JOIN writers w ON s.host_writer_id = w.id
            WHERE w.auth_id = auth.uid()
        )
    );

CREATE POLICY "Users can register for seminars" ON seminar_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own participation" ON seminar_participants
    FOR DELETE USING (auth.uid() = user_id);

-- 更新時のタイムスタンプ自動更新用トリガー
CREATE TRIGGER update_seminars_updated_at BEFORE UPDATE ON seminars
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_questions_updated_at BEFORE UPDATE ON article_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();