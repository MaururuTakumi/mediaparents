import { DollarSign, Heart, TrendingUp, Clock, Users, Star, BarChart, Lightbulb } from 'lucide-react'

export default function BenefitsSection() {
  const benefits = [
    {
      icon: DollarSign,
      title: "経験を資産に変える収益システム",
      description: "記事の閲覧数に応じた報酬 + プレミアム会員向け座談会の開催料。時給労働ではない、あなたの「経験価値」に基づく収益化です。",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      features: [
        "閲覧数連動報酬システム",
        "座談会開催による追加収益",
        "人気記事は継続的に収益化"
      ]
    },
    {
      icon: Heart,
      title: "社会貢献と自己成長の実感",
      description: "あなたの記事が、迷っている後輩の道標となり、不安な保護者の支えとなる。読者からの「ありがとう」が、新たな成長のエネルギーになります。",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      features: [
        "読者からの感謝メッセージ",
        "社会貢献の実感",
        "自己効力感の向上"
      ]
    },
    {
      icon: TrendingUp,
      title: "就活で差がつくスキルアップ",
      description: "体験の言語化プロセスを通じて、自己分析力・論理的思考力が向上。面接での「ガクチカ」も、より説得力のあるストーリーに進化します。",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      features: [
        "自己分析力の向上",
        "論理的思考力の強化",
        "面接での差別化ポイント"
      ]
    },
    {
      icon: Clock,
      title: "学業と両立できる自由な働き方",
      description: "締切なし、ノルマなし。空いた時間にAIとの対話を楽しむだけ。研究や就活で忙しい時期は一時休止も自由です。",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      features: [
        "完全自由スケジュール",
        "ノルマ・締切なし",
        "一時休止も可能"
      ]
    }
  ]

  const stats = [
    { number: "月5,000円〜", label: "平均収益", icon: DollarSign },
    { number: "95%", label: "継続率", icon: Star },
    { number: "1.5時間", label: "週平均作業時間", icon: Clock },
    { number: "4.8/5.0", label: "満足度", icon: BarChart }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Lightbulb className="h-4 w-4 mr-2" />
              あなたが得られる価値
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              東大生だからこそ得られる
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                4つのベネフィット
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              あなたの経験と知性を活かして、収益・成長・貢献・自由を同時に手に入れませんか？
            </p>
          </div>

          {/* ベネフィット一覧 */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon
              return (
                <div
                  key={index}
                  className={`${benefit.bgColor} ${benefit.borderColor} border-2 rounded-2xl p-8 hover:shadow-lg transition-all duration-300`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`${benefit.color} bg-white rounded-full p-3 flex-shrink-0`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {benefit.title}
                      </h3>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {benefit.description}
                      </p>
                      <ul className="space-y-2">
                        {benefit.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                            <div className={`w-1.5 h-1.5 ${benefit.color.replace('text-', 'bg-')} rounded-full mr-3`}></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ライターに求める価値 */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                私たちが大切にしたい価値
              </h3>
              <p className="text-gray-600">
                パフォーマンスではなく、あなたの経験と想いを重視します
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-3">
                  <Heart className="h-6 w-6" />
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  真摯さ
                </div>
                <div className="text-sm text-gray-600">
                  経験への誠実さ
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-3">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  共感力
                </div>
                <div className="text-sm text-gray-600">
                  読者への思いやり
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-3">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  成長意欲
                </div>
                <div className="text-sm text-gray-600">
                  学び続ける姿勢
                </div>
              </div>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full mb-3">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  創造性
                </div>
                <div className="text-sm text-gray-600">
                  独自の視点
                </div>
              </div>
            </div>
          </div>

          {/* 理想のライター像 */}
          <div className="mt-16">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl p-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-3">こんな東大生を探しています</h3>
                <p className="text-indigo-100">
                  完璧である必要はありません。共感と成長意欲があれば十分です。
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white bg-opacity-10 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-3 text-white">✓ 後輩や保護者の悩みに共感できる方</h4>
                  <p className="text-indigo-100 text-sm">
                    自分も悩んだ経験があり、同じような気持ちを理解できる
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-3 text-white">✓ 自分の経験を振り返ることができる方</h4>
                  <p className="text-indigo-100 text-sm">
                    成功も失敗も含めて、率直に話せる
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-3 text-white">✓ 文章力に自信がなくても大丈夫</h4>
                  <p className="text-indigo-100 text-sm">
                    AIが質問を通じて、あなたの考えを引き出します
                  </p>
                </div>
                <div className="bg-white bg-opacity-10 rounded-xl p-6">
                  <h4 className="text-lg font-semibold mb-3 text-white">✓ 社会にポジティブな影響を与えたい方</h4>
                  <p className="text-indigo-100 text-sm">
                    お金だけでなく、意味のある活動をしたいという想い
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}