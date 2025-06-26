# TodaiMedia Viewer UI/UXガイドライン

このドキュメントは、TodaiMedia ViewerアプリケーションのUI/UXデザインシステムを説明したものです。Expo React Nativeアプリ開発時にこのガイドラインに従うことで、一貫性のあるユーザー体験を提供できます。

## デザイン原則

### 1. 信頼性と親しみやすさ
- 東大生という権威性を活かしつつ、親しみやすいデザイン
- 教育的でありながら堅苦しくない雰囲気
- 親世代（40-50代）にも若い世代にも受け入れられるバランス

### 2. 読みやすさ最優先
- 記事コンテンツが主役
- 適切な余白と行間
- モバイルファーストの設計

### 3. シンプルで直感的
- 複雑な機能も簡単に使える
- 明確なナビゲーション
- 一貫性のあるインタラクション

## カラーシステム

### プライマリカラー
```css
/* ライトモード */
--primary: #000000;           /* メインテキスト、重要なボタン */
--primary-foreground: #FFFFFF; /* プライマリ要素の前景色 */

/* ダークモード */
--primary: #FFFFFF;
--primary-foreground: #000000;
```

### セカンダリカラー
```css
/* ライトモード */
--secondary: #F5F5F5;         /* 背景、補助的な要素 */
--secondary-foreground: #000000;

/* ダークモード */
--secondary: #262626;
--secondary-foreground: #FFFFFF;
```

### アクセントカラー
```css
--accent: #F5F5F5;            /* ホバー状態、選択状態 */
--accent-foreground: #000000;
```

### 機能的なカラー
```css
--destructive: #EF4444;       /* エラー、削除アクション */
--success: #10B981;           /* 成功メッセージ */
--warning: #F59E0B;           /* 警告メッセージ */
--info: #3B82F6;              /* 情報メッセージ */
```

### プレミアムカラー
```css
--premium: #FFD700;           /* プレミアムコンテンツの識別 */
--premium-gradient: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
```

## タイポグラフィ

### フォントファミリー
```css
/* 日本語 */
font-family: -apple-system, BlinkMacSystemFont, "Hiragino Sans", 
             "Hiragino Kaku Gothic ProN", "Noto Sans JP", 
             Meiryo, sans-serif;

/* 英数字 */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", 
             Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
```

### フォントサイズ
```css
--text-xs: 12px;    /* 補足情報、タイムスタンプ */
--text-sm: 14px;    /* ボタン、ラベル */
--text-base: 16px;  /* 本文 */
--text-lg: 18px;    /* 小見出し */
--text-xl: 20px;    /* 中見出し */
--text-2xl: 24px;   /* 大見出し */
--text-3xl: 30px;   /* ページタイトル */
--text-4xl: 36px;   /* ヒーローセクション */
```

### 行間
```css
--leading-tight: 1.25;   /* 見出し */
--leading-normal: 1.5;   /* 通常テキスト */
--leading-relaxed: 1.75; /* 本文 */
--leading-loose: 2;      /* 読みやすさ重視のコンテンツ */
```

## スペーシングシステム

8pxベースのスペーシングシステム：

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
--space-10: 40px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;
```

## コンポーネントスタイル

### ボタン

#### プライマリボタン
```css
.button-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: opacity 0.2s;
}

.button-primary:hover {
  opacity: 0.9;
}
```

#### セカンダリボタン
```css
.button-secondary {
  background: var(--secondary);
  color: var(--secondary-foreground);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}
```

#### ゴーストボタン
```css
.button-ghost {
  background: transparent;
  color: var(--primary);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
}

.button-ghost:hover {
  background: var(--accent);
}
```

### カード

```css
.card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s;
}
```

### 入力フィールド

```css
.input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 16px;
  background: var(--background);
  color: var(--foreground);
}

