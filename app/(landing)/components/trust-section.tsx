import { Shield, UserCheck, Eye, Lock, FileCheck, Users } from 'lucide-react'

export default function TrustSection() {
  const trustFeatures = [
    {
      icon: UserCheck,
      title: "学生証による身元確認",
      description: "東大生としての信頼性を担保しながら、個人情報は厳重に保護します。"
    },
    {
      icon: Eye,
      title: "ペンネーム使用で完全匿名",
      description: "記事での実名公開は一切不要。あなたの身元は完全に守られます。"
    },
    {
      icon: Lock,
      title: "顔写真・個人情報の公開なし",
      description: "写真撮影や詳細なプロフィール公開は必要ありません。"
    },
    {
      icon: FileCheck,
      title: "厳格なプライバシーポリシー",
      description: "業界標準を上回る情報管理体制で、あなたのデータを保護します。"
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4 mr-2" />
              信頼性と安全性
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              <span className="text-green-600">「認証済み匿名」</span>だから、
              <br />
              安心して本音を語れる
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              東大生としての信頼性は保ちながら、あなたの個人情報は完全に保護。
              就活や将来への影響を心配する必要はありません。
            </p>
          </div>

          {/* メイン説明 */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-green-100 mb-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  なぜ「認証済み匿名」なのか？
                </h3>
                <div className="space-y-4 text-gray-700">
                  <p>
                    読者は<strong className="text-green-600">「東大生の体験談」</strong>という信頼性を求めています。
                    一方で、あなたは<strong className="text-blue-600">「プライバシーの保護」</strong>を重視しています。
                  </p>
                  <p>
                    私たちの「認証済み匿名」システムは、この両方のニーズを同時に満たします。
                  </p>
                  <p className="font-semibold text-green-600">
                    信頼性と匿名性、どちらも妥協しない。それが私たちの約束です。
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-6 text-white">
                  <div className="text-center">
                    <Shield className="h-16 w-16 mx-auto mb-4" />
                    <h4 className="text-xl font-bold mb-2">認証済み匿名</h4>
                    <p className="text-sm opacity-90">
                      信頼性 + プライバシー保護
                    </p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-yellow-800" />
                </div>
              </div>
            </div>
          </div>

          {/* 4つの安全性機能 */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {trustFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* プロセス説明 */}
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                安全な認証プロセス
              </h3>
              <p className="text-lg opacity-90">
                たった3ステップで、安全に認証が完了します
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileCheck className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-semibold mb-2">1. 学生証アップロード</h4>
                <p className="text-sm opacity-90">
                  学生証の写真をアップロード（個人情報は自動でマスキング）
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-semibold mb-2">2. 本人確認完了</h4>
                <p className="text-sm opacity-90">
                  24時間以内に認証完了通知が届きます
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8" />
                </div>
                <h4 className="text-lg font-semibold mb-2">3. 認証済みバッジ付与</h4>
                <p className="text-sm opacity-90">
                  あなたの記事に「東大生認証済み」バッジが表示されます
                </p>
              </div>
            </div>
          </div>

          {/* 追加の安心要素 */}
          <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">データ暗号化</h4>
              <p className="text-sm text-gray-600">
                すべての個人情報は軍事レベルの暗号化で保護
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">24時間サポート</h4>
              <p className="text-sm text-gray-600">
                不安なことがあれば、いつでもお気軽にご相談ください
              </p>
            </div>

            <div className="p-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="h-6 w-6" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">透明性の確保</h4>
              <p className="text-sm text-gray-600">
                データの利用目的と範囲を明確に開示
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}