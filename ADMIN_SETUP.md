# 管理者セットアップガイド

## 1. 管理者ダッシュボードへのアクセス方法

### 前提条件
- Supabaseにユーザー登録済み
- `admins`テーブルに管理者として登録済み

### アクセス手順

1. **通常のログイン**
   - http://localhost:3000/login でログイン
   - または http://localhost:3000/writer/login でライターとしてログイン

2. **管理者ページへ移動**
   - ログイン後、http://localhost:3000/admin にアクセス
   - 管理者権限がある場合のみアクセス可能

## 2. 管理者として自分を登録する方法

### Supabaseダッシュボードでの手順

1. **Supabaseダッシュボードにログイン**
   - https://supabase.com/dashboard にアクセス
   - プロジェクト「todaiwebmedia」を選択

2. **SQL Editorを開く**
   - 左メニューから「SQL Editor」をクリック

3. **ユーザーIDを確認**
   ```sql
   -- あなたのメールアドレスに置き換えてください
   SELECT id, email, created_at 
   FROM auth.users 
   WHERE email = 'your-email@example.com';
   ```

4. **管理者として登録**
   ```sql
   -- 上記で取得したIDを使用
   INSERT INTO admins (user_id, role, is_active)
   VALUES ('取得したID', 'super_admin', true)
   ON CONFLICT (user_id) 
   DO UPDATE SET 
     role = 'super_admin',
     is_active = true;
   ```

## 3. ストレージバケットの作成

### Supabaseダッシュボードでの手順

1. **Storageセクションへ移動**
   - プロジェクトダッシュボードの左メニューから「Storage」を選択
   - URL: https://supabase.com/dashboard/project/mdovlgtuuhbuoespegab/storage/buckets

2. **新しいバケットを作成**
   - 「New bucket」ボタンをクリック
   - 設定:
     - Name: `student-ids`
     - Public bucket: OFF（チェックを外す）
     - 「Create bucket」をクリック

3. **RLSポリシーを設定**
   - 作成したバケットをクリック
   - 「Policies」タブを選択
   - 「New Policy」をクリック
   - 以下のポリシーを追加:

   ```sql
   -- ユーザーが自分のファイルをアップロードできる
   CREATE POLICY "Users can upload own student ID" 
   ON storage.objects FOR INSERT 
   WITH CHECK (
     auth.uid()::text = (storage.foldername(name))[1]
     AND bucket_id = 'student-ids'
   );

   -- ユーザーが自分のファイルを閲覧できる
   CREATE POLICY "Users can view own student ID" 
   ON storage.objects FOR SELECT 
   USING (
     auth.uid()::text = (storage.foldername(name))[1]
     AND bucket_id = 'student-ids'
   );

   -- 管理者がすべてのファイルを閲覧できる
   CREATE POLICY "Admins can view all student IDs" 
   ON storage.objects FOR SELECT 
   USING (
     bucket_id = 'student-ids' 
     AND EXISTS (
       SELECT 1 FROM admins 
       WHERE user_id = auth.uid() 
       AND is_active = true
     )
   );
   ```

## 4. 管理者ダッシュボードの機能

### 利用可能な機能

1. **ダッシュボード** (`/admin/dashboard`)
   - ユーザー数、記事数の統計
   - 最近の記事一覧

2. **記事管理** (`/admin/articles`)
   - すべての記事の閲覧
   - 不適切な記事の削除

3. **ユーザー管理** (`/admin/users`)
   - 読者・ライターの管理
   - ユーザーのBAN/BAN解除

4. **通報管理** (`/admin/reports`)
   - 記事への通報確認

5. **管理者設定** (`/admin/settings`)
   - 管理者情報の確認
   - アクションログの閲覧

## トラブルシューティング

### /adminにアクセスできない場合

1. **ログイン状態を確認**
   - ブラウザの開発者ツールでCookieを確認
   - `sb-mdovlgtuuhbuoespegab-auth-token`が存在するか確認

2. **管理者登録を確認**
   ```sql
   -- Supabase SQL Editorで実行
   SELECT * FROM admins WHERE user_id = 'あなたのユーザーID';
   ```

3. **ミドルウェアのデバッグ**
   - コンソールでエラーを確認
   - ネットワークタブでリダイレクトを確認