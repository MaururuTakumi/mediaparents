'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Check, 
  Crown, 
  Calendar, 
  Users, 
  MessageSquare, 
  BarChart,
  BookOpen,
  Clock,
  Shield,
  Loader2
} from 'lucide-react'

interface SubscriptionPlansProps {
  user: User
}

interface Subscription {
  id: string
  status: string
  current_period_end: string
  plan_price: number
}

export default function SubscriptionPlans({ user }: SubscriptionPlansProps) {
  const supabase = createClient()
  
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subscribingTo, setSubscribingTo] = useState<string | null>(null)

  useEffect(() => {
    checkCurrentSubscription()
  }, [user])

  const checkCurrentSubscription = async () => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Subscription check error:', error)
        setError('サブスクリプション情報の取得に失敗しました')
      } else {
        setCurrentSubscription(data)
      }
    } catch (error) {
      console.error('Error checking subscription:', error)
      setError('エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubscribe = async (planPrice: number, planType: string) => {
    setSubscribingTo(planType)
    setError(null)

    try {
      // For now, create a mock subscription record
      // In production, this would integrate with Stripe
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          status: 'active',
          plan_price: planPrice,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          stripe_subscription_id: `mock_${Date.now()}_${planType}` // Mock ID
        })
        .select()
        .single()

      if (error) {
        throw new Error('サブスクリプションの作成に失敗しました')
      }

      setCurrentSubscription(data)
      alert('プレミアムプランへの登録が完了しました！1ヶ月無料でお楽しみください。')
    } catch (error: any) {
      console.error('Subscription error:', error)
      setError(error.message || 'サブスクリプションの作成に失敗しました')
    } finally {
      setSubscribingTo(null)
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
        <p className="text-gray-600">プラン情報を読み込み中...</p>
      </div>
    )
  }

  if (currentSubscription) {
    return (
      <div className="text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <div className="text-center">
              <Crown className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-2xl text-purple-900">
                プレミアムプラン加入中
              </CardTitle>
              <CardDescription className="text-purple-700">
                ありがとうございます！すべての機能をご利用いただけます
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">次回請求日</span>
                </div>
                <p className="text-gray-700">
                  {new Date(currentSubscription.current_period_end).toLocaleDateString('ja-JP')}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">プラン料金</span>
                </div>
                <p className="text-gray-700">
                  月額 ¥{currentSubscription.plan_price.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4 text-center">
                ご利用可能な機能
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="font-medium">東大生インタビュー</p>
                  <p className="text-gray-600">記事読み放題</p>
                </div>
                <div className="text-center">
                  <MessageSquare className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="font-medium">個別相談</p>
                  <p className="text-gray-600">月1回まで</p>
                </div>
                <div className="text-center">
                  <BarChart className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="font-medium">保護者アンケート</p>
                  <p className="text-gray-600">全機能利用可能</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              記事を読みに行く
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const plans = [
    {
      id: 'monthly',
      name: '月額プラン',
      price: 1480,
      period: '月',
      popular: true,
      features: [
        '東大生独占インタビュー記事 読み放題',
        '現役東大生への個別相談（月1回）',
        '保護者限定アンケート機能',
        'すべてのプレミアムコンテンツ',
        '広告なしで快適な読書体験',
        'モバイルアプリ対応'
      ]
    },
    {
      id: 'yearly',
      name: '年額プラン',
      price: 14800,
      originalPrice: 17760,
      period: '年',
      popular: false,
      savings: '2ヶ月分お得',
      features: [
        '東大生独占インタビュー記事 読み放題',
        '現役東大生への個別相談（月1回）',
        '保護者限定アンケート機能',
        'すべてのプレミアムコンテンツ',
        '広告なしで快適な読書体験',
        'モバイルアプリ対応',
        '年間特典: 座談会優先予約'
      ]
    }
  ]

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          プランを選択してください
        </h2>
        <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
          <Clock className="h-4 w-4 mr-2" />
          1ヶ月間無料でお試し
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative ${plan.popular ? 'border-purple-300 shadow-lg scale-105' : 'border-gray-200'}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white">
                おすすめ
              </Badge>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="space-y-2">
                <div className="flex items-baseline justify-center space-x-2">
                  <span className="text-3xl font-bold text-gray-900">
                    ¥{plan.price.toLocaleString()}
                  </span>
                  <span className="text-gray-600">/ {plan.period}</span>
                </div>
                {plan.originalPrice && (
                  <div className="text-sm text-gray-500">
                    <span className="line-through">¥{plan.originalPrice.toLocaleString()}</span>
                    <span className="ml-2 text-green-600 font-medium">{plan.savings}</span>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  初回1ヶ月無料
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.price, plan.id)}
                disabled={subscribingTo !== null}
                className={`w-full ${
                  plan.popular 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {subscribingTo === plan.id ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>登録中...</span>
                  </div>
                ) : (
                  '1ヶ月無料で始める'
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>• 無料期間中はいつでもキャンセル可能</p>
                <p>• 自動更新、クレジットカードが必要です</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <Card className="max-w-2xl mx-auto bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">安心保証</span>
            </div>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="text-center">
                <p className="font-medium">30日間返金保証</p>
                <p className="text-blue-600">満足いただけない場合</p>
              </div>
              <div className="text-center">
                <p className="font-medium">いつでもキャンセル</p>
                <p className="text-blue-600">違約金なし</p>
              </div>
              <div className="text-center">
                <p className="font-medium">安全な決済</p>
                <p className="text-blue-600">SSL暗号化</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}