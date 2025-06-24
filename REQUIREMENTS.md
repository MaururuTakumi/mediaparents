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

### 5.4. ユーザー導線とマネタイズ戦略

#### 5.4.1. ペイウォール実装

**目的**: 有料プランへの自然な誘導とコンバージョン最適化

**実装仕様**:

**プレミアム記事のコンテンツブロック**:
```typescript
// components/PaywallGate.tsx
const PaywallGate = ({ article, user, subscription }) => {
  const [showGradient, setShowGradient] = useState(false);
  
  useEffect(() => {
    if (article.is_premium && !subscription) {
      const timer = setTimeout(() => setShowGradient(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (article.is_premium && !subscription) {
    return (
      <div className="relative">
        <div className={`transition-all duration-1000 ${showGradient ? 'opacity-50' : ''}`}>
          {article.content.substring(0, 500)}...
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
        
        <div className="text-center py-8 bg-white">
          <h3 className="text-2xl font-bold mb-4">続きを読むには会員登録が必要です</h3>
          <p className="text-gray-600 mb-6">
            月額1,480円で全記事読み放題 + 東大生への相談機能
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            初月無料で試す
          </Button>
        </div>
      </div>
    );
  }
  
  return <div dangerouslySetInnerHTML={{ __html: article.content }} />;
};
```

**閲覧数ベースのアップセル**:
```typescript
// hooks/useSubscriptionPrompt.ts
export const useSubscriptionPrompt = () => {
  const [articleCount, setArticleCount] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('articleViewCount') || '0');
    setArticleCount(count);
    
    if (count >= 3 && !user?.subscription) {
      setShowPrompt(true);
    }
  }, []);

  const incrementViewCount = () => {
    const newCount = articleCount + 1;
    setArticleCount(newCount);
    localStorage.setItem('articleViewCount', newCount.toString());
    
    if (newCount >= 3) {
      setShowPrompt(true);
    }
  };

  return { showPrompt, incrementViewCount, closePrompt: () => setShowPrompt(false) };
};
```

#### 5.4.2. コンバージョンUI設計

**追従型サブスクリプションバナー**:
```typescript
// components/SubscriptionBanner.tsx
const SubscriptionBanner = ({ show, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg z-50">
      <div className="container flex items-center justify-between">
        <div>
          <strong>月額1,480円で記事読み放題</strong>
          <span className="ml-2 text-blue-200">+ 東大生への個別相談</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">初月無料で試す</Button>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
            ×
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### 5.4.3. A/Bテスト設計

**テスト項目**:
- ペイウォール表示タイミング（即座 vs 3秒後 vs スクロール50%）
- CTAボタンテキスト（「初月無料」vs「1ヶ月お試し」vs「今すぐ始める」）
- プレミアム特典の訴求順序

**実装フレームワーク**:
```typescript
// utils/abtest.ts
export const getVariant = (testName: string): string => {
  const userId = user?.id || 'anonymous';
  const hash = btoa(userId + testName).slice(0, 10);
  const variants = ['A', 'B'];
  return variants[parseInt(hash, 36) % variants.length];
};
```

## 8. 機能要件：管理者向けサイト (app/(admin))

### 8.1. プロジェクト構造拡張

```
/app
├── (admin)/      # 管理者向けページ群
│   ├── dashboard/
│   │   ├── page.tsx                 # 管理ダッシュボード
│   │   ├── analytics/page.tsx       # 詳細分析
│   │   └── reports/page.tsx         # レポート生成
│   ├── writers/
│   │   ├── page.tsx                 # ライター管理一覧
│   │   ├── [id]/page.tsx           # ライター詳細
│   │   └── verification/page.tsx    # 認証申請管理
│   ├── articles/
│   │   ├── page.tsx                 # 記事管理一覧
│   │   ├── [id]/page.tsx           # 記事詳細・編集
│   │   └── moderation/page.tsx      # コンテンツ審査
│   ├── support/
│   │   ├── page.tsx                 # サポート一覧
│   │   ├── [id]/page.tsx           # チケット詳細
│   │   └── knowledge-base/page.tsx  # ナレッジベース
│   └── layout.tsx                   # 管理者認証保護
```

### 8.2. サイトマップ

- `/admin/dashboard` - 管理ダッシュボード
- `/admin/writers` - ライター管理
- `/admin/writers/verification` - 本人認証申請管理
- `/admin/articles` - 記事管理
- `/admin/articles/moderation` - コンテンツ審査
- `/admin/support` - ユーザーサポート
- `/admin/analytics` - 詳細分析
- `/admin/reports` - レポート生成

### 8.3. ページ別要件

#### 8.3.1. 管理ダッシュボード (`/admin/dashboard`)

**目的**: サービス全体のKPI監視と運営状況把握

**主要KPI表示**:
```typescript
interface AdminDashboardMetrics {
  // 収益関連
  totalRevenue: number;           // 総売上
  monthlyRevenue: number;         // 今月売上
  activeSubscriptions: number;    // アクティブサブスクリプション数
  churnRate: number;             // 解約率
  
  // ユーザー関連
  totalUsers: number;            // 総ユーザー数
  newUsersThisMonth: number;     // 今月新規ユーザー
  activeWriters: number;         // アクティブライター数
  verificationPending: number;   // 認証待ちライター数
  
