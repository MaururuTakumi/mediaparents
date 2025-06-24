import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Eye,
  UserPlus,
  PenTool
} from 'lucide-react'

async function getStatistics() {
  const supabase = await createClient()
  
  // ユーザー統計
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    
  const { count: premiumUsers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')
    
  // ライター統計
  const { count: totalWriters } = await supabase
    .from('writers')
    .select('*', { count: 'exact', head: true })
    
  const { count: verifiedWriters } = await supabase
    .from('writers')
    .select('*', { count: 'exact', head: true })
    .eq('is_verified', true)
    
  // 記事統計
  const { count: totalArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    
  const { count: publishedArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')
    
  const { count: premiumArticles } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('is_premium', true)
    .eq('status', 'published')
    
  // 総閲覧数
  const { data: viewData } = await supabase
    .from('articles')
    .select('view_count')
    
  const totalViews = viewData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0
  
  // 通報数
  const { count: pendingReports } = await supabase
    .from('article_reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')
  
  // 今月の新規ユーザー数
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { count: newUsersThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', startOfMonth.toISOString())
  
  // 最近の記事
  const { data: recentArticles } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      status,
      created_at,
      writers (name)
    `)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return {
    totalUsers: totalUsers || 0,
    premiumUsers: premiumUsers || 0,
    totalWriters: totalWriters || 0,
    verifiedWriters: verifiedWriters || 0,
    totalArticles: totalArticles || 0,
    publishedArticles: publishedArticles || 0,
    premiumArticles: premiumArticles || 0,
    totalViews,
    pendingReports: pendingReports || 0,
    newUsersThisMonth: newUsersThisMonth || 0,
    recentArticles: recentArticles || []
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStatistics()
  
  const cards = [
    {
      title: '総ユーザー数',
      value: stats.totalUsers.toLocaleString(),
      description: `今月の新規: ${stats.newUsersThisMonth}`,
      icon: Users,
      color: 'text-blue-600 bg-blue-100'
    },
    {
      title: 'プレミアム会員',
      value: stats.premiumUsers.toLocaleString(),
      description: `全体の${Math.round((stats.premiumUsers / stats.totalUsers) * 100)}%`,
      icon: DollarSign,
      color: 'text-yellow-600 bg-yellow-100'
    },
    {
      title: 'ライター数',
      value: stats.totalWriters.toLocaleString(),
      description: `認証済み: ${stats.verifiedWriters}`,
      icon: PenTool,
      color: 'text-green-600 bg-green-100'
    },
    {
      title: '公開記事数',
      value: stats.publishedArticles.toLocaleString(),
      description: `プレミアム: ${stats.premiumArticles}`,
      icon: FileText,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      title: '総閲覧数',
      value: stats.totalViews.toLocaleString(),
      description: '全記事の合計',
      icon: Eye,
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      title: '未対応の通報',
      value: stats.pendingReports.toLocaleString(),
      description: '要確認',
      icon: AlertTriangle,
      color: stats.pendingReports > 0 ? 'text-red-600 bg-red-100' : 'text-gray-600 bg-gray-100'
    }
  ]
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">管理者ダッシュボード</h1>
        <p className="mt-2 text-gray-600">サイト全体の統計情報と最新の活動</p>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Recent Articles */}
      <Card>
        <CardHeader>
          <CardTitle>最新の記事</CardTitle>
          <CardDescription>
            最近投稿された記事の一覧
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentArticles.length === 0 ? (
              <p className="text-gray-500">記事がありません</p>
            ) : (
              stats.recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-gray-500">
                      {Array.isArray(article.writers) ? article.writers[0]?.name : (article.writers as any)?.name} • {new Date(article.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-700'
                        : article.status === 'draft'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {article.status === 'published' ? '公開' : article.status === 'draft' ? '下書き' : 'アーカイブ'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}