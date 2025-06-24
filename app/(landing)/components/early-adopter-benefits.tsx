import { Star, Users, Zap } from 'lucide-react'

export default function EarlyAdopterBenefits() {
  return (
    <section className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          {/* セクションヘッダー */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium mb-6">
              <Star className="h-4 w-4 mr-2" />
              アーリーアダプター限定特典
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              初期メンバーだけの<br />
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                特別な特典
              </span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              サービス立ち上げの初期段階だからこそ提供できる、限定特典をご用意しました。
            </p>
          </div>

          {/* 特典カード */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* 特典1: 創設メンバー認定 */}
            <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              </div>
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">創設メンバー認定</h3>
              <p className="text-gray-600 mb-6">
                プロフィールに「創設メンバー」バッジが付与され、読者からの信頼度が向上します。
              </p>
              <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                <div className="text-sm font-medium text-indigo-800 mb-1">期待効果</div>
                <div className="text-sm text-indigo-700">記事の読者数・収益 20%向上</div>
              </div>
            </div>

            {/* 特典2: 収益保証制度 */}
            <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              </div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">初月収益保証</h3>
              <p className="text-gray-600 mb-6">
                1記事投稿で最低3,000円を保証。サービス立ち上げ期間限定の特別制度です。
              </p>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                <div className="text-sm font-medium text-purple-800 mb-1">保証内容</div>
                <div className="text-sm text-purple-700">1記事投稿で3,000円最低保証</div>
              </div>
            </div>

            {/* 特典3: 運営との直接コミュニケーション */}
            <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
              </div>
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">運営チーム直結</h3>
              <p className="text-gray-600 mb-6">
                専用Slackチャンネルで運営チームと直接やり取り。サービス改善への意見も反映されます。
              </p>
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                <div className="text-sm font-medium text-amber-800 mb-1">参加権利</div>
                <div className="text-sm text-amber-700">サービス開発・改善への直接参加</div>
              </div>
            </div>
          </div>

          {/* 注意書き */}
          <div className="mt-12 text-center">
            <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl mx-auto">
              <p className="text-sm text-gray-600">
                <strong className="text-gray-800">※ 特典は先着50名限定です</strong><br />
                サービスが正式リリースされた後は、これらの特典は提供されません。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}