import { MessageCircle, FileText, Edit, ArrowRight } from 'lucide-react'

export default function SolutionSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <MessageCircle className="h-4 w-4 mr-2" />
              私たちの解決策
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">AI</span>が、あなたの体験を
              <br />
              記事に変える<span className="text-blue-600">3ステップ</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              文章が苦手でも大丈夫。最新のAI技術が、あなたの体験を価値ある記事に変換します。
            </p>
          </div>

          {/* 3ステップ */}
          <div className="relative">
            {/* 接続線 */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 transform -translate-y-1/2 z-0"></div>
            
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {/* ステップ1 */}
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <MessageCircle className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  AIインタビューで<br />体験の深掘り
                </h3>
                <p className="text-gray-600 mb-6">
                  専門設計されたAIがインタビュアーとなり、あなたの受験体験を丁寧に聞き取ります。「なぜその選択をしたのか」「その時どう感じたのか」まで深く掘り下げます。
                </p>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-semibold text-blue-600">AI:</span> 「受験期で一番辛かった時期について詳しく教えてください」
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">あなた:</span> 「高3の秋頃で、模試の結果が...」
                  </div>
                </div>
              </div>

              {/* ステップ2 */}
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  記事雛形の<br />自動生成
                </h3>
                <p className="text-gray-600 mb-6">
                  インタビュー内容を基に、読者の心に響く記事の「設計図」を自動作成。構成や見出しはAIが提案するので、文章が苦手でも安心です。
                </p>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-100">
                  <div className="text-xs text-gray-500 mb-2">生成された記事構成</div>
                  <div className="text-sm space-y-1">
                    <div className="text-indigo-600 font-semibold">1. 親御さんへの手紙</div>
                    <div className="text-gray-600">2. あの日の出来事</div>
                    <div className="text-gray-600">3. 今だから言える感謝</div>
                    <div className="text-gray-600">4. 実践的アドバイス</div>
                  </div>
                </div>
              </div>

              {/* ステップ3 */}
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
                    <Edit className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  簡単編集で<br />記事完成
                </h3>
                <p className="text-gray-600 mb-6">
                  note風のエディタで、生成された雛形を自分らしく編集するだけ。完成した記事は即座に公開され、読者からの反響を受け取れます。
                </p>
                <div className="bg-white rounded-lg p-4 shadow-sm border border-purple-100">
                  <div className="text-xs text-gray-500 mb-2">編集画面</div>
                  <div className="text-sm text-gray-600 mb-2">
                    【___________】の部分を埋めるだけ
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>自動保存済み</span>
                    <span className="text-green-600">公開準備完了</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 結果 */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                結果：あなたの体験が、誰かの人生を変える記事に
              </h3>
              <p className="text-lg opacity-90 max-w-3xl mx-auto">
                文章を書いたことがない人でも、読者の心に響く質の高い記事を作成できます。
                あなたは体験を語るだけ。技術はAIにお任せください。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}