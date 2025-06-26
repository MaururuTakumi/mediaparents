'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import { Menu, X, Search, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('トップ')
  const [user, setUser] = useState<any>(null)
  const [writer, setWriter] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // 認証状態の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      
      if (session?.user) {
        // ライター情報を取得
        const { data: writerData } = await supabase
          .from('writers')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        setWriter(writerData)
      } else {
        setWriter(null)
      }
    })

    // 初回読み込み時の認証状態チェック
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        supabase
          .from('writers')
          .select('*')
          .eq('id', user.id)
          .single()
          .then(({ data }) => setWriter(data))
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const mainTabs = [
    { href: '/', label: 'トップ' },
    { href: '/articles', label: '記事' },
    { href: '/writers', label: 'ライター' },
    { href: '/seminars', label: '座談会' },
    { href: '/premium', label: 'プレミアム' }
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      {/* Top bar */}
      <div className="border-b border-gray-100">
        <div className="container flex h-12 items-center justify-between">
          <Link href="/" className="flex items-center">
            <span className="font-bold text-lg text-gray-900">ありがとうお父さんお母さん</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="キーワードで記事を探す"
                className="pl-10 w-64 h-8 text-sm border-gray-300"
              />
            </div>
            {user ? (
              <>
                {writer && (
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="h-8 text-sm">
                      ダッシュボード
                    </Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={writer?.avatar_url} alt={writer?.name || user.email} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {writer?.name || 'ユーザー'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {writer && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard">ダッシュボード</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/settings">設定</Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      ログアウト
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/for-creators">
                  <Button variant="ghost" size="sm" className="h-8 text-sm">
                    ライターになる
                  </Button>
                </Link>
                <Link href="/viewer/login">
                  <Button variant="outline" size="sm" className="h-8 text-sm">
                    ログイン
                  </Button>
                </Link>
                <Link href="/subscription">
                  <Button size="sm" className="h-8 text-sm bg-blue-600 hover:bg-blue-700">
                    プレミアム登録
                  </Button>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="container">
        <nav className="hidden md:flex h-12 items-center space-x-8">
          {mainTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative px-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.label
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setActiveTab(tab.label)}
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="container py-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="キーワードで記事を探す"
                className="pl-10 w-full h-9 text-sm border-gray-300"
              />
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {mainTabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>

            {/* Buttons */}
            <div className="flex flex-col space-y-2 pt-2">
              {user ? (
                <>
                  {writer && (
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full">
                        ダッシュボード
                      </Button>
                    </Link>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    ログアウト
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/viewer/login">
                    <Button variant="outline" size="sm" className="w-full">
                      ログイン
                    </Button>
                  </Link>
                  <Link href="/subscription">
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                      プレミアム登録
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}