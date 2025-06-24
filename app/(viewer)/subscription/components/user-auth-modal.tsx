'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { X, Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

interface UserAuthModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function UserAuthModal({ onClose, onSuccess }: UserAuthModalProps) {
  const supabase = createClient()
  
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isLogin) {
        // Login process
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        })

        if (authError) {
          throw new Error('メールアドレスまたはパスワードが正しくありません')
        }

        if (!data.user) {
          throw new Error('ログインに失敗しました')
        }

        // Check if this user is a writer
        const { data: writer } = await supabase
          .from('writers')
          .select('id')
          .eq('auth_id', data.user.id)
          .single()

        if (writer) {
          throw new Error('ライターアカウントです。ライター専用ログインページをご利用ください')
        }

        onSuccess()
      } else {
        // Registration process
        if (formData.password !== formData.confirmPassword) {
          throw new Error('パスワードが一致しません')
        }

        if (formData.password.length < 6) {
          throw new Error('パスワードは6文字以上で入力してください')
        }

        if (!formData.name.trim()) {
          throw new Error('お名前を入力してください')
        }

        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              user_type: 'viewer'
            }
          }
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            throw new Error('このメールアドレスは既に登録されています')
          }
          throw new Error(`登録に失敗しました: ${authError.message}`)
        }

        if (!data.user) {
          throw new Error('アカウント作成に失敗しました')
        }

        onSuccess()
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      setError(error.message || 'エラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <CardHeader>
          <CardTitle className="text-center">
            {isLogin ? 'ログイン' : 'アカウント作成'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin 
              ? 'プレミアムプランにアクセスするためにログインしてください' 
              : '1ヶ月無料でプレミアムプランを始めましょう'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>お名前</span>
                </Label>
                <Input
                  id="name"
                  placeholder="例: 田中花子"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>メールアドレス</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="例: hanako@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center space-x-2">
                <Lock className="h-4 w-4" />
                <span>パスワード</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isLogin ? 'パスワードを入力' : '6文字以上で入力'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>パスワード確認</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="パスワードを再入力"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isLogin ? 'ログイン中...' : '作成中...'}</span>
                </div>
              ) : (
                isLogin ? 'ログイン' : 'アカウント作成'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
                setFormData({ email: '', password: '', confirmPassword: '', name: '' })
              }}
              className="text-sm text-purple-600 hover:text-purple-500"
            >
              {isLogin 
                ? 'アカウントをお持ちでないですか？ 新規作成' 
                : '既にアカウントをお持ちですか？ ログイン'
              }
            </button>
          </div>

          {!isLogin && (
            <div className="mt-4 text-xs text-gray-500 text-center">
              アカウント作成により、
              <button className="text-purple-600 hover:underline">利用規約</button>
              および
              <button className="text-purple-600 hover:underline">プライバシーポリシー</button>
              に同意したものとみなされます
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}