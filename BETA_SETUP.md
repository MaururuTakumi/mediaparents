# ベータ版セットアップ手順

## 概要
このドキュメントでは、『ありがとうお父さんお母さん』のベータ版をセットアップするための手順を説明します。

## 必要な機能（ベータ版）

### 投稿者側
- ✅ ライター登録・ログイン
- ✅ ダッシュボードアクセス
- ✅ 記事作成・編集・管理
- ✅ AIインタビュー機能
- ✅ プロフィール管理

### 閲覧者側  
- ✅ 記事閲覧
- ✅ ライター一覧・詳細
- ✅ プレミアム会員登録（Stripe統合）
- ✅ プレミアム記事の制限
- ✅ 有料会員の質問機能

## セットアップ手順

### 1. 環境変数の設定

`.env.local`ファイルに以下の環境変数を設定してください：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PRICE_ID=your_stripe_price_id

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Stripeの設定

1. Stripeダッシュボードにログイン
2. 商品とプランを作成：
   - 商品名：「プレミアムプラン」
   - 価格：¥1,000/月
   - 繰り返し：月次
3. 価格IDをコピーして`NEXT_PUBLIC_STRIPE_PRICE_ID`に設定
4. Webhookエンドポイントを設定：
   - エンドポイントURL：`https://your-domain.com/api/stripe-webhook`
   - イベント：
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
5. Webhook署名シークレットを`STRIPE_WEBHOOK_SECRET`に設定

### 3. データベースマイグレーション

Supabaseのダッシュボードから以下のマイグレーションを実行してください：

```bash
# 1. 既存のマイグレーション（順番に実行）
supabase/migrations/20241219000001_add_comments.sql
supabase/migrations/20241219000002_add_subscription_fields.sql
supabase/migrations/20241219000003_create_profiles_trigger.sql
supabase/migrations/20241220_create_profiles_table.sql
supabase/migrations/20241220_subscription_setup.sql
supabase/migrations/20241221_create_beta_tables.sql
```

または、Supabase CLIを使用：

```bash
# Supabase CLIでマイグレーションを実行
supabase db push
```

### 4. 必要なRPC関数を作成

Supabaseのダッシュボードで以下のSQL関数を作成してください：

```sql
-- ビューカウントをインクリメントする関数
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE articles 
  SET view_count = view_count + 1
  WHERE id = article_id
  RETURNING view_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. アプリケーションの起動

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

### 6. 初期データの作成（オプション）

1. ライターアカウントを作成：
   - http://localhost:3000/register にアクセス
   - ライター情報を入力して登録

2. テスト記事を作成：
   - ダッシュボードから記事を作成
   - プレミアム記事としてマークすることも可能

3. プレミアム会員のテスト：
   - 別のメールアドレスで一般ユーザーとして登録
   - サブスクリプションページから登録
   - Stripeのテストカード：4242 4242 4242 4242

## トラブルシューティング

### データベースエラーが発生する場合

1. RLSポリシーを確認：
```sql
-- 一時的にRLSを無効化（開発環境のみ）
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
ALTER TABLE writers DISABLE ROW LEVEL SECURITY;
```

2. マイグレーションの再実行：
```sql
-- 既存のテーブルを削除して再作成
DROP TABLE IF EXISTS article_questions CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS seminar_participants CASCADE;
DROP TABLE IF EXISTS seminars CASCADE;

-- マイグレーションを再実行
```

### Stripeエラーが発生する場合

1. 環境変数が正しく設定されているか確認
2. Webhookエンドポイントが正しく設定されているか確認
3. ローカル開発の場合はngrokを使用してWebhookをテスト

### 認証エラーが発生する場合

1. Supabaseのメール確認を無効化（開発環境）：
   - Authentication > Settings > Email Auth
   - "Enable email confirmations"をオフ

## 本番環境へのデプロイ

1. Vercelにデプロイ
2. 環境変数を本番用に設定
3. Stripe Webhookを本番URLに更新
4. データベースのRLSポリシーを有効化
5. メール確認機能を有効化

## 連絡先

問題が発生した場合は、開発チームまでご連絡ください。