import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import WriterCard from '@/components/writer-card'
import { Search, Filter, Users, Star } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface SearchParams {
  search?: string
  university?: string
  verified?: string
  sort?: string
}

interface WritersPageProps {
  searchParams: Promise<SearchParams>
}

async function getWriters(searchParams: SearchParams) {
  const supabase = await createClient()
  
  try {
    let query = supabase
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
        articles!inner (
          id,
          title,
          view_count,
          status
        )
      `)

    // 検索条件の適用
    if (searchParams.search) {
      query = query.or(`name.ilike.%${searchParams.search}%,university.ilike.%${searchParams.search}%,faculty.ilike.%${searchParams.search}%`)
    }

    if (searchParams.university && searchParams.university !== 'all') {
      query = query.eq('university', searchParams.university)
    }

    if (searchParams.verified === 'true') {
      query = query.eq('is_verified', true)
    }

    // ソート条件の適用
    switch (searchParams.sort) {
      case 'verified':
        query = query.order('is_verified', { ascending: false }).order('created_at', { ascending: false })
        break
      case 'latest':
        query = query.order('created_at', { ascending: false })
        break
      case 'articles':
        query = query.order('total_earnings', { ascending: false })
        break
      default:
        query = query.order('is_verified', { ascending: false }).order('created_at', { ascending: false })
    }

    const { data: writers, error } = await query

    if (error) {
      console.error('Error fetching writers:', error)
      return []
    }

    // 記事数と総閲覧数を集計
    const processedWriters = writers?.map(writer => {
      const publishedArticles = writer.articles?.filter(article => article.status === 'published') || []
      const totalViews = publishedArticles.reduce((sum, article) => sum + (article.view_count || 0), 0)
      
      return {
        ...writer,
        articleCount: publishedArticles.length,
        totalViews
      }
    }) || []

    return processedWriters
  } catch (error) {
    console.error('Error fetching writers:', error)
    return []
  }
}

async function getUniversities() {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('writers')
      .select('university')
      .not('university', 'is', null)

    if (error) {
      console.error('Error fetching universities:', error)
      return []
    }

    // 重複削除してソート
    const universities = [...new Set(data?.map(w => w.university) || [])].sort()
    return universities
  } catch (error) {
    console.error('Error fetching universities:', error)
    return []
  }
}

export default async function WritersPage({ searchParams }: WritersPageProps) {
  const params = await searchParams
  const writers = await getWriters(params)
  const universities = await getUniversities()
  
  const verifiedCount = writers.filter(w => w.is_verified).length
  const totalArticles = writers.reduce((sum, w) => sum + w.articleCount, 0)
  const totalViews = writers.reduce((sum, w) => sum + w.totalViews, 0)

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダーセクション */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Users className="h-4 w-4 mr-2" />
              現役大学生ライター
            </div>
            
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ライター一覧
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              実体験を基にした記事を執筆する現役トップ大学生ライターたち。
              それぞれの専門分野や経験を活かした質の高いコンテンツをお届けします。
            </p>

            {/* 統計情報 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{writers.length}</div>
                <div className="text-gray-600">登録ライター</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{verifiedCount}</div>
                <div className="text-gray-600">認証済みライター</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{totalArticles}</div>
                <div className="text-gray-600">公開記事数</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 検索・フィルターセクション */}
      <section className="py-8 bg-white border-b">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <form className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* 検索バー */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    name="search"
                    placeholder="ライター名、大学名、学部で検索..."
                    defaultValue={searchParams.search}
                    className="pl-10"
                  />
                </div>

                {/* 大学フィルター */}
                <Select name="university" defaultValue={searchParams.university || "all"}>
                  <SelectTrigger className="w-full lg:w-48">
                    <SelectValue placeholder="大学で絞り込み" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべての大学</SelectItem>
                    {universities.map((university) => (
                      <SelectItem key={university} value={university}>
                        {university}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 認証ステータスフィルター */}
                <Select name="verified" defaultValue={searchParams.verified || "all"}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="認証状態" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">すべて</SelectItem>
                    <SelectItem value="true">認証済み</SelectItem>
                  </SelectContent>
                </Select>

                {/* ソートオプション */}
                <Select name="sort" defaultValue={searchParams.sort || 'verified'}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="並び順" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verified">認証済み順</SelectItem>
                    <SelectItem value="latest">登録順</SelectItem>
                    <SelectItem value="articles">記事数順</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 適用されているフィルターの表示 */}
              {(searchParams.search || (searchParams.university && searchParams.university !== 'all') || searchParams.verified === 'true') && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">フィルター:</span>
                  {searchParams.search && (
                    <Badge variant="secondary">
                      検索: {searchParams.search}
                    </Badge>
                  )}
                  {searchParams.university && searchParams.university !== 'all' && (
                    <Badge variant="secondary">
                      大学: {searchParams.university}
                    </Badge>
                  )}
                  {searchParams.verified === 'true' && (
                    <Badge variant="secondary">
                      認証済みのみ
                    </Badge>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ライター一覧セクション */}
      <section className="py-16 flex-1">
        <div className="container">
          {writers.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {writers.length}名のライター
                </h2>
                {searchParams.search && (
                  <p className="text-gray-600">
                    「{searchParams.search}」の検索結果
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {writers.map((writer) => (
                  <WriterCard key={writer.id} writer={writer} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                {searchParams.search || (searchParams.university && searchParams.university !== 'all') || searchParams.verified === 'true'
                  ? '条件に一致するライターが見つかりませんでした' 
                  : 'ライターが登録されていません'
                }
              </h3>
              <p className="text-gray-600 mb-8">
                {searchParams.search || (searchParams.university && searchParams.university !== 'all') || searchParams.verified === 'true'
                  ? '検索条件を変更してお試しください。'
                  : '現在、ライターの登録準備中です。しばらくお待ちください。'
                }
              </p>
              <div className="space-x-4">
                {(searchParams.search || (searchParams.university && searchParams.university !== 'all') || searchParams.verified === 'true') && (
                  <Button asChild variant="outline">
                    <a href="/writers">すべてのライターを見る</a>
                  </Button>
                )}
                <Button asChild>
                  <a href="/register">ライターとして参加</a>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTAセクション */}
      {writers.length > 0 && (
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">
                あなたもライターとして参加しませんか？
              </h2>
              <p className="text-lg mb-8 opacity-90">
                実体験を記事にして、同世代の学生や親御さんの役に立ちませんか？
                あなたの経験が誰かの羅針盤になります。
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  <a href="/register">
                    <Star className="mr-2 h-4 w-4" />
                    ライター登録
                  </a>
                </Button>
                <Button asChild size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  <a href="/articles">記事を読む</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}