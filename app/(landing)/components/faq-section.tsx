'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "文章を書くのが苦手でも大丈夫ですか？",
      answer: "はい、全く問題ありません。AIインタビューで引き出された内容を基に、記事の雛形が自動生成されます。あなたは体験を語り、生成された雛形を自分らしく編集するだけで、読み応えのある記事が完成します。「文章を書く」というより「穴埋めをする」感覚で記事を作成できます。"
    },
    {
      question: "どのくらい稼げますか？",
      answer: "記事の閲覧数や座談会の参加者数により変動しますが、月1-2本の記事投稿で月5,000円〜20,000円程度を想定しています。人気ライターになれば、月50,000円以上も可能です。また、記事は一度書けば継続的に閲覧されるため、過去の記事からも収益が発生し続けます。"
    },
    {
      question: "顔出しや実名公開は必要ですか？",
      answer: "一切不要です。「認証済み匿名」制度により、東大生としての信頼性は保ちながら、完全匿名での活動ができます。ペンネームを使用し、顔写真や詳細なプロフィールの公開は必要ありません。就活や将来への影響を心配する必要はありません。"
    },
    {
      question: "ノルマや締切はありますか？",
      answer: "ありません。あなたのペースで自由に活動できます。研究や就活で忙しい時期は一時休止も可能です。「続けたい時に続ける」が私たちの方針です。プレッシャーなく、あなたの都合に合わせて活動していただけます。"
    },
    {
      question: "どんな記事を書けばいいですか？",
      answer: "あなたの受験体験、大学生活、進路選択などについて、AIインタビューが適切な質問で引き出してくれます。特別なテーマを考える必要はありません。「なぜ東大を目指したのか」「受験期の葛藤」「親との関係」など、あなたの実体験がそのまま価値ある記事になります。"
    },
    {
      question: "学業と両立できますか？",
      answer: "はい、多くのライターが学業と両立しています。1記事の作成には平均1-2時間程度で、空いた時間にAIとの対話を楽しむ感覚で取り組めます。試験期間や就活時期は活動を一時停止することも可能なので、学業を最優先にしていただけます。"
    },
    {
      question: "本当に東大生だけですか？",
      answer: "はい、現在は東大生に限定しています。学生証による厳格な認証を行い、「東大生」というブランドの信頼性を保っています。将来的には他の難関大学にも拡大予定ですが、現在は東大生のみの特別なコミュニティとして運営しています。"
    },
    {
      question: "記事の内容に制限はありますか？",
      answer: "基本的に制限はありませんが、読者（受験生とその保護者）にとって価値のある内容であることが重要です。誹謗中傷や不適切な内容は除きますが、あなたの正直な体験や感情は大歓迎です。失敗談や挫折体験も、多くの読者にとって貴重な情報となります。"
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="h-4 w-4 mr-2" />
              よくある質問
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              東大生からの
              <br />
              <span className="text-orange-600">よくある質問</span>
            </h2>
            <p className="text-lg text-gray-600">
              不安や疑問を解消して、安心してライター活動を始めましょう
            </p>
          </div>

          {/* FAQ一覧 */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between focus:outline-none"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-4">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 追加のサポート情報 */}
          <div className="mt-12 text-center">
            <div className="bg-blue-50 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                他にも質問がありますか？
              </h3>
              <p className="text-gray-600 mb-6">
                ライター専用のサポートチャットで、24時間いつでもお気軽にご質問ください。
                先輩ライターからのアドバイスも受けられます。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/writer/register"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  今すぐ登録して質問する
                </a>
                <a
                  href="mailto:support@example.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  メールで問い合わせ
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}