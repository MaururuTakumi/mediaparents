import { Button } from '@/components/ui/button'
import { ArrowRight, Clock, Users, BookOpen, Star } from 'lucide-react'
import Link from 'next/link'

export default function FinalCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
      {/* 背景装飾 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-white bg-opacity-10 rounded-full -translate-x-36 -translate-y-36"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white bg-opacity-5 rounded-full translate-x-48 translate-y-48"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white bg-opacity-5 rounded-full -translate-x-32 -translate-y-32"></div>
      </div>

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* メインメッセージ */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              あなたの経験を待つ人がいる。
              <br />
              <span className="text-yellow-300">今、始めよう。</span>
            </h2>
            <div className="text-lg md:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed space-y-4">
              <p>
                この瞬間も、受験に悩む後輩が<strong>「先輩の話を聞きたい」</strong>と思っています。
              </p>
              <p>
                子どもの将来を案じる保護者が<strong>「東大生の本音を知りたい」</strong>と願っています。
              </p>
              <p className="text-yellow-200 font-semibold">
                あなたが踏み出す一歩が、誰かの人生を変えるかもしれません。
              </p>
            </div>
          </div>

          {/* 行動を促すメッセージ */}
          <div className="bg-white bg-opacity-10 rounded-2xl p-8 md:p-12 mb-12 backdrop-blur-sm">
            <h3 className="text-2xl md:text-3xl font-bold mb-6">
              そして、その一歩は確実に、
              <br />
              <span className="text-yellow-300">あなた自身の成長</span>にもつながります。
            </h3>

            <div className="grid md:grid-cols-2 gap-8 text-left max-w-2xl mx-auto">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center">
                  <Users className="h-5 w-5 mr-2 text-yellow-300" />
                  社会貢献の実感
                </h4>
                <p className="text-sm opacity-90">
                  あなたの体験が誰かの支えとなり、社会に価値を提供している実感を得られます。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-300" />
                  スキルアップ
                </h4>
                <p className="text-sm opacity-90">
                  体験の言語化を通じて、自己分析力と論理的思考力が向上します。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center">
                  <BookOpen className="h-5 w-5 mr-2 text-yellow-300" />
                  経験の資産化
                </h4>
                <p className="text-sm opacity-90">
                  これまでの経験を収益化し、継続的な価値創造を実現できます。
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-yellow-300" />
                  自由な働き方
                </h4>
                <p className="text-sm opacity-90">
                  時間と場所に縛られない、新しい形の知的労働を体験できます。
                </p>
              </div>
            </div>
          </div>

          {/* 簡単3ステップ */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-6">
              登録はたった3分。まずは、AIインタビューを体験してみませんか？
            </h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto text-sm">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-300 mb-2">1</div>
                <div>基本情報入力</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-300 mb-2">2</div>
                <div>学生証アップロード</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-300 mb-2">3</div>
                <div>AIインタビュー開始</div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              asChild 
              size="lg" 
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-4 text-lg"
            >
              <Link href="/writer/register">
                無料でライター登録を始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              size="lg" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg"
            >
              <Link href="/articles">
                まずはサンプル記事を読む
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* 安心要素 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm opacity-80">
            <div>✓ 完全無料で開始</div>
            <div className="hidden sm:block">•</div>
            <div>✓ いつでも退会可能</div>
            <div className="hidden sm:block">•</div>
            <div>✓ 個人情報完全保護</div>
          </div>

          {/* 緊急性を演出 */}
          <div className="mt-12 bg-red-500 bg-opacity-20 border border-red-300 border-opacity-30 rounded-xl p-6">
            <div className="flex items-center justify-center mb-3">
              <Clock className="h-5 w-5 mr-2 text-red-200" />
              <span className="font-semibold text-red-200">限定募集</span>
            </div>
            <p className="text-sm">
              東大生ライターは現在<strong className="text-yellow-300">先着50名限定</strong>で募集中です。
              <br />
              質の高いコミュニティを維持するため、定員に達し次第、募集を一時停止いたします。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}