  // コンテンツ関連
  totalArticles: number;         // 総記事数
  publishedThisMonth: number;    // 今月公開記事数
  averageViews: number;          // 平均閲覧数
  moderationQueue: number;       // 審査待ち記事数
}
```

**データ取得ロジック**:
```typescript
// lib/admin/dashboard-metrics.ts
export const getDashboardMetrics = async (): Promise<AdminDashboardMetrics> => {
  const supabase = createServerComponentClient({ cookies });
  
  const [
    { data: subscriptions },
    { data: users },
    { data: writers },
    { data: articles }
  ] = await Promise.all([
    supabase.from('subscriptions').select('*').eq('status', 'active'),
    supabase.from('auth.users').select('count'),
    supabase.from('writers').select('*'),
    supabase.from('articles').select('*')
  ]);

  return {
    totalRevenue: subscriptions?.reduce((sum, sub) => sum + sub.plan_price, 0) || 0,
    activeSubscriptions: subscriptions?.length || 0,
    totalUsers: users?.length || 0,
    verificationPending: writers?.filter(w => w.verification_status === 'pending').length || 0,
    // ... その他の計算
  };
};
```

#### 8.3.2. ライター管理 (`/admin/writers`)

**目的**: ライターの一覧表示、検索、本人認証管理

**主要機能**:
- ライター一覧（認証状況、活動状況、収益）
- 検索・フィルタリング（大学、認証状況、活動期間）
- 一括操作（認証承認/拒否、アカウント停止）

**本人認証ワークフロー**:
```typescript
// app/(admin)/writers/verification/page.tsx
const VerificationQueue = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);

  const handleApproval = async (writerId: string, approved: boolean, reason?: string) => {
    const { error } = await supabase
      .from('writers')
      .update({
        verification_status: approved ? 'approved' : 'rejected',
        is_verified: approved,
        updated_at: new Date().toISOString()
      })
      .eq('id', writerId);

    if (!error && !approved) {
      // 否認理由の通知メール送信
      await sendVerificationRejectionEmail(writerId, reason);
    }
  };

  return (
    <div className="space-y-4">
      {pendingVerifications.map(writer => (
        <VerificationCard
          key={writer.id}
          writer={writer}
          onApprove={() => handleApproval(writer.id, true)}
          onReject={(reason) => handleApproval(writer.id, false, reason)}
        />
      ))}
    </div>
  );
};
```

#### 8.3.3. コンテンツ管理 (`/admin/articles`)

**目的**: 記事の管理、審査、品質コントロール

**機能仕様**:

**記事一覧・検索**:
```typescript
interface ArticleFilter {
  status: 'all' | 'draft' | 'published' | 'archived';
  isPremium: boolean | 'all';
  writer: string | 'all';
  dateRange: { from: Date; to: Date } | null;
  searchTerm: string;
}

const ArticleManagement = () => {
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState<ArticleFilter>({
    status: 'all',
    isPremium: 'all',
    writer: 'all',
    dateRange: null,
    searchTerm: ''
  });

  const handleArchive = async (articleId: string, reason: string) => {
    await supabase
      .from('articles')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', articleId);
    
    // ライターへの通知
    await notifyWriterArticleArchived(articleId, reason);
  };

  return (
    <AdminTable
      data={articles}
      columns={articleColumns}
      filter={filter}
      onFilterChange={setFilter}
      actions={[
        { label: '公開', action: handlePublish },
        { label: 'アーカイブ', action: handleArchive },
        { label: '編集', action: handleEdit }
      ]}
    />
  );
};
```

#### 8.3.4. ユーザーサポート (`/admin/support`)

**目的**: ユーザーからの問い合わせ管理と対応

**データモデル**:
```sql
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    writer_id UUID REFERENCES writers(id),
    category VARCHAR(50) NOT NULL, -- 'billing', 'technical', 'content', 'other'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    subject VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    admin_response TEXT,
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);
```

**サポートインターフェース**:
```typescript
const SupportTicketDetail = ({ ticketId }) => {
  const [ticket, setTicket] = useState(null);
  const [response, setResponse] = useState('');

  const handleResponse = async () => {
    await supabase
      .from('support_tickets')
      .update({
        admin_response: response,
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', ticketId);

    // ユーザーへの回答メール送信
    await sendSupportResponse(ticket.user_id, response);
  };

  return (
    <div className="space-y-6">
      <TicketHeader ticket={ticket} />
      <TicketConversation ticket={ticket} />
      <ResponseForm
        value={response}
        onChange={setResponse}
        onSubmit={handleResponse}
      />
    </div>
  );
};
```

### 8.4. 管理者認証・認可

```typescript
// app/(admin)/layout.tsx
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    redirect('/login');
  }

  // 管理者権限チェック
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .single();

  if (!adminUser) {
    redirect('/dashboard'); // 通常ユーザーダッシュボードにリダイレクト
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader user={adminUser} />
      <AdminSidebar />
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
```

### 7.5. エラーハンドリングとエッジケース

#### 7.5.1. 決済エラーハンドリング

**Stripe決済失敗時の処理フロー**:

```typescript
// lib/stripe/error-handling.ts
export const handlePaymentFailure = async (subscriptionId: string, errorCode: string) => {
  const supabase = createServerComponentClient({ cookies });
  
  const errorMessages = {
    'card_declined': 'カードが拒否されました。別のカードをお試しください。',
    'insufficient_funds': '残高不足です。カード情報を更新してください。',
    'expired_card': 'カードの有効期限が切れています。',
    'incorrect_cvc': 'セキュリティコードが正しくありません。',
    'generic_decline': '決済が失敗しました。カード会社にお問い合わせください。'
  };

  // サブスクリプション状態を past_due に更新
  await supabase
    .from('subscriptions')
    .update({ 
      status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscriptionId);

  // ユーザーへの通知メール送信
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (subscription) {
    await sendPaymentFailureNotification(
      subscription.user_id,
      errorMessages[errorCode] || errorMessages['generic_decline']
    );
  }
};

// Webhook での処理
export const handleStripeWebhook = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handlePaymentFailure(
        paymentIntent.metadata.subscription_id,
        paymentIntent.last_payment_error?.code || 'generic_decline'
      );
      break;
    
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.status === 'past_due') {
        await handleSubscriptionPastDue(subscription.id);
      }
      break;
  }
};
```

**ユーザー向け決済エラーUI**:
```typescript
const PaymentErrorModal = ({ error, onRetry, onUpdateCard }) => {
  const getErrorMessage = (errorCode: string) => {
    const messages = {
      'card_declined': {
        title: 'カードが拒否されました',
        message: '別のお支払い方法をお試しいただくか、カード会社にお問い合わせください。',
        action: '別のカードを試す'
      },
      'insufficient_funds': {
        title: '残高不足です',
        message: 'カードの残高が不足しています。別のカードをご利用ください。',
        action: 'カード情報を更新'
      }
    };
    return messages[errorCode] || messages['card_declined'];
  };

  const errorInfo = getErrorMessage(error.code);

  return (
    <Modal>
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">{errorInfo.title}</h3>
        <p className="text-gray-600 mb-6">{errorInfo.message}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onUpdateCard}>{errorInfo.action}</Button>
          <Button variant="outline" onClick={onRetry}>再試行</Button>
        </div>
      </div>
    </Modal>
  );
};
```

#### 7.5.2. 本人認証エラーハンドリング

**認証書類不備時の処理**:

```typescript
// lib/verification/rejection-handler.ts
export const handleVerificationRejection = async (
  writerId: string, 
  rejectionReasons: string[]
) => {
  const supabase = createServerComponentClient({ cookies });

  const rejectionMessages = {
    'blurry_image': '画像がぼやけて読み取れません。より鮮明な写真を撮影してください。',
    'expired_document': '学生証の有効期限が切れています。現在有効な学生証をアップロードしてください。',
    'wrong_document': '学生証以外の書類がアップロードされています。学生証の写真をお送りください。',
    'incomplete_info': '必要な情報が見切れています。学生証の全体が写るように撮影してください。',
    'fake_document': '書類の真正性に疑いがあります。正式な学生証をアップロードしてください。'
  };

  // 拒否理由を記録
  await supabase
    .from('verification_rejections')
    .insert({
      writer_id: writerId,
      rejection_reasons: rejectionReasons,
      rejection_messages: rejectionReasons.map(r => rejectionMessages[r]),
      created_at: new Date().toISOString()
    });

  // ライターに通知メール送信
  const { data: writer } = await supabase
    .from('writers')
    .select('auth_id')
    .eq('id', writerId)
    .single();

  if (writer) {
    await sendVerificationRejectionEmail(writer.auth_id, rejectionReasons);
  }
};
```

#### 7.5.3. AI生成コンテンツエラーハンドリング

**不適切コンテンツ検出システム**:

```typescript
// lib/ai/content-moderation.ts
export const moderateContent = async (content: string): Promise<{
  isAppropriate: boolean;
  flags: string[];
  confidence: number;
}> => {
  const prohibitedTerms = [
    // 差別的表現
    '差別語1', '差別語2',
    // 暴力的表現
    '暴力語1', '暴力語2',
    // 不適切な商業的内容
    '商品名', 'URL'
  ];

  const flags = [];
  let confidence = 1.0;

  // 禁止ワードチェック
  for (const term of prohibitedTerms) {
    if (content.includes(term)) {
      flags.push(`prohibited_term: ${term}`);
      confidence -= 0.2;
    }
  }

  // AI による不適切コンテンツ検出
  const aiModerationResult = await openai.createModeration({
    input: content
  });

  if (aiModerationResult.data.results[0].flagged) {
    flags.push('ai_moderation_flagged');
    confidence -= 0.5;
  }

  return {
    isAppropriate: confidence > 0.7,
    flags,
    confidence
  };
};

