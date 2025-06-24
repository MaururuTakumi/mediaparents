import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { Calendar, Clock, Users, MapPin, Video, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

async function getSeminars() {
  const supabase = await createClient()
  
  try {
    // 今後の座談会を取得
    const { data: upcomingSeminars, error: upcomingError } = await supabase
      .from('seminars')
      .select(`
        id,
        title,
        description,
        scheduled_at,
        duration_minutes,
        max_participants,
        price,
        meeting_url,
        writers!seminars_host_writer_id_fkey (
          id,
          name,
          avatar_url,
          university,
          faculty,
          is_verified
        ),
        seminar_participants (
          id
        )
      `)
      .eq('is_active', true)
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })

    // 過去の座談会を取得（アーカイブ）
    const { data: pastSeminars, error: pastError } = await supabase
      .from('seminars')
      .select(`
        id,
        title,
        description,
        scheduled_at,
        duration_minutes,
        price,
        writers!seminars_host_writer_id_fkey (
          id,
          name,
          avatar_url,
          university,
          faculty,
          is_verified
        ),
        seminar_participants (
          id
        )
      `)
      .eq('is_active', true)
      .lt('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: false })
      .limit(6)

    if (upcomingError) {
      console.error('Error fetching upcoming seminars:', upcomingError)
    }
    if (pastError) {
      console.error('Error fetching past seminars:', pastError)
    }

    return {
      upcomingSeminars: upcomingSeminars || [],
      pastSeminars: pastSeminars || []
    }
  } catch (error) {
    console.error('Error fetching seminars:', error)
    return {
      upcomingSeminars: [],
      pastSeminars: []
    }
  }
}

export default async function SeminarsPage() {
  const { upcomingSeminars, pastSeminars } = await getSeminars()

  return (
    <div className="flex flex-col min-h-screen">
      {/* ヘッダーセクション */}
      <section className="bg-gradient-to-r from-purple-50 to-pink-50 py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              座談会
            </h1>
            <p className="text-xl text-gray-600">
              現役大学生と直接話せる、オンライン座談会
            </p>
          </div>
        </div>
      </section>

      {/* 今後の座談会 */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              今後の座談会
            </h2>

            {upcomingSeminars.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingSeminars.map((seminar) => {
                  const participantCount = seminar.seminar_participants?.length || 0
                  const remainingSeats = seminar.max_participants - participantCount
                  const isFull = remainingSeats <= 0

                  return (
                    <Card key={seminar.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(seminar.scheduled_at), 'M月d日', { locale: ja })}
                          </Badge>
                          {isFull && (
                            <Badge variant="destructive" className="text-xs">
                              満席
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg line-clamp-2">
                          {seminar.title}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {seminar.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* ホスト情報 */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={(Array.isArray(seminar.writers) ? seminar.writers[0]?.avatar_url : (seminar.writers as any)?.avatar_url) || ''} />
                            <AvatarFallback>
                              {(Array.isArray(seminar.writers) ? seminar.writers[0]?.name?.[0] : (seminar.writers as any)?.name?.[0]) || 'H'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {Array.isArray(seminar.writers) ? seminar.writers[0]?.name : (seminar.writers as any)?.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {Array.isArray(seminar.writers) ? seminar.writers[0]?.university : (seminar.writers as any)?.university} {Array.isArray(seminar.writers) ? seminar.writers[0]?.faculty : (seminar.writers as any)?.faculty}
                            </p>
                          </div>
                        </div>

                        {/* 座談会詳細 */}
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {format(new Date(seminar.scheduled_at), 'yyyy年M月d日 (E)', { locale: ja })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(new Date(seminar.scheduled_at), 'HH:mm', { locale: ja })}〜
                              （{seminar.duration_minutes}分）
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>
                              {isFull ? '満席' : `残り${remainingSeats}席`} / 定員{seminar.max_participants}名
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            <span>オンライン開催</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold">
                              ¥{seminar.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* アクションボタン */}
                        <Button 
                          asChild 
                          className="w-full" 
                          variant={isFull ? "secondary" : "default"}
                          disabled={isFull}
                        >
                          <Link href={`/seminars/${seminar.id}`}>
                            {isFull ? '詳細を見る' : '参加申込'}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  現在開催予定の座談会はありません
                </h3>
                <p className="text-gray-600 mb-8">
                  新しい座談会が開催される際にお知らせします。
                </p>
                <Button asChild variant="outline">
                  <Link href="/articles">記事を読む</Link>
                </Button>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* 過去の座談会（アーカイブ） */}
      {pastSeminars.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                過去の座談会
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastSeminars.map((seminar) => (
                  <Card key={seminar.id} className="overflow-hidden opacity-75">
                    <CardHeader>
                      <Badge variant="secondary" className="mb-2 w-fit">
                        {format(new Date(seminar.scheduled_at), 'yyyy年M月d日', { locale: ja })}
                      </Badge>
                      <CardTitle className="text-lg line-clamp-2">
                        {seminar.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={(Array.isArray(seminar.writers) ? seminar.writers[0]?.avatar_url : (seminar.writers as any)?.avatar_url) || ''} />
                          <AvatarFallback>
                            {(Array.isArray(seminar.writers) ? seminar.writers[0]?.name?.[0] : (seminar.writers as any)?.name?.[0]) || 'H'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {Array.isArray(seminar.writers) ? seminar.writers[0]?.name : (seminar.writers as any)?.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Array.isArray(seminar.writers) ? seminar.writers[0]?.university : (seminar.writers as any)?.university}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        参加者: {seminar.seminar_participants?.length || 0}名
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTAセクション */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">
              座談会を開催しませんか？
            </h2>
            <p className="text-lg mb-8 opacity-90">
              あなたの経験や知識を共有して、悩める学生や親御さんの力になりましょう。
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-white text-purple-600 hover:bg-gray-100">
              <Link href="/dashboard/seminars/new">
                座談会を企画する
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata() {
  return {
    title: '座談会一覧 | ありがとうお父さんお母さん',
    description: '現役大学生と直接話せるオンライン座談会。受験相談、学生生活、キャリア相談など、様々なテーマで開催中。',
  }
}