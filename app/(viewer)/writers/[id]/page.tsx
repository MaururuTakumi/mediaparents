import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import ArticleCard from '@/components/article-card'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  MapPin, 
  Calendar, 
  BookOpen, 
  Eye, 
  Award, 
  Mail, 
  ExternalLink,
  User,
  GraduationCap,
  Star,
  Users
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

interface WriterDetailPageProps {
  params: Promise<{
    id: string
  }>
}

async function getWriterDetail(id: string) {
  const supabase = await createClient()
  
  try {
    // ライター基本情報を取得
    const { data: writer, error: writerError } = await supabase
      .from('writers')
      .select(`
        id,
        name,
        university,
        faculty,
        grade,
        bio,
        avatar_url,
        is_verified,
        total_earnings,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single()

    if (writerError || !writer) {
      return null
    }

    // ライターの記事一覧を取得
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        format,
        is_premium,
        view_count,
        like_count,
        tags,
        thumbnail_url,
        published_at,
        status
      `)
      .eq('writer_id', id)
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (articlesError) {
      console.error('Error fetching articles:', articlesError)
    }

    // 統計データを計算
    const publishedArticles = articles || []
    const totalViews = publishedArticles.reduce((sum, article) => sum + (article.view_count || 0), 0)
    const totalLikes = publishedArticles.reduce((sum, article) => sum + (article.like_count || 0), 0)
    const premiumArticleCount = publishedArticles.filter(article => article.is_premium).length

    return {
      writer,
      articles: publishedArticles,
      stats: {
        totalArticles: publishedArticles.length,
        totalViews,
        totalLikes,
        premiumArticleCount
      }
    }
  } catch (error) {
    console.error('Error fetching writer detail:', error)
    return null
  }
}

export default async function WriterDetailPage({ params }: WriterDetailPageProps) {
  const { id } = await params
  const data = await getWriterDetail(id)
  
  if (!data) {
    notFound()
  }

  const { writer, articles, stats } = data

  return (
    <div className="flex flex-col min-h-screen">
      {/* ライタープロフィールヘッダー */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* アバターと基本情報 */}
              <div className="flex flex-col items-center lg:items-start">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarImage src={writer.avatar_url || ''} alt={writer.name} />
                  <AvatarFallback className="text-2xl">
                    {writer.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                
                {writer.is_verified && (
                  <Badge className="bg-green-100 text-green-800 mb-4">
                    <Award className="h-3 w-3 mr-1" />
                    認証済み
                  </Badge>
                )}
              </div>

              {/* ライター詳細情報 */}
              <div className="flex-1">
                <div className="text-center lg:text-left">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {writer.name}
                  </h1>
                  
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-4">
                    <div className="flex items-center text-gray-600">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      {writer.university}
                    </div>
                    {writer.faculty && (
                      <div className="flex items-center text-gray-600">
                        <BookOpen className="h-4 w-4 mr-2" />
                        {writer.faculty}
                      </div>
                    )}
                    {writer.grade && (
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-2" />
                        {writer.grade}年生
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-center lg:justify-start text-gray-500 mb-6">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDistanceToNow(new Date(writer.created_at), { 
                      addSuffix: true, 
                      locale: ja 
                    })}に参加
                  </div>

                  {writer.bio && (
                    <p className="text-gray-600 leading-relaxed mb-6 max-w-2xl">
                      {writer.bio}
                    </p>
                  )}

                  {/* 統計情報 */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="text-center lg:text-left">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalArticles}</div>
                      <div className="text-sm text-gray-600">記事数</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-2xl font-bold text-green-600">{stats.totalViews.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">総閲覧数</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-2xl font-bold text-purple-600">{stats.totalLikes}</div>
                      <div className="text-sm text-gray-600">総いいね</div>
                    </div>
                    <div className="text-center lg:text-left">
                      <div className="text-2xl font-bold text-orange-600">{stats.premiumArticleCount}</div>
                      <div className="text-sm text-gray-600">プレミアム記事</div>
                    </div>
                  </div>

                  {/* アクションボタン */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <Link href="#articles">
                        <BookOpen className="mr-2 h-4 w-4" />
                        記事を読む
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/writers">
                        <User className="mr-2 h-4 w-4" />
                        他のライターを見る
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ライターの記事一覧 */}
      <section id="articles" className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                {writer.name}の記事
              </h2>
              {stats.totalArticles > 6 && (
                <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-700">
                  <Link href={`/articles?writer=${writer.id}`}>
                    すべて見る
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.slice(0, 6).map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={{
                      ...article,
                      author: {
                        id: writer.id,
                        name: writer.name,
                        avatar_url: writer.avatar_url,
                        university: writer.university,
                        is_verified: writer.is_verified
                      }
                    }} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  まだ記事が投稿されていません
                </h3>
                <p className="text-gray-600 mb-8">
                  {writer.name}さんは現在記事を準備中です。しばらくお待ちください。
                </p>
                <Button asChild variant="outline">
                  <Link href="/articles">他の記事を読む</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 関連ライター・推奨アクション */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              もっと多くのライターを発見しよう
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              さまざまな大学・学部の現役学生が実体験を記事にしています。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/writers">
                  <Users className="mr-2 h-4 w-4" />
                  すべてのライターを見る
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/articles">
                  <BookOpen className="mr-2 h-4 w-4" />
                  記事一覧を見る
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              あなたも経験をシェアしませんか？
            </h2>
            <p className="text-lg mb-8 opacity-90">
              受験体験、大学生活、将来への不安など、あなたの実体験が
              同世代の学生や親御さんの役に立ちます。
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/register">
                <Star className="mr-2 h-4 w-4" />
                ライターとして参加する
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata({ params }: WriterDetailPageProps) {
  const { id } = await params
  const data = await getWriterDetail(id)
  
  if (!data) {
    return {
      title: 'ライターが見つかりません',
    }
  }

  const { writer } = data
  
  return {
    title: `${writer.name} - ライタープロフィール | ありがとうお父さんお母さん`,
    description: writer.bio ? 
      `${writer.university}の${writer.name}さんのプロフィール。${writer.bio.slice(0, 100)}...` :
      `${writer.university}の${writer.name}さんのプロフィールと記事一覧をご覧ください。`,
  }
}