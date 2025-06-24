'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Search, 
  MoreHorizontal, 
  Ban, 
  UserCheck,
  AlertTriangle,
  CheckCircle,
  Crown,
  PenTool,
  User
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface UserData {
  id: string
  email: string
  created_at: string
  profiles?: {
    subscription_status: string
  }
  writers?: {
    id: string
    name: string
    university: string
    is_verified: boolean
  } | Array<{
    id: string
    name: string
    university: string
    is_verified: boolean
  }>
  user_bans?: {
    is_active: boolean
    reason: string
    banned_at: string
  }[]
  _count?: {
    articles: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [writers, setWriters] = useState<UserData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [banUserId, setBanUserId] = useState<string | null>(null)
  const [banReason, setBanReason] = useState('')
  const [activeTab, setActiveTab] = useState('readers')
  
  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      // プロファイルからユーザー一覧を取得
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        
      if (profileError) throw profileError
      
      // ライター情報を取得
      const { data: writersData, error: writerError } = await supabase
        .from('writers')
        .select('*')
        
      if (writerError) throw writerError
      
      const userIds = profiles?.map(p => p.id) || []
      const writerUserIds = writersData?.map(w => w.auth_id) || []
      
      // BAN情報を取得
      const { data: bans } = await supabase
        .from('user_bans')
        .select('user_id, is_active, reason, banned_at')
        .in('user_id', userIds)
        .eq('is_active', true)
      
      // 記事数を取得（ライターのみ）
      const writerIds = writersData?.map(w => w.id) || []
      const { data: articleCounts } = await supabase
        .from('articles')
        .select('writer_id')
        .in('writer_id', writerIds)
      
      // データを結合
      const allUsers = profiles?.map(profile => {
        const writer = writersData?.find(w => w.auth_id === profile.id)
        const ban = bans?.find(b => b.user_id === profile.id)
        const articleCount = writer ? articleCounts?.filter(a => a.writer_id === writer.id).length || 0 : 0
        
        return {
          id: profile.id,
          email: profile.email || '',
          created_at: profile.created_at || '',
          profiles: profile,
          writers: writer,
          user_bans: ban ? [ban] : [],
          _count: { articles: articleCount }
        }
      }) || []
      
      // ライターと読者を分離
      const writersOnly = allUsers.filter(u => u.writers)
      const readersOnly = allUsers.filter(u => !u.writers)
      
      setWriters(writersOnly)
      setUsers(readersOnly)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const banUser = async (userId: string, reason: string) => {
    try {
      // 管理アクションログを記録
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: banError } = await supabase
        .from('user_bans')
        .insert({
          user_id: userId,
          banned_by: user?.id,
          reason: reason,
          is_active: true
        })

      if (banError) throw banError

      // ログを記録
      const { error: logError } = await supabase
        .from('admin_action_logs')
        .insert({
          admin_id: user?.id,
          action_type: 'ban_user',
          target_type: 'user',
          target_id: userId,
          details: { reason }
        })

      if (logError) console.error('Error logging action:', logError)

      setSuccessMessage('ユーザーをBANしました')
      setTimeout(() => setSuccessMessage(''), 3000)
      setBanUserId(null)
      setBanReason('')
      
      // リストを更新
      await loadUsers()
    } catch (error) {
      console.error('Error banning user:', error)
      alert('BANに失敗しました')
    }
  }

  const unbanUser = async (userId: string) => {
    try {
      // 管理アクションログを記録
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: unbanError } = await supabase
        .from('user_bans')
        .update({ 
          is_active: false,
          unbanned_at: new Date().toISOString(),
          unbanned_by: user?.id
        })
        .eq('user_id', userId)
        .eq('is_active', true)

      if (unbanError) throw unbanError

      // ログを記録
      const { error: logError } = await supabase
        .from('admin_action_logs')
        .insert({
          admin_id: user?.id,
          action_type: 'unban_user',
          target_type: 'user',
          target_id: userId,
          details: {}
        })

      if (logError) console.error('Error logging action:', logError)

      setSuccessMessage('BANを解除しました')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // リストを更新
      await loadUsers()
    } catch (error) {
      console.error('Error unbanning user:', error)
      alert('BAN解除に失敗しました')
    }
  }

  const filteredUsers = activeTab === 'readers' 
    ? users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : writers.filter(writer => {
        const writerData = Array.isArray(writer.writers) ? writer.writers[0] : writer.writers;
        return writer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          writerData?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          writerData?.university?.toLowerCase().includes(searchQuery.toLowerCase())
      })

  const isBanned = (user: UserData) => {
    return user.user_bans?.some(ban => ban.is_active) || false
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ユーザー管理</h1>
        <p className="mt-2 text-gray-600">ユーザーの管理とアクセス制御</p>
      </div>

      {successMessage && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
          <CardDescription>
            登録されているすべてのユーザー
          </CardDescription>
          <div className="mt-4 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="readers">
                  <User className="h-4 w-4 mr-2" />
                  読者 ({users.length})
                </TabsTrigger>
                <TabsTrigger value="writers">
                  <PenTool className="h-4 w-4 mr-2" />
                  ライター ({writers.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="メールアドレス、名前、大学名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">ユーザーが見つかりませんでした</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>メールアドレス</TableHead>
                    {activeTab === 'writers' && (
                      <>
                        <TableHead>名前</TableHead>
                        <TableHead>大学</TableHead>
                        <TableHead>記事数</TableHead>
                      </>
                    )}
                    <TableHead>ステータス</TableHead>
                    <TableHead>登録日</TableHead>
                    <TableHead className="text-right">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className={isBanned(user) ? 'bg-red-50' : ''}>
                      <TableCell className="font-medium">
                        {user.email}
                      </TableCell>
                      {activeTab === 'writers' && (
                        <>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span>{Array.isArray(user.writers) ? user.writers[0]?.name : user.writers?.name}</span>
                              {(Array.isArray(user.writers) ? user.writers[0]?.is_verified : user.writers?.is_verified) && (
                                <Badge className="bg-blue-500 text-xs">認証済み</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{Array.isArray(user.writers) ? user.writers[0]?.university : user.writers?.university}</TableCell>
                          <TableCell>{user._count?.articles || 0}</TableCell>
                        </>
                      )}
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {isBanned(user) ? (
                            <Badge variant="destructive">
                              <Ban className="h-3 w-3 mr-1" />
                              BAN
                            </Badge>
                          ) : (
                            <Badge className="bg-green-500">
                              <UserCheck className="h-3 w-3 mr-1" />
                              アクティブ
                            </Badge>
                          )}
                          {user.profiles?.subscription_status === 'active' && (
                            <Badge className="bg-yellow-500">
                              <Crown className="h-3 w-3 mr-1" />
                              プレミアム
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('ja-JP')}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">メニューを開く</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>アクション</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {isBanned(user) ? (
                              <DropdownMenuItem
                                onClick={() => unbanUser(user.id)}
                                className="text-green-600"
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                BAN解除
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => setBanUserId(user.id)}
                                className="text-red-600"
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                BAN
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* BAN理由入力ダイアログ */}
      <Dialog open={!!banUserId} onOpenChange={() => setBanUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザーをBANする</DialogTitle>
            <DialogDescription>
              BAN理由を入力してください。この操作により、ユーザーはサイトにアクセスできなくなります。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">BAN理由</Label>
              <Textarea
                id="reason"
                placeholder="規約違反の内容など..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanUserId(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => banUserId && banUser(banUserId, banReason)}
              disabled={!banReason}
            >
              BANする
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}