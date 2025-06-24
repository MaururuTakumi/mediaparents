import { AlertTriangle, Smartphone, Search, MessageCircle, Clock } from 'lucide-react'

export default function ProblemSection() {
  const problems = [
    {
      icon: Smartphone,
      title: "SNSで見る「スーパーキッズ」に焦る毎日",
      description: "「○歳で英検準1級合格！」「小2で分数の計算が完璧」...。でも、それが我が子に必要なの？他の子と比べて焦ってばかり。",
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      icon: MessageCircle,
      title: "ママ友との当たり障りのない会話",
      description: "「うちはまだ何も...」なんて言いながら、本当はみんな何をしているのか知りたい。でも、具体的なことは誰も教えてくれない。",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      icon: Search,
      title: "ネット検索で時間だけが過ぎていく",
      description: "「小学生 勉強法」で検索しては、また別のサイト、また別のブログ。気づいたら2時間経っても答えが見つからない。",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      icon: AlertTriangle,
      title: "「正解」がわからない不安",
      description: "情報はたくさんあるけれど、どれが我が家に合っているの？間違った選択をして、子どもの将来を台無しにしてしまったら...？",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium mb-6">
              <AlertTriangle className="h-4 w-4 mr-2" />
              こんな悩み、ありませんか？
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              "正解"のない子育て。<br />
              <span className="text-red-600">こんな不安、抱えていませんか？</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              どの教材が良いのか、どんな声かけをすれば良いのか。<br />
              毎日が手探りの連続ですよね。
            </p>
          </div>

          {/* 問題のストーリー */}
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg mb-12">
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                こんな経験、ありませんか？
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    「評判の良い問題集を買ったけど、子どもが全然やりたがらない...
                    『みんなこれで成績上がってる』って聞いたのに、うちの子には合わないみたい。」
                  </p>
                </div>
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    「塾の面談で『もっと家庭学習を』と言われたけれど、
                    具体的に何をどうすれば？仕事で疲れてる中、どう声をかければいいの？」
                  </p>
                </div>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    「SNSで見る『すごい子』と比べて、うちの子は大丈夫？
                    みんな何歳から何を始めてるの？取り残されてない？」
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                  <p className="text-gray-700 leading-relaxed text-sm">
                    「情報はたくさんあるけれど、結局どれが正しいの？
                    情報が多すぎて。我が家に合った方法が分からない...」
                  </p>
                </div>
              </div>
            </div>
          </div>


          {/* 共感の締めくくり */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                「そうそう、わかる...」<br />
                そう思ったあなたは、決して一人ではありません。
              </h3>
              <p className="text-gray-700 max-w-2xl mx-auto">
                同じような悩みを抱える保護者は、たくさんいます。<br />
                でも答えは、一般論ではなく「リアルな体験談」の中にあるのかもしれません。<br />
                実際に学びの頂点に立った東大生たちが、どんな家庭環境で育ったのか。<br />
                そのヒントを、一緒に探してみませんか？
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}