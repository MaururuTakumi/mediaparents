'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Sparkles, Eye, Save, FileText } from 'lucide-react'
import Link from 'next/link'
import NoteEditor from '@/components/note-editor'

export default function NewArticlePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [tags, setTags] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const hasLoadedFromSession = useRef(false)

  // 統合されたsessionStorage読み込み機能
  useEffect(() => {
    const generated = searchParams.get('generated')
    console.log('=== 記事作成ページ読み込み ===')
    console.log('Current URL:', window.location.href)
    console.log('Search params:', searchParams.toString())
    console.log('Generated parameter:', generated)

    // 1回だけ実行するためのチェック
    if (hasLoadedFromSession.current) {
      console.log('⏭️ Already loaded from session, skipping...')
      console.log('=========================')
      return
    }

    // sessionStorageをチェック（URLパラメータに関係なく）
    try {
      const generatedArticleData = sessionStorage.getItem('generatedArticle')
      console.log('Raw sessionStorage data:', generatedArticleData)
      
      if (generatedArticleData && !title && !content) {
        const articleData = JSON.parse(generatedArticleData)
        
        console.log('✅ Found generated article data!')
        console.log('Parsed article data:', articleData)
        console.log('Data keys:', Object.keys(articleData))
        console.log('Title:', articleData.title)
        console.log('Content length:', articleData.content?.length)
        console.log('Content preview:', articleData.content?.substring(0, 200))
        console.log('Excerpt:', articleData.excerpt)

        // データをセット
        if (articleData.title) {
          console.log('🔄 Setting title...')
          setTitle(articleData.title)
        }
        
        if (articleData.content) {
          console.log('🔄 Setting content...')
          setContent(articleData.content)
        }
        
        if (articleData.excerpt) {
          console.log('🔄 Setting excerpt...')
          setExcerpt(articleData.excerpt)
        }

        // フラグを設定して重複実行を防ぐ
        hasLoadedFromSession.current = true
        
        // データを使用した後、sessionStorageをクリア
        sessionStorage.removeItem('generatedArticle')
        console.log('✅ Article data loaded and sessionStorage cleared')

        // 設定完了後の確認（useEffectを使用してstateの変更を確実に追跡）
        const checkState = () => {
          console.log('⏰ Final state check:')
          console.log('Title state length:', title.length)
          console.log('Content state length:', content.length)
          console.log('Excerpt state length:', excerpt.length)
        }
        setTimeout(checkState, 1000)
      } else if (!generatedArticleData) {
        console.log('❌ No generated article data found in sessionStorage')
        console.log('All sessionStorage keys:', Object.keys(sessionStorage))
      } else {
        console.log('ℹ️ Generated article data exists but title/content already set')
      }
    } catch (error) {
      console.error('❌ Error loading generated article data:', error)
    }
    console.log('=========================')
  }, [searchParams])

  // state変更を監視（デバッグ用）
  useEffect(() => {
    if (title || content || excerpt) {
      console.log('📊 State updated:')
      console.log('- Title:', title)
      console.log('- Content length:', content.length)
      console.log('- Excerpt:', excerpt)
    }
  }, [title, content, excerpt])

  // 自動保存機能
  useEffect(() => {
    if (!title && !content) return
    
    const autoSaveInterval = setInterval(() => {
      if (hasUnsavedChanges) {
        handleAutoSave()
      }
    }, 30000) // 30秒ごとに自動保存

    return () => clearInterval(autoSaveInterval)
  }, [title, content, hasUnsavedChanges])

  // 変更の検知
  useEffect(() => {
    setHasUnsavedChanges(true)
  }, [title, content, excerpt, tags, isPremium])

  const handleAutoSave = async () => {
    if (!title.trim() || !content.trim()) return
    
    try {
      // 下書きとして自動保存
      await handleSubmit('draft', true)
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.error('自動保存に失敗しました:', error)
    }
  }

  const handleSubmit = async (status: 'draft' | 'published', isAutoSave = false) => {
    if (!title.trim() || !content.trim()) {
      if (!isAutoSave) {
        alert('タイトルと本文は必須です')
      }
      return
    }

    if (!isAutoSave) {
      setIsLoading(true)
    }

    try {
      // 現在のユーザー情報を取得
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      // ライター情報を取得
      const { data: writer } = await supabase
        .from('writers')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!writer) throw new Error('ライター情報が見つかりません')

      // 記事を作成
      const { data, error } = await supabase
        .from('articles')
        .insert({
          title: title.trim(),
          content: content.trim(),
          excerpt: excerpt.trim() || null,
          writer_id: writer.id,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
          is_premium: isPremium,
          status,
          published_at: status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single()

      if (error) throw error

      // 自動保存でない場合のみリダイレクト
      if (!isAutoSave) {
        if (status === 'published') {
          router.push(`/dashboard/articles?success=published`)
        } else {
          router.push(`/dashboard/articles?success=draft`)
        }
      }
    } catch (error) {
      console.error('記事の保存に失敗しました:', error)
      if (!isAutoSave) {
        alert('記事の保存に失敗しました。もう一度お試しください。')
      }
    } finally {
      if (!isAutoSave) {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/articles">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  戻る
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                {lastSaved && (
                  <span className="text-sm text-gray-500">
                    {lastSaved.toLocaleTimeString()}に保存済み
                  </span>
                )}
                {hasUnsavedChanges && (
                  <span className="text-sm text-orange-600">
                    未保存の変更があります
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>編集</span>
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>プレビュー</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button
                onClick={() => handleSubmit('draft')}
                variant="outline"
                size="sm"
                disabled={isLoading || !title.trim() || !content.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                下書き保存
              </Button>
              
              <Button
                onClick={() => handleSubmit('published')}
                size="sm"
                disabled={isLoading || !title.trim() || !content.trim()}
                className="bg-green-600 hover:bg-green-700"
              >
                公開する
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="edit" className="space-y-6">
            {/* タイトル入力 */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <Input
                placeholder="記事のタイトルを入力してください"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="text-4xl font-bold border-none px-0 placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0 mb-2"
              />
              <p className="text-sm text-gray-500 mb-6">{title.length}/200文字</p>
              
              {/* 要約入力 */}
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-sm font-medium text-gray-700">
                  記事の要約（検索結果などで表示されます）
                </Label>
                <Input
                  id="excerpt"
                  placeholder="記事の内容を簡潔に要約してください（150文字程度）"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  maxLength={300}
                  className="border-gray-300"
                />
                <p className="text-sm text-gray-500">{excerpt.length}/300文字</p>
              </div>
            </div>

            {/* エディタ */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <NoteEditor
                content={content}
                onUpdate={setContent}
                placeholder="記事の内容を書いてみましょう..."
                characterLimit={10000}
              />
            </div>

            {/* 記事設定 */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">記事設定</h3>
              
              {/* タグ設定 */}
              <div className="space-y-3">
                <Label htmlFor="tags" className="text-sm font-medium text-gray-700">
                  タグ（記事の分類に使用されます）
                </Label>
                <Input
                  id="tags"
                  placeholder="タグをカンマ区切りで入力（例: 進路相談, 親子関係, 大学生活）"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="border-gray-300"
                />
                <div className="flex flex-wrap gap-2">
                  {tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="px-3 py-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* プレミアム設定 */}
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="premium"
                  checked={isPremium}
                  onChange={(e) => setIsPremium(e.target.checked)}
                  className="mt-1 rounded border-gray-300"
                />
                <div className="flex-1">
                  <Label htmlFor="premium" className="flex items-center space-x-2 cursor-pointer">
                    <span className="font-medium text-gray-900">プレミアム記事として設定</span>
                    <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                      有料会員限定
                    </Badge>
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    プレミアム記事は有料会員のみが閲覧できます。より詳細で価値の高い内容に適用してください。
                  </p>
                </div>
              </div>
            </div>

            {/* AIアシスタント */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Sparkles className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    AIアシスタントで記事作成
                  </h3>
                  <p className="text-gray-600 mb-4">
                    AIとの対話を通じて体験を整理し、読者に響く記事を自動生成できます。
                  </p>
                  <Link href="/dashboard/interview">
                    <Button variant="outline" className="bg-white hover:bg-gray-50">
                      <Sparkles className="h-4 w-4 mr-2" />
                      AIインタビューを開始
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {/* プレビュー表示 */}
            <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
              <div className="max-w-none prose prose-lg">
                <h1 className="text-4xl font-bold mb-4">{title || 'タイトルを入力してください'}</h1>
                {excerpt && (
                  <p className="text-xl text-gray-600 mb-8 font-medium">{excerpt}</p>
                )}
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: content || '<p class="text-gray-400">記事の内容がここに表示されます...</p>' 
                  }} 
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}