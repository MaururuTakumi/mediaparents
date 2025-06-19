# REQUIREMENTS.md

プロジェクト『ありがとうお父さんお母さん』公式要件定義書

## 目次 (Table of Contents)

1. [ドキュメント概要](#1-ドキュメント概要-document-overview)
2. [アーキテクチャ](#2-アーキテクチャ-architecture)
3. [データベース設計](#3-データベース設計-database-schema---supabase)
4. [UIコンポーネント設計](#4-uiコンポーネント設計-ui-components)
5. [機能要件：閲覧者向けサイト](#5-機能要件閲覧者向けサイト-appviewer)
6. [機能要件：投稿者向けWebアプリ](#6-機能要件投稿者向けwebアプリ-appcreator)
7. [非機能要件](#7-非機能要件-non-functional-requirements)

## 1. ドキュメント概要 (Document Overview)

### 1.1. ドキュメントの目的

本書は、プロジェクト『ありがとうお父さんお母さん』の技術的な仕様を定義する唯一の公式ドキュメントです。開発チーム（特にAI開発者）が、プロジェクトの全期間を通じて常に参照する、技術的な仕様の全てを定義したドキュメントとなります。

### 1.2. プロジェクト名

『ありがとうお父さんお母さん』

### 1.3. コアコンセプト

「現役トップ大学生とその親の"対話ログ"を、AIで高品質な記事コンテンツに変換し、悩める親と学生を繋ぐ、次世代の教育対話プラットフォーム」

## 2. アーキテクチャ (Architecture)

### 2.1. 技術スタック

- **フロントエンド**: Next.js 15 (App Router)
- **バックエンド**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **デプロイメント**: Vercel
- **UIライブラリ**: shadcn/ui + Tailwind CSS
- **言語**: TypeScript
- **フォーム管理**: React Hook Form + Zod
- **状態管理**: React Server Components + Supabase SSR

### 2.2. プロジェクト構造

モノレポ構成: 1つのNext.jsプロジェクトで閲覧者サイトと投稿者アプリを管理する方針。

ルートグループによる関心の分離:

```
/app
├── (viewer)/   # 閲覧者向けページ群 (例: /, /articles, /writers)
│   ├── page.tsx                    # トップページ
│   ├── articles/
│   │   ├── page.tsx                # 記事一覧
│   │   └── [id]/page.tsx           # 記事詳細
│   ├── writers/
│   │   ├── page.tsx                # ライター一覧
│   │   └── [id]/page.tsx           # ライター詳細
│   ├── seminars/
│   │   ├── page.tsx                # 座談会一覧
│   │   └── [id]/page.tsx           # 座談会詳細
│   └── subscribe/page.tsx          # 有料プラン申込
├── (creator)/  # 投稿者向けページ群 (例: /dashboard, /settings)
│   ├── dashboard/
│   │   ├── page.tsx                # ダッシュボード
│   │   ├── articles/
│   │   │   ├── page.tsx            # 記事管理
│   │   │   ├── new/page.tsx        # 新規記事作成
│   │   │   └── edit/[id]/page.tsx  # 記事編集
│   │   ├── interview/page.tsx      # AIインタビュー
│   │   └── settings/
│   │       ├── page.tsx            # 設定
│   │       └── verification/page.tsx # 本人認証
│   └── layout.tsx                  # 認証保護レイアウト
├── (auth)/     # 認証関連ページ
│   ├── login/page.tsx              # ログイン
│   └── register/page.tsx           # 新規登録
└── api/        # APIルート
    ├── auth/
    ├── articles/
    ├── interviews/
    └── subscriptions/
```

## 3. データベース設計 (Database Schema - Supabase)

### 3.1. Enum Types

```sql
-- 記事フォーマット
CREATE TYPE article_format AS ENUM ('text', 'video', 'audio');

-- 認証ステータス
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');

-- 記事ステータス
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');

-- サブスクリプションステータス
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due');
```

### 3.2. テーブル定義

```sql
-- ライター情報テーブル
CREATE TABLE writers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    university VARCHAR(100) NOT NULL,
    faculty VARCHAR(100),
    grade INTEGER CHECK (grade >= 1 AND grade <= 6),
    bio TEXT,
    avatar_url TEXT,
    verification_status verification_status DEFAULT 'pending',
    verification_document_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 記事テーブル
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    writer_id UUID REFERENCES writers(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    format article_format DEFAULT 'text',
    status article_status DEFAULT 'draft',
    is_premium BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    tags TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インタビューセッションテーブル
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    writer_id UUID REFERENCES writers(id) ON DELETE CASCADE,
    title VARCHAR(200),
    conversation_log JSONB NOT NULL,
    ai_summary TEXT,
    generated_article_id UUID REFERENCES articles(id),
    session_duration INTEGER, -- 分単位
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 座談会テーブル
CREATE TABLE seminars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    host_writer_id UUID REFERENCES writers(id),
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    max_participants INTEGER DEFAULT 20,
    price DECIMAL(8,2) DEFAULT 0,
    meeting_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- サブスクリプションテーブル
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(200) UNIQUE,
    status subscription_status DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    plan_price DECIMAL(8,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 座談会参加者テーブル
CREATE TABLE seminar_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seminar_id UUID REFERENCES seminars(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    attended BOOLEAN DEFAULT FALSE,
    UNIQUE(seminar_id, user_id)
);

-- インデックス作成
CREATE INDEX idx_articles_writer_id ON articles(writer_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_is_premium ON articles(is_premium);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_interviews_writer_id ON interviews(writer_id);
CREATE INDEX idx_seminars_scheduled_at ON seminars(scheduled_at);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

### 3.3. Row Level Security (RLS) ポリシー

```sql
-- Writers テーブル
ALTER TABLE writers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Writers can view all profiles" ON writers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Writers can update own profile" ON writers
    FOR UPDATE TO authenticated USING (auth_id = auth.uid());

-- Articles テーブル
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are viewable by everyone" ON articles
    FOR SELECT USING (status = 'published');

CREATE POLICY "Writers can manage own articles" ON articles
    FOR ALL TO authenticated USING (writer_id IN (
        SELECT id FROM writers WHERE auth_id = auth.uid()
    ));

-- Premium content access control
CREATE POLICY "Premium articles require subscription" ON articles
    FOR SELECT USING (
        status = 'published' AND (
            NOT is_premium OR 
            auth.uid() IN (
                SELECT user_id FROM subscriptions 
                WHERE status = 'active' 
                AND current_period_end > NOW()
            )
        )
    );
```

## 4. UIコンポーネント設計 (UI Components)

### 4.1. shadcn/ui採用方針

プロジェクトでshadcn/uiを全面的に採用し、デザインシステムの一貫性を保つ。

### 4.2. カスタムコンポーネントとshadcn/ui対応表

| カスタムコンポーネント | ベースshadcn/ui要素 | 用途 |
|----------------------|-------------------|------|
| `ArticleCard` | Card, Badge, Avatar | 記事一覧・プレビュー表示 |
| `WriterCard` | Card, Avatar, Badge | ライタープロフィール表示 |
| `SeminarCard` | Card, Button, Badge | 座談会情報表示 |
| `Header` | NavigationMenu, Button, Avatar | サイト共通ヘッダー |
| `Footer` | - | サイト共通フッター |
| `ArticleEditor` | Textarea, Button, Tabs | AI記事編集インターフェース |
| `InterviewChat` | Card, Button, ScrollArea | AIインタビューチャット |

### 4.3. デザイントークン

```typescript
// tailwind.config.ts での色定義
const colors = {
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
  secondary: {
    50: '#f8fafc',
    500: '#64748b',
    900: '#0f172a',
  }
}
```

## 5. 機能要件：閲覧者向けサイト (app/(viewer))

### 5.1. サイトマップ

- `/` - トップページ
- `/articles` - 記事一覧
- `/articles/[id]` - 記事詳細
- `/writers` - ライター一覧  
- `/writers/[id]` - ライター詳細
- `/seminars` - 座談会一覧
- `/seminars/[id]` - 座談会詳細
- `/subscribe` - 有料プラン申込

### 5.2. ページ別要件

#### 5.2.1. トップページ (`/`)

**目的**: サービスの価値提案を伝え、記事・ライター・座談会への誘導を行う

**主要コンポーネント配置**:
- ヒーローセクション（サービス概要・CTA）
- 人気記事プレビュー（`ArticleCard` × 6）
- 注目ライター（`WriterCard` × 4）
- 今後の座談会（`SeminarCard` × 3）

**機能ロジック**:
- 人気記事: view_count順での取得
- 注目ライター: 最新記事投稿順での取得
- 座談会: scheduled_at未来日時での取得

**データ取得要件**:
```typescript
// 人気記事取得
const popularArticles = await supabase
  .from('articles')
  .select(`
    *,
    writers (name, university, avatar_url)
  `)
  .eq('status', 'published')
  .order('view_count', { ascending: false })
  .limit(6);

// 注目ライター取得
const featuredWriters = await supabase
  .from('writers')
  .select('*')
  .eq('is_verified', true)
  .order('created_at', { ascending: false })
  .limit(4);
```

#### 5.2.2. 記事一覧ページ (`/articles`)

**目的**: 全記事の閲覧・検索・フィルタリング機能を提供

**主要コンポーネント配置**:
- 検索バー・フィルター（タグ、フォーマット、ライター）
- 記事グリッド表示（`ArticleCard`の無限スクロール）
- 人気タグクラウド

**機能ロジック**:
- 無限スクロールでのページネーション
- リアルタイム検索（タイトル・タグ）
- フォーマット別フィルタ（text/video/audio）

**データ取得要件**:
```typescript
// 記事一覧取得（ページネーション付き）
const articles = await supabase
  .from('articles')
  .select(`
    *,
    writers (name, university, avatar_url, is_verified)
  `)
  .eq('status', 'published')
  .order('published_at', { ascending: false })
  .range(offset, offset + limit - 1);
```

#### 5.2.3. 記事詳細ページ (`/articles/[id]`)

**目的**: 記事コンテンツの表示と有料会員限定アクセス制御

**主要コンポーネント配置**:
- 記事ヘッダー（タイトル、ライター情報、公開日）
- 記事本文（プレミアム制御付き）
- 関連記事レコメンド
- ライタープロフィールカード

**機能ロジック**:
- プレミアム記事のアクセス制御
- 記事閲覧数カウント増加
- ソーシャルシェア機能

**データ取得要件**:
```typescript
// 記事詳細取得（プレミアム制御付き）
const { data: article } = await supabase
  .from('articles')
  .select(`
    *,
    writers (*)
  `)
  .eq('id', articleId)
  .eq('status', 'published')
  .single();

// プレミアム記事アクセス制御
if (article.is_premium) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user?.id)
    .eq('status', 'active')
    .gte('current_period_end', new Date().toISOString())
    .single();
    
  if (!subscription) {
    // プレミアム登録促進UI表示
  }
}
```

#### 5.2.4. 有料プラン申込ページ (`/subscribe`)

**目的**: Stripe決済によるプレミアム会員登録

**主要コンポーネント配置**:
- プラン比較表
- Stripe決済フォーム
- プレミアム特典説明

**機能ロジック**:
- Stripe Checkout セッション作成
- webhook での subscription 状態管理

### 5.3. 有料会員限定アクセス制御

プレミアム記事（`is_premium: true`）は、有効なサブスクリプション（`subscriptions.status = 'active'` かつ `current_period_end > NOW()`）を持つユーザーのみがアクセス可能。

## 6. 機能要件：投稿者向けWebアプリ (app/(creator))

### 6.1. サイトマップ

- `/dashboard` - ダッシュボード
- `/dashboard/articles` - 記事管理
- `/dashboard/articles/new` - 新規記事作成
- `/dashboard/articles/edit/[id]` - 記事編集
- `/dashboard/interview` - AIインタビュー
- `/dashboard/settings` - 設定
- `/dashboard/settings/verification` - 本人認証

### 6.2. 認証・認可

`(creator)`グループ全体を保護ルートとし、未認証ユーザーは`/login`にリダイレクトするロジックを`layout.tsx`に実装。

```typescript
// app/(creator)/layout.tsx
export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // ライター情報確認
  const { data: writer } = await supabase
    .from('writers')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();

  if (!writer) {
    redirect('/register');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <CreatorHeader writer={writer} />
      <main>{children}</main>
    </div>
  );
}
```

### 6.3. ページ別要件

#### 6.3.1. ダッシュボード (`/dashboard`)

**目的**: ライターの活動状況と収益を一覧表示

**主要コンポーネント配置**:
- KPIカード（記事数、総閲覧数、今月の収益、認証ステータス）
- 最近の記事一覧
- 今後の座談会スケジュール
- 収益グラフ（月次）

**データ取得要件**:
```typescript
// ダッシュボード統計取得
const stats = await supabase
  .from('articles')
  .select('count, view_count.sum()')
  .eq('writer_id', writer.id)
  .eq('status', 'published');
```

#### 6.3.2. 本人認証ページ (`/dashboard/settings/verification`)

**目的**: 学生証アップロードによる本人認証申請

**主要コンポーネント配置**:
- 認証ステータス表示
- 学生証アップロードフォーム
- 認証ガイドライン説明

**機能ロジック**:
- Supabase Storage への画像アップロード
- 認証申請の状態管理

### 6.4. コア機能詳細：AI記事作成フロー

#### 6.4.1. 高精度AIインタビュー (`/dashboard/interview`)

**AIペルソナ設定**:
```
あなたは学生と親の関係性改善を専門とする、経験豊富なライフコーチです。
学生の実体験から、同じ悩みを持つ親子に役立つ深い洞察を引き出すことが使命です。
```

**思考フレームワーク活用**:

1. **STARメソッド**:
   - Situation（状況）: どんな状況だったか
   - Task（課題）: 何を解決する必要があったか  
   - Action（行動）: どのような行動を取ったか
   - Result（結果）: どのような結果が得られたか

2. **5 Whys**:
   - 表面的な回答に対して「なぜ？」を5回繰り返し
   - 根本的な問題や感情の本質を探る

**対話設計例**:
```typescript
const interviewPrompts = {
  opening: "今日はお時間をいただき、ありがとうございます。あなたの経験を、同じような悩みを持つ親子に伝えることで、きっと多くの人の助けになります。まず、最近ご両親との関係で印象に残っている出来事を教えてください。",
  
  star_situation: "その時の状況をもう少し詳しく教えてください。いつ頃のことで、どのような背景があったのでしょうか？",
  
  star_task: "その状況で、あなたが感じた一番の課題や困りごとは何でしたか？",
  
  whys_deeper: "なぜそのように感じたのでしょうか？その感情の根っこにあるものは何だと思いますか？"
};
```

#### 6.4.2. 高品質AI記事生成

**多段階AIエージェントモデル**:

1. **構成プランナーエージェント**:
```typescript
const structurePlannerPrompt = `
インタビューログを基に、読者に最大の価値を提供する記事構成を設計してください。

# 出力形式
## タイトル案（3つ）
## 記事構成
1. 導入部
2. 体験談セクション
3. 学びと洞察
4. 読者へのアドバイス
5. まとめ

# 考慮点
- 読者（同世代学生・親）の共感を呼ぶ構成
- 具体的なエピソードと普遍的な学びのバランス
- 行動に移しやすい実践的アドバイス
`;
```

2. **本文ライターエージェント**:
```typescript
const contentWriterPrompt = `
以下の構成プランに基づき、${selectedTone}のトーンで記事本文を執筆してください。

# トーンスタイル
- friendly: 親しみやすく、カジュアルな語りかけ
- professional: 丁寧で信頼性のある文体
- emotional: 感情に寄り添う温かい文体

# 品質基準
- 文字数: 2000-3000文字
- 段落: 3-4文で改行、読みやすさ重視
- 具体例: 抽象的な表現より具体的なエピソード重視
`;
```

3. **見出しコピーライターエージェント**:
```typescript
const headlineWriterPrompt = `
記事内容を基に、各セクションの魅力的な見出しを作成してください。

# 見出し作成基準
- 読者の興味を引くキャッチー要素
- 内容が想像できる具体性
- 感情的なフック（共感・驚き・希望）の組み込み
`;
```

### 6.5. コア機能詳細：記事編集機能

#### 6.5.1. note.com風WYSIWYGエディタ

**技術仕様**:
- ライブラリ: Tiptap (ProseMirror ベース)
- 機能: 見出し、太字、斜体、リスト、引用、画像挿入
- リアルタイム自動保存（1分間隔）

**実装例**:
```typescript
// components/ArticleEditor.tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const ArticleEditor = ({ content, onUpdate }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
  });

  return (
    <div className="prose prose-lg max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
};
```

#### 6.5.2. AI校正アシスタント機能

**機能概要**:
- 文章の自然さチェック
- 誤字脱字検出
- より良い表現の提案

**実装仕様**:
```typescript
const aiProofreadingPrompt = `
以下の文章を校正し、改善提案を行ってください。

# チェック項目
1. 誤字脱字
2. 文章の自然さ
3. より魅力的な表現への変更提案
4. 読みやすさの改善

# 出力形式
## 修正提案
- 元の文: "〜"
- 修正案: "〜"
- 理由: "〜"
`;
```

## 7. 非機能要件 (Non-Functional Requirements)

### 7.1. パフォーマンス要件

- **LCP (Largest Contentful Paint)**: 2.5秒以内
- **FID (First Input Delay)**: 100ms以内  
- **CLS (Cumulative Layout Shift)**: 0.1以下

**実装戦略**:
- Next.js App Router の Server Components 活用
- 画像の next/image による最適化
- フォントのプリロード設定

### 7.2. レスポンシブデザイン

**ブレークポイント**:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Tailwind CSS設定**:
```typescript
// tailwind.config.ts
module.exports = {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px', 
      'lg': '1024px',
      'xl': '1280px',
    }
  }
}
```

### 7.3. セキュリティ要件

#### 7.3.1. Supabase RLS (Row Level Security)

全テーブルでRLS有効化し、ユーザーは自身に関連するデータのみアクセス可能。

#### 7.3.2. 基本的脆弱性対策

- **SQLインジェクション**: Supabaseクライアントの型安全なクエリ使用
- **XSS**: Next.js の自動エスケープ + DOMPurify でのサニタイズ
- **CSRF**: Next.js の built-in CSRF protection
- **認証**: Supabase Auth の JWT トークン検証

#### 7.3.3. データ保護

```typescript
// 機密情報のマスキング
const sanitizeUserData = (user) => {
  const { email, ...publicData } = user;
  return {
    ...publicData,
    email: email.replace(/(.{2}).*(@.*)/, '$1***$2')
  };
};
```

### 7.4. 可用性・スケーラビリティ

- **アップタイム**: 99.9%以上（Vercel SLA準拠）
- **データベース**: Supabase の自動スケーリング活用
- **CDN**: Vercel Edge Network による世界配信
- **監視**: Vercel Analytics + Supabase ダッシュボード

---

このドキュメントは、プロジェクト『ありがとうお父さんお母さん』の開発における唯一の真実の情報源（Single Source of Truth）として機能します。実装時は本要件定義書に従い、変更が必要な場合は本ドキュメントを更新してください。