-- 大学認証・管理機能のためのテーブル

-- 1. 大学マスターテーブル
CREATE TABLE IF NOT EXISTS universities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    email_domain VARCHAR(100) NOT NULL UNIQUE, -- 例: u-tokyo.ac.jp
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期データ投入（主要大学）
INSERT INTO universities (name, email_domain) VALUES
    ('東京大学', 'u-tokyo.ac.jp'),
    ('京都大学', 'kyoto-u.ac.jp'),
    ('大阪大学', 'osaka-u.ac.jp'),
    ('東北大学', 'tohoku.ac.jp'),
    ('名古屋大学', 'nagoya-u.jp'),
    ('北海道大学', 'hokudai.ac.jp'),
    ('九州大学', 'kyushu-u.ac.jp'),
    ('東京工業大学', 'titech.ac.jp'),
    ('一橋大学', 'hit-u.ac.jp'),
    ('筑波大学', 'tsukuba.ac.jp'),
    ('早稲田大学', 'waseda.jp'),
    ('慶應義塾大学', 'keio.jp'),
    ('上智大学', 'sophia.ac.jp'),
    ('明治大学', 'meiji.ac.jp'),
    ('青山学院大学', 'aoyama.ac.jp'),
    ('立教大学', 'rikkyo.ac.jp'),
    ('法政大学', 'hosei.ac.jp'),
    ('中央大学', 'chuo-u.ac.jp')
ON CONFLICT DO NOTHING;

-- 2. 大学メール認証テーブル
CREATE TABLE IF NOT EXISTS university_email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    writer_id UUID NOT NULL REFERENCES writers(id) ON DELETE CASCADE,
    university_email VARCHAR(255) NOT NULL,
    verification_token VARCHAR(255) UNIQUE,
    verified_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_writer_email UNIQUE(writer_id, university_email)
);

-- 3. 学生証認証テーブル
CREATE TABLE IF NOT EXISTS student_id_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    writer_id UUID NOT NULL REFERENCES writers(id) ON DELETE CASCADE,
    student_id_url TEXT NOT NULL, -- Supabase Storageのパス
    verification_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT unique_writer_student_id UNIQUE(writer_id)
);

-- 4. 記事通報テーブル
CREATE TABLE IF NOT EXISTS article_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    reporter_id UUID REFERENCES auth.users(id),
    report_type VARCHAR(50) NOT NULL, -- inappropriate, spam, copyright, other
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewing, resolved, dismissed
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT article_reports_description_check CHECK (char_length(description) >= 10)
);

-- 5. 管理者テーブル
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'moderator', -- super_admin, moderator
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT unique_admin_user UNIQUE(user_id)
);

-- 6. 管理アクションログ
CREATE TABLE IF NOT EXISTS admin_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action_type VARCHAR(100) NOT NULL, -- approve_writer, reject_writer, delete_article, ban_user, etc
    target_type VARCHAR(50) NOT NULL, -- writer, article, user, etc
    target_id UUID NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. サイト設定テーブル（利用規約など）
CREATE TABLE IF NOT EXISTS site_settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 初期設定
INSERT INTO site_settings (key, value) VALUES
    ('terms_of_service', '利用規約の内容をここに記載'),
    ('privacy_policy', 'プライバシーポリシーの内容をここに記載'),
    ('contact_email', 'support@todaimedia.com')
ON CONFLICT DO NOTHING;

-- 8. お問い合わせテーブル
CREATE TABLE IF NOT EXISTS contact_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    status VARCHAR(50) DEFAULT 'pending', -- pending, responded, closed
    responded_at TIMESTAMP WITH TIME ZONE,
    responded_by UUID REFERENCES auth.users(id),
    response_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT contact_inquiries_message_check CHECK (char_length(message) >= 10)
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_university_email_verifications_writer_id ON university_email_verifications(writer_id);
CREATE INDEX IF NOT EXISTS idx_university_email_verifications_token ON university_email_verifications(verification_token);
CREATE INDEX IF NOT EXISTS idx_student_id_verifications_writer_id ON student_id_verifications(writer_id);
CREATE INDEX IF NOT EXISTS idx_student_id_verifications_status ON student_id_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_article_reports_article_id ON article_reports(article_id);
CREATE INDEX IF NOT EXISTS idx_article_reports_status ON article_reports(status);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_admin_id ON admin_action_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_action_logs_created_at ON admin_action_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);

-- RLSポリシーの設定

-- 大学マスターは誰でも読める
ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Universities are viewable by everyone" ON universities
    FOR SELECT USING (is_active = true);

-- メール認証は本人のみ
ALTER TABLE university_email_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Writers can manage own email verifications" ON university_email_verifications
    FOR ALL USING (
        writer_id IN (
            SELECT id FROM writers WHERE auth_id = auth.uid()
        )
    );

-- 学生証認証は本人と管理者
ALTER TABLE student_id_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Writers can view own student ID verifications" ON student_id_verifications
    FOR SELECT USING (
        writer_id IN (
            SELECT id FROM writers WHERE auth_id = auth.uid()
        ) OR
        auth.uid() IN (
            SELECT user_id FROM admins WHERE is_active = true
        )
    );

CREATE POLICY "Writers can upload student ID" ON student_id_verifications
    FOR INSERT WITH CHECK (
        writer_id IN (
            SELECT id FROM writers WHERE auth_id = auth.uid()
        )
    );

CREATE POLICY "Admins can update student ID verifications" ON student_id_verifications
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM admins WHERE is_active = true
        )
    );

-- 通報機能
ALTER TABLE article_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can report articles" ON article_reports
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Reporters can view own reports" ON article_reports
    FOR SELECT USING (
        reporter_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM admins WHERE is_active = true
        )
    );

CREATE POLICY "Admins can update reports" ON article_reports
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM admins WHERE is_active = true
        )
    );

-- 管理者テーブル
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only super admins can manage admins" ON admins
    FOR ALL USING (
        auth.uid() IN (
            SELECT user_id FROM admins WHERE role = 'super_admin' AND is_active = true
        )
    );

-- 管理ログは管理者のみ
ALTER TABLE admin_action_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can view logs" ON admin_action_logs
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM admins WHERE is_active = true
        )
    );

CREATE POLICY "System can insert logs" ON admin_action_logs
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM admins WHERE is_active = true
        )
    );

-- お問い合わせ
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit inquiries" ON contact_inquiries
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own inquiries" ON contact_inquiries
    FOR SELECT USING (
        user_id = auth.uid() OR
        auth.uid() IN (
            SELECT user_id FROM admins WHERE is_active = true
        )
    );

CREATE POLICY "Admins can update inquiries" ON contact_inquiries
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM admins WHERE is_active = true
        )
    );

-- writersテーブルに認証ステータスカラムを追加
ALTER TABLE writers ADD COLUMN IF NOT EXISTS university_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE writers ADD COLUMN IF NOT EXISTS student_id_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE writers ADD COLUMN IF NOT EXISTS verified_university VARCHAR(200);

-- 自動更新トリガー
CREATE TRIGGER update_university_email_verifications_updated_at BEFORE UPDATE ON university_email_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_id_verifications_updated_at BEFORE UPDATE ON student_id_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_reports_updated_at BEFORE UPDATE ON article_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();