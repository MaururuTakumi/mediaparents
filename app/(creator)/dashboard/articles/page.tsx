import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Eye, 
  Heart, 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Edit2,
  ExternalLink,
  MoreHorizontal,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  excerpt?: string
  format: 'text' | 'video' | 'audio'
  status: 'draft' | 'published' | 'archived'
  is_premium: boolean
  view_count: number
  like_count: number
  tags: string[]
  published_at?: string
  created_at: string
  updated_at: string
}

async function getArticles() {
  const supabase = await createClient()
  
  // 現在のユーザー取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ライター情報取得
  const { data: writer } = await supabase
    .from('writers')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!writer) redirect('/register')

  // 記事一覧取得
  const { data: articles, error } = await supabase
    .from('articles')
    .select('*')
    .eq('writer_id', writer.id)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return articles as Article[]
}

export default async function ArticlesPage() {
  const articles = await getArticles()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500 text-white">公開中</Badge>
      case 'draft':
        return <Badge variant="secondary">下書き</Badge>
      case 'archived':
        return <Badge variant="outline">アーカイブ</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'video':
        return <Badge className="bg-red-500 text-white">動画</Badge>
      case 'audio':
        return <Badge className="bg-green-500 text-white">音声</Badge>
      default:
        return <Badge variant="outline">テキスト</Badge>
    }
  }

  const stats = {
    total: articles.length,
    published: articles.filter(a => a.status === 'published').length,
    draft: articles.filter(a => a.status === 'draft').length,
    totalViews: articles.reduce((sum, a) => sum + a.view_count, 0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">記事管理</h1>
          <p className="text-gray-600">あなたが作成した記事の管理</p>
        </div>
        <Link href="/dashboard/articles/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規記事作成
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-gray-600">総記事数</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-sm text-gray-600">公開中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            <p className="text-sm text-gray-600">下書き</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.totalViews.toLocaleString()}</div>
            <p className="text-sm text-gray-600">総閲覧数</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="記事を検索..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              フィルター
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Articles List */}
      <Card>
        <CardHeader>
          <CardTitle>記事一覧</CardTitle>
          <CardDescription>
            最近更新された順に表示されています
          </CardDescription>
        </CardHeader>
        <CardContent>
          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <div key={article.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusBadge(article.status)}
                        {getFormatBadge(article.format)}
                        {article.is_premium && (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                            プレミアム
                          </Badge>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {article.title}
                      </h3>
                      
                      {article.excerpt && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      
                      {/* Tags */}
                      {article.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {article.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{article.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* Meta Info */}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{article.view_count.toLocaleString()}回閲覧</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{article.like_count}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {article.published_at 
                              ? `公開: ${formatDate(article.published_at)}`
                              : `作成: ${formatDate(article.created_at)}`
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Link href={`/dashboard/articles/edit/${article.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit2 className="h-4 w-4 mr-1" />
                          編集
                        </Button>
                      </Link>
                      
                      {article.status === 'published' && (
                        <Link href={`/articles/${article.id}`} target="_blank">
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            表示
                          </Button>
                        </Link>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>アクション</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            編集
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            複製
                          </DropdownMenuItem>
                          {article.status === 'published' ? (
                            <DropdownMenuItem>
                              非公開にする
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem>
                              公開する
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            削除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                まだ記事がありません
              </h3>
              <p className="text-gray-600 mb-6">
                最初の記事を作成して、あなたの体験を共有しましょう
              </p>
              <div className="space-x-4">
                <Link href="/dashboard/articles/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    新規記事作成
                  </Button>
                </Link>
                <Link href="/dashboard/interview">
                  <Button variant="outline">
                    AIインタビューを開始
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}