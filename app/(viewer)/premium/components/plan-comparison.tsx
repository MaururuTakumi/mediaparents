'use client'

import { Check, X, Star, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PlanComparison() {
  const features = [
    {
      name: "記事閲覧",
      free: "月5本まで",
      premium: "全記事読み放題",
      highlight: true
    },
    {
      name: "限定コンテンツ",
      free: false,
      premium: "深掘りレポート・分析記事",
      highlight: true
    },
    {
      name: "保護者アンケート",
      free: false,
      premium: "閲覧・参加・作成",
      highlight: true
    },
    {
      name: "東大生への個別相談",
      free: false,
      premium: "月1回まで質問可能",
      highlight: true
    },
    {
      name: "会員コミュニティ",
      free: false,
      premium: "非公開グループ参加",
      highlight: true
    },
    {
      name: "オンラインイベント",
      free: "一部のみ視聴可",
      premium: "無料・優待参加",
      highlight: false
    },
    {
      name: "広告表示",
      free: "表示あり",
      premium: "完全非表示",
      highlight: false
    },
    {
      name: "記事のお気に入り",
      free: "10件まで",
      premium: "無制限",
      highlight: false
    },
    {
      name: "過去記事検索",
      free: "過去3ヶ月分",
      premium: "全期間検索可能",
      highlight: false
    },
    {
      name: "東大生への相談履歴",
      free: false,
      premium: "全履歴保存・検索",
      highlight: false
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              プラン比較
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              あなたのステージに合わせた<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                プランをお選びください
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              まずは無料プランで始めて、必要に応じてプレミアムプランにアップグレード。
              いつでも変更可能です。
            </p>
          </div>

          {/* プラン比較表 */}
          <div className="bg-gray-50 rounded-3xl p-8 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* フリープラン */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">フリープラン</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ¥0
                    <span className="text-sm font-normal text-gray-600">/月</span>
                  </div>
                  <p className="text-gray-600 text-sm">まずはお試しから</p>
                </div>
                <Button variant="outline" className="w-full mb-6">
                  現在のプラン
                </Button>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-700">{feature.name}</span>
                      <div className="flex items-center">
                        {feature.free === false ? (
                          <X className="h-4 w-4 text-red-500" />
                        ) : (
                          <span className="text-xs text-gray-600 text-right">
                            {feature.free}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* プレミアムプラン（月額） */}
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl p-6 relative transform scale-105 shadow-2xl">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold">
                    おすすめ
                  </div>
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">プレミアムプラン</h3>
                  <div className="text-3xl font-bold mb-2">
                    ¥1,480
                    <span className="text-sm font-normal text-purple-100">/月</span>
                  </div>
                  <p className="text-purple-100 text-sm">ランチ1回分で始める</p>
                </div>
                <Button className="w-full mb-6 bg-white text-purple-600 hover:bg-purple-50">
                  7日間無料で体験
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="space-y-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="text-sm text-white">{feature.name}</span>
                      <div className="flex items-center">
                        {feature.premium ? (
                          <div className="flex items-center">
                            <Check className="h-4 w-4 text-green-300 mr-2" />
                            {feature.highlight && typeof feature.premium === 'string' && (
                              <span className="text-xs text-purple-100 text-right">
                                {feature.premium}
                              </span>
                            )}
                          </div>
                        ) : (
                          <X className="h-4 w-4 text-red-300" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* プレミアムプラン（年額） */}
              <div className="bg-white rounded-2xl p-6 border-2 border-blue-200">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">年額プラン</h3>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    ¥14,800
                    <span className="text-sm font-normal text-gray-600">/年</span>
                  </div>
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium mb-2">
                    2ヶ月分お得
                  </div>
                  <p className="text-gray-600 text-sm">月額換算 ¥1,233</p>
                </div>
                <Button variant="outline" className="w-full mb-6 border-blue-300 text-blue-600 hover:bg-blue-50">
                  年額でお得に始める
                </Button>
                <div className="text-center text-sm text-gray-600">
                  <p>✓ 全プレミアム機能利用可能</p>
                  <p>✓ 長期的な子育てサポート</p>
                  <p>✓ いつでも月額プランに変更可能</p>
                </div>
              </div>
            </div>
          </div>

          {/* 特別オファー */}
          <div className="mt-12 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-2xl p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                🎁 今だけの特別オファー
              </h3>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-lg font-bold text-blue-600 mb-1">初回7日間無料</div>
                  <div className="text-sm text-gray-600">全機能をお試し</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-lg font-bold text-green-600 mb-1">解約手数料無料</div>
                  <div className="text-sm text-gray-600">いつでも気軽に</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-lg font-bold text-purple-600 mb-1">限定ウェルカムガイド</div>
                  <div className="text-sm text-gray-600">効果的な使い方を</div>
                </div>
              </div>
              <p className="text-gray-700 mb-6">
                無料体験期間中に解約すれば、料金は一切かかりません。<br />
                まずは安心してお試しください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4">
                  今すぐ7日間無料体験を始める
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-purple-500 px-10 py-4">
                  年額プランでお得に始める
                </Button>
              </div>
            </div>
          </div>

          {/* 安心材料 */}
          <div className="mt-8 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                30日間返金保証
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                いつでもプラン変更可能
              </div>
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                解約手数料なし
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}