# TodaiMedia Viewer プロジェクトセットアップチェックリスト

このチェックリストは、新しいClaude Codeセッションで実際にプロジェクトを開始する際の手順を記載しています。

## 📋 事前準備

### 1. 開発環境の確認
- [ ] Node.jsバージョン管理（NVS）のインストール
  ```bash
  # Windowsの場合
  winget install jasongin.nvs
  
  # Mac/Linuxの場合
  export NVS_HOME="$HOME/.nvs"
  git clone https://github.com/jasongin/nvs "$NVS_HOME"
  . "$NVS_HOME/nvs.sh" install
  ```

- [ ] Node.js LTSのインストール
  ```bash
  nvs add lts
  nvs use lts
  nvs link lts
  node --version  # 18.x または 20.x LTS確認
  ```

### 2. 必要なCLIツールのインストール
- [ ] Expo CLIの最新版確認
  ```bash
  npm install -g expo-cli@latest
  ```

- [ ] EAS CLIのインストール（ビルド用）
  ```bash
  npm install -g eas-cli
  ```

### 3. アカウントの準備
- [ ] Expoアカウントの作成・ログイン
- [ ] Supabaseプロジェクトの作成
- [ ] Stripeアカウントの作成（サブスクリプション用）

## 🚀 プロジェクトセットアップ

### 1. プロジェクトの作成
```bash
# プロジェクトディレクトリの作成
npx create-expo-app@latest todaimedia-viewer --template blank-typescript
cd todaimedia-viewer

# Node.jsバージョンファイルの作成
echo "lts/*" > .nvmrc
```

### 2. 基本的なディレクトリ構造の作成
```bash
# ディレクトリ作成
mkdir -p app/{(auth),(tabs),article,writer}
mkdir -p components/{common,article,writer,layout}
mkdir -p hooks lib store types assets
```

### 3. 必要なパッケージのインストール

#### 基本パッケージ
```bash
# Expo Router（ナビゲーション）
npx expo install expo-router

# 状態管理・API通信
npm install @supabase/supabase-js zustand @tanstack/react-query

# セキュアストレージ
npx expo install expo-secure-store expo-constants

# その他のExpoモジュール
npx expo install expo-notifications expo-device 
npx expo install expo-splash-screen expo-status-bar
npx expo install expo-linking expo-web-browser
```

#### UI関連パッケージ（Expo互換）
```bash
# UIライブラリ（Tamagui推奨）
npm install tamagui @tamagui/animations-react-native @tamagui/config

# または React Native Elements（シンプルな選択）
npm install react-native-elements react-native-safe-area-context

# アイコン（Expo Vector Icons使用）
npx expo install @expo/vector-icons

# SVGサポート
npx expo install react-native-svg

# ジェスチャー・アニメーション（Expo SDK同梱）
npx expo install react-native-gesture-handler react-native-reanimated
```

#### フォーム・バリデーション
```bash
npm install react-hook-form zod @hookform/resolvers
```

#### 開発ツール
```bash
# TypeScript関連
npm install --save-dev @types/react @types/react-native

# Linting & Formatting
npm install --save-dev eslint prettier eslint-config-prettier
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### 4. 環境変数の設定

#### .envファイルの作成
```bash
touch .env
```

内容：
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EXPO_PUBLIC_API_URL=http://localhost:3000
```

#### .gitignoreに追加
```bash
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore
```

### 5. 設定ファイルの作成

#### app.json の設定
```json
{
  "expo": {
    "name": "TodaiMedia Viewer",
    "slug": "todaimedia-viewer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.todaimedia.viewer"
    },
    "android": {
      "package": "com.todaimedia.viewer"
    },
    "plugins": [
      "expo-router",
      "expo-secure-store"
    ],
    "scheme": "todaimedia"
  }
}
```

#### tsconfig.json の設定
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

#### babel.config.js の更新
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      [
        'module-resolver',
        {
          alias: {
            '@': './'
          }
        }
      ]
    ]
  };
};
```

### 6. 初期ファイルの作成

#### Supabase設定 (lib/supabase.ts)
```typescript
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

// 実装コードは expo-implementation-guide.md を参照
```

#### ルートレイアウト (app/_layout.tsx)
```typescript
import { Stack } from 'expo-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack />
    </QueryClientProvider>
  )
}
```

### 7. EAS設定（ビルド用）
```bash
# EASログイン
eas login

# EAS設定の初期化
eas build:configure

# eas.json が作成される
```

## ✅ 動作確認

### 1. 開発サーバーの起動
```bash
# Expo Goでの開発
npx expo start

# QRコードをスキャンしてモバイルで確認
```

### 2. 基本的な動作確認
- [ ] アプリが正常に起動する
- [ ] TypeScriptエラーがない
- [ ] 環境変数が正しく読み込まれている

## 📝 次のステップ

1. **認証機能の実装**
   - ログイン・登録画面の作成
   - Supabase認証の統合

2. **API通信の実装**
   - APIクライアントの作成
   - React Queryでのデータフェッチング

3. **UI/UXの実装**
   - ui-guidelines-viewer.md に従ったコンポーネント作成
   - ダークモード対応

4. **機能実装**
   - 記事一覧・詳細画面
   - ライター情報画面
   - サブスクリプション機能

## ⚠️ 注意事項

1. **パッケージの互換性**
   - 新しいパッケージを追加する前に https://reactnative.directory/ で確認
   - Expo SDKとの互換性を確認

2. **ネイティブモジュール**
   - Expo Goで動作しないモジュールは開発ビルドが必要
   - 可能な限りExpo SDKのモジュールを使用

3. **環境変数**
   - EXPO_PUBLIC_ プレフィックスを使用
   - 機密情報はクライアントに含めない

4. **ビルド**
   - 初回ビルドは時間がかかる（20-30分）
   - EAS Buildの無料枠に注意

## 🔧 トラブルシューティング

### よくある問題
1. **Metro bundlerエラー**
   ```bash
   npx expo start -c  # キャッシュクリア
   ```

2. **依存関係の問題**
   ```bash
   npx expo doctor
   npx expo install --fix
   ```

3. **TypeScriptエラー**
   ```bash
   npx tsc --noEmit  # 型チェック
   ```

## 📚 参考ドキュメント

- [api-documentation-viewer.md](./api-documentation-viewer.md) - API仕様
- [ui-guidelines-viewer.md](./ui-guidelines-viewer.md) - UIガイドライン
- [expo-implementation-guide.md](./expo-implementation-guide.md) - 実装詳細
- [Expo公式ドキュメント](https://docs.expo.dev/)
- [React Native Directory](https://reactnative.directory/) - パッケージ互換性確認

---

このチェックリストに従って、新しいClaude Codeセッションでプロジェクトを開始してください。