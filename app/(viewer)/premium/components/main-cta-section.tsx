'use client'

import { ArrowRight, Star, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function MainCTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          {/* メインメッセージ */}
          <div className="mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              さあ、"情報の受け手"から、<br />
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
                "ヒントの発見者"へ。
              </span>
            </h2>
            
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              1ヶ月の無料体験で、まずは人気の東大生インタビュー記事を1本、じっくり読んでみてください。
              きっと、明日からの子育てが変わる発見があります。
            </p>
          </div>

          {/* 価格表示 */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="text-center mb-6">
              <div className="text-4xl font-bold mb-2">
                月額 <span className="text-yellow-400">1,480円</span>
                <span className="text-lg font-normal text-purple-200 ml-2">（税込）</span>
              </div>
              <p className="text-purple-200">年額プランなら2ヶ月分お得</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="font-semibold mb-1">東大生インタビュー記事</div>
                <div className="text-purple-200">読み放題</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="font-semibold mb-1">現役東大生への相談</div>
                <div className="text-purple-200">月1回まで</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="font-semibold mb-1">保護者限定アンケート</div>
                <div className="text-purple-200">参加・閲覧</div>
              </div>
            </div>
          </div>

          {/* メインCTAボタン */}
          <div className="space-y-4 mb-8">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 px-12 py-6 text-xl font-bold"
            >
              <Link href="/viewer/register" className="flex items-center">
                1ヶ月無料で体験を始める
                <ArrowRight className="ml-3 h-6 w-6" />
              </Link>
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4"
              >
                <Link href="#plan-details">
                  サービス詳細を見る
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4"
              >
                <Link href="#faq">
                  よくある質問
                </Link>
              </Button>
            </div>
          </div>

          {/* 安心材料 */}
          <div className="bg-white bg-opacity-10 rounded-xl p-6">
            <h3 className="font-bold mb-4 text-lg">✅ 安心の保証制度</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center">
                <Shield className="h-4 w-4 mr-2 text-green-300" />
                <span>期間中の解約OK！</span>
              </div>
              <div className="flex items-center justify-center">
                <Star className="h-4 w-4 mr-2 text-green-300" />
                <span>クレジットカード登録で全機能利用</span>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="h-4 w-4 mr-2 text-green-300" />
                <span>解約手数料なし</span>
              </div>
            </div>
            <p className="text-purple-200 text-sm mt-4">
              無料体験期間中に解約すれば、料金は一切かかりません
            </p>
          </div>

          {/* 最後のメッセージ */}
          <div className="mt-8">
            <p className="text-lg text-purple-100 max-w-2xl mx-auto">
              子育てに正解はありませんが、ヒントはたくさんあります。<br />
              東大生たちの体験談から、あなたの家庭に合ったヒントを見つけませんか？
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}