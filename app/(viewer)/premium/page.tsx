import { Metadata } from 'next'
import HeroSection from './components/hero-section'
import ProblemSection from './components/problem-section'
import SolutionSection from './components/solution-section'
import BenefitsSection from './components/benefits-section'
import MainCTASection from './components/main-cta-section'
import PlanComparison from './components/plan-comparison'
import TestimonialsSection from './components/testimonials-section'
import ClosingSection from './components/closing-section'

export const metadata: Metadata = {
  title: 'プレミアムプラン | ありがとうお父さんお母さん - 子育ての不安を確信に変える',
  description: '情報の迷子から卒業しませんか？現役東大生100名のリアルな体験談。信頼できる子育て情報とリアルな保護者コミュニティで、あなたの子育てをサポート。',
  keywords: '子育て,教育,プレミアム,東大生,保護者,コミュニティ,中学受験,小学生',
  openGraph: {
    title: '情報の迷子から、卒業しませんか？ | プレミアムプラン',
    description: '月額1,480円で、東大生のリアルな体験談と保護者の声が手に入る。子どもの可能性を最大限に引き出す、最高の伴走者になるために。',
    type: 'website',
  }
}

export default function PremiumPage() {
  return (
    <div className="min-h-screen">
      {/* ファーストビューセクション */}
      <HeroSection />
      
      {/* 問題提起・共感パートセクション */}
      <ProblemSection />
      
      {/* 解決策提示セクション */}
      <SolutionSection />
      
      {/* サービス紹介・ベネフィット訴求セクション */}
      <BenefitsSection />
      
      {/* メインCTAセクション */}
      <MainCTASection />
      
      {/* プラン比較表セクション */}
      <PlanComparison />
      
      
      {/* クロージング・CTAセクション */}
      <ClosingSection />
    </div>
  )
}