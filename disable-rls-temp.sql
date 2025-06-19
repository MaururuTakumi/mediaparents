-- 一時的にRLSを完全無効化（開発用）

-- writersテーブルのRLSを無効化
ALTER TABLE writers DISABLE ROW LEVEL SECURITY;

-- 他のテーブルも一時的に無効化
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE interviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE seminars DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE seminar_participants DISABLE ROW LEVEL SECURITY;

-- 確認クエリ
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('writers', 'articles', 'interviews', 'seminars', 'subscriptions', 'seminar_participants');