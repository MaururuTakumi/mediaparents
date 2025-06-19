# Supabase MCP セットアップガイド

## 1. Personal Access Token (PAT) の作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. 右上のアカウントアイコン → Settings に移動
3. 左サイドバーの **Access Tokens** をクリック
4. **Create new token** ボタンをクリック
5. Name: `Claude Code MCP Server` (わかりやすい名前)
6. **Create token** ボタンをクリック
7. 表示されたトークンをコピー（後で使用）

## 2. Project Ref の確認

1. Supabaseプロジェクトのダッシュボードで
2. Settings → General に移動
3. **Reference ID** をコピー（例: `abcdefghijklmnop`）

## 3. 取得する情報

- ✅ Personal Access Token: `sbp_xxxxxxxxxxxxxxxxxx`
- ✅ Project Reference ID: プロジェクトの短いID
- ✅ Project URL: `https://abcdefghijklmnop.supabase.co`

## 次のステップ

上記の情報を取得したら、Claude Codeで .mcp.json ファイルを設定します。