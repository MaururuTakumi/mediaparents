'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Mail, Lock, LogIn } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      console.log('Starting login process...')
      
      // ログイン処理
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      console.log('Auth response:', { data, authError })

      if (authError) {
        console.error('Login error details:', authError)
        throw new Error('メールアドレスまたはパスワードが正しくありません')
      }

      if (!data.user) {
        throw new Error('ログインに失敗しました')
      }

      console.log('User authenticated:', data.user.id)

      // 読者としてログイン成功
      console.log('Login successful, redirecting to home...')
      
      // プロファイルの確認/作成
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        })

      if (profileError) {
        console.error('Profile update error:', profileError)
      }
      
      // リダイレクト前にローディング状態を解除
      setIsLoading(false)
      
      // 成功メッセージを表示
      setError(null)
      
      // ホームページにリダイレクト
      console.log('Executing redirect to home...')
      window.location.href = '/'

    } catch (error: any) {
      console.error('Login process error:', error)
      setError(error.message || 'ログインに失敗しました')
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            読者ログイン
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            記事の閲覧やコメント投稿ができます
          </p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle>読者アカウントにログイン</CardTitle>
            <CardDescription>
              メールアドレスとパスワードを入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>メールアドレス</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="例: taro@example.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>パスワード</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="パスワードを入力"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>ログイン中...</span>
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    ログイン
                  </>
                )}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center border-t pt-6">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでないですか？{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  新規登録
                </Link>
              </p>
            </div>

            {/* Writer Login Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                ライターとしてログインしたい方は
                <Link href="/writer/login" className="text-blue-600 hover:text-blue-500 ml-1">
                  こちら
                </Link>
              </p>
            </div>

            {/* Forgot Password */}
            <div className="mt-2 text-center">
              <p className="text-sm text-gray-600">
                <Link href="/forgot-password" className="text-blue-600 hover:text-blue-500">
                  パスワードを忘れた場合
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}