// 記事公開前の自動チェック
export const validateArticleBeforePublish = async (articleId: string) => {
  const { data: article } = await supabase
    .from('articles')
    .select('content, title')
    .eq('id', articleId)
    .single();

  const [titleCheck, contentCheck] = await Promise.all([
    moderateContent(article.title),
    moderateContent(article.content)
  ]);

  if (!titleCheck.isAppropriate || !contentCheck.isAppropriate) {
    // 管理者に通知
    await notifyAdminInappropriateContent(articleId, [
      ...titleCheck.flags,
      ...contentCheck.flags
    ]);

    // 記事を下書き状態に戻す
    await supabase
      .from('articles')
      .update({ status: 'draft' })
      .eq('id', articleId);

    return false;
  }

  return true;
};
```

### 6.6. AI品質管理とガードレール

#### 6.6.1. 公開前レビューシステム

**AI生成記事の品質管理フロー**:

```typescript
// lib/ai/quality-control.ts
export const processAIGeneratedArticle = async (interviewId: string) => {
  const { data: interview } = await supabase
    .from('interviews')
    .select('*')
    .eq('id', interviewId)
    .single();

  // AI記事生成
  const generatedContent = await generateArticleFromInterview(interview);
  
  // 品質チェック実行
  const qualityScore = await assessArticleQuality(generatedContent);
  
  // 記事をdraft状態で保存
  const { data: article } = await supabase
    .from('articles')
    .insert({
      writer_id: interview.writer_id,
      title: generatedContent.title,
      content: generatedContent.content,
      status: 'draft', // 必ずdraft状態で開始
      ai_quality_score: qualityScore,
      requires_review: qualityScore < 0.8, // スコアが低い場合は要レビュー
      generated_from_interview_id: interviewId
    })
    .select()
    .single();

  // インタビューテーブルに生成記事IDを関連付け
  await supabase
    .from('interviews')
    .update({ generated_article_id: article.id })
    .eq('id', interviewId);

  return article;
};
```

**品質評価システム**:
```typescript
interface QualityMetrics {
  readability: number;        // 読みやすさ (0-1)
  coherence: number;         // 一貫性 (0-1)
  factualAccuracy: number;   // 事実精度 (0-1)
  originalityCheck: number;  // 独自性 (0-1)
  emotionalTone: number;     // 感情的な適切さ (0-1)
}

export const assessArticleQuality = async (content: string): Promise<number> => {
  const qualityPrompt = `
以下の記事の品質を以下の5つの観点で評価してください（各項目0-10点）：

1. 読みやすさ：文章が自然で理解しやすいか
2. 一貫性：論理的な流れがあり、矛盾がないか  
3. 事実精度：明らかな誤情報や不正確な表現がないか
4. 独自性：一般的でない個人的な体験や洞察があるか
5. 感情的適切さ：読者に寄り添う適切なトーンか

記事内容：
${content}

JSON形式で回答：
{
  "readability": 8,
  "coherence": 7,
  "factualAccuracy": 9,
  "originalityCheck": 6,
  "emotionalTone": 8,
  "totalScore": 7.6,
  "feedback": "改善提案があれば記載"
}
`;

  const response = await openai.createChatCompletion({
    model: 'gpt-4',
    messages: [{ role: 'user', content: qualityPrompt }],
    temperature: 0.1
  });

  const evaluation = JSON.parse(response.data.choices[0].message.content);
  return evaluation.totalScore / 10; // 0-1スケールに正規化
};
```

#### 6.6.2. 禁止ワードリストシステム

**多層的コンテンツフィルタリング**:

```sql
-- 禁止ワード管理テーブル
CREATE TABLE content_filters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- 'discriminatory', 'violent', 'commercial', 'inappropriate'
    term VARCHAR(200) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- コンテンツ検証ログテーブル
