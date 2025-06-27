'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function WaitingListPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '登録に失敗しました')
      }

      router.push('/waiting-list/success')
    } catch (err) {
      setError(err instanceof Error ? err.message : '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const earlyBirdDeadline = new Date('2025-07-10T23:59:59+09:00')
  const now = new Date()
  const isEarlyBird = now < earlyBirdDeadline

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-relaxed">
            ありがとう
            <br />
            お父さんお母さん
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            東大生が綴る、親子の絆を深める記事メディア
          </p>
          <p className="text-sm text-gray-500">
            2025年夏、正式リリース予定
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {isEarlyBird && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-semibold text-yellow-800 mb-1">
                🎉 早期登録特典
              </p>
              <p className="text-sm text-yellow-700">
                7月10日までの登録で、正式リリース後1ヶ月無料！
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登録中...' : 'リリース通知を受け取る'}
            </button>
          </form>

          <p className="text-xs text-gray-500 mt-6 text-center">
            ご登録いただいたメールアドレスは、本サービスのリリース通知にのみ使用いたします。
          </p>
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            こんな記事をお届けします
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• 東大生の視点から見た親への感謝</li>
            <li>• 子育てのヒントになる体験談</li>
            <li>• 親子関係を深めるコミュニケーション術</li>
            <li>• 教育に関する実践的なアドバイス</li>
          </ul>
        </div>
      </div>
    </div>
  )
}