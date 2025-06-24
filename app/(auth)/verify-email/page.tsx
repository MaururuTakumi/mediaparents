'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const [universityName, setUniversityName] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('認証トークンが見つかりません')
      return
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/verify-university-email/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.ok) {
          setStatus('success')
          setMessage(data.message)
          setUniversityName(data.universityName)
        } else {
          setStatus('error')
          setMessage(data.error || '認証に失敗しました')
        }
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setMessage('ネットワークエラーが発生しました')
      }
    }

    verifyEmail()
  }, [token])

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle>大学メールアドレスの確認</CardTitle>
          <CardDescription>
            メールアドレスの確認状況
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">確認中...</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 text-green-500" />
                <div className="text-center space-y-2">
                  <p className="font-medium">{message}</p>
                  {universityName && (
                    <p className="text-sm text-muted-foreground">
                      大学: {universityName}
                    </p>
                  )}
                </div>
                <Button asChild className="w-full">
                  <Link href="/dashboard">
                    ダッシュボードへ移動
                  </Link>
                </Button>
              </>
            )}
            
            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-destructive" />
                <div className="text-center space-y-2">
                  <p className="font-medium text-destructive">{message}</p>
                  <p className="text-sm text-muted-foreground">
                    問題が解決しない場合は、再度メール認証をお試しください。
                  </p>
                </div>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/dashboard/settings/verification">
                    認証ページへ戻る
                  </Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>大学メールアドレスの確認</CardTitle>
            <CardDescription>
              メールアドレスの確認状況
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}