CREATE TABLE content_moderation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id),
    check_type VARCHAR(50) NOT NULL, -- 'prohibited_words', 'ai_moderation', 'manual_review'
    flags JSONB,
    confidence_score DECIMAL(3,2),
    action_taken VARCHAR(50), -- 'approved', 'flagged', 'rejected', 'requires_review'
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

```typescript
// lib/moderation/content-filter.ts
export class ContentModerationEngine {
  private prohibitedTerms: Map<string, { category: string; severity: string }> = new Map();

  async loadFilters() {
    const { data: filters } = await supabase
      .from('content_filters')
      .select('*')
      .eq('is_active', true);

    filters?.forEach(filter => {
      this.prohibitedTerms.set(filter.term, {
        category: filter.category,
        severity: filter.severity
      });
    });
  }

  async moderateContent(content: string, articleId: string): Promise<{
    approved: boolean;
    flags: string[];
    requiresReview: boolean;
    confidenceScore: number;
  }> {
    const flags = [];
    let confidenceScore = 1.0;
    let criticalIssues = 0;

    // 禁止ワードチェック
    for (const [term, config] of this.prohibitedTerms) {
      if (content.toLowerCase().includes(term.toLowerCase())) {
        flags.push(`${config.category}:${term}`);
        
        switch (config.severity) {
          case 'critical':
            confidenceScore -= 0.5;
            criticalIssues++;
            break;
          case 'high':
            confidenceScore -= 0.3;
            break;
          case 'medium':
            confidenceScore -= 0.1;
            break;
        }
      }
    }

    // OpenAI Moderation API
    const moderationResult = await openai.createModeration({
      input: content
    });

    if (moderationResult.data.results[0].flagged) {
      flags.push('openai_moderation_flagged');
      confidenceScore -= 0.4;
    }

    const approved = confidenceScore > 0.7 && criticalIssues === 0;
    const requiresReview = confidenceScore < 0.8 || criticalIssues > 0;

    // ログに記録
    await supabase
      .from('content_moderation_logs')
      .insert({
        article_id: articleId,
        check_type: 'automated_moderation',
        flags,
        confidence_score: confidenceScore,
        action_taken: approved ? 'approved' : requiresReview ? 'requires_review' : 'rejected'
      });

    return { approved, flags, requiresReview, confidenceScore };
  }
}
```

#### 6.6.3. プロンプトバージョン管理

**プロンプト履歴管理システム**:

```sql
-- プロンプトバージョン管理テーブル
CREATE TABLE ai_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt_type VARCHAR(50) NOT NULL, -- 'interview', 'article_generation', 'title_generation'
    version VARCHAR(20) NOT NULL,
    prompt_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    performance_metrics JSONB, -- success_rate, quality_scores等
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 実行ログとプロンプトの関連付け
ALTER TABLE interviews ADD COLUMN prompt_version VARCHAR(20);
ALTER TABLE articles ADD COLUMN generation_prompt_version VARCHAR(20);
```

```typescript
// lib/ai/prompt-management.ts
export class PromptManager {
  async getActivePrompt(promptType: string): Promise<{
    id: string;
    version: string;
    content: string;
  }> {
    const { data: prompt } = await supabase
      .from('ai_prompts')
      .select('*')
      .eq('prompt_type', promptType)
      .eq('is_active', true)
      .single();

    if (!prompt) {
      throw new Error(`No active prompt found for type: ${promptType}`);
    }

    return prompt;
  }

  async trackPromptUsage(promptId: string, interviewId: string, success: boolean, qualityScore?: number) {
    // 使用実績を記録
    await supabase
      .from('prompt_usage_logs')
      .insert({
        prompt_id: promptId,
        interview_id: interviewId,
        success,
        quality_score: qualityScore,
        created_at: new Date().toISOString()
      });

    // プロンプトのパフォーマンス指標を更新
    await this.updatePromptMetrics(promptId);
  }

  private async updatePromptMetrics(promptId: string) {
    const { data: logs } = await supabase
      .from('prompt_usage_logs')
      .select('success, quality_score')
      .eq('prompt_id', promptId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 過去30日

    if (logs && logs.length > 0) {
      const successRate = logs.filter(log => log.success).length / logs.length;
      const avgQualityScore = logs.reduce((sum, log) => sum + (log.quality_score || 0), 0) / logs.length;

      await supabase
        .from('ai_prompts')
        .update({
          performance_metrics: {
            success_rate: successRate,
            avg_quality_score: avgQualityScore,
            total_uses: logs.length,
            last_updated: new Date().toISOString()
          }
        })
        .eq('id', promptId);
    }
  }
}

// インタビュー実行時のプロンプトバージョン記録
export const conductAIInterview = async (writerId: string) => {
  const promptManager = new PromptManager();
  const interviewPrompt = await promptManager.getActivePrompt('interview');

  const { data: interview } = await supabase
    .from('interviews')
    .insert({
      writer_id: writerId,
      prompt_version: interviewPrompt.version, // バージョンを記録
      conversation_log: [],
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  // インタビュー実行...
  const success = await executeInterview(interview.id, interviewPrompt.content);
  
  // プロンプトの使用実績を記録
  await promptManager.trackPromptUsage(interviewPrompt.id, interview.id, success);

  return interview;
};
```

### 7.6. 環境変数とシークレット管理

#### 7.6.1. 環境変数テンプレート

**プロジェクトルートに配置する `.env.local.example`**:

