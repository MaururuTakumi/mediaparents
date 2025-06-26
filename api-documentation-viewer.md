# TodaiMedia Viewer API Documentation

このドキュメントは、TodaiMedia ViewerアプリケーションのバックエンドAPIを網羅的に説明したものです。Expo React Nativeアプリ開発時にこのドキュメントを参照することで、必要なAPIエンドポイントと実装方法を理解できます。

## 基本情報

### ベースURL
```
Production: https://your-domain.com
Development: http://localhost:3000
```

### 認証方式
- Supabase Authを使用
- JWTトークンベースの認証
- すべての認証が必要なエンドポイントには、Authorizationヘッダーが必要

### レスポンス形式
- すべてのレスポンスはJSON形式
- エラーレスポンスは統一フォーマット

## 認証関連API

### 1. ユーザー登録
```
POST /api/auth/signup
```

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### 2. ログイン
```
POST /api/auth/signin
```

**リクエストボディ:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**レスポンス:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "jwt_token",
    "refresh_token": "refresh_token"
  }
}
```

### 3. ログアウト
```
POST /api/auth/logout
```

**ヘッダー:**
```
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "message": "ログアウトしました"
}
```

### 4. セッション確認
```
GET /api/check-session
```

**ヘッダー:**
```
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "viewer"
  }
}
```

## 記事関連API

### 1. 記事一覧取得
```
GET /api/articles
```

**クエリパラメータ:**
- `page`: ページ番号 (デフォルト: 1)
- `limit`: 1ページあたりの記事数 (デフォルト: 10)
- `premium`: プレミアム記事のみ (true/false)
- `writer_id`: ライターIDでフィルタ

**レスポンス:**
```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "記事タイトル",
      "excerpt": "記事の抜粋",
      "writer": {
        "id": "uuid",
        "name": "ライター名",
        "university": "東京大学",
        "avatar_url": "https://..."
      },
      "is_premium": false,
      "view_count": 100,
      "like_count": 20,
      "thumbnail_url": "https://...",
      "tags": ["タグ1", "タグ2"],
      "published_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "total_pages": 10
}
```

### 2. 記事詳細取得
```
GET /api/articles/{id}
```

**レスポンス:**
```json
{
  "id": "uuid",
  "title": "記事タイトル",
  "content": "記事本文（HTML形式）",
  "excerpt": "記事の抜粋",
  "writer": {
    "id": "uuid",
    "name": "ライター名",
    "university": "東京大学",
    "faculty": "工学部",
    "grade": 3,
    "bio": "自己紹介",
    "avatar_url": "https://..."
  },
  "is_premium": false,
  "view_count": 100,
  "like_count": 20,
  "thumbnail_url": "https://...",
  "tags": ["タグ1", "タグ2"],
  "published_at": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### 3. 記事にいいねをつける
```
POST /api/articles/{id}/like
```

**ヘッダー:**
```
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "success": true,
  "like_count": 21
}
```

### 4. いいねを取り消す
```
DELETE /api/articles/{id}/like
```

**ヘッダー:**
```
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "success": true,
  "like_count": 20
}
```

## サブスクリプション関連API

### 1. Stripe Checkoutセッション作成
```
POST /api/create-checkout-session
```

**ヘッダー:**
```
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "sessionId": "cs_test_xxxxx"
}
```

### 2. Stripe Customer Portalセッション作成
```
POST /api/create-portal-session
```

**ヘッダー:**
```
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "url": "https://billing.stripe.com/p/session/xxxxx"
}
```

### 3. Stripeユーザー同期
```
POST /api/sync-user-with-stripe
```

**ヘッダー:**
```
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "success": true,
  "customerId": "cus_xxxxx"
}
```

### 4. Stripe Webhook
```
POST /api/stripe-webhook
```

**ヘッダー:**
```
stripe-signature: {stripe_signature}
```

**備考:** Stripeからの自動呼び出し用エンドポイント

## ライター関連API（閲覧のみ）

### 1. ライター一覧取得
```
GET /api/writers
```

**クエリパラメータ:**
- `page`: ページ番号
- `limit`: 1ページあたりの表示数
- `university`: 大学名でフィルタ

**レスポンス:**
```json
{
  "writers": [
    {
      "id": "uuid",
      "name": "ライター名",
      "university": "東京大学",
      "faculty": "工学部",
      "grade": 3,
      "bio": "自己紹介",
      "avatar_url": "https://...",
      "is_verified": true,
      "article_count": 10
    }
  ],
  "total": 50,
  "page": 1,
  "total_pages": 5
}
```

### 2. ライター詳細取得
```
GET /api/writers/{id}
```

**レスポンス:**
```json
{
  "id": "uuid",
  "name": "ライター名",
  "university": "東京大学",
  "faculty": "工学部",
  "grade": 3,
  "bio": "自己紹介",
  "avatar_url": "https://...",
  "is_verified": true,
  "created_at": "2024-01-01T00:00:00Z",
  "articles": [
    {
      "id": "uuid",
      "title": "記事タイトル",
      "excerpt": "記事の抜粋",
      "published_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## セミナー関連API

### 1. セミナー一覧取得
```
GET /api/seminars
```

**クエリパラメータ:**
- `upcoming`: 今後のセミナーのみ (true/false)
- `host_writer_id`: ホストライターIDでフィルタ

**レスポンス:**
```json
{
  "seminars": [
    {
      "id": "uuid",
      "title": "セミナータイトル",
      "description": "セミナー説明",
      "host_writer": {
        "id": "uuid",
        "name": "ライター名",
        "university": "東京大学"
      },
      "scheduled_at": "2024-01-01T19:00:00Z",
      "duration_minutes": 60,
      "max_participants": 20,
      "current_participants": 15,
      "price": 0,
      "is_active": true
    }
  ]
}
```

### 2. セミナー参加登録
```
POST /api/seminars/{id}/register
```

**ヘッダー:**
```
Authorization: Bearer {access_token}
```

**レスポンス:**
```json
{
  "success": true,
  "meeting_url": "https://zoom.us/...",
  "message": "セミナーに登録しました"
}
```

## エラーレスポンス

すべてのAPIエンドポイントは以下の形式でエラーを返します：

```json
{
  "error": "エラーメッセージ",
  "details": "詳細なエラー情報（開発環境のみ）",
  "code": "ERROR_CODE"
}
```

**一般的なエラーコード:**
- `UNAUTHORIZED`: 認証が必要
- `FORBIDDEN`: アクセス権限がない
- `NOT_FOUND`: リソースが見つからない
- `VALIDATION_ERROR`: バリデーションエラー
- `INTERNAL_ERROR`: サーバーエラー

## レート制限

- 認証なし: 100リクエスト/時間
- 認証あり: 1000リクエスト/時間

## WebSocket接続（リアルタイム機能）

Supabase Realtimeを使用：

```javascript
// リアルタイム記事更新の購読
const channel = supabase
  .channel('articles')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'articles'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

## 開発環境での注意事項

1. **CORS設定**: 開発環境では`http://localhost:19006`からのアクセスを許可
2. **環境変数**: 
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
3. **認証トークン**: Supabase Authのトークンを使用、有効期限は1時間

## データモデル

主要なデータモデルの構造：

### User (auth.users)
```typescript
{
  id: string
  email: string
  created_at: string
  updated_at: string
}
```

### Profile
```typescript
{
  id: string
  auth_id: string
  stripe_customer_id?: string
  subscription_status?: 'active' | 'canceled' | 'past_due'
  subscription_end_date?: string
  created_at: string
  updated_at: string
}
```

### Writer
```typescript
{
  id: string
  auth_id: string
  name: string
  university: string
  faculty?: string
  grade?: number
  bio?: string
  avatar_url?: string
  is_verified: boolean
  created_at: string
  updated_at: string
}
```

### Article
```typescript
{
  id: string
  writer_id: string
  title: string
  content: string
  excerpt?: string
  format: 'text' | 'video' | 'audio'
  status: 'published'
  is_premium: boolean
  view_count: number
  like_count: number
  thumbnail_url?: string
  tags: string[]
  published_at?: string
  created_at: string
  updated_at: string
}
```

### Seminar
```typescript
{
  id: string
  title: string
  description?: string
  host_writer_id?: string
  scheduled_at: string
  duration_minutes: number
  max_participants: number
  price: number
  meeting_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```