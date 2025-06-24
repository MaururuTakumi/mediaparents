'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, GraduationCap, User, Mail, Lock, PenTool, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function WriterRegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    university: '東京大学', // 固定
    faculty: '',
    grade: '',
    bio: ''
  })
  
  const [errors, setErrors] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: string[] = []

    if (!formData.email) {
      newErrors.push('メールアドレスは必須です')
    } else if (!formData.email.endsWith('@g.ecc.u-tokyo.ac.jp')) {
      newErrors.push('東京大学のメールアドレス（@g.ecc.u-tokyo.ac.jp）のみ登録可能です')
    }
    
    if (!formData.password) newErrors.push('パスワードは必須です')
    if (formData.password.length < 6) newErrors.push('パスワードは6文字以上で入力してください')
    if (formData.password !== formData.confirmPassword) newErrors.push('パスワードが一致しません')
    if (!formData.name) newErrors.push('お名前は必須です')
    if (!formData.faculty) newErrors.push('学部・研究科は必須です')
    if (!formData.grade) newErrors.push('学年は必須です')
    
    const grade = parseInt(formData.grade)
    if (isNaN(grade) || grade < 1 || grade > 6) {
      newErrors.push('学年は1〜6の数字で入力してください')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // 1. ユーザー登録
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            university: formData.university,
            faculty: formData.faculty,
            grade: formData.grade,
            bio: formData.bio
          }
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        
        if (authError.message.toLowerCase().includes('user already registered')) {
          // 既存ユーザーの場合、ログインを試みる
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          })

          if (signInError) {
            setErrors(['このメールアドレスは既に登録されています。パスワードが正しくない場合は、ライターログインページからログインしてください。'])
            setIsLoading(false)
            return
          }

          if (signInData.user) {
            // 既にライターとして登録されているかチェック
            const { data: existingWriter } = await supabase
              .from('writers')
              .select('*')
              .eq('auth_id', signInData.user.id)
              .single()

            if (existingWriter) {
              // 既にライターの場合はダッシュボードへ
              router.push('/dashboard')
              return
            } else {
              // ライターとして未登録の場合は新規登録
              const { data: writerData, error: writerError } = await supabase
                .from('writers')
                .insert({
                  auth_id: signInData.user.id,
                  name: formData.name,
                  university: formData.university,
                  faculty: formData.faculty,
                  grade: parseInt(formData.grade),
                  bio: formData.bio || null,
                  verification_status: 'pending',
                  is_verified: false,
                })
                .select()

              if (writerError) {
                console.error('Writer profile creation error:', writerError)
                setErrors(['ライター登録に失敗しました。もう一度お試しください。'])
                await supabase.auth.signOut()
                setIsLoading(false)
                return
              }

              // 登録成功
              router.push('/dashboard/settings/verification')
              return
            }
          }
        }
        
        throw new Error(`認証エラー: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('ユーザー登録に失敗しました')
      }

      // 2. 少し待ってからライター情報を登録
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check if writer profile already exists
      const { data: existingWriter } = await supabase
        .from('writers')
        .select('*')
        .eq('auth_id', authData.user.id)
        .single()

      if (existingWriter) {
        console.log('Writer profile already exists, redirecting to dashboard')
        router.push('/dashboard')
        return
      }

      const { data: writerData, error: writerError } = await supabase
        .from('writers')
        .insert({
          auth_id: authData.user.id,
          name: formData.name,
          university: formData.university,
          faculty: formData.faculty,
          grade: parseInt(formData.grade),
          bio: formData.bio || null,
          verification_status: 'pending',
          is_verified: false,
        })
        .select()

      if (writerError) {
        console.error('Writer profile creation error:', writerError)
        
        if (writerError.code === '23505') {
          setErrors(['アカウントは既に存在しています。ログインしてください。'])
          setTimeout(() => {
            router.push('/writer/login')
          }, 2000)
          return
        }
        
        throw new Error(`ライター登録エラー: ${writerError.message}`)
      }

      // 登録成功
      router.push('/dashboard/settings/verification')

    } catch (error: any) {
      console.error('Registration error:', error)
      setErrors([error.message || '登録に失敗しました'])
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors([]) // Clear errors when user types
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <PenTool className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            ライター新規登録
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            東京大学の学生限定で記事を投稿できます
          </p>
        </div>

        {/* Registration Form */}
        <Card>
          <CardHeader>
            <CardTitle>ライターアカウント作成</CardTitle>
            <CardDescription>
              必要事項を入力してライターとして登録してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Messages */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* University Notice */}
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>東京大学の学生のみ</strong>登録可能です。
                  <br />
                  @g.ecc.u-tokyo.ac.jpのメールアドレスが必要です。
                </AlertDescription>
              </Alert>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>東大メールアドレス</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="例: s1234567@g.ecc.u-tokyo.ac.jp"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500">
                  登録後、このメールアドレスに確認メールが送信されます
                </p>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>パスワード</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="6文字以上で入力"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>パスワード（確認）</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="パスワードを再入力"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>お名前（ペンネーム可）</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="例: 東大太郎"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              {/* Faculty */}
              <div className="space-y-2">
                <Label htmlFor="faculty" className="flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>学部・研究科</span>
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="faculty"
                  type="text"
                  placeholder="例: 工学部、法学研究科"
                  value={formData.faculty}
                  onChange={(e) => handleInputChange('faculty', e.target.value)}
                  required
                />
              </div>

              {/* Grade */}
              <div className="space-y-2">
                <Label htmlFor="grade">
                  学年
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="grade"
                  type="number"
                  min="1"
                  max="6"
                  placeholder="1〜6の数字"
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  required
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">自己紹介</Label>
                <Textarea
                  id="bio"
                  placeholder="簡単な自己紹介を書いてください（任意）"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>登録中...</span>
                  </div>
                ) : (
                  '登録する'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                既にライターアカウントをお持ちですか？{' '}
                <Link href="/writer/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  ログイン
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}