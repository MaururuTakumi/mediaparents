# TodaiMedia Viewer - Expo React Native実装指示書

このドキュメントは、TodaiMedia Viewerアプリを Expo React Native で実装するための詳細な指示書です。無闇にejectせず、Expoの管理されたワークフロー内で必要な機能を実装することを重視しています。

## プロジェクト概要

### アプリの目的
- 東大生が書いた親子関係に関する記事を閲覧できるビューアーアプリ
- プレミアム会員機能による収益化
- セミナー参加機能

### 主要機能
1. 記事閲覧（無料・プレミアム）
2. ユーザー認証（ログイン・登録）
3. サブスクリプション管理（Stripe連携）
4. ライター情報閲覧
5. セミナー一覧・参加登録
6. いいね機能
7. プッシュ通知

## 技術スタック

### コア技術
- **Expo SDK**: 最新版（SDK 51推奨）
- **React Native**: Expoに含まれるバージョン
- **TypeScript**: 型安全性のため必須
- **React Navigation**: v6（ナビゲーション）

### 状態管理・データフェッチ
- **Zustand**: シンプルな状態管理
- **React Query (TanStack Query)**: APIデータのキャッシュ管理
- **Supabase JS Client**: バックエンドとの通信

### UI/スタイリング
- **Tamagui**: React Native向けの最新UIライブラリ（パフォーマンス最適化済み）
- **React Native Elements**: 基本的なUIコンポーネント（互換性重視の場合）
- **Expo Vector Icons**: アイコン
- **React Native Reanimated**: アニメーション（Expo SDK同梱）
- **React Native Gesture Handler**: ジェスチャー処理（Expo SDK同梱）

### その他
- **React Hook Form**: フォーム管理
- **Zod**: バリデーション
- **expo-secure-store**: セキュアなトークン保存
- **expo-notifications**: プッシュ通知

## プロジェクト構造

```
todaimedia-viewer/
├── app/                        # Expo Router v3 のページ
│   ├── (auth)/                # 認証関連画面
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/                # タブナビゲーション
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # ホーム
│   │   ├── articles.tsx       # 記事一覧
│   │   ├── writers.tsx        # ライター一覧
│   │   ├── seminars.tsx       # セミナー一覧
│   │   └── profile.tsx        # プロフィール
│   ├── article/[id].tsx       # 記事詳細
│   ├── writer/[id].tsx        # ライター詳細
│   ├── subscription.tsx       # サブスクリプション管理
│   ├── _layout.tsx            # ルートレイアウト
│   └── +not-found.tsx         # 404ページ
├── components/                 # 再利用可能なコンポーネント
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Loading.tsx
│   ├── article/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleList.tsx
│   │   └── PremiumBadge.tsx
│   ├── writer/
│   │   ├── WriterCard.tsx
│   │   └── WriterProfile.tsx
│   └── layout/
│       ├── Header.tsx
│       └── TabBar.tsx
├── hooks/                      # カスタムフック
│   ├── useAuth.ts
│   ├── useArticles.ts
│   ├── useSubscription.ts
│   └── useColorScheme.ts
├── lib/                        # ライブラリ設定・ユーティリティ
│   ├── supabase.ts
│   ├── api.ts
│   ├── constants.ts
│   └── utils.ts
├── store/                      # Zustand ストア
│   ├── authStore.ts
│   └── appStore.ts
├── types/                      # TypeScript型定義
│   ├── api.d.ts
│   ├── navigation.d.ts
│   └── models.d.ts
├── assets/                     # 画像・フォント等
├── app.json                    # Expo設定
├── babel.config.js
├── tsconfig.json
└── package.json
```

## セットアップ手順

### 0. Node.jsバージョン管理（NVS）のセットアップ
```bash
# NVSのインストール（Windows）
winget install jasongin.nvs

# NVSのインストール（Mac/Linux）
export NVS_HOME="$HOME/.nvs"
git clone https://github.com/jasongin/nvs "$NVS_HOME"
. "$NVS_HOME/nvs.sh" install

# Node.js LTSをインストール
nvs add lts
nvs use lts
nvs link lts

# バージョン確認（18.x または 20.x LTS推奨）
node --version
```

### 1. プロジェクト作成
```bash
# 最新のExpo CLIを使用
npx create-expo-app@latest todaimedia-viewer --template blank-typescript
cd todaimedia-viewer

# .nvmrc または .node-version ファイルを作成
echo "lts/*" > .nvmrc
```

### 2. 必要なパッケージのインストール
```bash
# Expo Router
npx expo install expo-router

# 認証・API
npm install @supabase/supabase-js zustand @tanstack/react-query

# UI関連（Expo互換のパッケージを使用）
npm install tamagui @tamagui/animations-react-native @tamagui/config
npm install react-native-elements react-native-safe-area-context
npx expo install react-native-svg  # react-native-vector-iconsの代わりにExpo Vector Iconsを使用

# フォーム・バリデーション
npm install react-hook-form zod @hookform/resolvers

# セキュアストレージ
npx expo install expo-secure-store

# その他のExpoモジュール
npx expo install expo-notifications expo-device expo-constants
npx expo install expo-splash-screen expo-status-bar
npx expo install expo-linking expo-web-browser
```

### 3. 環境変数の設定
`.env` ファイルを作成（Expo推奨）：
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
EXPO_PUBLIC_API_URL=http://localhost:3000  # 開発環境
```

`.gitignore` に追加：
```
.env
.env.*
```

### 4. app.json の設定
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
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.todaimedia.viewer",
      "config": {
        "usesNonExemptEncryption": false
      },
      "infoPlist": {
        "NSAppTransportSecurity": {
          "NSAllowsArbitraryLoads": false
        }
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.todaimedia.viewer",
      "permissions": []
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ],
      "expo-secure-store"
    ],
    "scheme": "todaimedia",
    "extra": {
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

## 実装の詳細

### 1. 認証フロー

#### Supabase認証の初期化 (`lib/supabase.ts`)
```typescript
import { createClient } from '@supabase/supabase-js'
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants'

