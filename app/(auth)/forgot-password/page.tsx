'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setMessage({ type: 'error', text: 'メールアドレスを入力してください' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        throw error
      }

      setMessage({ 
        type: 'success', 
        text: 'パスワードリセット用のメールを送信しました。メールボックスをご確認ください。' 
      })
      setEmail('')
    } catch (error: any) {
      console.error('Password reset error:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'パスワードリセットメールの送信に失敗しました' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            パスワードをリセット
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            登録したメールアドレスを入力してください
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>パスワードリセット</CardTitle>
            <CardDescription>
              パスワードリセット用のリンクをメールで送信します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message */}
              {message && (
                <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                  {message.type === 'error' ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading || message?.type === 'success'}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || message?.type === 'success'}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>送信中...</span>
                  </div>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    リセットメールを送信
                  </>
                )}
              </Button>
            </form>

            {/* Links */}
            <div className="mt-6 text-center space-y-2">
              <div className="flex justify-center gap-4">
                <Link href="/viewer/login" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  <ArrowLeft className="inline h-3 w-3 mr-1" />
                  読者ログイン
                </Link>
                <span className="text-gray-400">|</span>
                <Link href="/writer/login" className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                  <ArrowLeft className="inline h-3 w-3 mr-1" />
                  ライターログイン
                </Link>
              </div>
              <p className="text-sm text-gray-600">
                アカウントをお持ちでないですか？{' '}
                <Link href="/viewer/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  読者登録
                </Link>
                {' / '}
                <Link href="/writer/register" className="text-blue-600 hover:text-blue-500 font-medium">
                  ライター登録
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