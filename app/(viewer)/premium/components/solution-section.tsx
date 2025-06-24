import { Compass, BookOpen, Users, Shield, Target, CheckCircle, MessageSquare, BarChart } from 'lucide-react'

export default function SolutionSection() {
  const solutions = [
    {
      icon: BookOpen,
      title: "東大生独占インタビュー記事",
      description: "どんな本を読んでた？親に言われて嬉しかった言葉は？多角的なテーマの「生の声」が満載",
      details: [
        "幼少期の過ごし方・親との関わり",
        "勉強法・習慣づくりのリアルな話",
        "挫折体験とその乗り越え方"
      ]
    },
    {
      icon: MessageSquare,
      title: "現役東大生への個別相談",
      description: "うちの子、勉強に集中できなくて... そんな個人的な悩みも現役東大生に直接相談",
      details: [
        "少し年上のお兄さん・お姉さんの視点",
        "月1回まで個別に質問可能",
        "具体的で実践的なアドバイス"
      ]
    },
    {
      icon: BarChart,
      title: "保護者限定リアルデータ",
      description: "スマホを持たせるタイミングは？習い事の数は？他の家庭のリアルが分かる",
      details: [
        "匿名だからこそ聞ける本音のデータ",
        "同学年・同地域の保護者の声",
        "あなたの判断をサポートする統計"
      ]
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <Compass className="h-4 w-4 mr-2" />
              私たちのアプローチ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              私たちが届けたいのは、<br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                "模範解答"ではありません。無数の"ヒント"です。
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
              画一的な成功法則を提示するつもりはありません。<br />
              最難関を突破した多様な東大生たちの、一人ひとりの<strong className="text-gray-900">リアルなストーリー</strong>。<br />
              その中から、あなたのご家庭に合う"ヒント"を、宝探しのように見つけてほしいのです。
            </p>
          </div>

          {/* メイン提案 */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12 mb-16">
            <div className="text-center mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                現役東大生100名の"生の声"から学ぶ、新しい子育て
              </h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                幼少期の過ごし方、親との関わり、勉強への取り組み方、挫折の乗り越え方。<br />
                多様な東大生たちのリアルな体験談から、あなた自身の子育てのヒントを見つけませんか？
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {solutions.map((solution, index) => {
                const IconComponent = solution.icon
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600 rounded-full mb-4">
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">
                        {solution.title}
                      </h4>
                      <p className="text-gray-600 text-sm">
                        {solution.description}
                      </p>
                    </div>
                    <ul className="space-y-2">
                      {solution.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 他サービスとの違い */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">❌</span>
                従来の情報収集
              </h4>
              <ul className="space-y-2 text-sm text-red-700">
                <li>• 信頼性が不明な個人ブログやSNS</li>
                <li>• 断片的で体系性のない情報</li>
                <li>• 検索に時間がかかり効率が悪い</li>
                <li>• 他の家庭のリアルな実情が分からない</li>
                <li>• 相談できる人が身近にいない</li>
              </ul>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <h4 className="text-lg font-bold text-green-800 mb-4 flex items-center">
                <span className="text-2xl mr-3">✅</span>
                私たちのプラットフォーム
              </h4>
              <ul className="space-y-2 text-sm text-green-700">
                <li>• 現役東大生100名のリアルな体験談</li>
                <li>• 年齢・段階別に体系化された知識</li>
                <li>• あなたに必要な情報だけを厳選してお届け</li>
                <li>• 同じ境遇の保護者の本音が聞ける</li>
                <li>• 気軽に東大生に個別相談可能</li>
              </ul>
            </div>
          </div>

          {/* 宣言 */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                私たちは宣言します
              </h3>
              <p className="text-blue-100 text-lg max-w-3xl mx-auto">
                子育てにおいて、もう一人で悩む必要はありません。<br />
                東大生のリアルな体験談と、同じ想いを持つ保護者コミュニティが、<br />
                あなたの子育てを確信に満ちたものに変えます。
              </p>
              <div className="mt-6 inline-flex items-center px-6 py-3 bg-white bg-opacity-20 rounded-full">
                <Shield className="h-5 w-5 mr-2" />
                <span className="font-semibold">安心・信頼・効率性を約束します</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}