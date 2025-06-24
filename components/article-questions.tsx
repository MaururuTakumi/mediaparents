'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Lock, MessageCircle, CheckCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import Link from 'next/link'

interface ArticleQuestionsProps {
  articleId: string
  writerId: string
}

export default function ArticleQuestions({ articleId, writerId }: ArticleQuestionsProps) {
  const [questions, setQuestions] = useState<any[]>([])
  const [newQuestion, setNewQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [isWriter, setIsWriter] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadQuestions()
    checkUserStatus()
  }, [articleId])

  const checkUserStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)

    if (user) {
      // サブスクリプション状態を確認
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
      
      setSubscription(sub)

      // ライターかどうか確認
      const { data: writer } = await supabase
        .from('writers')
        .select('id')
        .eq('auth_id', user.id)
        .single()
      
      setIsWriter(writer?.id === writerId)
    }
  }

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('article_questions')
      .select(`
        *,
        profiles!article_questions_user_id_fkey (
          id,
          email
        )
      `)
      .eq('article_id', articleId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setQuestions(data)
    }
  }

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !user) return

    setLoading(true)
    const { error } = await supabase
      .from('article_questions')
      .insert({
        article_id: articleId,
        user_id: user.id,
        question: newQuestion.trim()
      })

    if (!error) {
      setNewQuestion('')
      loadQuestions()
    }
    setLoading(false)
  }

  const handleAnswer = async (questionId: string, answer: string) => {
    if (!answer.trim() || !isWriter) return

    const { error } = await supabase
      .from('article_questions')
      .update({
        answer,
        answered_at: new Date().toISOString(),
        is_public: true
      })
      .eq('id', questionId)

    if (!error) {
      loadQuestions()
    }
  }

  const isSubscribed = subscription?.status === 'active' && 
    subscription?.current_period_end && 
    new Date(subscription.current_period_end) > new Date()

  const canAskQuestion = user && isSubscribed

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          質問コーナー
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 質問投稿フォーム */}
        {user ? (
          canAskQuestion ? (
            <div className="space-y-4 mb-8">
              <Textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="記事について質問がありますか？ライターから直接回答をもらえます。"
                className="min-h-[100px]"
              />
              <Button 
                onClick={handleSubmitQuestion}
                disabled={loading || !newQuestion.trim()}
              >
                {loading ? '送信中...' : '質問を送信'}
              </Button>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">プレミアム会員限定機能</h3>
              <p className="text-gray-600 mb-4">
                記事への質問機能はプレミアム会員限定です。<br />
                プレミアム会員になると、ライターから直接回答をもらえます。
              </p>
              <Button asChild>
                <Link href="/subscription">プレミアム会員になる</Link>
              </Button>
            </div>
          )
        ) : (
          <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
            <p className="text-gray-600 mb-4">
              質問するにはログインが必要です
            </p>
            <Button asChild>
              <Link href="/login">ログインする</Link>
            </Button>
          </div>
        )}

        {/* 質問一覧 */}
        <div className="space-y-4">
          {questions.filter(q => q.is_public || q.user_id === user?.id || isWriter).map((question) => (
            <div key={question.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {question.profiles?.email?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {question.user_id === user?.id ? 'あなた' : 'プレミアム会員'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(question.created_at), { 
                        addSuffix: true, 
                        locale: ja 
                      })}
                    </p>
                  </div>
                </div>
                {!question.is_public && (
                  <Badge variant="secondary">非公開</Badge>
                )}
              </div>

              <p className="text-gray-800">{question.question}</p>

              {question.answer ? (
                <div className="bg-blue-50 rounded-lg p-4 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">ライターの回答</span>
                  </div>
                  <p className="text-gray-800">{question.answer}</p>
                </div>
              ) : isWriter && (
                <div className="mt-3">
                  <Textarea
                    placeholder="回答を入力..."
                    className="min-h-[80px] mb-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleAnswer(question.id, e.currentTarget.value)
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      const textarea = e.currentTarget.previousElementSibling as HTMLTextAreaElement
                      handleAnswer(question.id, textarea.value)
                    }}
                  >
                    回答を送信
                  </Button>
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              まだ質問がありません
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}