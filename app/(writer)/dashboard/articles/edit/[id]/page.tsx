'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Eye, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  content: string
  excerpt?: string | null
  format: 'text' | 'video' | 'audio'
  status: 'draft' | 'published' | 'archived'
  is_premium: boolean
  tags: string[]
  writer_id: string
  view_count: number
  like_count: number
  published_at?: string
  created_at: string
  updated_at: string
}

export default function EditArticlePage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  
  const [article, setArticle] = useState<Article | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // ライター情報取得
        const { data: writer } = await supabase
          .from('writers')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!writer) {
          router.push('/register')
          return
        }

        // 記事取得
        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', params.id)
          .eq('writer_id', writer.id)
          .single()

        if (error) {
          console.error('Error fetching article:', error)
          setError('記事が見つかりません')
          return
        }

        setArticle(data)
        setTitle(data.title)
        setContent(data.content)
        setExcerpt(data.excerpt || '')
        setTags(data.tags.join(', '))
        setIsPremium(data.is_premium)
      } catch (error) {
        console.error('Error:', error)
        setError('記事の読み込みに失敗しました')
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchArticle()
    }
  }, [params.id, supabase, router])

  const handleSave = async (newStatus?: 'draft' | 'published') => {
    if (!article || !title.trim() || !content.trim()) {
      setError('タイトルと本文は必須です')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const status = newStatus || article.status
      const updateData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        is_premium: isPremium,
        status,
        updated_at: new Date().toISOString(),
        ...(status === 'published' && !article.published_at && {
          published_at: new Date().toISOString()
        })
      }

      const { error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', article.id)

      if (error) throw error

      // 記事を更新
      setArticle({ ...article, ...updateData })

      // 成功メッセージとリダイレクト
      if (newStatus === 'published') {
        router.push('/dashboard/articles?success=published')
      } else if (newStatus === 'draft') {
        router.push('/dashboard/articles?success=draft')
      } else {
        // 保存のみの場合はその場にとどまる
        alert('記事が保存されました')
      }
    } catch (error) {
      console.error('Error saving article:', error)
      setError('記事の保存に失敗しました。もう一度お試しください。')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!article) return

    if (!confirm('この記事を削除してもよろしいですか？この操作は取り消せません。')) {
      return
    }

    setIsSaving(true)

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', article.id)

      if (error) throw error

      router.push('/dashboard/articles?success=deleted')
    } catch (error) {
      console.error('Error deleting article:', error)
      setError('記事の削除に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>記事を読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error && !article) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Link href="/dashboard/articles">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              記事管理に戻る
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!article) return null

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">公開中</Badge>
      case 'draft':
        return <Badge variant="secondary">下書き</Badge>
      case 'archived':
        return <Badge variant="outline">アーカイブ</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/articles">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              記事管理に戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">記事編集</h1>
            <div className="flex items-center space-x-2 mt-1">
              {getStatusBadge(article.status)}
              <span className="text-sm text-gray-500">
                作成日: {new Date(article.created_at).toLocaleDateString('ja-JP')}
              </span>
              <span className="text-sm text-gray-500">
                閲覧数: {article.view_count.toLocaleString()}回
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>記事内容</CardTitle>
              <CardDescription>
                記事の内容を編集してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル *</Label>
                <Input
                  id="title"
                  placeholder="記事のタイトルを入力してください"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                />
                <p className="text-sm text-gray-500">{title.length}/200文字</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">要約（抜粋）</Label>
                <Textarea
                  id="excerpt"
                  placeholder="記事の要約を150文字程度で入力してください"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={300}
                  rows={3}
                />
                <p className="text-sm text-gray-500">{excerpt.length}/300文字</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">本文 *</Label>
                <Textarea
                  id="content"
                  placeholder="記事の本文を入力してください..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={20}
                  className="min-h-[500px]"
                />
                <p className="text-sm text-gray-500">{content.length}文字</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">タグ</Label>
                <Input
                  id="tags"
                  placeholder="タグをカンマ区切りで入力（例: 進路相談,親子関係,大学生活）"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* 投稿設定 */}
          <Card>
            <CardHeader>
              <CardTitle>投稿設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="premium"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="premium" className="flex items-center space-x-2">
                  <span>プレミアム記事</span>
                  <Badge variant="outline" className="text-xs">有料会員限定</Badge>
                </Label>
              </div>
              <p className="text-sm text-gray-600">
                プレミアム記事は有料会員のみが閲覧可能です
              </p>
            </CardContent>
          </Card>

          {/* アクションボタン */}
          <Card>
            <CardHeader>
              <CardTitle>アクション</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSave()}
                variant="outline"
                className="w-full"
                disabled={isSaving || !title.trim() || !content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? '保存中...' : '保存'}
              </Button>

              {article.status === 'draft' ? (
                <Button
                  onClick={() => handleSave('published')}
                  className="w-full"
                  disabled={isSaving || !title.trim() || !content.trim()}
                >
                  公開する
                </Button>
              ) : (
                <Button
                  onClick={() => handleSave('draft')}
                  variant="outline"
                  className="w-full"
                  disabled={isSaving}
                >
                  下書きに戻す
                </Button>
              )}

              {article.status === 'published' && (
                <Link href={`/articles/${article.id}`} target="_blank">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    記事を表示
                  </Button>
                </Link>
              )}

              <Button
                onClick={handleDelete}
                variant="destructive"
                className="w-full"
                disabled={isSaving}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                記事を削除
              </Button>
            </CardContent>
          </Card>

          {/* 記事統計 */}
          <Card>
            <CardHeader>
              <CardTitle>記事統計</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">閲覧数</span>
                <span className="font-medium">{article.view_count.toLocaleString()}回</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">いいね数</span>
                <span className="font-medium">{article.like_count}</span>
              </div>
              {article.published_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">公開日</span>
                  <span className="font-medium">
                    {new Date(article.published_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">最終更新</span>
                <span className="font-medium">
                  {new Date(article.updated_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}