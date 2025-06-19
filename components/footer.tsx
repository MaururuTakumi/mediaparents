import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <h3 className="font-bold text-lg">ありがとうお父さんお母さん</h3>
            <p className="text-sm text-muted-foreground">
              あなたの経験が、誰かの羅針盤になる。
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">コンテンツ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/articles" className="hover:underline">
                  記事一覧
                </Link>
              </li>
              <li>
                <Link href="/writers" className="hover:underline">
                  ライター一覧
                </Link>
              </li>
              <li>
                <Link href="/seminars" className="hover:underline">
                  オンライン座談会
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">サービス</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/subscription" className="hover:underline">
                  有料プラン
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:underline">
                  マイページ
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">その他</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline">
                  このサイトについて
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:underline">
                  プライバシーポリシー
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ありがとうお父さんお母さん. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}