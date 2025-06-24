-- student-ids バケットのRLSポリシー設定
-- Supabase SQL Editorで実行してください

-- 1. ユーザーが自分のフォルダにアップロードできる
CREATE POLICY "Users can upload own student ID" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  auth.uid()::text = (storage.foldername(name))[1]
  AND bucket_id = 'student-ids'
);

-- 2. ユーザーが自分のファイルを閲覧できる
CREATE POLICY "Users can view own student ID" 
ON storage.objects 
FOR SELECT 
USING (
  auth.uid()::text = (storage.foldername(name))[1]
  AND bucket_id = 'student-ids'
);

-- 3. ユーザーが自分のファイルを更新できる
CREATE POLICY "Users can update own student ID" 
ON storage.objects 
FOR UPDATE 
USING (
  auth.uid()::text = (storage.foldername(name))[1]
  AND bucket_id = 'student-ids'
);

-- 4. ユーザーが自分のファイルを削除できる
CREATE POLICY "Users can delete own student ID" 
ON storage.objects 
FOR DELETE 
USING (
  auth.uid()::text = (storage.foldername(name))[1]
  AND bucket_id = 'student-ids'
);

-- 5. 管理者がすべてのファイルを閲覧できる
CREATE POLICY "Admins can view all student IDs" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'student-ids' 
  AND EXISTS (
    SELECT 1 FROM admins 
    WHERE user_id = auth.uid() 
    AND is_active = true
  )
);

-- ポリシーの確認
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';