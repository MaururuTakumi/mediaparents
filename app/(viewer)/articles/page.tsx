import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Filter, Eye, Heart, Calendar, User, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface Article {
  id: string
  title: string
  excerpt: string
  format: 'text' | 'video' | 'audio'
  is_premium: boolean
  view_count: number
  like_count: number
  thumbnail_url?: string
  tags: string[]
  published_at: string
  writers: {
    id: string
    name: string
    university: string
    faculty?: string
    grade: number
    avatar_url?: string
    is_verified: boolean
  }
}

async function getArticles(): Promise<Article[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      excerpt,
      format,
      is_premium,
      view_count,
      like_count,
      thumbnail_url,
      tags,
      published_at,
      writers!inner (
        id,
        name,
        university,
        faculty,
        grade,
        avatar_url,
        is_verified
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error fetching articles:', error)
    return []
  }

  return data || []
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

  const getFormatBadge = (format: string) => {
    switch (format) {
      case 'video':
        return <Badge className="bg-red-500 text-white">動画</Badge>
      case 'audio':
        return <Badge className="bg-green-500 text-white">音声</Badge>
      default:
        return <Badge variant="secondary">テキスト</Badge>
    }
  }

  const getPopularTags = () => {
    const tagCounts = new Map()
    articles.forEach(article => {
      article.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      })
    })
    
    return Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag)
  }

  const popularTags = getPopularTags()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              記事一覧
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              現役大学生の体験談から学ぶ、親子関係改善のヒント
            </p>
            
            {/* Search Bar */}
            <div className="flex max-w-2xl mx-auto space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
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
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {articles.map((article) => (
                <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    {article.thumbnail_url ? (
                      <Image
                        src={article.thumbnail_url}
                        alt={article.title}
                        width={400}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">📚</div>
                          <p className="text-sm text-gray-600">記事サムネイル</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex space-x-2">
                      {getFormatBadge(article.format)}
                      {article.is_premium && (
                        <Badge variant="outline" className="bg-white border-yellow-500 text-yellow-600">
                          <Lock className="h-3 w-3 mr-1" />
                          プレミアム
                        </Badge>
                      )}
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={article.writers.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {article.writers.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">
                        {article.writers.name}
                      </span>
                      {article.writers.is_verified && (
                        <Badge className="bg-blue-500 text-xs px-1 py-0">認証済み</Badge>
                      )}
                    </div>
                    
                    <CardTitle className="text-lg line-clamp-2">
                      <Link 
                        href={`/articles/${article.id}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {article.title}
                      </Link>
                    </CardTitle>
                    
                    {article.excerpt && (
                      <CardDescription className="line-clamp-3">
                        {article.excerpt}
                      </CardDescription>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    {/* Tags */}
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

                    {/* Meta Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(article.published_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{article.view_count.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4" />
                        <span>{article.like_count}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link href={`/articles/${article.id}`}>
                        <Button className="w-full" variant="outline">
                          記事を読む
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8">
              <Button variant="outline" size="lg">
                さらに読み込む
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">人気のタグ</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="cursor-pointer hover:bg-gray-100">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Filter by Format */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">形式で絞り込み</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  📄 テキスト記事
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🎥 動画コンテンツ
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🎵 音声コンテンツ
                </Button>
              </CardContent>
            </Card>

            {/* Premium Promotion */}
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-yellow-600" />
                  <span>プレミアム会員</span>
                </CardTitle>
                <CardDescription>
                  すべてのプレミアム記事が読み放題
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1 mb-4">
                  <li>✓ 全てのプレミアム記事</li>
                  <li>✓ 広告なしで読める</li>
                  <li>✓ オフライン読書機能</li>
                  <li>✓ 限定座談会への参加</li>
                </ul>
                <Link href="/subscribe">
                  <Button className="w-full bg-yellow-500 hover:bg-yellow-600">
                    プレミアム会員になる
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">最新記事をお届け</CardTitle>
                <CardDescription>
                  新しい記事の通知を受け取る
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input placeholder="メールアドレス" type="email" />
                  <Button className="w-full">通知を受け取る</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}