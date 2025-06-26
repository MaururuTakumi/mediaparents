'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Writer {
  id: string
  name: string
  university: string
  faculty?: string
  grade: number
  bio?: string
  avatar_url?: string
  verification_status: 'pending' | 'approved' | 'rejected'
  is_verified: boolean
  total_earnings: number
}

interface CreatorHeaderProps {
  writer: Writer
}

export default function CreatorHeader({ writer }: CreatorHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const getVerificationBadge = () => {
    switch (writer.verification_status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-500">認証済み</Badge>
      case 'pending':
        return <Badge variant="secondary">認証審査中</Badge>
      case 'rejected':
        return <Badge variant="destructive">認証却下</Badge>
      default:
        return <Badge variant="outline">未認証</Badge>
    }
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              ありがとうお父さんお母さん
            </Link>
            <span className="text-sm text-gray-500">クリエイターダッシュボード</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ダッシュボード
            </Link>
            <Link
              href="/dashboard/articles"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              記事管理
            </Link>
            <Link
              href="/dashboard/interview"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              AIインタビュー
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              設定
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {getVerificationBadge()}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={writer.avatar_url} alt={writer.name} />
                    <AvatarFallback>{writer.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{writer.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {writer.university} {writer.faculty} {writer.grade}年
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">プロフィール設定</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings/verification">本人認証</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">サイトを見る</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}