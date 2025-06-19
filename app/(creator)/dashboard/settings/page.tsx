'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Save, 
  Camera, 
  AlertCircle, 
  CheckCircle,
  User,
  Mail,
  GraduationCap,
  Shield
} from 'lucide-react'
import Link from 'next/link'

interface Writer {
  id: string
  auth_id: string
  name: string
  university: string
  faculty?: string
  grade: number
  bio?: string
  avatar_url?: string
  verification_status: 'pending' | 'approved' | 'rejected'
  verification_document_url?: string
  is_verified: boolean
  total_earnings: number
  created_at: string
  updated_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [writer, setWriter] = useState<Writer | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    faculty: '',
    grade: '',
    bio: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    const fetchWriterData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data, error } = await supabase
          .from('writers')
          .select('*')
          .eq('auth_id', user.id)
          .single()

        if (error) {
          console.error('Error fetching writer:', error)
          setMessage({ type: 'error', text: 'プロフィール情報の取得に失敗しました' })
          return
        }

        setWriter(data)
        setFormData({
          name: data.name,
          university: data.university,
          faculty: data.faculty || '',
          grade: data.grade.toString(),
          bio: data.bio || ''
        })
      } catch (error) {
        console.error('Error:', error)
        setMessage({ type: 'error', text: 'エラーが発生しました' })
      } finally {
        setIsLoading(false)
      }
    }

    fetchWriterData()
  }, [supabase, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (message) setMessage(null)
  }

  const handleSave = async () => {
    if (!writer) return

    // バリデーション
    if (!formData.name || !formData.university || !formData.grade) {
      setMessage({ type: 'error', text: '必須項目を入力してください' })
      return
    }

    const grade = parseInt(formData.grade)
    if (isNaN(grade) || grade < 1 || grade > 6) {
      setMessage({ type: 'error', text: '学年は1〜6の数字で入力してください' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const { error } = await supabase
        .from('writers')
        .update({
          name: formData.name,
          university: formData.university,
          faculty: formData.faculty || null,
          grade: grade,
          bio: formData.bio || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', writer.id)

      if (error) throw error

      // ローカル状態を更新
      setWriter({
        ...writer,
        name: formData.name,
        university: formData.university,
        faculty: formData.faculty || undefined,
        grade: grade,
        bio: formData.bio || undefined,
        updated_at: new Date().toISOString()
      })

      setMessage({ type: 'success', text: 'プロフィールが更新されました' })
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' })
    } finally {
      setIsSaving(false)
    }
  }

  const getVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />認証済み</Badge>
      case 'pending':
        return <Badge variant="secondary">審査中</Badge>
      case 'rejected':
        return <Badge variant="destructive">認証却下</Badge>
      default:
        return <Badge variant="outline">未申請</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>設定を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!writer) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>プロフィール情報が見つかりません</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">プロフィール設定</h1>
            <p className="text-gray-600">あなたの基本情報を管理</p>
          </div>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'error' ? (
            <AlertCircle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* プロフィール画像 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Camera className="h-5 w-5" />
                <span>プロフィール画像</span>
              </CardTitle>
              <CardDescription>
                あなたのプロフィール画像を設定してください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={writer.avatar_url} />
                  <AvatarFallback className="text-lg">
                    {writer.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" className="mb-2">
                    <Camera className="h-4 w-4 mr-2" />
                    画像を変更
                  </Button>
                  <p className="text-sm text-gray-600">
                    JPG、PNG形式の画像をアップロードできます（最大5MB）
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 基本情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>基本情報</span>
              </CardTitle>
              <CardDescription>
                あなたの基本的な情報を設定してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">お名前 *</Label>
                <Input
                  id="name"
                  placeholder="例: 山田太郎"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="university">大学名 *</Label>
                <Input
                  id="university"
                  placeholder="例: 東京大学"
                  value={formData.university}
                  onChange={(e) => handleInputChange('university', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="faculty">学部・学科</Label>
                  <Input
                    id="faculty"
                    placeholder="例: 工学部情報工学科"
                    value={formData.faculty}
                    onChange={(e) => handleInputChange('faculty', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">学年 *</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="1"
                    max="6"
                    placeholder="例: 3"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介</Label>
                <Textarea
                  id="bio"
                  placeholder="あなたの経験や関心のあることについて簡単に教えてください"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-gray-500">{formData.bio.length}/500文字</p>
              </div>

              <Button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full md:w-auto"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? '保存中...' : '変更を保存'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* アカウント情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="h-5 w-5" />
                <span>アカウント情報</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium">メールアドレス</Label>
                <p className="text-sm text-gray-600">変更にはサポートへの連絡が必要です</p>
              </div>
              <div>
                <Label className="text-sm font-medium">登録日</Label>
                <p className="text-sm text-gray-600">
                  {new Date(writer.created_at).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 認証ステータス */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>認証ステータス</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">学生認証</span>
                {getVerificationBadge(writer.verification_status)}
              </div>
              
              {writer.verification_status !== 'approved' && (
                <div>
                  <Link href="/dashboard/settings/verification">
                    <Button variant="outline" size="sm" className="w-full">
                      認証を申請する
                    </Button>
                  </Link>
                  <p className="text-xs text-gray-600 mt-2">
                    学生証をアップロードして認証を受けてください
                  </p>
                </div>
              )}

              {writer.verification_status === 'approved' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    認証が完了しています。信頼性の高いライターとして活動できます。
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 統計情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="h-5 w-5" />
                <span>統計情報</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">累計収益</span>
                <span className="font-medium">¥{writer.total_earnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ライター歴</span>
                <span className="font-medium">
                  {Math.floor((Date.now() - new Date(writer.created_at).getTime()) / (1000 * 60 * 60 * 24))}日
                </span>
              </div>
            </CardContent>
          </Card>

          {/* クイックアクション */}
          <Card>
            <CardHeader>
              <CardTitle>クイックアクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/settings/verification">
                <Button variant="outline" size="sm" className="w-full">
                  本人認証設定
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="w-full">
                パスワード変更
              </Button>
              <Button variant="outline" size="sm" className="w-full">
                通知設定
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}