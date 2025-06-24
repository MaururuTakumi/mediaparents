import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminTempPage() {
  const supabase = await createClient()
  
  // ユーザー情報を取得
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // 管理者権限を確認
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()
    
  if (!admin) {
    redirect('/')
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">管理者ダッシュボード（一時）</h1>
      <p>管理者として正常にアクセスできました！</p>
      
      <div className="mt-8 space-y-4">
        <a href="/admin/dashboard" className="block text-blue-600 underline">
          → ダッシュボード
        </a>
        <a href="/admin/articles" className="block text-blue-600 underline">
          → 記事管理
        </a>
        <a href="/admin/users" className="block text-blue-600 underline">
          → ユーザー管理
        </a>
      </div>
    </div>
  )
}