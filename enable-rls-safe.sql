-- 登録成功後、安全なRLSポリシーを再設定

-- RLSを再有効化
ALTER TABLE writers ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminars ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_participants ENABLE ROW LEVEL SECURITY;

-- 安全なポリシーを作成（Writers）
CREATE POLICY "writers_select_policy" ON writers
    FOR SELECT USING (true);

CREATE POLICY "writers_insert_policy" ON writers
    FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "writers_update_policy" ON writers
    FOR UPDATE USING (auth.uid() = auth_id) WITH CHECK (auth.uid() = auth_id);

-- 安全なポリシーを作成（Articles）
CREATE POLICY "articles_select_policy" ON articles
    FOR SELECT USING (
        status = 'published' OR 
        writer_id IN (SELECT id FROM writers WHERE auth_id = auth.uid())
    );

CREATE POLICY "articles_insert_policy" ON articles
    FOR INSERT WITH CHECK (
        writer_id IN (SELECT id FROM writers WHERE auth_id = auth.uid())
    );

CREATE POLICY "articles_update_policy" ON articles
    FOR UPDATE USING (
        writer_id IN (SELECT id FROM writers WHERE auth_id = auth.uid())
    ) WITH CHECK (
        writer_id IN (SELECT id FROM writers WHERE auth_id = auth.uid())
    );

-- 安全なポリシーを作成（Interviews）
CREATE POLICY "interviews_policy" ON interviews
    FOR ALL USING (
        writer_id IN (SELECT id FROM writers WHERE auth_id = auth.uid())
    ) WITH CHECK (
        writer_id IN (SELECT id FROM writers WHERE auth_id = auth.uid())
    );

-- 安全なポリシーを作成（Seminars）
CREATE POLICY "seminars_select_policy" ON seminars
    FOR SELECT USING (is_active = true);

CREATE POLICY "seminars_manage_policy" ON seminars
    FOR ALL USING (
        host_writer_id IN (SELECT id FROM writers WHERE auth_id = auth.uid())
    ) WITH CHECK (
        host_writer_id IN (SELECT id FROM writers WHERE auth_id = auth.uid())
    );

-- 安全なポリシーを作成（Subscriptions）
CREATE POLICY "subscriptions_policy" ON subscriptions
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- 安全なポリシーを作成（Seminar Participants）
CREATE POLICY "seminar_participants_policy" ON seminar_participants
    FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());