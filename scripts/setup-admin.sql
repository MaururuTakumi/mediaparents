-- このSQLをSupabaseダッシュボードのSQL Editorで実行してください

-- 1. まず、あなたのユーザー情報を確認
-- あなたのメールアドレスに置き換えてください
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'your-email@example.com';

-- 2. 上記で取得したIDを使って管理者として登録
-- 'your-user-id' を実際のIDに置き換えてください
INSERT INTO admins (user_id, role, is_active, created_at)
VALUES ('your-user-id', 'super_admin', true, NOW())
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'super_admin',
  is_active = true;

-- 3. 登録確認
SELECT * FROM admins WHERE user_id = 'your-user-id';