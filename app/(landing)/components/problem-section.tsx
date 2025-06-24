import { AlertCircle, MessageSquare, TrendingDown } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium mb-6">
              <AlertCircle className="h-4 w-4 mr-2" />
              あなたの経験について考えてみてください
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              あなたの受験体験、
              <br />
              <span className="text-orange-600">眠らせていませんか？</span>
            </h2>
          </div>

          {/* 問題提起のストーリー */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                価値ある経験が埋もれている
              </h3>
              <p className="text-gray-600 text-sm">
                東大合格という貴重な体験が、あなた一人の思い出として眠っている
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                伝える場所がない
              </h3>
              <p className="text-gray-600 text-sm">
                サークルの後輩に話すくらいで、本当に必要としている人に届かない
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                文章化のハードル
              </h3>
              <p className="text-gray-600 text-sm">
                「どう書けばいいかわからない」という理由で、経験を活かせずにいる
              </p>
            </div>
          </div>

          {/* メインメッセージ */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 md:p-12 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              でも、考えてみてください。
            </h3>
            <div className="space-y-4 text-lg text-gray-700 max-w-3xl mx-auto">
              <p>
                <strong className="text-orange-600">東大に合格したあなたの経験</strong>は、今まさに受験に挑む後輩たちと、不安を抱える保護者にとって<strong className="text-orange-600">「宝の山」</strong>です。
              </p>
              <p>
                その苦労と成功の軌跡には、<strong>誰かの人生を変える力</strong>があります。
              </p>
              <p className="text-orange-600 font-semibold">
                その貴重な体験を、もっと多くの人に届けませんか？
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}