```bash
# ================================================================
# 『ありがとうお父さんお母さん』環境変数テンプレート
# ================================================================
# このファイルをコピーして .env.local を作成し、実際の値を設定してください
# 

# ================================================================
# Next.js 基本設定
# ================================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="ありがとうお父さんお母さん"

# ================================================================
# Supabase 設定
# ================================================================
# Supabase プロジェクトURL (Settings > API > Project URL)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key (Settings > API > Project API keys > anon public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (Settings > API > Project API keys > service_role)
# ⚠️ 重要: 本番環境でのみ使用。フロントエンドには絶対に公開しない
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ================================================================
# OpenAI API 設定
# ================================================================
# OpenAI API Key (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-...

# 使用するAIモデル (推奨: gpt-4 または gpt-3.5-turbo)
OPENAI_MODEL=gpt-4

# ================================================================
# Stripe 決済設定
# ================================================================
# Stripe Publishable Key (Dashboard > API keys > Publishable key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Secret Key (Dashboard > API keys > Secret key)
STRIPE_SECRET_KEY=sk_test_...

# Stripe Webhook Secret (Dashboard > Webhooks > Endpoint secrets)
STRIPE_WEBHOOK_SECRET=whsec_...

# ================================================================
# メール送信設定 (Resend)
# ================================================================
# Resend API Key (https://resend.com/api-keys)
RESEND_API_KEY=re_...

# 送信元メールアドレス
FROM_EMAIL=noreply@example.com

# ================================================================
# ファイルアップロード設定
# ================================================================
# Cloudinary設定 (画像アップロード用)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456

# ================================================================
# 分析・監視設定
# ================================================================
# Google Analytics Measurement ID (任意)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Sentry DSN (エラー監視用、任意)
SENTRY_DSN=https://...@sentry.io/...

# ================================================================
# 開発・テスト環境設定
# ================================================================
# 開発環境フラグ
NODE_ENV=development

# テスト用ダミーデータフラグ (true/false)
USE_MOCK_DATA=false

# APIレート制限の無効化 (開発時のみ true推奨)
DISABLE_RATE_LIMITING=true

# ================================================================
# セキュリティ設定
# ================================================================
# JWT Secret (ランダムな文字列を生成)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# セッション暗号化キー (ランダムな32文字以上の文字列)
SESSION_SECRET=your-session-secret-key-change-this-in-production

# CORS許可オリジン (本番環境では実際のドメインに変更)
ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

#### 7.6.2. Vercel環境変数設定

**本番環境・プレビュー環境での環境変数管理**:

```bash
# Vercel CLI を使用した環境変数の一括設定
# (vercel-env-setup.sh)

#!/bin/bash

echo "🚀 Vercel環境変数セットアップスクリプト"
echo "本番環境とプレビュー環境に必要な環境変数を設定します"

# Production環境の設定
echo "📋 Production環境の設定..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add OPENAI_API_KEY production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add RESEND_API_KEY production

# Preview環境の設定
echo "📋 Preview環境の設定..."
vercel env add NEXT_PUBLIC_SUPABASE_URL preview
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY preview  
vercel env add SUPABASE_SERVICE_ROLE_KEY preview
vercel env add OPENAI_API_KEY preview
vercel env add STRIPE_SECRET_KEY preview
vercel env add RESEND_API_KEY preview

echo "✅ 環境変数の設定が完了しました"
echo "ℹ️  Vercel ダッシュボードで設定内容を確認してください"
```

#### 7.6.3. 開発者オンボーディングプロセス

**新規開発者向けセットアップガイド**:

```markdown
<!-- docs/DEVELOPMENT_SETUP.md -->

# 開発環境セットアップガイド

## 🚀 クイックスタート

### 1. プロジェクトクローン
```bash
git clone https://github.com/your-org/arigatou-otousan-okaasan.git
cd arigatou-otousan-okaasan
```

### 2. 依存関係インストール
```bash
npm install
```

### 3. 環境変数設定
```bash
# テンプレートファイルをコピー
cp .env.local.example .env.local

# 必要な環境変数を設定（チームリーダーから取得）
# vim .env.local
```

### 4. データベースセットアップ
```bash
# Supabaseプロジェクトにアクセス権限を付与してもらう
# データベースマイグレーション実行
npm run db:reset
```

### 5. 開発サーバー起動
```bash
npm run dev
```

## 🔐 環境変数の取得方法

### 開発チーム向け
1. チームリーダーに開発環境の環境変数を依頼
2. 安全な方法で受け取り（Slack DM、暗号化ファイル等）
3. `.env.local` ファイルに設定

### 必須環境変数チェックリスト
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `OPENAI_API_KEY`
- [ ] `STRIPE_SECRET_KEY`（決済機能開発時のみ）

## 🧪 テスト環境

### テストデータベース使用
```bash
# テスト用Supabaseプロジェクトの環境変数を設定
NEXT_PUBLIC_SUPABASE_URL=https://test-project.supabase.co
# ... その他テスト環境用の値
```

### モックデータ使用
```bash
# .env.local でモックデータを有効化
USE_MOCK_DATA=true
```
```

#### 7.6.4. シークレット管理のベストプラクティス

**セキュリティガイドライン**:

```typescript
// lib/config/secrets.ts
/**
 * 環境変数の安全な取得と検証
 */
class SecretsManager {
  private requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY'
  ];

  constructor() {
    this.validateEnvironment();
  }

  private validateEnvironment() {
    const missing = this.requiredEnvVars.filter(
      envVar => !process.env[envVar]
    );

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}\n` +
        'Please check your .env.local file and ensure all required variables are set.'
      );
    }
  }

  // 安全な環境変数取得（デフォルト値なし）
  getRequired(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }

  // 安全な環境変数取得（デフォルト値あり）
  getOptional(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  // 本番環境チェック
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  // 開発環境チェック
  isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
}

export const secrets = new SecretsManager();

// 使用例
export const config = {
  supabase: {
    url: secrets.getRequired('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: secrets.getRequired('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: secrets.getRequired('SUPABASE_SERVICE_ROLE_KEY')
  },
  openai: {
    apiKey: secrets.getRequired('OPENAI_API_KEY'),
    model: secrets.getOptional('OPENAI_MODEL', 'gpt-3.5-turbo')
  },
  stripe: {
    publishableKey: secrets.getRequired('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    secretKey: secrets.getRequired('STRIPE_SECRET_KEY'),
    webhookSecret: secrets.getRequired('STRIPE_WEBHOOK_SECRET')
  }
};
```

