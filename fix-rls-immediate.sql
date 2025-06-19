-- RLSポリシーの即座修正

-- 一時的にRLSを無効化してテスト
ALTER TABLE writers DISABLE ROW LEVEL SECURITY;

-- 既存のポリシーをすべて削除
DROP POLICY IF EXISTS "Writers can view all profiles" ON writers;
DROP POLICY IF EXISTS "Writers can update own profile" ON writers;
DROP POLICY IF EXISTS "Writers can insert own profile" ON writers;

-- RLSを再有効化
ALTER TABLE writers ENABLE ROW LEVEL SECURITY;

-- 新しい、より寛容なポリシーを作成
CREATE POLICY "allow_authenticated_insert" ON writers
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "allow_all_select" ON writers
    FOR SELECT USING (true);

CREATE POLICY "allow_own_update" ON writers
    FOR UPDATE TO authenticated 
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- デバッグ用：現在のポリシーを確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'writers';