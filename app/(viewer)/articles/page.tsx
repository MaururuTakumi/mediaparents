import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Filter, Eye, Heart, Calendar, User, Lock, MessageCircle } from 'lucide-react'
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

  // Supabaseの結合クエリの結果を正しい型に変換
  const articles = data?.map((item: any) => ({
    ...item,
    writers: Array.isArray(item.writers) ? item.writers[0] : item.writers
  })) as Article[]
  
  return articles || []
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-2xl">
            {/* Featured Article */}
            {articles.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-200">
                <div className="flex gap-6">
                  {articles[0].thumbnail_url && (
                    <div className="w-80 h-48 overflow-hidden rounded-lg flex-shrink-0">
                      <Image
                        src={articles[0].thumbnail_url}
                        alt={articles[0].title}
                        width={320}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={articles[0].writers.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {articles[0].writers.name?.[0] || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600 font-medium">
                        {articles[0].writers.name}
                      </span>
                      <span className="text-sm text-gray-400">
                        {formatDate(articles[0].published_at)}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                      <Link href={`/articles/${articles[0].id}`}>
                        {articles[0].title}
                      </Link>
                    </h2>
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {articles[0].excerpt}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {articles[0].view_count?.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {articles[0].like_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Article List */}
            <div className="space-y-0">
              {articles.slice(1).map((article) => (
                <div
                  key={article.id}
                  className="py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    {article.thumbnail_url && (
                      <div className="w-32 h-24 overflow-hidden rounded-lg flex-shrink-0">
                        <Image
                          src={article.thumbnail_url}
                          alt={article.title}
                          width={128}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={article.writers.avatar_url} />
                          <AvatarFallback className="text-xs">
                            {article.writers.name?.[0] || 'A'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600 font-medium">
                          {article.writers.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(article.published_at)}
                        </span>
                        {article.is_premium && (
                          <Badge variant="default" className="h-4 text-xs bg-blue-600">
                            プレミアム
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors mb-2">
                        <Link href={`/articles/${article.id}`}>
                          {article.title}
                        </Link>
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {article.view_count?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {article.like_count}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {Math.floor(Math.random() * 50)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-8 py-8">
              <Button variant="outline" size="lg">
                さらに読み込む
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Popular Tags */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">人気のタグ</h3>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Format Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">記事形式</h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  📄 テキスト記事
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  🎥 動画コンテンツ
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors">
                  🎵 音声コンテンツ
                </button>
              </div>
            </div>

            {/* Popular Writers */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">人気のライター</h3>
              <div className="space-y-3">
                {articles.slice(0, 5).map((article, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={article.writers.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {article.writers.name?.[0] || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {article.writers.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {article.writers.university}
                      </p>
                    </div>
                    <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                      フォロー
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Promotion */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-blue-600" />
                <h3 className="font-semibold text-blue-900">プレミアム限定</h3>
              </div>
              <p className="text-sm text-blue-800 mb-3">
                質の高い記事と東大生への個別相談が受け放題
              </p>
              <div className="space-y-1 mb-4">
                <div className="text-xs text-blue-700">✓ 全プレミアム記事読み放題</div>
                <div className="text-xs text-blue-700">✓ 東大生への個別相談</div>
                <div className="text-xs text-blue-700">✓ 限定座談会への参加</div>
              </div>
              <Link href="/subscription">
                <button className="w-full bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded hover:bg-blue-700 transition-colors">
                  1ヶ月無料で始める
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}