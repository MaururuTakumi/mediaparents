import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TestAdminPage() {
  const supabase = await createClient()
  
  // 現在のユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-4">テスト：管理者アクセス</h1>
        <p className="text-red-600">ログインしていません</p>
        <a href="/login" className="text-blue-600 underline">ログインページへ</a>
      </div>
    )
  }
  
  // 管理者情報を取得
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .single()
  
  // すべての管理者を取得
  const { data: allAdmins } = await supabase
    .from('admins')
    .select('*')
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">テスト：管理者アクセス</h1>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">現在のユーザー</h2>
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">管理者権限</h2>
        {error ? (
          <div>
            <p className="text-red-600">エラー: {error.message}</p>
            <p className="text-sm text-gray-600">Code: {error.code}</p>
          </div>
        ) : admin ? (
          <div>
            <p className="text-green-600">✅ 管理者権限あり</p>
            <p><strong>Role:</strong> {admin.role}</p>
            <p><strong>Active:</strong> {admin.is_active ? 'Yes' : 'No'}</p>
          </div>
        ) : (
          <p className="text-red-600">❌ 管理者権限なし</p>
        )}
      </div>
      
      <div className="mb-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">すべての管理者</h2>
        {allAdmins && allAdmins.length > 0 ? (
          <ul>
            {allAdmins.map((a: any) => (
              <li key={a.id}>
                {a.user_id} - {a.role} - Active: {a.is_active ? 'Yes' : 'No'}
              </li>
            ))}
          </ul>
        ) : (
          <p>管理者が登録されていません</p>
        )}
      </div>
      
      <div className="flex gap-4">
        <a href="/admin" className="bg-blue-600 text-white px-4 py-2 rounded">
          管理者ダッシュボードへ
        </a>
        <a href="/debug/auth" className="bg-gray-600 text-white px-4 py-2 rounded">
          デバッグページへ
        </a>
      </div>
    </div>
  )
}