**開発者間での安全なシークレット共有**:

```typescript
// scripts/setup-dev-env.ts
/**
 * 開発環境セットアップの自動化
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { prompt } from 'inquirer';

async function setupDevelopmentEnvironment() {
  console.log('🔧 開発環境セットアップを開始します...');

  // .env.local の存在確認
  if (existsSync('.env.local')) {
    const { overwrite } = await prompt([{
      type: 'confirm',
      name: 'overwrite',
      message: '.env.local が既に存在します。上書きしますか？',
      default: false
    }]);

    if (!overwrite) {
      console.log('セットアップをキャンセルしました');
      return;
    }
  }

  // 環境変数の入力
  const { envSource } = await prompt([{
    type: 'list',
    name: 'envSource',
    message: '環境変数の取得方法を選択してください:',
    choices: [
      { name: 'チームリーダーから提供されたファイルを使用', value: 'file' },
      { name: '手動で入力', value: 'manual' },
      { name: 'テスト用ダミーデータを使用', value: 'mock' }
    ]
  }]);

  let envContent = '';

  switch (envSource) {
    case 'file':
      const { filePath } = await prompt([{
        type: 'input',
        name: 'filePath',
        message: '環境変数ファイルのパスを入力してください:'
      }]);
      envContent = readFileSync(filePath, 'utf-8');
      break;

    case 'manual':
      envContent = await collectEnvironmentVariablesManually();
      break;

    case 'mock':
      envContent = generateMockEnvironmentVariables();
      break;
  }

  // .env.local に書き込み
  writeFileSync('.env.local', envContent);
  console.log('✅ .env.local ファイルを作成しました');

  // 依存関係のインストール
  console.log('📦 依存関係をインストールしています...');
  execSync('npm install', { stdio: 'inherit' });

  // データベース初期化
  if (envSource !== 'mock') {
    const { initDb } = await prompt([{
      type: 'confirm',
      name: 'initDb',
      message: 'データベースを初期化しますか？',
      default: true
    }]);

    if (initDb) {
      console.log('🗄️ データベースを初期化しています...');
      execSync('npm run db:reset', { stdio: 'inherit' });
    }
  }

  console.log('🎉 開発環境のセットアップが完了しました！');
  console.log('次のコマンドで開発サーバーを起動できます: npm run dev');
}

// スクリプト実行
if (require.main === module) {
  setupDevelopmentEnvironment().catch(console.error);
}
```

## 5.4. ユーザー導線とマネタイズ戦略

### 5.4.1. ユーザージャーニーマップ

**新規ユーザー（保護者）の導線**:
```
ランディングページ → 無料記事閲覧 → プレミアム記事制限 → 無料登録 → 1ヶ月無料体験 → 有料契約
```

**重要な転換ポイント（コンバージョンファネル）**:
1. **認知→関心**: SEO記事、SNS広告、口コミ
2. **関心→検討**: 無料記事の価値体験、東大生ブランド
3. **検討→試用**: 1ヶ月無料体験、簡単登録プロセス
4. **試用→契約**: 個別相談、限定コンテンツの体験
5. **契約→継続**: 継続的価値提供、コミュニティ参加

### 5.4.2. マネタイズ戦略

**収益モデル**:
```typescript
interface RevenueStream {
  source: 'subscription' | 'seminar' | 'consultation' | 'affiliate';
  monthlyTarget: number;
  conversionRate: number;
  averagePrice: number;
}

const revenueTargets: RevenueStream[] = [
  {
    source: 'subscription',
    monthlyTarget: 500,  // 500名
    conversionRate: 0.15, // 15%
    averagePrice: 1480
  },
  {
    source: 'seminar',
    monthlyTarget: 20, // 20回開催
    conversionRate: 0.8, // 80%満席
    averagePrice: 3000
  }
];
```

**段階的収益化計画**:
- **Phase 1 (0-6ヶ月)**: 基本サブスクリプション、月間100名目標
- **Phase 2 (6-12ヶ月)**: 座談会サービス追加、月間300名目標
- **Phase 3 (12-18ヶ月)**: 個別コンサル、アフィリエイト、月間500名目標

### 5.4.3. ユーザーリテンション戦略

**継続率向上施策**:
1. **オンボーディング強化**: 初回体験の質向上
2. **パーソナライゼーション**: AI推薦システムによる個別最適化
3. **コミュニティエンゲージメント**: 保護者同士の交流促進
4. **継続的価値提供**: 月2回の新規コンテンツ配信

## 8. 機能要件：管理者向けサイト

### 8.1. 管理者ダッシュボード (`/admin`)

**アクセス制御**:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('supabase-auth-token');
    const { data: { user } } = await supabase.auth.getUser(token?.value);
    
    // 管理者権限チェック
    const { data: adminProfile } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user?.id)
      .single();
    
    if (!adminProfile || !['admin', 'moderator'].includes(adminProfile.role)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
}
```

**管理者テーブル**:
```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role admin_role DEFAULT 'moderator',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id)
);

CREATE TYPE admin_role AS ENUM ('admin', 'moderator', 'content_reviewer');
```

### 8.2. コンテンツ管理機能

**記事審査ワークフロー**:
```typescript
interface ArticleReviewQueue {
  articleId: string;
  writerName: string;
  submittedAt: string;
  status: 'pending' | 'reviewing' | 'approved' | 'rejected';
  reviewerName?: string;
  rejectionReason?: string;
}

