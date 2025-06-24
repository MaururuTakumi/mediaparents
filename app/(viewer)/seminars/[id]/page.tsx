import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Calendar, 
  Clock, 
  Users, 
  Video, 
  DollarSign,
  Info,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  User,
  GraduationCap
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface SeminarDetailPageProps {
  params: Promise<{
    id: string
  }>
}

interface SeminarDetail {
  id: string
  title: string
  description: string
  scheduled_at: string
  duration_minutes: number
  max_participants: number
  price: number
  meeting_url?: string
  is_active: boolean
  created_at: string
  writers: {
    id: string
    name: string
    avatar_url?: string
    university: string
    faculty?: string
    grade: number
    bio?: string
    is_verified: boolean
  } | null
  seminar_participants: Array<{
    id: string
    user_id: string
    status: string
  }>
}

async function getSeminarDetail(id: string) {
  const supabase = await createClient()
  
  try {
    // 座談会詳細を取得
    const { data: seminar, error: seminarError } = await supabase
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
        is_active,
        created_at,
        writers!seminars_host_writer_id_fkey (
          id,
          name,
          avatar_url,
          university,
          faculty,
          grade,
          bio,
          is_verified
        ),
        seminar_participants (
          id,
          user_id
        )
      `)
      .eq('id', id)
      .single()

    if (seminarError || !seminar) {
      return null
    }

    // 現在のユーザー情報を取得
    const { data: { user } } = await supabase.auth.getUser()

    // ユーザーが既に参加登録しているかチェック
    const isRegistered = user && seminar.seminar_participants?.some(
      participant => participant.user_id === user.id
    )

    return {
      seminar: seminar as SeminarDetail,
      currentUser: user,
      isRegistered
    }
  } catch (error) {
    console.error('Error fetching seminar detail:', error)
    return null
  }
}

export default async function SeminarDetailPage({ params }: SeminarDetailPageProps) {
  const { id } = await params
  const data = await getSeminarDetail(id)
  
  if (!data) {
    notFound()
  }

  const { seminar, currentUser, isRegistered } = data
  const participantCount = seminar.seminar_participants?.length || 0
  const remainingSeats = seminar.max_participants - participantCount
  const isFull = remainingSeats <= 0
  const isPast = new Date(seminar.scheduled_at) < new Date()

  // 参加申込アクション
  async function registerForSeminar() {
    'use server'
    
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      redirect(`/login?redirect=/seminars/${id}`)
    }

    // 参加登録処理
    const { error } = await supabase
      .from('seminar_participants')
      .insert({
        seminar_id: id,
        user_id: user.id
      })

    if (error) {
      console.error('Error registering for seminar:', error)
      // エラーハンドリング
    }

    // ページをリロード
    redirect(`/seminars/${id}`)
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* 戻るボタン */}
      <div className="container pt-6">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link href="/seminars">
            <ArrowLeft className="h-4 w-4 mr-2" />
            座談会一覧に戻る
          </Link>
        </Button>
      </div>

      {/* 座談会詳細ヘッダー */}
      <section className="py-8">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start gap-2 mb-4">
              {isPast ? (
                <Badge variant="secondary">終了</Badge>
              ) : isFull ? (
                <Badge variant="destructive">満席</Badge>
              ) : (
                <Badge variant="default">受付中</Badge>
              )}
              {seminar.writers?.is_verified && (
                <Badge variant="outline" className="bg-green-50">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  認証済みライター
                </Badge>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {seminar.title}
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              {seminar.description}
            </p>

            {/* ホスト情報 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">ホスト</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={(Array.isArray(seminar.writers) ? seminar.writers[0]?.avatar_url : seminar.writers?.avatar_url) || ''} />
                    <AvatarFallback className="text-xl">
                      {(Array.isArray(seminar.writers) ? seminar.writers[0]?.name?.[0] : seminar.writers?.name?.[0]) || 'H'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {Array.isArray(seminar.writers) ? seminar.writers[0]?.name : seminar.writers?.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {Array.isArray(seminar.writers) ? seminar.writers[0]?.university : seminar.writers?.university}
                      </div>
                      {(Array.isArray(seminar.writers) ? seminar.writers[0]?.faculty : seminar.writers?.faculty) && (
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {Array.isArray(seminar.writers) ? seminar.writers[0]?.faculty : seminar.writers?.faculty} {Array.isArray(seminar.writers) ? seminar.writers[0]?.grade : seminar.writers?.grade}年生
                        </div>
                      )}
                    </div>
                    {(Array.isArray(seminar.writers) ? seminar.writers[0]?.bio : seminar.writers?.bio) && (
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {Array.isArray(seminar.writers) ? seminar.writers[0]?.bio : seminar.writers?.bio}
                      </p>
                    )}
                    <Button asChild variant="link" className="px-0 mt-2">
                      <Link href={`/writers/${Array.isArray(seminar.writers) ? seminar.writers[0]?.id : seminar.writers?.id}`}>
                        プロフィールを見る →
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 開催情報 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">開催情報</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">開催日</p>
                      <p className="text-gray-600">
                        {format(new Date(seminar.scheduled_at), 'yyyy年M月d日 (E)', { locale: ja })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">開催時間</p>
                      <p className="text-gray-600">
                        {format(new Date(seminar.scheduled_at), 'HH:mm', { locale: ja })}〜
                        （{seminar.duration_minutes}分間）
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Video className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">開催形式</p>
                      <p className="text-gray-600">オンライン（Zoom）</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">定員</p>
                      <p className="text-gray-600">
                        {seminar.max_participants}名
                        {!isPast && (
                          <span className={`ml-2 font-semibold ${isFull ? 'text-red-600' : 'text-green-600'}`}>
                            （{isFull ? '満席' : `残り${remainingSeats}席`}）
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 参加費 */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg">参加費</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-2xl font-bold">
                      ¥{seminar.price.toLocaleString()}
                    </span>
                  </div>
                  {seminar.price === 0 && (
                    <Badge variant="secondary">無料</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 注意事項 */}
            <Alert className="mb-8">
              <Info className="h-4 w-4" />
              <AlertTitle>参加にあたっての注意事項</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>• 開始5分前までにZoomリンクからご参加ください</p>
                <p>• カメラ・マイクのオンオフは自由です</p>
                <p>• 録画・録音はご遠慮ください</p>
                <p>• キャンセルは開催24時間前まで可能です</p>
              </AlertDescription>
            </Alert>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4">
              {isPast ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>この座談会は終了しました</AlertTitle>
                  <AlertDescription>
                    今後開催される座談会をチェックしてください。
                  </AlertDescription>
                </Alert>
              ) : isRegistered ? (
                <>
                  <Alert className="flex-1">
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>参加登録済み</AlertTitle>
                    <AlertDescription>
                      開催当日にメールでZoomリンクをお送りします。
                    </AlertDescription>
                  </Alert>
                  <Button variant="outline" asChild>
                    <Link href="/dashboard/seminars">
                      参加予定を確認
                    </Link>
                  </Button>
                </>
              ) : isFull ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>満席</AlertTitle>
                  <AlertDescription>
                    この座談会は定員に達しました。キャンセルが出た場合は再度受付を開始します。
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <form action={registerForSeminar} className="flex-1">
                    <Button type="submit" size="lg" className="w-full sm:w-auto">
                      <Users className="mr-2 h-4 w-4" />
                      参加申込する
                    </Button>
                  </form>
                  {!currentUser && (
                    <p className="text-sm text-gray-600">
                      ※参加にはログインが必要です
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 関連座談会 */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              他の座談会も見る
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              様々なテーマで座談会を開催しています
            </p>
            <Button asChild size="lg">
              <Link href="/seminars">
                座談会一覧を見る
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export async function generateMetadata({ params }: SeminarDetailPageProps) {
  const { id } = await params
  const data = await getSeminarDetail(id)
  
  if (!data) {
    return {
      title: '座談会が見つかりません',
    }
  }

  const { seminar } = data
  
  return {
    title: `${seminar.title} | 座談会 | ありがとうお父さんお母さん`,
    description: `${Array.isArray(seminar.writers) ? seminar.writers[0]?.name : seminar.writers?.name}さんによる座談会「${seminar.title}」。${seminar.description}`,
  }
}