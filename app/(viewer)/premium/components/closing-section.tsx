'use client'

import { useState } from 'react'
import { ArrowRight, Shield, Clock, Heart, HelpCircle, Plus, Minus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ClosingSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  const faqs = [
    {
      question: "途中で解約はできますか？",
      answer: "はい、いつでも解約可能です。解約手数料などは一切かかりません。マイページから簡単に手続きできます。"
    },
    {
      question: "東大生のインタビュー記事はどのような内容ですか？",
      answer: "現役東大生の幼少期の学習習慣、親との関わり方、挫折体験とその乗り越え方、好奇心を育んだきっかけなど、子育てのヒントになる具体的なエピソードをインタビュー形式でお届けします。"
    },
    {
      question: "個別相談はどのように利用できますか？",
      answer: "月1回まで、現役東大生に直接質問できます。勉強法や学習習慣について、お兄さん・お姉さんのような親しみやすい視点から、実体験に基づくアドバイスをもらえます。"
    },
    {
      question: "無料体験後、自動で課金されますか？",
      answer: "無料体験期間中に解約手続きをしていただければ、課金は発生しません。体験期間終了前にメールでお知らせしますので、安心してお試しください。"
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          {/* メインクロージングメッセージ */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-full text-sm font-medium mb-8">
              <Heart className="h-4 w-4 mr-2" />
              最後に、心からお伝えしたいこと
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
              子どもの可能性を最大限に引き出す<br />
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                最高の伴走者
              </span>になるために
            </h2>

            <div className="max-w-3xl mx-auto space-y-6 text-lg text-blue-100 leading-relaxed">
              <p>
                毎日忙しく働きながら、「子どものために何ができるだろう？」と悩むあなた。
                その気持ちこそが、最も大切な「親としての愛情」です。
              </p>
              <p>
                でも、愛情だけでは解決できない現実的な課題もあります。
                <strong className="text-white">「正しい情報」「適切なタイミング」「実践的な方法」</strong>
                ——これらが揃って初めて、愛情は子どもの成長という結果に結びつきます。
              </p>
              <p>
                月額1,480円。ランチ1回分の投資で、あなたの子育てが確信に満ちたものに変わります。
                今日から1年後、お子さんがどんな成長を見せてくれるか、想像してみてください。
              </p>
            </div>
          </div>

          {/* プレミアムプランのメリット */}
          <div className="mb-16">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200">
              <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800">
                <span className="text-2xl mr-3">✨</span>
                プレミアムプランで得られること
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    必要な情報が効率的に手に入り、時間に余裕が生まれる
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    東大生のリアルな体験から、具体的なヒントを発見
                  </li>
                </ul>
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    同じ境遇の保護者との繋がりで心の支えを得られる
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">•</span>
                    子どもの可能性を最大限に引き出すサポートができる
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 1ヶ月無料特典 */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl p-8 mb-12">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">
                今なら1ヶ月無料でお試しいただけます
              </h3>
              <p className="text-blue-100 mb-6">
                プレミアムプランの全ての機能を、1ヶ月間無料でご体験ください。<br />
                東大生の声から、あなたのご家庭に合ったヒントを見つけてみませんか？
              </p>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block">
                <div className="text-lg font-bold">🎁 今なら1ヶ月無料</div>
                <div className="text-sm text-blue-200 mt-1">
                  無料期間中はいつでもキャンセル可能です
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8 text-white">よくあるご質問</h3>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg border border-white border-opacity-30">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full p-6 text-left flex items-center justify-between hover:bg-white hover:bg-opacity-10 transition-colors"
                  >
                    <span className="font-medium text-white">{faq.question}</span>
                    {openFAQ === index ? (
                      <Minus className="h-5 w-5 text-blue-200" />
                    ) : (
                      <Plus className="h-5 w-5 text-blue-200" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-6">
                      <p className="text-blue-50 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 最終CTA */}
          <div className="text-center">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-3xl p-8 md:p-12">
              <h3 className="text-3xl font-bold mb-6">
                さあ、確信を持った子育てを始めましょう
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <Button size="lg" className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-10 py-6 text-lg font-bold">
                  年額プランで、お得に始める（2ヶ月分無料）
                  <Star className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-6 text-lg font-bold">
                  まずは月額プランで試してみる
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              <p className="text-lg font-semibold text-yellow-300 mb-4">
                🎁 どちらのプランでも、最初の1ヶ月は完全無料
              </p>

              <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6">
                <h4 className="font-bold mb-3 text-center">✅ 安心の保証制度</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center justify-center">
                    <Shield className="h-4 w-4 mr-2 text-green-300" />
                    1ヶ月無料体験
                  </div>
                  <div className="flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-2 text-green-300" />
                    いつでも解約OK
                  </div>
                  <div className="flex items-center justify-center">
                    <HelpCircle className="h-4 w-4 mr-2 text-green-300" />
                    安心サポート
                  </div>
                </div>
              </div>

              <p className="text-blue-200 text-sm">
                無料体験期間中に解約すれば、料金は一切かかりません。<br />
                まずは安心して、プレミアム機能をすべてお試しください。
              </p>
            </div>
          </div>

          {/* 最後のメッセージ */}
          <div className="mt-12 text-center">
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              あなたの愛情と、私たちの専門知識を組み合わせて、<br />
              お子さんの輝かしい未来を一緒に作っていきましょう。
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}