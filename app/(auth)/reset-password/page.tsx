'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Lock, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    // URLからのセッション回復を処理
    const handlePasswordReset = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        setMessage({ 
          type: 'error', 
          text: 'パスワードリセットリンクが無効です。もう一度お試しください。' 
        })
      }
    }

    handlePasswordReset()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password) {
      setMessage({ type: 'error', text: '新しいパスワードを入力してください' })
      return
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'パスワードは6文字以上で入力してください' })
      return
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'パスワードが一致しません' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        throw error
      }

      setMessage({ 
        type: 'success', 
        text: 'パスワードが正常に更新されました。ログインページへリダイレクトします...' 
      })

      // 成功後、適切なログインページへリダイレクト
      setTimeout(async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // ライターかどうかチェック
          const { data: writer } = await supabase
            .from('writers')
            .select('id')
            .eq('id', user.id)
            .single()

          const isTokyoUnivEmail = user.email?.endsWith('@g.ecc.u-tokyo.ac.jp')

          if (writer || isTokyoUnivEmail) {
            router.push('/writer/login')
          } else {
            router.push('/viewer/login')
          }
        } else {
          router.push('/viewer/login')
        }
      }, 2000)

    } catch (error: any) {
      console.error('Password update error:', error)
      setMessage({ 
        type: 'error', 
        text: error.message || 'パスワードの更新に失敗しました' 
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
          <Lock className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            新しいパスワードを設定
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            安全なパスワードを設定してください
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>パスワードリセット</CardTitle>
            <CardDescription>
              新しいパスワードを入力してください
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

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>新しいパスワード</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="6文字以上のパスワード"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || message?.type === 'success'}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>パスワード（確認）</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="パスワードを再入力"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>更新中...</span>
                  </div>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    パスワードを更新
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}