import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import ArticleCard from '@/components/article-card'
import WriterCard from '@/components/writer-card'
import SeminarCard from '@/components/seminar-card'
import Link from 'next/link'
import { ArrowRight, Sparkles, Users, BookOpen } from 'lucide-react'

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
      upcomingSeminars: upcomingSeminars || []
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
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4 mr-2" />
              現役大学生による実体験メディア
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ありがとうお父さんお母さん
            </h1>
            
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              <strong>あなたの経験が、誰かの羅針盤になる。</strong>
            </p>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              現役トップ大学生がリアルな受験体験や学生生活について語るWebメディア。
              AIが生成する高品質な記事と、個別インタビューやオンライン座談会で、
              あなたの疑問に直接答えます。
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/articles">
                  <BookOpen className="mr-2 h-5 w-5" />
                  記事を読む
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Link href="/writers">
                  <Users className="mr-2 h-5 w-5" />
                  ライターを探す
                </Link>
              </Button>
            </div>

            {/* 統計情報 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{latestArticles.length}+</div>
                <div className="text-gray-600">記事数</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{featuredWriters.length}+</div>
                <div className="text-gray-600">認証ライター</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{upcomingSeminars.length}+</div>
                <div className="text-gray-600">開催予定座談会</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 最新記事セクション */}
      {latestArticles.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">最新記事</h2>
              <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-700">
                <Link href="/articles">
                  すべて見る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {latestArticles.slice(0, 6).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 人気記事セクション */}
      {popularArticles.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">人気記事</h2>
              <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-700">
                <Link href="/articles">
                  すべて見る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularArticles.slice(0, 6).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 注目ライターセクション */}
      {featuredWriters.length > 0 && (
        <section className="py-16">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">注目ライター</h2>
              <Button asChild variant="ghost" className="text-blue-600 hover:text-blue-700">
                <Link href="/writers">
                  すべて見る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredWriters.map((writer) => (
                <WriterCard key={writer.id} writer={writer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 座談会セクション */}
      {upcomingSeminars.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">今後のオンライン座談会</h2>
              <Button asChild variant="ghost" className="text-purple-600 hover:text-purple-700">
                <Link href="/seminars">
                  一覧を見る
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingSeminars.map((seminar) => (
                <SeminarCard key={seminar.id} seminar={seminar} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16">
        <div className="container">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              限定記事やオンライン座談会をもっと楽しもう！
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              プレミアム会員になると、すべての限定記事が読み放題。
              オンライン座談会も会員価格で参加できます。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                <Link href="/subscribe">
                  プレミアム会員になる
                  <Sparkles className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/register">
                  ライターとして参加
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* データがない場合の表示 */}
      {latestArticles.length === 0 && popularArticles.length === 0 && featuredWriters.length === 0 && (
        <section className="py-16">
          <div className="container">
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                コンテンツを準備中です
              </h3>
              <p className="text-gray-600 mb-8">
                現在、ライターによる記事作成が進行中です。しばらくお待ちください。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <Link href="/register">ライターとして参加</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/articles">記事一覧を見る</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}