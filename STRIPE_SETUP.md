# Stripe導入ガイド

このドキュメントは、法人設立後にStripe決済を本番環境で導入する際の手順をまとめたものです。

## 前提条件

- 法人の設立が完了していること
- Stripeアカウントが作成済みであること
- 本番環境のAPIキーが取得可能であること

## 1. Stripe管理画面での設定

### 1.1 APIキーの取得

1. [Stripe Dashboard](https://dashboard.stripe.com)にログイン
2. 「開発者」→「APIキー」に移動
3. 以下のキーをコピー：
   - **公開可能キー**（`pk_live_`で始まる）
   - **シークレットキー**（`sk_live_`で始まる）

### 1.2 Webhookエンドポイントの設定

1. 「開発者」→「Webhook」に移動
2. 「エンドポイントを追加」をクリック
3. エンドポイントURL: `https://your-domain.com/api/stripe-webhook`
4. 以下のイベントを選択：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. エンドポイントを追加後、「署名シークレット」をコピー

### 1.3 商品とプランの作成

1. 「商品」→「商品を追加」
2. 商品名：「プレミアムプラン」
3. 価格設定：
   - 料金：¥800
   - 請求期間：月次
   - 通貨：JPY

## 2. 環境変数の設定

### 2.1 .env.localファイルに追加

```bash
# Stripe本番環境
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
STRIPE_PRICE_ID=price_xxxxxxxxxxxxx
```

### 2.2 Vercel/Netlifyでの環境変数設定

1. プロジェクトの設定画面に移動
2. Environment Variablesセクションで上記の環境変数を追加
3. 本番環境（Production）に適用

## 3. コードの修正

### 3.1 型アサーションの削除

現在、Stripe APIキーが未設定のため、一時的な型アサーション（`as any`）を使用しています。
本番環境では以下のファイルを修正してください：

#### `/app/api/stripe-webhook/route.ts`

```typescript
// 修正前（一時的な対応）
current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),

// 修正後（本番環境）
current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
```

同様に、以下の箇所も修正：
- 57行目: `current_period_start`
- 58行目: `current_period_end`
- 59行目: `items.data[0].price.unit_amount`
- 81行目: `current_period_start`
- 82行目: `current_period_end`
- 113行目: `invoice.subscription`
- 119行目: `invoice.subscription`
- 127行目: `invoice.subscription`
- 133行目: `invoice.subscription`

### 3.2 エラーハンドリングの強化

```typescript
// /lib/stripe.ts に追加
export function isStripeConfigured(): boolean {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
```

## 4. テスト手順

### 4.1 ローカル環境でのテスト

1. Stripe CLIをインストール：
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. ログイン：
   ```bash
   stripe login
   ```

3. Webhookをローカルに転送：
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe-webhook
   ```

4. テストモードでの決済フロー確認

### 4.2 本番環境でのテスト

1. 少額の実際の決済でテスト
2. Webhookイベントの受信確認
3. データベースへの反映確認
4. ユーザーのサブスクリプションステータス確認

## 5. 監視とログ

### 5.1 Stripe Dashboardでの監視

- 「イベントとログ」で決済イベントを確認
- 「Webhook」でエンドポイントの成功率を監視

### 5.2 エラー通知の設定

Stripeダッシュボードで以下を設定：
- 決済失敗時のメール通知
- Webhook失敗時のアラート

## 6. セキュリティ対策

### 6.1 APIキーの管理

- シークレットキーは絶対にクライアントサイドに露出させない
- 定期的にAPIキーをローテーション

### 6.2 Webhook署名の検証

現在のコードでは既に実装済み：
```typescript
event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

## 7. トラブルシューティング

### よくある問題と解決方法

1. **Webhook署名検証エラー**
   - エンドポイントURLが正しいか確認
   - 署名シークレットが正しくコピーされているか確認

2. **決済完了後にユーザーステータスが更新されない**
   - Webhookイベントが正常に受信されているか確認
   - データベースの権限設定を確認

3. **型エラーが発生する**
   - `@types/stripe`が最新版か確認
   - Stripe SDKのバージョンを確認

## 8. 本番移行チェックリスト

- [ ] 法人のStripeアカウント作成完了
- [ ] 本番APIキー取得
- [ ] 環境変数設定（ローカル・本番）
- [ ] Webhookエンドポイント設定
- [ ] 商品・価格プラン作成
- [ ] 型アサーション削除
- [ ] テスト決済実施
- [ ] 監視・アラート設定
- [ ] バックアップ体制確認

## 参考リンク

- [Stripe公式ドキュメント](https://stripe.com/docs)
- [Stripe Webhook ベストプラクティス](https://stripe.com/docs/webhooks/best-practices)
- [Next.js + Stripe統合ガイド](https://vercel.com/guides/getting-started-with-nextjs-typescript-stripe)