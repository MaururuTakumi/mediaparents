'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react'

export default function VerificationPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationStatus, setVerificationStatus] = useState<string>('unsubmitted')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('画像ファイルを選択してください')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('ファイルサイズは5MB以下にしてください')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('認証エラー')

      // Upload to Supabase Storage
      const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('student-ids')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-ids')
        .getPublicUrl(fileName)

      // Update writer verification status
      const { error: updateError } = await supabase
        .from('writers')
        .update({ 
          verification_status: 'pending',
          student_id_url: publicUrl 
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setVerificationStatus('pending')
      router.refresh()
    } catch (err) {
      console.error('Upload error:', err)
      setError('アップロードに失敗しました')
    } finally {
      setIsUploading(false)
    }
  }

  const getStatusBadge = () => {
    switch (verificationStatus) {
      case 'verified':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            認証済み
          </Badge>
        )
      case 'pending':
        return (
          <Badge>
            <Clock className="mr-1 h-3 w-3" />
            審査中
          </Badge>
        )
      default:
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>本人認証</CardTitle>
              <CardDescription className="mt-2">
                学生証をアップロードして、学生であることを証明してください
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {verificationStatus === 'verified' ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                認証が完了しています。記事の公開が可能です。
              </AlertDescription>
            </Alert>
          ) : verificationStatus === 'pending' ? (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                現在審査中です。通常1-2営業日で完了します。
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="student-id">学生証の画像</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    顔写真と大学名が確認できる画像をアップロードしてください
                  </p>
                  <Input
                    id="student-id"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>

                {previewUrl && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">プレビュー</p>
                    <img 
                      src={previewUrl} 
                      alt="Student ID preview" 
                      className="max-w-full h-auto max-h-64 object-contain mx-auto"
                    />
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