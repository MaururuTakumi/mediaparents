import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  
  // 現在のユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()
  
  // 管理者情報を取得
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user?.id)
    .single()
    
  // 他の管理者を取得
  const { data: allAdmins } = await supabase
    .from('admins')
    .select('*')
    .eq('is_active', true)
    
  // 管理アクションログを取得
  const { data: recentLogs } = await supabase
    .from('admin_action_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">管理者設定</h1>
        <p className="mt-2 text-gray-600">管理者権限と活動ログ</p>
      </div>

      <div className="space-y-6">
        {/* 管理者情報 */}
        <Card>
          <CardHeader>
            <CardTitle>あなたの管理者情報</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">メールアドレス</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">権限レベル</span>
                <Badge className="bg-yellow-500">
                  {admin?.role === 'super_admin' ? 'スーパー管理者' : 'モデレーター'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">登録日</span>
                <span className="font-medium">
                  {admin && new Date(admin.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 管理者一覧 */}
        <Card>
          <CardHeader>
            <CardTitle>管理者一覧</CardTitle>
            <CardDescription>
              現在アクティブな管理者
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allAdmins?.map((adminUser) => (
                <div key={adminUser.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className={`h-5 w-5 ${adminUser.role === 'super_admin' ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-medium">{adminUser.user_id}</p>
                      <p className="text-sm text-gray-500">
                        {adminUser.role === 'super_admin' ? 'スーパー管理者' : 'モデレーター'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(adminUser.created_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 最近のアクションログ */}
        <Card>
          <CardHeader>
            <CardTitle>最近の管理アクション</CardTitle>
            <CardDescription>
              管理者による最新の操作履歴
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentLogs && recentLogs.length > 0 ? (
              <div className="space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">
                        {log.action_type === 'delete_article' && '記事削除'}
                        {log.action_type === 'ban_user' && 'ユーザーBAN'}
                        {log.action_type === 'unban_user' && 'BAN解除'}
                        {log.action_type === 'approve_writer' && 'ライター承認'}
                        {log.action_type === 'reject_writer' && 'ライター却下'}
                      </span>
                      <span className="text-gray-500 ml-2">
                        対象: {log.target_type} ({log.target_id.slice(0, 8)}...)
                      </span>
                    </div>
                    <span className="text-gray-500">
                      {new Date(log.created_at).toLocaleString('ja-JP', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">アクションログはありません</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}