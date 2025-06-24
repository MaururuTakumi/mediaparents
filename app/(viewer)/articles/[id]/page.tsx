import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Eye, Heart, Share2, Calendar, User, GraduationCap, Lock } from 'lucide-react'
import Link from 'next/link'
import ArticleComments from '@/components/article-comments'
import ArticleQuestions from '@/components/article-questions'

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  format: 'text' | 'video' | 'audio'
  status: string
  is_premium: boolean
  view_count: number
  like_count: number
  thumbnail_url?: string
  tags: string[]
  published_at: string
  created_at: string
  writers: {
    id: string
    name: string
    university: string
    faculty?: string
    grade: number
    bio?: string
    avatar_url?: string
    is_verified: boolean
  }
}

interface ArticlePageProps {
  params: Promise<{
    id: string
  }>
}

async function getArticle(id: string): Promise<Article | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      writers (
        id,
        name,
        university,
        faculty,
        grade,
        bio,
        avatar_url,
        is_verified
      )
    `)
    .eq('id', id)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  return data as Article
}

async function checkPremiumAccess(userId: string | undefined, articleId: string): Promise<{
  canAccess: boolean
  reason?: string
  currentCount?: number
  monthlyLimit?: number
  remaining?: number
}> {
  if (!userId) {
    return { canAccess: false, reason: 'not_authenticated' }
  }

  const supabase = await createClient()
  
  // RPC関数を呼び出してアクセス可否をチェック
  const { data, error } = await supabase.rpc('can_access_premium_article', {
    p_user_id: userId,
    p_article_id: articleId
  })

  if (error) {
    console.error('Error checking premium access:', error)
    return { canAccess: false, reason: 'error' }
  }

  return data || { canAccess: false, reason: 'unknown' }
}

async function incrementViewCount(articleId: string) {
  const supabase = await createClient()
  
  await supabase
    .from('articles')
    .update({ view_count: supabase.rpc('increment_view_count', { article_id: articleId }) })
    .eq('id', articleId)
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) {
    notFound()
  }

  // ビューカウントを増加
  await incrementViewCount(article.id)

  // プレミアム記事のアクセス制御
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const premiumAccess = await checkPremiumAccess(user?.id, article.id)

  // プレミアム記事で、アクセスが許可されている場合は閲覧履歴を記録
  if (article.is_premium && premiumAccess.canAccess && user?.id && 
      ['within_free_limit', 'has_subscription'].includes(premiumAccess.reason || '')) {
    await supabase.rpc('record_premium_article_view', {
      p_user_id: user.id,
      p_article_id: article.id
    })
  }

  const shouldShowPremiumPaywall = article.is_premium && !premiumAccess.canAccess
  const displayContent = shouldShowPremiumPaywall 
    ? article.content.substring(0, 500) + '...' 
    : article.content

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'video':
        return <Badge className="bg-red-500">動画</Badge>
      case 'audio':
        return <Badge className="bg-green-500">音声</Badge>
      default:
        return <Badge variant="secondary">テキスト</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              {getFormatBadge(article.format)}
              {article.is_premium && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                  <Lock className="h-3 w-3 mr-1" />
                  プレミアム
                </Badge>
              )}
              {article.is_premium && premiumAccess.reason === 'within_free_limit' && premiumAccess.remaining !== undefined && (
                <Badge variant="outline" className="border-blue-500 text-blue-600">
                  無料プレミアム記事 残り{premiumAccess.remaining}本
                </Badge>
              )}
              <div className="flex flex-wrap gap-1">
                {article.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            {article.excerpt && (
              <p className="text-xl text-gray-600 mb-6">
                {article.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.published_at)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{article.view_count.toLocaleString()}回閲覧</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4" />
                  <span>{article.like_count}</span>
                </div>
              </div>
              
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                シェア
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-8">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {displayContent}
                  </div>
                  
                  {shouldShowPremiumPaywall && (
                    <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
                      <div className="text-center">
                        <Lock className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        
                        {premiumAccess.reason === 'not_authenticated' ? (
                          <>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              続きを読むにはログインが必要です
                            </h3>
                            <p className="text-gray-600 mb-4">
                              プレミアム記事を読むにはログインしてください。
                              <br />
                              無料会員の方も月3本まで無料でお読みいただけます。
                            </p>
                            <div className="space-x-4">
                              <Link href="/login">
                                <Button className="bg-blue-500 hover:bg-blue-600">
                                  ログイン
                                </Button>
                              </Link>
                              <Link href="/register">
                                <Button variant="outline">
                                  無料会員登録
                                </Button>
                              </Link>
                            </div>
                          </>
                        ) : premiumAccess.reason === 'free_limit_exceeded' ? (
                          <>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              今月の無料閲覧数に達しました
                            </h3>
                            <p className="text-gray-600 mb-4">
                              無料会員の方は月{premiumAccess.monthlyLimit}本までプレミアム記事をお読みいただけます。
                              <br />
                              今月はすでに{premiumAccess.currentCount}本お読みいただいています。
                              <br />
                              引き続きお楽しみいただくには、プレミアム会員への登録をお願いします。
                            </p>
                            <div className="space-y-2">
                              <Link href="/subscription">
                                <Button className="bg-yellow-500 hover:bg-yellow-600">
                                  プレミアム会員になる（月額1,000円）
                                </Button>
                              </Link>
                              <p className="text-sm text-gray-500">
                                いつでも解約可能・初月から料金が発生します
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              続きを読むにはプレミアム会員登録が必要です
                            </h3>
                            <p className="text-gray-600 mb-4">
                              このコンテンツは有料会員限定です。
                              <br />
                              全ての記事を無制限でお読みいただくには会員登録をお願いします。
                            </p>
                            <div className="space-x-4">
                              <Link href="/subscription">
                                <Button className="bg-yellow-500 hover:bg-yellow-600">
                                  プレミアム会員になる
                                </Button>
                              </Link>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Questions Section */}
            {!shouldShowPremiumPaywall && (
              <ArticleQuestions articleId={article.id} writerId={article.writers.id} />
            )}

            {/* Comments Section */}
            {!shouldShowPremiumPaywall && (
              <ArticleComments articleId={article.id} isPremium={article.is_premium} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">執筆者</h3>
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={article.writers.avatar_url} />
                    <AvatarFallback>{article.writers.name.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold">{article.writers.name}</h4>
                      {article.writers.is_verified && (
                        <Badge className="bg-blue-500 text-xs">認証済み</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-1">
                        <GraduationCap className="h-4 w-4" />
                        <span>{article.writers.university}</span>
                      </div>
                      {article.writers.faculty && (
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>{article.writers.faculty} {article.writers.grade}年</span>
                        </div>
                      )}
                    </div>
                    {article.writers.bio && (
                      <p className="text-sm text-gray-600 mt-2">
                        {article.writers.bio}
                      </p>
                    )}
                    <Link href={`/writers/${article.writers.id}`}>
                      <Button variant="outline" size="sm" className="w-full mt-3">
                        プロフィールを見る
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Articles */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">関連記事</h3>
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    関連記事の実装は今後予定されています
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-2">最新記事をお届け</h3>
                <p className="text-sm text-gray-600 mb-4">
                  新しい記事の通知を受け取りませんか？
                </p>
                <Button className="w-full" variant="outline">
                  通知を受け取る
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}