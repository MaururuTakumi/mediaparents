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
  Trash2, 
  Eye, 
  Lock,
  AlertTriangle,
  CheckCircle
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Article {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  is_premium: boolean
  view_count: number
  created_at: string
  published_at: string | null
  writers: {
    id: string
    name: string
    university: string
    is_verified: boolean
  }
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [deleteArticleId, setDeleteArticleId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState('')
  
  const supabase = createClient()

  useEffect(() => {
    loadArticles()
  }, [])

  useEffect(() => {
    // 検索フィルタ
    const filtered = articles.filter(article => 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.writers.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.writers.university.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredArticles(filtered)
  }, [searchQuery, articles])

  const loadArticles = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          writers (
            id,
            name,
            university,
            is_verified
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArticles(data || [])
      setFilteredArticles(data || [])
    } catch (error) {
      console.error('Error loading articles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteArticle = async (articleId: string) => {
    try {
      // 管理アクションログを記録
      const { data: { user } } = await supabase.auth.getUser()
      
      const { error: logError } = await supabase
        .from('admin_action_logs')
        .insert({
          admin_id: user?.id,
          action_type: 'delete_article',
          target_type: 'article',
          target_id: articleId,
          details: { 
            article_title: articles.find(a => a.id === articleId)?.title,
            reason: 'Admin manual deletion'
          }
        })

      if (logError) console.error('Error logging action:', logError)

      // 記事を削除
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId)

      if (error) throw error

      setSuccessMessage('記事を削除しました')
      setTimeout(() => setSuccessMessage(''), 3000)
      
      // リストを更新
      await loadArticles()
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('記事の削除に失敗しました')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">公開</Badge>
      case 'draft':
        return <Badge variant="secondary">下書き</Badge>
      case 'archived':
        return <Badge variant="destructive">アーカイブ</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">記事管理</h1>
        <p className="mt-2 text-gray-600">すべての記事の管理と削除</p>
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>記事一覧</CardTitle>
              <CardDescription>
                登録されているすべての記事 ({filteredArticles.length}件)
              </CardDescription>
            </div>
          </div>
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="タイトル、ライター名、大学名で検索..."
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
          ) : filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">記事が見つかりませんでした</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>タイトル</TableHead>
                    <TableHead>ライター</TableHead>
                    <TableHead>ステータス</TableHead>
                    <TableHead>タイプ</TableHead>
                    <TableHead className="text-right">閲覧数</TableHead>
                    <TableHead>公開日</TableHead>
                    <TableHead className="text-right">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArticles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {article.title}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{article.writers.name}</span>
                          {article.writers.is_verified && (
                            <Badge className="bg-blue-500 text-xs">認証済み</Badge>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {article.writers.university}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell>
                        {article.is_premium ? (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            <Lock className="h-3 w-3 mr-1" />
                            プレミアム
                          </Badge>
                        ) : (
                          <Badge variant="outline">無料</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Eye className="h-3 w-3 text-gray-400" />
                          <span>{article.view_count.toLocaleString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {article.published_at 
                          ? new Date(article.published_at).toLocaleDateString('ja-JP')
                          : '-'
                        }
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
                            <DropdownMenuItem
                              onClick={() => window.open(`/articles/${article.id}`, '_blank')}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              記事を表示
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onSelect={(e) => {
                                    e.preventDefault()
                                    setDeleteArticleId(article.id)
                                  }}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  削除
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>記事を削除しますか？</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    この操作は取り消せません。記事「{article.title}」を完全に削除します。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteArticle(article.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    削除する
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
    </div>
  )
}