-- 無料会員のプレミアム記事アクセス履歴テーブル
CREATE TABLE IF NOT EXISTS premium_article_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 同じ記事を何度も読んでもカウントしないようにするためのユニーク制約
    UNIQUE(user_id, article_id)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_premium_article_views_user_id ON premium_article_views(user_id);
CREATE INDEX IF NOT EXISTS idx_premium_article_views_viewed_at ON premium_article_views(viewed_at DESC);

-- サイト設定に無料プレミアム記事の上限を追加
INSERT INTO site_settings (key, value) VALUES
    ('free_premium_articles_monthly_limit', '3'),
    ('free_premium_articles_period_type', 'monthly') -- 'monthly' または 'rolling_30_days'
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- RLSポリシー
ALTER TABLE premium_article_views ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の閲覧履歴のみ参照可能
CREATE POLICY "Users can view own premium article views" ON premium_article_views
    FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の閲覧履歴を作成可能
CREATE POLICY "Users can insert own premium article views" ON premium_article_views
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- プレミアム記事の月間無料閲覧数をカウントする関数
CREATE OR REPLACE FUNCTION get_user_premium_article_count(p_user_id UUID, p_period_type TEXT DEFAULT 'monthly')
RETURNS INTEGER AS $$
DECLARE
    article_count INTEGER;
    period_start TIMESTAMP WITH TIME ZONE;
BEGIN
    -- 期間の開始日を計算
    IF p_period_type = 'monthly' THEN
        -- 今月の1日から
        period_start := date_trunc('month', NOW());
    ELSE
        -- 30日前から
        period_start := NOW() - INTERVAL '30 days';
    END IF;
    
    -- カウントを取得
    SELECT COUNT(*)
    INTO article_count
    FROM premium_article_views
    WHERE user_id = p_user_id
    AND viewed_at >= period_start;
    
    RETURN article_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- プレミアム記事へのアクセス可否をチェックする関数
CREATE OR REPLACE FUNCTION can_access_premium_article(p_user_id UUID, p_article_id UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
    is_premium BOOLEAN;
    has_subscription BOOLEAN;
    current_count INTEGER;
    monthly_limit INTEGER;
    already_viewed BOOLEAN;
    period_type TEXT;
BEGIN
    -- 記事がプレミアムかチェック
    SELECT is_premium INTO is_premium
    FROM articles
    WHERE id = p_article_id;
    
    -- プレミアム記事でない場合は常にアクセス可能
    IF NOT is_premium OR is_premium IS NULL THEN
        RETURN jsonb_build_object(
            'can_access', true,
            'reason', 'not_premium_article'
        );
    END IF;
    
    -- サブスクリプションをチェック
    SELECT EXISTS(
        SELECT 1
        FROM subscriptions
        WHERE user_id = p_user_id
        AND status = 'active'
        AND current_period_end > NOW()
    ) INTO has_subscription;
    
    -- サブスクリプションがある場合は常にアクセス可能
    IF has_subscription THEN
        RETURN jsonb_build_object(
            'can_access', true,
            'reason', 'has_subscription'
        );
    END IF;
    
    -- サイト設定から上限と期間タイプを取得
    SELECT value INTO monthly_limit
    FROM site_settings
    WHERE key = 'free_premium_articles_monthly_limit';
    
    SELECT value INTO period_type
    FROM site_settings
    WHERE key = 'free_premium_articles_period_type';
    
    -- デフォルト値
    IF monthly_limit IS NULL THEN
        monthly_limit := 3;
    END IF;
    
    IF period_type IS NULL THEN
        period_type := 'monthly';
    END IF;
    
    -- すでにこの記事を閲覧したかチェック
    SELECT EXISTS(
        SELECT 1
        FROM premium_article_views
        WHERE user_id = p_user_id
        AND article_id = p_article_id
    ) INTO already_viewed;
    
    -- すでに閲覧済みの場合は再度アクセス可能
    IF already_viewed THEN
        RETURN jsonb_build_object(
            'can_access', true,
            'reason', 'already_viewed',
            'current_count', get_user_premium_article_count(p_user_id, period_type),
            'monthly_limit', monthly_limit
        );
    END IF;
    
    -- 現在の閲覧数を取得
    current_count := get_user_premium_article_count(p_user_id, period_type);
    
    -- 上限に達していないかチェック
    IF current_count < monthly_limit::INTEGER THEN
        RETURN jsonb_build_object(
            'can_access', true,
            'reason', 'within_free_limit',
            'current_count', current_count,
            'monthly_limit', monthly_limit,
            'remaining', monthly_limit::INTEGER - current_count
        );
    ELSE
        RETURN jsonb_build_object(
            'can_access', false,
            'reason', 'free_limit_exceeded',
            'current_count', current_count,
            'monthly_limit', monthly_limit
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- プレミアム記事の閲覧を記録する関数
CREATE OR REPLACE FUNCTION record_premium_article_view(p_user_id UUID, p_article_id UUID)
RETURNS VOID AS $$
BEGIN
    -- 閲覧履歴を記録（重複は無視）
    INSERT INTO premium_article_views (user_id, article_id)
    VALUES (p_user_id, p_article_id)
    ON CONFLICT (user_id, article_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;