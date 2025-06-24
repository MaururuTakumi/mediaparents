import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Flag, 
  Settings,
  LogOut,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // セッションチェック
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    redirect('/login')
  }

  // 管理者権限チェック
  const { data: admin } = await supabase
    .from('admins')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('is_active', true)
    .single()

  if (!admin) {
    redirect('/')
  }

  const navigation = [
    { name: 'ダッシュボード', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: '記事管理', href: '/admin/articles', icon: FileText },
    { name: 'ユーザー管理', href: '/admin/users', icon: Users },
    { name: '通報管理', href: '/admin/reports', icon: Flag },
    { name: '設定', href: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-gray-900 text-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-yellow-400 mr-3" />
              <h1 className="text-xl font-bold">管理者パネル</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                {session.user.email}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-gray-900 rounded">
                {admin.role === 'super_admin' ? 'スーパー管理者' : 'モデレーター'}
              </span>
              <form action="/api/auth/signout" method="post">
                <Button 
                  type="submit"
                  variant="ghost" 
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-800"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-md">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <Link 
              href="/"
              className="flex items-center justify-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              ← サイトに戻る
            </Link>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}