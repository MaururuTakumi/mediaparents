'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, CheckCircle, Clock, AlertCircle, Loader2, Mail } from 'lucide-react'

export default function VerificationPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [studentIdStatus, setStudentIdStatus] = useState<string>('unsubmitted')
  const [emailStatus, setEmailStatus] = useState<string>('unverified')
  const [universityEmail, setUniversityEmail] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // 初回ロード時に認証状態を取得
  useEffect(() => {
    loadVerificationStatus()
  }, [])

  const loadVerificationStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // ライター情報を取得
      const { data: writer } = await supabase
        .from('writers')
        .select('id, university_verified, student_id_verified')
        .eq('auth_id', user.id)
        .single()

      if (writer) {
        // 学生証認証状態を確認
        const { data: studentIdVerification } = await supabase
          .from('student_id_verifications')
          .select('verification_status')
          .eq('writer_id', writer.id)
          .single()

        if (studentIdVerification) {
          setStudentIdStatus(studentIdVerification.verification_status)
        }

        // メール認証状態を確認
        setEmailStatus(writer.university_verified ? 'verified' : 'unverified')
      }
    } catch (error) {
      console.error('Error loading verification status:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setError('JPG、PNG、PDFファイルのみアップロード可能です')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください')
      return
    }

    // Create preview
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null) // PDFの場合はプレビューなし
    }
    setError(null)
  }

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) {
      setError('ファイルを選択してください')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload-student-id', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'アップロードに失敗しました')
      }

      setStudentIdStatus('pending')
      setError(null)
      // 状態を再読み込み
      await loadVerificationStatus()
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSendVerificationEmail = async () => {
    if (!universityEmail) {
      setEmailError('大学メールアドレスを入力してください')
      return
    }

    // 東大メールアドレスのチェック
    if (!universityEmail.endsWith('@g.ecc.u-tokyo.ac.jp')) {
      setEmailError('東京大学のメールアドレス（@g.ecc.u-tokyo.ac.jp）を使用してください')
      return
    }

    setIsSendingEmail(true)
    setEmailError(null)

    try {
      const response = await fetch('/api/verify-university-email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ universityEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'メール送信に失敗しました')
      }

      setEmailError(null)
      alert(`確認メールを ${universityEmail} に送信しました。メールをご確認ください。`)
    } catch (err) {
      console.error('Email sending error:', err)
      setEmailError(err instanceof Error ? err.message : 'メール送信に失敗しました')
    } finally {
      setIsSendingEmail(false)
    }
  }

  const getStatusBadge = (status: string, type: 'studentId' | 'email') => {
    const isVerified = (type === 'studentId' && status === 'approved') || 
                      (type === 'email' && status === 'verified')
    const isPending = status === 'pending'
    
    if (isVerified) {
      return (
        <Badge className="bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" />
          認証済み
        </Badge>
      )
    } else if (isPending) {
      return (
        <Badge>
          <Clock className="mr-1 h-3 w-3" />
          審査中
        </Badge>
      )
    } else if (status === 'rejected') {
      return (
        <Badge variant="destructive">
          <AlertCircle className="mr-1 h-3 w-3" />
          却下
        </Badge>
      )
    } else {
      return (
        <Badge variant="secondary">
          <AlertCircle className="mr-1 h-3 w-3" />
          未提出
        </Badge>
      )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* 大学メール認証 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>大学メール認証</CardTitle>
              <CardDescription className="mt-2">
                東京大学のメールアドレス（@g.ecc.u-tokyo.ac.jp）で認証してください
              </CardDescription>
            </div>
            {getStatusBadge(emailStatus, 'email')}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailStatus === 'verified' ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                大学メールアドレスの認証が完了しています。
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="university-email">大学メールアドレス</Label>
                <div className="flex gap-2">
                  <Input
                    id="university-email"
                    type="email"
                    value={universityEmail}
                    onChange={(e) => setUniversityEmail(e.target.value)}
                    placeholder="username@g.ecc.u-tokyo.ac.jp"
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendVerificationEmail}
                    disabled={isSendingEmail || !universityEmail}
                  >
                    {isSendingEmail ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  確認メールが送信されます。メール内のリンクをクリックして認証を完了してください。
                </p>
              </div>
              {emailError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{emailError}</AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 学生証認証 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>学生証認証</CardTitle>
              <CardDescription className="mt-2">
                学生証をアップロードして、学生であることを証明してください
              </CardDescription>
            </div>
            {getStatusBadge(studentIdStatus, 'studentId')}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {studentIdStatus === 'approved' ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                学生証の認証が完了しています。
              </AlertDescription>
            </Alert>
          ) : studentIdStatus === 'pending' ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                現在審査中です。通常1-2営業日で完了します。
              </AlertDescription>
            </Alert>
          ) : studentIdStatus === 'rejected' ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                学生証の認証が却下されました。再度アップロードしてください。
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="student-id">学生証の画像</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    顔写真と大学名が確認できる画像またはPDFをアップロードしてください
                  </p>
                  <Input
                    id="student-id"
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>

                {previewUrl && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">プレビュー</p>
                    {fileInputRef.current?.files?.[0]?.type === 'application/pdf' ? (
                      <p className="text-center text-muted-foreground">PDFファイルが選択されました</p>
                    ) : (
                      <img 
                        src={previewUrl} 
                        alt="Student ID preview" 
                        className="max-w-full h-auto max-h-64 object-contain mx-auto"
                      />
                    )}
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1 mt-1">
                      <li>アップロードされた画像は本人確認のみに使用されます</li>
                      <li>個人情報は厳重に管理され、第三者に提供されることはありません</li>
                      <li>認証完了後、記事の公開が可能になります</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleUpload}
                  disabled={!previewUrl || isUploading}
                  className="flex-1"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      アップロード中...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      学生証をアップロード
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                >
                  キャンセル
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}