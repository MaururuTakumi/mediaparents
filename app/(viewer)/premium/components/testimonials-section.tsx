import { Star, Quote, Users, Award, TrendingUp } from 'lucide-react'

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "田中さん",
      profile: "小学3年生男子の母 / 34歳 / 会社員（時短勤務）",
      location: "東京都",
      image: "👩‍💼",
      content: "情報収集に使っていた時間が激減しました。以前は夜中まで検索していたのが、今は朝の10分で必要な情報が手に入る。専門家のQ&Aで「うちの子の集中力が続かない」相談をしたところ、具体的なアドバイスをもらえて、実際に改善しました。月1,480円でこの安心感は本当にお得です。",
      benefit: "情報収集時間が80%短縮",
      rating: 5
    },
    {
      name: "佐々木さん",
      profile: "小学2年生女子の母 / 39歳 / 在宅ワーカー",
      location: "神奈川県",
      image: "👩‍💻",
      content: "アンケート機能が本当に心の支えになっています。「習い事の数」について悩んでいた時、同学年の保護者800名以上の回答を見て、「うちもこれで大丈夫」と確信が持てました。コミュニティでも同じ悩みを持つママたちと出会えて、一人じゃないと感じられます。",
      benefit: "子育ての不安が大幅軽減",
      rating: 5
    },
    {
      name: "山田さん",
      profile: "小学1年生・4年生の母 / 41歳 / パート勤務",
      location: "大阪府",
      image: "👩‍🎓",
      content: "オンラインイベントが特に気に入っています。著名な教育専門家の講演を自宅で聞けるなんて。子どもが寝た後の時間が有意義な学びの時間になりました。録画で後から見られるのも、忙しい私には助かります。年額プランにして、長期的に子育てと向き合う覚悟ができました。",
      benefit: "学習意欲と自信が向上",
      rating: 5
    }
  ]

  const expertRecommendation = {
    name: "Dr. 高橋 明子",
    title: "教育心理学博士 / 子ども発達支援センター所長",
    university: "東京教育大学 教授",
    image: "👩‍🏫",
    content: "現代の保護者が抱える「情報過多による混乱」は深刻な社会問題です。このプラットフォームは、専門家の知見と保護者同士の支え合いを両立させた、非常に優れた取り組みだと評価しています。特に匿名性を保ちながらも信頼できる情報環境を整えている点は、現代の子育て支援において重要な innovation です。"
  }

  const stats = [
    { number: "95%", label: "満足度", description: "「生活が改善した」と回答" },
    { number: "87%", label: "継続率", description: "1年以上利用継続" },
    { number: "78%", label: "推奨度", description: "友人に推薦したい" },
    { number: "3.2時間", label: "時短効果", description: "週あたりの情報収集時間短縮" }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container">
        <div className="max-w-6xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4 mr-2" />
              利用者の声
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              先に始めた方々から<br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                喜びの声が届いています
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              実際にプレミアムプランを利用されている保護者の皆様の生の声をお聞きください
            </p>
          </div>

          {/* 利用者数とサマリー */}
          <div className="text-center mb-12">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
              <div className="text-4xl font-bold text-blue-600 mb-2">12,000+</div>
              <div className="text-lg text-gray-700 mb-4">プレミアム会員の保護者が利用中</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stat.number}</div>
                    <div className="text-sm font-medium text-gray-700">{stat.label}</div>
                    <div className="text-xs text-gray-500">{stat.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* お客様の声 */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 relative">
                <div className="absolute -top-3 left-6">
                  <div className="bg-yellow-400 text-yellow-900 p-2 rounded-full">
                    <Quote className="h-4 w-4" />
                  </div>
                </div>
                
                <div className="pt-4 mb-4">
                  <div className="flex items-center mb-3">
                    <div className="text-3xl mr-3">{testimonial.image}</div>
                    <div>
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.profile}</div>
                      <div className="text-xs text-gray-500">{testimonial.location}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-3">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-4 text-sm">
                  {testimonial.content}
                </p>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      {testimonial.benefit}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 専門家推薦 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                <Award className="h-6 w-6" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
              教育専門家からの推薦
            </h3>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 text-center">
                <div className="text-6xl mb-4">{expertRecommendation.image}</div>
                <div className="font-bold text-lg text-gray-900">{expertRecommendation.name}</div>
                <div className="text-blue-600 font-medium">{expertRecommendation.title}</div>
                <div className="text-sm text-gray-600">{expertRecommendation.university}</div>
              </div>

              <div className="md:w-2/3">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
                  <Quote className="h-8 w-8 text-blue-400 mb-4" />
                  <p className="text-gray-700 leading-relaxed italic">
                    {expertRecommendation.content}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 信頼性データ */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">98.2%</div>
                <div className="text-green-100 mb-4">問題解決率</div>
                <p className="text-sm text-green-100">
                  コミュニティやQ&Aで相談した内容について、「解決または改善した」と回答
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6">
              <div className="text-center">
                <div className="text-3xl font-bold mb-2">4.8/5.0</div>
                <div className="text-purple-100 mb-4">総合満足度</div>
                <p className="text-sm text-purple-100">
                  「他の保護者にも推薦したい」との回答が90%以上
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                あなたも、この安心感を体験してみませんか？
              </h3>
              <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
                7日間の無料体験で、プレミアム機能をすべてお試しいただけます。
                きっと、あなたの子育てに新しい確信をもたらすはずです。
              </p>
              <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-lg font-semibold text-lg">
                今すぐ7日間無料体験を始める
              </button>
              <p className="text-xs text-gray-500 mt-3">
                無料期間中の解約で料金は一切かかりません
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}