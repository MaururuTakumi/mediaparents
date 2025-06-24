import { MessageCircle, Heart, Target } from 'lucide-react'

export default function FounderMessage() {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-amber-100 text-amber-800 rounded-full text-sm font-medium mb-6">
              <MessageCircle className="h-4 w-4 mr-2" />
              創設者からのメッセージ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              なぜ、このサービスを始めたのか
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              あなたと同じ東大生として、一人の先輩として、心から伝えたいことがあります。
            </p>
          </div>

          {/* メインコンテンツ */}
          <div className="bg-white rounded-2xl shadow-lg border border-amber-100 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* 左側：創設者情報 */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-8 md:p-12 flex flex-col justify-center">
                <div className="text-center mb-8">
                  {/* アバター */}
                  <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold">林</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">林 拓海</h3>
                  <p className="text-blue-100 mb-1">東京大学農学部4年</p>
                  <p className="text-blue-200 text-sm">発起人・開発者</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-3 text-blue-200" />
                    <span>西大和学園 → 東京大学（1浪）</span>
                  </div>
                  <div className="flex items-center">
                    <Heart className="h-4 w-4 mr-3 text-blue-200" />
                    <span>親子関係改善への強い想い</span>
                  </div>
                </div>
              </div>

              {/* 右側：メッセージ */}
              <div className="p-8 md:p-12">
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p>
                    <strong className="text-amber-600">「お父さん、お母さん、ありがとう。」</strong>
                  </p>
                  
                  <p>
                    受験期、私は親と何度も衝突しました。「なんで分かってくれないんだ」と思うこともありました。でも今振り返ると、親も必死だったんです。子どもの将来を案じ、どう接すればいいか分からず悩んでいたんです。
                  </p>

                  <p>
                    <strong>同じような想いをしている親子が、今もたくさんいます。</strong>
                  </p>

                  <p>
                    私たち東大生の体験談は、そんな悩める親子にとって貴重な「道標」になるはずです。でも、その体験を適切に伝える場所がない。そこで生まれたのが、このサービスです。
                  </p>

                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                    <p className="font-semibold text-amber-800 mb-2">私たちのミッション</p>
                    <p className="text-sm text-amber-700">
                      学生の実体験を通じて、親子間のコミュニケーションギャップを埋め、より良い親子関係を築くお手伝いをしたい。
                    </p>
                  </div>

                  <p>
                    <strong className="text-indigo-600">あなたの経験が、誰かの家族を救うかもしれません。</strong>
                    私と一緒に、この想いを形にしませんか？
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-500">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mr-3">
                      <span className="font-bold text-xs">林</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-700">林 拓海</div>
                      <div>東京大学農学部4年 / サービス発起人</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 共感を促すCTA */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-xl p-6">
              <p className="text-lg font-semibold text-indigo-800 mb-2">
                この想いに共感してくれる仲間を探しています
              </p>
              <p className="text-indigo-600">
                一緒に、意味のあるサービスを創り上げませんか？
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}