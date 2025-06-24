-- コメントテーブルの作成
CREATE TABLE IF NOT EXISTS article_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES article_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_edited BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- インデックス
    CONSTRAINT article_comments_content_check CHECK (char_length(content) >= 1 AND char_length(content) <= 1000)
);

-- インデックスの作成
CREATE INDEX idx_article_comments_article_id ON article_comments(article_id);
CREATE INDEX idx_article_comments_user_id ON article_comments(user_id);
CREATE INDEX idx_article_comments_parent_id ON article_comments(parent_id);
CREATE INDEX idx_article_comments_created_at ON article_comments(created_at DESC);

-- コメント用のユーザープロフィールビューを作成
CREATE OR REPLACE VIEW comment_users AS
SELECT 
    u.id,
    COALESCE(w.name, u.email) as display_name,
    w.avatar_url,
    w.is_verified,
    CASE 
        WHEN w.id IS NOT NULL THEN 'writer'
        ELSE 'reader'
    END as user_type
FROM auth.users u
LEFT JOIN writers w ON w.auth_id = u.id;

-- RLSポリシーの設定
ALTER TABLE article_comments ENABLE ROW LEVEL SECURITY;

-- 誰でもコメントを読むことができる
CREATE POLICY "Comments are viewable by everyone" ON article_comments
    FOR SELECT USING (true);

-- ログインユーザーはコメントを投稿できる
CREATE POLICY "Authenticated users can insert comments" ON article_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のコメントを更新できる
CREATE POLICY "Users can update own comments" ON article_comments
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のコメントを削除できる
CREATE POLICY "Users can delete own comments" ON article_comments
    FOR DELETE USING (auth.uid() = user_id);

-- 更新時のタイムスタンプ自動更新用トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.is_edited = TRUE;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_article_comments_updated_at BEFORE UPDATE ON article_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();