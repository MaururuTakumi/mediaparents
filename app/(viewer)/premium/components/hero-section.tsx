'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Users, Shield, ArrowRight, Clock, MessageSquare, BarChart } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative">
        <div className="max-w-5xl mx-auto text-center">
          {/* 権威性バッジ */}
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-8">
            <Star className="h-4 w-4 mr-2" />
            現役東大生100名のリアルな声を独占配信
          </div>

          {/* メインキャッチコピー */}
          <div className="space-y-6 mb-8">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              <span className="text-gray-900">
                わが子の"学ぶ力"を伸ばした家庭の、
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                リアルな声、知りたくありませんか？
              </span>
            </h1>
            
            <div className="text-xl md:text-2xl font-medium text-gray-700 space-y-2">
              <p>塾の情報だけでは、もう足りない。</p>
              <p>答えは、少し未来を歩む<span className="text-purple-600 font-semibold">先輩たちの"生の声"</span>にありました。</p>
            </div>
          </div>

          {/* サブコピー */}
          <div className="space-y-2 mb-10 max-w-4xl mx-auto">
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              現役東大生たちのインタビュー記事が読み放題。勉強法から親との関わりまで、
            </p>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              リアルな声から子育てのヒントが見つかるプラットフォームです。
            </p>
          </div>

          {/* 価値提案 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">東大生の声を覗く</h3>
              <p className="text-sm text-gray-600">独占インタビュー記事で知る、幼少期から現在までのリアルなストーリー</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">東大生に聞く</h3>
              <p className="text-sm text-gray-600">個人的な悩みも、現役東大生に直接相談。お兄さん・お姉さんのような視点から</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">保護者と繋がる</h3>
              <p className="text-sm text-gray-600">「みんなどうしてる？」が分かる限定アンケート機能で安心を</p>
            </div>
          </div>

          {/* 特別オファー */}
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-3">
              <Badge className="bg-red-500 text-white px-3 py-1">今だけ</Badge>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              1ヶ月無料体験
            </h3>
            <p className="text-gray-700 text-sm">
              東大生インタビュー記事読み放題、個別相談機能など全ての機能をお試しいただけます。
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-6 text-lg font-semibold">
              <Link href="/subscription" className="flex items-center">
                1ヶ月無料で体験を始める
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="border-2 border-gray-300 hover:border-purple-500 px-10 py-6 text-lg">
              <Link href="#benefits">
                サービス詳細を見る
              </Link>
            </Button>
          </div>

          {/* 安心材料 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              期間中の解約OK！
            </div>
            <div className="hidden sm:block">•</div>
            <div>クレジットカード登録で全ての機能が使い放題</div>
            <div className="hidden sm:block">•</div>
            <div>月額1,480円〜（ランチ1回分）</div>
          </div>

          {/* 価格 */}
          <div className="mt-8 text-center">
            <p className="text-2xl font-bold text-gray-900">
              月額 <span className="text-purple-600">1,480円</span>
              <span className="text-sm font-normal text-gray-600 ml-2">（税込）</span>
            </p>
            <p className="text-sm text-gray-600">年額プランなら2ヶ月分お得</p>
          </div>
        </div>
      </div>
    </section>
  )
}