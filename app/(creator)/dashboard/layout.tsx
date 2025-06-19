import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { FileText, Settings, LogOut, Home, PenTool, Calendar } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: writer } = await supabase
    .from('writers')
    .select('name')
    .eq('id', user?.id)
    .single()

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'ダッシュボード' },
    { href: '/dashboard/articles/new', icon: PenTool, label: '新規記事作成' },
    { href: '/dashboard/articles', icon: FileText, label: '記事管理' },
    { href: '/dashboard/seminars', icon: Calendar, label: '座談会管理' },
    { href: '/dashboard/settings/verification', icon: Settings, label: '設定' },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-muted/30 border-r">
        <div className="p-6">
          <Link href="/dashboard" className="block">
            <h2 className="text-lg font-bold">ライターダッシュボード</h2>
            <p className="text-sm text-muted-foreground mt-1">{writer?.name}</p>
          </Link>
        </div>
        
        <nav className="px-4 pb-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto p-4 border-t">
          <form action="/api/auth/logout" method="POST">
            <Button 
              type="submit" 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              ログアウト
            </Button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}