.input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.05);
}
```

### プレミアムバッジ

```css
.premium-badge {
  background: var(--premium-gradient);
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
```

## レイアウトパターン

### 1. ヘッダー
- 固定ヘッダー（スクロール時も表示）
- ロゴは左側
- ナビゲーションは中央または右側
- モバイルではハンバーガーメニュー

### 2. コンテンツコンテナ
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
}

.container-narrow {
  max-width: 800px;  /* 記事詳細ページ用 */
}

.container-wide {
  max-width: 1400px; /* ダッシュボード用 */
}
```

### 3. グリッドシステム
```css
.grid {
  display: grid;
  gap: 16px;
}

/* モバイル: 1カラム */
.grid-cols-1 {
  grid-template-columns: 1fr;
}

/* タブレット: 2カラム */
@media (min-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* デスクトップ: 3カラム */
@media (min-width: 1024px) {
  .grid-cols-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## アニメーション

### 基本的なトランジション
```css
--transition-fast: 150ms ease;
--transition-base: 200ms ease;
--transition-slow: 300ms ease;
```

### 使用例
```css
.interactive-element {
  transition: all var(--transition-base);
}

/* フェードイン */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* スライドアップ */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## アイコン

### 使用するアイコンライブラリ
- React Native Vector Icons
- または Expo Vector Icons

### よく使うアイコン
```
ホーム: home
記事: article / document-text
ライター: person / user
プレミアム: star / crown
設定: settings / cog
検索: search
メニュー: menu
閉じる: close / x
いいね: heart
共有: share
```

## モバイル対応

### ブレークポイント
```css
--mobile: 640px;   /* スマートフォン */
--tablet: 768px;   /* タブレット */
--laptop: 1024px;  /* ノートPC */
--desktop: 1280px; /* デスクトップ */
```

### タッチ対応
- タップ可能な要素は最小44x44px
- 適切なタッチフィードバック
- スワイプジェスチャーのサポート

## アクセシビリティ

### 1. カラーコントラスト
- 通常テキスト: 4.5:1以上
- 大きいテキスト: 3:1以上
- インタラクティブ要素: 3:1以上

### 2. フォーカス状態
```css
.focusable:focus-visible {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}
```

### 3. セマンティックHTML
- 適切な見出しレベル（h1-h6）
- ボタンには`<button>`タグ
- リンクには`<a>`タグ
- フォームには適切なラベル

## 特徴的なUIパターン

### 1. 記事カード
```jsx
<View style={styles.articleCard}>
  <Image source={{uri: thumbnailUrl}} style={styles.thumbnail} />
  <View style={styles.content}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.excerpt}>{excerpt}</Text>
    <View style={styles.meta}>
      <View style={styles.author}>
        <Image source={{uri: authorAvatar}} style={styles.avatar} />
        <Text style={styles.authorName}>{authorName}</Text>
      </View>
      <Text style={styles.date}>{publishedAt}</Text>
    </View>
    {isPremium && <PremiumBadge />}
  </View>
</View>
```

### 2. ライタープロフィール（閲覧専用）
```jsx
<View style={styles.writerProfile}>
  <Image source={{uri: avatarUrl}} style={styles.profileAvatar} />
  <Text style={styles.name}>{name}</Text>
  <Text style={styles.university}>{university} {faculty}</Text>
  <Text style={styles.bio}>{bio}</Text>
  {isVerified && <VerifiedBadge />}
  <View style={styles.stats}>
    <Text style={styles.articleCount}>記事数: {articleCount}</Text>
  </View>
</View>
```

### 3. 記事閲覧画面
```jsx
<ScrollView style={styles.articleView}>
  <Image source={{uri: thumbnailUrl}} style={styles.heroImage} />
  <View style={styles.articleContent}>
    <Text style={styles.articleTitle}>{title}</Text>
    <View style={styles.authorInfo}>
      <Image source={{uri: authorAvatar}} style={styles.authorAvatar} />
      <View>
        <Text style={styles.authorName}>{authorName}</Text>
        <Text style={styles.publishDate}>{publishedAt}</Text>
      </View>
    </View>
    <View style={styles.articleBody}>
      {/* HTMLコンテンツのレンダリング */}
    </View>
    <View style={styles.articleActions}>
      <TouchableOpacity style={styles.likeButton}>
        <Icon name="heart" />
        <Text>{likeCount}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.shareButton}>
        <Icon name="share" />
      </TouchableOpacity>
    </View>
  </View>
</ScrollView>
```

## ダークモード対応

### 実装方法
```jsx
import { useColorScheme } from 'react-native';

const colorScheme = useColorScheme();
const isDark = colorScheme === 'dark';

const styles = {
  container: {
    backgroundColor: isDark ? '#000' : '#FFF',
    color: isDark ? '#FFF' : '#000',
  }
};
```

### 注意点
- 画像やアイコンの視認性確保
- プレミアムバッジの配色調整
- 影の表現を調整

## パフォーマンス最適化

### 1. 画像の最適化
- WebP形式の使用
- 適切なサイズでの配信
- 遅延読み込みの実装

### 2. リストの仮想化
```jsx
import { FlatList } from 'react-native';

<FlatList
  data={articles}
  renderItem={renderArticleCard}
  keyExtractor={item => item.id}
  initialNumToRender={10}
  windowSize={10}
/>
```

### 3. メモ化
```jsx
import { memo, useMemo } from 'react';

const ArticleCard = memo(({ article }) => {
  // コンポーネントの実装
});
```

## まとめ

このガイドラインに従うことで、TodaiMedia Viewerアプリのブランドアイデンティティを保ちながら、使いやすく美しいモバイルアプリを開発できます。重要なのは：

1. **一貫性**: すべての画面で同じデザイン言語を使用
2. **読みやすさ**: コンテンツファーストのデザイン
3. **アクセシビリティ**: すべてのユーザーが使いやすい設計
4. **パフォーマンス**: スムーズで快適な操作感

開発時は常にこのガイドラインを参照し、必要に応じて更新してください。