// app/(admin)/content/review/page.tsx
export default function ArticleReviewPage() {
  const [articles, setArticles] = useState<ArticleReviewQueue[]>([]);
  
  const handleReview = async (articleId: string, approved: boolean, reason?: string) => {
    await supabase
      .from('articles')
      .update({
        status: approved ? 'published' : 'rejected',
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq('id', articleId);
    
    // ライターへの通知
    await sendNotificationToWriter(articleId, approved, reason);
  };
}
```

### 8.3. ユーザー管理・分析機能

**ユーザー分析ダッシュボード**:
```typescript
interface UserAnalytics {
  totalUsers: number;
  activeSubscribers: number;
  churnRate: number;
  avgSessionDuration: number;
  popularContent: Array<{
    title: string;
    views: number;
    engagement: number;
  }>;
}

// app/(admin)/analytics/page.tsx
export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<UserAnalytics>();
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      const [users, subscriptions, sessions, content] = await Promise.all([
        supabase.from('auth.users').select('count'),
        supabase.from('subscriptions').select('*').eq('status', 'active'),
        supabase.from('user_sessions').select('duration').gte('created_at', getLastMonth()),
        supabase.from('articles').select('title, view_count, like_count').order('view_count', { ascending: false }).limit(10)
      ]);
      
      setMetrics({
        totalUsers: users.count,
        activeSubscribers: subscriptions.length,
        churnRate: calculateChurnRate(subscriptions),
        avgSessionDuration: calculateAvgDuration(sessions),
        popularContent: content.map(c => ({
          title: c.title,
          views: c.view_count,
          engagement: c.like_count / c.view_count
        }))
      });
    };
    
    fetchAnalytics();
  }, []);
}
```

## 7.5. エラーハンドリングとエッジケース

### 7.5.1. グローバルエラーハンドリング

**React Error Boundary**:
```typescript
// components/error-boundary.tsx
export class ErrorBoundary extends Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログ送信
    logError({
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userId: getCurrentUserId(),
      timestamp: new Date().toISOString()
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onRetry={() => this.setState({ hasError: false })} />;
    }
    return this.props.children;
  }
}
```

**API エラーハンドリング**:
```typescript
// lib/api-client.ts
export class ApiClient {
  private async handleRequest<T>(request: () => Promise<T>): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (error instanceof AuthError) {
        // 認証エラー → ログインページへリダイレクト
        window.location.href = '/login';
        throw error;
      } else if (error instanceof NetworkError) {
        // ネットワークエラー → リトライ機構
        return this.retryRequest(request, 3);
      } else if (error instanceof ValidationError) {
        // バリデーションエラー → ユーザーフレンドリーなメッセージ
        throw new UserFriendlyError(error.message);
      } else {
        // 予期しないエラー → エラー報告 + フォールバック
        reportError(error);
        throw new UserFriendlyError('申し訳ございません。一時的な問題が発生しました。');
      }
    }
  }
}
```

### 7.5.2. データ整合性とエッジケース

**決済処理のエラーハンドリング**:
```typescript
// lib/subscription/payment-handler.ts
export async function processSubscription(userId: string, planId: string) {
  const transaction = await supabase.from('payment_transactions').insert({
    user_id: userId,
    plan_id: planId,
    status: 'processing',
    created_at: new Date().toISOString()
  }).select().single();

  try {
    // Stripe 決済処理
    const stripeResult = await stripe.subscriptions.create({
      customer: userId,
      items: [{ price: planId }]
    });

    if (stripeResult.status === 'active') {
      // 成功時：サブスクリプション有効化
      await Promise.all([
        supabase.from('subscriptions').insert({
          user_id: userId,
          stripe_subscription_id: stripeResult.id,
          status: 'active'
        }),
        supabase.from('payment_transactions').update({
          status: 'completed',
          stripe_transaction_id: stripeResult.id
        }).eq('id', transaction.id)
      ]);
    } else {
      throw new PaymentError('決済が完了しませんでした');
    }
  } catch (error) {
    // 失敗時：トランザクション状態更新
    await supabase.from('payment_transactions').update({
      status: 'failed',
      error_message: error.message
    }).eq('id', transaction.id);
    
    throw error;
  }
}
```

**並行処理での競合状態対策**:
```typescript
// lib/database/optimistic-locking.ts
export async function updateArticleWithOptimisticLocking(
  articleId: string, 
  updates: Partial<Article>, 
  expectedVersion: number
) {
  const { data, error } = await supabase
    .from('articles')
    .update({
      ...updates,
      version: expectedVersion + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', articleId)
    .eq('version', expectedVersion) // 楽観的ロック
    .select();

  if (!data || data.length === 0) {
    throw new ConcurrencyError('記事が他のユーザーによって更新されました。ページを再読み込みしてください。');
  }

  return data[0];
}
```

## 6.6. AI品質管理とガードレール

### 6.6.1. AI応答品質管理

**プロンプトエンジニアリング**:
```typescript
// lib/ai/prompt-templates.ts
export const INTERVIEW_PROMPT_TEMPLATE = `
あなたは教育熱心な保護者向けのインタビュアーです。
現役東大生である{writer_name}さんに、以下のガイドラインに従ってインタビューを行ってください。

【重要な制約】
1. 必ず丁寧語で質問してください
2. 保護者が子育ての参考にできる具体的な内容を引き出してください
3. 個人情報（住所、電話番号等）は聞かないでください
4. 政治的・宗教的な話題は避けてください
5. 1回の質問は50文字以内にしてください

【推奨する質問テーマ】
- 幼少期の学習習慣
- 保護者との関わり方
- 困難を乗り越えた体験
- 好奇心を育んだきっかけ

【現在の会話の文脈】
{conversation_context}

【次の質問を生成してください】
`;

export const generateInterviewQuestion = async (context: string) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'system',
      content: INTERVIEW_PROMPT_TEMPLATE.replace('{conversation_context}', context)
    }],
    max_tokens: 100,
    temperature: 0.7
  });
  
  return response.choices[0].message.content;
};
```

**AI応答フィルタリング**:
```typescript
// lib/ai/content-moderation.ts
export async function moderateAIResponse(content: string): Promise<{
  approved: boolean;
  reasons: string[];
  filteredContent?: string;
}> {
  const checks = await Promise.all([
    checkInappropriateContent(content),
    checkPersonalInfoLeak(content),
    checkFactualAccuracy(content),
    checkToneAndManner(content)
  ]);

  const failed = checks.filter(check => !check.passed);
  
  if (failed.length > 0) {
    return {
      approved: false,
      reasons: failed.map(f => f.reason)
    };
  }

  return {
    approved: true,
    reasons: [],
    filteredContent: content
  };
}

