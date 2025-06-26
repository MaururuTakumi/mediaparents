'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star, Users, BookOpen, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center">
      {/* 背景装飾 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* バッジ */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4 mr-2" />
            東大生限定・ライター募集中
          </div>

          {/* メインキャッチコピー */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              その受験経験は、
            </span>
            <br />
            <span className="text-gray-900">
              誰かの希望になる。
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              そして、君の資産になる。
            </span>
          </h1>

          {/* サブコピー */}
          <div className="space-y-2 mb-8 max-w-3xl mx-auto">
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              AIインタビューで体験を言語化し、同世代や保護者が求める「リアルな声」を届ける。
            </p>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
              場所も時間も自由な、新しい形の知的労働を始めよう。
            </p>
          </div>

          {/* 品質約束 */}
          <div className="grid grid-cols-3 gap-8 mb-12 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-700">厳格な本人認証</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-700">認証済み匿名制度</div>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-sm font-medium text-gray-700">3分で登録完了</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg">
              <Link href="/writer/register">
                今すぐライター登録（3分で完了）
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2 border-gray-300 hover:border-blue-500 px-8 py-4 text-lg">
              <Link href="/articles">
                サンプル記事を読む
                <BookOpen className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* 信頼性アピール */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              認証済み匿名システム
            </div>
            <div className="hidden sm:block">•</div>
            <div>顔出し・実名公開不要</div>
            <div className="hidden sm:block">•</div>
            <div>ノルマ・締切なし</div>
          </div>
        </div>
      </div>
    </section>
  )
}