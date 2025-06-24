import { BookOpen, BarChart, MessageSquare, Users, Video, Star, ArrowRight, Clock } from 'lucide-react'

export default function BenefitsSection() {
  const benefits = [
    {
      icon: BookOpen,
      title: "東大生独占インタビュー記事 読み放題",
      subtitle: "どんな本を読んでた？親に言われて嬉しかった言葉は？",
      description: "ここでしか読めない多角的なテーマの「生の声」が満載。わが子への関わり方のヒントが見つかります。",
      story: "「小学3年生の時、母に『なんで勉強するの？』と聞いたら...」「受験でつまづいた時、父がかけてくれた言葉」など、教科書には載っていないリアルなエピソードを通じて、子育てのヒントを発見できます。勉強法だけでなく、親子関係、挫折の乗り越え方まで、多角的な視点から学べます。",
      features: [
        "幼少期の家庭環境・親との関わり方",
        "勉強習慣・モチベーションの作り方",
        "挫折体験とその乗り越え方",
        "好奇心を育てた体験・きっかけ"
      ],
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      icon: MessageSquare,
      title: "現役東大生への個別相談",
      subtitle: "うちの子、勉強に集中できなくて...",
      description: "そんな個人的な悩みも、現役東大生に直接相談できます。少し年上の賢いお兄さん・お姉さんのような視点から、具体的なアドバイスがもらえます。",
      story: "「息子が算数を嫌がって困っています」「集中力が続かない娘にどう声をかければ？」といった具体的な悩みに、現役東大生が実体験を踏まえてアドバイス。少し先を歩む先輩として親身に答えてくれます。",
      features: [
        "月1回まで個別に質問可能",
        "実体験に基づく具体的なアドバイス",
        "お兄さん・お姉さんのような親しみやすさ",
        "他の保護者の質問・回答も参考に"
      ],
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      icon: BarChart,
      title: "保護者限定アンケート",
      subtitle: "スマホを持たせるタイミングは？習い事の数は？",
      description: "他の家庭のリアルがわかるアンケート機能。匿名だからこそ聞ける、本音のデータがあなたの判断をサポートします。",
      story: "「習い事はいくつやらせてる？」「ゲーム時間のルールは？」「お小遣いの金額は？」同学年の保護者数百名のリアルな回答を見ることで、「うちだけ？」という不安が「みんなも同じ」という安心に変わります。",
      features: [
        "学年・地域別のリアルなデータ",
        "匿名だからこそ分かる本音の統計",
        "あなた自身もアンケートを作成可能",
        "判断に迷った時の参考データとして"
      ],
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    }
  ]

  return (
    <section id="benefits" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              プレミアムプランの価値
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              プレミアムプランで、<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                子育ての"解像度"が上がる3つの体験
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              東大生たちのリアルな声から、あなたの家庭に合ったヒントを見つけてください。
            </p>
          </div>

          {/* ベネフィット一覧 */}
          <div className="space-y-12">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              const isEven = index % 2 === 0
              
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8 lg:gap-12`}
                >
                  {/* コンテンツ部分 */}
                  <div className="flex-1 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className={`${benefit.color} bg-white rounded-full p-3 shadow-md`}>
                        <IconComponent className="h-8 w-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {benefit.title}
                        </h3>
                        <p className={`text-lg ${benefit.color} font-semibold`}>
                          {benefit.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-xl text-gray-700 font-medium">
                      {benefit.description}
                    </p>

                    <div className={`${benefit.bgColor} ${benefit.borderColor} border-l-4 rounded-r-lg p-6`}>
                      <p className="text-gray-700 leading-relaxed">
                        {benefit.story}
                      </p>
                    </div>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {benefit.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-gray-700">
                          <div className={`w-2 h-2 ${benefit.color.replace('text-', 'bg-')} rounded-full mt-2 mr-3 flex-shrink-0`}></div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* ビジュアル部分 */}
                  <div className={`flex-1 ${benefit.bgColor} rounded-2xl p-8 border-2 ${benefit.borderColor}`}>
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-20 h-20 ${benefit.color} bg-white rounded-full mb-6 shadow-lg`}>
                        <IconComponent className="h-10 w-10" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-4">
                        実際の利用シーン
                      </h4>
                      <div className="space-y-3 text-sm text-gray-700">
                        {index === 0 && (
                          <>
                            <div className="flex items-center justify-between bg-white rounded-lg p-3">
                              <span>朝のコーヒータイム</span>
                              <Clock className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-left bg-white rounded-lg p-3">
                              <p className="font-medium mb-1">今日のおすすめ記事</p>
                              <p className="text-xs text-gray-500">「8歳児の集中力を伸ばす3つの習慣」</p>
                            </div>
                          </>
                        )}
                        {index === 1 && (
                          <>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium mb-1">最新アンケート結果</p>
                              <p className="text-xs text-gray-500">「習い事の数」小2保護者812名回答</p>
                            </div>
                            <div className="flex justify-between bg-white rounded-lg p-3">
                              <span>1〜2個: 65%</span>
                              <span>3個以上: 35%</span>
                            </div>
                          </>
                        )}
                        {index === 2 && (
                          <>
                            <div className="bg-white rounded-lg p-3 text-left">
                              <p className="font-medium mb-1">質問例</p>
                              <p className="text-xs text-gray-500">「勉強を嫌がる子への接し方」</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 text-left">
                              <p className="font-medium mb-1">東大生からの回答</p>
                              <p className="text-xs text-gray-500">実体験を踏まえたアドバイス...</p>
                            </div>
                          </>
                        )}
                        {index === 3 && (
                          <>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium mb-1">今日のトピック</p>
                              <p className="text-xs text-gray-500">「我が家の宿題ルール」について</p>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                              <span className="text-xs text-green-600">✓ 5件の新着コメント</span>
                            </div>
                          </>
                        )}
                        {index === 4 && (
                          <>
                            <div className="bg-white rounded-lg p-3">
                              <p className="font-medium mb-1">次回イベント</p>
                              <p className="text-xs text-gray-500">「非認知能力を育む家庭環境」</p>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                              <span className="text-xs text-blue-600">📅 今度の土曜 20:00〜</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* まとめ */}
          <div className="mt-16 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                これらすべてが、月額1,480円で
              </h3>
              <p className="text-gray-600 mb-6">
                ランチ1回分の価格で、あなたの子育てが確信に満ちたものに変わります
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-lg font-semibold flex items-center justify-center">
                  1ヶ月無料で体験を始める
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="border-2 border-gray-300 hover:border-purple-500 text-gray-700 px-8 py-4 rounded-lg font-semibold">
                  プラン詳細を見る
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                無料期間中の解約で料金は一切かかりません
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}