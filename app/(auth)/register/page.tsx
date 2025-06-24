'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, User, Mail, Lock, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })
  
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: string[] = []

    if (!formData.email) newErrors.push('メールアドレスは必須です')
    if (!formData.password) newErrors.push('パスワードは必須です')
    if (formData.password.length < 6) newErrors.push('パスワードは6文字以上で入力してください')
    if (formData.password !== formData.confirmPassword) newErrors.push('パスワードが一致しません')
    if (!formData.name) newErrors.push('お名前は必須です')

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // 1. ユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        
        // Check if user already exists
        if (authError.message.toLowerCase().includes('user already registered')) {
          setErrors(['このメールアドレスは既に登録されています。ログインページからログインしてください。'])
          setIsLoading(false)
          
          // Redirect to login page after 2 seconds
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          return
        }
        
        throw new Error(`認証エラー: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('ユーザー登録に失敗しました')
      }

      // 2. 少し待ってからプロフィールを作成
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single()

      if (existingProfile) {
        console.log('Profile already exists, redirecting to home')
        router.push('/')
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email: formData.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()

      if (profileError) {
        console.error('Profile creation error:', profileError)
        
        // If the error is due to unique constraint, user exists but needs to login
        if (profileError.code === '23505') {
          setErrors(['アカウントは既に存在しています。ログインしてください。'])
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          return
        }
        
        throw new Error(`プロフィールの作成に失敗しました: ${profileError.message}`)
      }

      console.log('Profile created successfully:', profileData)

      // 3. 成功時の処理 - ホームページに遷移
      setErrors([])
      alert('登録が完了しました！')
      router.push('/')

    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors([error.message || '登録に失敗しました。もう一度お試しください。'])
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // エラーをクリア
    if (errors.length > 0) {
      setErrors([])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <BookOpen className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            読者アカウント作成
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            記事の閲覧やコメント投稿ができます
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>新規アカウント作成</CardTitle>
            <CardDescription>
              メールアドレスとパスワードで簡単に登録
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Messages */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>
                          {error}
                          {error.includes('既に登録されています') && (
                            <Link href="/login" className="ml-2 text-blue-600 hover:text-blue-500 underline">
                              ログインページへ
                            </Link>
                          )}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>メールアドレス</span>
                  <span className="text-red-500">*</span>
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
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="6文字以上で入力"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>パスワード（確認）</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="パスワードを再入力"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>お名前（ニックネーム可）</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="例: 太郎"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
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
                    <span>登録中...</span>
                  </div>
                ) : (
                  '登録する'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center border-t pt-6">
              <p className="text-sm text-gray-600">
                既にアカウントをお持ちですか？{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  ログイン
                </Link>
              </p>
            </div>

            {/* Writer Register Link */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                ライターとして記事を投稿したい方は
                <Link href="/writer/register" className="text-blue-600 hover:text-blue-500 ml-1">
                  こちら
                </Link>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                ※東京大学の学生のみ
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">無料会員でできること</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                すべての無料記事の閲覧
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                プレミアム記事を月3本まで無料で閲覧
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                記事へのコメント投稿
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                お気に入りのライターをフォロー
              </li>
            </ul>
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