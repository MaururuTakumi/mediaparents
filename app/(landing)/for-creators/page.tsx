import { Metadata } from 'next'
import HeroSection from '../components/hero-section'
import FounderMessage from '../components/founder-message'
import ProblemSection from '../components/problem-section'
import SolutionSection from '../components/solution-section'
import BenefitsSection from '../components/benefits-section'
import EarlyAdopterBenefits from '../components/early-adopter-benefits'
import RevenueModel from '../components/revenue-model'
import TrustSection from '../components/trust-section'
import FAQSection from '../components/faq-section'
import FinalCTASection from '../components/final-cta-section'

export const metadata: Metadata = {
  title: '東大生ライター募集 | ありがとうお父さんお母さん',
  description: 'あなたの受験経験を記事にして、悩める後輩と保護者の力になりませんか？AIインタビューで簡単に記事作成。完全匿名で安心。',
  keywords: '東大生,ライター募集,受験体験,記事執筆,副業,AI,インタビュー',
  openGraph: {
    title: '東大生ライター募集 | その受験経験は、誰かの希望になる',
    description: 'AIインタビューで体験を記事化。完全匿名で安心。あなたの経験が誰かの人生を変えます。',
    type: 'website',
  }
}

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen">
      {/* ヒーローセクション */}
      <HeroSection />
      
      {/* 創設者からのメッセージセクション */}
      <FounderMessage />
      
      {/* 課題提起セクション */}
      <ProblemSection />
      
      {/* 解決策セクション */}
      <SolutionSection />
      
      {/* ベネフィットセクション */}
      <BenefitsSection />
      
      {/* アーリーアダプター特典セクション */}
      <EarlyAdopterBenefits />
      
      {/* 収益モデルの透明性セクション */}
      <RevenueModel />
      
      {/* 信頼性・安全性セクション */}
      <TrustSection />
      
      {/* FAQセクション */}
      <FAQSection />
      
      {/* 最終CTAセクション */}
      <FinalCTASection />
    </div>
  )
}