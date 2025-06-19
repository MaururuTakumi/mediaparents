'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Send, Sparkles, BookOpen, Download, Users, Target } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { STUDENT_WRITER_TYPES, PARENT_PERSONAS, getRecommendedMatches, type StudentWriterType, type ParentPersona, type PersonaMatch } from '@/lib/persona-config'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface InterviewSession {
  id: string
  title: string
  conversation_log: Message[]
  ai_summary?: string
  created_at: string
}

export default function InterviewPage() {
  const router = useRouter()
  const supabase = createClient()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionTitle, setSessionTitle] = useState('')
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false)
  const [isComposing, setIsComposing] = useState(false)
  
  // ペルソナ関連の状態
  const [currentStep, setCurrentStep] = useState<'student-type' | 'parent-persona' | 'interview'>('student-type')
  const [selectedStudentType, setSelectedStudentType] = useState<string>('')
  const [selectedParentPersona, setSelectedParentPersona] = useState<string>('')
  const [recommendedMatches, setRecommendedMatches] = useState<PersonaMatch[]>([])
  const [personaBasedQuestions, setPersonaBasedQuestions] = useState<string[]>([])

  // 学生タイプ選択時の処理
  const handleStudentTypeSelection = (studentTypeId: string) => {
    setSelectedStudentType(studentTypeId)
    const matches = getRecommendedMatches(studentTypeId)
    setRecommendedMatches(matches)
    setCurrentStep('parent-persona')
  }

  // 親ペルソナ選択時の処理
  const handleParentPersonaSelection = (parentPersonaId: string) => {
    setSelectedParentPersona(parentPersonaId)
    
    // マッチングに基づく質問を設定
    const match = recommendedMatches.find(m => m.parentPersona === parentPersonaId)
    if (match) {
      setPersonaBasedQuestions(match.keyQuestions)
    }
    
    // インタビュー開始
    setCurrentStep('interview')
    
    // 選択されたペルソナに基づく初期メッセージを生成
    const selectedStudentTypeData = STUDENT_WRITER_TYPES.find(t => t.id === selectedStudentType)
    const selectedParentPersonaData = PARENT_PERSONAS.find(p => p.id === parentPersonaId)
    
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `こんにちは！あなたのタイプ「${selectedStudentTypeData?.name}」と、対象読者「${selectedParentPersonaData?.name}」に基づいて、効果的なインタビューを行います。

${selectedParentPersonaData?.description}の方々は、特に以下のことを知りたがっています：
${selectedParentPersonaData?.wantedInformation.map(info => `• ${info}`).join('\n')}

あなたの実体験を通じて、この親御さんたちに価値ある情報をお届けしましょう。

最初の質問です：
**${match?.keyQuestions[0] || '親子関係で印象に残っているエピソードを教えてください。'}**

具体的な状況や、その時の気持ちも含めて詳しく聞かせてください。`,
      timestamp: new Date()
    }
    setMessages([initialMessage])
  }

  // メッセージが追加されたら最下部にスクロール
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      } else if (scrollAreaRef.current) {
        const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight
        }
      }
    }

    // 少し遅延を入れてDOMの更新を待つ
    const timer = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timer)
  }, [messages])

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // ペルソナ情報を含めてOpenAI APIを呼び出し
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          studentType: selectedStudentType,
          parentPersona: selectedParentPersona,
          personaBasedQuestions: personaBasedQuestions,
        }),
      })

      if (!response.ok) throw new Error('AI応答の生成に失敗しました')

      const data = await response.json()
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const saveSession = async () => {
    if (messages.length < 2) {
      alert('会話を進めてからセッションを保存してください')
      return
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証が必要です')

      const { data: writer } = await supabase
        .from('writers')
        .select('id')
        .eq('auth_id', user.id)
        .single()

      if (!writer) throw new Error('ライター情報が見つかりません')

      const title = sessionTitle || `インタビューセッション - ${new Date().toLocaleDateString()}`

      const { data, error } = await supabase
        .from('interviews')
        .insert({
          writer_id: writer.id,
          title,
          conversation_log: messages,
        })
        .select()
        .single()

      if (error) throw error

      setCurrentSessionId(data.id)
      alert('セッションが保存されました')
    } catch (error) {
      console.error('Error saving session:', error)
      alert('セッションの保存に失敗しました')
    }
  }

  const generateArticle = async () => {
    if (messages.length < 4) {
      alert('記事を生成するには、もう少し会話を進めてください（最低4つのメッセージが必要です）')
      return
    }

    setIsGeneratingArticle(true)

    try {
      console.log('記事生成を開始します...', {
        messageCount: messages.length,
        sessionId: currentSessionId
      })

      const response = await fetch('/api/generate-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversation: messages,
          sessionId: currentSessionId,
          studentType: selectedStudentType,
          parentPersona: selectedParentPersona,
          personaBasedQuestions: personaBasedQuestions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '記事生成に失敗しました')
      }

      const data = await response.json()
      
      console.log('=== 記事生成完了 ===')
      console.log('API Response Data:', data)
      console.log('Title:', data.title)
      console.log('Excerpt:', data.excerpt)  
      console.log('Content Length:', data.content?.length)
      console.log('Content Preview:', data.content?.substring(0, 200))
      console.log('==================')
      
      // エラーチェック
      if (!data.title) {
        throw new Error('タイトルが生成されませんでした')
      }
      if (!data.content) {
        throw new Error('記事本文が生成されませんでした')
      }
      
      // sessionStorageに保存（デバッグ情報付き）
      const articleData = {
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || '',
        generatedAt: new Date().toISOString()
      }
      
      console.log('Saving to sessionStorage:', articleData)
      sessionStorage.setItem('generatedArticle', JSON.stringify(articleData))
      
      // 保存確認
      const saved = sessionStorage.getItem('generatedArticle')
      console.log('Verification - SessionStorage saved:', !!saved)
      
      // 生成された記事を新規記事作成ページに渡してリダイレクト
      const redirectUrl = '/dashboard/articles/new?generated=true'
      console.log('🔄 Redirecting to:', redirectUrl)
      router.push(redirectUrl)
    } catch (error: any) {
      console.error('Error generating article:', error)
      alert(`記事の生成に失敗しました: ${error.message}\n\nもう一度お試しください。`)
    } finally {
      setIsGeneratingArticle(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
  }

  // ステップに応じたコンテンツを描画
  const renderStepContent = () => {
    switch (currentStep) {
      case 'student-type':
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                <Users className="h-6 w-6 text-blue-500" />
                <span>あなたのライタータイプを選択してください</span>
              </CardTitle>
              <CardDescription className="text-lg">
                あなたに最も近いタイプを選ぶことで、読者に最も響く記事を作成できます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup onValueChange={handleStudentTypeSelection} className="space-y-4">
                {STUDENT_WRITER_TYPES.map((type) => (
                  <div key={type.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                      <Label htmlFor={type.id} className="flex-1 cursor-pointer">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{type.name}</h3>
                          <p className="text-gray-600">{type.description}</p>
                          <div className="text-sm text-gray-500">
                            <strong>特徴:</strong> {type.characteristics.join('、')}
                          </div>
                        </div>
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )

      case 'parent-persona':
        return (
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl flex items-center justify-center space-x-2">
                <Target className="h-6 w-6 text-green-500" />
                <span>どの親御さんに向けて記事を書きますか？</span>
              </CardTitle>
              <CardDescription className="text-lg">
                あなたの経験に最も関連する親御さんのタイプを選択してください
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">推奨マッチング</h4>
                <p className="text-blue-700 text-sm">
                  あなたのタイプに基づいて、以下の親御さんに特に響く記事を書けます
                </p>
              </div>
              
              <RadioGroup onValueChange={handleParentPersonaSelection} className="space-y-4">
                {recommendedMatches.map((match) => {
                  const persona = PARENT_PERSONAS.find(p => p.id === match.parentPersona)
                  if (!persona) return null
                  
                  return (
                    <div key={persona.id} className="border rounded-lg p-4 hover:bg-gray-50 border-green-200">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value={persona.id} id={persona.id} className="mt-1" />
                        <Label htmlFor={persona.id} className="flex-1 cursor-pointer">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-lg">{persona.name}</h3>
                              <Badge variant="outline" className="bg-green-50 text-green-700">推奨</Badge>
                            </div>
                            <p className="text-gray-600">{persona.description}</p>
                            <div className="text-sm text-gray-500">
                              <strong>求めている情報:</strong> {persona.wantedInformation.slice(0, 2).join('、')}など
                            </div>
                            <div className="text-sm text-blue-600">
                              <strong>マッチング理由:</strong> {match.matchReason}
                            </div>
                          </div>
                        </Label>
                      </div>
                    </div>
                  )
                })}
                
                {/* その他の選択肢も表示 */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold text-gray-700 mb-3">その他の選択肢</h4>
                  {PARENT_PERSONAS.filter(persona => 
                    !recommendedMatches.some(match => match.parentPersona === persona.id)
                  ).map((persona) => (
                    <div key={persona.id} className="border rounded-lg p-4 hover:bg-gray-50 mb-3">
                      <div className="flex items-start space-x-3">
                        <RadioGroupItem value={persona.id} id={`other-${persona.id}`} className="mt-1" />
                        <Label htmlFor={`other-${persona.id}`} className="flex-1 cursor-pointer">
                          <div className="space-y-2">
                            <h3 className="font-semibold">{persona.name}</h3>
                            <p className="text-gray-600 text-sm">{persona.description}</p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )

      case 'interview':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* メインチャットエリア */}
            <div className="lg:col-span-3">
              <Card className="h-[700px] flex flex-col">
                <CardHeader className="flex-shrink-0 pb-4">
                  <CardTitle>ペルソナベースインタビュー</CardTitle>
                  <CardDescription>
                    {STUDENT_WRITER_TYPES.find(t => t.id === selectedStudentType)?.name} → {PARENT_PERSONAS.find(p => p.id === selectedParentPersona)?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0 p-0">
                  {/* メッセージエリア */}
                  <div className="flex-1 px-6 pb-4 overflow-hidden">
                    <ScrollArea className="h-full" ref={scrollAreaRef}>
                      <div className="space-y-4 py-2 pr-4">
                        {messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-3 break-words overflow-hidden ${
                                message.role === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words message-content">{message.content}</div>
                              <div className={`text-xs mt-2 ${
                                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp.toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                        ))}
                        {isLoading && (
                          <div className="flex w-full justify-start">
                            <div className="bg-gray-100 rounded-lg px-4 py-3 max-w-[80%]">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                        )}
                        {/* スクロール用の目印要素 */}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>
                  </div>

                  {/* 入力エリア */}
                  <div className="flex-shrink-0 border-t bg-gray-50 px-6 py-4">
                    <div className="flex space-x-2 items-end">
                      <Textarea
                        placeholder="あなたの体験について話してください...&#10;（改行可能です）"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onCompositionStart={handleCompositionStart}
                        onCompositionEnd={handleCompositionEnd}
                        disabled={isLoading}
                        className="bg-white resize-none min-h-[40px] max-h-[120px]"
                        rows={2}
                      />
                      <Button onClick={sendMessage} disabled={isLoading || !inputMessage.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* サイドバー */}
            <div className="space-y-4">
              {/* ペルソナ情報 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">選択したペルソナ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <strong>あなた:</strong> {STUDENT_WRITER_TYPES.find(t => t.id === selectedStudentType)?.name}
                  </div>
                  <div>
                    <strong>読者:</strong> {PARENT_PERSONAS.find(p => p.id === selectedParentPersona)?.name}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setCurrentStep('student-type')}
                    className="w-full"
                  >
                    ペルソナを変更
                  </Button>
                </CardContent>
              </Card>

              {/* 推奨質問 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">推奨質問テーマ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {personaBasedQuestions.slice(0, 3).map((question, index) => (
                    <div key={index} className="text-xs bg-blue-50 p-2 rounded">
                      {question}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* セッション管理 */}
              <Card>
                <CardHeader>
                  <CardTitle>セッション管理</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Input
                      placeholder="セッションタイトル"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                    />
                  </div>
                  <Button onClick={saveSession} variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    セッションを保存
                  </Button>
                </CardContent>
              </Card>

              {/* 記事生成 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>記事生成</span>
                  </CardTitle>
                  <CardDescription>
                    会話から記事を自動生成
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={generateArticle} 
                    className="w-full"
                    disabled={isGeneratingArticle || messages.length < 4}
                  >
                    {isGeneratingArticle ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>AI記事生成中...</span>
                      </div>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        記事を生成
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-600 mt-2">
                    {messages.length < 4 
                      ? `記事生成には最低4つのメッセージが必要です（現在: ${messages.length}）`
                      : 'ペルソナ特化型の高品質記事を自動生成します'
                    }
                  </p>
                </CardContent>
              </Card>

              {/* 進行状況 */}
              <Card>
                <CardHeader>
                  <CardTitle>進行状況</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">メッセージ数</span>
                    <Badge variant="secondary">{messages.length}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">記事生成</span>
                    <Badge variant={messages.length >= 4 ? "default" : "secondary"}>
                      {messages.length >= 4 ? "可能" : "要継続"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <style jsx global>{`
        .message-content {
          word-wrap: break-word;
          word-break: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
        }
        
        /* ScrollArea カスタムスタイル */
        [data-radix-scroll-area-viewport] {
          overflow-y: auto !important;
          height: 100% !important;
        }
        
        /* スクロールバーのスタイリング */
        [data-radix-scroll-area-scrollbar] {
          width: 8px !important;
          background: transparent;
        }
        
        [data-radix-scroll-area-thumb] {
          background: #cbd5e1 !important;
          border-radius: 4px !important;
        }
        
        [data-radix-scroll-area-thumb]:hover {
          background: #94a3b8 !important;
        }
      `}</style>
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
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-500" />
              <span>ペルソナベース AIインタビュー</span>
            </h1>
            <p className="text-gray-600">
              {currentStep === 'student-type' && 'あなたのライタータイプを選択してください'}
              {currentStep === 'parent-persona' && '記事のターゲット読者を選択してください'}
              {currentStep === 'interview' && 'ペルソナに特化したインタビューを開始します'}
            </p>
          </div>
        </div>
      </div>

      {/* ステップに応じたコンテンツを表示 */}
      {renderStepContent()}
    </div>
  )
}