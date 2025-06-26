'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { MessageSquare, Reply, Edit, Trash2, User, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Comment {
  id: string
  article_id: string
  user_id: string
  parent_id: string | null
  content: string
  is_edited: boolean
  created_at: string
  updated_at: string
  user?: {
    id: string
    display_name: string
    avatar_url: string | null
    is_verified: boolean
    user_type: 'writer' | 'reader'
  }
  replies?: Comment[]
}

interface ArticleCommentsProps {
  articleId: string
  isPremium: boolean
}

export default function ArticleComments({ articleId, isPremium }: ArticleCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  
  const supabase = createClient()

  useEffect(() => {
    // ユーザー情報の取得
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    // コメントの取得
    fetchComments()

    // リアルタイム更新の設定
    const channel = supabase
      .channel(`comments:${articleId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'article_comments',
          filter: `article_id=eq.${articleId}`
        },
        () => {
          fetchComments()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [articleId])

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('article_comments')
        .select(`
          *,
          user:comment_users!article_comments_user_id_fkey (
            id,
            display_name,
            avatar_url,
            is_verified,
            user_type
          )
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: false })

      if (error) throw error

      // コメントを階層構造に変換
      const commentMap = new Map()
      const rootComments: Comment[] = []

      data?.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] })
      })

      data?.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id)
          if (parent) {
            parent.replies.push(commentMap.get(comment.id))
          }
        } else {
          rootComments.push(commentMap.get(comment.id))
        }
      })

      setComments(rootComments)
    } catch (error) {
      console.error('Error fetching comments:', error)
      setError('コメントの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (content: string, parentId: string | null = null) => {
    if (!user) {
      setError('コメントを投稿するにはログインが必要です')
      return
    }

    if (!content.trim()) {
      setError('コメントを入力してください')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('article_comments')
        .insert({
          article_id: articleId,
          user_id: user.id,
          parent_id: parentId,
          content: content.trim()
        })

      if (error) throw error

      // フォームをリセット
      if (parentId) {
        setReplyTo(null)
      } else {
        setNewComment('')
      }
    } catch (error) {
      console.error('Error posting comment:', error)
      setError('コメントの投稿に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateComment = async (commentId: string, newContent: string) => {
    if (!newContent.trim()) {
      setError('コメントを入力してください')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('article_comments')
        .update({ content: newContent.trim() })
        .eq('id', commentId)
        .eq('user_id', user.id)

      if (error) throw error

      setEditingComment(null)
      setEditContent('')
    } catch (error) {
      console.error('Error updating comment:', error)
      setError('コメントの更新に失敗しました')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('このコメントを削除しますか？')) return

    try {
      const { error } = await supabase
        .from('article_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting comment:', error)
      setError('コメントの削除に失敗しました')
    }
  }

  const CommentItem = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const isAuthor = user && user.id === comment.user_id
    const [replyContent, setReplyContent] = useState('')
    const isReplying = replyTo === comment.id
    const isEditing = editingComment === comment.id

    return (
      <div className={`${depth > 0 ? 'ml-8 mt-4' : 'mb-6'}`}>
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={comment.user?.avatar_url || ''} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {comment.user?.display_name || 'ユーザー'}
              </span>
              {comment.user?.is_verified && (
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  認証済み
                </Badge>
              )}
              {comment.user?.user_type === 'writer' && (
                <Badge variant="secondary" className="text-xs">
                  ライター
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { 
                  addSuffix: true,
                  locale: ja 
                })}
              </span>
              {comment.is_edited && (
                <span className="text-xs text-gray-500">(編集済み)</span>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[80px]"
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateComment(comment.id, editContent)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '更新中...' : '更新'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingComment(null)
                      setEditContent('')
                    }}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {comment.content}
                </p>
                
                <div className="flex items-center gap-4 mt-2">
                  {user && depth < 2 && (
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                    >
                      <Reply className="h-3 w-3" />
                      返信
                    </button>
                  )}
                  
                  {isAuthor && (
                    <>
                      <button
                        onClick={() => {
                          setEditingComment(comment.id)
                          setEditContent(comment.content)
                        }}
                        className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        削除
                      </button>
                    </>
                  )}
                </div>
              </>
            )}

            {isReplying && (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="返信を入力..."
                  className="min-h-[80px]"
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      handleSubmitComment(replyContent, comment.id)
                      setReplyContent('')
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? '投稿中...' : '返信を投稿'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setReplyTo(null)
                      setReplyContent('')
                    }}
                    disabled={isSubmitting}
                  >
                    キャンセル
                  </Button>
                </div>
              </div>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4">
                {comment.replies.map((reply) => (
                  <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-xl font-semibold">
          コメント ({comments.length})
        </h3>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* コメント投稿フォーム */}
      {user ? (
        <div className="mb-8">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="コメントを書く..."
            className="min-h-[100px] mb-3"
            disabled={isSubmitting}
          />
          <Button
            onClick={() => handleSubmitComment(newComment)}
            disabled={isSubmitting || !newComment.trim()}
          >
            {isSubmitting ? '投稿中...' : 'コメントを投稿'}
          </Button>
        </div>
      ) : (
        <Alert className="mb-8">
          <AlertDescription>
            コメントを投稿するには
            <Link href="/viewer/login" className="text-blue-600 hover:underline mx-1">
              ログイン
            </Link>
            してください。
          </AlertDescription>
        </Alert>
      )}

      {/* コメント一覧 */}
      {comments.length > 0 ? (
        <div>
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          まだコメントはありません。最初のコメントを投稿しましょう！
        </div>
      )}
    </div>
  )
}