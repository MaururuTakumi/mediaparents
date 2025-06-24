import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import ArticleCard from '@/components/article-card'
import WriterCard from '@/components/writer-card'
import SeminarCard from '@/components/seminar-card'
import Link from 'next/link'
import { ArrowRight, Sparkles, Users, BookOpen } from 'lucide-react'

interface SeminarWithWriter {
  id: string
  title: string
  description?: string
  scheduled_at: string
  duration_minutes: number
  price: number
  max_participants: number
  writers: {
    id: string
    name: string
    avatar_url?: string
    university: string
  } | null
}

// データベースからデータを取得する関数
async function getHomePageData() {
  const supabase = await createClient()

  try {
    // 人気記事を取得（閲覧数順）
    const { data: popularArticles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        format,
        is_premium,
        view_count,
        tags,
        thumbnail_url,
        published_at,
        writers (
          id,
          name,
          avatar_url,
          university,
          is_verified
        )
      `)
      .eq('status', 'published')
      .order('view_count', { ascending: false })
      .limit(6)

    // 最新記事を取得
    const { data: latestArticles } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        excerpt,
        format,
        is_premium,
        view_count,
        tags,
        thumbnail_url,
        published_at,
        writers (
          id,
          name,
          avatar_url,
          university,
          is_verified
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6)

    // 注目ライターを取得（認証済み順）
    const { data: featuredWriters } = await supabase
      .from('writers')
      .select('*')
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(4)

    // 今後の座談会を取得
    const { data: upcomingSeminars } = await supabase
      .from('seminars')
      .select(`
        id,
        title,
        description,
        scheduled_at,
        duration_minutes,
        price,
        max_participants,
        writers!seminars_host_writer_id_fkey (
          id,
          name,
          avatar_url,
          university
        )
      `)
      .eq('is_active', true)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(3)

    return {
      popularArticles: popularArticles || [],
      latestArticles: latestArticles || [],
      featuredWriters: featuredWriters || [],
      upcomingSeminars: (upcomingSeminars as SeminarWithWriter[]) || []
    }
  } catch (error) {
    console.error('Error fetching home page data:', error)
    return {
      popularArticles: [],
      latestArticles: [],
      featuredWriters: [],
      upcomingSeminars: []
    }
  }
}

export default async function Home() {
  const { popularArticles, latestArticles, featuredWriters, upcomingSeminars } = await getHomePageData()

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Featured Articles */}
          <div className="flex-1">
            {/* Top Stories */}
            {latestArticles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">トップストーリー</h2>
                
                {/* Large Featured Article */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                  <ArticleCard article={latestArticles[0]} variant="large" />
                </div>

                {/* Recent Articles */}
                <div className="space-y-0">
                  {latestArticles.slice(1, 6).map((article) => (
                    <ArticleCard key={article.id} article={article} variant="default" />
                  ))}
                </div>
              </div>
            )}

            {/* Popular Articles */}
            {popularArticles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">人気記事</h2>
                <div className="space-y-0">
                  {popularArticles.slice(0, 5).map((article) => (
                    <ArticleCard key={article.id} article={article} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Featured Writers */}
            {featuredWriters.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">注目のライター</h3>
                <div className="space-y-4">
                  {featuredWriters.slice(0, 4).map((writer) => (
                    <div key={writer.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-semibold text-gray-600">
                          {writer.name?.[0] || 'W'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{writer.name}</p>
                        <p className="text-sm text-gray-500">{writer.university}</p>
                      </div>
                      <button className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 border border-blue-200 rounded hover:bg-blue-50">
                        フォロー
                      </button>
                    </div>
                  ))}
                </div>
                <Link href="/writers" className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  すべてのライターを見る →
                </Link>
              </div>
            )}

            {/* Upcoming Seminars */}
            {upcomingSeminars.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">今後の座談会</h3>
                <div className="space-y-3">
                  {upcomingSeminars.slice(0, 3).map((seminar) => (
                    <div key={seminar.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 text-sm mb-1">{seminar.title}</h4>
                      <p className="text-xs text-gray-600 mb-2">
                        {new Date(seminar.scheduled_at).toLocaleDateString('ja-JP', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {seminar.writers?.name}
                        </span>
                        <span className="text-xs font-medium text-blue-600">
                          ¥{seminar.price?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/seminars" className="block mt-4 text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  座談会一覧を見る →
                </Link>
              </div>
            )}

            {/* Premium Promotion */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
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

            {/* Newsletter */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">最新記事をお届け</h3>
              <p className="text-sm text-gray-600 mb-3">新着記事の通知を受け取る</p>
              <div className="space-y-2">
                <input
                  type="email"
                  placeholder="メールアドレス"
                  className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="w-full bg-gray-900 text-white text-sm font-medium py-2 px-4 rounded hover:bg-gray-800 transition-colors">
                  登録する
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Empty State */}
        {latestArticles.length === 0 && popularArticles.length === 0 && featuredWriters.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              コンテンツを準備中です
            </h3>
            <p className="text-gray-600 mb-8">
              現在、ライターによる記事作成が進行中です。しばらくお待ちください。
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                ライターとして参加
              </Link>
              <Link href="/articles" className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50">
                記事一覧を見る
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}