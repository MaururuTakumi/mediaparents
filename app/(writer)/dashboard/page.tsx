import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, FileText, TrendingUp, Clock, Plus, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalViews: number
  totalEarnings: number
  verificationStatus: string
}

interface RecentArticle {
  id: string
  title: string
  status: string
  view_count: number
  published_at: string | null
  created_at: string
}

async function getDashboardData() {
  const supabase = await createClient()
  
  // 現在のユーザー取得
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ライター情報取得
  const { data: writer } = await supabase
    .from('writers')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!writer) redirect('/register')

  // 記事統計取得
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, status, view_count, published_at, created_at')
    .eq('writer_id', writer.id)
    .order('created_at', { ascending: false })

  if (!articles) {
    return {
      writer,
      stats: {
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalViews: 0,
        totalEarnings: writer.total_earnings || 0,
        verificationStatus: writer.verification_status
      },
      recentArticles: []
    }
  }

  const stats: DashboardStats = {
    totalArticles: articles.length,
    publishedArticles: articles.filter(a => a.status === 'published').length,
    draftArticles: articles.filter(a => a.status === 'draft').length,
    totalViews: articles.reduce((sum, a) => sum + (a.view_count || 0), 0),
    totalEarnings: writer.total_earnings || 0,
    verificationStatus: writer.verification_status
  }

  const recentArticles: RecentArticle[] = articles.slice(0, 5)

  return { writer, stats, recentArticles }
}

export default async function DashboardPage() {
  const { writer, stats, recentArticles } = await getDashboardData()

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
        return <Badge className="bg-green-500">公開中</Badge>
      case 'draft':
        return <Badge variant="secondary">下書き</Badge>
      case 'archived':
        return <Badge variant="outline">アーカイブ</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500">認証済み</Badge>
      case 'pending':
        return <Badge variant="secondary">審査中</Badge>
      case 'rejected':
        return <Badge variant="destructive">却下</Badge>
      default:
        return <Badge variant="outline">未申請</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            おかえりなさい、{writer.name}さん
          </h1>
          <p className="text-gray-600">
            {writer.university} {writer.faculty} {writer.grade}年
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {getVerificationBadge(stats.verificationStatus)}
          <Link href="/dashboard/articles/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              新規記事作成
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総記事数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">
              公開: {stats.publishedArticles}件 / 下書き: {stats.draftArticles}件
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総閲覧数</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              すべての記事の合計
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">累計収益</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥{stats.totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              今月の収益は集計中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">認証ステータス</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getVerificationBadge(stats.verificationStatus)}
              {stats.verificationStatus !== 'approved' && (
                <Link href="/dashboard/settings/verification">
                  <Button variant="outline" size="sm" className="w-full">
                    認証申請
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Articles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>最近の記事</CardTitle>
                <CardDescription>直近に作成・更新された記事</CardDescription>
              </div>
              <Link href="/dashboard/articles">
                <Button variant="outline" size="sm">
                  すべて見る
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentArticles.length > 0 ? (
              <div className="space-y-4">
                {recentArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium line-clamp-1">{article.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusBadge(article.status)}
                        <span className="text-sm text-gray-500">
                          {article.view_count}回閲覧
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(article.published_at || article.created_at)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/articles/edit/${article.id}`}>
                        <Button variant="outline" size="sm">
                          編集
                        </Button>
                      </Link>
                      {article.status === 'published' && (
                        <Link href={`/articles/${article.id}`}>
                          <Button variant="outline" size="sm">
                            表示
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">まだ記事がありません</p>
                <Link href="/dashboard/articles/new">
                  <Button className="mt-2">
                    最初の記事を作成
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>クイックアクション</CardTitle>
            <CardDescription>よく使う機能へのショートカット</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard/articles/new">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-3" />
                新規記事を作成
              </Button>
            </Link>
            
            <Link href="/dashboard/interview">
              <Button className="w-full justify-start" variant="outline">
                <Sparkles className="h-4 w-4 mr-3" />
                AIインタビューを開始
              </Button>
            </Link>
            
            <Link href="/dashboard/articles">
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-3" />
                記事管理
              </Button>
            </Link>
            
            <Link href="/dashboard/settings">
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="h-4 w-4 mr-3" />
                プロフィール設定
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 今日のヒント</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800">
            記事の閲覧数を上げるには、魅力的なタイトルと読みやすい構成が重要です。
            AIインタビュー機能を使って、あなたの体験を整理してみませんか？
          </p>
        </CardContent>
      </Card>
    </div>
  )
}