const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    return await SecureStore.getItemAsync(key)
  },
  setItem: async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value)
  },
  removeItem: async (key: string) => {
    await SecureStore.deleteItemAsync(key)
  },
}

// 環境変数の取得（Expo管理ワークフロー対応）
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL
const supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      storage: ExpoSecureStoreAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
)
```

#### 認証フック (`hooks/useAuth.ts`)
```typescript
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'

export const useAuth = () => {
  const { user, setUser, clearUser } = useAuthStore()

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (data.user) {
      setUser(data.user)
    }
    return { data, error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    clearUser()
  }

  return { user, signIn, signOut }
}
```

### 2. API通信

#### API クライアント (`lib/api.ts`)
```typescript
import { supabase } from './supabase'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
  }

  private async getHeaders() {
    const { data: { session } } = await supabase.auth.getSession()
    return {
      'Content-Type': 'application/json',
      'Authorization': session ? `Bearer ${session.access_token}` : '',
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'GET',
      headers: { ...headers, ...options?.headers },
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `API Error: ${response.status}`)
    }
    
    return response.json()
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    const headers = await this.getHeaders()
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: 'POST',
      headers: { ...headers, ...options?.headers },
      body: data ? JSON.stringify(data) : undefined,
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }))
      throw new Error(error.message || `API Error: ${response.status}`)
    }
    
    return response.json()
  }

  // put, delete も同様に実装
}

export const apiClient = new ApiClient()
```

### 3. 画面実装例

#### 記事一覧画面 (`app/(tabs)/articles.tsx`)
```typescript
import { FlatList, RefreshControl } from 'react-native'
import { useQuery } from '@tanstack/react-query'
import { ArticleCard } from '@/components/article/ArticleCard'
import { apiClient } from '@/lib/api'

export default function ArticlesScreen() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['articles'],
    queryFn: () => apiClient.get('/api/articles'),
  })

  return (
    <FlatList
      data={data?.articles}
      renderItem={({ item }) => <ArticleCard article={item} />}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    />
  )
}
```

### 4. プッシュ通知

#### 通知の初期化 (`lib/notifications.ts`)
```typescript
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) {
    return null
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync()
  let finalStatus = existingStatus
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  
  if (finalStatus !== 'granted') {
    return null
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data
  return token
}
```

### 5. ダークモード対応

#### カラースキームフック (`hooks/useColorScheme.ts`)
```typescript
import { useColorScheme as useNativeColorScheme } from 'react-native'

export function useColorScheme() {
  const colorScheme = useNativeColorScheme()
  
  return {
    colorScheme,
    isDark: colorScheme === 'dark',
    colors: colorScheme === 'dark' ? darkColors : lightColors,
  }
}
```

## 重要な実装ポイント

### 1. Expo管理ワークフローの維持
- Native modulesが必要な場合は、Expo SDKのモジュールを優先使用
- カスタムネイティブコードが必要な場合は、Expo Config Pluginsを使用
- Ejectは最終手段として検討
- パッケージ選定時はExpo互換性を確認（https://reactnative.directory/）

### 2. パフォーマンス最適化
- FlatListの最適化（getItemLayout、keyExtractor、windowSize）
- 画像の最適化（expo-image使用、適切なサイズ）
- React.memoとuseMemoの適切な使用

### 3. セキュリティ
- APIキーは環境変数で管理
- 認証トークンはexpo-secure-storeで保存
- Deep linkingのバリデーション

### 4. エラーハンドリング
- API通信エラーの適切な処理
- オフライン対応（React Queryのキャッシュ活用）
- クラッシュレポート（Sentry連携）

### 5. テスト
- **ユニットテスト**: Jest + React Native Testing Library
- **E2Eテスト**: 
  - Expo Goでのテスト: Maestro（推奨）
  - ビルド後のテスト: Detox（EAS Buildと連携）
- **コンポーネントテスト**: Storybook for React Native

## ビルドとデプロイ

### 開発環境
```bash
# Expo Goでの開発（推奨）
npx expo start

# 開発ビルド（ネイティブ機能が必要な場合）
eas build --profile development --platform ios
eas build --profile development --platform android

# ローカルビルド（非推奨、prebuildが必要）
npx expo run:ios
npx expo run:android
```

### プロダクションビルド
```bash
# EAS CLIのセットアップ
npm install -g eas-cli
eas login

# 初回設定
eas build:configure

# eas.jsonの設定例
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}

# ビルド実行
eas build --platform ios --profile production
eas build --platform android --profile production
```

### ストア申請
```bash
# App Store
eas submit -p ios

# Google Play
eas submit -p android
```

## トラブルシューティング

### よくある問題と解決策

1. **Metro bundlerエラー**
   ```bash
   npx expo start -c  # キャッシュクリア
   ```

2. **依存関係の問題**
   ```bash
   npx expo doctor
   npx expo install --fix
   ```

3. **ビルドエラー**
   - `app.json`の設定を確認
   - EAS Buildのログを確認
   - Expo SDKバージョンの互換性確認

## まとめ

この実装指示書に従うことで、Expo React Nativeを使用してTodaiMedia Viewerアプリを効率的に開発できます。Expoの管理されたワークフローを維持しながら、必要な機能をすべて実装できるよう設計されています。

開発中は常にExpoの公式ドキュメントを参照し、最新のベストプラクティスに従ってください。