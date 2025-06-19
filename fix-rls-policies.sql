-- RLSポリシーの修正とテスト

-- 既存のポリシーを確認
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'writers';

-- 必要に応じて既存のポリシーを削除して再作成
DROP POLICY IF EXISTS "Writers can insert own profile" ON writers;
DROP POLICY IF EXISTS "Writers can view all profiles" ON writers;
DROP POLICY IF EXISTS "Writers can update own profile" ON writers;

-- 新しいポリシーを作成
CREATE POLICY "Enable insert for authenticated users only" ON writers
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable read access for all users" ON writers
    FOR SELECT USING (true);

CREATE POLICY "Enable update for users based on auth_id" ON writers
    FOR UPDATE TO authenticated USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());

-- テストクエリ（デバッグ用）
-- SELECT * FROM writers;
-- SELECT auth.uid();
-- SELECT * FROM auth.users;