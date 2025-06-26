# TodaiMedia - Next.js Webアプリケーション

## プロジェクト概要

東大生が書いた親子関係に関する記事を配信するWebアプリケーション。

### 技術スタック
- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **決済**: Stripe
- **メール送信**: Resend
- **デプロイ**: Vercel

## プロジェクト構造

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # 認証関連ページ
│   ├── (dashboard)/       # ダッシュボード（管理者・ライター用）
│   ├── api/               # APIルート
│   ├── articles/          # 記事関連ページ
│   └── subscription/      # サブスクリプション関連
├── components/            # 再利用可能なコンポーネント
├── lib/                   # ユーティリティ関数
│   ├── supabase.ts       # Supabaseクライアント
│   ├── stripe.ts         # Stripe設定
│   └── resend.ts         # Resend設定
├── types/                 # TypeScript型定義
└── public/               # 静的ファイル
```

## 主要機能

### 1. ユーザー向け機能
- 記事閲覧（無料・プレミアム）
- ユーザー登録・ログイン
- プレミアム会員登録（Stripe）
- ライター情報閲覧
- セミナー参加登録

### 2. ライター向け機能
- 記事の作成・編集・公開
- プロフィール管理
- 記事統計の確認

### 3. 管理者向け機能
- ライター管理
- 記事管理（承認・非公開）
- セミナー管理
- ユーザー管理

## 環境変数

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev

# その他
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=
```

## データベース構造

### 主要テーブル
- `profiles`: ユーザープロフィール
- `writers`: ライター情報
- `articles`: 記事データ
- `seminars`: セミナー情報
- `seminar_participants`: セミナー参加者
- `likes`: いいね情報

## API エンドポイント

### 認証関連
- `POST /api/auth/signup` - ユーザー登録
- `POST /api/auth/signin` - ログイン
- `POST /api/auth/logout` - ログアウト

### 記事関連
- `GET /api/articles` - 記事一覧取得
- `GET /api/articles/[id]` - 記事詳細取得
- `POST /api/articles/[id]/like` - いいね

### サブスクリプション関連
- `POST /api/create-checkout-session` - Stripe決済セッション作成
- `POST /api/create-portal-session` - Stripeポータルセッション作成
- `POST /api/stripe-webhook` - Stripe Webhook処理

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# 型チェック
npm run type-check

# リント
npm run lint
```

## デプロイ

Vercelにデプロイされています。mainブランチへのプッシュで自動デプロイされます。

## 注意事項

1. **環境変数**: 本番環境の環境変数はVercelで管理
2. **データベース**: Supabaseのマイグレーションは手動で管理
3. **決済**: Stripe Webhookエンドポイントは本番URLで設定が必要
4. **メール**: Resendの無料プランでは送信制限あり

---

**重要**: このファイルは現在のWebアプリケーションの構成を説明しています。