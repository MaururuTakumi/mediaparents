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
import { ArrowLeft, Sparkles, Eye, Save, FileText, Wand2 } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingExcerpt, setIsGeneratingExcerpt] = useState(false)
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
  }, [title, content, excerpt, tags])

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
          is_premium: false,
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

  // AI要約生成関数
  const generateExcerpt = async () => {
    if (!title || !content) {
      alert('記事のタイトルと本文を入力してください')
      return
    }

    setIsGeneratingExcerpt(true)

    try {
      const response = await fetch('/api/generate-excerpt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content
        }),
      })

      if (!response.ok) {
        throw new Error('要約の生成に失敗しました')
      }

      const data = await response.json()
      if (data.excerpt) {
        setExcerpt(data.excerpt)
        setHasUnsavedChanges(true)
      }
    } catch (error) {
      console.error('要約生成エラー:', error)
      alert('要約の生成に失敗しました。もう一度お試しください。')
    } finally {
      setIsGeneratingExcerpt(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー（note風シンプルデザイン） */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/dashboard/articles">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              
              {/* エディット/プレビュー切り替え（note風） */}
              <div className="flex items-center bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'edit' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  エディター
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeTab === 'preview' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  プレビュー
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* 保存状態の表示 */}
              <div className="text-sm text-gray-500">
                {lastSaved && !hasUnsavedChanges && (
                  <span>保存済み</span>
                )}
                {hasUnsavedChanges && (
                  <span className="text-orange-600">未保存</span>
                )}
              </div>
              
              <Button
                onClick={() => handleSubmit('draft')}
                variant="ghost"
                size="sm"
                disabled={isLoading || !title.trim() || !content.trim()}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                下書き保存
              </Button>
              
              <Button
                onClick={() => handleSubmit('published')}
                size="sm"
                disabled={isLoading || !title.trim() || !content.trim()}
                className="bg-green-600 hover:bg-green-700 text-white px-6"
              >
                投稿する
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="min-h-screen bg-white">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="edit" className="mt-0">
            {/* タイトルと記事本文（note風レイアウト） */}
            <div className="bg-white">
              <div className="max-w-3xl mx-auto px-8 pt-8 pb-24">
                {/* タイトル入力 */}
                <input
                  placeholder="タイトル"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={200}
                  className="w-full text-3xl font-bold border-none outline-none placeholder:text-gray-300 mb-6"
                  style={{ fontSize: '28px', lineHeight: '1.4', color: '#222' }}
                />
                
                {/* エディタ */}
                <NoteEditor
                  content={content}
                  onUpdate={setContent}
                  placeholder="本文を書く"
                  characterLimit={10000}
                />
                
                {/* 記事設定（下部に配置） */}
                <div className="mt-16 space-y-8">
                  {/* 要約入力 */}
                  <div className="pb-8 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="excerpt" className="text-sm font-medium text-gray-700">
                        記事の説明
                      </Label>
                      <Button
                        type="button"
                        onClick={generateExcerpt}
                        disabled={isGeneratingExcerpt || !title || !content}
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1"
                      >
                        {isGeneratingExcerpt ? (
                          <>
                            <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                            生成中...
                          </>
                        ) : (
                          <>
                            <Wand2 className="h-3 w-3" />
                            説明を生成
                          </>
                        )}
                      </Button>
                    </div>
                    <textarea
                      id="excerpt"
                      placeholder="この記事の概要を入力（検索結果に表示されます）"
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      maxLength={300}
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none outline-none focus:border-gray-400 text-sm"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">{excerpt.length}/300</p>
                  </div>
                  
                  {/* タグ設定 */}
                  <div className="pb-8 border-b border-gray-200">
                    <Label htmlFor="tags" className="text-sm font-medium text-gray-700 mb-2 block">
                      タグ
                    </Label>
                    <Input
                      id="tags"
                      placeholder="タグをカンマ区切りで入力"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="border-gray-200 focus:border-gray-400 text-sm"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tags.split(',').map(tag => tag.trim()).filter(Boolean).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            {/* プレビュー表示（note風） */}
            <div className="bg-white min-h-screen">
              <div className="max-w-3xl mx-auto px-8 pt-8 pb-24">
                <h1 className="text-3xl font-bold mb-6" style={{ fontSize: '28px', lineHeight: '1.4', color: '#222' }}>
                  {title || 'タイトル'}
                </h1>
                <div 
                  className="note-preview-content"
                  dangerouslySetInnerHTML={{ 
                    __html: content || '<p style="color: #999;">本文を書く</p>' 
                  }} 
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {/* プレビュー用CSS */}
      <style dangerouslySetInnerHTML={{ __html: `
        .note-preview-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
          color: #333;
          font-size: 16px;
          line-height: 1.8;
        }
        
        .note-preview-content h1 {
          font-size: 30px;
          font-weight: 700;
          margin: 40px 0 20px 0;
          line-height: 1.4;
          color: #222;
        }
        
        .note-preview-content h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 36px 0 16px 0;
          line-height: 1.4;
          color: #222;
        }
        
        .note-preview-content h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 32px 0 12px 0;
          line-height: 1.5;
          color: #222;
        }
        
        .note-preview-content p {
          margin: 20px 0;
          line-height: 1.8;
          font-size: 16px;
          color: #333;
        }
        
        .note-preview-content ul,
        .note-preview-content ol {
          padding-left: 30px;
          margin: 20px 0;
        }
        
        .note-preview-content li {
          margin: 8px 0;
          line-height: 1.8;
        }
        
        .note-preview-content strong {
          font-weight: 700;
          color: #222;
        }
        
        .note-preview-content a {
          color: #03a9f4;
          text-decoration: none;
          border-bottom: 1px solid #03a9f4;
        }
        
        .note-preview-content a:hover {
          color: #0288d1;
          border-bottom-color: #0288d1;
        }
        
        .note-preview-content blockquote {
          border-left: 3px solid #333;
          padding-left: 20px;
          margin: 20px 0;
          font-style: normal;
          color: #666;
        }
        
        .note-preview-content img {
          max-width: 100%;
          height: auto;
          margin: 30px auto;
          display: block;
        }
        
        .note-preview-content hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 40px 0;
        }
      ` }} />
    </div>
  )
}