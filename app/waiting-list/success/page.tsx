import Link from 'next/link'

export default function WaitingListSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              登録が完了しました！
            </h1>
            <p className="text-gray-600">
              「ありがとうお父さんお母さん」の
              <br />
              リリース通知リストに追加されました
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              正式リリース時に、ご登録いただいたメールアドレスに
              <br />
              お知らせをお送りいたします
            </p>
          </div>

          <div className="space-y-4">
            <div className="text-left bg-gray-50 rounded-lg p-4">
              <h2 className="font-semibold text-gray-900 mb-2">次のステップ</h2>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>メールボックスをご確認ください（迷惑メールフォルダも含む）</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>2025年夏のリリースをお楽しみに！</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span>早期登録特典：1ヶ月無料でご利用いただけます</span>
                </li>
              </ul>
            </div>

            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          ご質問がございましたら、お気軽にお問い合わせください
        </p>
      </div>
    </div>
  )
}