async function checkInappropriateContent(content: string) {
  // OpenAI Moderation API使用
  const moderation = await openai.moderations.create({ input: content });
  return {
    passed: !moderation.results[0].flagged,
    reason: moderation.results[0].flagged ? '不適切なコンテンツが検出されました' : ''
  };
}
```

### 6.6.2. AI学習データ管理

**成功パターンの学習**:
```typescript
// lib/ai/learning-data.ts
export interface ConversationFeedback {
  conversationId: string;
  userId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback: string;
  useful_questions: string[];
  problematic_responses: string[];
}

export async function collectFeedbackForLearning(feedback: ConversationFeedback) {
  // フィードバックデータを蓄積
  await supabase.from('ai_feedback').insert({
    conversation_id: feedback.conversationId,
    user_id: feedback.userId,
    rating: feedback.rating,
    feedback_text: feedback.feedback,
    useful_patterns: feedback.useful_questions,
    problematic_patterns: feedback.problematic_responses
  });

  // 高評価のパターンを分析してプロンプト改善
  if (feedback.rating >= 4) {
    await analyzeSuccessPatterns(feedback);
  }
}

async function analyzeSuccessPatterns(feedback: ConversationFeedback) {
  const patterns = await extractQuestionPatterns(feedback.useful_questions);
  
  // プロンプトテンプレートの改善提案を生成
  await supabase.from('prompt_improvements').insert({
    pattern_type: 'successful_question',
    pattern_content: patterns,
    confidence_score: calculateConfidence(patterns),
    suggested_at: new Date().toISOString()
  });
}
```

## 7.6. 環境変数とシークレット管理

### 7.6.1. 環境変数定義

**必須環境変数**:
```bash
# .env.example
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key

# Stripe Configuration (本番環境用)
STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Stripe Configuration (テスト環境用)
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_your-stripe-test-key
STRIPE_SECRET_KEY_TEST=sk_test_your-stripe-test-key

# Application Configuration
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-nextauth-secret
NODE_ENV=production

# Email Configuration (SendGrid等)
SENDGRID_API_KEY=SG.your-sendgrid-api-key
FROM_EMAIL=noreply@your-domain.com

# Analytics (オプション)
GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
MIXPANEL_TOKEN=your-mixpanel-token
```

### 7.6.2. 開発環境セットアップ

**自動セットアップスクリプト**:
```typescript
// scripts/setup-dev-env.ts
import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { prompt } from 'inquirer';

export async function setupDevelopmentEnvironment() {
  console.log('🚀 開発環境をセットアップしています...');

  // 1. 環境変数の設定
  if (!existsSync('.env.local')) {
    const envConfig = await collectEnvironmentVariables();
    writeFileSync('.env.local', envConfig);
    console.log('✅ .env.local ファイルを作成しました');
  }

  // 2. 依存関係のインストール
  console.log('📦 依存関係をインストールしています...');
  execSync('npm install', { stdio: 'inherit' });

  // 3. Supabase プロジェクトの初期化
  const { initSupabase } = await prompt([{
    type: 'confirm',
    name: 'initSupabase',
    message: 'Supabaseプロジェクトを初期化しますか？',
    default: true
  }]);

  if (initSupabase) {
    await initializeSupabaseProject();
  }

  // 4. サンプルデータの投入
  const { seedData } = await prompt([{
    type: 'confirm',
    name: 'seedData',
    message: 'サンプルデータを投入しますか？',
    default: true
  }]);

  if (seedData) {
    await seedDevelopmentData();
  }

  console.log('🎉 開発環境のセットアップが完了しました！');
  console.log('次のコマンドで開発サーバーを起動してください: npm run dev');
}

async function collectEnvironmentVariables(): Promise<string> {
  const { envSource } = await prompt([{
    type: 'list',
    name: 'envSource',
    message: '環境変数の設定方法を選択してください:',
    choices: [
      { name: '既存の.envファイルから読み込み', value: 'file' },
      { name: '手動で入力', value: 'manual' },
      { name: 'モック値を使用（テスト用）', value: 'mock' }
    ]
  }]);

  switch (envSource) {
    case 'file':
      const { filePath } = await prompt([{
        type: 'input',
        name: 'filePath',
        message: '環境変数ファイルのパスを入力してください:'
      }]);
      return readFileSync(filePath, 'utf-8');

    case 'manual':
      return await collectEnvironmentVariablesManually();

    case 'mock':
      return generateMockEnvironmentVariables();
  }
}

async function initializeSupabaseProject() {
  console.log('🗄️ Supabaseプロジェクトを初期化しています...');
  
  try {
    // Supabaseテーブルとポリシーの作成
    execSync('npx supabase db push', { stdio: 'inherit' });
    
    // RLSポリシーの適用
    execSync('npx supabase db reset', { stdio: 'inherit' });
    
    console.log('✅ Supabaseプロジェクトの初期化が完了しました');
  } catch (error) {
    console.error('❌ Supabaseの初期化に失敗しました:', error);
    process.exit(1);
  }
}

async function seedDevelopmentData() {
  console.log('🌱 サンプルデータを投入しています...');
  
  try {
    execSync('npm run seed', { stdio: 'inherit' });
    console.log('✅ サンプルデータの投入が完了しました');
  } catch (error) {
    console.error('❌ サンプルデータの投入に失敗しました:', error);
  }
}
```

### 7.6.3. プロダクション環境での秘匿情報管理

**Vercel環境変数管理**:
```bash
# Vercel CLI を使用した環境変数設定
vercel env add OPENAI_API_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 環境別設定
vercel env add STRIPE_PUBLISHABLE_KEY production
vercel env add STRIPE_PUBLISHABLE_KEY_TEST development
```

---

このドキュメントは、プロジェクト『ありがとうお父さんお母さん』の開発における唯一の真実の情報源（Single Source of Truth）として機能します。実装時は本要件定義書に従い、変更が必要な場合は本ドキュメントを更新してください。