'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function AuthDebugPage() {
  const [authStatus, setAuthStatus] = useState<any>(null)
  const [adminStatus, setAdminStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      // セッション情報を確認
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Session check:', { session, sessionError })
      
      // 認証状態を確認
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('User check:', { user, authError })
      
      if (authError) {
        setAuthStatus({ error: authError.message })
      } else if (user) {
        setAuthStatus({ 
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          },
          session: session
        })

        // 管理者権限を確認
        const { data: admin, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        console.log('Admin check:', { admin, adminError })

        if (adminError) {
          setAdminStatus({ 
            isAdmin: false, 
            error: adminError.message,
            code: adminError.code,
            details: adminError.details
          })
        } else if (admin) {
          setAdminStatus({ 
            isAdmin: true, 
            admin: admin 
          })
        }
      } else {
        setAuthStatus({ 
          isAuthenticated: false,
          message: 'ログインしていません' 
        })
      }
    } catch (error: any) {
      console.error('Auth check error:', error)
      setAuthStatus({ error: error.message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert('ログアウトエラー: ' + error.message)
    } else {
      window.location.href = '/'
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-gray-600">認証状態を確認中...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8">認証デバッグ情報</h1>

      {/* 認証状態 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {authStatus?.isAuthenticated ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>認証状態</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {authStatus?.isAuthenticated ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✅ ログイン済み</p>
              <div className="bg-gray-50 p-4 rounded space-y-1">
                <p><strong>ユーザーID:</strong> {authStatus.user.id}</p>
                <p><strong>メール:</strong> {authStatus.user.email}</p>
                <p><strong>登録日:</strong> {new Date(authStatus.user.created_at).toLocaleString('ja-JP')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-red-600 font-medium">❌ 未ログイン</p>
              {authStatus?.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authStatus.error}</AlertDescription>
                </Alert>
              )}
              <Button onClick={() => window.location.href = '/login'}>
                ログインページへ
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 管理者権限 */}
      {authStatus?.isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {adminStatus?.isAdmin ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span>管理者権限</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {adminStatus?.isAdmin ? (
              <div className="space-y-2">
                <p className="text-green-600 font-medium">✅ 管理者権限あり</p>
                <div className="bg-gray-50 p-4 rounded space-y-1">
                  <p><strong>権限:</strong> {adminStatus.admin.role}</p>
                  <p><strong>アクティブ:</strong> {adminStatus.admin.is_active ? 'はい' : 'いいえ'}</p>
                  <p><strong>登録日:</strong> {new Date(adminStatus.admin.created_at).toLocaleString('ja-JP')}</p>
                </div>
                <Button 
                  onClick={() => window.location.href = '/admin'}
                  className="mt-4"
                >
                  管理者ダッシュボードへ
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-600 font-medium">❌ 管理者権限なし</p>
                {adminStatus?.error && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      エラー: {adminStatus.error}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="mt-4 p-4 bg-yellow-50 rounded">
                  <p className="text-sm text-yellow-800 mb-2">
                    管理者として登録するには、SupabaseのSQL Editorで以下を実行してください：
                  </p>
                  <pre className="bg-gray-800 text-white p-3 rounded text-xs overflow-x-auto">
{`INSERT INTO admins (user_id, role, is_active)
VALUES ('${authStatus.user.id}', 'super_admin', true)
ON CONFLICT (user_id) DO UPDATE 
SET role = 'super_admin', is_active = true;`}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* アクション */}
      <Card>
        <CardHeader>
          <CardTitle>アクション</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={checkAuthStatus} variant="outline" className="w-full">
            認証状態を再確認
          </Button>
          {authStatus?.isAuthenticated && (
            <Button onClick={handleLogout} variant="destructive" className="w-full">
              ログアウト
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}