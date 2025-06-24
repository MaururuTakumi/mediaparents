import { PieChart, DollarSign, TrendingUp, Shield } from 'lucide-react'

export default function RevenueModel() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <DollarSign className="h-4 w-4 mr-2" />
              収益モデルの透明性
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                フェアで透明性の高い
              </span><br />
              収益分配システム
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ライターの皆さんが安心して活動できるよう、収益モデルを完全公開しています。
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 左側: 収益分配の説明 */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">収益分配の仕組み</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-sm font-bold">1</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">記事収益の70%をライターに</div>
                      <div className="text-sm text-gray-600">読者からの課金収益の70%が直接ライターに分配されます</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-sm font-bold">2</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">プラットフォーム運営費30%</div>
                      <div className="text-sm text-gray-600">サーバー代、AI利用料、サポート人件費に充当</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mr-4 mt-1">
                      <span className="text-sm font-bold">3</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">ボーナス制度あり</div>
                      <div className="text-sm text-gray-600">人気記事や高評価記事には追加ボーナスを支給</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 text-gray-600 mr-2" />
                  <span className="font-semibold text-gray-900">透明性へのコミット</span>
                </div>
                <p className="text-sm text-gray-600">
                  毎月の収益レポートを全ライターに公開し、分配の透明性を保ちます。
                  不明な点があれば、いつでも運営チームに直接質問可能です。
                </p>
              </div>
            </div>

            {/* 右側: 収益例とグラフ */}
            <div className="space-y-8">
              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-6">収益シミュレーション例</h4>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-green-400 pl-6 py-2">
                    <div className="text-2xl font-bold text-green-600 mb-1">5,000円/月</div>
                    <div className="text-sm text-gray-600">月1記事投稿の場合</div>
                    <div className="text-xs text-gray-500 mt-1">※ 平均的な初期収益</div>
                  </div>

                  <div className="border-l-4 border-blue-400 pl-6 py-2">
                    <div className="text-2xl font-bold text-blue-600 mb-1">15,000円/月</div>
                    <div className="text-sm text-gray-600">月3記事投稿の場合</div>
                    <div className="text-xs text-gray-500 mt-1">※ 人気ライター平均</div>
                  </div>

                  <div className="border-l-4 border-purple-400 pl-6 py-2">
                    <div className="text-2xl font-bold text-purple-600 mb-1">30,000円/月</div>
                    <div className="text-sm text-gray-600">月5記事＋座談会参加</div>
                    <div className="text-xs text-gray-500 mt-1">※ トップライター実績</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <span className="font-semibold text-gray-900">成長への投資</span>
                </div>
                <p className="text-sm text-gray-700">
                  プラットフォームの30%収益は、ライターの皆さんがより稼げる環境づくりに再投資します。
                  マーケティング強化、AI機能向上、新機能開発などを通じて、
                  全体のパイを大きくしていくことが目標です。
                </p>
              </div>
            </div>
          </div>

          {/* 底部のメッセージ */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl p-8 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold mb-3">一緒に成長していきましょう</h3>
              <p className="text-green-100">
                私たちは「短期的な利益」ではなく「長期的な価値創造」を目指しています。<br />
                ライターの皆さんと一緒に、持続可能で意味のあるプラットフォームを築いていきたいと考えています。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}